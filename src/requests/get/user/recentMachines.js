export default async function getRecentMachines(user) {
    try {
        const query = `
            SELECT recent_machines FROM user WHERE number = ?;
        `;
        const result = await sqlQuery(query, user);
        if(result.error) {
            return null;
        }
        else {
            return result.result[0].recent_machines;
        }
    }
    catch(error) {
        console.log(error);
        return null;
    }
}