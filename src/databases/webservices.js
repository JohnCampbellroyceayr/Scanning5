import soap from 'soap';

const wsdlUrl = 'http://192.168.0.200:8080/iVPWebServices/services/ivpwsShopFloor?wsdl';

const username = 'JCAMP';
const password = 'JCAMP';

function createConnection() {
    return new Promise((resolve) => {
        soap.createClient(wsdlUrl, function(err, client) {
            if (err) {
                console.error(err);
            } else {
                var wsSecurity = new soap.WSSecurity(username, password);
                client.setSecurity(wsSecurity);
                console.log("Connected To web services");
                resolve(client);
            }
        });
    });
}

const client = await createConnection();

export default client;

