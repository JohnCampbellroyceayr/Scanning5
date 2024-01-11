import sqlQuery from "../../../databases/mysql.js";

import startShift from "./operations/machineStartShift.js";
import scanRun from "./operations/run.js";
import runNonReporting from "./operationsNotReporting/run.js";

import { machineDeviceId, machineStatus, machineExistsOnDatabase } from "./getMachineValues.js";

export default async function run(employee, dept, resource, jobs) {

    const status = await machineStatus(dept, resource);
    const deviceId = await machineDeviceId(dept, resource);

    if(deviceId == null) {
        return {
            error: "Device Id doesn't exist"
        }
    }

    const result = await setMachineOnDataBase(employee, dept, resource, deviceId, jobs);
    if(result.error) {
        return {
            error: "Something went wrong with setting the machine"
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
            }
            else {
                await runNonReporting(employee, dept, resource, job["Job"], job["Sequence"]);
            }
        }
        return true;
    }
    catch(err) {
        console.log(err);
        return err;
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