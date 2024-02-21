import https from 'https';
import fs from 'fs';
import express from 'express';
const app = express();

// Use body-parser middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const options = {
    key: fs.readFileSync('./keys/key.pem'),
    cert: fs.readFileSync('./keys/cert.pem')
};

https.createServer(options, app).listen(443, () => {
  console.log('HTTPS Server running on port  443');
});


app.get('/', (req, res) => {
    res.send('Hello, secure world!');
});

app.get('/hello/:id', (req, res) => {
    console.log(req.params);
    res.send(req.id);
});