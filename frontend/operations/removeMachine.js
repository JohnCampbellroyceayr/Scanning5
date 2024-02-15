async function removeMachine() {
    if(!checkEmployee()) return ;
    if(!checkMachine()) return ;
    const userObj = await getCurrentUser();
    const machineArr = [userObj.machines.current, ...userObj.machines.other];

    console.log(userObj.machines);
    console.log(machineArr);

    const url = 'http://192.168.0.19:2002/api/removeMachine';
    
    for (let i = 0; i < machineArr.length; i++) {
        const machine = machineArr[i];
        if(confirm(displayRemoveMachine(machine))) {
            const obj = {
                dept: machine.department,
                resource: machine.resource,
                user: EmployeeObj.number
            }
            const result = await post(url, obj);
            displayMessage(result);
        }       
    }
}

function displayRemoveMachine(machine) {
    let str = "Do you want to forget machine:" + '\n';
    str += "Department: " + machine.department + '\n';
    str += "Resource: " + machine.resource + '\n';
    return str;
}