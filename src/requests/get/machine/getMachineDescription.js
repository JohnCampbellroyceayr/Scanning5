import ODBC from "../../../databases/odbc.js";

export default async function getMachineDescription(dept, resource) {

    const deptWithPlantCode = 'DFT' + dept;

    const query = `
        SELECT ABDES FROM RESRE WHERE ABDEPT = ? AND ABRESC = ?
    `;
    return new Promise(async (resolve, reject) => {
        ODBC.query(query, [deptWithPlantCode, resource], (error, result) => {
            if(error) {
                resolve("");
                console.log(error);
            }
            else {
                if(result.length > 0) {
                    resolve(result[0].ABDES);
                }
                else {
                    resolve("");
                }
            }
        });
    });
}