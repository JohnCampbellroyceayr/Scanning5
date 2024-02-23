import express from "express";
import fs from 'fs';
// import employeeSignOut from "./src/requests/post/operations/employeeSignOut.js";
// import endShift from "./src/requests/post/operations/machineEndShift.js";

import getName from "./src/requests/get/user/userExists.js";
import getUserPassword from "./src/requests/get/user/userHasPassword.js";
import activateUser from "./src/requests/post/user/userActivate.js";

import deactivateUser from "./src/requests/post/user/userSignOut.js";

import setMachine from "./src/requests/post/machine/setMachine.js";

import setup from "./src/requests/post/machine/setup.js";
import run from "./src/requests/post/machine/run.js";

import pause from "./src/requests/post/machine/pause.js";
import resume from "./src/requests/post/machine/resume.js";

import goodPieces from "./src/requests/post/machine/reportGood.js";
import scrapPieces from "./src/requests/post/machine/reportScrap.js";
import getScrapCodes from "./src/requests/get/machine/scrapCodes.js";

import validParams from "./src/user/validation/validation.js";
import newMessage from "./src/user/messages/message.js";

import getMachineJobs from "./src/requests/get/machine/getMachineJobs.js";
import getCurrentUser from "./src/requests/get/user/getCurrentUser.js";
import getCurrentJob from "./src/requests/get/machine/currentJob.js";
import getJob from "./src/requests/get/machine/job.js";
import getMulitiJobMachine from "./src/requests/get/machine/machineMultiJob.js";
import machineExists from "./src/requests/get/machine/machineExists.js";

import removeJob from "./src/requests/post/machine/removeJob.js";
import removeMachine from "./src/requests/post/user/removeMachine.js";

const app = express();
import cors from 'cors';
import getUserMachines from "./src/requests/get/user/getUserMachines.js";
import getRecentMachines from "./src/requests/get/user/recentMachines.js";

app.use(cors());
app.use(express.json());


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

    const jobValues = await getCurrentJob(dept, resource, job, seq);

    res.json(jobValues);
});


app.post('/api/getMachineJobs', async (req, res) => {

    if(!validParams(req.body, "getMachineJobs")) { res.json(newMessage("Invalid Params", false, true)); return ; }

    const dept = req.body.dept;
    const resource = req.body.resource;

    const jobs = await getMachineJobs(dept, resource);

    res.json(jobs);
});

app.post('/api/getUser', async (req, res) => {

    const user = req.body.id;
    const userObj = await getCurrentUser(user);
    const machines = await getUserMachines(user);

    res.json({
        user: userObj,
        machines: machines
    });
});

app.post('/api/getUserRecentMachines', async (req, res) => {

    const user = req.body.id;
    const recentMachines = await getRecentMachines(user);

    res.json(recentMachines);

});

app.post('/api/employeeHasPassword', async (req, res) => {

    if(!validParams(req.body, "employeeHasPassword")) { res.json(newMessage("Invalid Params", false, true)); return ;}

    const id = req.body.id;
    const password = await getUserPassword(id);

    let hasPassword = false;
    let name = undefined;
    
    if(password !== null) {
        hasPassword = true;
        name = await getName(id);
    }

    res.json({
        password: hasPassword,
        name: name
    })
});

app.post('/api/employeeLogin', async (req, res) => {

    if(!validParams(req.body, "employeeLogin")) { res.json(newMessage("Invalid Params", false, true)); return ;}

    const id = req.body.id;
    const password = req.body.password;

    const name = await getName(id);
    const correctPassword = await getUserPassword(id);

    if(name == null) {
        res.json(newMessage("Employee Number not found", false));
    }
    else {
        if(correctPassword == null || password == correctPassword) {
            const result = activateUser(id, name);
            if(result.error) {
                res.json(newMessage("An Error occured", false, true));
            }
            else {
                const message = `${id} ${name} was successfully signed in`;
                res.json(newMessage(message, true, false, {name: name}));
            }
        }
        else {
            res.json(newMessage("Incorrect creds", false));
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

app.post('/api/getScrapCodes', async (req, res) => {

    try {
        const scrapCodes = await getScrapCodes();
        res.json(scrapCodes);
    }
    catch(error) {
        res.json(newMessage("No codes found, error", false, true, error));
    }

});

app.post('/api/removeJob', async (req, res) => {

    if(!validParams(req.body, "removeJob")) { res.json(newMessage("Invalid Params", false, true)); return ; }

    const dept = req.body.dept;
    const resource = req.body.resource;
    const job = req.body.job;

    const jobValues = await removeJob(dept, resource, job);

    if(jobValues == true) {
        res.json(newMessage(`Successfully removed job ${job} for resource ${dept} ${resource}`, true));
    }
    else {
        res.json(newMessage(`Failed to remove job ${job} for resource ${dept} ${resource}`, false, false, jobValues));
    }

});

app.post('/api/removeMachine', async (req, res) => {

    if(!validParams(req.body, "removeMachine")) { res.json(newMessage("Invalid Params", false, true)); return ; }

    const user = req.body.user;
    const dept = req.body.dept;
    const resource = req.body.resource;

    const jobValues = await removeMachine(user, dept, resource);

    if(jobValues == true) {
        res.json(newMessage(`Successfully removed resource ${dept} ${resource}`, true));
    }
    else {
        res.json(newMessage(`Failed to remove resource ${dept} ${resource}`, false, false, jobValues));
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
