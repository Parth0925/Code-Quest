// routes/posts.js
import express from 'express';
import Post from '../models/Post.js';
import User from '../models/auth.js';
import Friendship from '../models/Friendship.js';
import auth from '../middleware/auth.js'

const router = express.Router();

// Middleware to check if user can post
async function canUserPost(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(400).json({ message: 'User not found' });

    const friends = await Friendship.find({
      $or: [{ user1: user._id }, { user2: user._id }],
      status: 'accepted',
    });

    const friendCount = friends.length;

    if (friendCount === 0) {
      return res.status(403).json({ message: 'You need at least one friend to post' });
    }

    if (!user.canPostToday()) {
      if (friendCount < 2) {
        return res.status(403).json({ message: 'You can only post once a day unless you have more friends' });
      }
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server Error' });
  }
}

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username')  // Populate user info
      .sort({ createdAt: -1 })  // Sort posts by creation date (most recent first)
      .limit(10);  // Limit to 10 posts, adjust pagination as needed
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Route to create a post
router.post('/', auth, canUserPost, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { content, media } = req.body;  // Assuming content is text, media is URL

    const newPost = new Post({
      user: user._id,
      content,
      media,
    });

    await newPost.save();

    // Update the user's last post date
    user.lastPostDate = new Date();
    await user.save();

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: 'Error creating post' });
  }
});

export default router;
