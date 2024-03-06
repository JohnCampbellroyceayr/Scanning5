async function updateDashBoard(employeeNumber) {
    const dashboard = await getDashBoardFromServer(employeeNumber);
    setEndShiftBtn(employeeNumber)
    setEmployeeGreeting(dashboard);
    createActiveResourceHTML(dashboard);
    createRecentResourcesHTML(dashboard);
}

function setEndShiftBtn(employeeNumber) {
    const button = document.getElementById("EndShiftBtn");
    button.onclick = async () => {
        await signOut(employeeNumber);
        switchBackToLogin();
    }
}

function setEmployeeGreeting(dashboard) {
    const employee = dashboard.employee[0];
    const name = `HELLO, ${employee.name}`;
    const container = document.getElementById("name");
    container.innerHTML = name;
}

async function getDashBoardFromServer(employeeNumber) {
    const obj = { id: employeeNumber };
    const url = 'http://192.168.0.19:2002/api/dashboard';
    const result = await post(url, obj);
    return result;
}

function createRecentResourcesHTML(dashboardObj) {
    let container = document.getElementById('recentResources');
    container.innerHTML = "";
    
    try {
        const recentMachines = dashboardObj.employee[0].recent_machines;
        for (let i = 0; i < recentMachines.length; i++) {
            const machine = recentMachines[i];
            const html = createRecentMachineButton(machine);
            container.append(html);
        }
    }
    catch {

    }
}

function createRecentMachineButton(machine) {
    let button = document.createElement('button');
    
    const text = `${machine.dept} ${machine.res}`;
    button.innerHTML = text;
    const onclickFunc = () => setMachine(machine.dept, machine.res);
    button.onclick = onclickFunc;
    button.className = "recentResourceButton";

    return button;
}

function createActiveResourceHTML(dashboardObj) {

    let container = document.getElementById('activeResources');
    container.innerHTML = "";

    const machines = dashboardObj.machines;
    const tableHeader = new MachineHeaderHTML();
    container.appendChild(tableHeader);

    machines.forEach(function(machine) {
        const machineRow = new MachineRowHTML(machine);
        container.appendChild(machineRow);
    });

    const newRow = new MachineRowHTML({});
    container.appendChild(newRow);

}

class MachineHeaderHTML {
    constructor() {
        const container = document.createElement('tr');
        // container.classList.add("row");

        container.appendChild(this.createCell("Resource<br>Name"));
        container.appendChild(this.createCell("Job<br>#"));
        container.appendChild(this.createCell("Part<br>#"));
        container.appendChild(this.createCell("Qty Good <br>/<br> Qty Req"));
        container.appendChild(this.createCell("Current<br>Status"));
        container.appendChild(this.createCell("Change Status"));
        container.appendChild(this.createCell("Report Pieces"));
        container.appendChild(this.createCell("End<br>Resource"));

        return container;
    }
    createCell(content) {
        let cell = document.createElement('td');
        cell.classList.add("cell");
        let textDiv = document.createElement('div');
        textDiv.classList.add("headerText");
        textDiv.innerHTML = content;
        cell.appendChild(textDiv);
        return cell;
    }
}

class MachineRowHTML {
    createResourceNameHTML(dept, res) {
        const text = `${dept} ${res}`;
        return this.createCell(text);
    }
    createJobHTML(jobs) {
        if(jobs == null || jobs.length == 0) {return this.createCell("+"); };
        if(jobs.length == 1) {
            return this.createCellNoPadding(jobs[0].Job);
        }
        else {
            return this.createCell("Group");
        }
    }
    createPartHTML(jobs) {
        if(jobs == null || jobs.length == 0) {return this.createCellNoPadding(""); };
        if(jobs.length == 1) {
            return this.createCellNoPadding(jobs[0].PartNumber);
        }
        else {
            return this.createCell("Group");
        }
    }
    createQtysHTML(jobs) {
        if(jobs == null || jobs.length == 0) {return this.createCellNoPadding(""); };
        if(jobs.length == 1) {
            const qtyGood = jobs[0].GoodPieces;
            const qtyNeeded = jobs[0].PiecesNeeded;
            const text = `${qtyGood} / ${qtyNeeded}`;
            return this.createCellNoPadding(text);
        }
        else {
            return this.createCellNoPadding("temp group");   
        }   
    }

    createStatusHTML(status) {
        let color;
        switch (status) {
            case "Run":
                return this.createCell("Run", "#196B24");
            case "Setup":
                return this.createCell("Setup", "#E97132");
            default:
                return this.createCell("Stopped", "#0F9ED5");
        }
    }

    createChangeStatusHTML(status, jobs) {
        let cell = document.createElement('td');
        cell.classList.add("cell");
        const setupDisabled = (status == "Idle" || status == "Setup") ? true : false;
        const runDisabled = (status == "Idle" || status == "Run") ? true : false;
        const pauseDisabled = (status == "Idle" || status.includes("Paused")) ? true : false;
        const resumeDisabled = (status == "Idle" || !status.includes("Paused")) ? true : false;
        if(!(jobs == null || jobs.length == 0)) {
            cell.appendChild(this.createButton("Setup", "btnOperationDefault", setupDisabled));
            cell.appendChild(this.createButton("Run", "btnOperationDefault", runDisabled, "#196B24"));
            cell.appendChild(document.createElement('br'));
            cell.appendChild(this.createButton("Pause", "btnOperationDefault", pauseDisabled, "#0F9ED5"));
            cell.appendChild(this.createButton("Resume", "btnOperationDefault", resumeDisabled));
            cell.appendChild(document.createElement('br'));
            cell.appendChild(this.createButton("Stop Job", "btnOperationStopJob"));
        }
        return cell;
    }

    createReportPiecesHTML(jobs) {
        let cell = document.createElement('td');
        cell.classList.add("cell");
        if(!(jobs == null || jobs.length == 0)) {
            cell.appendChild(this.createButton("Good", "btnOperationDefault", false, "#196B24"));
            cell.appendChild(document.createElement('br'));
            cell.appendChild(this.createButton("Scrap", "btnOperationDefault"));
        }
        return cell;
    }

    createEndResourceHTML(jobs, department, resource) {
        let cell = document.createElement('td');
        cell.classList.add("cell");
        cell.appendChild(this.createButton("End<br>Resource", "btnOperationEndResource", undefined, undefined, () => removeMachine(department, resource)));
        return cell;
    }

    constructor(machine) {

        const container = document.createElement('tr');
        // container.classList.add("row");
        if(machine.department == undefined || machine.resource == undefined) {
            const inputButtonFunction = () => {
                const value = document.querySelector("#input #InputText").value;
                const [dept, res] = value.split(" ");
                setMachine(dept, res);
            }
            const func = () => { displayInput("Add Resource", inputButtonFunction, "Add"); }
            container.appendChild(this.createCell("+", undefined, func));
            container.appendChild(this.createCellNoPadding(""));
            container.appendChild(this.createCellNoPadding(""));
            container.appendChild(this.createCellNoPadding(""));
            container.appendChild(this.createCellNoPadding(""));
            container.appendChild(this.createCellNoPadding(""));
            container.appendChild(this.createCellNoPadding(""));
            container.appendChild(this.createCellNoPadding(""));
            return container;
        }
        else {
            const resourceName = this.createResourceNameHTML(machine.department, machine.resource);
            const jobs = this.createJobHTML(machine.jobs);
            const parts = this.createPartHTML(machine.jobs);
            const qty = this.createQtysHTML(machine.jobs);
            const status = this.createStatusHTML(machine.status);
            const changeStatus = this.createChangeStatusHTML(machine.status, machine.jobs);
            const reportPieces = this.createReportPiecesHTML(machine.jobs);
            const endResource = this.createEndResourceHTML(machine.jobs, machine.department, machine.resource);
            container.appendChild(resourceName);
            container.appendChild(jobs);
            container.appendChild(parts);
            container.appendChild(qty);
            container.appendChild(status);
            container.appendChild(changeStatus);
            container.appendChild(reportPieces);
            container.appendChild(endResource);
    
            return container;
        }

    }
    createCellNoPadding(content) {
        let cell = document.createElement('td');
        cell.className = "cell";
        cell.innerHTML = content;
        return cell;
    }
    createCell(content, backgroundColor, onclickFunc = null) {
        let cell = document.createElement('td');
        cell.classList.add("cell");
        let textDiv = document.createElement('div');
        textDiv.classList.add("text");
        textDiv.innerHTML = content;
        if(backgroundColor !== undefined) {
            textDiv.style.backgroundColor = backgroundColor;
        }
        if(onclickFunc != null) {
            cell.onclick = onclickFunc;
        }
        cell.appendChild(textDiv);
        return cell;
    }
    createButton(text, className, disabled = false, backgroundColor = undefined, onclickFunc = null) {
        let button = document.createElement('button');
        button.className = className;
        button.disabled = disabled;
        button.innerHTML = text;
        if(backgroundColor !== undefined && disabled === false) {
            button.style.backgroundColor = backgroundColor;
        }
        if(onclickFunc != null) {
            button.onclick = onclickFunc;
        }
        return button;
    }
}

function createMachineRow(machine) {
    let div = document.createElement('div');
    div.classList.add("cell");
    let textNode = document.createTextNode(machine.user);
    div.appendChild(textNode);
    return div;
}

function createResourceNameHTML(name) {

}

updateDashBoard("02410");