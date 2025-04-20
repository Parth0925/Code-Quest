// Client/src/components/CreatePost/CreatePost.jsx

import React, { useState } from 'react';
import axios from 'axios';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [error, setError] = useState(null);

  const handleMediaChange = (e) => {
    setMedia(e.target.files[0]);
  };

  const handlePost = async () => {
    if (!content || !media) {
      setError("Please add both content and media.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('media', media);

      const token = localStorage.getItem('token'); // Get the token from localStorage

      if (!token) {
        setError("You must be logged in to post.");
        return;
      }

      const response = await axios.post('http://localhost:5001/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      });

      console.log('Post created:', response.data);
      setContent('');
      setMedia(null);
      alert('Post created successfully!');
      alert('Post successful!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating post');
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Write something..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input type="file" onChange={handleMediaChange} />
      <button onClick={handlePost}>Post</button>
      {error && <div>{error}</div>}
    </div>
  );
};

export default CreatePost;
