import express from 'express';
import { upload } from '../middleware/upload.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @desc Upload a single file (image, video, audio)
// @route POST /api/upload
router.post('/', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc Upload multiple files
// @route POST /api/upload/multiple
router.post('/multiple', auth, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const host = req.get('host');
    const protocol = req.protocol;

    const fileUrls = req.files.map(file => ({
      fileUrl: `${protocol}://${host}/uploads/${file.filename}`,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size
    }));

    res.json({
      success: true,
      files: fileUrls
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
