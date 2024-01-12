import sqlQuery from "../../../databases/mysql.js";

import startShift from "./operations/machineStartShift.js";
import resumeScanning from "./operations/resume.js";

import { machineDeviceId, machineStatus, machineExistsOnDatabase, machineMode } from "./getMachineValues.js";

export default async function resume(dept, resource) {

    const status = await machineStatus(dept, resource);
    const deviceId = await machineDeviceId(dept, resource);
    
    if(deviceId == null) {
        return {
            error: "Device Id doesn't exist"
        }
    }
    const machinePaused = await machineMode(dept, resource);

    if(machinePaused !== "D") {
        return {
            error: "Machine is not paused"
        }
    }

    const result = await setMachineOnDataBase(dept, resource);
    if(result.error) {
        return {
            error: "Something went wrong with setting the machine"
        }
    }

    try {
        if(status === "I") {
            await startShift(deviceId, dept, resource);
        }
        await resumeScanning(deviceId, dept, resource);
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


async function setMachineOnDataBase(dept, res) {

    const machineExists = await machineExistsOnDatabase(dept, res);

    if(machineExists) {
        var query = "UPDATE machine SET status = ? WHERE department = ? AND resource = ?;";
        var args = ["Res", dept, res];
        const result = await sqlQuery(query, args);
        return result;
    }

}