import updateNotePadWorkOrderLine from './notePadOperations/writeToNotePad.js';
import createNewLine from './notePadOperations/createNewLine.js';

export default function setup(employee, departmentCode, resourceCode, workOrder, seqNumber) {
    return new Promise(async (resolve, reject) => {
        try {
            const newLine = createNewLine("Setup", seqNumber, departmentCode, resourceCode, employee);
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