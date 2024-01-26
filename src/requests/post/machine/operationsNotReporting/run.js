import updateNotePadWorkOrderLine from './notePadOperations/writeToNotePad.js';
import createNewLine, { createNewLineGroupRunOrSetup } from './notePadOperations/createNewLine.js';


export default function run(employee, departmentCode, resourceCode, workOrder, seqNumber, group = false, dateObj = false) {
    return new Promise(async (resolve, reject) => {
        try {
            if(group !== false && dateObj !== false) {
                var newLine = createNewLineGroupRunOrSetup("Run", seqNumber, departmentCode, resourceCode, employee, dateObj);
            }
            else {
                var newLine = createNewLine("Run", seqNumber, departmentCode, resourceCode, employee);
            }
            const result = await updateNotePadWorkOrderLine(departmentCode, resourceCode, workOrder, newLine);
            if(result.result.CMS_ServiceResponse.RequestStatus !== 'OK') {
                reject({ error: "Error formatting data to send to AS400, Please make sure all data is correct" });
            }
            else {
                resolve();
            }
        }
        catch(err) {
            reject({ error: "An unknown application error occurred" });
        }
    })
}