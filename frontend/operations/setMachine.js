async function prepareSetupLoadRecentResources() {
    const url = 'http://192.168.0.19:2002/api/getUserRecentMachines';
    const sendObj = {
        id: EmployeeObj.number
    }
    const result = await post(url, sendObj);
    let container = document.getElementById('recentResourceButtons');
    container.innerHTML = "";
    if(result != null) {

        result.forEach(function(obj) {
            let button = document.createElement('button');
            
            button.className = 'btn-recentResource';
            
            button.onclick = function() {
                setMachine(obj.dept, obj.res);
            };

            let textNode = document.createTextNode(obj.dept + ' ' + obj.res);
            button.appendChild(textNode);
            
            container.appendChild(button);

            let br = document.createElement('br');
            container.appendChild(br);
        });
    }
}

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
    displayMessage(result);
    setTimeout(() => {
        display();
    }, 200);
}