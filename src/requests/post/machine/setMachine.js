import sqlQuery from "../../../databases/mysql.js";

import startShift from "../operations/machineStartShift.js";
import pause from "../operations/pause.js";
import employeeSignIn from "../operations/employeeSignIn.js";
import { machineDeviceId, machineStatus, machineExistsOnDatabase } from "./getMachineValues.js";

export default async function setMachine(dept, resource, employee) {
    const status = await machineStatus(dept, resource);
    const deviceId = await machineDeviceId(dept, resource);

    if(deviceId == null) {
        return {
            error: "Device Id doesn't exist"
        }
    }

    const result = await setMachineOnDataBase(employee, dept, resource, deviceId);
    if(result.error) {
        return {
            error: "Something went wrong with setting the machine"
        }
    }

    try {
        if(status === "I") {
            await startShift(deviceId, dept, resource);
        }
        await pause(deviceId, dept, resource);
        await employeeSignIn(deviceId, dept, resource, employee);
        return true;
    }
    catch(err) {
        console.log(err);
        return err;
    }
}


async function setMachineOnDataBase(user, dept, res, deviceId) {

    const machineExists = await machineExistsOnDatabase(dept, res);

    if(machineExists) {
        var query = "UPDATE machine SET user = ?, status = ? WHERE department = ? AND resource = ?;";
        var args = [user, "Idle", dept, res];
    }
    else {
        var query = "INSERT INTO machine (user, department, resource, device_id, status, active) VALUES(?, ?, ?, ?, ?, ?);";
        var args = [user, dept, res, deviceId, "Idle", true];
    }
    const result = await sqlQuery(query, args);
    return result;
    
}