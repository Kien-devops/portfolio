import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackgroundGlows from '@/components/BackgroundGlows';

// Import các section components mới
import HeroSection from '@/components/sections/HeroSection';
import CertificationSection from '@/components/sections/CertificationSection';
import ExperienceSection from '@/components/sections/ExperienceSection';
import SkillsSection from '@/components/sections/SkillsSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import BlogSection from '@/components/sections/BlogSection';
import ContactSection from '@/components/sections/ContactSection';

import { fetchProjectsDirect, fetchBlogsDirect, fetchTimelineDirect } from '@/utils/dbQueries';

export const dynamic = 'force-dynamic';

// ponytail: Replaced 'use client' page with Server Side Data Fetching at page compile time.
// This reduces bundle size from 7MB+ client side assets significantly since state variables & useEffects are removed.
export default async function Home() {
  // Parallel fetch on the server directly from DB
  const [projectsData, blogsData, timelineData] = await Promise.all([
    fetchProjectsDirect().catch(() => []),
    fetchBlogsDirect().catch(() => []),
    fetchTimelineDirect().catch(() => []),
  ]);


  const experiences = timelineData.filter((item) => item.type === 'experience');
  const certifications = timelineData.filter((item) => item.type === 'certification');
  const landingBlogs = blogsData.slice(0, 2);

  return (
    <>
      <Navbar />
      <BackgroundGlows />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-28 pb-24 space-y-32 md:space-y-40">
        {/* HERO: Terminal visual (Client element encapsulated inside HeroSection) */}
        <HeroSection />

        {/* CERTIFICATIONS: Snap horizontal strip */}
        <CertificationSection certifications={certifications} />

        {/* BIO/PHILOSOPHY: Editorial layout */}
        <section className="relative">
          <div className="border-l-2 border-accent pl-8 py-2 space-y-4 max-w-3xl">
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-[1.2]">
              "Quiet operations, zero drift."
            </p>
            <div className="text-text-muted text-sm md:text-base leading-relaxed space-y-3 max-w-[60ch]">
              <p>
                Platform architectures built on minimal noise and maximum stability. In enterprise DevOps, reliable scaling is quiet, predictable, and fully codified.
              </p>
              <p>
                From hardening container security boundaries to orchestrating cross-region VPC gateways — deterministic systems, clean environments, every time.
              </p>
            </div>
            <span className="accent-line" />
          </div>
        </section>

        {/* EXPERIENCE: vertical timeline */}
        <ExperienceSection experiences={experiences} />

        {/* SKILLS: Bento visual */}
        <SkillsSection />

        {/* PROJECTS */}
        <ProjectsSection projects={projectsData} />

        {/* BLOGS */}
        <BlogSection blogs={landingBlogs} />

        {/* CONTACT */}
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
