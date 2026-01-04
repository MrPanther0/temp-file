const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Ensure uploads folder exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Multer storage
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Serve uploads
app.use('/uploads', express.static('uploads'));

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  res.redirect('/files');
});

// File list page
app.get('/files', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) return res.send('Error reading files');

    let list = files.map(f =>
      `<li><a href="/uploads/${f}" download>${f}</a></li>`
    ).join('');

    res.send(`
      <h2>Uploaded Files</h2>
      <ul>${list}</ul>
      <br>
      <a href="/">Upload more</a>
    `);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
