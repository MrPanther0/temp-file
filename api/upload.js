import multer from 'multer';
import admin from 'firebase-admin';

// Parse service account from env
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Use the full Firebase Storage bucket name
    storageBucket: 'gs://temp-file-29f4a.firebasestorage.app'  // <-- CHANGE THIS (more below)
  });
}

const bucket = admin.storage().bucket();

// Use multer memory storage (required on Vercel)
const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: { bodyParser: false }  // disable Next.js default body parsing to use multer
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).send('Upload error');
    }
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const blob = bucket.file(req.file.originalname);

    try {
      // Save the file buffer to Firebase Storage
      await blob.save(req.file.buffer, {
        contentType: req.file.mimetype,
        resumable: false,  // disable resumable for small files (better compatibility)
      });
      res.writeHead(302, { Location: '/files' });  // redirect to file list page
      res.end();
    } catch (error) {
      console.error('Firebase upload failed:', error);
      res.status(500).send('Firebase upload failed');
    }
  });
}

