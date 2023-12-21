import sqlQuery from "../../../databases/mysql.js";

import startShift from "../operations/machineStartShift.js";
import pauseScanning from "../operations/pause.js";

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
        console.log(err);
        return err;
    }
}


async function setMachineOnDataBase(dept, res, deviceId) {

    const machineExists = await machineExistsOnDatabase(dept, res);

    if(machineExists) {
        var query = "UPDATE machine SET status = ? WHERE department = ? AND resource = ?;";
        var args = ["Paused", dept, res];
        const result = await sqlQuery(query, args);
        return result;
    }

}