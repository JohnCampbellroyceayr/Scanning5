import sqlQuery from "../../../databases/mysql.js";

import startShift from "./operations/machineStartShift.js";
import pauseScanning from "./operations/pause.js";

import { machineDeviceId, machineStatus, machineExistsOnDatabase } from "./getMachineValues.js";

export default async function pause(dept, resource) {

    const status = await machineStatus(dept, resource);
    const deviceId = await machineDeviceId(dept, resource);

    if(deviceId == null) {
        return {
            error: "Device Id doesn't exist"
        }
    }

    const result = await setMachineOnDataBase(dept, resource, deviceId);
    if(result.error) {
        return {
            error: "Something went wrong with setting the machine"
        }
    }

    try {
        if(status === "I") {
            await startShift(deviceId, dept, resource);
        }
        await pauseScanning(deviceId, dept, resource);
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


async function setMachineOnDataBase(dept, res, deviceId) {

    const machineExists = await machineExistsOnDatabase(dept, res);
    const currentStatus = await getMachineOnDataBaseStatus(dept, res);
    const newStatus = getNewStatus(currentStatus);
    if(machineExists) {
        var query = "UPDATE machine SET status = ? WHERE department = ? AND resource = ?;";
        var args = [newStatus, dept, res];
        const result = await sqlQuery(query, args);
        return result;
    }

}

function getNewStatus(oldStatus) {
    if(oldStatus == "Setup") {
        return "Setup-Paused";
    }
    else if(oldStatus == "Run") {
        return "Run-Paused";
    }
    else {
        return "Idle-Paused";
    }
}

export async function getMachineOnDataBaseStatus(dept, res) {
    const query = "SELECT status FROM machine WHERE department = ? AND resource = ?;";
    const args = [dept, res];
    const result = await sqlQuery(query, args);
    try {
        return result.result[0].status;
    }
    catch(err) {
        return null;
    }
}