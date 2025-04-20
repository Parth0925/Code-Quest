//client/src/components/VideoUpload/VideoPlayer.jsx

import React, { useState, useEffect } from "react";

const VideoPlayer = ({ videoPath }) => {
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    if (videoPath) {
      const videoUrl = `http://localhost:5001/${videoPath}`;
      console.log("videoUrl",videoUrl)
      setVideoUrl(videoUrl);
    }
  }, [videoPath]);

  return (
    <div>
      {console.log("videoUrl in component ",videoUrl)}
      {videoUrl ? (
        <video width="320" height="240" controls>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <p>Loading video...</p>
      )}
    </div>
  );
};

export default VideoPlayer;
