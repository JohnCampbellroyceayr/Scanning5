import client from '../../../databases/webservices.js';
import xml2js from 'xml2js';
var parser = new xml2js.Parser();
 
export default function scrap(deviceID, departmentCode, resourceCode, workOrder, seqNumber, employee, quantity, code) {
    return new Promise((resolve, reject) => {
        const args = {
            "Service_ReportProdScrap": {
                "RequestID": "reportScrap",
                "CMSDataBase": "ROYCEAYR",
                "ServPlntCod": "DFT",
                "CustomizedLibrary": "ROYCEAYR",
                "DeviceID": deviceID,
                "DepartmentCode": departmentCode,
                "ResourceCode": resourceCode,
                "JobNumber": workOrder,
                "SequenceNumber": seqNumber,
                "EmployeeTag": employee,
                "ScrapQuantity": quantity,
                "ReasonCode": code
            }
        };

        client.ReportProdScrap(args, function(err, result) {
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