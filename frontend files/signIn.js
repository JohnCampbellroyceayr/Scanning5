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
    }
    displayMessage(result);
    setTimeout(() => {
        display();
    }, 200);
}