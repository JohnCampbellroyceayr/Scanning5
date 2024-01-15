import ODBC from "../../../databases/odbc.js";

export default async function getScrapCodes() {
    const query = `
        SELECT ETRESN AS CODE, TRIM(ETDESC) AS DESC FROM SPRSN
    `;
    return new Promise(async (resolve, reject) => {
        ODBC.query(query, (error, result) => {
            if(error) {
                reject("null");
                return ;
            }
            if(result.length > 0) {
                let codes = [];
                let descriptions = [];
                for (let i = 0; i < result.length; i++) {
                    codes.push(result[i]["CODE"]);
                    descriptions.push(result[i]["DESC"]);
                }
                resolve({
                    codes: codes,
                    descriptions: descriptions
                });   
            }
            else {
                reject("null");
            }
        });
    });
}