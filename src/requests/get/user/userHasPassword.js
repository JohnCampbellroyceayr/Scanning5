import ODBC from "../../../databases/odbc.js";

export default async function getUserPassword(employeeId) {
    const query = `
        SELECT TRIM(MFRESP) AS FIELD, MFENT# AS CODE FROM USRC WHERE TRIM(MFKEY2) = ?
    `;
    return new Promise(async (resolve, reject) => {
        ODBC.query(query, [employeeId], (error, result) => {
            if(error) {
                resolve(null);
                console.log(error);
                return ;
            }
            if(result.length > 0) {

                for (let i = 0; i < result.length; i++) {
                    const obj = result[i];
                    if(obj["CODE"] == 30) {
                        resolve(obj["FIELD"]);
                        return;
                    }
                }
            }
            resolve(null);
        });
    });
}