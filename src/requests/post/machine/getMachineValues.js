import ODBC from "../../../databases/odbc.js";
import sqlQuery from "../../../databases/mysql.js";

export function machineDeviceId(dept, res) {
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
            if (error) {
                resolve(null);
            }
            else {
                if (result.length > 0) {
                    resolve(result[0]["DeviceId"]);
                }
                else {
                    resolve(null);
                }
            }
        });
    });
}

export function machineStatus(dept, res) {
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

export function machineMode(dept, res) {
    const deptWithPlantCode = "DFT" + dept;
    const query = `
        SELECT
            J9MODE AS "mode"
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
                    resolve(result[0]["mode"]);
                }
                else {
                    resolve("I");
                }
            }
        });
    })
}

export async function machineExistsOnDatabase(dept, res) {

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