/* ============================================
   SUPORTCLIENTI.AI — Landing Page Scripts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Navbar scroll effect ---
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    }, { passive: true });

    // --- Mobile nav toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // --- Scroll animations (Intersection Observer) ---
    const animatedElements = document.querySelectorAll(
        '.problem-card, .solution-card, .benefit-card, .step, .usecase-card, .trust-card, .testimonial-card, .section__header, .hero__content, .hero__visual, .case-study-cta, .cta-block, .contact__info, .contact-form'
    );

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in', 'visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach((el, index) => {
        el.classList.add('fade-in');
        // Stagger animations within the same section
        const parent = el.parentElement;
        const siblings = parent.querySelectorAll(':scope > .fade-in');
        const siblingIndex = Array.from(siblings).indexOf(el);
        if (siblingIndex > 0 && siblingIndex <= 3) {
            el.classList.add(`fade-in-delay-${siblingIndex}`);
        }
        observer.observe(el);
    });

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Form handling ---
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Visual feedback
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Se trimite...';
            submitBtn.disabled = true;

            // Simulate submission (replace with actual API call)
            setTimeout(() => {
                submitBtn.textContent = '✓ Cerere trimisă cu succes!';
                submitBtn.style.background = '#10b981';
                form.reset();

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            }, 1000);
        });
    }

    // --- Typing animation for chat mockup ---
    const chatBubbles = document.querySelectorAll('.chat-bubble');
    chatBubbles.forEach((bubble, index) => {
        bubble.style.opacity = '0';
        bubble.style.transform = 'translateY(10px)';
        setTimeout(() => {
            bubble.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            bubble.style.opacity = '1';
            bubble.style.transform = 'translateY(0)';
        }, 800 + (index * 600));
    });

    // --- Counter animation for stat cards ---
    const statValues = document.querySelectorAll('.stat-value');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent;
                const numMatch = text.match(/[\d.]+/);
                if (numMatch) {
                    const target = parseFloat(numMatch[0]);
                    const suffix = text.replace(numMatch[0], '');
                    const duration = 1500;
                    const start = performance.now();

                    const animate = (now) => {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = target * eased;

                        if (target % 1 === 0) {
                            el.textContent = Math.round(current) + suffix;
                        } else {
                            el.textContent = current.toFixed(1) + suffix;
                        }

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    };
                    requestAnimationFrame(animate);
                }
                statsObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statValues.forEach(stat => statsObserver.observe(stat));
});
