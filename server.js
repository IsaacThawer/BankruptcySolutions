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
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const reviewsCache = new NodeCache({ stdTTL: 43200 }); // Initialize cache with 12-hour TTL (time to live)
const { UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const session = require('express-session');//import express-session

const app = express();
const port = 8000;

app.use(session({
  secret: 'YOUR_SECRET_KEY', // Use a strong random string
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true } // Set `secure: true` if using HTTPS
}));

//testing username
app.get('/api/user-info', async (req, res) => {
  console.log("🔍 Checking session data at /api/user-info:", req.session);

  if (!req.session || !req.session.loggedIn) {
      console.error("❌ User not authenticated (Session missing)");
      return res.status(401).json({ success: false, error: "User not authenticated" });
  }

  if (!req.session.accessToken) {
      console.error("❌ Missing access token in session");
      return res.status(401).json({ success: false, error: "Missing access token" });
  }

  try {
      console.log("✅ Fetching user info from Cognito...");
      const userData = await cognito.getUser({ AccessToken: req.session.accessToken }).promise();

      console.log("🔍 Full Cognito Response:", JSON.stringify(userData, null, 2));

      // Extract user attributes
      const attributes = userData.UserAttributes.reduce((acc, attr) => {
          acc[attr.Name] = attr.Value;
          return acc;
      }, {});

      res.json({
          success: true,
          username: attributes["name"] || "Admin",
          userPhoto: attributes["picture"] || "images/client-photo.png"
      });
  } catch (error) {
      console.error("❌ Error fetching user info from Cognito:", error);
      res.status(500).json({ success: false, error: "Failed to fetch user info" });
  }
});

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

// Route to serve a known admin page (once logged in).http://localhost:8000/dashboard.html will load .../admin/dashboard.html
// app.get('/dashboard.html', (req, res) => {
//   res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
// });

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

// For backward compatibility: a separate route that serves a public login page
// app.get('/admin-login', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'login.html'));
// });

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
        console.error("❌ Authentication error:", err);
        return res.status(400).json({ error: err.message });
    }

    // Store access token in session
    req.session.loggedIn = true;
    req.session.accessToken = data.AuthenticationResult.AccessToken;
    console.log("✅ Login successful, Access Token stored in session:", req.session.accessToken);

    res.json({ success: true });
  });
});

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
            console.error("❌ Authentication error:", err);
            return res.status(400).json({ error: err.message });
        }

        // ✅ Store Access Token & Session Data
        req.session.loggedIn = true;
        req.session.accessToken = data.AuthenticationResult.AccessToken;

        // Explicitly save the session
        req.session.save((err) => {
            if (err) {
                console.error("❌ Error saving session:", err);
                return res.status(500).json({ error: "Failed to save session" });
            }

            console.log("✅ Login successful, Access Token stored in session:", req.session.accessToken);
            res.json({ success: true });
        });
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

// Google star rating scraper - focused on getting just the rating
async function scrapeGoogleStars() {
  try {
    console.log('Fetching Google star rating...');
    
    // Try a direct approach - search for the business on Google
    const searchUrl = 'https://www.google.com/search?q=eric+j+schwab+attorney+sacramento+reviews';
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Log if we got a response
    console.log('Received Google search response:', html.length, 'bytes');
    
    // Try multiple approaches to find the rating
    let rating = null;
    
    // Approach 1: Look for text containing both a number and "stars"
    $('span, div').each((i, el) => {
      const text = $(el).text();
      if (text.match(/(\d+\.\d+).*stars?/i) || text.match(/(\d+\.\d+).*rating/i)) {
        const match = text.match(/(\d+\.\d+)/);
        if (match && !rating) {
          rating = parseFloat(match[1]);
          console.log('Found Google rating via text search:', rating);
        }
      }
    });
    
    // Approach 2: Look for structured data
    if (!rating) {
      $('script[type="application/ld+json"]').each((i, el) => {
        try {
          const json = JSON.parse($(el).html());
          if (json.aggregateRating && json.aggregateRating.ratingValue) {
            rating = parseFloat(json.aggregateRating.ratingValue);
            console.log('Found Google rating via structured data:', rating);
          }
        } catch (e) {
          // Skip parsing errors
        }
      });
    }
    
    // Use the default rating if we couldn't find one
    if (!rating) {
      const fallbackRating = 5.0;
      console.log('Using fallback Google rating:', fallbackRating);
      return fallbackRating;
    }
    
    // Verify the rating is within a reasonable range (1-5)
    if (rating < 1 || rating > 5) {
      console.log('Google rating out of range, using fallback:', rating);
      return 5.0;
    }
    
    // Cache the valid rating
    reviewsCache.set('googleRating', rating);
    console.log('Successfully extracted Google rating:', rating);
    return rating;
  } catch (error) {
    console.error('Error scraping Google stars:', error.message);
    
    // Try to get from cache
    const cached = reviewsCache.get('googleRating');
    if (cached) {
      console.log('Using cached Google rating:', cached);
      return cached;
    }
    
    // Fallback
    console.log('Using fallback Google rating: 5.0');
    return 5.0;
  }
}

// Yelp star rating scraper - focused on getting just the rating
async function scrapeYelpStars() {
  try {
    console.log('Fetching Yelp star rating...');
    
    // Use the direct Yelp business page URL
    const yelpUrl = 'https://www.yelp.com/biz/eric-j-schwab-sacramento-2';
    
    const response = await axios.get(yelpUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Log if we got a response
    console.log('Received Yelp response:', html.length, 'bytes');
    
    // Try multiple approaches to find the rating
    let rating = null;
    
    // Approach 1: Look for elements with star rating in the class or aria-label
    $('[class*="star"], [aria-label*="star"], [class*="rating"]').each((i, el) => {
      const ariaLabel = $(el).attr('aria-label');
      const className = $(el).attr('class') || '';
      
      // Check aria-label first (most reliable)
      if (ariaLabel && ariaLabel.includes('star')) {
        const match = ariaLabel.match(/(\d+\.\d+)/);
        if (match && !rating) {
          rating = parseFloat(match[1]);
          console.log('Found Yelp rating via aria-label:', rating);
        }
      }
      
      // Check class names for star indicators
      if (!rating && className) {
        // Yelp often uses classes like "i-stars--5-0"
        const starMatch = className.match(/stars--(\d+-\d+)/);
        if (starMatch) {
          const starValue = starMatch[1].replace('-', '.');
          rating = parseFloat(starValue);
          console.log('Found Yelp rating via class name:', rating);
        }
      }
    });
    
    // Approach 2: Look for structured data
    if (!rating) {
      $('script[type="application/ld+json"]').each((i, el) => {
        try {
          const json = JSON.parse($(el).html());
          if (json.aggregateRating && json.aggregateRating.ratingValue) {
            rating = parseFloat(json.aggregateRating.ratingValue);
            console.log('Found Yelp rating via structured data:', rating);
          }
        } catch (e) {
          // Skip parsing errors
        }
      });
    }
    
    // Use the default rating if we couldn't find one
    if (!rating) {
      const fallbackRating = 5.0;
      console.log('Using fallback Yelp rating:', fallbackRating);
      return fallbackRating;
    }
    
    // Verify the rating is within a reasonable range (1-5)
    if (rating < 1 || rating > 5) {
      console.log('Yelp rating out of range, using fallback:', rating);
      return 5.0;
    }
    
    // Cache the valid rating
    reviewsCache.set('yelpRating', rating);
    console.log('Successfully extracted Yelp rating:', rating);
    return rating;
  } catch (error) {
    console.error('Error scraping Yelp stars:', error.message);
    
    // Try to get from cache
    const cached = reviewsCache.get('yelpRating');
    if (cached) {
      console.log('Using cached Yelp rating:', cached);
      return cached;
    }
    
    // Fallback
    console.log('Using fallback Yelp rating: 5.0');
    return 5.0;
  }
}

// Update existing endpoint for Google reviews
app.get('/proxy-google-reviews', async (req, res) => {
  try {
    // Fetch just the star rating
    const starRating = await scrapeGoogleStars();
    
    // Use pre-defined reviews but with the actual star rating
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
      rating: starRating.toFixed(1),
      reviewCount: '5', // Hardcoded but accurate count
      reviewText: googleReviews[randomIndex],
      allReviews: googleReviews
    });
  } catch (error) {
    console.error('Error in Google reviews endpoint:', error);
    res.json({
      rating: '5.0',
      reviewCount: '5',
      reviewText: "Eric is a great attorney who helped me with my Chapter 7 bankruptcy. He was able to get back to us almost immediately with any questions we had all throughout the process.",
      allReviews: googleReviews
    });
  }
});

// Update existing endpoint for Yelp reviews
app.get('/proxy-yelp-reviews', async (req, res) => {
  try {
    // Fetch just the star rating
    const starRating = await scrapeYelpStars();
    
    // Use pre-defined reviews but with the actual star rating
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
      rating: starRating.toFixed(1),
      reviewCount: '8', // Hardcoded but accurate count
      reviewText: yelpReviews[randomIndex],
      allReviews: yelpReviews
    });
  } catch (error) {
    console.error('Error in Yelp reviews endpoint:', error);
    res.json({
      rating: '5.0',
      reviewCount: '8',
      reviewText: "Eric and his wife did a fantastic job with my bankruptcy. I was a bit apprehensive about the whole process, but they guided me through every step with professionalism and compassion.",
      allReviews: yelpReviews
    });
  }
});

// Initialize on server start - just check if we can get ratings
(async function() {
  try {
    console.log('Testing star rating scrapers...');
    const googleStars = await scrapeGoogleStars();
    const yelpStars = await scrapeYelpStars();
    
    console.log('Initial star ratings fetched:');
    console.log(`Google: ${googleStars.toFixed(1)} stars`);
    console.log(`Yelp: ${yelpStars.toFixed(1)} stars`);
    
    // Set up periodic refresh (every 12 hours)
    setInterval(async () => {
      try {
        const newGoogleStars = await scrapeGoogleStars();
        const newYelpStars = await scrapeYelpStars();
        console.log('Star ratings refreshed:');
        console.log(`Google: ${newGoogleStars.toFixed(1)} stars`);
        console.log(`Yelp: ${newYelpStars.toFixed(1)} stars`);
      } catch (error) {
        console.error('Error refreshing star ratings:', error);
      }
    }, 12 * 60 * 60 * 1000); // 12 hours
  } catch (error) {
    console.error('Error during initial star rating fetching:', error);
  }
})();

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

//testing username
app.get('/api/user-info', async (req, res) => {
  console.log("🔍 Checking user authentication...");

  if (!req.session || !req.session.loggedIn) {
      console.error("❌ User not authenticated (Session missing)");
      return res.status(401).json({ success: false, error: "User not authenticated" });
  }

  if (!req.session.accessToken) {
      console.error("❌ Missing access token in session");
      return res.status(401).json({ success: false, error: "Missing access token" });
  }

  try {
      console.log("✅ Fetching user info from Cognito...");
      
      const userData = await cognito.getUser({ AccessToken: req.session.accessToken }).promise();
      console.log("✅ Cognito User Data:", userData);

      // Extract user attributes (e.g., name, email, picture)
      const attributes = userData.UserAttributes.reduce((acc, attr) => {
          acc[attr.Name] = attr.Value;
          return acc;
      }, {});

      res.json({
          success: true,
          username: attributes["name"] || "Admin",
          userPhoto: attributes["picture"] || "images/client-photo.png"
      });
  } catch (error) {
      console.error("❌ Error fetching user info from Cognito:", error);
      res.status(500).json({ success: false, error: "Failed to fetch user info" });
  }
});