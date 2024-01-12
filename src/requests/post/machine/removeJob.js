import getMachineJobs from "../../get/machine/getMachineJobs.js";
import { machineExistsOnDatabase } from "./getMachineValues.js";
import sqlQuery from "../../../databases/mysql.js";


export default async function removeJob(dept, res, job) {

    const machineJobs = await getMachineJobs(dept, res);
    const machineExists = await machineExistsOnDatabase(dept, res);

    const newJobArr = removeJobFromObj(job, machineJobs);

    if(machineExists) {
        var query = "UPDATE machine SET jobs = ? WHERE department = ? AND resource = ?;";
        var args = [JSON.stringify(newJobArr), dept, res];
        const result = await sqlQuery(query, args);
        if(!result.error) {
            return true;
        }
    }
    return false;
}

function removeJobFromObj(jobNumber, jobArr) {
    for (let i = 0; i < jobArr.length; i++) {
        const jobObj = jobArr[i];
        if(jobObj.Job == jobNumber) {
            jobArr.splice(i, 1);
            i--;
        }        
    }
    return jobArr;
}