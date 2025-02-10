const express = require('express');
const fs = require('fs'); 
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 8000;

app.use(bodyParser.urlencoded({ extended: true }));
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


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log(__dirname);
});