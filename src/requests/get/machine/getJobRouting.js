import ODBC from "../../../databases/odbc.js";
import getGroup from "./getMachineGroup.js";

export default async function getCurrentJobRouting(jobNumber, dept, res) {

    const departmentWithPlantCode = "DFT" + dept;

    const group = await getGroup(departmentWithPlantCode, res);

    const query = `
        SELECT 
            CJOBDR.EDSEQ# AS "Sequence",
            TRIM(CJOBDR.EDDEPT) AS "Dept",
            TRIM(CJOBDR.EDRESC) AS "Res",
            CJOBDR.EDOPNM AS "Operation Code",
            TRIM(RESRE.ABDES) AS "Op Description",
            CJOBDR.EDRUNQ AS "PiecesNeeded",
            CJOBDR.EDCOMQ AS "GoodPieces",

            TRIM(CJOBDR.EDJOB#) AS "Job",
            CJOBDR.EDREPP AS "ReportingPoint",
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

    const args = [jobNumber];

    return new Promise(async (resolve, reject) => {
        ODBC.query(query, args, async (error, result) => {
            if(error) {
                console.log(error);
                reject(error);
            }
            else {
                if(result.length > 0) {
                    const modifiedRouting = markSeqAsAbleToRunByMachine(result, dept, res, group);
                    const headerData = getHeaderDataRouting(modifiedRouting);
                    resolve({
                        header: headerData,
                        routing: modifiedRouting
                    });
                }
                else {
                    reject("No Items Found");
                }
            }
        });
    });
}

function getHeaderDataRouting(jobRoutingArr) {
    let recommendedSeq = "000";
    let recommendedSeqDescription = "";
    let partNumber = "";
    for (let i = 0; i < jobRoutingArr.length; i++) {
        if(partNumber == "") {
            partNumber = jobRoutingArr[i]["PartNumber"];
        }
        if(jobRoutingArr[i].ableToRunByMachine == true) {
            recommendedSeq = jobRoutingArr[i].Sequence;
            recommendedSeqDescription = jobRoutingArr[i]["Op Description"];
            if(jobRoutingArr[i]["Sequence Status"] != 'C') {
                break;
            }
        }
    }
    return {
        recommendedSeq: recommendedSeq,
        recommendedSeqDescription: recommendedSeqDescription,
        partNumber: partNumber,
    }
}

function markSeqAsAbleToRunByMachine(jobRoutingArr, dept, res, group) {
    const departmentWithoutPlantCode = dept.replace("DFT", "");
    if(group == undefined) {
        for (let i = 0; i < jobRoutingArr.length; i++) {
            const seqLine = jobRoutingArr[i];
            seqLine.Dept = seqLine.Dept.replace("DFT", "");
            if(departmentWithoutPlantCode == seqLine.Dept && res == seqLine.Res) {
                seqLine.ableToRunByMachine = true;
            }
            else {
                seqLine.ableToRunByMachine = false;
            }
        }
    }
    else {
        for (let i = 0; i < jobRoutingArr.length; i++) {
            const seqLine = jobRoutingArr[i];
            seqLine.Dept = seqLine.Dept.replace("DFT", "");
            if(group == seqLine["Machine Group"]) {
                seqLine.ableToRunByMachine = true;
            }
            else {
                seqLine.ableToRunByMachine = false;
            }
        }
    }
    return jobRoutingArr;
}