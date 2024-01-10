import client from '../../../../databases/webservices.js';
import xml2js from 'xml2js';
var parser = new xml2js.Parser();

export default function run(deviceID, departmentCode, resourceCode, workOrder, seqNumber) {
    return new Promise((resolve, reject) => {
        const args = {
            "Service_ReportProdSetScheduleToRunJob": {
                "RequestID": "Run",
                "CMSDataBase": "ROYCEAYR",
                "ServPlntCod": "DFT",
                "DeviceID": deviceID,
                "DepartmentCode": departmentCode,
                "ResourceCode": resourceCode,
                "JobNumber": workOrder,
                "SequenceNumber": seqNumber
            }
        };
    
        client.ReportProdSetScheduleToRunJob(args, function(err, result) {
            if (err) {
                parser.parseString(err.body, (err, obj) => {
                    reject({
                        error: obj["soapenv:Envelope"]["soapenv:Body"][0]["soapenv:Fault"][0].detail[0]["ns1:ServerFaultResponse"][0]["ns1:CMS_ServiceResponse"][0].Messages[0].Message[0].MessageText[0]
                    }); 
                })
            } else {
                resolve({
                    result: result   
                });
            }
        });
    });
}