import multer from 'multer';
import admin from 'firebase-admin';

// Firebase setup
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'temp-file-29f4a.firebasestorage.app' // Replace with your bucket
  });
}

const bucket = admin.storage().bucket();

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  upload.single('file')(req, res, async (err) => {
    if (err || !req.file) return res.status(400).send('Upload error');

    const blob = bucket.file(req.file.originalname);

    try {
      await blob.save(req.file.buffer, { contentType: req.file.mimetype });
      res.redirect('/files'); // Go to file list after upload
    } catch (err) {
      console.error(err);
      res.status(500).send('Firebase upload failed');
    }
  });
}
