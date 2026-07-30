// server.js
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added to parse form data

// Expose the 'uploads' directory so the frontend can access the uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request Logger Middleware
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
// 2. MULTER FILE UPLOAD CONFIGURATION
// ==========================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir); // Create uploads folder if it doesn't exist
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Save file with a unique timestamp to prevent overwriting
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit files to 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images are allowed'));
  }
});

// ==========================================
// 3. MONGOOSE SCHEMAS & MODELS
// ==========================================
const profileSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'John Doe' },
  profession: { type: String, required: true, default: 'Full Stack Developer' },
  profilePictureUrl: { type: String, default: 'https://placehold.co/400x400?text=Profile' },
  cvUrl: { type: String, default: '#' },
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
// 4. PUBLIC API ROUTES
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
    res.status(500).json({ error: 'Server error fetching portfolio data', details: error.message });
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
// 5. ADMIN API ROUTES (Protected)
// ==========================================
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email && email.toLowerCase() === 'muchirimunene031@gmail.com' && password === 'munene398') {
    return res.status(200).json({ message: 'Login successful' });
  }
  return res.status(401).json({ error: 'Invalid email or password' });
});

const verifyAdmin = (req, res, next) => {
  const providedEmail = req.headers['x-admin-email'];
  const providedPassword = req.headers['x-admin-password'];
  const actualPassword = process.env.ADMIN_PASSWORD;

  if (!actualPassword) {
    console.warn('⚠️ WARNING: ADMIN_PASSWORD is not set in your .env file!');
  }

  if (providedEmail && providedEmail.toLowerCase() === 'muchirimunene031@gmail.com' && providedPassword === 'munene398') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid or Missing Admin Credentials' });
  }
};

app.use('/api/admin', verifyAdmin);

// === UPDATED PROFILE ROUTE WITH MULTER UPLOAD ===
app.put('/api/admin/profile', upload.single('profilePictureFile'), async (req, res) => {
  try {
    let updateData = { ...req.body };

    // If formData sends arrays (like heroMedia) they arrive as strings. Parse them back to JSON.
    if (typeof updateData.heroMedia === 'string') {
      try {
        updateData.heroMedia = JSON.parse(updateData.heroMedia);
      } catch (e) {
        console.error("Failed to parse heroMedia");
      }
    }

    // If an actual file was uploaded, construct its public URL and override the string URL
    if (req.file) {
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      updateData.profilePictureUrl = fileUrl;
    }

    const profile = await Profile.findOneAndUpdate({}, updateData, { new: true, upsert: true });
    res.json(profile);
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(400).json({ error: 'Error updating profile', details: error.message });
  }
});

// Other Admin Routes (Unchanged)
app.post('/api/admin/skills', async (req, res) => {
  try {
    const skill = new Skill(req.body);
    await skill.save();
    res.status(201).json(skill);
  } catch (error) { res.status(400).json({ error: 'Error adding skill', details: error.message }); }
});

app.delete('/api/admin/skills/:id', async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted' });
  } catch (error) { res.status(400).json({ error: 'Error deleting skill', details: error.message }); }
});

app.post('/api/admin/education', async (req, res) => {
  try {
    const edu = new Education(req.body);
    await edu.save();
    res.status(201).json(edu);
  } catch (error) { res.status(400).json({ error: 'Error adding education', details: error.message }); }
});

app.delete('/api/admin/education/:id', async (req, res) => {
  try {
    await Education.findByIdAndDelete(req.params.id);
    res.json({ message: 'Education deleted' });
  } catch (error) { res.status(400).json({ error: 'Error deleting education', details: error.message }); }
});

app.post('/api/admin/certifications', async (req, res) => {
  try {
    const cert = new Certification(req.body);
    await cert.save();
    res.status(201).json(cert);
  } catch (error) { res.status(400).json({ error: 'Error adding certification', details: error.message }); }
});

app.delete('/api/admin/certifications/:id', async (req, res) => {
  try {
    await Certification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Certification deleted' });
  } catch (error) { res.status(400).json({ error: 'Error deleting certification', details: error.message }); }
});

app.post('/api/admin/projects', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) { res.status(400).json({ error: 'Error adding project', details: error.message }); }
});

app.put('/api/admin/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch (error) { res.status(400).json({ error: 'Error updating project', details: error.message }); }
});

app.delete('/api/admin/projects/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) { res.status(400).json({ error: 'Error deleting project', details: error.message }); }
});

app.get('/api/admin/messages', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ submittedAt: -1 });
    res.json(messages);
  } catch (error) { res.status(400).json({ error: 'Error fetching messages', details: error.message }); }
});

// ==========================================
// 6. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
