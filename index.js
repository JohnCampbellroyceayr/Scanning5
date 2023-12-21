import express from "express";
import fs from 'fs';
// import employeeSignOut from "./src/requests/post/operations/employeeSignOut.js";
// import endShift from "./src/requests/post/operations/machineEndShift.js";

import getName from "./src/requests/get/user/userExists.js";
import activateUser from "./src/requests/post/user/userActivate.js";

import deactivateUser from "./src/requests/post/user/userSignOut.js";

import setMachine from "./src/requests/post/machine/setMachine.js";

import setup from "./src/requests/post/machine/setup.js";
import run from "./src/requests/post/machine/run.js";

import pause from "./src/requests/post/machine/pause.js";
import resume from "./src/requests/post/machine/resume.js";

import goodPieces from "./src/requests/post/machine/reportGood.js";
import scrapPieces from "./src/requests/post/machine/reportScrap.js";

import validParams from "./src/user/validation/validation.js";
import newMessage from "./src/user/messages/message.js";

import getMachineJobs from "./src/requests/get/machine/getMachineJobs.js";
import getCurrectJob from "./src/requests/get/machine/currentJob.js";
import getJob from "./src/requests/get/machine/job.js";
import getMulitiJobMachine from "./src/requests/get/machine/machineMultiJob.js";
import machineExists from "./src/requests/get/machine/machineExists.js";

const app = express();
import cors from 'cors';

app.use(cors());
app.use(express.json());


app.post('/api/employeeLogin', async (req, res) => {

    if(!validParams(req.body, "employeeLogin")) { res.json(newMessage("Invalid Params", false, true)); return ;}

    const id = req.body.id;
    const name = await getName(id);

    if(name == null) {
        res.json(newMessage("Employee Number not found", false));
    }
    else {
        const result = activateUser(id, name);
        if(result.error) {
            res.json(newMessage("An Error occured", false, true));
        }
        else {
            const message = `${id} ${name} was successfully signed in`;
            res.json(newMessage(message));
        }
    }
});

app.post('/api/setMachine', async (req, res) => {

    if(!validParams(req.body, "setMachine")) { res.json(newMessage("Invalid Params", false, true)); return ; }
    
    const dept = req.body.dept;
    const resource = req.body.resource;
    const employee = req.body.employee;

    const validEmployee = await getName(employee);
    const validMachine = await machineExists(dept, resource);

    if(validEmployee == null || validMachine == null) {
        if(validMachine == null) {
            res.json(newMessage(`Unable to find resource ${dept} ${resource}`, false));
        }
        else {
            res.json(newMessage(`Unable to find employee # ${employee}`, false));
        }
    }
    else {
        const result = await setMachine(dept, resource, employee);

        if(result.error) {
            res.json(newMessage("An Error occured " + result.error, false, true));
        }
        else {
            const message = `Successfully set ${dept} ${resource}`;
            const mulitiJobMachine = await getMulitiJobMachine(dept, resource);
            console.log(mulitiJobMachine);
            res.json(newMessage(message, true, false, { "mulitiJobMachine": mulitiJobMachine }));
        }
    }
});

app.post('/api/checkJob', async (req, res) => {

    if(!validParams(req.body, "checkJob")) { res.json(newMessage("Invalid Params", false, true)); return ; }
    const dept = req.body.dept;
    const resource = req.body.resource;
    const job = req.body.job;

    const jobValues = await getJob(dept, resource, job);

    if(jobValues == undefined) {
        res.json(newMessage(`Unable to find job ${job} for resource ${dept} ${resource}`, false));
    }
    else {
        res.json(newMessage(`Do you want to add Work Order ${job}, Sequence ${jobValues["Sequence"]}, Part Number ${jobValues["PartNumber"]}`, true, false, jobValues));
    }
});

app.post('/api/checkCurrentJob', async (req, res) => {

    if(!validParams(req.body, "checkCurrentJob")) { res.json(newMessage("Invalid Params", false, true)); return ; }

    const dept = req.body.dept;
    const resource = req.body.resource;
    const job = req.body.job;
    const seq = req.body.seq;

    const jobValues = await getCurrectJob(dept, resource, job, seq);

    res.json(jobValues);
});


app.post('/api/getMachineJobs', async (req, res) => {

    if(!validParams(req.body, "getMachineJobs")) { res.json(newMessage("Invalid Params", false, true)); return ; }

    const dept = req.body.dept;
    const resource = req.body.resource;

    const jobs = await getMachineJobs(dept, resource);

    res.json(jobs);
});

app.post('/api/setup', async (req, res) => {

    if(!validParams(req.body, "setup")) { res.json(newMessage("Invalid Params", false, true)); return ; }

    const employee = req.body.employee;
    const dept = req.body.dept;
    const resource = req.body.resource;
    const jobs = req.body.jobs;

    const result = await setup(employee, dept, resource, jobs);

    if(result.error) {
        res.json(newMessage("An Error occured " + result.error, false, true));
    }
    else {
        const message = `Successfully setup work orders on ${dept} ${resource}`;
        res.json(newMessage(message));
    }

});

app.post('/api/run', async (req, res) => {

    if(!validParams(req.body, "run")) { res.json(newMessage("Invalid Params", false, true)); return ; }

    const employee = req.body.employee;
    const dept = req.body.dept;
    const resource = req.body.resource;
    const jobs = req.body.jobs;

    const result = await run(employee, dept, resource, jobs);

    if(result.error) {
        res.json(newMessage("An Error occured " + result.error, false, true));
    }
    else {
        const message = `Successfully ran work orders on ${dept} ${resource}`;
        res.json(newMessage(message));
    }

});

app.post('/api/pause', async (req, res) => {

    if(!validParams(req.body, "pause")) { res.json(newMessage("Invalid Params", false, true)); return ; }

    const dept = req.body.dept;
    const resource = req.body.resource;

    const result = await pause(dept, resource);

    if(result.error) {
        res.json(newMessage("An Error occured " + result.error, false, true));
    }
    else {
        const message = `Successfully paused ${dept} ${resource}`;
        res.json(newMessage(message));
    }

});

app.post('/api/resume', async (req, res) => {

    if(!validParams(req.body, "resume")) { res.json(newMessage("Invalid Params", false, true)); return ; }

    const dept = req.body.dept;
    const resource = req.body.resource;

    const result = await resume(dept, resource);

    if(result.error) {
        res.json(newMessage("An Error occured " + result.error, false, true));
    }
    else {
        const message = `Successfully resumed ${dept} ${resource}`;
        res.json(newMessage(message));
    }

});


app.post('/api/goodPieces', async (req, res) => {

    if(!validParams(req.body, "goodPieces")) { res.json(newMessage("Invalid Params", false, true)); return ; }

    const employee = req.body.employee;
    const dept = req.body.dept;
    const resource = req.body.resource;
    const jobs = req.body.jobs;
    const quantities = req.body.quantities;

    const result = await goodPieces(employee, dept, resource, jobs, quantities);

    if(result.error) {
        res.json(newMessage("An Error occured " + result.error, false, true));
    }
    else {
        const message = `Successfully scanned work orders on ${dept} ${resource}`;
        res.json(newMessage(message));
    }

});

app.post('/api/scrapPieces', async (req, res) => {

    if(!validParams(req.body, "scrapPieces")) { res.json(newMessage("Invalid Params", false, true)); return ; }

    const employee = req.body.employee;
    const dept = req.body.dept;
    const resource = req.body.resource;
    const job = req.body.job;
    const quantity = req.body.quantity;
    const code = req.body.code;
    
    const result = await scrapPieces(employee, dept, resource, job, quantity, code);

    if(result.error) {
        res.json(newMessage("An Error occured " + result.error, false, true));
    }
    else {
        const message = `Successfully scrapped work orders on ${dept} ${resource}`;
        res.json(newMessage(message));
    }

});

app.post('/api/employeeLogout', async (req, res) => {

    if(!validParams(req.body, "employeeLogout")) { res.json(newMessage("Invalid Params", false, true)); return ; }

    const id = req.body.id;
    
    const result = await deactivateUser(id);

    if(result.error) {
        res.json(newMessage("An Error occured " + result.error, false, true));
    }
    else {
        const message = `Successfully signed out ${id}`;
        res.json(newMessage(message));
    }

});

app.use(express.static('/JohnCampbellProjects/Scanning5'));

app.get('/', function(req, res) {
    res.send("Documentation can be found here: <a href='/README.md'>README.md</a>");
});

app.listen(2002, () => {
    console.log('Server is running on port 2002');
});

// console.time();
// try {
//     await startShift("QAREP", "WD", "LAS01");
//     await pause("QAREP", "WD", "LAS01");
//     await employeeSignIn("QAREP", "WD", "LAS01", "02410");
//     await setup("QAREP", "WD", "LAS01", "067836", "10");
//     await run("QAREP", "WD", "LAS01", "067836", "10");
//     await pause("QAREP", "WD", "LAS01");
//     await resume("QAREP", "WD", "LAS01");
//     await reportGood("QAREP", "WD", "LAS01", "067836", "10", "02410", "120-TEST", "2");
//     await scrap("QAREP", "WD", "LAS01", "067836", "10", "02410", "1", "BB");
//     await employeeSignOut("QAREP", "WD", "LAS01", "02410");
//     await endShift("QAREP", "WD", "LAS01");
// }
// catch(err) {
//     console.log(err);
// }

// console.timeEnd();