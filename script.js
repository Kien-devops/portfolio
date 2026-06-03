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

    const portfolioApiBaseUrl = String(window.PORTFOLIO_API_BASE_URL || '').replace(/\/$/, '');
    const blogsEndpoint = portfolioApiBaseUrl ? `${portfolioApiBaseUrl}/blogs` : '';
    const projectsEndpoint = portfolioApiBaseUrl ? `${portfolioApiBaseUrl}/projects` : '';

    function commentsEndpoint(blogId) {
        return `${blogsEndpoint}/${encodeURIComponent(blogId)}/comments`;
    }

    const CACHE_PREFIX = 'portfolio-cache-v1:';

    function readCache(key) {
        try {
            const cached = JSON.parse(localStorage.getItem(`${CACHE_PREFIX}${key}`) || 'null');
            if (!cached || !cached.data) return null;
            return cached;
        } catch (error) {
            return null;
        }
    }

    function writeCache(key, data) {
        try {
            localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({
                savedAt: Date.now(),
                data,
            }));
        } catch (error) {
            // Ignore storage quota/private browsing failures.
        }
    }

    async function fetchJsonWithTimeout(url, timeoutMs = 8000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } finally {
            clearTimeout(timeoutId);
        }
    }

    function assertApiConfigured() {
        if (!portfolioApiBaseUrl) {
            throw new Error('Portfolio API URL is not configured in config.js');
        }
    }

    function formatDate(value) {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    }

    function getItems(result) {
        if (Array.isArray(result.items)) return result.items;
        if (Array.isArray(result.data)) return result.data;
        return [];
    }

    function normalizeBlog(blog) {
        const tags = Array.isArray(blog.tags) ? blog.tags : 
                     (blog.tags ? String(blog.tags).split(',').map(t => t.trim()).filter(Boolean) : []);
        return {
            ...blog,
            title: blog.title || 'Untitled Blog',
            summary: blog.summary || '',
            content: blog.content || '',
            image_url: blog.image_url || blog.coverImage || blog.imageUrl || '',
            date: blog.date || formatDate(blog.createdAt || blog.updatedAt),
            tags: tags
        };
    }

    function normalizeProject(project, index) {
        const techStack = project.tech_stack || project.techStack || [];
        const details = Array.isArray(project.details) ? project.details : [];
        const description = project.description || '';

        return {
            ...project,
            project_number: project.project_number || project.projectNumber || `PROJECT ${String(index + 1).padStart(2, '0')}`,
            title: project.title || project.name || 'Untitled Project',
            summary: project.summary || description,
            github_url: project.github_url || project.githubUrl || '',
            tech_stack: Array.isArray(techStack) ? techStack : String(techStack || '').split(',').map(tech => tech.trim()).filter(Boolean),
            details: details.length ? details : (description ? [{
                icon: 'fa-solid fa-diagram-project',
                detail_title: 'Overview',
                detail_description: description
            }] : []),
        };
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
            <figure class="my-7 mx-auto w-full max-w-[560px] overflow-hidden rounded-lg border border-outline-variant/30 bg-white shadow-sm">
                <img src="${escapeHtml(blog.image_url)}" alt="${escapeHtml(blog.title)}" class="h-[220px] md:h-[280px] w-full object-contain p-3"/>
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
    function renderBlogs(container, blogs) {
        container.innerHTML = '';

        if (blogs.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center text-on-surface-variant font-body-md">No blogs found.</div>`;
            return;
        }

        blogs.forEach(blog => {
            const card = document.createElement('article');
            card.className = "bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-500 border border-outline-variant/30 flex flex-col-reverse md:flex-row overflow-hidden group w-full cursor-pointer";

            card.addEventListener('click', (e) => {
                if (e.target.closest('a') || e.target.closest('button')) return;
                window.location.href = `blog.html?id=${encodeURIComponent(blog.id)}`;
            });

            const hasImage = isUrl(blog.image_url);

            if (hasImage) {
                card.innerHTML = `
                    <!-- Left Side: Content -->
                    <div class="p-6 md:p-8 flex flex-col justify-between flex-1 min-w-0">
                        <div>
                            <h3 class="font-headline-md text-[20px] md:text-headline-md text-primary mb-3 group-hover:text-secondary transition-colors duration-300 leading-snug">
                                ${escapeHtml(blog.title)}
                            </h3>
                            <p class="text-on-surface-variant font-body-md mb-6 leading-relaxed line-clamp-2 md:line-clamp-3">
                                ${escapeHtml(blog.summary)}
                            </p>
                        </div>
                        <div class="flex flex-wrap items-center gap-y-2 gap-x-6 text-on-surface-variant/80 font-label-sm mt-auto">
                            <div class="flex items-center text-on-surface-variant/70">
                                <span class="material-symbols-outlined text-[18px] mr-1.5">calendar_month</span>
                                <span>${escapeHtml(blog.date)}</span>
                            </div>
                            ${blog.tags && blog.tags.length ? `
                            <div class="flex items-center text-on-surface-variant/70 min-w-0">
                                <span class="material-symbols-outlined text-[18px] mr-1.5 shrink-0">folder</span>
                                <span class="truncate">${escapeHtml(blog.tags.join(', '))}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <!-- Right Side: Cover Image -->
                    <div class="w-full md:w-[34%] h-44 md:h-auto md:shrink-0 relative overflow-hidden bg-white border-b md:border-b-0 md:border-l border-outline-variant/20">
                        <img src="${escapeHtml(blog.image_url)}" alt="${escapeHtml(blog.title)}" class="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-[1.02]"/>
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <!-- Full Width Content -->
                    <div class="p-6 md:p-8 flex flex-col justify-between flex-1 min-w-0">
                        <div>
                            <div class="flex items-center gap-3 mb-4">
                                ${renderBlogCardVisual(blog)}
                            </div>
                            <h3 class="font-headline-md text-[20px] md:text-headline-md text-primary mb-3 group-hover:text-secondary transition-colors duration-300 leading-snug">
                                ${escapeHtml(blog.title)}
                            </h3>
                            <p class="text-on-surface-variant font-body-md mb-6 leading-relaxed line-clamp-3">
                                ${escapeHtml(blog.summary)}
                            </p>
                        </div>
                        <div class="flex flex-wrap items-center gap-y-2 gap-x-6 text-on-surface-variant/80 font-label-sm mt-auto">
                            <div class="flex items-center text-on-surface-variant/70">
                                <span class="material-symbols-outlined text-[18px] mr-1.5">calendar_month</span>
                                <span>${escapeHtml(blog.date)}</span>
                            </div>
                            ${blog.tags && blog.tags.length ? `
                            <div class="flex items-center text-on-surface-variant/70 min-w-0">
                                <span class="material-symbols-outlined text-[18px] mr-1.5 shrink-0">folder</span>
                                <span class="truncate">${escapeHtml(blog.tags.join(', '))}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }

            container.appendChild(card);
        });
    }

    async function loadBlogs() {
        const container = document.getElementById('blogs-container');
        if (!container) return;

        const cacheKey = 'blogs';
        const cached = readCache(cacheKey);
        const hasUsableCache = cached && Array.isArray(cached.data);
        if (hasUsableCache) {
            renderBlogs(container, cached.data);
        }

        try {
            assertApiConfigured();
            const result = await fetchJsonWithTimeout(blogsEndpoint);
            const blogs = getItems(result).map(normalizeBlog);
            writeCache(cacheKey, blogs);
            renderBlogs(container, blogs);
        } catch (error) {
            if (!hasUsableCache) {
                container.innerHTML = `<div class="col-span-full text-center text-error font-body-md">Error connecting to blogs API: ${escapeHtml(error.message)}</div>`;
            }
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

        const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(content.trim());
        if (looksLikeHtml) {
            return `
                <div class="blog-rich-content">
                    ${content}
                </div>
            `;
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

    function renderCommentItem(comment, blogId, depth = 0) {
        const replies = Array.isArray(comment.replies) ? comment.replies : [];
        const nestedClass = depth > 0 ? 'ml-4 md:ml-8' : '';
        return `
            <article class="${nestedClass} rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
                <div class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-full bg-secondary text-on-primary flex items-center justify-center font-bold text-sm shrink-0">
                        ${escapeHtml((comment.author_name || 'A').slice(0, 1).toUpperCase())}
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <p class="font-label-md text-primary font-semibold">${escapeHtml(comment.author_name || 'Anonymous')}</p>
                            ${comment.author_email ? `<span class="font-label-sm text-[12px] text-on-surface-variant/70">${escapeHtml(comment.author_email)}</span>` : ''}
                            <span class="text-on-surface-variant/50">/</span>
                            <time class="font-label-sm text-[12px] text-on-surface-variant/70">${escapeHtml(formatDate(comment.created_at))}</time>
                        </div>
                        <p class="mt-3 text-on-surface-variant font-body-md leading-7 whitespace-pre-wrap">${escapeHtml(comment.content || '')}</p>
                        <button class="mt-4 inline-flex items-center gap-1 text-secondary hover:text-primary transition-colors font-label-md text-label-md uppercase tracking-widest" data-reply-toggle="${escapeHtml(comment.comment_id)}">
                            <span class="material-symbols-outlined text-[17px]">reply</span>
                            <span>Reply</span>
                        </button>
                        <form class="comment-reply-form hidden mt-4 rounded-lg bg-surface-container-low p-4 border border-outline-variant/20" data-blog-id="${escapeHtml(blogId)}" data-parent-id="${escapeHtml(comment.comment_id)}">
                            <div class="grid md:grid-cols-2 gap-3 mb-3">
                                <input class="rounded-lg border-outline-variant bg-white text-body-md" name="email" type="email" placeholder="Email" required>
                                <input class="rounded-lg border-outline-variant bg-white text-body-md" name="author_name" type="text" placeholder="Name optional">
                            </div>
                            <textarea class="w-full rounded-lg border-outline-variant bg-white text-body-md" name="content" rows="3" maxlength="2000" placeholder="Write a reply..." required></textarea>
                            <button class="mt-3 bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md uppercase tracking-widest hover:bg-secondary transition-colors" type="submit">Send Reply</button>
                            <p class="comment-form-message mt-3 text-sm text-on-surface-variant"></p>
                        </form>
                    </div>
                </div>
                ${replies.length ? `<div class="mt-4 space-y-4">${replies.map(reply => renderCommentItem(reply, blogId, depth + 1)).join('')}</div>` : ''}
            </article>
        `;
    }

    function renderCommentsSection(blogId) {
        return `
            <section class="mt-14 pt-10 border-t border-outline-variant/20" id="comments-section" data-blog-id="${escapeHtml(blogId)}">
                <h2 class="font-headline-lg text-headline-lg text-primary mb-6">Comments</h2>
                <form id="comment-form" class="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm mb-8" data-blog-id="${escapeHtml(blogId)}">
                    <div class="grid md:grid-cols-2 gap-3 mb-3">
                        <input class="rounded-lg border-outline-variant bg-white text-body-md" name="email" type="email" placeholder="Email" required>
                        <input class="rounded-lg border-outline-variant bg-white text-body-md" name="author_name" type="text" placeholder="Name optional">
                    </div>
                    <textarea class="w-full rounded-lg border-outline-variant bg-white text-body-md" name="content" rows="4" maxlength="2000" placeholder="Write a comment..." required></textarea>
                    <button class="mt-3 bg-primary text-on-primary px-5 py-3 rounded-lg font-label-md text-label-md uppercase tracking-widest hover:bg-secondary transition-colors" type="submit">Send Comment</button>
                    <p class="comment-form-message mt-3 text-sm text-on-surface-variant"></p>
                </form>
                <div id="comments-list" class="space-y-4">
                    <div class="text-center py-8 text-on-surface-variant">Loading comments...</div>
                </div>
            </section>
        `;
    }

    async function loadComments(blogId) {
        const list = document.getElementById('comments-list');
        if (!list) return;

        try {
            assertApiConfigured();
            const response = await fetch(commentsEndpoint(blogId));
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();
            const comments = Array.isArray(result.items) ? result.items : [];

            if (!comments.length) {
                list.innerHTML = `<div class="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low p-6 text-center text-on-surface-variant">No comments yet.</div>`;
                return;
            }

            list.innerHTML = comments.map(comment => renderCommentItem(comment, blogId)).join('');
        } catch (error) {
            list.innerHTML = `<div class="rounded-xl border border-outline-variant/30 bg-surface-container-low p-6 text-center text-error">Error loading comments.</div>`;
        }
    }

    function getCommentFormPayload(form) {
        const formData = new FormData(form);
        return {
            email: String(formData.get('email') || '').trim(),
            author_name: String(formData.get('author_name') || '').trim(),
            content: String(formData.get('content') || '').trim(),
        };
    }

    async function submitCommentForm(form) {
        const blogId = form.dataset.blogId;
        const parentId = form.dataset.parentId;
        const message = form.querySelector('.comment-form-message');
        const button = form.querySelector('button[type="submit"]');
        const url = parentId
            ? `${commentsEndpoint(blogId)}/${encodeURIComponent(parentId)}/replies`
            : commentsEndpoint(blogId);

        if (message) message.textContent = 'Sending...';
        if (button) button.disabled = true;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(getCommentFormPayload(form)),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.message || `HTTP ${response.status}`);

            form.reset();
            if (message) message.textContent = parentId ? 'Reply sent.' : 'Comment sent.';
            await loadComments(blogId);
        } catch (error) {
            if (message) message.textContent = `Error: ${error.message}`;
        } finally {
            if (button) button.disabled = false;
        }
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

    function renderProjects(container, projects) {
        container.innerHTML = '';

        if (projects.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center text-on-surface-variant font-body-md">No projects found.</div>`;
            return;
        }

        projects.forEach(project => {
            const article = document.createElement('article');
            article.className = "group";
            const techStack = project.tech_stack;
            const details = Array.isArray(project.details) ? project.details : [];

            const techBadgesHtml = techStack.map(tech =>
                `<span class="px-3 py-1 bg-surface-container text-label-sm font-mono text-on-surface rounded">${escapeHtml(tech)}</span>`
            ).join('');

            const detailsListHtml = details.map(detail =>
                `<li class="flex gap-3"><i class="${escapeHtml(detail.icon || 'fa-solid fa-circle-check')} text-secondary mt-1"></i> <div><strong>${escapeHtml(detail.detail_title || 'Detail')}:</strong> ${escapeHtml(detail.detail_description || '')}</div></li>`
            ).join('');

            article.innerHTML = `
                <div class="relative overflow-hidden rounded-xl bg-primary-container p-8 md:p-12 min-h-[300px] flex flex-col justify-between border border-outline-variant/30 hover:border-secondary transition-all duration-500 shadow-md">
                    <div class="absolute inset-0 opacity-[0.03] pointer-events-none">
                        <div class="absolute inset-0 bg-[linear-gradient(45deg,#735c00_25%,transparent_25%,transparent_50%,#735c00_50%,#735c00_75%,transparent_75%,transparent)] [background-size:20px_20px]"></div>
                    </div>
                    <div class="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <span class="bg-surface-container-low text-secondary font-mono text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">${escapeHtml(project.project_number)}</span>
                        <a href="${escapeHtml(project.github_url || '#')}" target="_blank" class="flex items-center gap-2 text-[#735c00] hover:text-[#FF9900] transition-colors font-mono text-sm">
                            <i class="fa-brands fa-github text-xl"></i> Source Repository
                        </a>
                    </div>
                    <div class="relative z-10 mt-8">
                        <h3 class="font-headline-lg text-headline-lg text-white mb-4">${escapeHtml(project.title)}</h3>
                        <p class="text-on-primary-container font-body-lg max-w-3xl leading-relaxed mb-6">
                            ${escapeHtml(project.summary)}
                        </p>
                    </div>
                </div>
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
    }

    // --- Load Projects Dynamic Integration ---
    async function loadProjects() {
        const container = document.getElementById('projects-container');
        if (!container) return;

        const cacheKey = 'projects';
        const cached = readCache(cacheKey);
        const hasUsableCache = cached && Array.isArray(cached.data) && cached.data.length;
        if (hasUsableCache) {
            renderProjects(container, cached.data);
        }

        try {
            assertApiConfigured();
            const result = await fetchJsonWithTimeout(projectsEndpoint);
            const projects = getItems(result).map(normalizeProject);
            writeCache(cacheKey, projects);
            renderProjects(container, projects);
        } catch (error) {
            console.error('Projects API error:', error);
            if (!hasUsableCache) {
                container.innerHTML = `<div class="col-span-full text-center text-error font-body-md">Error connecting to projects API: ${escapeHtml(error.message)}</div>`;
            }
        }
    }

    function renderBlogDetail(container, blog) {
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
                <h1 class="font-headline-xl text-[30px] md:text-[40px] text-primary leading-tight mb-6 break-words">${escapeHtml(blog.title)}</h1>
                <p class="font-body-lg text-[17px] md:text-body-lg text-on-surface-variant leading-8 mb-8">${escapeHtml(blog.summary)}</p>
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
                ${renderCommentsSection(blog.id)}
            </article>
        `;
        loadComments(blog.id);
    }

    async function loadBlogDetail() {
        const container = document.getElementById('blog-detail-container');
        if (!container) return;

        const blogId = new URLSearchParams(window.location.search).get('id');
        if (!blogId) {
            container.innerHTML = `<div class="text-center text-error font-body-md">Missing blog id.</div>`;
            return;
        }

        const cacheKey = `blog:${blogId}`;
        const cached = readCache(cacheKey);
        const cachedBlog = cached && cached.data ? normalizeBlog(cached.data) : null;
        if (cachedBlog && cachedBlog.id) {
            renderBlogDetail(container, cachedBlog);
        }

        try {
            assertApiConfigured();
            const result = await fetchJsonWithTimeout(`${blogsEndpoint}/${encodeURIComponent(blogId)}`);
            const blog = normalizeBlog(result.blog || getItems(result).find(item => String(item.id) === String(blogId)) || {});

            if (!blog.id) {
                if (!cachedBlog) {
                    container.innerHTML = `<div class="text-center text-error font-body-md">Blog not found.</div>`;
                }
                return;
            }

            writeCache(cacheKey, blog);
            renderBlogDetail(container, blog);
        } catch (error) {
            if (!cachedBlog) {
                container.innerHTML = `<div class="text-center text-error font-body-md">Error loading blog article.</div>`;
            }
        }
    }

    // Initialize blog and project loading
    loadBlogs();
    loadBlogDetail();
    loadProjects();

    document.addEventListener('click', (event) => {
        const toggle = event.target.closest('[data-reply-toggle]');
        if (!toggle) return;
        const form = document.querySelector(`.comment-reply-form[data-parent-id="${CSS.escape(toggle.dataset.replyToggle)}"]`);
        if (form) form.classList.toggle('hidden');
    });

    document.addEventListener('submit', (event) => {
        const form = event.target.closest('#comment-form, .comment-reply-form');
        if (!form) return;
        event.preventDefault();
        submitCommentForm(form);
    });
});
