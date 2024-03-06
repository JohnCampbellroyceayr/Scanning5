async function removeMachine(dept, res) {
    const url = 'http://192.168.0.19:2002/api/removeMachine';
    
    const obj = {
        dept: dept,
        resource: res,
        user: EmployeeObj.number
    }
    const result = await post(url, obj);
    displayMessage(result, () => closeMessage(), "OK");
    updateDashBoard(EmployeeObj.number);
}

function displayRemoveMachine(machine) {
    let str = "Do you want to forget machine:" + '\n';
    str += "Department: " + machine.department + '\n';
    str += "Resource: " + machine.resource + '\n';
    return str;
}