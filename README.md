# UoG Polling System

A real-time polling application that allows users to create and participate in live polls, quizzes, and surveys. Built with React, Node.js, and Socket.IO.

## Features

- **Create Polls**: Create interactive polls with multiple options and correct answers
- **Join Polls**: Enter a 6-digit code to join and participate in polls
- **Real-time Updates**: See live voting results with an animated bar graph
- **No Login Required**: Quick and easy participation without registration
- **Correct Answer Indication**: Shows correct answers after voting
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**:
  - React with Vite
  - Chakra UI for styling
  - Socket.IO client for real-time updates
  - Chart.js for data visualization

- **Backend**:
  - Node.js with Express
  - Socket.IO for WebSocket connections
  - SQLite for data persistence
  - UUID for unique identifiers

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd uog-polling-system
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

3. Start the development servers:
```bash
# From the root directory
npm run dev
```

This will start both the backend server (port 3001) and frontend development server (port 5173).

## Usage

### Creating a Poll

1. Click "Create Poll" on the home page
2. Enter your poll question
3. Add multiple options (minimum 2)
4. Optionally mark correct answers
5. Submit to get a unique 6-digit join code

### Joining a Poll

1. Click "Join Poll" on the home page
2. Enter the 6-digit join code
3. Select your answer
4. Submit to see real-time results

## Project Structure

```
.
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx        # Main application component
│   │   └── main.jsx       # Application entry point
│   └── public/            # Static assets
├── server.js              # Express backend server
└── package.json          # Project dependencies and scripts
```

## API Endpoints

- `POST /api/polls`: Create a new poll
- `GET /api/polls/:joinCode`: Get poll details by join code

## WebSocket Events

- `join-poll`: Join a poll room
- `submit-response`: Submit a poll response
- `response-update`: Receive updated poll results

## Development

- Backend runs on `http://localhost:3001`
- Frontend runs on `http://localhost:5173`
- SQLite database is stored in `polls.db`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
