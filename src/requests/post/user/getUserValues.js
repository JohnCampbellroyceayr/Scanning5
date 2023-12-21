import sqlQuery from "../../../databases/mysql.js";

export async function userExists(number) {
    const query = `
        SELECT * FROM user WHERE number = ?;
    `;
    const result = await sqlQuery(query, number);
    if (result.error) {
        return false;
    }
    if (result.result.length > 0) {
        return true;
    }
    return false;
}
