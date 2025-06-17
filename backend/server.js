const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch'); // Hugging Face API

require('dotenv').config(); // Load .env variables

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ====== Connect to MongoDB ======
mongoose.connect('mongodb://localhost:27017/moodjournal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// ====== Mongoose Schemas ======
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model('User', UserSchema);

const EntrySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  text: String,
  mood: String,
  date: String,
});
const Entry = mongoose.model('Entry', EntrySchema);

// ====== Hugging Face Emotion Analysis ======
async function analyzeEmotion(text) {
  const HF_API_TOKEN = process.env.HUGGINGFACE_TOKEN;
  console.log("🔑 Hugging Face Token:", HF_API_TOKEN);

  const API_URL = "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base";

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: text })
  });

  const result = await response.json();
  console.log("📊 Hugging Face API Result:", result);

  if (result.error) {
    throw new Error(`HF API Error: ${result.error}`);
  }

  if (Array.isArray(result) && result.length > 0) {
    const emotions = result[0];
    const topEmotion = emotions.reduce((prev, curr) => prev.score > curr.score ? prev : curr);
    return topEmotion.label;
    console.log(result);
  }

  return 'neutral';
}

// ====== Auth Middleware ======
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).send('Token missing');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).send('Invalid token');
  }
}

// ====== Auth Routes ======
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = new User({ name, email, password: hashed });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({ error: 'Email already exists or invalid data' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, userId: user._id });
});

// ====== Entry Routes ======
app.post('/entry', auth, async (req, res) => {
  const { text, date } = req.body;
  try {
    const mood = await analyzeEmotion(text);
    const entry = new Entry({ userId: req.userId, text, mood, date });
    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    console.error("🚨 Error in /entry:", error);
    res.status(500).json({ error: error.message || 'Emotion analysis failed' });
  }
});

app.get('/entries', auth, async (req, res) => {
  const entries = await Entry.find({ userId: req.userId }).sort({ date: -1 });
  res.json(entries);
});

app.put('/entry/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { text, date } = req.body;
  try {
    const mood = await analyzeEmotion(text);
    const updated = await Entry.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { text, mood, date },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('Update error:', err);
    res.status(400).send('Update failed');
  }
});

app.delete('/entry/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    await Entry.findOneAndDelete({ _id: id, userId: req.userId });
    res.sendStatus(204);
  } catch (err) {
    console.error('Delete error:', err);
    res.status(400).send('Delete failed');
  }
});

// ====== Optional Emotion Analysis Test Route ======
app.post('/analyze', async (req, res) => {
  const { text } = req.body;
  try {
    const mood = await analyzeEmotion(text);
    res.json({ mood });
  } catch (err) {
    console.error('Analyze route error:', err);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.get('/api/dashboard', auth, async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.userId });

    const moodStats = {};
    const moodDates = new Set();

    entries.forEach(entry => {
      const mood = entry.mood?.toLowerCase() || 'neutral';
      moodStats[mood] = (moodStats[mood] || 0) + 1;
      moodDates.add(entry.date);
    });

    // Sort by latest date and get 5 most recent moods
    const recentMoods = entries
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(entry => ({
        mood: entry.mood,
        date: entry.date,
        rating: entry.rating || null,
      }));

    res.json({
      totalEntries: entries.length,
      moodStats,
      activeDays: moodDates.size,
      recentMoods
    });

  } catch (err) {
    console.error('Error in /api/dashboard:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
