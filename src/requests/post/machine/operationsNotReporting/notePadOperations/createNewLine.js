export default function createNewLine(operation, seq, dept, resource, employee, numberOfPieces = null, scrapReasonCode = null) {
    let line = '';
    const dateObj = getCurrentDateTime();
    line += formatSymbolsAroundString(operation);
    line += formatSymbolsAroundString(seq);
    line += formatSymbolsAroundString(dateObj.date);
    line += formatSymbolsAroundString(dateObj.time);
    line += formatSymbolsAroundString(dept + " " + resource);
    line += formatSymbolsAroundString(employee);
    if(numberOfPieces !== null) {
        line += formatSymbolsAroundString(numberOfPieces);
    }
    if(scrapReasonCode !== null) {
        line += formatSymbolsAroundString(scrapReasonCode);
    }
    return line;
}

function formatSymbolsAroundString(string) {
    return "<" + string + ">";
}

function getCurrentDateTime() {
    let currentDateTime = new Date();
    let estDateTimeString = currentDateTime.toLocaleString("en-US", { timeZone: "America/New_York" });
    let estDateTime = new Date(estDateTimeString);

    let year = estDateTime.getFullYear();
    let month = estDateTime.getMonth() + 1; // getMonth() is zero-based
    let day = estDateTime.getDate();
    let hours = estDateTime.getHours();
    let minutes = estDateTime.getMinutes();
    let seconds = estDateTime.getSeconds();

    return formatDateTime(year, month, day, hours, minutes, seconds)
}

function formatDateTime(year, month, day, hours, minutes, seconds) {
    let period = 'AM';
    if (hours >= 12) {
        period = 'PM';
    }
    if (hours > 12) {
        hours -= 12;
    }
    let dateStr = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    let timeStr = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds} ${period}`;
    return { date: dateStr, time: timeStr };
}
 