import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/:propertyId', (req, res) => {
  const reportPath = path.join(__dirname, '..', 'static', 'reports', `report_${req.params.propertyId}.pdf`);
  res.sendFile(reportPath);
});

export default router;