import React, { useState, useEffect } from 'react';
import './JournalApp.css';
import Navbar from './Navbar';

export default function JournalApp() {
  const [entry, setEntry] = useState('');
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState('');

  const fetchEntries = async () => {
    try {
      const res = await fetch('https://moodjournal-backend-fy4e.onrender.com/entries', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        setEntries(await res.json());
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
    }
  };

  const handleSave = async () => {
    if (!entry.trim()) return;

    const date = new Date().toISOString().split('T')[0];
    let mood = 'neutral';

    try {
      // Call backend to analyze mood using Hugging Face
      const analysisRes = await fetch('https://moodjournal-backend-fy4e.onrender.com/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text: entry }),
      });

      if (analysisRes.ok) {
        const data = await analysisRes.json();
        mood = data.topEmotion || 'neutral';
      }
    } catch (err) {
      console.error('Error analyzing mood:', err);
    }

    const newEntry = { text: entry.trim(), date, mood };

    try {
      const res = await fetch('https://moodjournal-backend-fy4e.onrender.com/entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newEntry),
      });

      if (res.ok) {
        const savedEntry = await res.json();
        setEntries([savedEntry, ...entries]);
        setEntry('');
      }
    } catch (err) {
      console.error('Error saving entry:', err);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setEditedText(entry.text);
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`https://moodjournal-backend-fy4e.onrender.com/entry/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          text: editedText,
          mood: 'neutral',
          date: new Date().toISOString().split('T')[0],
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEntries(entries.map((e) => (e._id === id ? updated : e)));
        setEditingId(null);
        setEditedText('');
      }
    } catch (err) {
      console.error('Error updating entry:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      const res = await fetch(`https://moodjournal-backend-fy4e.onrender.com/entry/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.status === 204) {
        setEntries(entries.filter((e) => e._id !== id));
      }
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const moodColors = {
    happy: '#d1fae5', anxious: '#fef3c7', content: '#e0e7ff',
    excited: '#fff0f6', sad: '#fce7f3', neutral: '#f3f4f6',
  };
  const moodTextColors = {
    happy: '#059669', anxious: '#b45309', content: '#4f46e5',
    excited: '#be185d', sad: '#9d174d', neutral: '#6b7280',
  };

  return (
    <div className="container">
      <Navbar />
      <h2 className="section-title" style={{ color: 'blue' }}>Journal</h2>
      <p className="section-subtitle">Express your thoughts and track your emotional journey</p>

      <div className="journal-form">
        <h2 className="entry-title">New Entry</h2>
        <textarea
          className="entry-input"
          placeholder="Dear journal, today I..."
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
        />
        <button onClick={handleSave} className="save-btn">Save Entry</button>
      </div>

      <div className="recent-container">
        <h2 className="recent-title">Recent Entries</h2>
        {entries.length === 0 && <p>No entries found.</p>}
        {entries.map((entry) => (
          <div className="entry-card" key={entry._id}>
            <div className="entry-header">
              <span
                className="mood-badge"
                style={{
                  backgroundColor: moodColors[entry.mood] || '#e5e7eb',
                  color: moodTextColors[entry.mood] || '#374151',
                }}
              >
                {entry.mood}
              </span>
              <span className="entry-date">{entry.date}</span>
            </div>
            {editingId === entry._id ? (
              <>
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="edit-textarea"
                />
                <div className="entry-actions">
                  <button onClick={() => handleUpdate(entry._id)} className="save-btn">Update</button>
                  <button onClick={() => setEditingId(null)} className="cancel-btn">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p className="entry-text">{entry.text}</p>
                <div className="entry-actions">
                  <button onClick={() => handleEdit(entry)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(entry._id)} className="delete-btn">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
