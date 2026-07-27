// server.js
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // <-- ADD THIS AT LINE 1

require('dotenv').config(); // Loads environment variables from .env if present
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// REQUEST LOGGER MIDDLEWARE
// ==========================================
// Logs every incoming HTTP request to your terminal
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// 1. DATABASE CONNECTION
// ==========================================
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn('⚠️ WARNING: MONGO_URI is not set in your .env file!');
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error Details:');
    console.error(err);
  });

// ==========================================
// 2. MONGOOSE SCHEMAS & MODELS
// ==========================================

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'John Doe' },
  profession: { type: String, required: true, default: 'Full Stack Developer' },
  heroMedia: [{ 
    mediaType: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true } 
  }]
});
const Profile = mongoose.model('Profile', profileSchema);

const skillSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String, required: true },
  proficiency: { type: Number, default: 100 }
});
const Skill = mongoose.model('Skill', skillSchema);

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  description: { type: String }
});
const Education = mongoose.model('Education', educationSchema);

const certificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  dateEarned: { type: String },
  credentialUrl: { type: String }
});
const Certification = mongoose.model('Certification', certificationSchema);

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String, required: true },
  projectUrl: { type: String, required: true },
  techStack: [{ type: String }]
});
const Project = mongoose.model('Project', projectSchema);

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// ==========================================
// 3. PUBLIC API ROUTES
// ==========================================

app.get('/api/portfolio-data', async (req, res) => {
  try {
    const profile = await Profile.findOne() || {};
    const skills = await Skill.find();
    const education = await Education.find().sort({ startDate: -1 });
    const certifications = await Certification.find();
    const projects = await Project.find();

    res.json({ profile, skills, education, certifications, projects });
  } catch (error) {
    console.error('❌ Error fetching portfolio data:', error);
    res.status(500).json({ 
      error: 'Server error fetching portfolio data', 
      details: error.message 
    });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const newMessage = new Contact(req.body);
    await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('❌ Error submitting contact message:', error);
    res.status(400).json({ error: 'Error submitting message', details: error.message });
  }
});

// ==========================================
// 4. ADMIN API ROUTES (Protected)
// ==========================================

// --- Admin Password Middleware ---
// This intercepts all requests to /api/admin/* and requires a specific email and password
const verifyAdmin = (req, res, next) => {
  const providedEmail = req.headers['x-admin-email'];
  const providedPassword = req.headers['x-admin-password'];
  
  const actualPassword = process.env.ADMIN_PASSWORD;

  if (!actualPassword) {
    console.warn('⚠️ WARNING: ADMIN_PASSWORD is not set in your .env file!');
  }

  // Check if the provided credentials match your specific email and password
  if (
    providedEmail && providedEmail.toLowerCase() === 'muchirimunene031@gmail.com' && 
    providedPassword === 'munene398'
  ) {
    next(); // Passwords match, proceed to the route
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid or Missing Admin Credentials' });
  }
};

// Apply the protection to ALL admin routes automatically
app.use('/api/admin', verifyAdmin);

app.put('/api/admin/profile', async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(profile);
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(400).json({ error: 'Error updating profile', details: error.message });
  }
});

app.post('/api/admin/skills', async (req, res) => {
  try {
    const skill = new Skill(req.body);
    await skill.save();
    res.status(201).json(skill);
  } catch (error) { 
    console.error('❌ Error adding skill:', error);
    res.status(400).json({ error: 'Error adding skill', details: error.message }); 
  }
});

app.delete('/api/admin/skills/:id', async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted' });
  } catch (error) { 
    console.error('❌ Error deleting skill:', error);
    res.status(400).json({ error: 'Error deleting skill', details: error.message }); 
  }
});

app.post('/api/admin/education', async (req, res) => {
  try {
    const edu = new Education(req.body);
    await edu.save();
    res.status(201).json(edu);
  } catch (error) { 
    console.error('❌ Error adding education:', error);
    res.status(400).json({ error: 'Error adding education', details: error.message }); 
  }
});

app.delete('/api/admin/education/:id', async (req, res) => {
  try {
    await Education.findByIdAndDelete(req.params.id);
    res.json({ message: 'Education deleted' });
  } catch (error) { 
    console.error('❌ Error deleting education:', error);
    res.status(400).json({ error: 'Error deleting education', details: error.message }); 
  }
});

app.post('/api/admin/certifications', async (req, res) => {
  try {
    const cert = new Certification(req.body);
    await cert.save();
    res.status(201).json(cert);
  } catch (error) { 
    console.error('❌ Error adding certification:', error);
    res.status(400).json({ error: 'Error adding certification', details: error.message }); 
  }
});

app.delete('/api/admin/certifications/:id', async (req, res) => {
  try {
    await Certification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Certification deleted' });
  } catch (error) { 
    console.error('❌ Error deleting certification:', error);
    res.status(400).json({ error: 'Error deleting certification', details: error.message }); 
  }
});

// --- Projects ---
app.post('/api/admin/projects', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) { 
    console.error('❌ Error adding project:', error);
    res.status(400).json({ error: 'Error adding project', details: error.message }); 
  }
});

// NEW: Edit (Update) an existing project
app.put('/api/admin/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch (error) {
    console.error('❌ Error updating project:', error);
    res.status(400).json({ error: 'Error updating project', details: error.message });
  }
});

app.delete('/api/admin/projects/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) { 
    console.error('❌ Error deleting project:', error);
    res.status(400).json({ error: 'Error deleting project', details: error.message }); 
  }
});

app.get('/api/admin/messages', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ submittedAt: -1 });
    res.json(messages);
  } catch (error) { 
    console.error('❌ Error fetching messages:', error);
    res.status(400).json({ error: 'Error fetching messages', details: error.message }); 
  }
});

// ==========================================
// 5. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
