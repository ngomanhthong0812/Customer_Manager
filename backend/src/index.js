require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('node:http');
const initAPIRoutes = require("./router/api");
const setupSocket = require('./config/setupSocket');

const app = express();
const server = createServer(app);
const port = process.env.PORT || 8888;

// Middleware xử lý JSON
app.use(express.json());
// Middleware xử lý URL-encoded
app.use(express.urlencoded({ extended: true }));
app.use(cors());

initAPIRoutes(app);

app.use((req, res) => {
    return res.send("404 NOT FOUND");
});

setupSocket(server);

server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
