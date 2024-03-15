async function getMachineJobs() {
    const url = 'http://192.168.0.19:2002/api/getMachineJobs';
    
    const obj = {
        dept: MachineObj.dept,
        resource: MachineObj.resource,
    }

    const result = await post(url, obj);

    return result;
}

async function getCurrentJob(job, seq) {
    const url = 'http://192.168.0.19:2002/api/checkCurrentJob';

    const obj = {
        dept: MachineObj.dept,
        resource: MachineObj.resource,
        job: job,
        seq: seq
    }
    const result = await post(url, obj);
    return result;
}

async function getAllJobs(jobs) {
    if(jobs == null) {
        jobs = [];
    }
    if(jobs.length == 1 && MachineObj.mulitiJobMachine == 'N') {
        return jobs;
    }
    const url = 'http://192.168.0.19:2002/api/checkJob';
    const jobStr = "Hello";
    // const jobStr = getJobsDisplayString(jobs);
    const job = prompt("Current jobs: " + jobStr + "Enter Job", "");
    
    if(job == undefined || job == '') {
        return jobs;
    }
    const obj = {
        dept: MachineObj.dept,
        resource: MachineObj.resource,
        job: job
    }
    const result = await post(url, obj);
    if(confirm(result.message)) {
        jobs.push(result.args);
        if(MachineObj.mulitiJobMachine == "Y") {
            return getAllJobs(jobs);
        }
        else {
            return jobs;
        }
    }
    else {
        if(MachineObj.mulitiJobMachine == "Y") {
            return getAllJobs(jobs);
        }
        else {
            return jobs;
        }
    }
}