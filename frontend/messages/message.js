function displayMessage(messageObj) {
    let str = '';
    str += "Success: " + messageObj.success + '\n';
    str += "Error: " + messageObj.error + '\n';
    str += "Message: " + messageObj.message + '\n';
    alert(str);
    display();
}


async function display() {
    const userData = await getCurrentUser();
    const jobs = await getMachineJobs();
    fillInFields(userData, jobs);
}

function fillInFields(userData, jobs) {
    document.querySelector("#employeeNumberName").innerHTML = EmployeeObj.number + " " + userData.user.name + " (Click to switch)";
    // document.querySelector("#EmployeeStatus").innerHTML = userData.user.status;
    if(MachineObj.dept !== undefined && MachineObj.resource !== undefined) {
        document.querySelector("#deptResource").innerHTML = userData.machines.current.department + " " + userData.machines.current.resource;
        // document.querySelector("#MachineStatus").innerHTML = userData.machines.current.status;
        // document.querySelector("#Jobs").innerHTML = makeTable(jobs);
    }
}

function makeTable(jobsArr) {
    let str = 'Job | Seq | Part Numbers | Good Pieces | Pieces Needed';
    str += '<br>';
    for (let i = 0; i < jobsArr.length; i++) {
        const job = jobsArr[i];
        str += job.Job + " | ";
        str += job.Sequence + " | ";
        str += job.PartNumber + " | ";
        str += job.GoodPieces + " | ";
        str += job.PiecesNeeded + " | ";
        str += '<br>';
    }
    return str;
}

function getJobsDisplayString(jobArr) {
    let str = '\n';
    for (let i = 0; i < jobArr.length; i++) {
        console.log(jobArr[i]);
        str += "W/O " + jobArr[i].Job;
        str += " Seq " + jobArr[i].Sequence;
        str += '\n';
    }
    return str;
}

function confirmJobsDisplayMessage(jobsArr, initialMessage) {
    let str = initialMessage + '\n';
    for (let i = 0; i < jobsArr.length; i++) {
        const job = jobsArr[i];
        str += "W/O " + jobsArr[i].Job;
        str += " Seq " + jobsArr[i].Sequence;
        str += '\n';
    }
    return str;
}