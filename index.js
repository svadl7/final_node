const http = require("http");
const path = require("path");
const fs = require("fs");
const client = require('mongodb').MongoClient;
const url = require("url");
const mongoconnection = require('./verify/connection.js');
const mongo_client = new client(mongoconnection.connectionurl);

const server = http.createServer(async (req, res) => {
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
            if (err) throw err;
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
    } else if (req.url==='/api') {
        const headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
            "Content-Type": 'application/json'
        };
        // Wrap the async function in parentheses and call it with (req, res)
        (async (req, res) => {
            try {
                await mongo_client.connect();
                const db = mongo_client.db(mongoconnection.database);
                const collection = db.collection(mongoconnection.collection);
                if (req.method === 'GET') {
                    var docs_json = await collection.find({}).toArray();
                    docs_json = JSON.stringify(docs_json, null, 2);
                    res.writeHead(200, headers);
                    res.end(docs_json);
                    console.log(docs_json);
                } else {
                    res.writeHead(405, { 'Content-Type': 'text/plain' });
                    res.end('Method Not supported');
                }
            } catch (err) {
                console.error(err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('server failed to handle the request');
            }
        })(req, res);
    } else {
        res.end("<h1> 404 nothing is here</h1>");
    }
});

const PORT = 2306;
server.listen(PORT, () => console.log(`Great our server is running on port ${PORT} `));
