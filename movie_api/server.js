const http = require('http');
const fs = require('fs');
const url = require('url');

// Create server
const server = http.createServer((request, response) => {
  const reqUrl = url.parse(request.url, true);

  // Log request URL and timestamp to log.txt
  const logEntry = `${new Date().toISOString()} - Requested URL: ${reqUrl.pathname}\n`;
  fs.appendFile('log.txt', logEntry, err => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });

  // Serve the appropriate HTML file
  if (reqUrl.pathname === 'documentation.html') {
    fs.readFile('documentation.html', (err, data) => {
      if (err) {
        response.writeHead(404);
        response.end('Documentation not found');
      } else {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(data);
      }
    });
  } else {
    fs.readFile('index.html', (err, data) => {
      if (err) {
        response.writeHead(404);
        response.end('Index not found');
      } else {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(data);
      }
    });
  }
});

// Server listens on port 8080
server.listen(8080, () => {
  console.log('Server is running on port 8080');
});
