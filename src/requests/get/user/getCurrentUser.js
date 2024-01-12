import sqlQuery from "../../../databases/mysql.js";

export default async function getCurrentUser(user) {

    const query = `
        SELECT name, status FROM user WHERE number=? AND active=?;
    `;
    
    const result = await sqlQuery(query, [user, 1]);
    if(!result.error) {
        try {
            if(result.result.length > 0) {
                return result.result[0];
            }
        }
        catch(err) {

        }
    }
    return {
        name: null,
        status: null
    };

}