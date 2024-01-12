import sqlQuery from "../../../databases/mysql.js";
import ODBC from "../../../databases/odbc.js";

import startShift from "./operations/machineStartShift.js";

import setMachineEmpLogin from "./setMachine.js";
import scanRun from "./operations/run.js";
import reportGood from "./operations/good.js";

import reportGoodNoReport from "./operationsNotReporting/reportGood.js";

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
            if(job["ReportingPoint"] == "Y") {
                await scanRun(deviceId, dept, resource, job["Job"], job["Sequence"]);
                await reportGood(deviceId, dept, resource, job["Job"], job["Sequence"], employee, job["PartNumber"], quantities[i]);    
            }
            else {
                await reportGoodNoReport(employee, dept, resource, job["Job"], job["Sequence"], quantities[i]);
            }
            await updateMachine(dept, resource, job, quantities[i]);
        }
        return true;
    }
    catch(err) {
        console.log(err);
        if(err.error !== undefined) {
            if(err.error.includes("0024") && err.error.includes("Labour list must be entered") && setMachine === false) {
                await setMachineEmpLogin(dept, resource, employee);
                return goodPieces(employee, dept, resource, jobs, quantities, true)
            }
        }
        else {
            return {
                error: "An unknown application failure, make sure all params are correct, please refer to the docs, located at {ip address}/README.md"
            }
        }
        return err;
    }
}


async function updateMachine(dept, res, job, quantity) {
    const getQuery = `
        SELECT jobs FROM machine WHERE department = ? AND resource = ?;
    `;
    const jobs = await sqlQuery(getQuery, [dept, res]);
    if(jobs.error) {
        return new Error('Error in getting jobs');
    }
    const newJobs = updateMachineJobs(jobs.result[0]["jobs"], job, quantity);
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
