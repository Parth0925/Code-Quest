import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userroutes from "./routes/user.js";
import questionroutes from "./routes/question.js";
import answerroutes from "./routes/answer.js";
import multer from "multer";
import path from "path";
import nodemailer from "nodemailer";
import moment from "moment";
import ffmpeg from "fluent-ffmpeg";
import Otp from "./models/Otp.js";  // Import OTP model
import videoRoutes from "./routes/videos.js";
import { fileURLToPath } from "url";
import postRoutes from './routes/posts.js'
import notificationRoutes from './routes/notifications.js'
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const videoDir = path.join(__dirname, 'uploads', 'videos');
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });  // Creates the directory if it doesn't exist
}

const server = http.createServer(app);
const io = new Server(server, {
  // Optional configuration for socket.io can go here
});
dotenv.config();


io.on('connection', (socket) => {
  console.log('A user connected');

  // Trigger an event when an answer is added
  socket.on('answer', (data) => {
    io.emit('answer', data.message);
  });

  // Trigger an event when an upvote is added
  socket.on('upvote', (data) => {
    io.emit('upvote', data.message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});


// Middleware
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors({
  origin: ["http://localhost:3000", 
          "codeequest.netlify.app"]  // React app's URL
}));

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//app.use('/api/videos', videoRoutes);
//app.use('/videos', videoRoutes);
// Set up video upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/videos/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, WebM, and OGG are allowed.'));
    }
  }
}).single('video');

// Helper function to check allowed time for uploads (2 PM to 7 PM)
const isAllowedTime = () => {
  const currentHour = moment().hour();
  return currentHour >= 11 && currentHour <= 23; // Between 2 PM and 7 PM
};

// Validate video length (must be <= 2 minutes)
const validateVideoLength = (videoPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error("FFMPEG error:", err);
        reject('Error extracting video metadata');
      } else if (!metadata || !metadata.format) {
        console.error("Metadata format is not available", metadata);
        reject('Invalid metadata format');
      } else {
        const duration = metadata.format.duration;
        resolve(duration <= 120); // Video duration must be <= 2 minutes
      }
    });
  });
};

// Send OTP to user's email
const sendOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
  const timestamp = Date.now(); 

  try {
    // Store the OTP in MongoDB
    await Otp.findOneAndUpdate(
      { email },
      { otp, timestamp },  // Update OTP and timestamp for the given email
      { upsert: true }  // Create a new entry if it doesn't exist
    );

    // Send the OTP to the user via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'OTP for Video Upload',
      text: `Your OTP for uploading the video is ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.log('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

// Route to send OTP
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send('Email is required');
  }

  try {
    console.log('Sending OTP to:', email);
    await sendOTP(email);  // Await the OTP sending process
    res.status(200).send('OTP sent successfully');
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).send('Failed to send OTP');
  }
});

// Route to verify OTP
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).send('Email and OTP are required');
  }

  try {
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).send('OTP not found for this email');
    }

    const { otp: storedOtp, timestamp } = otpRecord;

    const currentTime = Date.now();
    const expirationTime = 5 * 60 * 1000;  // 5 minutes in milliseconds

    // Check if the OTP has expired
    if (currentTime - timestamp > expirationTime) {
      await Otp.deleteOne({ email });  // Remove expired OTP from the database
      return res.status(400).send('OTP has expired');
    }

    // Debug logs to see what OTPs are being compared
    console.log("Stored OTP object:", otpRecord);
    console.log("Received OTP:", otp);

    // Correct OTP comparison (only compare the OTP value)
    if (storedOtp === parseInt(otp)) {
      // OTP is valid, delete it from the database after verification
      await Otp.deleteOne({ email });
      return res.status(200).send('OTP verified successfully!');
    } else {
      return res.status(400).send('Invalid OTP');
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).send('Internal server error');
  }
});

// Route for video upload
app.post('/upload-video', (req, res) => {
  if (!isAllowedTime()) {
    return res.status(403).send('Video upload is allowed only between 2 PM and 7 PM');
  }

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).send('Error uploading file: ' + err.message);
    } else if (err) {
      return res.status(500).send('Internal server error');
    }

    const videoPath = req.file.path;
    console.log(req.file);
    console.log("Video uploaded to path:", videoPath);

    try {
      const isValidLength = await validateVideoLength(videoPath);
      if (!isValidLength) {
        return res.status(400).send('Video length should be <= 2 minutes');
      }

      res.status(200).send('Video uploaded successfully!');
    } catch (error) {
      console.error('Error processing video:', error);
      res.status(500).send('Error processing video');
    }
  });
});

// Other routes (existing ones)
app.use('/user', userroutes);
app.use('/questions', questionroutes);
app.use('/answer', answerroutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/videos", videoRoutes);
app.use('/api/posts', postRoutes);
app.use('/notifications', notificationRoutes);



// Home route
app.get('/', (req, res) => {
  res.send("Codequest is running perfectly");
});

export { io };

// Connect to MongoDB
const PORT = process.env.PORT || 5001;
const database_url = process.env.MONGODB_URL;

mongoose.connect(database_url)
  .then(() => app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); }))
  .catch((err) => console.log('MongoDB connection error:', err.message));