import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackgroundGlows from '@/components/BackgroundGlows';
import PipelineVisualizer from '@/components/PipelineVisualizer';
import { Route } from 'lucide-react';

export default function PipelinePage() {
  return (
    <>
      <Navbar />
      <BackgroundGlows />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-32 pb-20 space-y-12">
        {/* Header Block */}
        <section className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono tracking-wider uppercase">
            <Route className="w-3.5 h-3.5" />
            <span>Interactive Map</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
            DevSecOps Pipeline Flow
          </h1>
          <p className="text-sm md:text-base text-text-muted leading-relaxed font-medium">
            Explore the multi-tier automation pipeline governing the building, vetting, deploying, and checking of containerized workloads.
          </p>
        </section>

        {/* Interactive Visualizer */}
        <section className="pt-4">
          <PipelineVisualizer />
        </section>
      </main>

      <Footer />
    </>
  );
}
