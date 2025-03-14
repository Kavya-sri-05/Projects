const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const API_KEY = "4cf1dca2b914356c25b2aac52b7df53f"; // Replace with your OpenWeatherMap API Key
const PORT = 3000;

// Serve static files (HTML, CSS, JS)
const serveStaticFile = (filePath, contentType, res) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
        } else {
            res.writeHead(200, { "Content-Type": contentType });
            res.end(data);
        }
    });
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (req.url === "/") {
        serveStaticFile(path.join(__dirname, "public", "index.html"), "text/html", res);
    } else if (req.url === "/style.css") {
        serveStaticFile(path.join(__dirname, "public", "style.css"), "text/css", res);
    } else if (req.url === "/script.js") {
        serveStaticFile(path.join(__dirname, "public", "script.js"), "text/javascript", res);
    } else if (parsedUrl.pathname === "/weather" && req.method === "GET") {
        const city = parsedUrl.query.city;

        if (!city) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "City is required" }));
            return;
        }

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;

        https.get(weatherUrl, (weatherRes) => {
            let data = '';

            weatherRes.on('data', (chunk) => {
                data += chunk;
            });

            weatherRes.on('end', () => {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(data);
            });

        }).on('error', () => {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Could not fetch weather data" }));
        });

    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
