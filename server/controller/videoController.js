// server/controller/videoController.js
import Video from '../models/Video.js'; // Assuming you have a Video model to store video data

// GET all videos
export const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find(); // Fetch videos from the database
    if (!videos || videos.length === 0) {
      return res.status(404).json({ message: 'No videos found' });
    }
    res.status(200).json(videos); // Respond with the videos
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Error fetching videos', error });
  }
};

// POST a new video (for uploading videos)
export const uploadVideo = async (req, res) => {
  try {
    const { title, description } = req.body; // Extract video details from request body
    const videoData = req.file; // This should be the uploaded video file
    const videoUrl = `/uploads/videos/${req.file.filename}`;

    // Check if the video file exists
    if (!videoData) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    // Create a new video object and save it to the database
    const newVideo = new Video({
      title: req.body.title,
      description: req.body.description,
      videoUrl: path.relative(__dirname, req.file.path), // Path where the video is stored on the server
      // Ensure videoUrl is saved here correctly
    });

    // Save the video record in MongoDB
    await newVideo.save();

    res.status(201).json({ message: 'Video uploaded successfully', video: newVideo });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Error uploading video', error });
  }
};
