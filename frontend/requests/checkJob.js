function checkJob(job) {
    const obj = {
        dept: MachineObj.dept,
        resource: MachineObj.resource,
        job: job
    }
    return post('http://192.168.0.19:2002/api/checkJob', obj);
}