# Mood Journal Web App

A full-stack web application that allows users to log their moods, analyze emotional patterns using AI, and visualize mood trends over time.

## Live Demo

[https://heroic-klepon-0ddab1.netlify.app](https://heroic-klepon-0ddab1.netlify.app)

---

## Features

- User Authentication — Secure signup/login using JWT  
- Mood Entries — Journal your thoughts and feelings  
- Emotion Analysis — Powered by HuggingFace API  
- Dashboard — Visual insights and trends over time  
- Active Days & Top Moods — based on user activity  
- Responsive UI — Built with React and beautiful charts  

---

## Tech Stack

| Frontend     | Backend           | Other Integrations          |
|--------------|-------------------|-----------------------------|
| React        | Node.js + Express | MongoDB Atlas (Database)    |
| React Router | JWT Auth          | HuggingFace (Emotion API)   |
| Chart.js     | Mongoose          | Netlify & Render (Hosting)  |

---

## Getting Started (For Developers)

### Prerequisites

- Node.js installed  
- MongoDB Atlas account  
- HuggingFace API token  

---

### Clone and Install

```bash
git clone https://github.com/Sneha-Amballa/MoodJournal.git
cd MoodJournal
```

---

### Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### Environment Variables

Create a `.env` file inside the `backend/` directory and add the following:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
HUGGINGFACE_TOKEN=your_huggingface_api_key
```

---

## Run Locally

### Start Backend

```bash
cd backend
node server.js
```

### Start Frontend

```bash
cd frontend
npm start
```

Then open your browser and visit:

```
http://localhost:3000
```


## Author

Sneha Amballa  
GitHub: https://github.com/Sneha-Amballa  
LinkedIn: [https://www.linkedin.com/in/sneha-amballa/](https://www.linkedin.com/in/sneha-amballa-147646308/)

---

## License

This project is licensed under the MIT License.
