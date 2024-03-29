async function employeeHasPassword(user) {
    const url = 'http://192.168.0.19:2002/api/employeeHasPassword';
    const obj = {
        id: user
    }
    const result = await post(url, obj);
    return result;
}

async function employeeSignIn(user = null) {
    if(user == null) {
        user = document.querySelector("#employeeUserNameInput").value;
    }
    else {
        document.querySelector("#employeeUserNameInput").value = user;
    }
    const passwordInput = document.getElementById("passwordFieldLoginInput");
    const password = passwordInput.value;

    if(password == "") {
        const employeeHasPasswordObj = await employeeHasPassword(user);
        if(employeeHasPasswordObj.password) {
            document.getElementById("passwordFieldLoginManual").style.display = "block";
            document.getElementById("nameOfPotentialSignIn").innerHTML = employeeHasPasswordObj.name;
            console.log("Has a password");
            return;
        }
    }

    const url = 'http://192.168.0.19:2002/api/employeeLogin';
    const obj = {
        id: user,
        password: password,
    }
    if(obj.id == undefined) {
        return ;
    }
    
    const result = await post(url, obj);

    console.log(result);

    if(result.error === false && result.success) {
        EmployeeObj.number = obj.id; 
        passwordInput.value = '';
        putSuccessfulLoginInLocalStorage(user, result.args.name);
        prepareDashboard();
        updateDashBoard(user);
    }
    else {
        displayMessage(result, () => closeMessage(), "Try Again");
    }

}

function putSuccessfulLoginInLocalStorage(employeeNumber, employeeName) {
    const recentEmployeesString = localStorage.getItem("recentEmployees");
    let recentEmployeesArray = JSON.parse(recentEmployeesString);
    recentEmployeesArray = addEmployeeNumberToArray(employeeNumber, employeeName, recentEmployeesArray);
    let stringifiedArray = JSON.stringify(recentEmployeesArray);
    localStorage.setItem("recentEmployees", stringifiedArray);
}

function addEmployeeNumberToArray(employeeNumber, employeeName, arr) {
    if(arr != null) {
        const arrWithOutEmployee = [];
        for (let i = 0; i < arr.length; i++) {
            if(arr[i].number != employeeNumber) {
                arrWithOutEmployee.push(arr[i]);
            }
        }
        arrWithOutEmployee.unshift({
            number: employeeNumber,
            name: employeeName
        });
        if (arrWithOutEmployee.length >= 5) {
            arrWithOutEmployee.pop();
        }
        return arrWithOutEmployee;
    }
    else {
        return [{
            number: employeeNumber,
            name: employeeName
        }];
    }
}


function prepareDashboard() {
    document.querySelector("#employeeUserNameInput").value = "";
    document.querySelector("#nameOfPotentialSignIn").innerHTML = "";
    document.querySelector("#passwordFieldLoginManual").style.display = "none";

    document.querySelector("#loginManual").style.display = "none";
    document.querySelector("#dashboard").style.display = "block";
}

function loadLoginManual() {
    document.querySelector("#loginManual").style.display = "block";
    prepareLoginManualLoadRecentEmployeees();
}

async function prepareLoginManualLoadRecentEmployeees() {

    const recentEmployeesString = localStorage.getItem("recentEmployees");
    let recentEmployeesArray = JSON.parse(recentEmployeesString);

    console.log(recentEmployeesArray);

    let container = document.getElementById('recentLoginButtons');
    container.innerHTML = "";
    if(recentEmployeesArray != null) {

        recentEmployeesArray.forEach(function(employeeObj) {
            let button = document.createElement('button');
            
            button.className = 'recentLoginButtons';
            
            button.onclick = function() {
                employeeSignIn(employeeObj.number);
            };

            let textNode = document.createTextNode(employeeObj.name);
            button.appendChild(textNode);
            
            container.appendChild(button);

            let br = document.createElement('br');
            container.appendChild(br);
        });
    }

}

loadLoginManual();