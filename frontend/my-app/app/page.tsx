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
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const maxVisible = isMobile ? 4 : 8;
  const visibleItems = showAll ? items : items.slice(0, maxVisible);
  const hasMore = items.length > maxVisible && !showAll;

  return { visibleItems, hasMore, setShowAll };
}

export default function PortfolioApp() {
  const [data, setData] = useState({
    profile: { 
      name: 'John Doe', 
      profession: 'Full Stack Developer', 
      heroMedia: [], 
      profilePictureUrl: 'https://placehold.co/400x400?text=Profile', 
      cvUrl: '#' 
    },
    skills: [],
    education: [],
    certifications: [],
    projects: []
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/portfolio-data`); 
      const result = await res.json();
      setData({
        profile: {
          name: result.profile?.name || 'John Doe',
          profession: result.profile?.profession || 'Full Stack Developer',
          heroMedia: result.profile?.heroMedia || [],
          profilePictureUrl: result.profile?.profilePictureUrl || 'https://placehold.co/400x400?text=Profile',
          cvUrl: result.profile?.cvUrl || '#'
        },
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

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#0a0f1d] text-white text-2xl font-bold">Loading Portfolio...</div>;

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden pt-24 md:pt-20 ${isDarkMode ? 'bg-[#0a0f1d] text-gray-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full backdrop-blur-md shadow-lg z-50 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b ${isDarkMode ? 'bg-[#0a0f1d]/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <div className="flex justify-between w-full md:w-auto items-center">
          <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent tracking-tight">
            {data.profile.name || 'Portfolio'}
          </div>
          
          <div className="flex space-x-3 md:hidden items-center">
            <button onClick={() => setIsAdmin(false)} className={`p-2 rounded-lg transition-all ${!isAdmin ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400'}`} title="Portfolio">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </button>
            <button onClick={() => setIsAdmin(true)} className={`p-2 rounded-lg transition-all ${isAdmin ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400'}`} title="Admin Panel">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </button>
            
            {/* Mobile Theme Switcher */}
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-300 ml-1" title="Switch Theme">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,1)]" fill="currentColor">
                <path d="M12 2L2 9l10 13 10-13L12 2zm0 2.83L18.34 9H5.66L12 4.83z"/>
              </svg>
            </button>
          </div>
        </div>

        {!isAdmin && (
          <div className="flex space-x-5 md:space-x-8 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 text-sm font-semibold text-slate-300 whitespace-nowrap scrollbar-hide">
             <a href="#about" className="hover:text-blue-400 transition-colors">About</a>
             <a href="#skills" className="hover:text-blue-400 transition-colors">Skills</a>
             <a href="#education" className="hover:text-blue-400 transition-colors">Education & Certification</a>
             <a href="#projects" className="hover:text-blue-400 transition-colors">Projects</a>
             <a href="#contact" className="hover:text-blue-400 transition-colors">Messages</a>
             <a href="#contact" className="hover:text-blue-400 transition-colors">Contacts</a>
          </div>
        )}

        <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
          <button onClick={() => setIsAdmin(false)} className={`p-2.5 rounded-lg font-semibold transition-all flex items-center justify-center ${!isAdmin ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800'}`} title="Portfolio">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </button>
          <button onClick={() => setIsAdmin(true)} className={`p-2.5 rounded-lg font-semibold transition-all flex items-center justify-center ${isAdmin ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800'}`} title="Admin Panel">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
          </button>
          
          {/* Desktop Theme Switcher */}
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-300 ml-2 cursor-pointer" title="Switch Theme">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-cyan-300 drop-shadow-[0_0_12px_rgba(103,232,249,1)]" fill="currentColor">
              <path d="M12 2L2 9l10 13 10-13L12 2zm0 2.83L18.34 9H5.66L12 4.83z"/>
            </svg>
          </button>
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
      
      <div id="education" className="w-full bg-[#070b14]">
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
  
  useEffect(() => {
    if (!profile.heroMedia || profile.heroMedia.length === 0) return;
    const interval = setInterval(() => {
      setMediaIndex((prev) => (prev + 1) % profile.heroMedia.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [profile.heroMedia]);

  const currentMedia = profile.heroMedia?.[mediaIndex];
  const hasImageBackground = profile.heroMedia && profile.heroMedia.length > 0;

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-[#0a0f1d] overflow-hidden px-6 py-20">
      {/* Dynamic Background Media */}
      {hasImageBackground && (
        <div className="absolute inset-0 opacity-25 z-0">
          {currentMedia?.mediaType === 'video' ? (
            <video src={currentMedia.url} autoPlay loop muted className="w-full h-full object-cover" />
          ) : (
            <img 
              src={currentMedia?.url} 
              alt="Hero Background" 
              className="w-full h-full object-cover transition-opacity duration-1000" 
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      )}

      <div className="z-10 flex flex-col md:flex-row items-center justify-center gap-12 max-w-6xl mx-auto w-full">
        
        {/* Profile Picture Container */}
        <div className="flex-shrink-0 relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-lg opacity-40 group-hover:opacity-75 transition duration-500"></div>
          <div className="relative w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-900 shadow-2xl">
            <img 
              src={profile.profilePictureUrl || 'https://placehold.co/400x400?text=Profile'} 
              alt="Profile" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        
        {/* Texts & Actions */}
        <div className="text-center md:text-left flex-1">
          {hasImageBackground && (
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-blue-400 uppercase bg-blue-950/60 border border-blue-800/50 rounded-full">
              Welcome
            </span>
          )}

          {/* Name */}
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
            {profile.name || 'Your Name'}
          </h1>

          {/* Profession */}
          <div className="mb-8">
             <p className="text-xl md:text-2xl font-bold text-slate-300 tracking-wide">
               {profile.profession || 'Professional Title'}
             </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <a 
              href={profile.cvUrl || '#'} 
              target="_blank" 
              rel="noreferrer"
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Download CV
            </a>
            <a 
              href="#contact" 
              className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl transition-all duration-300"
            >
              Get in Touch
            </a>
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
    <section className="py-24 bg-[#070b14] px-6 border-t border-slate-800/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">Core Skills</h2>
          <p className="text-slate-400 text-sm md:text-base">Technologies and proficiencies I work with</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {visibleItems.map((skill: any) => (
            <div 
              key={skill._id} 
              onClick={() => setActiveSkill(activeSkill === skill._id ? null : skill._id)}
              className="cursor-pointer group relative bg-[#0f172a] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-blue-500/40 transition-all duration-300 border border-slate-800 p-6 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 mb-4 p-2 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img src={skill.imageUrl} alt={skill.title} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{skill.title}</h3>
              
              {activeSkill === skill._id && (
                <div className="mt-2 text-xs md:text-sm text-slate-300 text-center bg-slate-900/90 p-3 rounded-xl border border-slate-800 w-full animate-fadeIn">
                  <p className="mb-2">{skill.description}</p>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full" style={{ width: `${skill.proficiency}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {hasMore && (
          <div className="text-center mt-12">
            <button onClick={() => setShowAll(true)} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-bold rounded-xl shadow-lg transition-all">
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
    <section className="py-24 bg-[#0a0f1d] px-6 border-t border-slate-800/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">Featured Projects</h2>
          <p className="text-slate-400 text-sm md:text-base">Recent applications and solutions built</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {visibleItems.map((project: any) => (
            <div 
              key={project._id}
              onClick={() => window.open(project.projectUrl, '_blank')}
              className="flex flex-col cursor-pointer bg-[#0f172a] rounded-2xl shadow-xl overflow-hidden hover:-translate-y-1 hover:border-blue-500/40 transition-all duration-300 border border-slate-800"
            >
              <div className="h-32 md:h-40 overflow-hidden relative">
                <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1 line-clamp-1">{project.title}</h3>
                  <p className="text-slate-400 text-xs md:text-sm mb-4 line-clamp-2">{project.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack?.slice(0, 3).map((tech: any, i: any) => (
                    <span key={i} className="px-2.5 py-0.5 bg-blue-950/60 text-blue-300 border border-blue-800/40 rounded-full text-[10px] font-semibold">{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-12">
            <button onClick={() => setShowAll(true)} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-bold rounded-xl shadow-lg transition-all">
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
    <section className="py-24 px-6 border-t border-slate-800/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">Education</h2>
          <p className="text-slate-400 text-sm md:text-base">Academic background and credentials</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {visibleItems.map((edu: any) => (
            <div key={edu._id} className="bg-[#0f172a] p-6 rounded-2xl shadow-xl border border-slate-800 border-l-4 border-l-blue-500 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white line-clamp-2 mb-1">{edu.degree}</h3>
                <p className="text-blue-400 font-semibold text-xs md:text-sm mb-2 line-clamp-1">{edu.institution}</p>
                <p className="text-[11px] text-slate-400 mb-3 font-mono">{edu.startDate} - {edu.endDate}</p>
                <p className="text-xs md:text-sm text-slate-300 line-clamp-3">{edu.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {hasMore && (
          <div className="text-center mt-12">
            <button onClick={() => setShowAll(true)} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-bold rounded-xl shadow-lg transition-all">
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
    <section className="py-24 px-6 bg-[#0a0f1d] border-t border-slate-800/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">Certifications</h2>
          <p className="text-slate-400 text-sm md:text-base">Licenses and professional certifications</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {visibleItems.map((cert: any) => (
            <div key={cert._id} className="bg-[#0f172a] p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-white mb-2 line-clamp-2">{cert.title}</h3>
                <p className="text-slate-300 text-xs md:text-sm mb-1 line-clamp-1">{cert.issuer}</p>
                <p className="text-slate-400 text-xs mb-4 font-mono">{cert.dateEarned}</p>
              </div>
              {cert.credentialUrl && (
                <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-center w-full px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl transition-colors text-xs font-bold">
                  View Credential
                </a>
              )}
            </div>
          ))}
        </div>
        
        {hasMore && (
          <div className="text-center mt-12">
            <button onClick={() => setShowAll(true)} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-bold rounded-xl shadow-lg transition-all">
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
    <section className="py-24 bg-[#070b14] px-6 border-t border-slate-800/60">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Get In Touch</h2>
        <p className="text-slate-400 mb-10">Have a project in mind or want to collaborate? Send a message.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6 text-left bg-[#0f172a] p-8 md:p-10 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-6">
            <input type="text" placeholder="Your Name" required className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl focus:border-blue-500 text-white outline-none font-medium text-sm" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="email" placeholder="Your Email" required className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl focus:border-blue-500 text-white outline-none font-medium text-sm" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <textarea placeholder="Your Message" required rows={5} className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl focus:border-blue-500 text-white outline-none resize-none font-medium text-sm" 
            value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all">
            Send Message
          </button>
          {status && <p className="text-center mt-4 font-bold text-blue-400 text-sm">{status}</p>}
        </form>
      </div>
    </section>
  );
}

function WhatsAppButton() {
  return (
    <a 
      href="https://wa.me/254768450250"
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
      <div className="max-w-md mx-auto mt-24 bg-[#0f172a] p-8 rounded-2xl shadow-2xl border border-slate-800 text-center">
        <h2 className="text-2xl font-bold mb-6 text-white">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            required
            placeholder="Admin Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-medium text-sm" 
          />
          <input 
            type="password" 
            required
            placeholder="Admin Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-medium text-sm" 
          />
          {loginError && <p className="text-red-400 text-sm font-semibold">{loginError}</p>}
          <button 
            type="submit"
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30"
          >
            Enter Admin Panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 mt-6">
      <div className="w-full md:w-64 flex flex-col gap-2">
        {['Profile', 'Skills', 'Projects', 'Education', 'Messages'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`p-4 text-left rounded-xl font-bold transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-[#0f172a] hover:bg-slate-800 text-slate-300 border border-slate-800'}`}
          >
            Manage {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-[#0f172a] p-6 md:p-10 rounded-2xl shadow-xl border border-slate-800">
        <h2 className="text-3xl font-bold mb-8 text-white">Manage {activeTab}</h2>

        {activeTab === 'Profile' && <AdminProfile profile={data.profile} refreshData={refreshData} email={email} password={password} />}
        {activeTab === 'Skills' && <AdminGenericList items={data.skills} endpoint="skills" fields={['title', 'imageUrl', 'description', 'proficiency']} refreshData={refreshData} handleDelete={handleDelete} email={email} password={password} />}
        {activeTab === 'Projects' && <AdminGenericList items={data.projects} endpoint="projects" fields={['title', 'imageUrl', 'description', 'projectUrl']} refreshData={refreshData} handleDelete={handleDelete} email={email} password={password} />}
        {activeTab === 'Education' && <AdminGenericList items={data.education} endpoint="education" fields={['institution', 'degree', 'startDate', 'endDate', 'description']} refreshData={refreshData} handleDelete={handleDelete} email={email} password={password} />}
        {activeTab === 'Messages' && <AdminMessages email={email} password={password} />}
      </div>
    </div>
  );
}

// ==========================================
// UPDATED ADMIN PROFILE COMPONENT
// ==========================================
function AdminProfile({ profile, refreshData, email, password }: any) {
  const [formData, setFormData] = useState({ 
    name: profile.name || '', 
    profession: profile.profession || '', 
    heroMedia: profile.heroMedia || [],
    profilePictureUrl: profile.profilePictureUrl || '',
    cvUrl: profile.cvUrl || ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newMedia, setNewMedia] = useState({ mediaType: 'image', url: '' });

  // Sync state when profile data re-fetches
  useEffect(() => {
    setFormData({
      name: profile.name || '',
      profession: profile.profession || '',
      heroMedia: profile.heroMedia || [],
      profilePictureUrl: profile.profilePictureUrl || '',
      cvUrl: profile.cvUrl || ''
    });
  }, [profile]);

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    
    // Construct FormData so Multer receives file uploads as well as form fields
    const data = new FormData();
    data.append('name', formData.name);
    data.append('profession', formData.profession);
    data.append('cvUrl', formData.cvUrl);
    data.append('profilePictureUrl', formData.profilePictureUrl);
    data.append('heroMedia', JSON.stringify(formData.heroMedia));
    
    // Append file if selected by user
    if (selectedFile) {
      data.append('profilePictureFile', selectedFile);
    }

    try {
      const res = await fetch(`${API_URL}/admin/profile`, { 
        method: 'PUT',
        headers: { 
          'x-admin-email': email,
          'x-admin-password': password 
        },
        body: data
      });
      
      if (res.ok) {
        alert('Profile updated successfully!');
        setSelectedFile(null);
        refreshData();
      } else {
        alert('Failed to update profile. Check credentials.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating profile.');
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
          <label className="block text-sm font-bold text-slate-300 mb-2">Full Name</label>
          <input type="text" className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">Profession / Title</label>
          <input type="text" className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium" value={formData.profession} onChange={e => setFormData({...formData, profession: e.target.value})} />
        </div>
      </div>

      {/* PROFILE PICTURE INPUTS (FILE UPLOAD + URL LINK SUPPORT) */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">Upload Profile Picture (From Device)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)}
            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">Or Profile Picture URL (External Link / Facebook)</label>
          <input type="text" placeholder="https://scontent... or Facebook image address" className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium" value={formData.profilePictureUrl} onChange={e => setFormData({...formData, profilePictureUrl: e.target.value})} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-300 mb-2">CV / Resume Document URL</label>
        <input type="text" placeholder="https://link-to-your-cv.pdf" className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium" value={formData.cvUrl} onChange={e => setFormData({...formData, cvUrl: e.target.value})} />
      </div>
      
      <div className="border-t border-slate-800 pt-6 mt-6">
        <label className="block text-sm font-bold text-slate-300 mb-4">Background Media (Hero Section)</label>
        
        <div className="space-y-3 mb-4">
          {formData.heroMedia.map((media: any, index: number) => (
            <div key={index} className="flex justify-between items-center bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <span className="text-sm truncate mr-4 text-slate-300"><strong className="capitalize text-white">{media.mediaType}:</strong> {media.url}</span>
              <button type="button" onClick={() => removeMedia(index)} className="text-red-400 font-bold hover:text-red-300 text-sm">Remove</button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <select 
            value={newMedia.mediaType} 
            onChange={(e) => setNewMedia({...newMedia, mediaType: e.target.value})}
            className="p-3.5 border border-slate-800 rounded-xl bg-slate-900 text-white font-medium"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <input 
            type="text" 
            placeholder="Media URL" 
            value={newMedia.url} 
            onChange={(e) => setNewMedia({...newMedia, url: e.target.value})}
            className="flex-1 p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium"
          />
          <button type="button" onClick={addMedia} className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-bold rounded-xl">
            Add
          </button>
        </div>
      </div>

      <button type="submit" className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30">Save Changes</button>
    </form>
  );
}

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
          <div key={item._id} className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
            <div>
              <p className="font-bold text-white">{item.title || item.institution}</p>
              <p className="text-sm text-slate-400">{item.description?.substring(0, 50)}...</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(item)} className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 font-bold rounded-lg text-sm">Edit</button>
              <button onClick={() => handleDelete(endpoint, item._id)} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold rounded-lg text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-bold mb-4 pt-6 border-t border-slate-800 text-white">{editId ? 'Edit Item' : 'Add New Item'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field: any) => (
          <input 
            key={field} type="text" placeholder={field.charAt(0).toUpperCase() + field.slice(1)} required 
            className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium text-sm"
            value={formData[field] || ''} onChange={e => setFormData({...formData, [field]: e.target.value})}
          />
        ))}
        <div className="flex gap-4">
          <button type="submit" className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md">
            {editId ? `Update ${endpoint}` : `Add to ${endpoint}`}
          </button>
          {editId && (
            <button type="button" onClick={() => { setEditId(null); setFormData(initialFormState); }} className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl">
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
      {messages.length === 0 ? <p className="font-bold text-slate-400">No messages yet.</p> : messages.map((msg: any) => (
        <div key={msg._id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="font-bold text-lg text-white">{msg.name} <span className="text-sm font-normal text-slate-400">&lt;{msg.email}&gt;</span></p>
          <p className="mt-2 text-slate-300 font-medium">{msg.message}</p>
          <p className="text-xs text-slate-500 mt-3 font-mono">{new Date(msg.submittedAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
