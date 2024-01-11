import client from '../../../../../databases/webservices.js';

import xml2js from 'xml2js';
var parser = new xml2js.Parser();

export default function updateNotePadWorkOrderLine(departmentCode, resourceCode, workOrder, newLine) {
    return new Promise( async (resolve, reject) => {
        try {
            const args = await createArgs(departmentCode, resourceCode, workOrder, newLine);
            client.UpdateNotePad(args, function(err, result) {
                if (err) {
                    parser.parseString(err.body, (err, obj) => {
                        reject({
                            error: obj["soapenv:Envelope"]["soapenv:Body"][0]["soapenv:Fault"]
                        }); 
                    })
                } else {
                    resolve({
                        result: result
                    });
                }
            });
        }
        catch(error) {
            reject(error);
        }
    });
}

async function createArgs(departmentCode, resourceCode, workOrder, newLine) {
    try {
        const notes = await getExistingNotes(departmentCode, resourceCode, workOrder);
        const lastPageNotes = getLastPageNotes(notes);
        const noteRecords = getNoteRecords(lastPageNotes, newLine);
        const args = {
            "Service_UpdateNotePad": {
                "RequestID": "Run",
                "CMSDataBase": "ROYCEAYR",
                "ServPlntCod": "DFT",
                "DepartmentCode": departmentCode,
                "ResourceCode": resourceCode,
                "KeyValue": workOrder,
                "NoteType": "WorkOrder",
                "NoteRecords": noteRecords
            }
        };
        return args;
    }
    catch(error) {
        return new Error(error)
    }

}

function getNoteRecords(lastPageNotes, newLineText) {
    if(lastPageNotes.length == 0) {
        return {
            "NoteRecord": [
                { "PageNumber": '1', "LineNumber": '1', "NoteText": newLineText },
            ]
        }
    }
    else {
        const lastLine = lastPageNotes[lastPageNotes.length - 1];
        const lastLineIndexOnPage = 15;
        const lastPageNumber = lastLine.PageNumber;
        if(lastLine.LineNumber == lastLineIndexOnPage) {
            return {
                "NoteRecord": [
                    { "PageNumber": (parseInt(lastPageNumber) + 1).toString(), "LineNumber": '1', "NoteText": newLineText },
                ]
            }
        }
        else {
            return {
                "NoteRecord": [
                    ...lastPageNotes,
                    { "PageNumber": lastLine.PageNumber, "LineNumber": (parseInt(lastLine.LineNumber) + 1).toString(), "NoteText": newLineText },
                ]
            }
        }
    }
}



function getLastPageNotes(notesArr) {
    if(notesArr.length === 0) {
        return [];
    }
    else if(notesArr.PageNumber !== undefined && notesArr.LineNumber !== undefined && notesArr.NoteText !== undefined) {
        return [
            notesArr
        ];
    }
    let lastPage = notesArr[notesArr.length - 1].PageNumber;
    let lastPageNotes = [];
    for (let i = 0; i < notesArr.length; i++) {
        const noteObj = notesArr[i];
        if(noteObj.PageNumber == lastPage) {
            lastPageNotes.push(noteObj);
        }
    }
    return lastPageNotes;
}

function getExistingNotes(dept, res, workOrder) {
    return new Promise((resolve, reject) => {
        const args = {
            "Service_GetNotePad": {
                "RequestID": "UpdateNote",
                "CMSDataBase": "ROYCEAYR",
                "ServPlntCod": "DFT",
                "DepartmentCode": dept,
                "ResourceCode": res,
                "NoteType": "WorkOrder",
                "WorkOrder": workOrder,
            }
        };
        client.GetNotePad(args, function(err, result) {
            if (err) {
                reject(err.body);
            } else {
                try {
                    const response = result.CMS_ServiceResponse_GetNotePad;
                    const notePadTextArr = response.NoteRecords.NoteRecord;
                    resolve(notePadTextArr);
                }
                catch(error) {
                    resolve([]);
                }
            }
        });
    });
}