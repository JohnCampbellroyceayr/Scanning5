import sqlQuery from "../../../databases/mysql.js";
import getMachineJobs from "../../get/machine/getMachineJobs.js";
import getMultiJobMachine from "../../get/machine/machineMultiJob.js";
import { machineDeviceId, machineExistsOnDatabase } from "./getMachineValues.js";

export default async function upsertJob(employee, dept, resource, job) {

    const deviceId = await machineDeviceId(dept, resource);
    const currentJobs = await getMachineJobs(dept, resource);

    const multiJobMachine = await getMultiJobMachine(dept, resource);

    let newJobs = {};

    if(multiJobMachine == "Y") {
        newJobs = addOrUpdateJob(currentJobs, job);
    }
    else {
        newJobs = [
            job
        ]
    }

    const result = await setMachineOnDataBase(employee, dept, resource, deviceId, newJobs);
    if(result.error) {
        return {
            error: "Something went wrong with setting the machine"
        }
    }
    else {
        return {
            error: false
        }
    }

}

function addOrUpdateJob(jobs, newJob) {
    let updateJob = false;
    for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        if(job.Job == newJob.Job) {
            updateJob = true;
            jobs[i] = newJob;
            break;
        }
    }
    if(updateJob == false) {
        jobs.push(newJob);
    }
    return jobs;
}

async function setMachineOnDataBase(user, dept, res, deviceId, jobs) {

    const machineExists = await machineExistsOnDatabase(dept, res);

    if(machineExists) {
        var query = "UPDATE machine SET user = ?, jobs = ?, device_id = ? WHERE department = ? AND resource = ?;";
        var args = [user, JSON.stringify(jobs), deviceId, dept, res];
    }
    else {
        var query = "INSERT INTO machine (user, department, resource, device_id, active, jobs) VALUES(?, ?, ?, ?, ?, ?, ?);";
        var args = [user, dept, res, deviceId, true, JSON.stringify(jobs)];
    }
    const result = await sqlQuery(query, args);
    return result;
    
}