async function employeeSignIn() {
    const url = 'http://192.168.0.19:2002/api/employeeLogin';
    const obj = {
        id: prompt("Employee ID", "")
    }
    if(obj.id == undefined) {
        return ;
    }
    
    const result = await post(url, obj);

    if(result.error === false && result.success) {
        EmployeeObj.number = obj.id; 
        displayMessage(result);
        prepareDashboardForSetMachine();
        setTimeout(() => {
            display();
        }, 200);
    }
    else {
        displayMessage(result);
    }
}

function prepareDashboardForSetMachine() {
    document.querySelector(".statusBar").style.display = "block";
    document.querySelector("#login").style.display = "none";
    document.querySelector("#setMachine").style.display = "block";
    prepareSetupLoadRecentResources();
}