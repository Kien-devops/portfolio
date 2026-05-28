document.addEventListener('DOMContentLoaded', () => {
    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function isImageUrl(value) {
        return /^https?:\/\/.+\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(String(value || '').trim());
    }

    function isUrl(value) {
        return /^https?:\/\//i.test(String(value || '').trim());
    }

    function renderBlogCardVisual(blog) {
        if (isUrl(blog.image_url)) {
            return `<img src="${escapeHtml(blog.image_url)}" alt="${escapeHtml(blog.title)}" class="w-12 h-12 rounded-lg object-cover border border-outline-variant/30"/>`;
        }

        const iconClass = blog.image_url && !isUrl(blog.image_url) ? blog.image_url : 'fa-solid fa-book';
        return `<span class="${escapeHtml(iconClass)} text-secondary text-3xl"></span>`;
    }

    function renderBlogCardCover(blog) {
        if (!isUrl(blog.image_url)) return '';

        return `
            <figure class="aspect-[16/9] overflow-hidden border-b border-outline-variant/30 bg-surface-container">
                <img src="${escapeHtml(blog.image_url)}" alt="${escapeHtml(blog.title)}" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"/>
            </figure>
        `;
    }

    function renderBlogHeroImage(blog) {
        if (!isUrl(blog.image_url)) return '';

        return `
            <figure class="my-10 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container shadow-sm">
                <img src="${escapeHtml(blog.image_url)}" alt="${escapeHtml(blog.title)}" class="w-full max-h-[460px] object-cover"/>
            </figure>
        `;
    }

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
            const response = await fetch('blogs.php');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const result = await response.json();
            
            if (result.status === 'success') {
                container.innerHTML = '';
                const blogs = result.data;
                
                if (blogs.length === 0) {
                    container.innerHTML = `<div class="col-span-full text-center text-on-surface-variant font-body-md">No blogs found.</div>`;
                    return;
                }

                blogs.forEach(blog => {
                    const card = document.createElement('article');
                    card.className = "bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 border border-outline-variant/30 flex flex-col overflow-hidden group";
                    const hasImage = isUrl(blog.image_url);
                    
                    card.innerHTML = `
                        ${renderBlogCardCover(blog)}
                        <div class="p-8 flex flex-col flex-1">
                            <div class="flex justify-between items-start gap-4 mb-6">
                                ${hasImage ? '' : renderBlogCardVisual(blog)}
                                <span class="font-label-sm text-on-surface-variant tracking-wider uppercase">${escapeHtml(blog.date)}</span>
                            </div>
                            <h3 class="font-headline-md text-headline-md text-primary mb-4 group-hover:text-secondary transition-colors duration-300">${escapeHtml(blog.title)}</h3>
                            <p class="text-on-surface-variant font-body-md mb-8 leading-relaxed">${escapeHtml(blog.summary)}</p>
                            <a href="blog.html?id=${encodeURIComponent(blog.id)}" class="font-label-md text-label-md uppercase tracking-widest text-secondary hover:text-primary transition-colors flex items-center gap-2 group/btn">
                                <span>Read Article</span>
                                <span class="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                            </a>
                        </div>
                    `;

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
        if (!content || !content.trim()) {
            return `<div class="rounded-xl border border-outline-variant/30 bg-surface-container-low p-6 text-on-surface-variant font-body-md">Article content is being prepared.</div>`;
        }
        // Split by double newline to detect blocks (paragraphs or lists)
        const blocks = content.split(/\n\s*\n/);
        return blocks.map(block => {
            const trimmed = block.trim();
            if (!trimmed) return '';

            const codeBlock = trimmed.match(/^```([a-zA-Z0-9_-]*)\n([\s\S]*?)```$/);
            if (codeBlock) {
                const language = codeBlock[1] ? `<div class="px-4 py-2 border-b border-white/10 text-[11px] uppercase tracking-widest text-white/50">${escapeHtml(codeBlock[1])}</div>` : '';
                return `
                    <pre class="my-8 overflow-hidden rounded-xl bg-[#1a1c1c] text-[#f2f0f0] shadow-sm"><code>${language}<div class="overflow-x-auto p-4 font-mono text-[13px] leading-6">${escapeHtml(codeBlock[2])}</div></code></pre>
                `;
            }

            if (trimmed.startsWith('### ')) {
                return `<h3 class="mt-10 mb-4 font-headline-md text-headline-md text-primary">${escapeHtml(trimmed.slice(4))}</h3>`;
            }

            if (trimmed.startsWith('## ')) {
                return `<h2 class="mt-12 mb-5 font-headline-lg text-headline-lg text-primary">${escapeHtml(trimmed.slice(3))}</h2>`;
            }

            if (trimmed.startsWith('# ')) {
                return `<h2 class="mt-12 mb-5 font-headline-lg text-headline-lg text-primary">${escapeHtml(trimmed.slice(2))}</h2>`;
            }

            const markdownImage = trimmed.match(/^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)$/i);
            if (markdownImage && isUrl(markdownImage[2])) {
                const caption = markdownImage[1].trim();
                return `
                    <figure class="my-10">
                        <img src="${escapeHtml(markdownImage[2])}" alt="${escapeHtml(caption)}" class="w-full rounded-xl object-cover border border-outline-variant/30 shadow-sm"/>
                        ${caption ? `<figcaption class="mt-3 text-center font-label-sm text-[12px] uppercase tracking-widest text-on-surface-variant/70">${escapeHtml(caption)}</figcaption>` : ''}
                    </figure>
                `;
            }

            if (isImageUrl(trimmed)) {
                return `<figure class="my-10"><img src="${escapeHtml(trimmed)}" alt="Blog image" class="w-full rounded-xl object-cover border border-outline-variant/30 shadow-sm"/></figure>`;
            }
            
            // Detect list items starting with - or bullet symbol
            if (trimmed.startsWith('-')) {
                const items = trimmed.split('\n');
                const listItems = items.map(item => {
                    const cleanItem = escapeHtml(item.replace(/^-\s*/, '').trim());
                    return `<li class="relative pl-6 text-on-surface-variant text-body-lg font-body-md leading-8"><span class="absolute left-0 top-[13px] w-1.5 h-1.5 rounded-full bg-secondary"></span>${cleanItem}</li>`;
                }).join('');
                return `<ul class="my-6 space-y-3">${listItems}</ul>`;
            }

            // Paragraph blocks
            return `<p class="mb-6 text-on-surface-variant leading-8 text-body-lg font-body-md">${escapeHtml(trimmed).replace(/\n/g, '<br>')}</p>`;
        }).join('');
    }

    function openBlogModal(blog) {
        if (!modal) return;
        document.getElementById('modal-blog-title').innerText = blog.title;
        document.getElementById('modal-blog-date').innerText = blog.date;
        
        const iconEl = document.getElementById('modal-blog-icon');
        iconEl.className = blog.image_url && !isUrl(blog.image_url) ? blog.image_url : 'fa-solid fa-book';
        
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
            const response = await fetch('projects.php');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const result = await response.json();
            
            if (result.status === 'success') {
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

    async function loadBlogDetail() {
        const container = document.getElementById('blog-detail-container');
        if (!container) return;

        const blogId = new URLSearchParams(window.location.search).get('id');
        if (!blogId) {
            container.innerHTML = `<div class="text-center text-error font-body-md">Missing blog id.</div>`;
            return;
        }

        try {
            const response = await fetch('blogs.php');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            const blogs = result.status === 'success' && Array.isArray(result.data) ? result.data : [];
            const blog = blogs.find(item => String(item.id) === String(blogId));

            if (!blog) {
                container.innerHTML = `<div class="text-center text-error font-body-md">Blog not found.</div>`;
                return;
            }

            document.title = `${blog.title} | Kien Nguyen`;
            const hasHeroImage = isUrl(blog.image_url);
            container.innerHTML = `
                <article class="max-w-3xl mx-auto">
                    <a href="blogs.html" class="inline-flex items-center gap-2 font-label-md text-label-md uppercase tracking-widest text-secondary hover:text-primary transition-colors mb-10">
                        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
                        <span>Back to Blogs</span>
                    </a>
                    <div class="flex items-center gap-3 mb-6">
                        ${hasHeroImage ? '' : renderBlogCardVisual(blog)}
                        <span class="w-1.5 h-1.5 rounded-full bg-outline-variant/50 ${hasHeroImage ? '' : 'ml-1'}"></span>
                        <span class="font-label-sm text-secondary uppercase tracking-widest text-[11px]">${escapeHtml(blog.date)}</span>
                    </div>
                    <h1 class="font-headline-xl text-[34px] md:text-headline-xl text-primary leading-tight mb-8 break-words">${escapeHtml(blog.title)}</h1>
                    <p class="font-body-lg text-body-lg text-on-surface-variant leading-8 mb-10">${escapeHtml(blog.summary)}</p>
                    ${renderBlogHeroImage(blog)}
                    <div class="flex items-center gap-4 py-4 border-y border-outline-variant/20 mb-10">
                        <div class="w-10 h-10 rounded-full bg-secondary text-on-primary flex items-center justify-center font-bold tracking-tighter text-sm">KN</div>
                        <div>
                            <p class="font-label-md text-primary font-semibold">Kien Nguyen</p>
                            <p class="font-label-sm text-on-surface-variant/80 text-[12px]">DevOps &amp; DevSecOps Architect</p>
                        </div>
                    </div>
                    <div class="font-body-lg text-body-lg text-on-surface-variant leading-8 space-y-4">
                        ${formatBlogContent(blog.content)}
                    </div>
                </article>
            `;
        } catch (error) {
            container.innerHTML = `<div class="text-center text-error font-body-md">Error loading blog article.</div>`;
        }
    }

    // Initialize blog and project loading
    loadBlogs();
    loadBlogDetail();
    loadProjects();
});
