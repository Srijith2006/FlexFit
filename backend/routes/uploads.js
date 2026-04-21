import express from 'express';
import { 
  uploadDocument,
  uploadProfileImage,
  uploadVideo,
  uploadProgressPhotos,
  deleteUpload,
  getSignedUrl
} from '../controllers/uploadController.js';
import { upload, uploadSingle, uploadMultiple } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/document', authenticate, uploadSingle, uploadDocument);
router.post('/profile-image', authenticate, uploadSingle, uploadProfileImage);
router.post('/video', authenticate, uploadSingle, uploadVideo);
router.post('/progress-photos', authenticate, uploadMultiple, uploadProgressPhotos);
router.delete('/:public_id', authenticate, deleteUpload);
router.get('/signed-url/:public_id', authenticate, getSignedUrl);

export default router;