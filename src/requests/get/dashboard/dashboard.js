import sqlQuery from "../../../databases/mysql.js";

export default async function getDashboard(employeeNumber) {
    console.log(employeeNumber);
    const employee = await getEmployee(employeeNumber);
    const machines = await getMachines(employeeNumber);
    return {
        employee: employee,
        machines: machines,
    }
}

async function getEmployee(employeeNumber) {
    const query = `
        SELECT 
            number,
            name,
            status,
            machine_department,
            machine_resource,
            recent_machines
        FROM
            user
        WHERE 
            number = ?
        ;
    `;
    const employee = await sqlQuery(query, employeeNumber);
    return employee.result;
}

async function getMachines(employeeNumber) {
    const query = `
        SELECT 
            user,
            department,
            resource,
            status,
            jobs,
            active
        FROM
            machine 
        WHERE 
            user = ? AND active = 1
        ;
    `;
    const machines = await sqlQuery(query, employeeNumber);
    return machines.result;
}