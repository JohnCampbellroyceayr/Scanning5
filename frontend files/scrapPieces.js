async function scrapPieces() {
    if(!checkEmployee()) return ;
    if(!checkMachine()) return ;
    const obj = await getScrapPieces();
    const url = 'http://192.168.0.19:2002/api/scrapPieces';

    const result = await post(url, obj);
    displayMessage(result);
}