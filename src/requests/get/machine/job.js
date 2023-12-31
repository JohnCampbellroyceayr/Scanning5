import ODBC from "../../../databases/odbc.js";

export default async function getJob(dep, res, job) {

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
                    resolve(await getSeqLine(result, group, dep, res, job));
                }
                else {
                    resolve(null);
                }
            }
        });
    });
}

function getSeqLine(result, group, dep, res, job) {
    let matchingMachine = [];
    const departmentWithPlantCode = "DFT" + dep;
    if(group == undefined) {
        for (let i = 0; i < result.length; i++) {
            const seq = result[i];
            if(seq["Dept"] == departmentWithPlantCode && seq["Res"] == res) {
                matchingMachine.push(result[i]);
            }
        }        
    }
    else {
        for (let i = 0; i < result.length; i++) {
            const seq = result[i];
            if(seq["Machine Group"] == group) {
                matchingMachine.push(result[i]);
            }
        }
    }

    if(matchingMachine.length == 0) {
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

    for (let i = 0; i < matchingMachine.length; i++) {
        const seqObj = matchingMachine[i];
        if(seqObj["Sequence Status"] !== 'C') {
            return findCompleteJob(matchingMachine[i], dep, res, job);
        }
    }

    return findCompleteJob(matchingMachine[matchingMachine.length - 1], dep, res, job);
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

function getGroup(departmentWithPlantCode, res) {
    const query = `
        SELECT TRIM(ABMACG) AS "Machine Group" FROM RESRE WHERE ABDEPT = ? AND ABRESC = ?
    `;
    return new Promise(async (resolve, reject) => {
        ODBC.query(query, [departmentWithPlantCode, res], async (error, result) => {
            if(error) {
                console.log(error);
                resolve(undefined);
            }
            else {
                if(result.length > 0) {
                    if(result[0]["Machine Group"] !== undefined) {
                        if(result[0]["Machine Group"] !== '') {
                            resolve(result[0]["Machine Group"]);
                            return ;
                        }
                    }
                }
                resolve(undefined);
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
        TRIM(CJOBDR.EDRESC) AS "Res"
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
        TRIM(RESRE.ABMACG) AS "Machine Group"
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