import connectODBC from "../../databases/odbc.js";
import mysqlQuery from '../../databases/mysql.js';

const ODBC = await connectODBC();

export async function getJobs(depCode, resCode, group) {
    const query = getQuery(group);
    const values = getValues(depCode, resCode, group)
    return new Promise((resolve, reject) => {
        if(depCode.length <= 5 && resCode.length <= 5) {
            ODBC.query(query, values, async (error, result) => {
                if(error) {
                    reject(error);
                }
                if(result != undefined && result.length > 0) {
                    result.sort((a, b) => {
                        if (a["W/O Number"] === b["W/O Number"]) {
                            return b["Sequence Number"] - a["Sequence Number"];
                        }
                    });
                    let returnJobs = [];
                    let lastJob = '';
                    let numbersToFindPartVariables = [];
                    if(group.replace(" ", "") == "") {
                        for (let i = 0; i < result.length; i++) {
                            const r = result[i];
                            if(r["Production Department Code"] == depCode && r["Resource Code"] == resCode) {
                                numbersToFindPartVariables.push(r["Part Number"]);
                                returnJobs.push({
                                    ...r,
                                    Ready: (lastJob == r["W/O Number"]) ? 'N' : 'Y'
                                })
                            }
                            lastJob = r["W/O Number"];
                        }
                    }
                    else {
                        for (let i = result.length - 1; i >= 0; i--) {
                            const r = result[i];
                            if(r["Machine Group"] == group.replace(" ", "") ) {
                                if(returnJobs.length == 0 || returnJobs[returnJobs.length - 1]["W/O Number"] != r["W/O Number"]) {
                                    numbersToFindPartVariables.push(r["Part Number"]);
                                    returnJobs.push({
                                        ...r,
                                        Ready: (lastJob == r["W/O Number"]) ? 'N' : 'Y'
                                    });
                                }
                            }
                            lastJob = r["W/O Number"];
                        }
                    }
                    const partVariables = await mysqlQuery("SELECT number, custom FROM parts WHERE number IN (?)", [numbersToFindPartVariables]);
                    const variables = partVariables.result;
                    console.log(variables);
                    for (let i = 0; i < returnJobs.length; i++) {
                        for (let j = 0; j < variables.length; j++) {
                            if(returnJobs[i]["Part Number"] == variables[j]["number"]) {
                                if(variables[j]["custom"] != null && JSON.stringify(variables[j]["custom"]) != "{}") {
                                    returnJobs[i] = {
                                        ...returnJobs[i],
                                        variables: variables[j]["custom"]
                                    }
                                }
                                break;
                            }
                            
                        }                            
                    }
                    resolve(returnJobs);
                }
                else {
                    resolve([]);
                }
            });
        }
        else {
            resolve([]);
        }
     });
}

function getQuery(group) {
    if(group.replace(" ", "") == "") {
        return `
            SELECT 
            TRIM(CJOBDR.EDJOB#) AS "W/O Number",
            CJOBDR.EDSEQ# AS "Sequence Number",
            CJOBDR.EDDEPT AS "Production Department Code",
            CJOBDR.EDRESC AS "Resource Code",
            CJOBDR.EDOPNM AS "Operation Code",
            CJOBDR.EDSETP AS "Setup Standard",
            CJOBDR.EDRTYP AS "Run Type",
            CJOBDR.EDREPP AS "Reporting Point",
            CJOBDR.EDRUNQ AS "Run Quantity",
            CJOBDR.EDCOMQ AS "Total Completed",
            CJOBDR.EDSTAT AS "Sequence Status",
            TRIM(CJOBH.DNPART) AS "Part Number",
            CJOBH.DNCUST AS "Customer Code",
            TRIM(CJOBH.DNNAME) AS "Cust Name",
            TRIM(STKMM.AVCPT#) AS "Customer Part Number",
            CJOBH.DNRDAT AS "Date Required",
            CJOBH.DNREL# AS "Release Number",
            CJOBH.DNSTAT AS "W/O Status",
            TRIM(RESRE.ABMACG) AS "Machine Group"
            FROM 
                CJOBDR
            LEFT JOIN 
                CJOBH ON CJOBDR.EDJOB# = CJOBH.DNJOB
            LEFT JOIN 
                STKMM ON CJOBH.DNPART = STKMM.AVPART
            LEFT JOIN 
                RESRE ON CJOBDR.EDDEPT = RESRE.ABDEPT AND CJOBDR.EDRESC = RESRE.ABRESC
            WHERE CJOBDR.EDJOB# IN (
                SELECT CJOBDR.EDJOB#
                FROM CJOBDR
                WHERE CJOBDR.EDDEPT = ? AND CJOBDR.EDRESC = ? AND CJOBH.DNSTAT <> 'C' AND CJOBDR.EDSTAT <> 'C'
            ) AND CJOBDR.EDSEQ# < (
                SELECT MAX(CJOBDR.EDSEQ#)
                FROM CJOBDR
                WHERE CJOBDR.EDDEPT = ? AND CJOBDR.EDRESC = ?
            ) AND CJOBDR.EDSTAT <> 'C'
        `;
    }
    else {
        return `
            SELECT 
            TRIM(CJOBDR.EDJOB#) AS "W/O Number",
            CJOBDR.EDSEQ# AS "Sequence Number",
            CJOBDR.EDDEPT AS "Production Department Code",
            CJOBDR.EDRESC AS "Resource Code",
            CJOBDR.EDOPNM AS "Operation Code",
            CJOBDR.EDSETP AS "Setup Standard",
            CJOBDR.EDRTYP AS "Run Type",
            CJOBDR.EDREPP AS "Reporting Point",
            CJOBDR.EDRUNQ AS "Run Quantity",
            CJOBDR.EDCOMQ AS "Total Completed",
            CJOBDR.EDSTAT AS "Sequence Status",
            TRIM(CJOBH.DNPART) AS "Part Number",
            CJOBH.DNCUST AS "Customer Code",
            TRIM(CJOBH.DNNAME) AS "Cust Name",
            TRIM(STKMM.AVCPT#) AS "Customer Part Number",
            CJOBH.DNRDAT AS "Date Required",
            CJOBH.DNREL# AS "Release Number",
            CJOBH.DNSTAT AS "W/O Status",
            TRIM(RESRE.ABMACG) AS "Machine Group"
            FROM 
                CJOBDR
            LEFT JOIN 
                CJOBH ON CJOBDR.EDJOB# = CJOBH.DNJOB
            LEFT JOIN 
                STKMM ON CJOBH.DNPART = STKMM.AVPART
            LEFT JOIN 
                RESRE ON CJOBDR.EDDEPT = RESRE.ABDEPT AND CJOBDR.EDRESC = RESRE.ABRESC
            WHERE CJOBDR.EDJOB# IN (
                SELECT CJOBDR.EDJOB#
                FROM CJOBDR
                LEFT JOIN RESRE ON CJOBDR.EDDEPT = RESRE.ABDEPT AND CJOBDR.EDRESC = RESRE.ABRESC
                WHERE TRIM(RESRE.ABMACG) = ? AND CJOBH.DNSTAT <> 'C' AND CJOBDR.EDSTAT <> 'C'
            )
            AND CJOBDR.EDSTAT <> 'C' 
        `;
    }
}

function getValues(dep, res, group) {
    if(group.replace(" ", "") == "") {
        return [dep, res, dep, res]
    }
    else {
        return [group]
    }
}