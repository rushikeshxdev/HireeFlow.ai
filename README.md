# HireeFlow.ai

<div align="center">

![HireeFlow.ai Banner](https://img.shields.io/badge/HireeFlow.ai-AI%20Interview%20Platform-7C3AED?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTEyIDhtLTcgMGE3IDcgMCAxIDAgMTQgMGE3IDcgMCAxIDAgLTE0IDAiLz48cGF0aCBkPSJNNSAyMXYtMmE0IDQgMCAwIDEgNCAtNGg2YTQgNCAwIDAgMSA0IDR2MiIvPjwvc3ZnPg==)

**Real-time AI-Powered Technical Interview Platform**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.0-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Features](#features) • [Demo](#demo) • [Installation](#installation) • [Usage](#usage) • [Tech Stack](#tech-stack)

</div>

---

## Overview

HireeFlow.ai is a comprehensive technical interview platform that combines **real-time video conferencing**, **collaborative code editing**, and **AI-powered question generation** into a seamless experience for both interviewers and candidates.

<!-- Add your screenshots here -->
<!--
## Screenshots

### Home Page
![Home Page](./screenshots/home.png)

### Interview Room
![Interview Room](./screenshots/room.png)

### Code Editor
![Code Editor](./screenshots/code-editor.png)

### AI Question Generator
![AI Questions](./screenshots/ai-questions.png)
-->

## Features

### Video Conferencing
- **WebRTC Peer-to-Peer** - Low latency video calls
- **Screen Sharing** - Share your screen with participants
- **Media Controls** - Mute/unmute, camera toggle
- **Auto-Connect** - Automatic connection when participants join

### Collaborative Code Editor
- **Monaco Editor** - VS Code-like editing experience
- **8+ Languages** - JavaScript, TypeScript, Python, Java, C++, C, Go, Rust
- **Real-time Sync** - See code changes instantly
- **Code Execution** - Run code directly via Piston API

### AI Co-Pilot
- **Smart Questions** - Generate interview questions from resume/skills
- **Difficulty Levels** - Medium, Hard, Expert questions
- **Context-Aware** - Questions tailored to job role
- **Powered by Gemini 2.0** - Google's latest AI model

### Additional Features
- **Real-time Chat** - Text communication during interviews
- **Role Management** - Interviewer and Candidate roles
- **Room-based Sessions** - Isolated interview rooms
- **Responsive Design** - Works on desktop and tablets

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, Tailwind CSS, Monaco Editor |
| **Backend** | Node.js, Express.js, Socket.io |
| **Video** | WebRTC, simple-peer |
| **AI** | Google Gemini 2.0 Flash |
| **Code Execution** | Piston API |

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API Key ([Get one free](https://makersuite.google.com/app/apikey))

### Clone the Repository

```bash
git clone https://github.com/rushikeshxdev/HireeFlow.ai.git
cd HireeFlow.ai
```

### Server Setup

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_api_key_here

# Start development server
npm run dev
```

### Client Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

1. **Start both servers** (server on port 5000, client on port 5173)

2. **Open the app** at `http://localhost:5173`

3. **Create or join a room**:
   - Enter a room ID or generate a random one
   - Choose your role (Interviewer/Candidate)
   - Enter your name

4. **Start the interview**:
   - Video will connect automatically when both join
   - Use the code editor to write/share code
   - Generate AI questions from the sidebar

### For Interviewers
- Access the AI Co-Pilot to generate relevant questions
- View candidate's code in real-time
- Run and evaluate code submissions

### For Candidates
- Write code in the collaborative editor
- Execute code to test solutions
- Communicate via video and chat

## Project Structure

```
HireeFlow.ai/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Context providers
│   │   ├── pages/          # Page components
│   │   └── main.jsx        # Entry point
│   └── package.json
│
├── server/                 # Express Backend
│   ├── controllers/        # API controllers
│   ├── routes/             # API routes
│   ├── server.js           # Entry point
│   └── package.json
│
└── README.md
```

## Environment Variables

### Server (`server/.env`)

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/ai/generate` | POST | Generate interview questions |

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-room` | Client → Server | Join interview room |
| `call-user` | Client → Server | Initiate WebRTC call |
| `call-incoming` | Server → Client | Incoming call notification |
| `code-change` | Client → Server | Code editor sync |
| `send-message` | Client → Server | Chat message |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Piston API](https://github.com/engineer-man/piston) - Code execution
- [Google Gemini](https://ai.google.dev/) - AI capabilities
- [Socket.io](https://socket.io/) - Real-time communication

---

<div align="center">

**Built with by [Rushikesh](https://github.com/rushikeshxdev)**

</div>
