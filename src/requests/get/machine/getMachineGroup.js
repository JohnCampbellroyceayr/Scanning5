import ODBC from "../../../databases/odbc.js";

export default function getGroup(departmentWithPlantCode, res) {
    const query = `
        SELECT TRIM(ABMACG) AS "Machine Group" FROM RESRE WHERE ABDEPT = ? AND ABRESC = ?
    `;
    return new Promise(async (resolve, reject) => {
        ODBC.query(query, [departmentWithPlantCode, res], async (error, result) => {
            if(error) {
                console.log(error);
                resolve(undefined);
            }
            else {
                if(result.length > 0) {
                    if(result[0]["Machine Group"] !== undefined) {
                        if(result[0]["Machine Group"] !== '') {
                            resolve(result[0]["Machine Group"]);
                            return ;
                        }
                    }
                }
                resolve(undefined);
            }
        });
    });
}
