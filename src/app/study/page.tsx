'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackgroundGlows from '@/components/BackgroundGlows';
import StudyCard from '@/components/StudyCard';
import { fetchStudies, Study } from '@/utils/api';
import { GraduationCap, Lock, Unlock, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLoginModal = dynamic(() => import('@/components/AdminLoginModal'), { ssr: false });
const AddCourseModal = dynamic(() => import('@/components/AddCourseModal'), { ssr: false });

export default function StudyPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const [adminToken, setAdminToken] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : sessionStorage.getItem('adminToken')
  );
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);

  useEffect(() => {
    fetchStudies().then((data) => {
      setStudies(data);
      setLoading(false);
    });
  }, []);

  const handleLoginSuccess = (token: string) => {
    sessionStorage.setItem('adminToken', token);
    setAdminToken(token);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    setAdminToken(null);
  };

  const categories = ['All', ...Array.from(new Set(studies.map((s) => s.category).filter(Boolean)))];

  const filteredStudies = selectedCategory === 'All' 
    ? studies 
    : studies.filter((s) => s.category === selectedCategory);

  return (
    <>
      <Navbar />
      <BackgroundGlows />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex-1 w-full max-w-5xl mx-auto px-4 pt-32 pb-20 space-y-12"
      >
        {/* Header Block */}
        <section className="relative space-y-4 text-center max-w-2xl mx-auto">
          {/* Admin Login/Logout Button in top corner */}
          <div className="absolute -top-12 right-0 flex gap-2">
            {adminToken ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddCourseOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-mono font-bold tracking-wider uppercase hover:bg-accent-hover transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Course</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-card-border bg-card hover:bg-foreground/5 text-text-muted hover:text-foreground text-xs font-mono transition-colors cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5 text-accent" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-card-border bg-card/60 hover:bg-card hover:border-accent/30 text-text-muted hover:text-foreground text-xs font-mono transition-all duration-300 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono tracking-wider uppercase">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>DevOps Academy</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
            Free Video Courses
          </h1>
          <p className="text-sm md:text-base text-text-muted leading-relaxed font-medium">
            Step-by-step video chapters, hands-on syllabus, and discussions. Build practical experience with Docker, Kubernetes, and Terraform.
          </p>
        </section>

        {/* Category Filters */}
        {!loading && studies.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider transition-all border cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-accent text-white border-accent shadow-md shadow-accent/10'
                    : 'bg-card border-card-border text-text-muted hover:text-foreground'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* Studies Grid */}
        {loading ? (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-card border border-card-border/80 flex flex-col justify-between p-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-foreground/10" />
                  <div className="w-3/4 h-6 bg-foreground/10 rounded" />
                  <div className="w-full h-4 bg-foreground/10 rounded" />
                  <div className="w-5/6 h-4 bg-foreground/10 rounded" />
                </div>
                <div className="w-20 h-4 bg-foreground/10 rounded" />
              </div>
            ))}
          </section>
        ) : filteredStudies.length === 0 ? (
          <div className="text-center py-20 bg-card border border-card-border rounded-2xl">
            <GraduationCap className="w-12 h-12 mx-auto text-text-muted opacity-40 mb-3" />
            <p className="text-text-muted font-medium">No study guides found under this category.</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredStudies.map((study, index) => (
              <StudyCard key={study.id} study={study} index={index} />
            ))}
          </section>
        )}
      </motion.main>

      <AnimatePresence>
        {isLoginOpen && (
          <AdminLoginModal
            isOpen={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
        {isAddCourseOpen && adminToken && (
          <AddCourseModal
            isOpen={isAddCourseOpen}
            onClose={() => setIsAddCourseOpen(false)}
            adminToken={adminToken}
            onCourseAdded={(newCourse) => setStudies([newCourse, ...studies])}
          />
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
