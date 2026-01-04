const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Load Firebase service account
//const serviceAccount = require('./firebase-service.json');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'temp-file-29f4a.firebasestorage.app' // replace with your bucket
});

const bucket = admin.storage().bucket();

// Multer setup for temp storage
const upload = multer({ dest: 'tmp/' });

// Serve a simple HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.send('No file uploaded');

  const tempFilePath = req.file.path;
  const destination = req.file.originalname;

  try {
    await bucket.upload(tempFilePath, { destination });
    fs.unlinkSync(tempFilePath); // remove temp file
    res.send(`File uploaded! <a href="/download/${encodeURIComponent(destination)}">Download</a>`);
  } catch (err) {
    console.error(err);
    res.send('Upload failed');
  }
});

// Download route
app.get('/download/:filename', async (req, res) => {
  const file = bucket.file(req.params.filename);
  try {
    const [exists] = await file.exists();
    if (!exists) return res.send('File not found');

    const tempPath = path.join('tmp', req.params.filename);
    await file.download({ destination: tempPath });
    res.download(tempPath, req.params.filename, () => {
      fs.unlinkSync(tempPath); // remove temp file after download
    });
  } catch (err) {
    console.error(err);
    res.send('Download failed');
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
