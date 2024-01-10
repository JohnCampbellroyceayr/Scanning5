import client from '../../../../databases/webservices.js';
import updateNotePadWorkOrderLine from './writeToNotePad.js';
import xml2js from 'xml2js';
var parser = new xml2js.Parser();

export default async function run(deviceID, departmentCode, resourceCode, workOrder, seqNumber) {
    const result = await updateNotePadWorkOrderLine(departmentCode, resourceCode, workOrder, "Nice " + seqNumber);
    console.log(result);
    return {
        error: "Hello"
    };

}