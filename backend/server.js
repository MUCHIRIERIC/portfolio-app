const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// ==========================================
// MIDDLEWARE CONFIGURATION
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists and serve statically
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// ==========================================
// MULTER FILE UPLOAD STORAGE SETUP
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ==========================================
// MONGOOSE DATABASE CONNECT
// ==========================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// ==========================================
// DATABASE SCHEMAS & MODELS
// ==========================================
const ProfileSchema = new mongoose.Schema({
  name: { type: String, default: 'John Doe' },
  profession: { type: String, default: 'Full Stack Developer' },
  profilePictureUrl: { type: String, default: '' },
  cvUrl: { type: String, default: '' },
  heroMedia: [{
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    url: { type: String, required: true }
  }]
});

const SkillSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  description: String,
  proficiency: Number
});

const ProjectSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  description: String,
  projectUrl: String,
  techStack: [String]
});

const EducationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  startDate: String,
  endDate: String,
  description: String
});

const CertificationSchema = new mongoose.Schema({
  title: String,
  issuer: String,
  dateEarned: String,
  credentialUrl: String
});

const MessageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  submittedAt: { type: Date, default: Date.now }
});

const Profile = mongoose.model('Profile', ProfileSchema);
const Skill = mongoose.model('Skill', SkillSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Education = mongoose.model('Education', EducationSchema);
const Certification = mongoose.model('Certification', CertificationSchema);
const Message = mongoose.model('Message', MessageSchema);

// Map dynamic endpoints to Models
const modelMap = {
  skills: Skill,
  projects: Project,
  education: Education,
  certifications: Certification
};

// ==========================================
// ADMIN AUTHENTICATION MIDDLEWARE
// ==========================================
const verifyAdmin = (req, res, next) => {
  const adminEmail = req.headers['x-admin-email'];
  const adminPassword = req.headers['x-admin-password'];

  const validEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const validPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (adminEmail === validEmail && adminPassword === validPassword) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid Admin Credentials' });
  }
};

// ==========================================
// PUBLIC ROUTES
// ==========================================

// GET: Complete Portfolio Data
app.get('/api/portfolio-data', async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({});
    }

    const skills = await Skill.find();
    const education = await Education.find();
    const certifications = await Certification.find();
    const projects = await Project.find();

    res.json({
      profile,
      skills,
      education,
      certifications,
      projects
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

// POST: Contact Form Submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newMessage = await Message.create({ name, email, message });
    res.status(201).json({ message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

// POST: Admin Login Check
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const validEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const validPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (email === validEmail && password === validPassword) {
    return res.status(200).json({ message: 'Login successful' });
  }
  return res.status(401).json({ error: 'Invalid admin credentials' });
});

// PUT: Update Profile (Supports both File Uploads and Direct Image URL Links)
app.put('/api/admin/profile', verifyAdmin, upload.single('profilePictureFile'), async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile();
    }

    const { name, profession, cvUrl, profilePictureUrl } = req.body;

    if (name) profile.name = name;
    if (profession) profile.profession = profession;
    if (cvUrl !== undefined) profile.cvUrl = cvUrl;

    // Handle Profile Picture: Priority given to uploaded file binary
    if (req.file) {
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      profile.profilePictureUrl = fileUrl;
    } else if (profilePictureUrl !== undefined) {
      profile.profilePictureUrl = profilePictureUrl;
    }

    // Safely parse heroMedia JSON array sent inside FormData
    if (req.body.heroMedia) {
      try {
        profile.heroMedia = typeof req.body.heroMedia === 'string' 
          ? JSON.parse(req.body.heroMedia) 
          : req.body.heroMedia;
      } catch (err) {
        console.error('Error parsing heroMedia:', err);
      }
    }

    await profile.save();
    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET: Read Messages (Admin Only)
app.get('/api/admin/messages', verifyAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ submittedAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST: Generic Add Endpoint (skills, projects, education, certifications)
app.post('/api/admin/:endpoint', verifyAdmin, async (req, res) => {
  const { endpoint } = req.params;
  const TargetModel = modelMap[endpoint];

  if (!TargetModel) {
    return res.status(404).json({ error: 'Invalid endpoint category' });
  }

  try {
    const newItem = await TargetModel.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: `Failed to create item in ${endpoint}` });
  }
});

// PUT: Generic Update Endpoint
app.put('/api/admin/:endpoint/:id', verifyAdmin, async (req, res) => {
  const { endpoint, id } = req.params;
  const TargetModel = modelMap[endpoint];

  if (!TargetModel) {
    return res.status(404).json({ error: 'Invalid endpoint category' });
  }

  try {
    const updatedItem = await TargetModel.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: `Failed to update item in ${endpoint}` });
  }
});

// DELETE: Generic Delete Endpoint
app.delete('/api/admin/:endpoint/:id', verifyAdmin, async (req, res) => {
  const { endpoint, id } = req.params;
  const TargetModel = modelMap[endpoint];

  if (!TargetModel) {
    return res.status(404).json({ error: 'Invalid endpoint category' });
  }

  try {
    await TargetModel.findByIdAndDelete(id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: `Failed to delete item from ${endpoint}` });
  }
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
