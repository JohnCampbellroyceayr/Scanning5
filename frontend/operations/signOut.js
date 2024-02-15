async function signOut() {
    if(!checkEmployee()) return ;
    const url = 'http://192.168.0.19:2002/api/employeeLogout';
    const obj = {
        id: EmployeeObj.number,
    }
    const result = await post(url, obj);
    displayMessage(result);
}