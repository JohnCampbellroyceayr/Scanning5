var currentResourceToAddJobsTo = {
    dept: null,
    res: null,
    description: null,
    multiJobResource: null,
}

function backToDashboardJobMenu() {
    currentResourceToAddJobsTo = {
        dept: null,
        res: null,
        description: null,
        multiJobResource: null,
    }
    document.querySelector("#job-dashboard").style.display = "none";
    document.querySelector("#dashboard").style.display = "block";

    document.getElementById("activeResources").innerHTML = '';
    document.getElementById("recentResources").innerHTML = '';

    document.getElementById("WorkOrderDetails").innerHTML = '';

    document.getElementById("job-dashboardJobNumber").value = '';
    document.getElementById("job-dashboardSeqNumber").value = '';
    document.getElementById("job-dashboardPartNumber").innerHTML = '';
    document.getElementById("job-dashboardSeqDescription").innerHTML = '';

    updateDashBoard(EmployeeObj.number);
}

function setEmployeeGreetingJobDashboard(employee) {
    const name = `HELLO, ${employee}`;
    const container = document.querySelector("#name-container-jobDashboard #name");
    container.innerHTML = name;
}

function removeJobFromListButtonClick(dept, res, jobNumber) {
    const message = {
        message: `
            Do you want to remove W/O# ${jobNumber} from resource ${dept} ${res}
        `,
        type: "confirm"
    }

    displayMessage(message, () => { removeJobFromMachine(dept, res, jobNumber); closeMessage() }, "Confirm");
}

async function removeJobFromMachine(dept, resource, jobNumber) {
    const obj = {
        dept: dept,
        resource: resource,
        job: jobNumber
    };
    const result = await post("http://192.168.0.19:2002/api/removeJob", obj);
    if(result.success == false) {
        displayMessage(result);
    }
    loadJobMenuForResource(dept, resource);
}

async function addToJobList() {
    const employee = EmployeeObj.number;
    const dept = currentResourceToAddJobsTo.dept;
    const resource = currentResourceToAddJobsTo.res;
    const job = document.getElementById("job-dashboardJobNumber").value;
    const seq = document.getElementById("job-dashboardSeqNumber").value;
    if(employee != undefined && dept != null && resource != null && job != "" && seq != "") {
        const obj = {
            employee: employee,
            dept: dept,
            resource: resource,
            job: job,
            seq: seq,
        };
        const result = await post("http://192.168.0.19:2002/api/addJob", obj);
        if(result.success == false) {
            displayMessage(result);
        }
        loadJobMenuForResource(dept, resource);
    }
    else {
        const messageObj = {
            message: "Please enter required information"
        }
        displayMessage(messageObj, "default", "OK");
    }

}

async function selectSeq(seqNumber, seqDescription, seqLineHtmlId, arrayOfSeqLines) {
    for (let i = 0; i < arrayOfSeqLines.length; i++) {
        const rowId = arrayOfSeqLines[i];
        document.getElementById(rowId).style.backgroundColor = "#1F4500";
    }
    document.getElementById(seqLineHtmlId).style.backgroundColor = "green";
    document.getElementById("job-dashboardSeqNumber").value = seqNumber;
    document.getElementById("job-dashboardSeqDescription").innerHTML = seqDescription;
}

async function loadJobMenuForResource(dept, resource, employeeName) {
    currentResourceToAddJobsTo.dept = dept;
    currentResourceToAddJobsTo.res = resource;
    const obj = {
        dept: dept,
        resource: resource
    }
    const url = 'http://192.168.0.19:2002/api/getMachineValues';
    const result = await post(url, obj);
    currentResourceToAddJobsTo.description = result.description;
    currentResourceToAddJobsTo.multiJobResource = result.multiJobMachine;
    if(result.description != null && result.multiJobMachine != null) {
        document.getElementById("job-dashboard-description").innerHTML = `
            ${currentResourceToAddJobsTo.description}<br>
            ${currentResourceToAddJobsTo.res}
        `;
    }
    getMachineJobList(dept, resource);
    if(employeeName != undefined) {
        setEmployeeGreetingJobDashboard(employeeName);
    }
}


async function displayWODetails(jobNumber) {
    const routingObj = await getJobRoutingFromServer(currentResourceToAddJobsTo.dept, currentResourceToAddJobsTo.res, jobNumber);
    if(routingObj.success !== false) {
        setHeaderValues(routingObj.header);
        createJobDashboardHTML(routingObj.routing, routingObj.header);
        getMachineJobList(currentResourceToAddJobsTo.dept, currentResourceToAddJobsTo.res);
    }
    else {
        routingObj.message = "Make sure the the machine is valid";
        displayMessage(routingObj, "default", "OK");
    }
}

async function getMachineJobList(dept, res) {
    const obj = {
        dept: dept,
        resource: res
    }
    const url = 'http://192.168.0.19:2002/api/getMachineJobs';
    const result = await post(url, obj);
    createJobListHTML(result, dept, res);
    console.log(result);
}

async function createJobListHTML(machineJobsArr, dept, res) {
    let container = document.getElementById('joblist');
    container.innerHTML = "";

    const headerRow = createJobDashboardRow(["Job #", "Part #", "Seq", "Dept", "Resource", "OP", "DESC", "Qty Good <br>/<br> Qty Req", "Remove Job"], "black");
    container.appendChild(headerRow);
    for (let i = 0; i < machineJobsArr.length; i++) {
        const row = machineJobsArr[i];
        const removeBtnHtml = `
            <button onclick='removeJobFromListButtonClick("${dept}", "${res}", "${row.Job}")'>Remove</button>        
        `;
        const rowHtml = createJobDashboardRow([row.Job, row.PartNumber, row.Sequence, dept, res, row["Operation Code"], row["Op Description"], `${row.GoodPieces} / ${row.PiecesNeeded}`, removeBtnHtml], "black");
        container.appendChild(rowHtml);
    }
}

async function getJobRoutingFromServer(dept, resource, jobNumber) {
    const obj = {
        dept: dept,
        resource: resource,
        jobNumber, jobNumber
    }
    const url = 'http://192.168.0.19:2002/api/getJobRouting';
    const result = await post(url, obj);
    console.log(result);
    return result;
}

function setHeaderValues(headerData) {
    document.getElementById("job-dashboardSeqNumber").value = headerData.recommendedSeq;
    document.getElementById("job-dashboardPartNumber").innerHTML = headerData.partNumber;
    document.getElementById("job-dashboardSeqDescription").innerHTML = headerData.recommendedSeqDescription;
}

function createJobDashboardHTML(jobRoutingArr, jobHeaderObj) {

    let container = document.getElementById('WorkOrderDetails');
    container.innerHTML = "";

    const headerRow = createJobDashboardRow(["SEQ", "DEPT", "RES", "OP", "OP DESCRIPTION", "QTY REQ", "QTY GOOD"], "black");
    container.appendChild(headerRow);

    let rowsThatCanBeAddedToJobList = [];
    for (let i = 0; i < jobRoutingArr.length; i++) {
        const id = "W/O-Details-row-" + i;
        if(jobRoutingArr[i].ableToRunByMachine == true) {
            rowsThatCanBeAddedToJobList.push(id);
        }
    }

    for (let i = 0; i < jobRoutingArr.length; i++) {
        const routing = jobRoutingArr[i];
        let rowColor = (routing.ableToRunByMachine == true) ? "#1F4500" : "black";
        if(jobHeaderObj.recommendedSeq == routing.Sequence) {
            rowColor = "green";
        }
        const id = "W/O-Details-row-" + i;
        const rowOnclick = (routing.ableToRunByMachine == true) ? () => { selectSeq(routing.Sequence, routing["Op Description"], id, rowsThatCanBeAddedToJobList); } : null;
        const routingRow = createJobDashboardRow([routing.Sequence, routing.Dept, routing.Res, routing["Operation Code"], routing["Op Description"], routing.PiecesNeeded, routing.GoodPieces], rowColor, id, rowOnclick);
        container.appendChild(routingRow);
    }

}

function createJobDashboardRow(arrOfCells, backgroundColor, id, onclickFunction = null) {
    let row = document.createElement('tr');
    for (let i = 0; i < arrOfCells.length; i++) {
        const cellText = arrOfCells[i];
        const cell = document.createElement('td');
        cell.innerHTML = cellText;
        row.appendChild(cell);
    }
    if(onclickFunction != null) {
        row.onclick = onclickFunction;
        row.style.cursor = 'pointer';
    }
    row.style.backgroundColor = backgroundColor;
    row.id = id;
    return row;
}

const workOrderInput = document.getElementById("job-dashboardJobNumber");
workOrderInput.addEventListener("keydown", function(e) {
    if (e.code === "Enter") {
        loadSeqInfoBasedOnOrderNumber();
    }
});

function loadSeqInfoBasedOnOrderNumber() {
    displayWODetails(workOrderInput.value);
}