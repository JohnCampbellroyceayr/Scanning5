async function setMachinePrompt() {
    if(!checkEmployee()) return ;
    let machine = prompt("Enter Machine", "");
    if(machine == undefined) {
        return ;
    }
    if(machine.includes(" ")) {
        machine = machine.split(" ");
        const dept = machine[0];
        const resource = machine[1];
        await setMachine(dept, resource);
    }
    else {
        alert("Invalid Machine");
    }
}

async function setMachine(dept, resource) {
    console.log(dept, resource);
    const url = 'http://192.168.0.19:2002/api/setMachine';
    const obj = {
        dept: dept,
        resource: resource,
        employee: EmployeeObj.number
    }
    const result = await post(url, obj);
    if(result.error === false && result.success) {
        MachineObj.dept = obj.dept;
        MachineObj.resource = obj.resource;
        MachineObj.mulitiJobMachine = result.args.mulitiJobMachine;
    }
    closeMessage();
    displayMessage(result, () => closeMessage(), "OK");
    updateDashBoard(EmployeeObj.number);
}