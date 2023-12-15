import ODBC from "../../../databases/odbc.js";

export default async function machineExists(dep, res) {
    const query = `
        SELECT TRIM(ABMACG) AS GROUP, TRIM(ABDES) AS DESCRIPTION FROM RESRE WHERE TRIM(ABDEPT) = ? AND TRIM(ABRESC) = ?
    `;
    const departmentWithPlantCode = "DFT" + dep;
    return new Promise(async (resolve, reject) => {
        ODBC.query(query, [departmentWithPlantCode, res], async (error, result) => {
            if(error) {
                console.log(error);
                resolve(null);
            }
            else {
                if(result.length > 0) {
                    resolve(true);
                }
                else {
                    resolve(null);
                }
            }
        });
    });
}