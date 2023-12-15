import ODBC from "../../../databases/odbc.js";

export default async function getName(id) {
    const query = `
        SELECT TRIM(ZMFNME) AS FIRST, TRIM(ZMLNME) AS LAST FROM TAZM WHERE ZMEMPL = ?
    `;
    return new Promise(async (resolve, reject) => {
        ODBC.query(query, [id], (error, result) => {
            if(error) {
                resolve(null);
            }
            else if(result.length > 0) {
                resolve(result[0]["FIRST"] + " " + result[0]["LAST"]);
            }
            else {
                resolve(null);
            }
        });
    });
}