async function removeJob() {
    if(!checkEmployee()) return ;
    if(!checkMachine()) return ;
    const url = 'http://192.168.0.19:2002/api/removeJob';
    const jobs = await getMachineJobs();
    for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        if(confirm(displayRemoveJob(job))) {
            const obj = {
                dept: MachineObj.dept,
                resource: MachineObj.resource,
                job: job.Job
            }
            const result = await post(url, obj);
            displayMessage(result);
        }
    }
}

function displayRemoveJob(jobObj) {
    let str = "Do you want to remove:" + '\n';
    str += "Job: " + jobObj.Job + '\n';
    str += "Sequence: " + jobObj.Sequence + '\n';
    str += "PartNumber: " + jobObj.PartNumber + '\n';
    return str;
}