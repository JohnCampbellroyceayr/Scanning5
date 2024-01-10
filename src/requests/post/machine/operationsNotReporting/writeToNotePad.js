import client from '../../../../databases/webservices.js';

import xml2js from 'xml2js';
var parser = new xml2js.Parser();

export default function updateNotePadWorkOrderLine(departmentCode, resourceCode, workOrder, newLine) {
    console.log("hello");
    return new Promise( async (resolve, reject) => {
        const args = await createArgs(departmentCode, resourceCode, workOrder, newLine);
        console.log(JSON.stringify(args));
        client.UpdateNotePad(args, function(err, result) {
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
                ...noteRecords
            }
        };
        return args;
    }
    catch(error) {
        console.log(error);
    }

    return;

}

function getNoteRecords(lastPageNotes, newLineText) {
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

function getLastPageNotes(notesArr) {
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
                console.log("Error");
                reject(err.body);
            } else {
                const response = result.CMS_ServiceResponse_GetNotePad;
                const notePadTextArr = response.NoteRecords.NoteRecord;
                resolve(notePadTextArr);
            }
        });
    });
}

// updateNotePadWorkOrderLine('WD', 'LAS01', '067857', "Hello");

//----Testing



function assertEquals(expected, result) {
    if(expected == result) {
        console.log("Test Passed");
    }
    else {
        console.log("Test Failed, expected")
        console.log(expected);
        console.log("Got");
        console.log(result);
    }
}

const testPage = [
    {
      PageNumber: '1',
      LineNumber: '1',
      NoteText: '<Run><2023-09-22><1:52:13 PM><ML DESLG><02410>'
    },
    {
      PageNumber: '1',
      LineNumber: '2',
      NoteText: '<Good Pieces><2023-09-22><1:52:54 PM><ML DESLG><02410><1>'
    },
    {
      PageNumber: '1',
      LineNumber: '3',
      NoteText: '<Good Pieces><2023-09-22><2:05:40 PM><ML DESLG><02410><1>'
    },
    {
      PageNumber: '1',
      LineNumber: '4',
      NoteText: '<Run><2023-10-06><11:21:49 AM><WD LAS01><02410>'
    },
    {
      PageNumber: '1',
      LineNumber: '5',
      NoteText: '<Good Pieces><2023-10-06><11:30:41 AM><WD LAS01><02410><1>'
    },
    {
      PageNumber: '1',
      LineNumber: '6',
      NoteText: '<Good Pieces><2023-10-06><11:58:01 AM><WD LAS01><02410><0>'
    },
    {
      PageNumber: '1',
      LineNumber: '7',
      NoteText: '<Good Pieces><2023-10-06><11:59:28 AM><WD LAS01><02410><1>'
    },
    {
      PageNumber: '1',
      LineNumber: '8',
      NoteText: '<Good Pieces><2023-10-06><12:00:12 PM><WD LAS01><02410><1>'
    },
    {
      PageNumber: '1',
      LineNumber: '9',
      NoteText: '<Good Pieces><2023-09-22><1:52:54 PM><ML DESLG><02410><1>'
    },
    {
      PageNumber: '1',
      LineNumber: '10',
      NoteText: '<Run><2023-10-11><1:45:27 PM><ML DESLG><02410>'
    },
    {
      PageNumber: '1',
      LineNumber: '11',
      NoteText: '<Setup><2023-10-11><1:54:51 PM><ML DESLG><02410>'
    },
    {
      PageNumber: '1',
      LineNumber: '12',
      NoteText: '<Run><2023-10-11><3:09:06 PM><ML DESLG><02410>'
    },
    {
      PageNumber: '1',
      LineNumber: '13',
      NoteText: '<Setup><2023-10-12><6:38:07 AM><ML DESLG><02410>'
    },
    {
      PageNumber: '1',
      LineNumber: '14',
      NoteText: '<Setup><2023-10-30><6:55:57 AM><ML DESLG><02410>'
    },
    {
      PageNumber: '1',
      LineNumber: '15',
      NoteText: '<Setup><2023-10-30><7:41:00 AM><ML DESLG><02410>'
    }
]

function test_getLastPageNotes() {
    assertEquals(1, getLastPageNotes(testPage)[0].LineNumber);
    assertEquals(2, getLastPageNotes(testPage)[0].PageNumber);
}

function test_getNoteRecords() {
    const test1 = getNoteRecords(getLastPageNotes(testPage), "Hello");
    // const test2 = getNoteRecords(getLastPageNotes(testPage), "Hello");
    assertEquals(2, test1["NoteRecord"][test1["NoteRecord"].length - 1].PageNumber)
    assertEquals(1, test1["NoteRecord"][test1["NoteRecord"].length - 1].LineNumber)
    // assertEquals(10, test1["NoteRecord"][test1.length - 1].LineNumber)
}

test_getNoteRecords()