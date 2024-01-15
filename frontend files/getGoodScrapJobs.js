async function getGoodPiecesJobs() {

    const jobs = await getMachineJobs();

    let goodPiecesArrOfJobs = [];
    let quantities = [];

    for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        const liveJob = await getCurrentJob(job.Job, job.Sequence);
        if(scanPiecesOnWorkOrder(liveJob)) {
            const quantity = getGoodPiecesQuantity(liveJob);
            quantities.push(quantity);
            goodPiecesArrOfJobs.push(liveJob);
        }
    }
    if(jobs.length == 0) {
        const jobNumber = prompt("Enter the work order to scan good pieces on.");
        const jobExists = await checkJob(jobNumber);
        if(confirm(jobExists.message)) {
            const job = jobExists.args;
            const quantity = getGoodPiecesQuantity(job);
            const sendToServerJobsobj = {
                dept: MachineObj.dept,
                resource: MachineObj.resource,
                employee: EmployeeObj.number,
                jobs: [job],
                quantities: [quantity]
            }
            return sendToServerJobsobj;
        }
    }
    else {
        const sendToServerJobsobj = {
            dept: MachineObj.dept,
            resource: MachineObj.resource,
            employee: EmployeeObj.number,
            jobs: goodPiecesArrOfJobs,
            quantities: quantities
        }
        return sendToServerJobsobj;
    }
}

function scanPiecesOnWorkOrder(job) {
    let str = '\n';
    str += job.Job + " | ";
    str += job.Sequence + " | ";
    str += job.PartNumber + " | ";
    str += job.GoodPieces + " | ";
    str += job.PiecesNeeded;
    return confirm("Do you want to scan good pieces on" + str + '\n' + "(OK) for yes and (Cancel for no)");
}

function getGoodPiecesQuantity(job) {
    let message = "Enter the number of pieces you would like to scan on" + '\n';
    message += "W/O " + job.Job + " Seq " + job.Sequence + '\n';
    message += "Needed Pieces: " + job.PiecesNeeded + '\n';
    message += "Good Pieces: " + job.GoodPieces + '\n';
    message += "---------------------" + '\n';
    const piecesRemaining = (job.PiecesNeeded - job.GoodPieces < 0) ? 0 : job.PiecesNeeded - job.GoodPieces;
    message += "Pieces Remaining: " + piecesRemaining;
    const quantity = prompt(message, piecesRemaining);
    return quantity;
}

async function getScrapPieces() {
    const jobNumber = prompt("Enter the work order to scan scrap on.");
    const jobExists = await checkJob(jobNumber);
    if(confirm(jobExists.message)) {
        const job = jobExists.args;
        const quantity = getScrapPiecesQuantity(job);
        const code = await getScrapPiecesErrorCode();
        const jobObj = {
            dept: MachineObj.dept,
            resource: MachineObj.resource,
            employee: EmployeeObj.number,
            job: job,
            quantity: quantity,
            code: code
        }
        return jobObj;
    }
}

function getScrapPiecesQuantity(job) {
    let message = "Enter the number of pieces you would like to scan scrap on" + '\n';
    message += "W/O " + job.Job + " Seq " + job.Sequence + '\n';
    const quantity = prompt(message);
    return quantity;
}

async function getScrapPiecesErrorCode() {
    const errorCodes = await post("http://192.168.0.19:2002/api/getScrapCodes");
    return getCodeFromList(errorCodes.codes, errorCodes.descriptions);
}

function getCodeFromList(codes, descriptions) {
    let message = "What is the correct error code?" + '\n';
    for (let i = 0; i < codes.length; i++) {
        const code = codes[i];
        const description = descriptions[i];
        message += code + " - " + description + '\n';
    }
    const findErrorReason = prompt(message);
    if(codes.includes(findErrorReason.toUpperCase())) {
        return findErrorReason.toUpperCase();
    }
    else {
        alert("That is not correct, please try again.");
        return getCodeFromList(codes, descriptions);
    }
}