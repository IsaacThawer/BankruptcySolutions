const dns = require('dns');// importing dns module for email vrification
require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const multer = require('multer');
const cognito = new AWS.CognitoIdentityServiceProvider();


const { UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const app = express();
const port = 8000;
const imgStorage = multer.diskStorage({
    destination: './admin/content/images',
    filename: function (req, file, cb) {
        const newName = req.params.fileName;
        cb(null, newName);
    }
});
const upload = multer({ storage: imgStorage });

//**************remove these after testing */
// Check if AWS credentials are loaded
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "Loaded" : "Not Found");
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "Loaded" : "Not Found");
console.log("AWS_REGION:", process.env.AWS_REGION ? process.env.AWS_REGION : "Not Found");
//******************************************** */



// Initialize the AWS DynamoDB client with region and credentials
const client = new DynamoDBClient({
    // Set the AWS region from environment variables
    region: process.env.AWS_REGION,

    // Check if AWS credentials are available in the environment variables
    credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            // Use the provided AWS access key and secret key
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
        : undefined // If credentials are not set, allow AWS SDK to use default credentials (e.g., IAM roles, AWS CLI)
});

const docClient = DynamoDBDocumentClient.from(client);

// Helper function to generate the secret hash
function generateSecretHash(username, clientId, clientSecret) {
    return crypto
      .createHmac('sha256', clientSecret)
      .update(username + clientId)
      .digest('base64');
  }
 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));;
app.use('/admin', express.static(path.join(__dirname, 'admin'))); // when implementing the login auth this might interfere

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

// GET endpoint: Read JSON file and send the "text" property
app.get('/admin/content/:filename', (req, res) => {
    const filepath = path.join(__dirname, 'admin', 'content', req.params.filename);
    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading file: ' + filepath);
        }
        try {
            const jsonData = JSON.parse(data);
            res.send(jsonData.text || ""); // Return the text content
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            return res.status(500).send('Error parsing JSON file: ' + filepath);
        } 
    });
});

// POST endpoint: Write new text into a JSON file (as { "text": newText })
app.post('/admin/content/:filename', (req, res) => {
    const filepath = path.join(__dirname, 'admin', 'content', req.params.filename);
    const newText = req.body.text;
    // Create a JSON object with the updated text
    const jsonContent = JSON.stringify({ text: newText }, null, 2); // print JSON with 2 spaces
    fs.writeFile(filepath, jsonContent, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error writing file ' + req.params.filename);
        } 
        res.send('File ' + req.params.filename + ' saved successfully!');

    });
});

app.post('/upload/image/:fileName', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No files were uploaded.');
    }
    console.log('File uploaded successfully: ' + req.file.originalname);
    res.send(`File uploaded successfully: ${req.file.originalname}`);
});

app.get('/images/:fileName', (req, res) => {
    const filePath = path.join(__dirname, 'admin', 'content', 'images', req.params.fileName);

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Image not found');
    }
});

// This endpoint performs a simple check to see if the email contains "@" and "."
// Replace this logic with a proper verification service in production.
app.get('/verify-email', async (req, res) => {
    const email = req.query.email;
    if (!email) {
        return res.json({ valid: false });
    }

    // Basic email syntax check (not bulletproof, but better than just "@" and ".")
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.json({ valid: false });
    }

    // Extract domain
    const domain = email.split('@')[1];
    try {
        // Attempt to resolve MX records for the domain
        const addresses = await dns.promises.resolveMx(domain);
        // If no MX records found, domain is likely invalid
        if (!addresses || addresses.length === 0) {
            return res.json({ valid: false });
        }
        // If we get here, domain has MX records => domain is valid
        return res.json({ valid: true });
    } catch (error) {
        console.error("DNS lookup error:", error);
        // DNS query failed => domain likely invalid or unreachable
        return res.json({ valid: false });
    }
});
    

// endpoint for form submission to DynamoDB
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
            status: 'new',
            flagged: false
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

// Handles login from AWS Cognito
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const clientId = process.env.COGNITO_CLIENT_ID;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;
    const secretHash = generateSecretHash(username, clientId, clientSecret);

    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
            SECRET_HASH: secretHash
        }
    };

    cognito.initiateAuth(params, (err, data) => {
        if (err) {
            console.error("Authentication error:", err);
            return res.status(400).json({ error: err.message });
        }
        res.json(data);
    });
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

/* GET /api/clients endpoint to fetch all clients */
app.get('/api/clients', async (req, res) => {
    console.log("Fetching all clients from DynamoDB (merged endpoint)...");
    
    const params = { TableName: process.env.TABLE_NAME || 'clientSubmissions'};

    try {
        const data = await docClient.send(new ScanCommand(params));
        console.log("Data retrieved successfully:", data.Items);
        res.json(data.Items);
    } catch (error) {
        console.error("Error fetching data from DynamoDB:", error);
        res.status(500).json({ error: "Could not fetch data" });
    }
});

// Get the Cognito Users from the DynamoDB Table
app.get('/api/users', async (req, res) => {
    const params = {
      TableName: process.env.USERS_TABLE_NAME   
    };
  
    try {
      const data = await docClient.send(new ScanCommand(params));
      res.json({ success: true, users: data.Items });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

/*POST /api/clients/notes endpoint to update follow-up notes using submissionId as the primary key */
app.post('/api/clients/notes', async (req, res) => {
    const { submissionId, notes } = req.body;
    if (!submissionId || notes === undefined) {
        return res.status(400).json({ error: "submissionId and notes are required" });
    }

    console.log(`Updating follow-up notes for submissionId: ${submissionId}`);

    const params = {
        TableName: process.env.TABLE_NAME,
        Key: { submissionId: submissionId }, // Use submissionId as the key
        UpdateExpression: "SET followUpNotes = :notes",
        ExpressionAttributeValues: {
            ":notes": notes
        },
        ReturnValues: "UPDATED_NEW"
    };

    try {
        const result = await docClient.send(new UpdateCommand(params));
        console.log("Notes updated successfully:", result);
        res.json({ success: true, message: "Notes updated successfully", result });
    } catch (error) {
        console.error("Error updating notes in DynamoDB:", error);
        res.status(500).json({ error: "Failed to update notes", details: error });
    }
});

/* POST /api/clients/flag to update flagged status using submissionId as the primary key */
app.post('/api/clients/flag', async (req, res) => {
    const { submissionId, flagged } = req.body;
    if (!submissionId || flagged === undefined) {
        return res.status(400).json({ error: "submissionId and flagged are required" });
    }
    console.log(`Updating flagged status for submissionId: ${submissionId} to flagged: ${flagged}`);
    const params = {
        TableName: process.env.TABLE_NAME || 'ClientSubmissions',
        Key: { submissionId: submissionId },
        UpdateExpression: "SET flagged = :flagged",
        ExpressionAttributeValues: {
            ":flagged": flagged
        },
        ReturnValues: "UPDATED_NEW"
    };
    try {
        const result = await docClient.send(new UpdateCommand(params));
        console.log("Flag updated successfully:", result);
        res.json({ success: true, message: "Flag updated successfully", result });
    } catch (error) {
        console.error("Error updating flag in DynamoDB:", error);
        res.status(500).json({ error: "Failed to update flag", details: error });
    }
});

/* DELETE /api/clients endpoint updated to use submissionId as primary key */
app.delete('/api/clients', async (req, res) => {
    const { submissionId } = req.body;
    if (!submissionId) {
        return res.status(400).json({ error: "submissionId is required" });
    }

    console.log(`Deleting client with submissionId: ${submissionId}`);

    const params = {
        TableName: process.env.TABLE_NAME,
        Key: { submissionId: submissionId }
    };

    try {
        const result = await docClient.send(new DeleteCommand(params));
        console.log("Client deleted successfully.", result);
        res.json({ success: true, message: "Client deleted successfully" });
    } catch (error) {
        console.error("Error deleting client from DynamoDB:", error);
        res.status(500).json({ error: "Failed to delete client", details: error });
    }
});


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});