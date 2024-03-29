function displayMessage(messageObj, btnFunction = "default", text = "OK") {
    const title = getTitle(messageObj);
    if(btnFunction == "default") {
        openMessage(title, messageObj.message, () => closeMessage(), text);
    }
    else {
        openMessage(title, messageObj.message, btnFunction, text);
    }
}

function openMessage(title, message, btnFunction, btnText) {
    document.querySelector("#backscreen").style.display = "block";
    document.querySelector("#message").style.display = "block";
    document.querySelector("#message h1").innerHTML = title;
    document.querySelector("#message p").innerHTML = message;
    document.querySelector("#message button").onclick = btnFunction;
    document.querySelector("#message button").innerHTML = btnText;  
}

function closeMessage() {
    document.querySelector("#backscreen").style.display = "none";
    document.querySelector("#message").style.display = "none";
    document.querySelector("#input").style.display = "none";
}

function getTitle(messageObj) {
    if(messageObj.type == "confirm") {
        return "Confirm";
    }
    if(messageObj.success == true) {
        return "Operation Successful";
    }
    else if(messageObj.error == true) {
        return "An Error Occurred";
    }
    else {
        return "Invalid Info";
    }
    
}