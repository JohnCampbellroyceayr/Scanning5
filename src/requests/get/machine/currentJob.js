import ODBC from "../../../databases/odbc.js";
import getGroup from "./getMachineGroup.js";

export default async function getCurrentJob(dep, res, job, seq) {

    const departmentWithPlantCode = "DFT" + dep;

    const group = await getGroup(departmentWithPlantCode, res);

    const query = (group == undefined) ? noGroupQuery : groupQuery;
    const args = [job];

    return new Promise(async (resolve, reject) => {
        ODBC.query(query, args, async (error, result) => {
            if(error) {
                console.log(error);
                resolve(null);
            }
            else {
                if(result.length > 0) {
                    resolve(await getSeqLine(result, group, dep, res, job, seq));
                }
                else {
                    resolve(null);
                }
            }
        });
    });
}

function getSeqLine(result, group, dep, res, job, seqNumber) {
    let correctJob = undefined;
    const departmentWithPlantCode = "DFT" + dep;
    
    if(group == undefined) {
        for (let i = 0; i < result.length; i++) {
            const seq = result[i];
            if(seq["Dept"] == departmentWithPlantCode && seq["Res"] == res && seq["Sequence"] == seqNumber) {
                correctJob = result[i];
            }
        }
    }
    else {
        for (let i = 0; i < result.length; i++) {
            const seq = result[i];
            if(seq["Machine Group"] == group && seq["Sequence"] == seqNumber) {
                correctJob = result[i];
            }
        }
    }

    if(correctJob == undefined) {
        const copySeq = result[0];
        console.log(`${dep} ${res}`);
        const returnSeq = {
            "PartNumber": copySeq["PartNumber"],
            "ReportingPoint": "N",
            "Job": copySeq["Job"],
            "Sequence": "000",
            "PiecesNeeded": copySeq["PiecesNeeded"],
            "GoodPieces": 0
        }
        return findCompleteJob(returnSeq, dep, res, job);
    }

    return findCompleteJob(correctJob, dep, res, job);
}

async function findCompleteJob(selectedJob, dep, res, jobNumber) {
    if(selectedJob["ReportingPoint"] == "N") {
        console.log(jobNumber);
        console.log(`${dep} ${res}`);
        const completedPieces = await getTotalCompletedNotes(jobNumber, `${dep} ${res}`);
        selectedJob["GoodPieces"] = completedPieces;
    }
    return selectedJob;
}

async function getTotalCompletedNotes(workOrder, machineStr) {
    const query = `
        SELECT GGTEXT 
        FROM 
        JBNOTE WHERE TRIM(JBNOTE.GGKEY) = ?
    `;
    return new Promise((resolve, reject) => {
        ODBC.query(query, [workOrder], (error, result) => {
            if(error) {
                console.log(error);
                resolve(0);
                return ;
            }
            if(result.length > 0) {
                let number = 0;
                for (let i = 0; i < result.length; i++) {
                    const line = result[i]["GGTEXT"];
                    const lineArr = line.split(">");
                    if(lineArr[0] == "<Good Pieces" && lineArr[3] == "<" + machineStr) {
                        number += parseInt(lineArr[5].replaceAll("<", ""));
                    }
                }
                resolve(number);
            }
            else {
                resolve(0);
            }
        });
    });
}

const noGroupQuery = `
    SELECT 
        TRIM(CJOBDR.EDJOB#) AS "Job",
        CJOBDR.EDSEQ# AS "Sequence",
        CJOBDR.EDREPP AS "ReportingPoint",
        CJOBDR.EDRUNQ AS "PiecesNeeded",
        CJOBDR.EDCOMQ AS "GoodPieces",
        CJOBDR.EDSTAT AS "Sequence Status",
        TRIM(CJOBH.DNPART) AS "PartNumber",
        TRIM(CJOBDR.EDDEPT) AS "Dept",
        TRIM(CJOBDR.EDRESC) AS "Res",
        CJOBDR.EDOPNM AS "Operation Code",
        TRIM(RESRE.ABDES) AS "Op Description"
    FROM
        CJOBDR
    LEFT JOIN 
        CJOBH ON CJOBDR.EDJOB# = CJOBH.DNJOB
    LEFT JOIN
        STKMM ON CJOBH.DNPART = STKMM.AVPART
    LEFT JOIN
        RESRE ON CJOBDR.EDDEPT = RESRE.ABDEPT AND CJOBDR.EDRESC = RESRE.ABRESC
    WHERE TRIM(CJOBDR.EDJOB#) = ?
`;

const groupQuery = `
    SELECT 
        TRIM(CJOBDR.EDJOB#) AS "Job",
        CJOBDR.EDSEQ# AS "Sequence",
        CJOBDR.EDREPP AS "ReportingPoint",
        CJOBDR.EDRUNQ AS "PiecesNeeded",
        CJOBDR.EDCOMQ AS "GoodPieces",
        CJOBDR.EDSTAT AS "Sequence Status",
        TRIM(CJOBH.DNPART) AS "PartNumber",
        TRIM(RESRE.ABMACG) AS "Machine Group",
        CJOBDR.EDOPNM AS "Operation Code",
        TRIM(RESRE.ABDES) AS "Op Description"
    FROM 
        CJOBDR
    LEFT JOIN 
        CJOBH ON CJOBDR.EDJOB# = CJOBH.DNJOB
    LEFT JOIN 
        STKMM ON CJOBH.DNPART = STKMM.AVPART
    LEFT JOIN 
        RESRE ON CJOBDR.EDDEPT = RESRE.ABDEPT AND CJOBDR.EDRESC = RESRE.ABRESC
    WHERE TRIM(CJOBDR.EDJOB#) = ?
`;