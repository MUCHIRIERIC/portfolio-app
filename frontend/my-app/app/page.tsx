"use client";

import React, { useState, useEffect } from 'react';

// ==========================================
// API CONFIGURATION
// ==========================================
const API_URL = 'https://portfolio-app-1-pcbs.onrender.com/api';

// ==========================================
// REUSABLE HOOK FOR GRID LAYOUT
// ==========================================
function useGridLayout(items = []) {
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check screen size on mount and resize
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Phone: 2 cols x 2 rows = 4 items. Desktop: 4 cols x 2 rows = 8 items.
  const maxVisible = isMobile ? 4 : 8;
  const visibleItems = showAll ? items : items.slice(0, maxVisible);
  const hasMore = items.length > maxVisible && !showAll;

  return { visibleItems, hasMore, setShowAll };
}

export default function PortfolioApp() {
  // --- STATE ---
  const [data, setData] = useState({
    profile: { name: '', profession: '', heroMedia: [], profilePictureUrl: '' },
    skills: [],
    education: [],
    certifications: [],
    projects: []
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/portfolio-data`); 
      const result = await res.json();
      setData({
        profile: result.profile || { name: '', profession: '', heroMedia: [], profilePictureUrl: '' },
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
    <div className="min-h-screen font-sans bg-gray-50 text-gray-900 overflow-x-hidden pt-28 md:pt-20">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50 px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3 border-b border-gray-200">
        <div className="flex justify-between w-full md:w-auto items-center">
          <div className="text-2xl font-bold text-blue-600 tracking-tight">{data.profile.name || 'Portfolio'}</div>
          
          {/* Mobile Admin Toggles */}
          <div className="flex space-x-3 md:hidden">
            <button onClick={() => setIsAdmin(false)} className={`text-sm font-bold ${!isAdmin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Portfolio</button>
            <button onClick={() => setIsAdmin(true)} className={`text-sm font-bold ${isAdmin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Admin</button>
          </div>
        </div>

        {/* Scrollable Navigation Links (Only visible in Portfolio view) */}
        {!isAdmin && (
          <div className="flex space-x-4 md:space-x-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 text-sm font-bold text-gray-700 whitespace-nowrap scrollbar-hide">
             <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
             <a href="#skills" className="hover:text-blue-600 transition-colors">Skills</a>
             <a href="#education" className="hover:text-blue-600 transition-colors">Education & Certification</a>
             <a href="#projects" className="hover:text-blue-600 transition-colors">Projects</a>
             <a href="#contact" className="hover:text-blue-600 transition-colors">Messages</a>
             <a href="#contact" className="hover:text-blue-600 transition-colors">Contacts</a>
          </div>
        )}

        {/* Desktop Admin Toggles */}
        <div className="hidden md:flex space-x-4 flex-shrink-0">
          <button onClick={() => setIsAdmin(false)} className={`px-4 py-2 rounded-lg font-bold transition-colors ${!isAdmin ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>Portfolio</button>
          <button onClick={() => setIsAdmin(true)} className={`px-4 py-2 rounded-lg font-bold transition-colors ${isAdmin ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>Admin Panel</button>
        </div>
      </nav>

      <div>
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
      <div id="about"><HeroSection profile={data.profile} /></div>
      <div id="skills"><SkillsSection skills={data.skills} /></div>
      <div id="projects"><ProjectsSection projects={data.projects} /></div>
      
      <div id="education" className="w-full">
        <EducationSection education={data.education} />
        <CertificationsSection certifications={data.certifications} />
      </div>
      
      <div id="contact"><ContactSection /></div>
      
      <WhatsAppButton />
    </main>
  );
}

function HeroSection({ profile }: any) {
  const [mediaIndex, setMediaIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scrambled, setScrambled] = useState({ name: '', profession: '' });
  
  useEffect(() => {
    if (!profile.heroMedia || profile.heroMedia.length === 0) return;
    const interval = setInterval(() => {
      setMediaIndex((prev) => (prev + 1) % profile.heroMedia.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [profile.heroMedia]);

  useEffect(() => {
    if (!profile.name) return; 

    setIsRevealed(false);
    const chars = '0123456789ABCDEF@#$%^&*<>/?{}[]';
    
    const scrambleInterval = setInterval(() => {
      setScrambled({
        name: Array.from({ length: profile.name.length || 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
        profession: Array.from({ length: profile.profession?.length || 15 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      });
    }, 50);

    const revealTimer = setTimeout(() => {
      clearInterval(scrambleInterval);
      setIsRevealed(true);
    }, 2000); 

    return () => {
      clearInterval(scrambleInterval);
      clearTimeout(revealTimer);
    };
  }, [profile.name, profile.profession]);

  const currentMedia = profile.heroMedia?.[mediaIndex];

  return (
    <section className="relative h-screen flex items-center justify-center bg-gray-900 overflow-hidden mt-[-80px]">
      <div className="absolute inset-0 opacity-40 z-0">
        {currentMedia?.mediaType === 'video' ? (
          <video src={currentMedia.url} autoPlay loop muted className="w-full h-full object-cover" />
        ) : (
          <img src={currentMedia?.url || 'https://placehold.co/1920x1080?text=+'} alt="Hero Background" className="w-full h-full object-cover transition-opacity duration-1000" />
        )}
      </div>

      <div className="z-10 flex flex-col md:flex-row items-center justify-center gap-8 text-white p-6 max-w-5xl mx-auto">
        {/* Profile Picture rendered on the left of Name */}
        {profile.profilePictureUrl && (
          <img 
            src={profile.profilePictureUrl} 
            alt="Profile" 
            className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white shadow-2xl object-cover flex-shrink-0" 
          />
        )}
        
        <div className="text-center md:text-left">
          <h1 className={`text-5xl md:text-7xl font-extrabold tracking-tight mb-4 min-h-[80px] ${!isRevealed ? 'font-mono text-green-400' : ''}`}>
            {isRevealed ? profile.name : scrambled.name}
          </h1>
          <div className="h-[40px]">
             {/* Profession rendered in Bold */}
             <p className={`text-2xl md:text-3xl font-bold ${!isRevealed ? 'font-mono text-green-400' : 'text-blue-300 animate-pulse'}`}>
               {isRevealed ? profile.profession : scrambled.profession}
             </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SkillsSection({ skills }: any) {
  const [activeSkill, setActiveSkill] = useState(null);
  const { visibleItems, hasMore, setShowAll } = useGridLayout(skills);

  return (
    <section className="py-20 bg-white px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">My Skills</h2>
        
        {/* Grid dynamically adjusts to 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {visibleItems.map((skill: any) => (
            <div 
              key={skill._id} 
              onClick={() => setActiveSkill(activeSkill === skill._id ? null : skill._id)}
              className="cursor-pointer group relative bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 p-6 flex flex-col items-center"
            >
              <img src={skill.imageUrl} alt={skill.title} className="w-20 h-20 object-contain mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-center">{skill.title}</h3>
              
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
        
        {hasMore && (
          <div className="text-center mt-12">
            <button onClick={() => setShowAll(true)} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 shadow-md transition-all">
              More Skills
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectsSection({ projects }: any) {
  const { visibleItems, hasMore, setShowAll } = useGridLayout(projects);

  return (
    <section className="py-20 bg-gray-50 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Featured Projects</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {visibleItems.map((project: any) => (
            <div 
              key={project._id}
              onClick={() => window.open(project.projectUrl, '_blank')}
              className="flex flex-col cursor-pointer bg-white rounded-xl shadow-sm overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
            >
              <img src={project.imageUrl} alt={project.title} className="w-full h-32 md:h-40 object-cover" />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1 line-clamp-1">{project.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {project.techStack?.slice(0, 3).map((tech: any, i: any) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-12">
            <button onClick={() => setShowAll(true)} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 shadow-md transition-all">
              More Projects
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function EducationSection({ education }: any) {
  const { visibleItems, hasMore, setShowAll } = useGridLayout(education);

  return (
    <section className="py-20 bg-white px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Education</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {visibleItems.map((edu: any) => (
            <div key={edu._id} className="bg-gray-50 p-6 rounded-xl shadow-sm border-t-4 border-blue-500 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold line-clamp-2 mb-1">{edu.degree}</h3>
              <p className="text-blue-600 font-medium text-sm mb-2 line-clamp-1">{edu.institution}</p>
              <p className="text-xs text-gray-500 mb-3">{edu.startDate} - {edu.endDate}</p>
              <p className="text-sm text-gray-700 line-clamp-4">{edu.description}</p>
            </div>
          ))}
        </div>
        
        {hasMore && (
          <div className="text-center mt-12">
            <button onClick={() => setShowAll(true)} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 shadow-md transition-all">
              More Education
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function CertificationsSection({ certifications }: any) {
  const { visibleItems, hasMore, setShowAll } = useGridLayout(certifications);

  return (
    <section className="py-20 bg-gray-50 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Certifications</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {visibleItems.map((cert: any) => (
            <div key={cert._id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{cert.title}</h3>
                <p className="text-gray-600 text-sm mb-1 line-clamp-1">{cert.issuer}</p>
                <p className="text-gray-500 text-xs mb-4">{cert.dateEarned}</p>
              </div>
              {cert.credentialUrl && (
                <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-center w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm font-bold">
                  View Credential
                </a>
              )}
            </div>
          ))}
        </div>
        
        {hasMore && (
          <div className="text-center mt-12">
            <button onClick={() => setShowAll(true)} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 shadow-md transition-all">
              More Certifications
            </button>
          </div>
        )}
      </div>
    </section>
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
    <section className="py-20 bg-white px-4 border-t border-gray-100">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8">Get In Touch</h2>
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="grid md:grid-cols-2 gap-6">
            <input type="text" placeholder="Your Name" required className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="email" placeholder="Your Email" required className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <textarea placeholder="Your Message" required rows={5} className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium" 
            value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
          <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md">
            Send Message
          </button>
          {status && <p className="text-center mt-4 font-bold text-blue-600">{status}</p>}
        </form>
      </div>
    </section>
  );
}

function WhatsAppButton() {
  return (
    <a 
      href="https://wa.me/254700000000" // Replace this placeholder with your exact phone number
      target="_blank" 
      rel="noopener noreferrer" 
      className="fixed bottom-6 left-6 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#1ebd5a] hover:scale-110 transition-transform z-50 flex items-center justify-center cursor-pointer"
      title="Contact on WhatsApp"
    >
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.031 0C5.385 0 0 5.386 0 12.033c0 2.12.551 4.195 1.597 6.012L.416 23.586l5.728-1.503c1.745.952 3.738 1.455 5.887 1.455 6.645 0 12.03-5.386 12.03-12.032C24.062 5.386 18.676 0 12.031 0zm0 21.606c-1.802 0-3.562-.486-5.111-1.405l-.367-.217-3.796.995 1.015-3.698-.238-.378a10.05 10.05 0 0 1-1.537-5.37C2.001 5.922 7.426.5 12.031.5c4.606 0 10.03 5.423 10.03 11.034 0 5.61-5.425 11.033-10.03 11.033zm5.503-7.518c-.302-.152-1.782-.88-2.059-.98-.276-.1-.477-.152-.678.152-.202.304-.778.981-.954 1.183-.176.202-.353.228-.654.076-.302-.152-1.274-.47-2.428-1.501-.898-.802-1.504-1.792-1.68-2.095-.176-.303-.018-.466.133-.618.135-.136.302-.353.453-.53.151-.176.201-.303.302-.504.101-.202.05-.38-.025-.531-.076-.151-.678-1.636-.928-2.242-.243-.591-.49-.51-.678-.52-.176-.01-.377-.01-.578-.01-.202 0-.528.076-.805.38-.277.303-1.055 1.03-1.055 2.512 0 1.482 1.08 2.916 1.231 3.118.151.202 2.127 3.243 5.148 4.544.719.31 1.281.496 1.719.635.722.23 1.38.197 1.895.12.576-.086 1.782-.728 2.033-1.43.251-.703.251-1.306.176-1.432-.075-.127-.276-.202-.578-.354z"/>
      </svg>
    </a>
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
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
          />
          <input 
            type="password" 
            required
            placeholder="Admin Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
          />
          {loginError && <p className="text-red-500 text-sm font-bold">{loginError}</p>}
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
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 mt-10">
      <div className="w-full md:w-64 flex flex-col gap-2">
        {['Profile', 'Skills', 'Projects', 'Education', 'Messages'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`p-4 text-left rounded-lg font-bold transition-colors ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'}`}
          >
            Manage {tab}
          </button>
        ))}
      </div>

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

// Admin Form for Profile
function AdminProfile({ profile, refreshData, email, password }: any) {
  const [formData, setFormData] = useState({ 
    name: profile.name || '', 
    profession: profile.profession || '', 
    heroMedia: profile.heroMedia || [],
    profilePictureUrl: profile.profilePictureUrl || ''
  });
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
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
          <input type="text" className="w-full p-3 border rounded-lg font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Profession / Title</label>
          <input type="text" className="w-full p-3 border rounded-lg font-medium" value={formData.profession} onChange={e => setFormData({...formData, profession: e.target.value})} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Profile Picture URL</label>
        <input type="text" placeholder="https://your-image-link.com/avatar.jpg" className="w-full p-3 border rounded-lg font-medium" value={formData.profilePictureUrl} onChange={e => setFormData({...formData, profilePictureUrl: e.target.value})} />
      </div>
      
      <div className="border-t pt-6 mt-6">
        <label className="block text-sm font-bold text-gray-700 mb-4">Background Media (Hero Section)</label>
        
        <div className="space-y-3 mb-4">
          {formData.heroMedia.map((media: any, index: number) => (
            <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
              <span className="text-sm truncate mr-4"><strong className="capitalize">{media.mediaType}:</strong> {media.url}</span>
              <button type="button" onClick={() => removeMedia(index)} className="text-red-500 font-bold hover:text-red-700">Remove</button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-2">
          <select 
            value={newMedia.mediaType} 
            onChange={(e) => setNewMedia({...newMedia, mediaType: e.target.value})}
            className="p-3 border rounded-lg bg-white font-medium"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <input 
            type="text" 
            placeholder="Media URL" 
            value={newMedia.url} 
            onChange={(e) => setNewMedia({...newMedia, url: e.target.value})}
            className="flex-1 p-3 border rounded-lg font-medium"
          />
          <button type="button" onClick={addMedia} className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200">
            Add
          </button>
        </div>
      </div>

      <button type="submit" className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md">Save Changes</button>
    </form>
  );
}

// Reusable Admin List & Add/Edit Form for arrays
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
      <div className="space-y-4 mb-10">
        {items.map((item: any) => (
          <div key={item._id} className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="font-bold">{item.title || item.institution}</p>
              <p className="text-sm text-gray-500">{item.description?.substring(0, 50)}...</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(item)} className="px-4 py-2 bg-yellow-100 text-yellow-700 font-bold rounded hover:bg-yellow-200">Edit</button>
              <button onClick={() => handleDelete(endpoint, item._id)} className="px-4 py-2 bg-red-100 text-red-600 font-bold rounded hover:bg-red-200">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-bold mb-4 pt-6 border-t">{editId ? 'Edit Item' : 'Add New Item'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field: any) => (
          <input 
            key={field} type="text" placeholder={field.charAt(0).toUpperCase() + field.slice(1)} required 
            className="w-full p-3 border rounded-lg font-medium"
            value={formData[field] || ''} onChange={e => setFormData({...formData, [field]: e.target.value})}
          />
        ))}
        <div className="flex gap-4">
          <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm">
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
      {messages.length === 0 ? <p className="font-bold text-gray-500">No messages yet.</p> : messages.map((msg: any) => (
        <div key={msg._id} className="p-4 bg-gray-50 border rounded-lg">
          <p className="font-bold text-lg">{msg.name} <span className="text-sm font-normal text-gray-500">&lt;{msg.email}&gt;</span></p>
          <p className="mt-2 text-gray-800 font-medium">{msg.message}</p>
          <p className="text-xs text-gray-400 mt-2 font-bold">{new Date(msg.submittedAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
