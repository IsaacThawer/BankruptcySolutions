const express = require('express');
const fs = require('fs'); 
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/reviews-admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'reviews-admin.html'));
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

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log(__dirname);
});