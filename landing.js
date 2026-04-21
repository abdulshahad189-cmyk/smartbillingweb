/**
 * Smart Billing Landing Page
 * Interactive functionality for forms, pricing toggle, mobile menu, etc.
 */

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeMobileMenu();
    initializePricingToggle();
    initializeFormValidation();
    updateActiveNavLink();
    window.addEventListener('scroll', updateActiveNavLink);
});

// ==================== MOBILE MENU ====================
function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger) return;
    
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// ==================== PRICING TOGGLE ====================
function initializePricingToggle() {
    const pricingToggle = document.getElementById('pricing-toggle');
    if (!pricingToggle) return;
    
    pricingToggle.addEventListener('change', () => {
        const isYearly = pricingToggle.checked;
        updatePricingDisplay(isYearly);
    });
}

function updatePricingDisplay(isYearly) {
    document.querySelectorAll('.amount').forEach(element => {
        const monthlyPrice = element.dataset.monthly;
        const yearlyPrice = element.dataset.yearly;
        
        if (monthlyPrice === 'Custom') {
            element.textContent = 'Custom';
        } else {
            element.textContent = isYearly ? yearlyPrice : monthlyPrice;
        }
    });
    
    // Update period text
    document.querySelectorAll('.period').forEach(element => {
        if (element.textContent !== '') {
            element.textContent = isYearly ? '/year' : '/month';
        }
    });
}

// ==================== FORM VALIDATION & SUBMISSION ====================
function initializeFormValidation() {
    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
    
    // Newsletter Form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterFormSubmit);
    }
}

function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        name: form.querySelector('input[placeholder="Your Name"]').value.trim(),
        email: form.querySelector('input[placeholder="Your Email"]').value.trim(),
        company: form.querySelector('input[placeholder="Company Name"]').value.trim(),
        message: form.querySelector('textarea[placeholder="Your Message"]').value.trim()
    };
    
    // Validate
    if (!formData.name || !formData.email || !formData.message) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (!isValidEmail(formData.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Simulate sending
    console.log('Form Data:', formData);
    
    // Show success message
    showNotification('Thank you! We will contact you soon.', 'success');
    
    // Reset form
    form.reset();
    
    // Here you would normally send data to backend
    // Example:
    // fetch('/api/contact', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData)
    // })
}

function handleNewsletterFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value.trim();
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    console.log('Newsletter signup:', email);
    
    showNotification('Thank you for subscribing!', 'success');
    form.reset();
    
    // Here you would normally send data to backend
    // Example:
    // fetch('/api/newsletter', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email })
    // })
}

// ==================== UTILITY FUNCTIONS ====================
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#6366F1'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
        font-weight: 500;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 100) {
            currentSection = section.id;
        }
    });
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentSection)) {
            link.style.color = '#6366F1';
            link.style.fontWeight = '700';
        } else {
            link.style.color = '#1F2937';
            link.style.fontWeight = '500';
        }
    });
}

// ==================== BUTTON CLICK HANDLERS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Get Demo Button
    const demoButtons = document.querySelectorAll('.btn-primary');
    demoButtons.forEach(btn => {
        if (btn.textContent.includes('Get Demo') || btn.textContent.includes('Try Demo')) {
            btn.addEventListener('click', handleGetDemo);
        }
    });
    
    // Download App Button
    const downloadButtons = document.querySelectorAll('.btn-secondary');
    downloadButtons.forEach(btn => {
        if (btn.textContent.includes('Download')) {
            btn.addEventListener('click', handleDownloadApp);
        }
    });
    
    // Get Started Buttons
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Get Started')) {
            btn.addEventListener('click', handleGetStarted);
        }
    });
    
    // Contact Sales
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Contact Sales')) {
            btn.addEventListener('click', handleContactSales);
        }
    });
});

function handleGetDemo() {
    showNotification('Demo access coming soon! Redirecting to POS system...', 'success');
    // setTimeout(() => {
    //     window.location.href = '/pos-demo';
    // }, 1500);
}

function handleDownloadApp() {
    showNotification('App download link coming soon!', 'info');
    // In production, this would redirect to app store
}

function handleGetStarted() {
    showNotification('Redirecting to signup page...', 'success');
    // In production:
    // window.location.href = '/signup';
}

function handleContactSales() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        // Focus on the form
        setTimeout(() => {
            const nameInput = document.querySelector('input[placeholder="Your Name"]');
            if (nameInput) nameInput.focus();
        }, 500);
    }
}

// ==================== SCROLL ANIMATIONS ====================
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe all cards and sections
    document.querySelectorAll('.feature-card, .benefit-item, .pricing-card, .testimonial-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

document.addEventListener('DOMContentLoaded', observeElements);

// ==================== SMOOTH SCROLL POLYFILL ====================
if (!window.CSS || !window.CSS.supports('scroll-behavior', 'smooth')) {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ==================== PERFORMANCE: LAZY LOAD IMAGES ====================
if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.src = entry.target.dataset.src;
                entry.target.removeAttribute('data-src');
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ==================== KEYBOARD NAVIGATION ====================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close mobile menu
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.classList.remove('active');
        }
    }
});

// ==================== ANIMATIONS IN CSS ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// ==================== STATS COUNTER ANIMATION ====================
function startCounterAnimation() {
    const stats = document.querySelectorAll('.stat h3');
    
    stats.forEach(stat => {
        const target = parseInt(stat.textContent.replace(/\D/g, ''));
        const originalText = stat.textContent;
        
        if (!isNaN(target)) {
            let current = 0;
            const increment = target / 50;
            const interval = setInterval(() => {
                current += increment;
                if (current >= target) {
                    stat.textContent = originalText;
                    clearInterval(interval);
                } else {
                    const unit = originalText.replace(/\d/g, '').trim();
                    stat.textContent = Math.floor(current) + '+' + (unit ? ' ' + unit : '');
                }
            }, 30);
        }
    });
}

// Trigger animation when About section is in view
const aboutSection = document.getElementById('about');
if (aboutSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounterAnimation();
                observer.unobserve(aboutSection);
            }
        });
    });
    observer.observe(aboutSection);
}

// ==================== CONSOLE MESSAGE ====================
console.log('%cSmart Billing', 'font-size: 24px; font-weight: bold; color: #6366F1;');
console.log('%cModern POS System for Retail Stores', 'font-size: 14px; color: #6366F1;');
console.log('Build version: 1.0.0');
