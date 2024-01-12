import sqlQuery from "../../../databases/mysql.js";

export default async function getUserMachines(user) {

    const currentMachine = await getCurrentMachine(user);
    const otherMachines = await getOtherMachines(user);

    const otherMachinesExcludingCurrent = filterOutCurrentMachineFromOtherMachines(currentMachine, otherMachines);

    return {
        current: currentMachine,
        other: otherMachinesExcludingCurrent,
    }

}

async function getCurrentMachine(user) {
    const query = `
        SELECT 
            machine_department AS department, 
            machine_resource AS resource,
            machine.status AS status 
        FROM user 
        LEFT JOIN machine
            ON machine.department = user.machine_department AND machine.resource = user.machine_resource
        WHERE user.number=? AND user.active=?;
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
        department: null,
        resource: null,
        status: null
    }

}

async function getOtherMachines(user) {
    const query = `
        SELECT department, resource FROM machine WHERE user=? AND active=?;
    `;

    const result = await sqlQuery(query, [user, 1]);

    if(result.error) {
        return [];
    }
    else {
        try {
            return result.result;
        }
        catch(err) {
            return [];
        }
    }    
}

function filterOutCurrentMachineFromOtherMachines(currentMachine, otherMachines) {

    let otherMachinesWithoutCurrentMachine = [];

    for (let i = 0; i < otherMachines.length; i++) {
        const machine = otherMachines[i];
        if(!(currentMachine.department == machine.department && currentMachine.resource == machine.resource)) {
            otherMachinesWithoutCurrentMachine.push(machine);
        }
    }

    return otherMachinesWithoutCurrentMachine;

}

