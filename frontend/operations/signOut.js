async function signOut(employeeNumber) {
    if(!checkEmployee()) return ;
    const url = 'http://192.168.0.19:2002/api/employeeLogout';
    const obj = {
        id: employeeNumber,
    }
    const result = await post(url, obj);
    displayMessage(result, () => closeMessage(), "OK");
}

async function switchBackToLogin() {
    document.querySelector("#dashboard").style.display = "none";
    document.querySelector("#loginManual").style.display = "block";
    EmployeeObj = {}
    MachineObj = {}
    prepareLoginManualLoadRecentResources();
}