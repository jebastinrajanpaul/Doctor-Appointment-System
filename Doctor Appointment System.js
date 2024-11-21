// Users Collection
{
  "_id": ObjectId,
  "name": String,
  "email": String,
  "password": String,
  "role": String (patient/doctor)
}

// Doctors Collection
{
  "_id": ObjectId,
  "name": String,
  "specialty": String,
  "availability": [
    {
      "day": String,
      "startTime": Date,
      "endTime": Date
    }
  ],
  "profilePicture": String,
  "bio": String
}

// Appointments Collection
{
  "_id": ObjectId,
  "patientId": ObjectId,
  "doctorId": ObjectId,
  "appointmentDate": Date,
  "startTime": Date,
  "endTime": Date,
  "status": String (pending/confirmed/canceled),
  "reminderSent": Boolean
}

// Payments Collection (optional)
{
  "_id": ObjectId,
  "appointmentId": ObjectId,
  "paymentMethod": String,
  "amount": Number,
  "paymentDate": Date
}


Backend (Node.js/Express):


const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/doctor-appointment-system', { useNewUrlParser: true, useUnifiedTopology: true });

// Define routes
app.post('/register', registerUser);
app.post('/login', loginUser);
app.get('/doctors', getDoctors);
app.post('/appointments', createAppointment);
app.get('/appointments', getAppointments);
app.put('/appointments/:id', updateAppointment);
app.delete('/appointments/:id', deleteAppointment);
app.post('/payment', processPayment);

// Define middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Start server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

// Register user
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, role });
  await user.save();
  res.send('User registered successfully');
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).send('Invalid email or password');
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) return res.status(401).send('Invalid email or password');
  const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
  res.send({ token });
};

// Get doctors
const getDoctors = async (req, res) => {
  const doctors = await Doctor.find();
  res.send(doctors);
};

// Create appointment
const createAppointment = async (req, res) => {
  const { patientId, doctorId, appointmentDate, startTime, endTime } = req.body;
  const appointment = new Appointment({ patientId, doctorId, appointmentDate, startTime, endTime });
  await appointment.save();
  res.send('Appointment created successfully');
};

// Send appointment reminder
const sendReminder = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId);
  const patient = await User.findById(appointment.patientId);
  const doctor = await Doctor.findById(appointment.doctorId);
  const transporter = nodemailer.createTransport({
    host: '(link unavailable)',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: patient.email,
    subject: 'Appointment Reminder',
    text: `Hello ${patient.name}, you have an appointment with Dr. ${doctor.name} on ${appointment.appointmentDate} at ${appointment.startTime}.`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return console.log(error);
    console.log('Email sent successfully');
  });
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = new twilio(accountSid, authToken);
  client.messages }
