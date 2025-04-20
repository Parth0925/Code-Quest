// Client/src/components/PublicFeed/PublicFeed.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PublicFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/posts');  // Fetch posts from the server
        setPosts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div className="public-feed">
      {posts.length === 0 ? (
        <div>No posts available</div>
      ) : (
        posts.map((post) => (
          <div key={post._id} className="post">
            <div className="post-header">
              <h3>{post.user.username}</h3>
              <span>{new Date(post.createdAt).toLocaleString()}</span>
            </div>
            {post.media && <img src={post.media} alt="Post media" />}
            <p>{post.content}</p>
            <div className="post-actions">
              <button>Like</button>
              <button>Comment</button>
              <button>Share</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PublicFeed;
