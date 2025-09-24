document.addEventListener('DOMContentLoaded', function() {
    // Initialiser toutes les animations
    initParticles();
    initScrollAnimations();
    initCounterAnimations();
    initNavbarEffects();
    initGlitchEffects();
    
    // Message de bienvenue après un délai
    setTimeout(() => {
        showSystemMessage('🚨 SYSTÈME ULTRON SURVIVORS ACTIVÉ', 'warning');
    }, 2000);
});

// Créer des particules flottantes
function initParticles() {
    const particlesContainer = document.querySelector('.particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 1}px;
        height: ${Math.random() * 4 + 1}px;
        background: rgba(102, 126, 234, ${Math.random() * 0.8 + 0.2});
        border-radius: 50%;
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        animation: particleFloat ${Math.random() * 20 + 10}s linear infinite;
        pointer-events: none;
    `;
    
    container.appendChild(particle);
    
    // Supprimer et recréer la particule après l'animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.remove();
            createParticle(container);
        }
    }, (Math.random() * 20 + 10) * 1000);
}

// Ajouter les styles d'animation pour les particules
const particleStyles = document.createElement('style');
particleStyles.textContent = `
    @keyframes particleFloat {
        0% {
            transform: translateY(100vh) translateX(0px) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) translateX(${Math.random() * 200 - 100}px) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(particleStyles);

// Animations au scroll
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('animate');
                }, delay);
            }
        });
    }, { threshold: 0.1 });

    // Observer les cartes de fonctionnalités
    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });

    // Observer les cartes de statistiques
    document.querySelectorAll('.stat-card').forEach(card => {
        observer.observe(card);
    });
}

// Animation des compteurs
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Effets de la navbar au scroll
function initNavbarEffects() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        if (scrollY > 100) {
            navbar.style.background = 'rgba(26, 26, 46, 0.98)';
            navbar.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(26, 26, 46, 0.95)';
            navbar.style.boxShadow = 'none';
        }

        // Cacher/montrer la navbar selon la direction du scroll
        if (scrollY > lastScrollY && scrollY > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollY = scrollY;
    });
}

// Effets de glitch aléatoires
function initGlitchEffects() {
    const title = document.querySelector('.hero-title');
    
    setInterval(() => {
        if (Math.random() < 0.1) { // 10% de chance
            title.style.animation = 'none';
            title.style.textShadow = `
                2px 0 #ff00ff,
                -2px 0 #00ffff,
                0 0 20px rgba(102, 126, 234, 0.8)
            `;
            
            setTimeout(() => {
                title.style.animation = 'titleGlow 4s ease-in-out infinite alternate';
                title.style.textShadow = '0 0 30px rgba(102, 126, 234, 0.5)';
            }, 200);
        }
    }, 3000);
}

// Navigation fluide
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Messages système
function showSystemMessage(text, type = 'info', duration = 4000) {
    const existingMessage = document.querySelector('.system-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const message = document.createElement('div');
    message.className = `system-message system-${type}`;
    message.innerHTML = `
        <div class="message-content">
            <span class="message-text">${text}</span>
            <button class="message-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Styles pour le message
    message.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        z-index: 9999;
        background: rgba(26, 26, 46, 0.95);
        border: 1px solid var(--glass-border);
        border-radius: 10px;
        padding: 15px 20px;
        backdrop-filter: blur(20px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.5s ease-out;
        max-width: 400px;
        font-weight: 600;
    `;

    if (type === 'warning') {
        message.style.borderColor = 'var(--warning-color)';
        message.style.color = 'var(--warning-color)';
    } else if (type === 'error') {
        message.style.borderColor = 'var(--danger-color)';
        message.style.color = 'var(--danger-color)';
    } else if (type === 'success') {
        message.style.borderColor = 'var(--success-color)';
        message.style.color = 'var(--success-color)';
    }

    document.body.appendChild(message);

    // Supprimer automatiquement après le délai
    setTimeout(() => {
        if (message.parentNode) {
            message.style.animation = 'slideOutRight 0.5s ease-in';
            setTimeout(() => message.remove(), 500);
        }
    }, duration);
}

// Ajouter les styles d'animation pour les messages
const messageStyles = document.createElement('style');
messageStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .message-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
    }
    
    .message-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        opacity: 0.7;
        transition: opacity 0.3s ease;
    }
    
    .message-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(messageStyles);

// Gestion des erreurs réseau
window.addEventListener('online', () => {
    showSystemMessage('🟢 CONNEXION RÉSEAU RÉTABLIE', 'success');
});

window.addEventListener('offline', () => {
    showSystemMessage('🔴 CONNEXION RÉSEAU PERDUE - MODE HORS LIGNE', 'error');
});

// Easter eggs avec raccourcis clavier
document.addEventListener('keydown', function(e) {
    // Konami Code: ↑↑↓↓←→←→BA
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    if (!window.konamiProgress) window.konamiProgress = 0;
    
    if (e.code === konamiCode[window.konamiProgress]) {
        window.konamiProgress++;
        if (window.konamiProgress === konamiCode.length) {
            activateUltronMode();
            window.konamiProgress = 0;
        }
    } else {
        window.konamiProgress = 0;
    }
    
    // Ctrl + Shift + U pour mode Ultron
    if (e.ctrlKey && e.shiftKey && e.key === 'U') {
        e.preventDefault();
        activateUltronMode();
    }
});

function activateUltronMode() {
    showSystemMessage('🤖 MODE ULTRON ACTIVÉ - RÉSISTANCE EST FUTILE', 'error', 5000);
    
    // Effet visuel temporaire
    document.body.style.filter = 'hue-rotate(180deg) invert(0.1)';
    document.body.style.animation = 'glitchEffect 0.5s ease-in-out 5';
    
    setTimeout(() => {
        document.body.style.filter = 'none';
        document.body.style.animation = 'none';
        showSystemMessage('🛡️ SYSTÈMES DE DÉFENSE RÉACTIVÉS', 'success');
    }, 3000);
}

// Styles pour l'effet glitch du mode Ultron
const glitchStyles = document.createElement('style');
glitchStyles.textContent = `
    @keyframes glitchEffect {
        0%, 100% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
    }
`;
document.head.appendChild(glitchStyles);

// Performance monitoring
const performanceMonitor = {
    startTime: performance.now(),
    interactions: 0,
    
    logInteraction() {
        this.interactions++;
    },
    
    getStats() {
        return {
            loadTime: Math.round(performance.now() - this.startTime),
            interactions: this.interactions,
            memoryUsage: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 'N/A'
        };
    }
};

// Logger les interactions
document.addEventListener('click', () => performanceMonitor.logInteraction());
document.addEventListener('scroll', () => performanceMonitor.logInteraction());

// Debug info en console (mode développement)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(() => {
        console.group('🚀 ULTRON SURVIVORS - Système Opérationnel');
        console.log('⚡ Statut:', 'ACTIF');
        console.log('🎯 Performance:', performanceMonitor.getStats());
        console.log('🌐 Connexion:', navigator.onLine ? 'SÉCURISÉE' : 'HORS LIGNE');
        console.log('📱 Plateforme:', navigator.platform);
        console.groupEnd();
    }, 1000);
}