export default function validParams(reqBody, type) {
    switch(type) {
        case "employeeLogin":
            return checkParams(reqBody, ["id"]);
        case "setMachine":
            return checkParams(reqBody, ["dept", "resource", "employee"]);
        case "checkJob":
            return checkParams(reqBody, ["dept", "resource", "job"]);
        case "setup":
            return checkParams(reqBody, ["jobs", "dept", "resource", "employee"]);
        case "run":
            return checkParams(reqBody, ["jobs", "dept", "resource", "employee"]);
        case "pause":
            return checkParams(reqBody, ["dept", "resource"]);
        case "resume":
            return checkParams(reqBody, ["dept", "resource"]);
        case "goodPieces":
            return checkParams(reqBody, ["jobs", "dept", "resource", "employee", "quantities"]);
        case "scrapPieces":
            return checkParams(reqBody, ["jobs", "dept", "resource", "employee", "quantity", "code"]);
    }
}

function checkParams(obj, propsArr) {
    for (let i = 0; i < propsArr.length; i++) {
        if(!obj.hasOwnProperty(propsArr[i]) || obj[propsArr[i]] == undefined) {
            return false;
        }        
    }
    return true;
}