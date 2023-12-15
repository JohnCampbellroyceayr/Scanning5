import sqlQuery from "../../../databases/mysql.js";
import ODBC from "../../../databases/odbc.js";

import startShift from "../operations/machineStartShift.js";
import pause from "../operations/pause.js";
import employeeSignIn from "../operations/employeeSignIn.js";

export default async function setMachine(dept, resource, employee) {
    const status = await machineStatus(dept, resource);
    const deviceId = await machineDeviceId(dept, resource);

    if(deviceId == null) {
        return {
            error: "Device Id doesn't exist"
        }
    }

    const result = setMachineOnDataBase(employee, dept, resource, deviceId);
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
        return err
    }
}


async function setMachineOnDataBase(user, dept, res, deviceId) {
    const machineObj =  {
        dept: dept,
        res: res,
        deviceId: deviceId
    }
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

async function machineExistsOnDatabase(dept, res) {

    const query = `
        SELECT * FROM machine WHERE department = ? AND resource = ?;
    `;
    const result = await sqlQuery(query, [dept, res]);
    if(result.error) {
        return false;
    }
    if(result.result.length > 0) {
        return true;
    }
    return false;

}

function machineStatus(dept, res) {
    const deptWithPlantCode = "DFT" + dept;
    const query = `
        SELECT
            J9STAT AS "status"
        FROM RACT
        WHERE
            TRIM(J9DEPT) = ? AND TRIM(J9RESC) = ?
    `;
    return new Promise((resolve, reject) => {
        ODBC.query(query, [deptWithPlantCode, res], (error, result) => {
            if(error) {
                resolve("I");
            }
            else {
                if(result.length > 0) {
                    resolve(result[0]["status"]);
                }
                else {
                    resolve("I");
                }
            }
        });
    })
}

function machineDeviceId(dept, res) {
    const deptWithPlantCode = "DFT" + dept;
    const query = `
        SELECT
            KEDID# AS "DeviceId"
        FROM RCTF
        WHERE
            TRIM(KEDEPT) = ? AND TRIM(KERESC) = ?
    `;
    return new Promise((resolve, reject) => {
        ODBC.query(query, [deptWithPlantCode, res], (error, result) => {
            if(error) {
                resolve(null);
            }
            else {
                if(result.length > 0) {
                    resolve(result[0]["DeviceId"]);
                }
                else {
                    resolve(null);
                }
            }
        });
    })
}