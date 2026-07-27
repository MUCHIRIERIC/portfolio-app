"use client";

import React, { useState, useEffect } from 'react';

// ==========================================
// API CONFIGURATION
// ==========================================
const API_URL = 'http://localhost:5000/api';

export default function PortfolioApp() {
  // --- STATE ---
  const [data, setData] = useState({
    profile: { name: '', profession: '', heroMedia: [] },
    skills: [],
    education: [],
    certifications: [],
    projects: []
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Toggle between Portfolio and Admin Panel

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/portfolio-data`); // Fetches all data in one request
      const result = await res.json();
      setData({
        profile: result.profile || { name: '', profession: '', heroMedia: [] },
        skills: result.skills || [],
        education: result.education || [],
        certifications: result.certifications || [],
        projects: result.projects || []
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-900 text-white text-2xl">Loading...</div>;

  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 p-4 flex justify-between items-center">
        <div className="text-xl font-bold text-blue-600">{data.profile.name || 'Portfolio'}</div>
        <div className="space-x-4">
          <button onClick={() => setIsAdmin(false)} className={`font-medium ${!isAdmin ? 'text-blue-600' : 'text-gray-600'}`}>Portfolio</button>
          <button onClick={() => setIsAdmin(true)} className={`font-medium ${isAdmin ? 'text-blue-600' : 'text-gray-600'}`}>Admin Panel</button>
        </div>
      </nav>

      <div className="pt-16">
        {isAdmin ? <AdminPanel data={data} refreshData={fetchData} /> : <PortfolioView data={data} />}
      </div>
    </div>
  );
}

// ==========================================
// PORTFOLIO VIEW COMPONENTS
// ==========================================

function PortfolioView({ data }: any) {
  return (
    <main>
      <HeroSection profile={data.profile} />
      <SkillsSection skills={data.skills} />
      <ProjectsSection projects={data.projects} />
      
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 py-16 px-4">
        <EducationSection education={data.education} />
        <CertificationsSection certifications={data.certifications} />
      </div>
      
      <ContactSection />
    </main>
  );
}

function HeroSection({ profile }: any) {
  const [mediaIndex, setMediaIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scrambled, setScrambled] = useState({ name: '', profession: '' });
  
  // 8-second Alternating Media Effect
  useEffect(() => {
    if (!profile.heroMedia || profile.heroMedia.length === 0) return;
    const interval = setInterval(() => {
      setMediaIndex((prev) => (prev + 1) % profile.heroMedia.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [profile.heroMedia]);

  // Random Code Running Reveal Effect
  useEffect(() => {
    if (!profile.name) return; // Wait until data is loaded

    setIsRevealed(false);
    const chars = '0123456789ABCDEF@#$%^&*<>/?{}[]';
    
    const scrambleInterval = setInterval(() => {
      setScrambled({
        name: Array.from({ length: profile.name.length || 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
        profession: Array.from({ length: profile.profession?.length || 15 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      });
    }, 50); // Speed of the running code

    const revealTimer = setTimeout(() => {
      clearInterval(scrambleInterval);
      setIsRevealed(true);
    }, 2000); // Reveals after 2 seconds

    return () => {
      clearInterval(scrambleInterval);
      clearTimeout(revealTimer);
    };
  }, [profile.name, profile.profession]);

  const currentMedia = profile.heroMedia?.[mediaIndex];

  return (
    <section className="relative h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      {/* Dynamic Background Media */}
      <div className="absolute inset-0 opacity-40 z-0">
        {currentMedia?.mediaType === 'video' ? (
          <video src={currentMedia.url} autoPlay loop muted className="w-full h-full object-cover" />
        ) : (
          <img src={currentMedia?.url || 'https://placehold.co/1920x1080?text=Welcome'} alt="Hero" className="w-full h-full object-cover transition-opacity duration-1000" />
        )}
      </div>

      <div className="z-10 text-center text-white p-4">
        <h1 className={`text-5xl md:text-7xl font-extrabold tracking-tight mb-4 min-h-[80px] ${!isRevealed ? 'font-mono text-green-400' : ''}`}>
          {isRevealed ? profile.name : scrambled.name}
        </h1>
        <div className="h-[40px]">
           <p className={`text-2xl md:text-3xl font-light ${!isRevealed ? 'font-mono text-green-400' : 'text-blue-300 animate-pulse'}`}>
             {isRevealed ? profile.profession : scrambled.profession}
           </p>
        </div>
      </div>
    </section>
  );
}

function SkillsSection({ skills }: any) {
  const [activeSkill, setActiveSkill] = useState(null);

  return (
    <section className="py-20 bg-white px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">My Skills</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {skills.map((skill: any) => (
            <div 
              key={skill._id} 
              onClick={() => setActiveSkill(activeSkill === skill._id ? null : skill._id)}
              className="cursor-pointer group relative bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 p-6 flex flex-col items-center"
            >
              <img src={skill.imageUrl} alt={skill.title} className="w-20 h-20 object-contain mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold">{skill.title}</h3>
              
              {/* Click to view more details */}
              {activeSkill === skill._id && (
                <div className="mt-4 text-sm text-gray-600 text-center bg-blue-50 p-3 rounded-lg w-full">
                  <p>{skill.description}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${skill.proficiency}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectsSection({ projects }: any) {
  return (
    <section className="py-20 bg-gray-50 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Featured Projects</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((project: any) => (
            <div 
              key={project._id}
              onClick={() => window.open(project.projectUrl, '_blank')}
              className="cursor-pointer bg-white rounded-xl shadow-md overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
            >
              <img src={project.imageUrl} alt={project.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.techStack?.map((tech: any, i: any) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EducationSection({ education }: any) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 border-b pb-2 border-gray-200">Education</h2>
      <div className="space-y-6">
        {education.map((edu: any) => (
          <div key={edu._id} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <h3 className="text-xl font-bold">{edu.degree}</h3>
            <p className="text-blue-600 font-medium">{edu.institution}</p>
            <p className="text-sm text-gray-500 mb-2">{edu.startDate} - {edu.endDate}</p>
            <p className="text-gray-700">{edu.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificationsSection({ certifications }: any) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 border-b pb-2 border-gray-200">Certifications</h2>
      <div className="space-y-4">
        {certifications.map((cert: any) => (
          <div key={cert._id} className="bg-white p-5 rounded-lg shadow-sm flex justify-between items-center hover:bg-gray-50">
            <div>
              <h3 className="font-bold text-lg">{cert.title}</h3>
              <p className="text-gray-600 text-sm">{cert.issuer} • {cert.dateEarned}</p>
            </div>
            {cert.credentialUrl && (
              <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                View
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }); 
      setStatus('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus('Failed to send message.');
    }
  };

  return (
    <section className="py-20 bg-white px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8">Get In Touch</h2>
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="grid md:grid-cols-2 gap-6">
            <input type="text" placeholder="Your Name" required className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="email" placeholder="Your Email" required className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <textarea placeholder="Your Message" required rows={5} className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
            value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
          <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
            Send Message
          </button>
          {status && <p className="text-center mt-4 font-medium text-blue-600">{status}</p>}
        </form>
      </div>
    </section>
  );
}

// ==========================================
// ADMIN PANEL COMPONENT
// ==========================================

function AdminPanel({ data, refreshData }: any) {
  const [activeTab, setActiveTab] = useState('Profile');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        const errData = await response.json();
        setLoginError(errData.error || 'Invalid credentials');
      }
    } catch (error) {
      setLoginError('Server error. Please try again.');
    }
  };

  const handleDelete = async (endpoint: any, id: any) => {
    if(window.confirm('Are you sure you want to delete this?')) {
      await fetch(`${API_URL}/admin/${endpoint}/${id}`, { 
        method: 'DELETE',
        headers: { 
          'x-admin-email': email,
          'x-admin-password': password 
        }
      }); 
      refreshData();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-md border text-center">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            required
            placeholder="Admin Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
          />
          <input 
            type="password" 
            required
            placeholder="Admin Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
          />
          {loginError && <p className="text-red-500 text-sm font-medium">{loginError}</p>}
          <button 
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Enter Admin Panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
      {/* Admin Sidebar */}
      <div className="w-full md:w-64 flex flex-col gap-2">
        {['Profile', 'Skills', 'Projects', 'Education', 'Messages'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`p-4 text-left rounded-lg font-bold transition-colors ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'bg-white hover:bg-gray-100 text-gray-700'}`}
          >
            Manage {tab}
          </button>
        ))}
      </div>

      {/* Admin Content Area */}
      <div className="flex-1 bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold mb-8">Manage {activeTab}</h2>

        {activeTab === 'Profile' && <AdminProfile profile={data.profile} refreshData={refreshData} email={email} password={password} />}
        {activeTab === 'Skills' && <AdminGenericList items={data.skills} endpoint="skills" fields={['title', 'imageUrl', 'description', 'proficiency']} refreshData={refreshData} handleDelete={handleDelete} email={email} password={password} />}
        {activeTab === 'Projects' && <AdminGenericList items={data.projects} endpoint="projects" fields={['title', 'imageUrl', 'description', 'projectUrl']} refreshData={refreshData} handleDelete={handleDelete} email={email} password={password} />}
        {activeTab === 'Education' && <AdminGenericList items={data.education} endpoint="education" fields={['institution', 'degree', 'startDate', 'endDate', 'description']} refreshData={refreshData} handleDelete={handleDelete} email={email} password={password} />}
        {activeTab === 'Messages' && <AdminMessages email={email} password={password} />}
      </div>
    </div>
  );
}

// Admin Form for Profile (Landing Page)
function AdminProfile({ profile, refreshData, email, password }: any) {
  const [formData, setFormData] = useState({ name: profile.name, profession: profile.profession, heroMedia: profile.heroMedia || [] });
  const [newMedia, setNewMedia] = useState({ mediaType: 'image', url: '' });

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/admin/profile`, { 
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json', 
        'x-admin-email': email,
        'x-admin-password': password 
      },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      alert('Profile updated!');
      refreshData();
    } else {
      alert('Failed to update profile. Check credentials.');
    }
  };

  const addMedia = () => {
    if (!newMedia.url) return;
    setFormData({ ...formData, heroMedia: [...formData.heroMedia, newMedia] });
    setNewMedia({ mediaType: 'image', url: '' });
  };

  const removeMedia = (index: number) => {
    const updated = formData.heroMedia.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, heroMedia: updated });
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
        <input type="text" className="w-full p-3 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Profession / Title</label>
        <input type="text" className="w-full p-3 border rounded-lg" value={formData.profession} onChange={e => setFormData({...formData, profession: e.target.value})} />
      </div>
      
      <div className="border-t pt-6">
        <label className="block text-sm font-bold text-gray-700 mb-4">Background Media (Hero Section)</label>
        
        {/* Existing Media List */}
        <div className="space-y-3 mb-4">
          {formData.heroMedia.map((media: any, index: number) => (
            <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
              <span className="text-sm truncate mr-4"><strong className="capitalize">{media.mediaType}:</strong> {media.url}</span>
              <button type="button" onClick={() => removeMedia(index)} className="text-red-500 font-bold hover:text-red-700">Remove</button>
            </div>
          ))}
        </div>

        {/* Add New Media Controls */}
        <div className="flex gap-2 mb-2">
          <select 
            value={newMedia.mediaType} 
            onChange={(e) => setNewMedia({...newMedia, mediaType: e.target.value})}
            className="p-3 border rounded-lg bg-white"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <input 
            type="text" 
            placeholder="Media URL" 
            value={newMedia.url} 
            onChange={(e) => setNewMedia({...newMedia, url: e.target.value})}
            className="flex-1 p-3 border rounded-lg"
          />
          <button type="button" onClick={addMedia} className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200">
            Add
          </button>
        </div>
      </div>

      <button type="submit" className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">Save Changes</button>
    </form>
  );
}

// Reusable Admin List & Add/Edit Form for arrays (Skills, Projects, Education)
function AdminGenericList({ items, endpoint, fields, refreshData, handleDelete, email, password }: any) {
  const initialFormState = fields.reduce((acc: any, field: any) => ({ ...acc, [field]: '' }), {});
  const [formData, setFormData] = useState(initialFormState);
  const [editId, setEditId] = useState(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const url = editId ? `${API_URL}/admin/${endpoint}/${editId}` : `${API_URL}/admin/${endpoint}`;
    const method = editId ? 'PUT' : 'POST';

    const res = await fetch(url, { 
      method: method,
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-email': email,
        'x-admin-password': password 
      },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setFormData(initialFormState);
      setEditId(null);
      refreshData();
    } else {
      alert(`Failed to ${editId ? 'update' : 'add'} item. Check credentials.`);
    }
  };

  const handleEdit = (item: any) => {
    setEditId(item._id);
    const formPopulate = { ...item };
    setFormData(formPopulate);
  };

  return (
    <div>
      {/* List Existing Items */}
      <div className="space-y-4 mb-10">
        {items.map((item: any) => (
          <div key={item._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="font-bold">{item.title || item.institution}</p>
              <p className="text-sm text-gray-500">{item.description?.substring(0, 50)}...</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(item)} className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">Edit</button>
              <button onClick={() => handleDelete(endpoint, item._id)} className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Form */}
      <h3 className="text-xl font-bold mb-4 pt-6 border-t">{editId ? 'Edit Item' : 'Add New Item'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field: any) => (
          <input 
            key={field} type="text" placeholder={field.charAt(0).toUpperCase() + field.slice(1)} required 
            className="w-full p-3 border rounded-lg"
            value={formData[field] || ''} onChange={e => setFormData({...formData, [field]: e.target.value})}
          />
        ))}
        <div className="flex gap-4">
          <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
            {editId ? `Update ${endpoint}` : `Add to ${endpoint}`}
          </button>
          {editId && (
            <button type="button" onClick={() => { setEditId(null); setFormData(initialFormState); }} className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// Admin Messages Viewer
function AdminMessages({ email, password }: any) {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/admin/messages`, {
      headers: { 
        'x-admin-email': email,
        'x-admin-password': password 
      }
    }) 
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(err => console.error("Error fetching messages:", err));
  }, [email, password]);

  return (
    <div className="space-y-4">
      {messages.length === 0 ? <p>No messages yet.</p> : messages.map((msg: any) => (
        <div key={msg._id} className="p-4 bg-gray-50 border rounded-lg">
          <p className="font-bold text-lg">{msg.name} <span className="text-sm font-normal text-gray-500">&lt;{msg.email}&gt;</span></p>
          <p className="mt-2 text-gray-800">{msg.message}</p>
          <p className="text-xs text-gray-400 mt-2">{new Date(msg.submittedAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
