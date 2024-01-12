import sqlQuery from "../../../databases/mysql.js";
import { machineDeviceId } from "../machine/getMachineValues.js";

import employeeSignOut from "./operations/employeeSignOut.js";
import endShift from "../machine/operations/machineEndShift.js";

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

export async function signOutMachine(user, dept, res) {
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

async function logoutUserServer(number) {
    const result = await sqlQuery("UPDATE user SET active = ?, status = ?, machine_department = ?, machine_resource = ? WHERE number = ?;", [false, null, null, null, number]);
    return result;
}


async function deactivateMachine(dept, res) {
    const result = await sqlQuery("UPDATE machine SET user = ?, jobs = ?, active = ? WHERE department = ? AND resource = ?", [null, null, false, dept, res]);
    return result;
}

async function getMachines(number) {
    const result = await sqlQuery("SELECT department, resource FROM machine WHERE user = ? AND active = ?", [number, true]);
    return result;
}