async function getCurrentUser() {
    const url = 'http://192.168.0.19:2002/api/getUser';

    const obj = {
        id: EmployeeObj.number
    }
    const result = await post(url, obj);
    return result;
}