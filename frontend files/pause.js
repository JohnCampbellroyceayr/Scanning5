async function pause() {
    if(!checkEmployee()) return ;
    if(!checkMachine()) return ;
    const url = 'http://192.168.0.19:2002/api/pause';
    const obj = {
        dept: MachineObj.dept,
        resource: MachineObj.resource,
    }
    const result = await post(url, obj);
    displayMessage(result);
}