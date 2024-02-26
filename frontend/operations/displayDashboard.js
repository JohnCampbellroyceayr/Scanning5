async function updateDashBoard(employeeNumber) {
    const obj = { id: employeeNumber };
    const url = 'http://192.168.0.19:2002/api/dashboard';
    const result = await post(url, obj);
    createActiveResourceHTML(result);
    console.log(result);
}

async function createActiveResourceHTML(dashboardObj) {

    let container = document.getElementById('activeResources');
    container.innerHTML = "";

    const machines = dashboardObj.machines;
    const tableHeader = new MachineHeaderHTML();
    container.appendChild(tableHeader);

    machines.forEach(function(machine) {
        const machineRow = new MachineRowHTML(machine);
        container.appendChild(machineRow);
    });
    

}

class MachineHeaderHTML {
    constructor() {
        const container = document.createElement('div');
                
        container.appendChild(this.createCell("Resource Name"));
        container.appendChild(this.createCell("Job"));
        container.appendChild(this.createCell("Part"));
        container.appendChild(this.createCell("Qty Good / Qty Req"));
        container.appendChild(this.createCell("Current Status"));
        container.appendChild(this.createCell("Change Status"));
        container.appendChild(this.createCell("Report Pieces"));

        return container;
    }
    createCell(text) {
        let cell = document.createElement('div');
        cell.classList.add("cell");
        let textDiv = document.createElement('div');
        textDiv.classList.add("text");
        let textNode = document.createTextNode(text);
        textDiv.appendChild(textNode);
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
        if(jobs == null) {return this.createCell("+"); };
        const text = (jobs.length == 1) ? jobs[0].Job : "Group";
        return this.createCell(text);
    }
    createPartHTML(jobs) {
        if(jobs == null) {return this.createCell("NONE"); };
        const text = (jobs.length == 1) ? jobs[0].PartNumber : "Group";
        return this.createCell(text);
    }
    createQtysHTML(jobs) {
        if(jobs == null) {return this.createCell("NONE"); };
        console.log(jobs);
        if(jobs.length == 1) {
            const qtyGood = jobs[0].GoodPieces;
            const qtyNeeded = jobs[0].PiecesNeeded;
            const text = `${qtyGood} / ${qtyNeeded}`;
            return this.createCell(text);
        }
        else {
            return this.createCell("temp group");   
        }
    }
    createChangeStatusHTML(status) {
        let cell = document.createElement('div');
        cell.classList.add("cell");
        cell.appendChild(this.createButton("Setup", "btnOperation"));
        cell.appendChild(this.createButton("Run", "btnOperation"));
        cell.appendChild(this.createButton("Pause", "btnOperation"));
        cell.appendChild(this.createButton("Resume", "btnOperation"));
        cell.appendChild(this.createButton("Stop", "btnOperation"));
        return cell;
    }

    createReportPiecesHTML(jobs) {
        let cell = document.createElement('div');
        cell.classList.add("cell");
        cell.appendChild(this.createButton("Good", "btnOperation"));
        cell.appendChild(this.createButton("Scrap", "btnOperation"));
        return cell;
    }

    createButton(text, className) {
        let button = document.createElement('button');
        button.className = className;
        button.innerHTML = text;
        return button;
    }
    createStatusHTML(status) {
        return this.createCell(status);
    }
    constructor(machine) {

        const container = document.createElement('div');
        container.classList.add("row");
        const resourceName = this.createResourceNameHTML(machine.department, machine.resource);
        const jobs = this.createJobHTML(machine.jobs);
        const parts = this.createPartHTML(machine.jobs);
        const qty = this.createQtysHTML(machine.jobs);
        const status = this.createStatusHTML(machine.status);
        const changeStatus = this.createChangeStatusHTML(machine.status);
        const reportPieces = this.createReportPiecesHTML();
        container.appendChild(resourceName);
        container.appendChild(jobs);
        container.appendChild(parts);
        container.appendChild(qty);
        container.appendChild(status);
        container.appendChild(changeStatus);
        container.appendChild(reportPieces);

        return container;

    }
    createCell(content) {
        let cell = document.createElement('div');
        cell.classList.add("cell");
        let textDiv = document.createElement('div');
        textDiv.classList.add("text");
        textDiv.innerHTML = content;
        cell.appendChild(textDiv);
        return cell;
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