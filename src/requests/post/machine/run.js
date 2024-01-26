import sqlQuery from "../../../databases/mysql.js";

import startShift from "./operations/machineStartShift.js";
import scanRun from "./operations/run.js";
import runNonReporting from "./operationsNotReporting/run.js";

import { getCurrentDateTime } from "./operationsNotReporting/notePadOperations/createNewLine.js";

import { machineDeviceId, machineStatus, machineExistsOnDatabase } from "./getMachineValues.js";

export default async function run(employee, dept, resource, jobs) {

    const status = await machineStatus(dept, resource);
    const deviceId = await machineDeviceId(dept, resource);

    if(deviceId == null) {
        return {
            error: "Device Id doesn't exist"
        }
    }

    if(jobs.length > 0) {
        const result = await setMachineOnDataBase(employee, dept, resource, deviceId, jobs);
        if(result.error) {
            return {
                error: "Something went wrong with setting the machine"
            }
        }
    }
    else {
        return {
            error: "Please input at least one job"
        }
    }

    try {
        if(status === "I") {
            await startShift(deviceId, dept, resource);
        }

        if(jobs.length == 1) {
            await scanOneJob(employee, deviceId, dept, resource, jobs[0]);
        }
        else {
            await scanAllGroup(employee, deviceId, dept, resource, jobs);
        }

        return true;
    }
    catch(err) {
        if(err.error == undefined) {
            return {
                error: err
            };
        }
        else {
            return err;
        }
    }
}

function scanOneJob(employee, deviceId, dept, resource, job) {
    return new Promise(async (resolve, reject) => {
        try {
            if(job["ReportingPoint"] == "Y") {
                await scanRun(deviceId, dept, resource, job["Job"], job["Sequence"]);
            }
            else {
                await runNonReporting(employee, dept, resource, job["Job"], job["Sequence"]);
            }
            resolve(true);
        }
        catch(error) {
            reject(error);
        }
    })
}

async function scanAllGroup(employee, deviceId, dept, resource, jobs) {
    try {
        const dateTime = getCurrentDateTime();
        const jobToScanReportingIndex = getFirstReportingSeqIndex(jobs);
        for (let i = 0; i < jobs.length; i++) {
            if(jobToScanReportingIndex !== i) {
                const job = jobs[i];
                await runNonReporting(employee, dept, resource, job["Job"], job["Sequence"], true, dateTime);
            }
        }
        if(jobToScanReportingIndex !== undefined) {
            const jobToScanReporting = jobs[jobToScanReportingIndex];
            await scanRun(deviceId, dept, resource, jobToScanReporting["Job"], jobToScanReporting["Sequence"]);
        }
        return true;
    }
    catch(error) {
        return {
            error: error
        }
    }
}

function getFirstReportingSeqIndex(jobs) {
    for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        if(job["ReportingPoint"] == "Y") {
            return i;
        }
    }
}

async function setMachineOnDataBase(user, dept, res, deviceId, jobs) {

    const machineExists = await machineExistsOnDatabase(dept, res);

    if(machineExists) {
        var query = "UPDATE machine SET user = ?, status = ?, jobs = ? WHERE department = ? AND resource = ?;";
        var args = [user, "Run", JSON.stringify(jobs), dept, res];
    }
    else {
        var query = "INSERT INTO machine (user, department, resource, device_id, status, active, jobs) VALUES(?, ?, ?, ?, ?, ?, ?);";
        var args = [user, dept, res, deviceId, "Run", true, JSON.stringify(jobs)];
    }

    const result = await sqlQuery(query, args);
    return result;
}