const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Serve static files from the frontend build directory
// Check multiple possible locations for the frontend files
const possibleFrontendPaths = [
    path.join(__dirname, 'frontend/dist'),
    path.join(__dirname, 'dist'),
    path.join(__dirname, '../frontend/dist'),
    path.join(__dirname, '../dist')
];

// Find the first path that exists
let frontendPath = possibleFrontendPaths[0]; // Default
for (const testPath of possibleFrontendPaths) {
    try {
        if (fs.existsSync(testPath)) {
            console.log(`Found frontend files at: ${testPath}`);
            frontendPath = testPath;
            break;
        }
    } catch (err) {
        console.log(`Path not found: ${testPath}`);
    }
}

app.use(express.static(frontendPath));
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, 'frontend/dist')));
app.use(express.json());

// Use environment variable for database path if provided (for Azure deployment)
const dbPath = process.env.SQLITE_DB_PATH || 'polls.db';
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS polls (
        id TEXT PRIMARY KEY,
        title TEXT,
        creator_password TEXT NOT NULL,
        join_code TEXT UNIQUE,
        active_question_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        poll_id TEXT,
        question_text TEXT,
        order_index INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(poll_id) REFERENCES polls(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS question_options (
        id TEXT PRIMARY KEY,
        question_id TEXT,
        option_text TEXT,
        is_correct BOOLEAN,
        FOREIGN KEY(question_id) REFERENCES questions(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS responses (
        id TEXT PRIMARY KEY,
        question_id TEXT,
        option_id TEXT,
        participant_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(question_id) REFERENCES questions(id),
        FOREIGN KEY(option_id) REFERENCES question_options(id)
    )`);
});

app.post('/api/polls', (req, res) => {
    const { title, questions, password } = req.body;
    const pollId = uuidv4();
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    db.run('INSERT INTO polls (id, title, join_code, creator_password) VALUES (?, ?, ?, ?)', 
        [pollId, title, joinCode, password], 
        async (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            try {
                for (let i = 0; i < questions.length; i++) {
                    const question = questions[i];
                    const questionId = uuidv4();

                    await new Promise((resolve, reject) => {
                        db.run(
                            'INSERT INTO questions (id, poll_id, question_text, order_index) VALUES (?, ?, ?, ?)',
                            [questionId, pollId, question.text, i],
                            (err) => {
                                if (err) reject(err);
                                else resolve();
                            }
                        );
                    });

                    await Promise.all(question.options.map(option => {
                        return new Promise((resolve, reject) => {
                            db.run(
                                'INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES (?, ?, ?, ?)',
                                [uuidv4(), questionId, option.text, option.isCorrect || false],
                                (err) => {
                                    if (err) reject(err);
                                    else resolve();
                                }
                            );
                        });
                    }));
                }

                res.json({ pollId, joinCode });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        }
    );
});

app.get('/api/polls/:joinCode', (req, res) => {
    const { joinCode } = req.params;
    const password = req.headers['x-poll-password'];

    db.get('SELECT * FROM polls WHERE join_code = ?', [joinCode], (err, poll) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!poll) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        db.all('SELECT * FROM questions WHERE poll_id = ? ORDER BY order_index', [poll.id], async (err, questions) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            try {
                const questionsWithOptions = await Promise.all(questions.map(async (question) => {
                    return new Promise((resolve, reject) => {
                        db.all(
                            'SELECT * FROM question_options WHERE question_id = ?',
                            [question.id],
                            (err, options) => {
                                if (err) reject(err);
                                else resolve({ ...question, options });
                            }
                        );
                    });
                }));

                // If no active question is set, default to the first question
                if (!poll.active_question_id && questionsWithOptions.length > 0) {
                    poll.active_question_id = questionsWithOptions[0].id;
                    await new Promise((resolve, reject) => {
                        db.run(
                            'UPDATE polls SET active_question_id = ? WHERE id = ?',
                            [poll.active_question_id, poll.id],
                            (err) => {
                                if (err) reject(err);
                                else resolve();
                            }
                        );
                    });
                }

                const isCreator = password && poll.creator_password === password;
                const pollData = {
                    ...poll,
                    questions: questionsWithOptions,
                    isCreator,
                };
                delete pollData.creator_password;
                res.json(pollData);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    });
});

app.put('/api/polls/:pollId/active-question', (req, res) => {
    const { pollId } = req.params;
    const { questionId } = req.body;
    const password = req.headers['x-poll-password'];

    db.get('SELECT creator_password FROM polls WHERE id = ?', [pollId], (err, poll) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!poll) {
            return res.status(404).json({ error: 'Poll not found' });
        }
        if (poll.creator_password !== password) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        db.run(
            'UPDATE polls SET active_question_id = ? WHERE id = ?',
            [questionId, pollId],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                io.to(pollId).emit('question-change', { questionId });
                res.json({ success: true });
            }
        );
    });
});

// Catch-all route to serve the frontend for any other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

io.on('connection', (socket) => {
    socket.on('join-poll', ({ pollId, joinCode }) => {
        socket.join(pollId);
        socket.join(joinCode);
    });

    socket.on('submit-response', ({ pollId, questionId, optionId, joinCode }) => {
        const responseId = uuidv4();
        const participantId = socket.id;

        db.run(
            'INSERT INTO responses (id, question_id, option_id, participant_id) VALUES (?, ?, ?, ?)',
            [responseId, questionId, optionId, participantId],
            (err) => {
                if (err) {
                    socket.emit('error', err.message);
                    return;
                }

                db.all(
                    `SELECT qo.id, qo.option_text, COUNT(r.id) as count
                    FROM question_options qo
                    LEFT JOIN responses r ON qo.id = r.option_id
                    WHERE qo.question_id = ?
                    GROUP BY qo.id, qo.option_text`,
                    [questionId],
                    (err, results) => {
                        if (err) {
                            socket.emit('error', err.message);
                            return;
                        }
                        // Emit to both poll ID and join code rooms
                        io.to(pollId).emit('response-update', results);
                        io.to(joinCode).emit('response-update', results);
                    }
                );
            }
        );
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
