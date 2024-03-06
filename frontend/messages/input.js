function displayInput(title, btnFunction, btnText) {
    openInput(title, btnFunction, btnText);
}

function openInput(title, btnFunction, btnText) {
    document.querySelector("#backscreen").style.display = "block";
    document.querySelector("#input").style.display = "block";
    document.querySelector("#input h1").innerHTML = title;

    document.querySelector("#input button").onclick = btnFunction;
    document.querySelector("#input button").innerHTML = btnText;  
}