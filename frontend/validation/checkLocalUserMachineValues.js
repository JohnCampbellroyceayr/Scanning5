function checkEmployee() {
    if(EmployeeObj.number == undefined) {
        alert("Employee is not signed in");
        return false;
    }
    return true;
}
function checkMachine() {
    if(MachineObj.dept == undefined || MachineObj.resource == undefined) {
        alert("Machine is not signed in");
        return false;
    }
    return true;
}