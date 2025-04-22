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
import Otp from "./models/Otp.js";
import videoRoutes from "./routes/videos.js";
import { fileURLToPath } from "url";
import postRoutes from './routes/posts.js';
import notificationRoutes from './routes/notifications.js';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';

const app = express();
dotenv.config();

const allowedOrigins = [
  'http://localhost:3000',
  'https://codeequest.netlify.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};


app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

// Express middleware
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Socket.io setup
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('answer', (data) => {
    io.emit('answer', data.message);
  });

  socket.on('upvote', (data) => {
    io.emit('upvote', data.message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Upload directory setup
const videoDir = path.join(__dirname, 'uploads', 'videos');
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

// Multer config
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
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, WebM, and OGG are allowed.'));
    }
  }
}).single('video');

const isAllowedTime = () => {
  const currentHour = moment().hour();
  return currentHour >= 11 && currentHour <= 23;
};

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
        resolve(duration <= 120);
      }
    });
  });
};

const sendOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const timestamp = Date.now();

  try {
    await Otp.findOneAndUpdate(
      { email },
      { otp, timestamp },
      { upsert: true }
    );

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

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send('Email is required');
  }

  try {
    console.log('Sending OTP to:', email);
    await sendOTP(email);
    res.status(200).send('OTP sent successfully');
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).send('Failed to send OTP');
  }
});

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
    const expirationTime = 5 * 60 * 1000;

    if (currentTime - timestamp > expirationTime) {
      await Otp.deleteOne({ email });
      return res.status(400).send('OTP has expired');
    }

    console.log("Stored OTP object:", otpRecord);
    console.log("Received OTP:", otp);

    if (storedOtp === parseInt(otp)) {
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


app.use('/user', userroutes);
app.use('/questions', questionroutes);
// app.options('/answer/post/:id', (req, res) => {
//   res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   return res.sendStatus(204);
// });
app.use('/answer', answerroutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/videos", videoRoutes);
app.use('/api/posts', postRoutes);
app.use('/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send("Codequest is running perfectly");
});

export { io };

const PORT = process.env.PORT || 5001;
const database_url = process.env.MONGODB_URL;

mongoose.connect(database_url)
  .then(() => { 
    server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
  .catch((err) => console.log('MongoDB connection error:', err.message));
