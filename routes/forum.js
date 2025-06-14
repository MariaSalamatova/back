const router = require('express').Router();
const ForumPost = require('../models/ForumPost');
const forumEvents = require('../utils/forumEvents');
const { memoize } = require('../utils/memorizer');
const { log } = require('../utils/logger');

const createForumPost = log({
  level: 'INFO',
  profile: true,
})(async function createForumPost(username, content) {
  const newPost = new ForumPost({ username, content });
  const saved = await newPost.save();

  forumEvents.emit('post:created', saved);
  return saved;
});

const getAllForumPosts = log({
  level: 'INFO',
  profile: true,
})(async function getAllForumPosts() {
  return await ForumPost.find().sort({ createdAt: -1 }).lean();
});

const getPopularPosts = async () => {
  return await ForumPost.find().sort({ views: -1 }).limit(10).lean();
};

const memoizedPopular = memoize(getPopularPosts, {
  maxSize: 1,
  evictionPolicy: 'LRU',
  maxAge: 1000 * 60 * 60 * 24 * 90,
});

router.post('/add', async (req, res) => {
  const { username, content } = req.body;
  if (!username || !content) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const savedPost = await createForumPost(username, content);
    res.status(201).json(savedPost);
  } catch (err) {
    console.error('Post creation error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const posts = await getAllForumPosts();
    res.json(posts);
  } catch (err) {
    console.error('Error fetching forum posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/popular', async (req, res) => {
  try {
    const result = await memoizedPopular();
    res.json(result);
  } catch (err) {
    console.error('Error fetching popular posts:', err);
    res.status(500).json({ error: 'Failed to fetch popular posts' });
  }
});

router.get('/random', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  try {
    const randomPosts = await ForumPost.aggregate([{ $sample: { size: limit } }]);
    res.json(randomPosts);
  } catch (err) {
    console.error('Error fetching random posts', err);
    res.status(500).json({ error: 'Failed to fetch random posts' });
  }
});

module.exports = router;