// multer-storage-cloudinary uploads the file BEFORE reaching this controller
// req.file.path = the Cloudinary URL (already uploaded)
// req.file.filename = the Cloudinary public_id
// DO NOT call cloudinary.uploader.upload() again — file is already there

import { cloudinary } from '../middleware/upload.js';
import { Trainer, TrainerVideo } from '../models/index.js';

// POST /api/uploads/document
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // File is already on Cloudinary — just read the URL
    const fileUrl   = req.file.path;     // Cloudinary secure URL
    const publicId  = req.file.filename; // Cloudinary public_id

    const trainer = await Trainer.findOne({
      where: { user_id: req.user.user_id }
    });

    if (!trainer) {
      return res.status(404).json({
        message: 'Trainer profile not found. Make sure you are logged in as a trainer.'
      });
    }

    await trainer.update({
      document_url:        fileUrl,
      verification_status: 'pending',
      is_verified:         false
    });

    res.json({
      message: 'Document uploaded successfully. Awaiting admin verification.',
      url:       fileUrl,
      public_id: publicId
    });

  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// POST /api/uploads/profile-image
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = req.file.path;

    const { User } = await import('../models/index.js');
    await User.update(
      { profile_image_url: fileUrl },
      { where: { user_id: req.user.user_id } }
    );

    res.json({
      message:   'Profile image updated',
      url:       fileUrl,
      public_id: req.file.filename
    });

  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// POST /api/uploads/video
export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video uploaded' });
    }

    const fileUrl = req.file.path;

    const video = await TrainerVideo.create({
      trainer_id:      req.user.trainer_id,
      video_url:       fileUrl,
      thumbnail_url:   fileUrl,
      title:           req.body.title       || 'Untitled Video',
      description:     req.body.description || '',
      video_type:      req.body.video_type  || 'exercise_demo',
      exercise_tags:   req.body.exercise_tags
                         ? JSON.parse(req.body.exercise_tags)
                         : []
    });

    res.json({
      message: 'Video uploaded successfully',
      video: {
        id:        video.video_id,
        url:       video.video_url,
        thumbnail: video.thumbnail_url
      }
    });

  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ message: 'Video upload failed', error: error.message });
  }
};

// POST /api/uploads/progress-photos
export const uploadProgressPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No photos uploaded' });
    }

    const urls = req.files.map(f => f.path);

    res.json({
      message: 'Progress photos uploaded successfully',
      urls
    });

  } catch (error) {
    console.error('Upload progress photos error:', error);
    res.status(500).json({ message: 'Photo upload failed', error: error.message });
  }
};

// DELETE /api/uploads/:public_id
export const deleteUpload = async (req, res) => {
  try {
    const { public_id } = req.params;
    await cloudinary.uploader.destroy(decodeURIComponent(public_id));
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete upload error:', error);
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};

// GET /api/uploads/signed-url/:public_id
export const getSignedUrl = async (req, res) => {
  try {
    const { public_id } = req.params;
    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { public_id, timestamp },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${public_id}`,
      signature,
      timestamp
    });

  } catch (error) {
    console.error('Get signed URL error:', error);
    res.status(500).json({ message: 'Failed to generate URL', error: error.message });
  }
};