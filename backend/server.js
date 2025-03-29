const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Allow requests from React frontend

const folderPath = path.join(__dirname, 'students');
const filePath = path.join(folderPath, 'students.json');

// Ensure the folder exists
if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log('Folder created:', folderPath);
}

// API to save student data
app.post('/save-student', (req, res) => {
    
    const { studentId, email, age, grade } = req.body;

    if (!studentId || !email || !age || !grade) {
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
    students[studentId] = {
        email,
        age,
        grade,
        lastInteractedWith: new Date().toISOString()
    };

    // Write updated data to the file
    fs.writeFileSync(filePath, JSON.stringify(students, null, 2), 'utf8');

    res.json({ message: `Student ${studentId} data saved.` });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
