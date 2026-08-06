import { useEffect, useState } from "react";
import {
  User,
  FolderGit2,
  Cpu,
  Briefcase,
  GraduationCap,
  FileText,
  Mail,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Archive,
  Save,
  Loader2,
} from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { api } from "../services/api.js";
import { Profile, Project, Skill, Experience, Education, Contact, BlogContent } from "../types/index.js";

type Tab = "profile" | "projects" | "skills" | "experiences" | "education" | "blogs" | "inbox";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  
  // Data lists
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Status Notification
  const [notify, setNotify] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal / Form state (generic for CRUD operations)
  const [activeModal, setActiveModal] = useState<"project" | "skill" | "experience" | "education" | "blog" | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editId, setEditId] = useState<string | null>(null); // holds project ID, skill ID, exp ID, edu ID, or blog slug
  
  // Individual Form Fields
  const [profileForm, setProfileForm] = useState<Profile>({
    name: "", headline: "", bio: "", email: "", avatarUrl: "", githubUrl: "", linkedinUrl: ""
  });
  const [projectForm, setProjectForm] = useState({
    name: "", slug: "", summary: "", description: "", technologies: "", githubUrl: "", demoUrl: "", imageUrl: "", displayOrder: 1, published: true
  });
  const [skillForm, setSkillForm] = useState({
    name: "", category: "Frontend", level: 80, displayOrder: 1
  });
  const [experienceForm, setExperienceForm] = useState({
    company: "", position: "", startDate: "", endDate: "", description: "", displayOrder: 1
  });
  const [educationForm, setEducationForm] = useState({
    school: "", major: "", startDate: "", endDate: "", description: ""
  });
  const [blogForm, setBlogForm] = useState({
    title: "", slug: "", summary: "", content: "", coverImage: "", tags: "", published: true
  });
  const [blogPreviewMode, setBlogPreviewMode] = useState(false);

  const showNotification = (type: "success" | "error", text: string) => {
    setNotify({ type, text });
    setTimeout(() => setNotify(null), 4000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [profRes, projRes, skillRes, expRes, eduRes, blogRes, contactRes] = await Promise.all([
        api.getProfile().catch(() => null),
        api.getProjects().catch(() => []),
        api.getSkills().catch(() => []),
        api.getExperiences().catch(() => []),
        api.getEducation().catch(() => []),
        api.getBlogList().catch(() => []),
        api.getContacts().catch(() => []),
      ]);

      if (profRes) {
        setProfile(profRes);
        setProfileForm(profRes);
      }
      setProjects(projRes);
      setSkills(skillRes);
      setExperiences(expRes);
      setEducation(eduRes);
      setBlogs(blogRes);
      setContacts(contactRes);
    } catch (err: any) {
      showNotification("error", "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- ACTIONS ---

  // Save Profile
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.updateProfile(profileForm);
      showNotification("success", "Profile updated successfully");
      loadAllData();
    } catch (err: any) {
      showNotification("error", err.message || "Failed to update profile");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete project, skill, experience, education, blog
  const handleDelete = async (type: Tab, id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${type === "blogs" ? "blog post" : "item"}?`)) return;
    setActionLoading(true);
    try {
      if (type === "projects") await api.deleteProject(id);
      if (type === "skills") await api.deleteSkill(id);
      if (type === "experiences") await api.deleteExperience(id);
      if (type === "education") await api.deleteEducation(id);
      if (type === "blogs") await api.deleteBlog(id); // id is slug
      if (type === "inbox") await api.deleteContact(id);

      showNotification("success", "Item deleted successfully");
      loadAllData();
    } catch (err: any) {
      showNotification("error", err.message || "Deletion failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Mark Inbox Message Status
  const handleMarkContactStatus = async (id: string, status: "READ" | "ARCHIVED") => {
    setActionLoading(true);
    try {
      await api.updateContactStatus(id, status);
      showNotification("success", `Message marked as ${status.toLowerCase()}`);
      loadAllData();
    } catch (err: any) {
      showNotification("error", "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit CRUD Forms
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (activeModal === "project") {
        const payload = {
          ...projectForm,
          technologies: projectForm.technologies.split(",").map((t) => t.trim()).filter(Boolean),
          displayOrder: Number(projectForm.displayOrder),
        };
        if (modalMode === "create") {
          await api.createProject(payload);
          showNotification("success", "Project created successfully");
        } else {
          await api.updateProject(editId!, payload);
          showNotification("success", "Project updated successfully");
        }
      }

      if (activeModal === "skill") {
        const payload = {
          ...skillForm,
          level: Number(skillForm.level),
          displayOrder: Number(skillForm.displayOrder),
        };
        if (modalMode === "create") {
          await api.createSkill(payload);
          showNotification("success", "Skill created successfully");
        } else {
          await api.updateSkill(editId!, payload);
          showNotification("success", "Skill updated successfully");
        }
      }

      if (activeModal === "experience") {
        const payload = {
          ...experienceForm,
          endDate: experienceForm.endDate ? experienceForm.endDate : null,
          displayOrder: Number(experienceForm.displayOrder),
        };
        if (modalMode === "create") {
          await api.createExperience(payload);
          showNotification("success", "Experience created successfully");
        } else {
          await api.updateExperience(editId!, payload);
          showNotification("success", "Experience updated successfully");
        }
      }

      if (activeModal === "education") {
        const payload = {
          ...educationForm,
        };
        if (modalMode === "create") {
          await api.createEducation(payload);
          showNotification("success", "Education record created successfully");
        } else {
          await api.updateEducation(editId!, payload);
          showNotification("success", "Education record updated successfully");
        }
      }

      if (activeModal === "blog") {
        const payload = {
          ...blogForm,
          tags: blogForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
        };
        if (modalMode === "create") {
          await api.createBlog(payload);
          showNotification("success", "Blog post created in S3 and index rebuilt");
        } else {
          await api.updateBlog(editId!, payload);
          showNotification("success", "Blog post updated in S3 and index rebuilt");
        }
      }

      // Close modal and refresh list
      setActiveModal(null);
      loadAllData();
    } catch (err: any) {
      showNotification("error", err.message || "Failed to submit form");
    } finally {
      setActionLoading(false);
    }
  };

  // Populate Forms for Editing
  const openEditModal = async (type: "project" | "skill" | "experience" | "education" | "blog", item: any) => {
    setModalMode("edit");
    
    if (type === "project") {
      setEditId(item.projectId);
      setProjectForm({
        name: item.name,
        slug: item.slug,
        summary: item.summary,
        description: item.description,
        technologies: item.technologies.join(", "),
        githubUrl: item.githubUrl || "",
        demoUrl: item.demoUrl || "",
        imageUrl: item.imageUrl,
        displayOrder: item.displayOrder,
        published: item.published,
      });
    }

    if (type === "skill") {
      setEditId(item.skillId);
      setSkillForm({
        name: item.name,
        category: item.category,
        level: item.level,
        displayOrder: item.displayOrder,
      });
    }

    if (type === "experience") {
      setEditId(item.experienceId);
      setExperienceForm({
        company: item.company,
        position: item.position,
        startDate: item.startDate,
        endDate: item.endDate || "",
        description: item.description,
        displayOrder: item.displayOrder,
      });
    }

    if (type === "education") {
      setEditId(item.educationId);
      setEducationForm({
        school: item.school,
        major: item.major,
        startDate: item.startDate,
        endDate: item.endDate,
        description: item.description || "",
      });
    }

    if (type === "blog") {
      setEditId(item.slug);
      // Fetch full content including markdown from S3 to edit
      try {
        setLoading(true);
        const fullBlog: BlogContent = await api.getBlogDetail(item.slug);
        setBlogForm({
          title: fullBlog.title,
          slug: fullBlog.slug,
          summary: fullBlog.summary,
          content: fullBlog.content,
          coverImage: fullBlog.coverImage,
          tags: fullBlog.tags.join(", "),
          published: fullBlog.published,
        });
      } catch {
        showNotification("error", "Failed to fetch full blog content from S3");
      } finally {
        setLoading(false);
      }
    }

    setActiveModal(type);
  };

  const openCreateModal = (type: "project" | "skill" | "experience" | "education" | "blog") => {
    setModalMode("create");
    setEditId(null);

    if (type === "project") {
      setProjectForm({
        name: "", slug: "", summary: "", description: "", technologies: "AWS Lambda, API Gateway, DynamoDB", githubUrl: "", demoUrl: "", imageUrl: "/content/images/projects/placeholder.webp", displayOrder: 1, published: true
      });
    }
    if (type === "skill") {
      setSkillForm({ name: "", category: "Frontend", level: 80, displayOrder: 1 });
    }
    if (type === "experience") {
      setExperienceForm({ company: "", position: "", startDate: new Date().toISOString().substring(0, 7), endDate: "", description: "", displayOrder: 1 });
    }
    if (type === "education") {
      setEducationForm({ school: "", major: "", startDate: "2023-09", endDate: "2027-06", description: "" });
    }
    if (type === "blog") {
      setBlogForm({ title: "", slug: "", summary: "", content: "# Write markdown here", coverImage: "/content/images/blogs/placeholder.webp", tags: "Cloud, AWS", published: true });
      setBlogPreviewMode(false);
    }

    setActiveModal(type);
  };

  if (loading && !profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-slate-400 text-sm">Fetching database tables...</p>
      </div>
    );
  }

  const sidebarTabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "skills", label: "Skills", icon: Cpu },
    { id: "experiences", label: "Experiences", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "blogs", label: "Blogs (S3)", icon: FileText },
    { id: "inbox", label: "Inbox Messages", icon: Mail },
  ];

  return (
    <div className="grid md:grid-cols-12 gap-8 items-start relative z-10">
      {/* Dynamic Status Banner */}
      {notify && (
        <div
          className={`fixed bottom-8 right-8 z-50 flex items-center space-x-3 px-5 py-3 rounded-2xl border backdrop-blur-md shadow-2xl transition-all ${
            notify.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {notify.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="text-sm font-semibold">{notify.text}</span>
        </div>
      )}

      {/* 1. Sidebar */}
      <aside className="md:col-span-3 rounded-2xl glass-panel p-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible no-scrollbar">
        {sidebarTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap md:w-full cursor-pointer ${
                isActive
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === "inbox" && contacts.filter((c) => c.status === "NEW").length > 0 && (
                <span className="ml-auto bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {contacts.filter((c) => c.status === "NEW").length}
                </span>
              )}
            </button>
          );
        })}
      </aside>

      {/* 2. Main Panel */}
      <div className="md:col-span-9 rounded-2xl glass-panel p-6 sm:p-8 min-h-[60vh] space-y-6">
        
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSave} className="space-y-6">
            <h2 className="text-lg font-bold font-display border-b border-slate-900 pb-4">Personal Metadata</h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500/50 text-slate-100 placeholder-slate-600 focus:outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Headline</label>
                <input
                  type="text"
                  required
                  value={profileForm.headline}
                  onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500/50 text-slate-100 placeholder-slate-600 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Biography</label>
              <textarea
                required
                rows={5}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500/50 text-slate-100 placeholder-slate-600 focus:outline-none text-sm resize-none"
              ></textarea>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500/50 text-slate-100 placeholder-slate-600 focus:outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Avatar Image Path/URL</label>
                <input
                  type="text"
                  required
                  value={profileForm.avatarUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500/50 text-slate-100 placeholder-slate-600 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">GitHub Link</label>
                <input
                  type="text"
                  value={profileForm.githubUrl || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500/50 text-slate-100 placeholder-slate-600 focus:outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">LinkedIn Link</label>
                <input
                  type="text"
                  value={profileForm.linkedinUrl || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500/50 text-slate-100 placeholder-slate-600 focus:outline-none text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </form>
        )}

        {/* PROJECTS TAB */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-900 pb-4">
              <h2 className="text-lg font-bold font-display">Projects List</h2>
              <button
                onClick={() => openCreateModal("project")}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New</span>
              </button>
            </div>

            {projects.length === 0 ? (
              <p className="text-slate-500 text-center py-8 text-sm">No projects added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Order</th>
                      <th className="py-3 px-4">Published</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((proj) => (
                      <tr key={proj.projectId} className="border-b border-slate-900/60 hover:bg-slate-900/20 text-slate-300">
                        <td className="py-3.5 px-4 font-semibold text-slate-100">{proj.name}</td>
                        <td className="py-3.5 px-4">{proj.displayOrder}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${proj.published ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                            {proj.published ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right flex justify-end space-x-2.5">
                          <button
                            onClick={() => openEditModal("project", proj)}
                            className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete("projects", proj.projectId)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-900 pb-4">
              <h2 className="text-lg font-bold font-display">Skills Registry</h2>
              <button
                onClick={() => openCreateModal("skill")}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New</span>
              </button>
            </div>

            {skills.length === 0 ? (
              <p className="text-slate-500 text-center py-8 text-sm">No skills added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Skill</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Level</th>
                      <th className="py-3 px-4">Order</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skills.map((skill) => (
                      <tr key={skill.skillId} className="border-b border-slate-900/60 hover:bg-slate-900/20 text-slate-300">
                        <td className="py-3.5 px-4 font-semibold text-slate-100">{skill.name}</td>
                        <td className="py-3.5 px-4 text-indigo-400">{skill.category}</td>
                        <td className="py-3.5 px-4">{skill.level}%</td>
                        <td className="py-3.5 px-4">{skill.displayOrder}</td>
                        <td className="py-3.5 px-4 text-right flex justify-end space-x-2.5">
                          <button
                            onClick={() => openEditModal("skill", skill)}
                            className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete("skills", skill.skillId)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* EXPERIENCES TAB */}
        {activeTab === "experiences" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-900 pb-4">
              <h2 className="text-lg font-bold font-display">Experiences History</h2>
              <button
                onClick={() => openCreateModal("experience")}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New</span>
              </button>
            </div>

            {experiences.length === 0 ? (
              <p className="text-slate-500 text-center py-8 text-sm">No work experiences added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Position</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experiences.map((exp) => (
                      <tr key={exp.experienceId} className="border-b border-slate-900/60 hover:bg-slate-900/20 text-slate-300">
                        <td className="py-3.5 px-4 font-semibold text-slate-100">{exp.position}</td>
                        <td className="py-3.5 px-4 text-indigo-400">{exp.company}</td>
                        <td className="py-3.5 px-4">{exp.startDate} - {exp.endDate || "Present"}</td>
                        <td className="py-3.5 px-4 text-right flex justify-end space-x-2.5">
                          <button
                            onClick={() => openEditModal("experience", exp)}
                            className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete("experiences", exp.experienceId)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* EDUCATION TAB */}
        {activeTab === "education" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-900 pb-4">
              <h2 className="text-lg font-bold font-display">Education Records</h2>
              <button
                onClick={() => openCreateModal("education")}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New</span>
              </button>
            </div>

            {education.length === 0 ? (
              <p className="text-slate-500 text-center py-8 text-sm">No education records added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Major</th>
                      <th className="py-3 px-4">School</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {education.map((edu) => (
                      <tr key={edu.educationId} className="border-b border-slate-900/60 hover:bg-slate-900/20 text-slate-300">
                        <td className="py-3.5 px-4 font-semibold text-slate-100">{edu.major}</td>
                        <td className="py-3.5 px-4 text-indigo-400">{edu.school}</td>
                        <td className="py-3.5 px-4">{edu.startDate} - {edu.endDate}</td>
                        <td className="py-3.5 px-4 text-right flex justify-end space-x-2.5">
                          <button
                            onClick={() => openEditModal("education", edu)}
                            className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete("education", edu.educationId)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BLOGS TAB */}
        {activeTab === "blogs" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-900 pb-4">
              <h2 className="text-lg font-bold font-display">Static Blog Posts (S3 Bucket)</h2>
              <button
                onClick={() => openCreateModal("blog")}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Blog</span>
              </button>
            </div>

            {blogs.length === 0 ? (
              <p className="text-slate-500 text-center py-8 text-sm">No blog posts found in content/blogs/index.json.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Slug</th>
                      <th className="py-3 px-4">Published Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((b) => (
                      <tr key={b.slug} className="border-b border-slate-900/60 hover:bg-slate-900/20 text-slate-300">
                        <td className="py-3.5 px-4 font-semibold text-slate-100">{b.title}</td>
                        <td className="py-3.5 px-4 text-indigo-400">{b.slug}</td>
                        <td className="py-3.5 px-4">{b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : "Draft"}</td>
                        <td className="py-3.5 px-4 text-right flex justify-end space-x-2.5">
                          <button
                            onClick={() => openEditModal("blog", b)}
                            className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete("blogs", b.slug)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* INBOX TAB */}
        {activeTab === "inbox" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold font-display border-b border-slate-900 pb-4">Contact Submissions Inbox</h2>

            {contacts.length === 0 ? (
              <p className="text-slate-500 text-center py-8 text-sm">No messages received yet.</p>
            ) : (
              <div className="space-y-4">
                {contacts.map((msg) => (
                  <div
                    key={msg.contactId}
                    className={`p-5 rounded-2xl border text-sm relative transition-all ${
                      msg.status === "NEW"
                        ? "bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/30"
                        : "bg-slate-900/20 border-slate-900 hover:border-slate-800/80"
                    }`}
                  >
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 flex space-x-2">
                      {msg.status === "NEW" && (
                        <button
                          onClick={() => handleMarkContactStatus(msg.contactId, "READ")}
                          className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-indigo-500 text-white font-semibold text-[10px] hover:bg-indigo-600 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Mark Read</span>
                        </button>
                      )}
                      {msg.status !== "ARCHIVED" && (
                        <button
                          onClick={() => handleMarkContactStatus(msg.contactId, "ARCHIVED")}
                          className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-400 font-semibold text-[10px] hover:bg-slate-700 hover:text-slate-200 transition-colors"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Archive</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete("inbox", msg.contactId)}
                        className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                        title="Delete Message"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    <div className="space-y-2.5 pr-24">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <strong className="text-slate-100 text-base">{msg.name}</strong>
                        <span className="text-slate-500">|</span>
                        <a href={`mailto:${msg.email}`} className="text-indigo-400 hover:underline text-xs">{msg.email}</a>
                        <span className="text-slate-500">|</span>
                        <span className="text-slate-500 text-xs">{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>

                      <div className="text-slate-200 font-semibold text-sm">
                        Subject: <span className="font-normal text-slate-300">{msg.subject}</span>
                      </div>

                      <p className="text-slate-400 text-xs bg-slate-950/60 p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-slate-900/60">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- CRUD DIALOG / MODAL POPUPS --- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative my-8">
            <h3 className="text-xl font-bold font-display mb-6 border-b border-slate-800 pb-4 uppercase tracking-wider text-indigo-400">
              {modalMode === "create" ? "Create New" : "Edit"} {activeModal}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Project Form Fields */}
              {activeModal === "project" && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Project Name</label>
                      <input
                        type="text"
                        required
                        value={projectForm.name}
                        onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Slug (e.g. serverless-app)</label>
                      <input
                        type="text"
                        required
                        value={projectForm.slug}
                        onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Summary (Brief pitch)</label>
                    <input
                      type="text"
                      required
                      value={projectForm.summary}
                      onChange={(e) => setProjectForm({ ...projectForm, summary: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Description (Details)</label>
                    <textarea
                      required
                      rows={4}
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs resize-none"
                    ></textarea>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Technologies (Comma-separated)</label>
                    <input
                      type="text"
                      required
                      value={projectForm.technologies}
                      onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">GitHub URL</label>
                      <input
                        type="text"
                        value={projectForm.githubUrl}
                        onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Demo URL</label>
                      <input
                        type="text"
                        value={projectForm.demoUrl}
                        onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Cover Image Path/URL</label>
                      <input
                        type="text"
                        required
                        value={projectForm.imageUrl}
                        onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Display Order</label>
                      <input
                        type="number"
                        required
                        value={projectForm.displayOrder}
                        onChange={(e) => setProjectForm({ ...projectForm, displayOrder: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      id="published"
                      type="checkbox"
                      checked={projectForm.published}
                      onChange={(e) => setProjectForm({ ...projectForm, published: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-500 focus:ring-indigo-500/50"
                    />
                    <label htmlFor="published" className="text-xs font-semibold text-slate-300">Publish immediately</label>
                  </div>
                </div>
              )}

              {/* Skill Form Fields */}
              {activeModal === "skill" && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Skill Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AWS"
                        value={skillForm.name}
                        onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Category</label>
                      <select
                        value={skillForm.category}
                        onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      >
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="Cloud/DevOps">Cloud/DevOps</option>
                        <option value="Databases">Databases</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Level (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={skillForm.level}
                        onChange={(e) => setSkillForm({ ...skillForm, level: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Display Order</label>
                      <input
                        type="number"
                        required
                        value={skillForm.displayOrder}
                        onChange={(e) => setSkillForm({ ...skillForm, displayOrder: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Form Fields */}
              {activeModal === "experience" && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Position</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cloud Engineer"
                        value={experienceForm.position}
                        onChange={(e) => setExperienceForm({ ...experienceForm, position: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Company</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Amazon Web Services"
                        value={experienceForm.company}
                        onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Start Date (YYYY-MM)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2024-01"
                        value={experienceForm.startDate}
                        onChange={(e) => setExperienceForm({ ...experienceForm, startDate: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">End Date (YYYY-MM or empty for Present)</label>
                      <input
                        type="text"
                        placeholder="e.g. 2026-06"
                        value={experienceForm.endDate}
                        onChange={(e) => setExperienceForm({ ...experienceForm, endDate: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Description (Key duties)</label>
                    <textarea
                      required
                      rows={4}
                      value={experienceForm.description}
                      onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs resize-none"
                    ></textarea>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Display Order</label>
                    <input
                      type="number"
                      required
                      value={experienceForm.displayOrder}
                      onChange={(e) => setExperienceForm({ ...experienceForm, displayOrder: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Education Form Fields */}
              {activeModal === "education" && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">School</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Stanford University"
                        value={educationForm.school}
                        onChange={(e) => setEducationForm({ ...educationForm, school: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Major/Degree</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Computer Science"
                        value={educationForm.major}
                        onChange={(e) => setEducationForm({ ...educationForm, major: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Start Date (YYYY-MM)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2020-09"
                        value={educationForm.startDate}
                        onChange={(e) => setEducationForm({ ...educationForm, startDate: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">End Date (YYYY-MM)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2024-06"
                        value={educationForm.endDate}
                        onChange={(e) => setEducationForm({ ...educationForm, endDate: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Description (Optional)</label>
                    <input
                      type="text"
                      value={educationForm.description}
                      onChange={(e) => setEducationForm({ ...educationForm, description: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Blog Form Fields (with Live Markdown Preview!) */}
              {activeModal === "blog" && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Blog Title</label>
                      <input
                        type="text"
                        required
                        value={blogForm.title}
                        onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Slug (e.g. aws-serverless-deploy)</label>
                      <input
                        type="text"
                        required
                        value={blogForm.slug}
                        onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Summary (Brief pitch)</label>
                    <input
                      type="text"
                      required
                      value={blogForm.summary}
                      onChange={(e) => setBlogForm({ ...blogForm, summary: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Cover Image URL</label>
                      <input
                        type="text"
                        required
                        value={blogForm.coverImage}
                        onChange={(e) => setBlogForm({ ...blogForm, coverImage: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Tags (Comma-separated)</label>
                      <input
                        type="text"
                        required
                        value={blogForm.tags}
                        onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  {/* Toggle Mode: Write vs Preview */}
                  <div className="flex border-b border-slate-800">
                    <button
                      type="button"
                      onClick={() => setBlogPreviewMode(false)}
                      className={`px-4 py-2 text-xs font-semibold ${!blogPreviewMode ? "text-indigo-400 border-b-2 border-indigo-400" : "text-slate-400"}`}
                    >
                      Markdown Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlogPreviewMode(true)}
                      className={`px-4 py-2 text-xs font-semibold ${blogPreviewMode ? "text-indigo-400 border-b-2 border-indigo-400" : "text-slate-400"}`}
                    >
                      Preview HTML
                    </button>
                  </div>

                  {blogPreviewMode ? (
                    <div
                      className="p-4 bg-slate-950 border border-slate-800 rounded-lg h-60 overflow-y-auto prose prose-invert prose-xs text-slate-300 max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(marked.parse(blogForm.content || "") as string),
                      }}
                    />
                  ) : (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Blog Content (Markdown)</label>
                      <textarea
                        required
                        rows={10}
                        value={blogForm.content}
                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono text-[11px] focus:outline-none resize-none h-60"
                      ></textarea>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      id="blog-published"
                      type="checkbox"
                      checked={blogForm.published}
                      onChange={(e) => setBlogForm({ ...blogForm, published: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-500 focus:ring-indigo-500/50"
                    />
                    <label htmlFor="blog-published" className="text-xs font-semibold text-slate-300">Publish immediately to S3 blog index</label>
                  </div>
                </div>
              )}

              {/* Form Controls */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50 text-xs font-semibold cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
