async function setMachine() {
    if(!checkEmployee()) return ;
    const url = 'http://192.168.0.19:2002/api/setMachine';
    let machine = prompt("Enter Machine", "");
    if(machine == undefined) {
        return ;
    }
    if(machine.includes(" ")) {
        machine = machine.split(" ");
        const obj = {
            dept: machine[0],
            resource: machine[1],
            employee: EmployeeObj.number
        }
        const result = await post(url, obj);
        if(result.error === false && result.success) {
            MachineObj.dept = obj.dept;
            MachineObj.resource = obj.resource;
            MachineObj.mulitiJobMachine = result.args.mulitiJobMachine;
        }
        displayMessage(result);
        
    }
    else {
        alert("Invalid Machine");
    }
    setTimeout(() => {
        display();
    }, 200);
}