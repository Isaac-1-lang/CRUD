const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const Student = require('./models/models');  // Ensure the model path is correct

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3222;

// Middleware to handle JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup MongoDB connection
mongoose.connect('mongodb://localhost:27017/Students').then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("MongoDB connection error: ", err);
});

// Setup Multer for file uploads (images)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes

// Create - Add a new student
app.post('/students', upload.single('image'), async (req, res) => {
    try {
        const { FullName, age, grade } = req.body;
        if(!FullName || !age || !grade) {
            return res.status(400).json({ message: ' All required fields must be provided'})
        }
        const image = req.file ? req.file.path : null;
        const newStudent = new Student({ FullName, age, grade, image });
        await newStudent.save();
        res.status(201).json({ message: 'Student created successfully', Student: newStudent });
    } catch (err) {
        res.status(500).json({ message: 'Error creating student', error: err });
    }
});

// Read - Get all students
app.get('/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving students', error: err });
    }
});

// Read - Get a single student by ID
app.get('/student/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json(student);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving student's Id", error: err });
    }
});

// Update - Update student's info by ID
app.put('/students/:id', upload.single('image'), async (req, res) => {
    try {
        const { FullName, age, grade } = req.body;
        const image = req.file ? req.file.path : undefined;  // Only update image if uploaded
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, { FullName, age, grade, image }, { new: true });
        if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json({ message: 'Student updated successfully', student: updatedStudent });
    } catch (err) {
        res.status(500).json({ message: 'Error updating student', error: err });
    }
});

// Delete - Delete a student by ID
app.delete('/students/:id', async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        if (!deletedStudent) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json({ message: 'Student deleted successfully', student: deletedStudent });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting student', error: err });
    }
});

// Starting the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
