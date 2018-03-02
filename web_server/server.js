const http = require('http');
const https = require('https');
const app = require('./app');
const fs = require('fs');

const port = process.env.PORT || 3000;
// To get a self signed cert
// openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 1
var sslOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
    passphrase: 'e77e3fb5'
};
const server = https.createServer(sslOptions, app);
// const server = https.createServer(app);

server.listen(port);