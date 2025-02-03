const mongoose = require('mongoose');


// Define a student schema

const studentSchema = new mongoose.Schema({
    FullName: {type: String, required:true},
    age: {type:Number, required: true},
    grade: {type:String, required: true},
    image: {type:String, required: false}, // Image's url
    age: {type:Number, required: true}
});

const Student = mongoose.model('Student', studentSchema);// Name of the table and its schema
module.exports = Student;