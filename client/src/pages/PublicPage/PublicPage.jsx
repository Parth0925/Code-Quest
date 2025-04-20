// Client/src/pages/PublicPage/PublicPage.jsx

import React from 'react';
import PublicFeed from '../../Components/PublicFeed/PublicFeed';
import CreatePost from '../../Components/CreatePost/CreatePost';

const PublicPage = () => {
  return (
    <div>
      <h1>Public Space</h1>
      <CreatePost /> {/* Only show this if the user is authenticated */}
      <PublicFeed />
    </div>
  );
};

export default PublicPage;
