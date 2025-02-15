const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
//const cors = require('cors');

// Initialize the DynamoDB client
const client = new DynamoDBClient({
    region: "us-east-2",
    credentials: {
        accessKeyId: "YOUR-ACCESS-KEY-ID",
        secretAccessKey: "YOUR-SECRET-ACCESS-KEY"
    }
});

const docClient = DynamoDBDocumentClient.from(client);
const app = express();
const port = 8000;

/*
app.use(cors({
    origin: 'http://localhost:8000' // Implemented to address the issue with the login page
}));
*/

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin'))); // when implementing the login auth this might interfere

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/admin/content/:filename', (req, res) => {
    const filepath = path.join(__dirname, 'admin', 'content', req.params.filename);

    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading file: ' + filepath);
        } else {
            res.send(data);
        }
    });
});

app.post('/admin/content/:filename', (req, res) => {
    const filepath = path.join(__dirname, 'admin', 'content', req.params.filename);
    const newText = req.body.text;

    fs.writeFile(filepath, newText, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error writing file ' + req.params.filename);
        } else {
            res.send('File ' + req.params.filename + ' saved successfully!');
        }
    });
});

// New endpoint for form submission to DynamoDB
app.post('/submit-form', async (req, res) => {
    const { firstname, lastname, email, phone, message } = req.body;
    
    // Validate input
    if (!firstname || !lastname || !email || !phone || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'All fields are required' 
        });
    }

    const params = {
        TableName: 'ClientSubmissions',
        Item: {
            submissionId: uuidv4(),
            firstName: firstname,
            lastName: lastname,
            email: email,
            phoneNumber: phone,
            message: message,
            submissionDate: new Date().toISOString(),
            status: 'new'
        }
    };

    try {
        await docClient.send(new PutCommand(params));
        res.json({ 
            success: true, 
            message: 'Submission successful' 
        });
    } catch (error) {
        console.error('DynamoDB Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to save submission' 
        });
    }
});

app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

function requireAuth(req, res, next) {
    if (req.query.auth !== 'true') {
        return res.send('Unauthorized access.');
    }
    next();
}

// Restrict access to dashboard.html
app.get('/admin/dashboard.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

// Handles login for later
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // dummy values will replace with real auth later
    if (username === 'admin' && password === 'password123') {
        res.redirect('/admin/dashboard.html?auth=true');
    } else {
        res.send('Invalid credentials!');
        console.log("ERROR with admin auth");
    }
});

// Test endpoint to verify DynamoDB connection
app.get('/test-db', async (req, res) => {
    try {
        const params = {
            TableName: 'ClientSubmissions',
            Limit: 1
        };
        const result = await docClient.send(new ScanCommand(params));
        res.json({ 
            success: true, 
            message: 'DynamoDB connection successful', 
            testResult: result 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log(__dirname);
});