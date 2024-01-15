import sqlQuery from "../../../databases/mysql.js";

export default async function getMachineJobs(dept, res) {

    const query = `
        SELECT jobs FROM machine WHERE department = ? AND resource = ?;
    `;
    const result = await sqlQuery(query, [dept, res]);

    if(result.error) {
        return [];
    }
    try {
        if(result.result.length > 0) {
            if (Array.isArray(result.result[0]["jobs"])) {
                return result.result[0]["jobs"];
            } else {
                return [];
            }
        }
    }
    catch(err) {
        return [];
    }
    return [];

}