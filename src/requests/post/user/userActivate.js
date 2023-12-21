import sqlQuery from "../../../databases/mysql.js";
import { userExists } from "./getUserValues.js";

export default async function activateUser(id, name) {
    const userInDataBase = await userExists(id);
    if(userInDataBase) {
        var query = "UPDATE user SET name = ?, active = ? WHERE number = ?;";
        var args = [name, true, id];
    }
    else {
        var query = "INSERT INTO user (number, name, status, active) VALUES(?, ?, ?, ?);";
        var args = [id, name, null, true];
    }
    const result = await sqlQuery(query, args);
    return result;
}

