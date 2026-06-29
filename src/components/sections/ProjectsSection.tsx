import { Project } from '@/utils/api';
import ProjectCard from '@/components/ProjectCard';

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <section id="projects" className="space-y-8">
      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
        Selected Projects
      </h2>

      <div className="grid grid-cols-1 gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}
