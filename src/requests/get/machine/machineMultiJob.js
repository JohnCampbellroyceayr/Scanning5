import ODBC from "../../../databases/odbc.js";

export default async function getMultiJobMachine(dept, resource) {

    const deptWithPlantCode = 'DFT' + dept;
    const machine = deptWithPlantCode + resource;

    const query = `
        SELECT * FROM USRC WHERE TRIM(MFKEY2) = ?
    `;
    return new Promise(async (resolve, reject) => {
        ODBC.query(query, [machine], (error, result) => {
            if(error) {
                resolve("N");
                console.log(error);
            }
            else {
                if(result.length > 0 && result[0]["MFRESP"].includes("Y")) {
                    resolve("Y");
                }
                else {
                    resolve("N");
                }
            }
        });
    });
}