import sqlQuery from "../../../databases/mysql.js";

export default async function getUserMachines(user) {

    const query = `
        SELECT department, resource FROM machine WHERE user=? AND active=?;
    `;

    const result = await sqlQuery(query, [user, 1]);

    if(result.error) {
        return [];
    }
    try {
        if(result.result.length > 0) {
            return result.result;
        }
    }
    catch(err) {
        return [];
    }
    return [];

}