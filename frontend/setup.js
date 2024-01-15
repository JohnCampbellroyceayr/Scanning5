async function setup() {
    if(!checkEmployee()) return ;
    if(!checkMachine()) return ;
    const machineJobs = await getMachineJobs();
    const jobs = await getAllJobs(machineJobs);
    const message = confirmJobsDisplayMessage(jobs, "Do you want to setup:");
    if(confirm(message)) {
        const url = 'http://192.168.0.19:2002/api/setup';
        const obj = {
            dept: MachineObj.dept,
            resource: MachineObj.resource,
            employee: EmployeeObj.number,
            jobs: jobs,
        }
        const result = await post(url, obj);
        displayMessage(result);
    }
}