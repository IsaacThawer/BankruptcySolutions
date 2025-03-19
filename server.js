const dns = require('dns'); // importing dns module for email verification
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
const session = require('express-session');//import express-session

const app = express();
const port = 8000;

// Multer configuration
const imgStorage = multer.diskStorage({
  destination: './public/images',
  filename: function (req, file, cb) {
    const newName = req.params.fileName;
    cb(null, newName);
  }
});
const imgStorageAdmin = multer.diskStorage({
    destination: './admin/content/images',
    filename: function (req, file, cb) {
        const newName = req.params.fileName;
        cb(null, newName);
    }
});
const upload = multer({ storage: imgStorage });
const uploadAdmin = multer({ storage: imgStorageAdmin });


// Initialize the AWS DynamoDB client with region and credentials
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    : undefined
});
const docClient = DynamoDBDocumentClient.from(client);

// Helper function to generate the secret hash for Cognito
function generateSecretHash(username, clientId, clientSecret) {
  return crypto
    .createHmac('sha256', clientSecret)
    .update(username + clientId)
    .digest('base64');
}

//Use express-session to store a "loggedIn" flag*
app.use(session({
  secret: 'CHANGE_THIS_TO_A_SECURE_RANDOM_STRING', // use a strong secret in production
  resave: false,
  saveUninitialized: false
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve public assets normally (e.g. /index.html)
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Disable caching for all /admin routes.*
 * This will set HTTP headers to prevent browser caching.
 */
app.use('/admin', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1.
  res.setHeader('Pragma', 'no-cache'); // HTTP 1.0.
  res.setHeader('Expires', '0'); // Proxies.
  next();
});

/**
 * /admin Access Control Middleware*
 *  - If the request is for a non-HTML asset (like CSS, JS, images), allow it.
 *  - If the request is for /admin/login.html (the custom login page), allow it.
 *  - Otherwise, if the session shows the user is logged in, allow it.
 *  - Else, redirect to /admin/login.html.
 */
app.use('/admin', (req, res, next) => {
  // Allow requests for non-HTML assets (e.g., .css, .js, .png, etc.)
  if (path.extname(req.path) && path.extname(req.path) !== '.html') {
    return next();
  }
  // Allow the login page unconditionally
  if (req.path === '/login.html') {
    return next();
  }
  // Allow if user is logged in
  if (req.session && req.session.loggedIn) {
    return next();
  }
  // Otherwise, redirect to the custom login page
  return res.redirect('/admin/login.html');
});

// Serve static files from the admin folder (including custom login page, dashboard, etc.)
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Root route http://localhost:8000/ will show index.html. Main landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET endpoint: Read JSON file from /admin/content and send the "text" property
app.get('/admin/content/:filename', (req, res) => {
  const filepath = path.join(__dirname, 'admin', 'content', req.params.filename);
  fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading file: ' + filepath);
    }
    try {
      const jsonData = JSON.parse(data);
       // For reviews JSON files, return the entire object
          if (req.params.filename === 'google-reviews.json' || req.params.filename === 'yelp-reviews.json') {
              res.json(jsonData);
          } else {
              // For normal content files, just return the text property
              res.send(jsonData.text || ""); // This part was in the original try attempt
          }
      } catch (parseError) { //catching the parse error
          console.error("JSON parse error:", parseError);
          return res.status(500).send('Error parsing JSON file: ' + filepath);
      }
  });
});

// POST endpoint: Write text to a JSON file in /admin/content (as { "text": newText })
app.post('/admin/content/:filename', (req, res) => {
  const filepath = path.join(__dirname, 'admin', 'content', req.params.filename);

  // Check if it's a reviews JSON file
  if (req.params.filename === 'google-reviews.json' || req.params.filename === 'yelp-reviews.json') {
      // For reviews, we expect the full JSON object in the body
      const jsonContent = JSON.stringify(req.body, null, 2);
      fs.writeFile(filepath, jsonContent, (err) => {
          if (err) {
              console.error(err);
              return res.status(500).send('Error writing file ' + req.params.filename);
          }
          res.send('File ' + req.params.filename + ' saved successfully!');
      });
  } else {
      // For regular content files with text property
      const jsonContent = JSON.stringify({ text: req.body.text }, null, 2);
      fs.writeFile(filepath, jsonContent, (err) => { // This was the original portion before merge conflict
          if (err) {
              console.error(err);
              return res.status(500).send('Error writing file ' + req.params.filename);
          }
          res.send('File ' + req.params.filename + ' saved successfully!');
      });
  }
});

    
// Image upload for uploading an image file
app.post('/upload/image/:fileName', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }
  console.log('File uploaded successfully: ' + req.file.originalname);
  res.send(`File uploaded successfully: ${req.file.originalname}`);
});

// Image upload for uploading an image file to the admin folder
app.post('/admin/upload/image/:fileName', uploadAdmin.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No files were uploaded.');
    }
    console.log('File uploaded successfully: ' + req.file.originalname);
    res.send(`File uploaded successfully: ${req.file.originalname}`);
});

// Serve images from /public/images
app.get('/images/:fileName', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'images', req.params.fileName);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Image not found');
  }
});

// Serve images from /admin/content/images
app.get('/admin/images/:fileName', (req, res) => {
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
    res.json({ success: true, message: 'Submission successful' });
  } catch (error) {
    console.error('DynamoDB Error:', error);
    res.status(500).json({ success: false, error: 'Failed to save submission' });
  }
});

// Handles login from AWS Cognito. login sets session.loggedIn = true upon success 
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
    // Mark the session as logged in.login sets true upon success
    req.session.loggedIn = true;
    res.json(data);
  });
});

// Logout Route 
// When a user selects /logout, their session is destroyed and they are redirected to the login page.
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error logging out.");
    }
    res.redirect('/admin/login.html');
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

//* DELETE /api/clients endpoint updated to use submissionId as primary key */
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

app.get('/proxy-google-reviews', async (req, res) => {
  // Hardcoded Google reviews
  const googleReviews = [
    "Eric is a great attorney who helped me with my Chapter 7 bankruptcy. He was able to get back to us almost immediately with any questions we had all throughout the process.",
    "Eric was a fantastic attorney for my Chapter 7 bankruptcy. He was very thorough with explaining the process, and is very professional. He was able to answer all questions and concerns quickly.",
    "Eric is an amazing bankruptcy attorney. Very knowledgeable, compassionate, and patient. He helped me through the whole process of filing chapter 7 and it was so much easier than I expected.",
    "Eric is very professional and has made this process so easy to get through. I highly recommend Eric to everyone. Thank you Eric you are the best!",
    "Eric is thorough, honest, and friendly. I felt comfortable with him. I would definitely recommend him to anyone."
  ];
  
  // Get a random review for variety
  const randomIndex = Math.floor(Math.random() * googleReviews.length);
  
  res.json({
    rating: '5.0',
    reviewCount: '5',
    reviewText: googleReviews[randomIndex],
    allReviews: googleReviews
  });
});

app.get('/proxy-yelp-reviews', async (req, res) => {
  // Hardcoded Yelp reviews
  const yelpReviews = [
    "Eric did a fantastic job with my bankruptcy. I was a bit apprehensive about the whole process, but he guided me through every step with professionalism and compassion.",
    "Eric was extremely helpful during my bankruptcy process. He explained everything clearly and made what could have been a stressful situation much easier to handle.",
    "I can't recommend Eric Schwab enough. His expertise in bankruptcy law is outstanding, and he guided me through the entire process with compassion and professionalism.",
    "Working with Eric Schwab was the best decision I made during a difficult financial time. He's knowledgeable, responsive, and truly cares about his clients.",
    "Five stars for Eric Schwab! He helped me navigate bankruptcy with ease, answering all my questions promptly and making me feel at ease throughout the process.",
    "Eric's knowledge of bankruptcy law is impressive. He made sure I understood all my options and helped me make the best decision for my financial future.",
    "Eric was straightforward and honest throughout the entire process. He explained everything in terms I could understand and was always available when I had questions.",
    "I was nervous about filing for bankruptcy, but Eric made the process stress-free. He is professional, knowledgeable, and genuinely cares about his clients."
  ];
  
  // Get a random review for variety
  const randomIndex = Math.floor(Math.random() * yelpReviews.length);
  
  res.json({
    rating: '5.0',
    reviewCount: '8',
    reviewText: yelpReviews[randomIndex],
    allReviews: yelpReviews
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});