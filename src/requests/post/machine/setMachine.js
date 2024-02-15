import sqlQuery from "../../../databases/mysql.js";

import startShift from "./operations/machineStartShift.js";
import pause from "./operations/pause.js";
import employeeSignIn from "../user/operations/employeeSignIn.js";
import { machineDeviceId, machineStatus, machineExistsOnDatabase } from "./getMachineValues.js";
import { userExists } from "../user/getUserValues.js";
import getName from "../../get/user/userExists.js";

import getRecentMachines from "../../get/user/recentMachines.js";

export default async function setMachine(dept, resource, employee) {
    const status = await machineStatus(dept, resource);
    const deviceId = await machineDeviceId(dept, resource);

    if(deviceId == null) {
        return {
            error: "Device Id doesn't exist"
        }
    }

    const setEmployeeResult = await setUserOnDataBase(employee, dept, resource, deviceId);
    const setRecentMachinesResult = await updateUserRecentMachines(employee, dept, resource);
    if(setEmployeeResult.error || setRecentMachinesResult.error) {
        return {
            error: "Something went wrong with setting the employee"
        }
    }

    const machineSet = await machineAlreadySet(employee, dept, resource);

    if(machineSet !== true) {
        const setMachineResult = await setMachineOnDataBase(employee, dept, resource, deviceId);
        if(setMachineResult.error) {
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
    return true;
}


async function setMachineOnDataBase(user, dept, res, deviceId) {

    const machineExists = await machineExistsOnDatabase(dept, res);

    if(machineExists) {
        var query = "UPDATE machine SET user = ?, status = ?, active = ? WHERE department = ? AND resource = ?;";
        var args = [user, "Idle", true, dept, res];
    }
    else {
        var query = "INSERT INTO machine (user, department, resource, device_id, status, active) VALUES(?, ?, ?, ?, ?, ?);";
        var args = [user, dept, res, deviceId, "Idle", true];
    }
   
    const result = await sqlQuery(query, args);
    return result;
    
}

async function updateUserRecentMachines(user, dept, res) {
    try {
        const recentMachines = await getRecentMachines(user);
        const newRecentMachines = updateRecentMachines(recentMachines, dept, res);
        await updateRecentMachinesWithNew(user, newRecentMachines);
    }
    catch(error) {
        console.log(error);
        return {
            error: error
        }
    }
    return { error: false }
}


async function updateRecentMachinesWithNew(user, newRecentMachines) {
    const recentMachinesJSON = JSON.stringify(newRecentMachines);
    const query = `
        UPDATE user SET recent_machines = ? WHERE number = ?;
    `;
    const result = await sqlQuery(query, [recentMachinesJSON, user]);
    if(result.error) {
        throw new Error(result.error);
    }
}

function updateRecentMachines(recentMachines, dept, res) {
    recentMachines = recentMachines || [];

    let index = recentMachines.findIndex((machine) => machine.dept === dept && machine.res === res);

    if (index !== -1) {
        recentMachines.unshift(...recentMachines.splice(index,  1));
    } else {
        recentMachines.unshift({ dept, res });
    }

    if (recentMachines.length >  4) {
        recentMachines.pop();
    }

    return recentMachines;
}


// test('test recentMachines 1', () => {
//     const recentMachinesTest = [
//         { dept: "WD", res: "LAS01" },
//         { dept: "ML", res: "DESLG" },
//         { dept: "SF", res: "SFGRD" },
//         { dept: "qw", res: "asdfsdf" },
//     ]
//     assert.deepEqual(
//         updateRecentMachines(recentMachinesTest, "W1", "LAS02"),
//         [
//             { dept: "W1", res: "LAS02" },
//             { dept: "WD", res: "LAS01" },
//             { dept: "ML", res: "DESLG" },
//             { dept: "SF", res: "SFGRD" },
//         ]
//     ); 
// });

// test('test recentMachines 2', () => {
//     const recentMachinesTest = null;
//     assert.deepEqual(
//         updateRecentMachines(recentMachinesTest, "WD", "LAS01"),
//         [
//             { dept: "WD", res: "LAS01" }
//         ]
//     ); 
// });

// test('test recentMachines 3', () => {
//     const recentMachinesTest = [
//         { dept: "WD", res: "LAS01" },
//         { dept: "ML", res: "DESLG" }
//     ]
//     assert.deepEqual(
//         updateRecentMachines(recentMachinesTest, "WD", "LAS01"),
//         [
//             { dept: "WD", res: "LAS01" },
//             { dept: "ML", res: "DESLG" }
//         ]
//     ); 
// });

// test('test recentMachines 4', () => {
//     const recentMachinesTest = [
//         { dept: "ML", res: "DESLG" },
//         { dept: "ML", res: "DESLG" },
//         { dept: "WD", res: "LAS01" },
//         { dept: "WD", res: "LAS01" },
//     ]
//     assert.deepEqual(
//         updateRecentMachines(recentMachinesTest, "WD", "LAS01"),
//         [
//             { dept: "WD", res: "LAS01" },
//             { dept: "ML", res: "DESLG" },
//             { dept: "ML", res: "DESLG" },
//             { dept: "WD", res: "LAS01" },
//         ]
//     ); 
// });

async function setUserOnDataBase(user, dept, res) {

    const userAlreadyExists = await userExists(user);

    if(userAlreadyExists) {
        var query = "UPDATE user SET machine_department = ?, machine_resource = ? WHERE number = ?;";
        var args = [dept, res, user];
    }
    else {
        const name = await getName(user);
        var query = "INSERT INTO user (number, name, status, machine_department, machine_resource, active) VALUES(?, ?, ?, ?, ?, ?);";
        var args = [user, name, null, dept, res, true];
    }
   
    const result = await sqlQuery(query, args);
    return result;
    
}

async function machineAlreadySet(employee, dept, resource) {
    const query = "SELECT user FROM machine WHERE department = ? AND resource = ? AND active = ?;";
    const args = [dept, resource, true];
    const result = await sqlQuery(query, args);
    try {
        if(result.result[0].user == employee) {
            return true;
        }
    }
    catch {

    }
    return false;
}