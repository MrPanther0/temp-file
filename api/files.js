import admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Fix the storage bucket name here:
    storageBucket: 'temp-file-29f4a.firebasestorage.app'  // <-- correct bucket name format
  });
}

const bucket = admin.storage().bucket();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // Get list of files in the bucket
    const [files] = await bucket.getFiles();

    const fileCards = files.map(f => `
      <div class="file-card">
        <div class="file-name">${f.name}</div>
        <a href="https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(f.name)}" target="_blank" rel="noopener noreferrer" class="download-btn">Download</a>
      </div>
    `).join('');

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Uploaded Files</title>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>
          body {
            font-family: 'Roboto', sans-serif;
            background: #f4f4f4;
            padding: 40px 20px;
          }
          h2 {
            text-align: center;
            margin-bottom: 30px;
            color: #333;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            max-width: 1000px;
            margin: auto;
          }
          .file-card {
            background: #fff;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 6px 15px rgba(0,0,0,0.1);
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .file-name {
            font-weight: 500;
            margin-bottom: 15px;
            word-break: break-word;
          }
          .download-btn {
            text-decoration: none;
            background: #667eea;
            color: #fff;
            padding: 10px 15px;
            border-radius: 6px;
            transition: background 0.3s;
          }
          .download-btn:hover {
            background: #5a67d8;
          }
          .back-link {
            display: block;
            text-align: center;
            margin-top: 30px;
            font-size: 16px;
            color: #667eea;
            text-decoration: none;
          }
          .back-link:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <h2>Uploaded Files</h2>
        <div class="grid">
          ${fileCards || '<p>No files uploaded yet.</p>'}
        </div>
        <a href="/" class="back-link">⬅ Back to Upload</a>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Error listing files:', err);
    res.status(500).send('Failed to list files');
  }
}
