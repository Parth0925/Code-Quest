//client/src/components/VideoUpload/VideoUpload.jsx

import React, { useState } from 'react';
import axios from 'axios';
import VideoPlayer from './VidoePlayer';

const VideoUpload = () => {
  const [video, setVideo] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');

  const handleFileChange = (e) => {
    setVideo(e.target.files[0]); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!video || !title || !description) {
      alert('Please fill all fields');
      return;
    }

    const formData = new FormData();
    formData.append('video', video);  
    formData.append('title', title);  
    formData.append('description', description); 

    try {
      const response = await axios.post('http://localhost:5001/upload-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', 
        },
      });
      setUploadStatus('Video uploaded successfully!');
      console.log('Video uploaded:', response.data);
      setUploadedVideoUrl(response.data.video.videoUrl);
    } catch (error) {
      setUploadStatus('Error uploading video');
      console.error('Error uploading video:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input type="file" accept="video/*" onChange={handleFileChange} />
        <button type="submit">Upload Video</button>
      </form>

      {uploadedVideoUrl && (
        <div>
          <h3>Uploaded Video</h3>
          <VideoPlayer videoPath={uploadedVideoUrl} />
        </div>
      )}
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
};

export default VideoUpload;
