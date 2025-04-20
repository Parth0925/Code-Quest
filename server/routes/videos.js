// server/routes/videos.js
import express from 'express';
import { uploadVideo, getAllVideos } from '../controller/videoController.js'; // Assuming you've created a controller for video logic
import multer from 'multer';
import path from 'path'; // Assuming you want to secure these routes

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/videos/');  // The folder where videos are stored
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));  // Unique file name
    },
  });
  
  const upload = multer({ storage }).single('video'); // Assuming you send the video as 'video' in the form

const router = express.Router();

router.post('/upload-video', upload, uploadVideo);

// GET route to fetch videos (for example, get a list of all videos)
router.get('/', getAllVideos);

// POST route to upload a video
//router.post('/upload', auth, uploadVideo);  // Protected, needs authentication



export default router;
