const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Models
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
  allEmotions: [
    {
      label: String,
      score: Number,
    }
  ],
  date: Date,
  rating: Number,
}, { timestamps: true }); // ✅ ensures createdAt is stored

const Entry = mongoose.model('Entry', EntrySchema);

// HuggingFace API
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
async function analyzeEmotion(text) {
  const HF_API_TOKEN = process.env.HUGGINGFACE_TOKEN;
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

  if (result.error) throw new Error(`HF API Error: ${result.error}`);
  if (Array.isArray(result) && result.length > 0) return result[0];
  return [];
}

// Middleware
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

// Auth Routes
app.post('/api/signup', async (req, res) => {
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

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, userId: user._id });
});

// Entry Routes
app.post('/entry', auth, async (req, res) => {
  const { text, date } = req.body;
  try {
    const allEmotions = await analyzeEmotion(text);
    const topEmotion = allEmotions.reduce((prev, curr) => prev.score > curr.score ? prev : curr);
    const rating = Math.round(topEmotion.score * 1000) / 10;

    const entry = new Entry({
      userId: req.userId,
      text,
      mood: topEmotion.label,
      allEmotions,
      date: new Date(date),
      rating,
    });

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
    const allEmotions = await analyzeEmotion(text);
    const topEmotion = allEmotions.reduce((prev, curr) => prev.score > curr.score ? prev : curr);
    const rating = Math.round(topEmotion.score * 1000) / 10;

    const updated = await Entry.findOneAndUpdate(
      { _id: id, userId: req.userId },
      {
        text,
        mood: topEmotion.label,
        allEmotions,
        date: new Date(date),
        rating,
      },
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

app.post('/analyze', async (req, res) => {
  const { text } = req.body;
  try {
    const emotions = await analyzeEmotion(text);
    res.json({ emotions });
  } catch (err) {
    console.error('Analyze route error:', err);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// ✅ DASHBOARD ROUTE (recent moods, moodStats, activeDays)
app.get('/api/dashboard', auth, async (req, res) => {
  try {
    const recentMoods = await Entry.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" }
          },
          mood: { $first: "$mood" },
          allEmotions: { $first: "$allEmotions" },
          rating: { $first: "$rating" },
          text: { $first: "$text" },
          date: { $first: "$date" },
          createdAt: { $first: "$createdAt" }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    const allEntries = await Entry.find({ userId: req.userId });

    const moodStats = {};
    const activeDaysSet = new Set();
    allEntries.forEach(entry => {
      moodStats[entry.mood] = (moodStats[entry.mood] || 0) + 1;
      if (entry.date) {
        activeDaysSet.add(entry.date.toISOString().split('T')[0]);
      }
    });

    res.json({
      totalEntries: allEntries.length,
      recentMoods,
      moodStats,
      activeDays: activeDaysSet.size,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Dashboard data fetch failed" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
