import { fetchallusers } from './action/users';
import './App.css';
import { useEffect, useState } from 'react';
import Navbar from './Components/Navbar/navbar';
import { BrowserRouter as Router } from 'react-router-dom';
import Allroutes from './Allroutes';
import { useDispatch } from 'react-redux';
import { fetchallquestion } from './action/question';
import { getallvideos } from './api/index';  // Ensure this is correctly imported
import VideoPlayer from './Components/VideoUpload/VidoePlayer';  // Import VideoPlayer component

function App() {
  const [slidein, setslidein] = useState(true);
  const [videos, setVideos] = useState([]);  // State to store the fetched videos
  const dispatch = useDispatch();

  // Fetch videos and other necessary data when the component mounts
  useEffect(() => {
    dispatch(fetchallusers());
    dispatch(fetchallquestion());

    const fetchVideos = async () => {
      try {
        const response = await getallvideos();  // API call to fetch videos
        setVideos(response.data);  // Set fetched videos to state
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };
    fetchVideos();
  }, [dispatch]);

  // Handle responsive navbar behavior (slide-in)
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setslidein(false);
    }
  }, []);

  const handleslidein = () => {
    if (window.innerWidth <= 768) {
      setslidein((state) => !state);
    }
  };

  return (
    <div className="App">
      <Router>
        <Navbar handleslidein={handleslidein} />
        <Allroutes slidein={slidein} handleslidein={handleslidein} />
                {/* Display videos */}
                <div className="video-gallery">
          {videos.length > 0 ? (
            videos.map((video) => (
              <div key={video._id} className="video-item">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                <VideoPlayer videoPath={video.videoUrl} /> {/* Pass video URL to the VideoPlayer component */}
              </div>
            ))
          ) : (
            <p>No videos available.</p>
          )}
        </div>
      </Router>
    </div>
  );
}

export default App;
