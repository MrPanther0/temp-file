export default function handler(req, res) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    res.status(200).json({
      project_id: serviceAccount.project_id,
      bucket: 'gs://temp-file-29f4a.firebasestorage.app',
      envVarExists: !!process.env.FIREBASE_SERVICE_ACCOUNT
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
