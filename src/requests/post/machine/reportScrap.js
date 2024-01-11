import startShift from "./operations/machineStartShift.js";
import setMachineEmpLogin from "./setMachine.js";
import scanRun from "./operations/run.js";
import reportScrap from "./operations/scrap.js";
import reportScrapNoReport from "./operationsNotReporting/reportScrap.js";
import { machineDeviceId, machineStatus, machineExistsOnDatabase } from "./getMachineValues.js";

export default async function scrapPieces(employee, dept, resource, job, quantity, code) {

    const status = await machineStatus(dept, resource);
    const deviceId = await machineDeviceId(dept, resource);

    if(deviceId == null) {
        return {
            error: "Device Id doesn't exist"
        }
    }

    try {
        if(status === "I") {
            await startShift(deviceId, dept, resource);
        }
        if(job["ReportingPoint"] == "Y") {
            await scanRun(deviceId, dept, resource, job["Job"], job["Sequence"]);
            await reportScrap(deviceId, dept, resource, job["Job"], job["Sequence"], employee, quantity, code);
        }
        else {
            await reportScrapNoReport(employee, dept, resource, job["Job"], job["Sequence"], quantity, code);
        }
        return true;
    }
    catch(err) {
        console.log(err);
        if(err.error !== undefined) {
            if(err.error.includes("0024") && err.error.includes("Labour list must be entered") && setMachine === false) {
                await setMachineEmpLogin(dept, resource, employee);
                return scrapPieces(employee, dept, resource, job, quantity, code)
            }
        }
        else {
            return {
                error: "An unknown application failure, make sure all params are correct, please refer to the docs, located at {ip address}/README.md"
            }
        }
        return err;
    }
}