const { createQuizGenTeam, createQuizEvalTeam, createTopicQuizGenTeam, createTopicQuizEvalTeam } = require('./agents');
const { createBookSuggestionTeam, createTopicSuggestionTeam, createBookInquiryTeam, createLearningPathSuggestionTeam } = require('./suggestion_agents');
const readline = require('readline');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const rateLimit = require('express-rate-limit'); // 1. Import

const app = express();
app.use(express.json());
app.use(cors()); // Allow requests from React frontend

const folderPath = path.join(__dirname, 'students');
const filePath = path.join(folderPath, 'students.json');

admin.initializeApp();

app.set('trust proxy', 1);

const apiLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 30 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Ensure the folder exists
if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log('Folder created:', folderPath);
}

app.use('/ai', apiLimiter);

// API to save student data
app.post('/save-student', (req, res) => {

    const { email, age, grade } = req.body;

    if (!email || !age || !grade) {
        return res.status(400).json({ message: 'Missing student data' });
    }

    let students = {};

    // Read existing data if the file exists
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        if (data) {
            students = JSON.parse(data);
        }
    }

    // Update student record
    students[email] = {
        age,
        grade,
        lastLogin: new Date().toISOString()
    };

    // Write updated data to the file
    fs.writeFileSync(filePath, JSON.stringify(students, null, 2), 'utf8');

    res.json({ message: `Student ${email} data saved.` });
});
// Route to get the student data
app.get('/read-students', (req, res) => {
    // Check if the file exists
    if (fs.existsSync(filePath)) {
        // Read the data from the file
        const data = fs.readFileSync(filePath, 'utf8');

        // If the data exists and is not empty
        if (data) {
            try {
                // Parse the JSON data
                const students = JSON.parse(data);
                return res.json(students); // Return the students data as JSON
            } catch (error) {
                return res.status(500).json({ message: 'Error parsing data' });
            }
        }
    }
    // If file doesn't exist or no data found
    return res.status(404).json({ message: 'No student data found' });
});

app.get('/get-student', (req, res) => {
    const { email } = req.query; // Get email from query params

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'No student data found' });
    }

    // Read student data from the file
    const data = fs.readFileSync(filePath, 'utf8');
    const students = JSON.parse(data);

    if (!students[email]) {
        return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ email, ...students[email] });
});


app.post('/ai/generate-quiz', async (req, res) => {
    const {grade, subject, age, level, topic} = req.body;
    if (!grade || !subject || !age || !level) {
        return res.status(400).json({ message: 'Missing key data' });
    }
    try {
        let output;
        if (topic) {
            output = await createTopicQuizGenTeam(subject, age, grade, level, topic).start()
        } else {
            output = await createQuizGenTeam(subject, age, grade, level).start()
        }
        if (output.status === 'FINISHED') {
          console.log('\nGenerated Blog Post:');
          console.log(output.result);
          res.type('json');
          res.send(output.result);
        } else if (output.status === 'BLOCKED') {
          console.log('Workflow is blocked, unable to complete');
        }
      } catch (error) {
        console.error('Error generating blog post:', error);
      }
});

app.post('/ai/evaluate-quiz', async (req, res) => {
    const {grade, subject, age, level, quiz, topic} = req.body;
    if (!grade || !subject || !age || !level || !quiz) {
        return res.status(400).json({ message: 'Missing key data' });
    }
    try {
        let output;
        if (topic) {
            output = await createTopicQuizEvalTeam(subject, age, grade, level, quiz, topic).start()
        } else {
            output = await createQuizEvalTeam(subject, age, grade, level, quiz).start()
        }
        if (output.status === 'FINISHED') {
          console.log('\nGenerated Blog Post:');
          console.log(output.result);
          res.type('json');
          res.send(output.result);
        } else if (output.status === 'BLOCKED') {
          console.log('Workflow is blocked, unable to complete');
        }
      } catch (error) {
        console.error('Error generating blog post:', error);
        res.status(400).json({ message: error });
      }
});

app.post('/ai/topic-suggestions', async (req, res) => {
    const {subject, age, grade, level, learningPath, summary, strength, weakness} = req.body;
    if (!grade || !subject || !age || !level) {
        return res.status(400).json({ message: 'Missing key data' });
    }
    try {
    const output = await createTopicSuggestionTeam(subject, age, grade, level, learningPath, summary, strength, weakness).start()
    if (output.status === 'FINISHED') {
        res.type('json');
        res.send(output.result);
    } else if (output.status === 'BLOCKED') {
        res.status(400).json({ message: 'Workflow is blocked, unable to complete' });
    }
    } catch (error) {
        res.status(400).json({ message: error });
    }
});

app.post('/ai/learning-path-suggestions', async (req, res) => {
    const {subject, age, grade, level, strength, weakness} = req.body;
    if (!grade || !subject || !age || !level) {
        return res.status(400).json({ message: 'Missing key data' });
    }
    try {
    const output = await createLearningPathSuggestionTeam(subject, age, grade, level, strength, weakness).start()
    if (output.status === 'FINISHED') {
        res.type('json');
        res.send(output.result);
    } else if (output.status === 'BLOCKED') {
        res.status(400).json({ message: 'Workflow is blocked, unable to complete' });
    }
    } catch (error) {
        res.status(400).json({ message: error });
    }
});

app.post('/ai/book-suggestions', async (req, res) => {
    const {subject, age, grade, level, strength, weakness} = req.body;
    if (!grade || !subject || !age || !level) {
        return res.status(400).json({ message: 'Missing key data' });
    }
    try {
    const output = await createBookSuggestionTeam(subject, age, grade, level, strength, weakness).start()
    if (output.status === 'FINISHED') {
        res.type('json');
        res.send(output.result);
    } else if (output.status === 'BLOCKED') {
        res.status(400).json({ message: 'Workflow is blocked, unable to complete' });
    }
    } catch (error) {
        res.status(400).json({ message: error });
    }
});

app.post('/ai/book-information', async (req, res) => {
    const {subject, age, grade, level, strength, weakness} = req.body;
    if (!grade || !subject || !age || !level) {
        return res.status(400).json({ message: 'Missing key data' });
    }
    try {
    const output = await createBookSuggestionTeam(subject, age, grade, level, strength, weakness).start()
    if (output.status === 'FINISHED') {
        res.type('json');
        res.send(output.result);
    } else if (output.status === 'BLOCKED') {
        res.status(400).json({ message: 'Workflow is blocked, unable to complete' });
    }
    } catch (error) {
        res.status(400).json({ message: error });
    }
});

app.post('/ai/book-inquiry', async (req, res) => {
    const {subject, age, grade, level, book, authors, question} = req.body;
    if (!subject || !age || !grade || !level || !book || !authors || !question) {
        return res.status(400).json({ message: 'Missing key data' });
    }
    try {
    const output = await createBookInquiryTeam(subject, age, grade, level, book, authors, question).start()
    if (output.status === 'FINISHED') {
        res.type('text');
        res.send(output.result);
    } else if (output.status === 'BLOCKED') {
        res.status(400).json({ message: 'Workflow is blocked, unable to complete' });
    }
    } catch (error) {
        res.status(400).json({ message: error });
    }
});

// Start the server
// const PORT = 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });

// Firebase function export
exports.api = functions.https.onRequest(app);