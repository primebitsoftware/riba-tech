/* ==========================================================================
   RIBA TECH — MAIN LOGIC
   Features: Bilingual (AR/EN), Admin Panel, EmailJS Form, Canvas, Calculator
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* -----------------------------------------------------------------------
       SETTINGS & STORAGE
    ----------------------------------------------------------------------- */
    const SETTINGS_KEY = 'riba_admin_settings';
    const MESSAGES_KEY = 'riba_messages';

    /* Supabase — cloud database for contact messages.
       The publishable key is safe to expose: RLS only allows inserts. */
    const SUPABASE_URL = 'https://scqnljrwegyouqszwfiy.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_dyE5_6AL46G6VauBbzhZ1Q_R1rLp-MF';

    // رقم الواتساب بالصيغة الدولية بدون + (مثال: 962790000000)
    const DEFAULT_WHATSAPP = '962790058881';

    async function saveToSupabase(table, payload) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`Supabase HTTP ${res.status}`);
    }

    function getSettings() {
        try {
            return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
        } catch(e) { return {}; }
    }

    function saveSettings(data) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
    }

    function getMessages() {
        try {
            return JSON.parse(localStorage.getItem(MESSAGES_KEY)) || [];
        } catch(e) { return []; }
    }

    function saveMessage(msg) {
        const msgs = getMessages();
        msgs.unshift({ ...msg, time: new Date().toLocaleString() });
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs));
    }

    function clearMessages() {
        localStorage.setItem(MESSAGES_KEY, JSON.stringify([]));
    }

    // Load saved settings into admin fields
    const settings = getSettings();
    if (document.getElementById('set-service-id')) {
        document.getElementById('set-service-id').value = settings.serviceId || '';
        document.getElementById('set-template-id').value = settings.templateId || '';
        document.getElementById('set-public-key').value = settings.publicKey || '';
        document.getElementById('set-whatsapp').value = settings.whatsapp || '';
        document.getElementById('set-email').value = settings.email || '';
    }

    // Apply WhatsApp if set
    applyContactSettings(settings);

    function applyContactSettings(s) {
        const emailEl = document.getElementById('display-email');
        const waChannel = document.getElementById('whatsapp-channel');
        const waLink = document.getElementById('display-whatsapp');

        if (s.email && emailEl) {
            emailEl.href = `mailto:${s.email}`;
            emailEl.textContent = s.email;
        }

        const waRaw = s.whatsapp || DEFAULT_WHATSAPP;
        const waNumber = String(waRaw).replace(/\D/g, '');
        if (waNumber) {
            const waUrl = `https://wa.me/${waNumber}`;
            if (waChannel && waLink) {
                waChannel.style.display = 'flex';
                waLink.href = waUrl;
                waLink.textContent = waRaw;
            }
            const floatBtn = document.getElementById('whatsapp-float');
            if (floatBtn) {
                floatBtn.href = waUrl;
                floatBtn.style.display = 'flex';
            }
            const footerWa = document.getElementById('footer-whatsapp');
            if (footerWa) footerWa.href = waUrl;
        }
    }

    /* -----------------------------------------------------------------------
       BILINGUAL SYSTEM
    ----------------------------------------------------------------------- */
    let currentLang = localStorage.getItem('riba_lang') || 'en';

    function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('riba_lang', lang);
        const html = document.documentElement;
        html.setAttribute('lang', lang);
        html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        document.body.setAttribute('data-lang', lang);

        // Toggle font class for Arabic
        if (lang === 'ar') {
            document.body.classList.add('arabic-mode');
        } else {
            document.body.classList.remove('arabic-mode');
        }

        // Apply all data-en / data-ar attributes
        document.querySelectorAll('[data-en], [data-ar]').forEach(el => {
            const text = el.getAttribute(`data-${lang}`);
            if (text) {
                // Don't overwrite child elements — only pure text nodes
                if (el.children.length === 0) {
                    el.textContent = text;
                } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = text;
                }
            }
        });

        // Update nav links text
        document.querySelectorAll('.nav-link[data-en]').forEach(link => {
            link.textContent = link.getAttribute(`data-${lang}`);
        });

        // Update filter buttons
        document.querySelectorAll('.filter-btn[data-en]').forEach(btn => {
            btn.textContent = btn.getAttribute(`data-${lang}`);
            // Re-apply active class if needed
        });

        // Update lang toggle highlight
        const enLabel = document.getElementById('lang-en-label');
        const arLabel = document.getElementById('lang-ar-label');
        if (enLabel && arLabel) {
            enLabel.classList.toggle('active-lang', lang === 'en');
            arLabel.classList.toggle('active-lang', lang === 'ar');
        }

        // Update hero title with gradient span preserved
        const heroTitle = document.getElementById('hero-main-title');
        if (heroTitle) {
            if (lang === 'ar') {
                heroTitle.innerHTML = `<span>نبرمج ونبتكر</span><br><span class="text-gradient">الحلول البرمجية</span><span> والأنظمة الذكية</span>`;
            } else {
                heroTitle.innerHTML = `<span>Engineering Premium</span><br><span class="text-gradient">Custom Software &</span><span> Smart Apps</span>`;
            }
        }

        // Update hero subtitle
        const heroSub = document.getElementById('hero-subtitle');
        if (heroSub) {
            heroSub.textContent = lang === 'ar'
                ? 'نهندس ونبرمج ونطلق حلولاً برمجية متكاملة، تطبيقات ويب عالية الأداء وأنظمة آمنة مصممة خصيصاً لنمو أعمالك الرقمية.'
                : 'We design, engineer, and deploy premium software solutions, high-performance web applications, and secure systems tailored for digital growth.';
        }

        // Update form placeholders
        updateFormPlaceholders(lang);

        // Update calculator display text
        updateCalculatorText(lang);

        // Update admin panel labels
        updateAdminText(lang);
    }

    function updateFormPlaceholders(lang) {
        const placeholders = {
            en: { name: 'John Doe', email: 'john@example.com', phone: '+962 7X XXX XXXX', subject: 'e.g. E-Commerce Website', message: 'Tell us about your project goals, timeline, and budget...' },
            ar: { name: 'الاسم الكامل', email: 'example@email.com', phone: '+962 7X XXX XXXX', subject: 'مثال: موقع تجارة إلكترونية', message: 'أخبرنا عن أهداف مشروعك والمدة الزمنية والميزانية...' }
        };
        const p = placeholders[lang];
        const fn = document.getElementById('form-name');
        const fe = document.getElementById('form-email');
        const fp = document.getElementById('form-phone');
        const fs = document.getElementById('form-subject');
        const fm = document.getElementById('form-message');
        if (fn) fn.placeholder = p.name;
        if (fe) fe.placeholder = p.email;
        if (fp) fp.placeholder = p.phone;
        if (fs) fs.placeholder = p.subject;
        if (fm) fm.placeholder = p.message;
    }

    function updateCalculatorText(lang) {
        const pagesDisplay = document.getElementById('pages-count-display');
        if (pagesDisplay) {
            const slider = document.getElementById('pages-slider');
            if (slider) {
                const count = slider.value;
                pagesDisplay.textContent = lang === 'ar'
                    ? `${count} شاشة / صفحة`
                    : `${count} ${count == 1 ? 'Screen / Page' : 'Screens / Pages'}`;
            }
        }
    }

    function updateAdminText(lang) {
        document.querySelectorAll('.admin-panel [data-en], .admin-panel [data-ar]').forEach(el => {
            const text = el.getAttribute(`data-${lang}`);
            if (text && el.children.length === 0) {
                el.textContent = text;
            }
        });
    }

    // Language Toggle
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            applyLanguage(currentLang === 'en' ? 'ar' : 'en');
        });
    }

    // Force dark theme
    document.body.classList.add('dark-theme');

    // Apply on load
    applyLanguage(currentLang);


    /* -----------------------------------------------------------------------
       STICKY HEADER & SCROLL SPY
    ----------------------------------------------------------------------- */
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        let currentId = 'hero';
        sections.forEach(sec => {
            const top = sec.offsetTop - 100;
            if (window.scrollY >= top && window.scrollY < top + sec.clientHeight) {
                currentId = sec.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentId}`) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    /* -----------------------------------------------------------------------
       MOBILE MENU
    ----------------------------------------------------------------------- */
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
            const bars = mobileToggle.querySelectorAll('.bar');
            if (mobileToggle.classList.contains('active')) {
                bars[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                bars.forEach(b => b.style.transform = 'none');
                bars[1].style.opacity = '1';
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
                const bars = mobileToggle.querySelectorAll('.bar');
                bars.forEach(b => b.style.transform = 'none');
                bars[1].style.opacity = '1';
            });
        });
    }

    /* -----------------------------------------------------------------------
       CANVAS CIRCUITS
    ----------------------------------------------------------------------- */
    const canvas = document.getElementById('canvas-circuits');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;
        const nodes = [];
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const maxNodes = window.innerWidth < 480 ? 25 : window.innerWidth < 768 ? 40 : 85;
        const connectionDistance = 120;
        const mouse = { x: null, y: null, radius: 150 };

        window.addEventListener('resize', () => {
            if (canvas.offsetWidth > 0) {
                width = canvas.width = canvas.offsetWidth;
                height = canvas.height = canvas.offsetHeight;
            }
        });

        window.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

        class CircuitNode {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.45;
                this.vy = (Math.random() - 0.5) * 0.45;
                this.radius = Math.random() * 2.5 + 1.5;
                this.colorHue = Math.random() > 0.5 ? 268 : 201;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
                if (mouse.x !== null) {
                    const dx = mouse.x - this.x, dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        this.x += (dx/dist)*force*0.8; this.y += (dy/dist)*force*0.8;
                    }
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
                ctx.fillStyle = `hsla(${this.colorHue}, 85%, 65%, 0.75)`;
                ctx.shadowBlur = 4;
                ctx.shadowColor = `hsla(${this.colorHue}, 85%, 65%, 0.5)`;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        for (let i = 0; i < maxNodes; i++) nodes.push(new CircuitNode());

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            nodes.forEach(n => { n.update(); n.draw(); });
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i+1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < connectionDistance) {
                        const alpha = (1 - dist/connectionDistance) * 0.16;
                        const grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                        grad.addColorStop(0, `hsla(${nodes[i].colorHue}, 80%, 60%, ${alpha})`);
                        grad.addColorStop(1, `hsla(${nodes[j].colorHue}, 80%, 60%, ${alpha})`);
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.strokeStyle = grad;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        };
        if (prefersReducedMotion) {
            ctx.clearRect(0, 0, width, height);
            nodes.forEach(n => n.draw());
        } else {
            animate();
        }
    }

    /* -----------------------------------------------------------------------
       PROJECT COST CALCULATOR
    ----------------------------------------------------------------------- */
    const typeRadios = document.querySelectorAll('input[name="project-type"]');
    const pagesSlider = document.getElementById('pages-slider');
    const pagesDisplay = document.getElementById('pages-count-display');
    const checkboxes = document.querySelectorAll('.hidden-checkbox');
    const sumType = document.getElementById('sum-type');
    const sumScale = document.getElementById('sum-scale');
    const sumFeatures = document.getElementById('sum-features');
    const sumTimeline = document.getElementById('sum-timeline');
    const totalPriceDisplay = document.getElementById('total-price-display');
    const orderBtn = document.getElementById('btn-order-from-calc');

    typeRadios.forEach(radio => {
        radio.addEventListener('change', e => {
            document.querySelectorAll('.selector-card').forEach(c => c.classList.remove('active'));
            const card = document.getElementById(`label-type-${e.target.value}`);
            if (card) card.classList.add('active');
            calculateCost();
        });
    });

    checkboxes.forEach(box => {
        box.addEventListener('change', e => {
            const card = document.getElementById(`label-${e.target.id}`);
            if (card) card.classList.toggle('active', e.target.checked);
            calculateCost();
        });
    });

    if (pagesSlider) {
        pagesSlider.addEventListener('input', e => {
            const count = e.target.value;
            if (pagesDisplay) {
                pagesDisplay.textContent = currentLang === 'ar'
                    ? `${count} شاشة / صفحة`
                    : `${count} ${count == 1 ? 'Screen / Page' : 'Screens / Pages'}`;
            }
            calculateCost();
        });
    }

    function calculateCost() {
        if (!totalPriceDisplay) return;
        const selectedType = document.querySelector('input[name="project-type"]:checked')?.value || 'web';
        const pageCount = parseInt(pagesSlider?.value || 5);
        let baseCost = 0, perPageCost = 0, typeLabel = { en: 'Web Application', ar: 'تطبيق ويب' };
        let minWeeks = 2, maxWeeks = 3;

        switch (selectedType) {
            case 'web':
                baseCost = 800; perPageCost = 80;
                typeLabel = { en: 'Custom Web Application', ar: 'تطبيق ويب مخصص' }; break;
            case 'ecommerce':
                baseCost = 1200; perPageCost = 100;
                typeLabel = { en: 'E-Commerce System', ar: 'نظام تجارة إلكترونية' }; break;
            case 'mobile':
                baseCost = 1500; perPageCost = 120;
                typeLabel = { en: 'Mobile Application', ar: 'تطبيق جوال' }; break;
            case 'brokerage':
                baseCost = 2200; perPageCost = 150;
                typeLabel = { en: 'Custom Enterprise / FinTech Software', ar: 'برمجيات الشركات والتكنولوجيا المالية' }; break;
        }

        if (pageCount <= 5) { minWeeks = 2; maxWeeks = 3; }
        else if (pageCount <= 12) { minWeeks = 3; maxWeeks = 5; }
        else if (pageCount <= 22) { minWeeks = 5; maxWeeks = 7; }
        else { minWeeks = 7; maxWeeks = 10; }

        let featuresCost = 0, featuresCount = 0;
        const costs = { 'feat-db': 350, 'feat-auth': 200, 'feat-seo': 300, 'feat-multilang': 250 };
        Object.entries(costs).forEach(([id, cost]) => {
            const el = document.getElementById(id);
            if (el?.checked) { featuresCost += cost; featuresCount++; }
        });

        const total = baseCost + (pageCount * perPageCost) + featuresCost;
        if (sumType) sumType.textContent = typeLabel[currentLang] || typeLabel.en;
        if (sumScale) sumScale.textContent = currentLang === 'ar' ? `${pageCount} شاشة` : `${pageCount} Screens`;
        if (sumFeatures) sumFeatures.textContent = currentLang === 'ar' ? `${featuresCount} مختار` : `${featuresCount} Selected`;
        if (sumTimeline) sumTimeline.textContent = currentLang === 'ar'
            ? `~ ${minWeeks}-${maxWeeks} أسابيع`
            : `~ ${minWeeks}-${maxWeeks} Weeks`;
        totalPriceDisplay.textContent = `$${total.toLocaleString()}`;
    }

    calculateCost();

    if (orderBtn) {
        orderBtn.addEventListener('click', () => {
            const subject = document.getElementById('form-subject');
            const message = document.getElementById('form-message');
            const projectType = sumType?.textContent || '';
            const projectScale = sumScale?.textContent || '';
            const timeline = sumTimeline?.textContent || '';
            const price = totalPriceDisplay?.textContent || '';

            // Save the estimate as a lead in Supabase (fire & forget)
            const featsSelected = Array.from(document.querySelectorAll('.hidden-checkbox:checked'))
                .map(c => c.id.replace('feat-', ''));
            saveToSupabase('project_leads', {
                project_type: document.querySelector('input[name="project-type"]:checked')?.value || 'web',
                pages: parseInt(pagesSlider?.value || 0),
                features: featsSelected.join(','),
                estimated_price: parseInt(price.replace(/\D/g, '')) || null,
                timeline: timeline,
                lang: currentLang
            }).catch(err => console.warn('Lead save error:', err));

            if (subject) subject.value = `[RIBA] ${projectType} Package`;
            if (message) {
                message.value = currentLang === 'ar'
                    ? `مرحباً فريق RIBA،\n\nقمت بحساب تقدير المشروع:\n• نوع المشروع: ${projectType}\n• التقدير: ${price}\n• الحجم: ${projectScale}\n• المدة: ${timeline}\n\nأرغب في ترتيب مكالمة لمناقشة التفاصيل.`
                    : `Hi RIBA Team,\n\nI configured an estimate:\n• Project Type: ${projectType}\n• Budget: ${price}\n• Scale: ${projectScale}\n• Timeline: ${timeline}\n\nI'd like to arrange a call to discuss.`;
            }

            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            if (subject) { subject.style.borderColor = 'var(--clr-accent-glow)'; setTimeout(() => subject.style.borderColor = '', 1500); }
            if (message) { message.style.borderColor = 'var(--clr-accent-glow)'; setTimeout(() => message.style.borderColor = '', 1500); }
        });
    }

    /* -----------------------------------------------------------------------
       PORTFOLIO FILTERS
    ----------------------------------------------------------------------- */
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            document.querySelectorAll('.portfolio-item').forEach(item => {
                const match = filter === 'all' || item.getAttribute('data-category') === filter;
                item.classList.toggle('hidden', !match);
                if (match) { item.style.opacity = '0'; setTimeout(() => item.style.opacity = '1', 50); }
            });
        });
    });

    /* -----------------------------------------------------------------------
       CONTACT FORM WITH EMAILJS + LOCAL STORAGE SAVE
    ----------------------------------------------------------------------- */
    const contactForm = document.getElementById('riba-contact-form');
    const terminalOverlay = document.getElementById('terminal-confirmation-overlay');
    const terminalBody = document.getElementById('terminal-confirmation-body');
    const formStatusMsg = document.getElementById('form-status-msg');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const phone = document.getElementById('form-phone').value.trim();
            const subject = document.getElementById('form-subject').value.trim();
            const message = document.getElementById('form-message').value.trim();
            const submitBtn = document.getElementById('btn-submit-contact');

            // Save locally first
            saveMessage({ name, email, phone, subject, message });

            // Save to the Supabase cloud database
            let cloudSaved = false;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
            try {
                await saveToSupabase('contact_messages', { name, email, phone, subject, message, lang: currentLang });
                cloudSaved = true;
            } catch (err) {
                console.warn('Supabase error:', err);
            }
            submitBtn.disabled = false;

            // Try EmailJS
            const s = getSettings();
            let emailSent = false;

            if (s.serviceId && s.templateId && s.publicKey) {
                try {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
                    emailjs.init(s.publicKey);
                    await emailjs.send(s.serviceId, s.templateId, {
                        from_name: name,
                        from_email: email,
                        phone: phone,
                        subject: subject,
                        message: message,
                        reply_to: email
                    });
                    emailSent = true;
                } catch (err) {
                    console.warn('EmailJS error:', err);
                }
                submitBtn.disabled = false;
            }

            // Show terminal
            contactForm.style.opacity = '0';
            setTimeout(() => {
                contactForm.classList.add('hidden');
                terminalOverlay.classList.remove('hidden');
                runTerminal(name, email, phone, subject, emailSent || cloudSaved);
            }, 300);
        });
    }

    function runTerminal(name, email, phone, subject, emailSent) {
        if (!terminalBody) return;
        terminalBody.innerHTML = '';

        const ar = currentLang === 'ar';
        const lines = [
            { text: "$ sh riba_transmit_inquiry.sh", type: "input", delay: 100 },
            { text: ar ? "[*] تهيئة بروتوكول الإرسال الآمن..." : "[*] Initializing RIBA Transmit Secure Protocol...", type: "system", delay: 500 },
            { text: ar ? "[*] إنشاء اتصال بالخوادم..." : "[*] Establishing server connection... OK", type: "system", delay: 400 },
            { text: ar ? "[*] استخراج بيانات العميل..." : "[*] Extracting client identity credentials...", type: "system", delay: 300 },
            { text: `  -> ${ar ? 'الاسم' : 'Name'}     : ${name}`, type: "data", delay: 150 },
            { text: `  -> Email    : ${email}`, type: "data", delay: 150 },
            { text: `  -> ${ar ? 'الهاتف' : 'Phone'}    : ${phone || 'N/A'}`, type: "data", delay: 150 },
            { text: `  -> ${ar ? 'الموضوع' : 'Subject'}  : ${subject}`, type: "data", delay: 150 },
            { text: ar ? "[*] تشفير البيانات AES-256..." : "[*] Performing AES-256 encryption...", type: "system", delay: 500 },
            { text: "    [========================================] 100%", type: "progress", delay: 200 },
            { text: emailSent
                ? (ar ? "[+] تم الإرسال بنجاح!" : "[+] Transmitted successfully! Exit code: 0")
                : (ar ? "[+] تم حفظ الرسالة محلياً." : "[+] Message saved locally. Configure EmailJS in admin panel."),
              type: "success", delay: 300 },
            { text: "----------------------------------------", type: "divider", delay: 100 },
            { text: ar ? "✓ تم استلام رسالتك بنجاح! سنتواصل معك خلال 12 ساعة." : "✓ Message received! We'll contact you within 12 hours.", type: "success-bold", delay: 200 },
            { text: ar ? "$ شكراً لاختيارك RIBA TECH." : "$ Thank you for choosing RIBA TECH.", type: "input", delay: 300 }
        ];

        let idx = 0;
        function next() {
            if (idx >= lines.length) return;
            const line = lines[idx];
            const el = document.createElement('div');
            el.className = 't-line';
            const colors = {
                input: '#60A5FA', system: '#94A3B8', data: '#C084FC',
                progress: '#34D399', success: '#10B981', 'success-bold': '#10B981',
                info: '#F8FAFC', divider: '#334155'
            };
            const bold = line.type === 'success-bold' ? 'font-weight:bold;font-size:1rem;' : '';
            el.innerHTML = `<span style="color:${colors[line.type]||'#fff'};${bold}">${line.type.includes('success') ? '<i class="fa-solid fa-circle-check"></i> ' : ''}${line.text}</span>`;
            terminalBody.appendChild(el);
            terminalBody.scrollTop = terminalBody.scrollHeight;
            idx++;
            setTimeout(next, line.delay);
        }
        setTimeout(next, 300);
    }

    /* -----------------------------------------------------------------------
       SCROLL ANIMATIONS — Intersection Observer
    ----------------------------------------------------------------------- */
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card, .portfolio-item, .feature-item, .channel-card, .process-card').forEach(el => {
        el.classList.add('animate-ready');
        observer.observe(el);
    });

});

