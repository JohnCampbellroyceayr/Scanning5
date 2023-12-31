import sqlQuery from "../../../databases/mysql.js";
import { machineDeviceId } from "../machine/getMachineValues.js";

import employeeSignOut from "../operations/employeeSignOut.js";
import endShift from "../operations/machineEndShift.js";

export default async function deactivateUser(number) {
    const machineResult = await getMachines(number);
    const machines = machineResult.result;
    const userLoggedOut = logoutUserServer(number);
    if(userLoggedOut.error) {
        return userLoggedOut;
    }
    for (let i = 0; i < machines.length; i++) {
        const dept = machines[i]["department"];
        const res = machines[i]["resource"];
        const result = await signOutMachine(number, dept, res);
        if(result.error) {
            return result;
        }
    }
    return true;
}

async function logoutUserServer(number) {
    const result = await sqlQuery("Update user SET active = ?, machine_department = ?, machine_resource = ?;", [false, null, null]);
    return result;
}

async function signOutMachine(user, dept, res) {
    const deviceId = await machineDeviceId(dept, res);
    try {
        await employeeSignOut(deviceId, dept, res, user);
        await endShift(deviceId, dept, res);
        await deactivateMachine(dept, res);
        return true;
    }
    catch(error) {
        return error;
    }
}

async function deactivateMachine(dept, res) {
    const result = await sqlQuery("UPDATE machine SET active = ? WHERE department = ? AND resource = ?", [false, dept, res]);
    return result;
}

async function getMachines(number) {
    const result = await sqlQuery("SELECT department, resource FROM machine WHERE user = ? AND active = ?", [number, true]);
    return result;
}