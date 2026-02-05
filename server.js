const http = require('http');
const fs = require('fs');
const path = require('path');

const file = fs.readFileSync(path.join(__dirname, 'index.html'));

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(file);
});

server.listen(8081, '0.0.0.0', () => {
  console.log('Server running on port 8081');
});
