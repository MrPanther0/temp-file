export default function handler(req, res) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (!serviceAccount) throw new Error("No service account found");
    res.status(200).json({ message: "Env loaded successfully", project_id: serviceAccount.project_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
