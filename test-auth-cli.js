const https = require('https');

const data = JSON.stringify({
    email: "mastrianni11@gmail.com",
    password: "testpassword",
    returnSecureToken: true
});

const options = {
    hostname: 'identitytoolkit.googleapis.com',
    port: 443,
    path: '/v1/accounts:signInWithPassword?key=AIzaSyCT3m23nhRzZLFRdo4nLQcSWDIlHj4CM2Y',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => console.log('Response body:', body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
