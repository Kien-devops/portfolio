document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Drawer Logic ---
    const menuToggle = document.getElementById('menu-toggle');
    const closeDrawer = document.getElementById('close-drawer');
    const drawer = document.getElementById('nav-drawer');
    const overlay = document.getElementById('drawer-overlay');

    function toggleNav() {
        if (drawer.classList.contains('-translate-x-full')) {
            // Open drawer
            drawer.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
            // Force reflow
            void overlay.offsetHeight;
            overlay.classList.remove('opacity-0');
            document.body.classList.add('overflow-hidden');
        } else {
            // Close drawer
            drawer.classList.add('-translate-x-full');
            overlay.classList.add('opacity-0');
            document.body.classList.remove('overflow-hidden');
            setTimeout(() => {
                if (drawer.classList.contains('-translate-x-full')) {
                    overlay.classList.add('hidden');
                }
            }, 300);
        }
    }

    if (menuToggle) menuToggle.addEventListener('click', toggleNav);
    if (closeDrawer) closeDrawer.addEventListener('click', toggleNav);
    if (overlay) overlay.addEventListener('click', toggleNav);

    // Global toggleNav reference for inline onclicks in links
    window.toggleNav = toggleNav;

    // --- Scroll Animations (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-up');
    revealElements.forEach(el => {
        observer.observe(el);
    });

    // --- Form Label Color Interaction ---
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        const label = input.parentElement.querySelector('label');
        if (label) {
            input.addEventListener('focus', () => {
                label.style.color = '#735c00'; // Gold/secondary color on focus
            });
            input.addEventListener('blur', () => {
                if (!input.value) {
                    label.style.color = '';
                }
            });
        }
    });

    // --- Load Blogs Dynamic Integration ---
    async function loadBlogs() {
        const container = document.getElementById('blogs-container');
        if (!container) return;

        try {
            const response = await fetch('api.php');
            const result = await response.json();
            
            if (result.status === 'success' || result.status === 'fallback') {
                container.innerHTML = '';
                const blogs = result.data;
                
                if (blogs.length === 0) {
                    container.innerHTML = `<div class="col-span-full text-center text-on-surface-variant font-body-md">No blogs found.</div>`;
                    return;
                }

                blogs.forEach(blog => {
                    const card = document.createElement('article');
                    card.className = "bg-surface-container-lowest p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 border border-outline-variant/30 flex flex-col justify-between group";
                    
                    card.innerHTML = `
                        <div>
                            <div class="flex justify-between items-start mb-6">
                                <span class="${blog.image_url || 'fa-solid fa-book'} text-secondary text-3xl"></span>
                                <span class="font-label-sm text-on-surface-variant tracking-wider uppercase">${blog.date}</span>
                            </div>
                            <h3 class="font-headline-md text-headline-md text-primary mb-4 group-hover:text-secondary transition-colors duration-300">${blog.title}</h3>
                            <p class="text-on-surface-variant font-body-md mb-8 leading-relaxed">${blog.summary}</p>
                        </div>
                        <div>
                            <button class="read-more-btn font-label-md text-label-md uppercase tracking-widest text-secondary hover:text-primary transition-colors flex items-center gap-2 group/btn">
                                <span>Read Article</span>
                                <span class="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    `;

                    const btn = card.querySelector('.read-more-btn');
                    btn.addEventListener('click', () => openBlogModal(blog));

                    container.appendChild(card);
                });
            } else {
                container.innerHTML = `<div class="col-span-full text-center text-error font-body-md">Error loading blogs: ${result.message}</div>`;
            }
        } catch (error) {
            container.innerHTML = `<div class="col-span-full text-center text-error font-body-md">Error connecting to blogs API.</div>`;
        }
    }

    // Modal Control
    const modal = document.getElementById('blog-modal');
    const closeBtn = document.getElementById('close-blog-modal');
    const modalMaxCard = document.getElementById('blog-modal-card');

    function formatBlogContent(content) {
        if (!content) return '';
        // Split by double newline to detect blocks (paragraphs or lists)
        const blocks = content.split(/\n\s*\n/);
        return blocks.map(block => {
            const trimmed = block.trim();
            if (!trimmed) return '';
            
            // Detect list items starting with - or bullet symbol
            if (trimmed.startsWith('-')) {
                const items = trimmed.split('\n');
                const listItems = items.map(item => {
                    const cleanItem = item.replace(/^-\s*/, '').trim();
                    return `<li class="relative pl-6 text-on-surface-variant text-body-lg font-body-md"><span class="absolute left-0 top-[11px] w-1.5 h-1.5 rounded-full bg-secondary"></span>${cleanItem}</li>`;
                }).join('');
                return `<ul class="my-6 space-y-3">${listItems}</ul>`;
            }

            // Paragraph blocks
            return `<p class="mb-6 text-on-surface-variant leading-relaxed text-body-lg font-body-md">${trimmed.replace(/\n/g, '<br>')}</p>`;
        }).join('');
    }

    function openBlogModal(blog) {
        if (!modal) return;
        document.getElementById('modal-blog-title').innerText = blog.title;
        document.getElementById('modal-blog-date').innerText = blog.date;
        
        const iconEl = document.getElementById('modal-blog-icon');
        iconEl.className = blog.image_url || 'fa-solid fa-book';
        
        // Render rich formatted HTML
        document.getElementById('modal-blog-content').innerHTML = formatBlogContent(blog.content);

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        void modal.offsetHeight;
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
        
        if (modalMaxCard) {
            modalMaxCard.classList.remove('scale-95');
            modalMaxCard.classList.add('scale-100');
        }
        document.body.classList.add('overflow-hidden');
    }

    function closeBlogModal() {
        if (!modal) return;
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        
        if (modalMaxCard) {
            modalMaxCard.classList.remove('scale-100');
            modalMaxCard.classList.add('scale-95');
        }
        
        document.body.classList.remove('overflow-hidden');
        setTimeout(() => {
            if (modal.classList.contains('opacity-0')) {
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            }
        }, 500); // Wait for transition duration (500ms) to complete
    }

    if (closeBtn) closeBtn.addEventListener('click', closeBlogModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeBlogModal();
        });
    }

    // --- Load Projects Dynamic Integration ---
    async function loadProjects() {
        const container = document.getElementById('projects-container');
        if (!container) return;

        try {
            const response = await fetch('api.php?action=projects');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const result = await response.json();
            
            if (result.status === 'success' || result.status === 'fallback') {
                container.innerHTML = '';
                const projects = Array.isArray(result.data) ? result.data : [];
                
                if (projects.length === 0) {
                    container.innerHTML = `<div class="col-span-full text-center text-on-surface-variant font-body-md">No projects found.</div>`;
                    return;
                }

                projects.forEach(project => {
                    const article = document.createElement('article');
                    article.className = "group";
                    const techStack = Array.isArray(project.tech_stack)
                        ? project.tech_stack
                        : String(project.tech_stack || '').split(',').map(tech => tech.trim()).filter(Boolean);
                    const details = Array.isArray(project.details) ? project.details : [];
                    
                    // Create tech badges HTML
                    const techBadgesHtml = techStack.map(tech => 
                        `<span class="px-3 py-1 bg-surface-container text-label-sm font-mono text-on-surface rounded">${tech}</span>`
                    ).join('');

                    // Create project details list HTML
                    const detailsListHtml = details.map(detail => 
                        `<li class="flex gap-3"><i class="${detail.icon} text-secondary mt-1"></i> <div><strong>${detail.detail_title}:</strong> ${detail.detail_description}</div></li>`
                    ).join('');

                    article.innerHTML = `
                        <!-- Project Presentation (Clean Tech Box instead of photo) -->
                        <div class="relative overflow-hidden rounded-xl bg-primary-container p-8 md:p-12 min-h-[300px] flex flex-col justify-between border border-outline-variant/30 hover:border-secondary transition-all duration-500 shadow-md">
                            <div class="absolute inset-0 opacity-[0.03] pointer-events-none">
                                <div class="absolute inset-0 bg-[linear-gradient(45deg,#735c00_25%,transparent_25%,transparent_50%,#735c00_50%,#735c00_75%,transparent_75%,transparent)] [background-size:20px_20px]"></div>
                            </div>
                            
                            <div class="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                <span class="bg-surface-container-low text-secondary font-mono text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">${project.project_number}</span>
                                <a href="${project.github_url}" target="_blank" class="flex items-center gap-2 text-[#735c00] hover:text-[#FF9900] transition-colors font-mono text-sm">
                                    <i class="fa-brands fa-github text-xl"></i> Source Repository
                                </a>
                            </div>

                            <div class="relative z-10 mt-8">
                                <h3 class="font-headline-lg text-headline-lg text-white mb-4">${project.title}</h3>
                                <p class="text-on-primary-container font-body-lg max-w-3xl leading-relaxed mb-6">
                                    ${project.summary}
                                </p>
                            </div>
                        </div>

                        <!-- Project Details -->
                        <div class="mt-8 grid md:grid-cols-12 gap-8">
                            <div class="md:col-span-8 space-y-6">
                                <h4 class="font-headline-md text-headline-md text-primary">Architecture &amp; DevOps Flow:</h4>
                                <ul class="space-y-4 text-on-surface-variant font-body-md leading-relaxed">
                                    ${detailsListHtml}
                                </ul>
                            </div>
                            <div class="md:col-span-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 h-fit">
                                <h4 class="font-label-md text-label-md text-primary uppercase tracking-widest mb-4">Core Tech Stack</h4>
                                <div class="flex flex-wrap gap-2">
                                    ${techBadgesHtml}
                                </div>
                            </div>
                        </div>
                    `;

                    container.appendChild(article);
                });
            } else {
                container.innerHTML = `<div class="col-span-full text-center text-error font-body-md">Error loading projects: ${result.message}</div>`;
            }
        } catch (error) {
            console.error('Projects API error:', error);
            container.innerHTML = `<div class="col-span-full text-center text-error font-body-md">Error connecting to projects API: ${error.message}</div>`;
        }
    }

    // Initialize blog and project loading
    loadBlogs();
    loadProjects();
});
