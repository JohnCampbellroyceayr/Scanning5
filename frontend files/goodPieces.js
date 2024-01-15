async function goodPieces() {
    if(!checkEmployee()) return ;
    if(!checkMachine()) return ;
    const jobsScanGoodPiecesObj = await getGoodPiecesJobs([]);
    try {
        if(jobsScanGoodPiecesObj.quantities.length !== 0) {
            const url = 'http://192.168.0.19:2002/api/goodPieces';
            const result = await post(url, jobsScanGoodPiecesObj);
            displayMessage(result);
        }
    }
    catch(error) {
        
    }
}