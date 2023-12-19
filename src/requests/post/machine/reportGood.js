import sqlQuery from "../../../databases/mysql.js";
import ODBC from "../../../databases/odbc.js";

import startShift from "../operations/machineStartShift.js";

import setMachineEmpLogin from "./setMachine.js";
import scanRun from "../operations/run.js";
import reportGood from "../operations/good.js";

import { machineDeviceId, machineStatus, machineExistsOnDatabase } from "./getMachineValues.js";

export default async function goodPieces(employee, dept, resource, jobs, quantities, setMachine = false) {

    const status = await machineStatus(dept, resource);
    const deviceId = await machineDeviceId(dept, resource);

    if(deviceId == null) {
        return {
            error: "Device Id doesn't exist"
        }
    }

    try {
        if(status === "I") {
            await startShift(deviceId, dept, resource);
        }
        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            await scanRun(deviceId, dept, resource, job["Job"], job["Sequence"]);
            await reportGood(deviceId, dept, resource, job["Job"], job["Sequence"], employee, job["PartNumber"], quantities[i]);
            await updateMachine(dept, resource, job, quantities[i]);
        }
        return true;
    }
    catch(err) {
        console.log(err);
        if(err.error.includes("0024") && err.error.includes("Labour list must be entered") && setMachine === false) {
            await setMachineEmpLogin(dept, resource, employee);
            return goodPieces(employee, dept, resource, jobs, quantities, true)
        }
        return err;
    }
}


async function updateMachine(dept, res, job, quantity) {
    const getQuery = `
        SELECT jobs FROM machine WHERE department = ? AND resource = ?;
    `;
    const jobs = await sqlQuery(getQuery, [dept, res]);
    console.log(jobs);
    if(jobs.error) {
        return new Error('Error in getting jobs');
    }
    const newJobs = updateMachineJobs(jobs.result[0]["jobs"], job, quantity);
    console.log(newJobs);
    const setQuery = `
        UPDATE machine SET jobs = ? WHERE department = ? AND resource = ?;
    `;
    const result = await sqlQuery(setQuery, [JSON.stringify(newJobs), dept, res]);
    if(result.error) {
        return new Error('Error in setting jobs');
    }
    else {
        return true;
    }
}

function updateMachineJobs(machineJobs, job, quantity) {
    job["GoodPieces"] = job["GoodPieces"] + quantity;
    for (let i = 0; i < machineJobs.length; i++) {
        if(machineJobs[i]["Job"] == job["Job"] && machineJobs[i]["Sequence"] == job["Sequence"]) {
            machineJobs[i] = job;
        }
    }
    return machineJobs;
}

// async function getNumberOfPieces(workOrder, seq) {
//     const noGroupQuery = `
//         SELECT 
//             CJOBDR.EDRUNQ AS "PiecesNeeded",
//             CJOBDR.EDCOMQ AS "GoodPieces",
//         FROM
//             CJOBDR
//         LEFT JOIN
//             CJOBH ON CJOBDR.EDJOB# = CJOBH.DNJOB
//         LEFT JOIN
//             STKMM ON CJOBH.DNPART = STKMM.AVPART
//         LEFT JOIN
//             RESRE ON CJOBDR.EDDEPT = RESRE.ABDEPT AND CJOBDR.EDRESC = RESRE.ABRESC
//         WHERE TRIM(CJOBDR.EDJOB#) = TRIM(?) AND TRIM(CJOBDR.EDSEQ#) = TRIM(?)
//     `;
//     return new Promise((resolve, reject) => {
//         ODBC.query(noGroupQuery, [workOrder, seq], (error, result) => {
//             if(error) {
//                 resolve(0);
//             }
//             else {
//                 resolve(result[0]["PiecesNeeded"]);
//             }
//         });
//     });    
// }
