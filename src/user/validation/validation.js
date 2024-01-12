export default function validParams(reqBody, type) {
    switch(type) {
        case "employeeLogin":
            return checkParams(reqBody, ["id"]);
        case "employeeLogout":
            return checkParams(reqBody, ["id"]);
        case "setMachine":
            return checkParams(reqBody, ["dept", "resource", "employee"]);
        case "getUser":
            return checkParams(reqBody, ["id"]);
        case "checkJob":
            return checkParams(reqBody, ["dept", "resource", "job"]);
        case "checkCurrentJob":
            return checkParams(reqBody, ["dept", "resource", "job", "seq"]);
        case "getMachineJobs":
            return checkParams(reqBody, ["dept", "resource"]);
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
            return checkParams(reqBody, ["job", "dept", "resource", "employee", "quantity", "code"]);
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