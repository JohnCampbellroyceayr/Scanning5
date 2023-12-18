import express from "express";
// import startShift from "./src/requests/post/operations/machineStartShift.js";
// import pause from "./src/requests/post/operations/pause.js";
// import employeeSignIn from "./src/requests/post/operations/employeeSignIn.js";
// import setup from "./src/requests/post/operations/setup.js";
// import run from "./src/requests/post/operations/run.js";
// import resume from "./src/requests/post/operations/resume.js";
// import reportGood from "./src/requests/post/operations/good.js";
// import scrap from "./src/requests/post/operations/scrap.js";
// import employeeSignOut from "./src/requests/post/operations/employeeSignOut.js";
// import endShift from "./src/requests/post/operations/machineEndShift.js";

import setMachine from "./src/requests/post/machine/setMachine.js";
import setup from "./src/requests/post/machine/setup.js";
import run from "./src/requests/post/machine/run.js";

import getName from "./src/requests/get/user/userExists.js";
import activateUser from "./src/requests/post/user/userActivate.js";

import newMessage from "./src/user/messages/message.js";

import machineExists from "./src/requests/get/machine/machineExists.js";

import getJob from "./src/requests/get/machine/job.js";

const app = express();
import cors from 'cors';
import pause from "./src/requests/post/machine/pause.js";

app.use(cors());
app.use(express.json());

// app.get('/api/:id', async (req, res) => {
//     const id = req.params.id;
//     const john = req.query.john;
//     const james = req.query.james;
 

//     console.log(id);
//     console.log(john);
//     console.log(james);
//     // Now you can use these variables in your code
 

//     res.json({
//         "Success": true
//     });
// });


app.post('/api/employeeLogin', async (req, res) => {
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
            res.json(newMessage(message));
        }
    }
});

app.post('/api/checkJob', async (req, res) => {
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

app.post('/api/setup', async (req, res) => {

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


app.post('/api/run', async (req, res) => {

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