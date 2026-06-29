'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackgroundGlows from '@/components/BackgroundGlows';
import StudyCommentsSection from '@/components/StudyCommentsSection';
import VideoPlayer from '@/components/VideoPlayer';
import AddLessonModal from '@/components/AddLessonModal';
import { fetchStudyDetail, fetchStudyLessons, Study, Lesson } from '@/utils/api';
import { ChevronLeft, Calendar, User, BookOpen, PlayCircle, Layers, HelpCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudyDetailClientProps {
  id: string;
}

function renderMarkdown(content: string) {
  if (!content) return null;

  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeLines: string[] = [];
  const renderedElements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const code = codeLines.join('\n');
        codeLines = [];
        renderedElements.push(
          <pre
            key={`code-${idx}`}
            className="bg-black/50 border border-card-border rounded-xl p-4 font-mono text-xs overflow-x-auto text-text-muted my-6 select-all"
          >
            <code>{code}</code>
          </pre>
        );
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (line.trim().startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3-${idx}`} className="text-xl font-bold text-foreground mt-8 mb-4">
          {line.replace('### ', '')}
        </h3>
      );
      return;
    }

    if (line.trim().startsWith('- ')) {
      renderedElements.push(
        <li key={`li-${idx}`} className="text-sm md:text-base text-text-muted list-disc ml-5 mb-2 font-medium">
          {line.replace('- ', '')}
        </li>
      );
      return;
    }

    if (line.trim() === '') {
      renderedElements.push(<div key={`space-${idx}`} className="h-4" />);
      return;
    }

    renderedElements.push(
      <p key={`p-${idx}`} className="text-sm md:text-base text-text-muted leading-relaxed font-medium mb-4">
        {line}
      </p>
    );
  });

  return renderedElements;
}

export default function StudyDetailClient({ id }: StudyDetailClientProps) {
  const [study, setStudy] = useState<Study | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'comments'>('overview');
  const [loading, setLoading] = useState(true);
  
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetchStudyDetail(id),
      fetchStudyLessons(id)
    ])
      .then(([studyData, lessonsData]) => {
        setStudy(studyData);
        setLessons(lessonsData);
        if (lessonsData.length > 0) {
          setActiveLesson(lessonsData[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading course info:', err);
        setLoading(false);
      });
    setAdminToken(sessionStorage.getItem('adminToken'));
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <BackgroundGlows />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
          <div className="lg:col-span-8 space-y-6">
            <div className="aspect-[16/9] w-full rounded-2xl bg-foreground/10" />
            <div className="w-3/4 h-8 bg-foreground/10 rounded" />
            <div className="w-full h-24 bg-foreground/10 rounded-xl" />
          </div>
          <div className="lg:col-span-4 h-96 bg-foreground/10 rounded-2xl" />
        </main>
        <Footer />
      </>
    );
  }

  if (!study) {
    return (
      <>
        <Navbar />
        <BackgroundGlows />
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-40 pb-20 text-center space-y-6">
          <h1 className="text-2xl font-bold text-foreground">Course Not Found</h1>
          <p className="text-text-muted">The requested video course could not be retrieved from the database.</p>
          <div className="pt-4">
            <Link
              href="/study"
              className="inline-flex items-center gap-1.5 text-sm font-mono text-accent hover:underline"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Academy</span>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <BackgroundGlows />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex-1 w-full max-w-6xl mx-auto px-4 pt-32 pb-20 space-y-8"
      >
        {/* Back Link */}
        <div>
          <Link
            href="/study"
            className="inline-flex items-center gap-1 text-xs font-mono text-text-muted hover:text-accent transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>BACK TO ACADEMY</span>
          </Link>
        </div>

        {/* Dynamic Udemy-style player layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Video Stream Player */}
          <div className="lg:col-span-8 space-y-6">
            <VideoPlayer videoUrl={activeLesson?.video_url || ''} />

            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight text-foreground">
                {activeLesson ? activeLesson.title : study.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  <span>Updated June 2026</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-accent" />
                  <span>Kien Devops</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent font-semibold">
                  <BookOpen className="w-3.5 h-3.5 inline mr-1 text-accent" />
                  <span>{study.category}</span>
                </span>
              </div>
            </div>

            {/* Course Tabs (Overview / discussion) */}
            <div className="border-b border-card-border flex gap-6 text-sm font-mono tracking-wider font-bold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 relative transition-colors cursor-pointer ${
                  activeTab === 'overview' ? 'text-accent' : 'text-text-muted hover:text-foreground'
                }`}
              >
                Overview
                {activeTab === 'overview' && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-[2px] bg-accent" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`pb-3 relative transition-colors cursor-pointer ${
                  activeTab === 'comments' ? 'text-accent' : 'text-text-muted hover:text-foreground'
                }`}
              >
                Q&amp;A Discussion
                {activeTab === 'comments' && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-[2px] bg-accent" />
                )}
              </button>
            </div>

            {/* Tab content area */}
            <div className="pt-4 min-h-[250px]">
              {activeTab === 'overview' ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-card border border-card-border text-sm text-text-muted leading-relaxed font-medium">
                    <p className="font-semibold text-foreground mb-2 text-xs uppercase tracking-wider font-mono">Course Summary</p>
                    {study.summary}
                  </div>
                  <div className="prose prose-invert max-w-none text-sm md:text-base text-text-muted leading-relaxed font-medium">
                    {renderMarkdown(study.content)}
                  </div>
                </div>
              ) : (
                <StudyCommentsSection studyId={study.id} />
              )}
            </div>
          </div>

          {/* Sidebar Playlist Syllabus */}
          <div className="lg:col-span-4 bg-card border border-card-border rounded-2xl overflow-hidden shadow-xl sticky top-28">
            <div className="p-4 border-b border-card-border bg-foreground/5 flex items-center justify-between">
              <h3 className="font-bold text-foreground text-sm tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" />
                <span>Course Content</span>
              </h3>
              <div className="flex items-center gap-2">
                {adminToken && (
                  <button
                    onClick={() => setIsAddLessonOpen(true)}
                    className="inline-flex items-center gap-0.5 px-2 py-1 rounded bg-accent text-white text-[10px] font-mono font-bold uppercase hover:bg-accent-hover transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                )}
                <span className="text-[10px] font-mono font-bold text-text-muted px-2 py-0.5 rounded-full bg-foreground/5 border border-card-border">
                  {lessons.length} LESSONS
                </span>
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto divide-y divide-card-border/50">
              {lessons.map((lesson) => {
                const isActive = activeLesson?.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left p-4 flex gap-3 transition-all duration-300 hover:bg-foreground/5 cursor-pointer ${
                      isActive ? 'bg-accent/10 border-l-4 border-accent pl-3' : ''
                    }`}
                  >
                    <PlayCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                      isActive ? 'text-accent' : 'text-text-muted opacity-60'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold leading-relaxed transition-colors ${
                        isActive ? 'text-accent font-bold' : 'text-foreground'
                      }`}>
                        {lesson.title}
                      </p>
                      <span className="block text-[10px] font-mono text-text-muted mt-1">
                        {lesson.duration || '00:00'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </motion.main>

      <AnimatePresence>
        {isAddLessonOpen && adminToken && (
          <AddLessonModal
            isOpen={isAddLessonOpen}
            onClose={() => setIsAddLessonOpen(false)}
            studyId={study.id}
            adminToken={adminToken}
            nextOrderNum={lessons.length + 1}
            onLessonAdded={(newLesson) => {
              const updated = [...lessons, newLesson].sort((a, b) => a.order_num - b.order_num);
              setLessons(updated);
              if (!activeLesson) {
                setActiveLesson(newLesson);
              }
            }}
          />
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
