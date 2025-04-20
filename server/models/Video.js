import mongoose from 'mongoose';

const videoSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String, // This is where the path to the video will be stored
    required: true,
  },
}, {
  timestamps: true,  // Optional, adds createdAt and updatedAt fields
});

const Video = mongoose.model('Video', videoSchema);

export default Video;