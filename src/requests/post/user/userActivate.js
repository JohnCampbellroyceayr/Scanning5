import sqlQuery from "../../../databases/mysql.js";

export default async function activateUser(id, name) {
    const userInDataBase = await userExists(id);
    if(userInDataBase) {
        var query = "UPDATE user SET name = ?, active = ? WHERE number = ?;";
        var args = [name, true, id];
    }
    else {
        var query = "INSERT INTO user (number, name, status, machine, other_machines, active) VALUES(?, ?, ?, ?, ?, ?);";
        var args = [id, name, null, null, null, true];
    }
    const result = await sqlQuery(query, args);
    return result;
}

async function userExists(number) {
    const query = `
        SELECT * FROM user WHERE number = ?;
    `;
    const result = await sqlQuery(query, number);
    if(result.error) {
        return false;
    }
    if(result.result.length > 0) {
        return true;
    }
    return false;
}