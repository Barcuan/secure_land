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

// 1. Mode "Matrix" (Ctrl+Shift+R)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        activateMatrixMode();
    }
});

function activateMatrixMode() {
    showSystemMessage('🟩 MODE MATRIX ACTIVÉ', 'info', 20000);

    // Créer un overlay Matrix
    const matrixOverlay = document.createElement('canvas');
    matrixOverlay.className = 'matrix-overlay';
    matrixOverlay.style.position = 'fixed';
    matrixOverlay.style.top = 0;
    matrixOverlay.style.left = 0;
    matrixOverlay.style.width = '100vw';
    matrixOverlay.style.height = '100vh';
    matrixOverlay.style.pointerEvents = 'none';
    matrixOverlay.style.zIndex = 99999;
    matrixOverlay.width = window.innerWidth;
    matrixOverlay.height = window.innerHeight;
    document.body.appendChild(matrixOverlay);

    // Matrix rain effect
    const ctx = matrixOverlay.getContext('2d');
    const letters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const fontSize = 18;
    const columns = Math.floor(matrixOverlay.width / fontSize);
    const drops = Array(columns).fill(1);

    let animationFrame;
    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, matrixOverlay.width, matrixOverlay.height);
        ctx.font = fontSize + "px monospace";
        ctx.fillStyle = "#39ff14";
        for (let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > matrixOverlay.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
        animationFrame = requestAnimationFrame(drawMatrix);
    }
    drawMatrix();

    // Nettoyage après 4 secondes
    setTimeout(() => {
        cancelAnimationFrame(animationFrame);
        matrixOverlay.remove();
        showSystemMessage('🛡️ Retour à la réalité !', 'success');
    }, 20000);

    // Adapter la taille si la fenêtre change
    window.addEventListener('resize', () => {
        matrixOverlay.width = window.innerWidth;
        matrixOverlay.height = window.innerHeight;
    });
}

// 2. Mode "Ultron Domination" (Ctrl+Shift+D)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        activateDominationMode();
    }
});

function activateDominationMode() {
    showSystemMessage('🤖 ULTRON PREND LE CONTRÔLE...', 'error', 30000);

    // Effet visuel : tout devient rouge, tremblement fort, flashs et bruit
    document.body.style.transition = 'filter 0.2s, background 0.2s';
    document.body.style.filter = 'hue-rotate(-90deg) contrast(2.5) brightness(0.5) saturate(2)';
    document.body.style.background = '#8B0000';
    document.body.style.animation = 'ultron-shake 0.08s infinite alternate';

    // Ajout d'un style pour le shake et flash
    const style = document.createElement('style');
    style.className = 'ultron-style';
    style.textContent = `
        @keyframes ultron-shake {
            0% { transform: translate(0, 0) rotate(-1deg) scale(1.01);}
            25% { transform: translate(-8px, 4px) rotate(2deg) scale(1.03);}
            50% { transform: translate(8px, -8px) rotate(-2deg) scale(1.04);}
            75% { transform: translate(-4px, 8px) rotate(1deg) scale(1.02);}
            100% { transform: translate(0, 0) rotate(-1deg) scale(1.01);}
        }
        .ultron-flash {
            position: fixed;
            top:0; left:0; width:100vw; height:100vh;
            background: rgba(255,0,0,0.25);
            z-index: 100000;
            pointer-events: none;
            animation: ultron-flash-anim 0.15s linear;
        }
        @keyframes ultron-flash-anim {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Flashs rouges rapides
    let flashInterval = setInterval(() => {
        const flash = document.createElement('div');
        flash.className = 'ultron-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 150);
    }, 200);

    // Bruit robotique (optionnel, à commenter si non voulu)
    // let audio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b6e6c.mp3');
    // audio.volume = 0.2;
    // audio.play();

    setTimeout(() => {
        clearInterval(flashInterval);
        document.body.style.filter = '';
        document.body.style.background = '';
        document.body.style.animation = '';
        document.querySelectorAll('.ultron-style').forEach(s => s.remove());
        showSystemMessage('🛡️ Résistance restaurée !', 'success');
    }, 30000);
}
// 3. Mode "Fête" (Ctrl+Shift+F)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        activatePartyMode();
    }
});

function activatePartyMode() {
    showSystemMessage('🎉 MODE FÊTE ACTIVÉ !', 'success', 10000);

    const partyOverlay = document.createElement('div');
    partyOverlay.style.position = 'fixed';
    partyOverlay.style.top = 0;
    partyOverlay.style.left = 0;
    partyOverlay.style.width = '100vw';
    partyOverlay.style.height = '100vh';
    partyOverlay.style.pointerEvents = 'none';
    partyOverlay.style.zIndex = 99999;
    partyOverlay.style.background = 'transparent';
    partyOverlay.className = 'party-overlay';
    document.body.appendChild(partyOverlay);

    // Confettis
    let confettiInterval = setInterval(() => {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-20px';
        confetti.style.width = '12px';
        confetti.style.height = '12px';
        confetti.style.background = `hsl(${Math.random() * 360}, 80%, 60%)`;
        confetti.style.borderRadius = '50%';
        confetti.style.opacity = 0.8;
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.transition = 'top 2s linear';
        partyOverlay.appendChild(confetti);

        setTimeout(() => {
            confetti.style.top = '110vh';
        }, 10);

        setTimeout(() => confetti.remove(), 2200);
    }, 20);

    setTimeout(() => {
        clearInterval(confettiInterval);
        partyOverlay.remove();
        showSystemMessage('🎊 Fin de la fête !', 'info');
    }, 10000);
}

// 4. Mode "Invasion Zombie" (Ctrl+Shift+Z)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        activateZombieMode();
    }
});

function activateZombieMode() {
    showSystemMessage('🧟‍♂️ ALERTE: INVASION ZOMBIE DÉTECTÉE !', 'error', 15000);

    // Créer des zombies qui traversent l'écran
    const zombieOverlay = document.createElement('div');
    zombieOverlay.style.position = 'fixed';
    zombieOverlay.style.top = 0;
    zombieOverlay.style.left = 0;
    zombieOverlay.style.width = '100vw';
    zombieOverlay.style.height = '100vh';
    zombieOverlay.style.pointerEvents = 'none';
    zombieOverlay.style.zIndex = 99999;
    zombieOverlay.className = 'zombie-overlay';
    document.body.appendChild(zombieOverlay);

    // Effet vert zombie sur tout l'écran
    document.body.style.filter = 'hue-rotate(90deg) contrast(1.3) brightness(0.8)';
    document.body.style.animation = 'zombie-sway 2s ease-in-out infinite alternate';

    const zombieStyle = document.createElement('style');
    zombieStyle.className = 'zombie-style';
    zombieStyle.textContent = `
        @keyframes zombie-sway {
            0% { transform: rotate(-0.5deg); }
            100% { transform: rotate(0.5deg); }
        }
        .zombie {
            position: absolute;
            font-size: 3rem;
            animation: zombie-walk 8s linear infinite;
        }
        @keyframes zombie-walk {
            0% { left: -100px; }
            100% { left: calc(100vw + 100px); }
        }
    `;
    document.head.appendChild(zombieStyle);

    // Générer des zombies
    let zombieInterval = setInterval(() => {
        const zombie = document.createElement('div');
        zombie.className = 'zombie';
        zombie.textContent = '🧟‍♂️';
        zombie.style.top = Math.random() * 80 + 'vh';
        zombieOverlay.appendChild(zombie);
        setTimeout(() => zombie.remove(), 8000);
    }, 800);

    setTimeout(() => {
        clearInterval(zombieInterval);
        document.body.style.filter = '';
        document.body.style.animation = '';
        zombieOverlay.remove();
        document.querySelectorAll('.zombie-style').forEach(s => s.remove());
        showSystemMessage('🛡️ Zone sécurisée - Zombies éliminés !', 'success');
    }, 15000);
}

// 5. Mode "Disco Fever" (Ctrl+Shift+B)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        activateDiscoMode();
    }
});

function activateDiscoMode() {
    showSystemMessage('🕺 DISCO FEVER ACTIVÉ !', 'success', 20000);

    // Fond disco clignotant
    let colors = ['#ff0040', '#ff8000', '#ffff00', '#40ff00', '#0040ff', '#8000ff', '#ff0080'];
    let colorIndex = 0;

    document.body.style.animation = 'disco-spin 0.5s infinite';
    
    const discoStyle = document.createElement('style');
    discoStyle.className = 'disco-style';
    discoStyle.textContent = `
        @keyframes disco-spin {
            0% { filter: hue-rotate(0deg) saturate(2) brightness(1.2); }
            25% { filter: hue-rotate(90deg) saturate(2) brightness(1.5); }
            50% { filter: hue-rotate(180deg) saturate(2) brightness(1.2); }
            75% { filter: hue-rotate(270deg) saturate(2) brightness(1.5); }
            100% { filter: hue-rotate(360deg) saturate(2) brightness(1.2); }
        }
        .disco-ball {
            position: fixed;
            top: 20px;
            right: 20px;
            font-size: 4rem;
            animation: disco-ball-spin 1s linear infinite;
            z-index: 100000;
        }
        @keyframes disco-ball-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(discoStyle);

    // Ajouter une boule disco
    const discoBall = document.createElement('div');
    discoBall.className = 'disco-ball';
    discoBall.textContent = '🕳️';
    document.body.appendChild(discoBall);

    // Changer la couleur de fond rapidement
    let discoInterval = setInterval(() => {
        document.body.style.background = `linear-gradient(45deg, ${colors[colorIndex]}, ${colors[(colorIndex + 1) % colors.length]})`;
        colorIndex = (colorIndex + 1) % colors.length;
    }, 200);

    setTimeout(() => {
        clearInterval(discoInterval);
        document.body.style.animation = '';
        document.body.style.background = '';
        document.body.style.filter = '';
        discoBall.remove();
        document.querySelectorAll('.disco-style').forEach(s => s.remove());
        showSystemMessage('🎉 Fin du disco !', 'info');
    }, 20000);
}

// 6. Mode "Hacker Terminal" (Ctrl+Shift+H)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        activateHackerMode();
    }
});

function activateHackerMode() {
    showSystemMessage('💻 MODE HACKER ACTIVÉ - ACCÈS SYSTÈME', 'warning', 25000);

    const terminal = document.createElement('div');
    terminal.style.position = 'fixed';
    terminal.style.top = '50px';
    terminal.style.left = '50px';
    terminal.style.right = '50px';
    terminal.style.bottom = '50px';
    terminal.style.background = 'rgba(0, 0, 0, 0.95)';
    terminal.style.color = '#00ff00';
    terminal.style.fontFamily = 'monospace';
    terminal.style.fontSize = '14px';
    terminal.style.padding = '20px';
    terminal.style.zIndex = 100000;
    terminal.style.border = '2px solid #00ff00';
    terminal.style.borderRadius = '10px';
    terminal.style.overflow = 'auto';
    terminal.className = 'hacker-terminal';
    document.body.appendChild(terminal);

    const hackerCommands = [
        '> Initialisation du système...',
        '> Connexion au mainframe ULTRON...',
        '> [OK] Accès autorisé',
        '> Scan des vulnérabilités...',
        '> [TROUVÉ] Faille dans le sous-système Alpha',
        '> Exploitation en cours...',
        '> [SUCCESS] Backdoor installée',
        '> Téléchargement des données classifiées...',
        '> Progress: ████████████████ 100%',
        '> [ALERTE] Détection par les systèmes de sécurité!',
        '> Activation du mode furtif...',
        '> [OK] Trace effacée',
        '> Mission terminée avec succès',
        '> Déconnexion sécurisée...',
        '> Au revoir, Agent'
    ];

    let commandIndex = 0;
    let hackerInterval = setInterval(() => {
        if (commandIndex < hackerCommands.length) {
            const line = document.createElement('div');
            line.textContent = hackerCommands[commandIndex];
            line.style.marginBottom = '5px';
            line.style.animation = 'type-writer 0.5s';
            terminal.appendChild(line);
            terminal.scrollTop = terminal.scrollHeight;
            commandIndex++;
        }
    }, 800);

    const hackerStyle = document.createElement('style');
    hackerStyle.className = 'hacker-style';
    hackerStyle.textContent = `
        @keyframes type-writer {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
        }
    `;
    document.head.appendChild(hackerStyle);

    setTimeout(() => {
        clearInterval(hackerInterval);
        terminal.remove();
        document.querySelectorAll('.hacker-style').forEach(s => s.remove());
        showSystemMessage('🔒 Accès terminal fermé', 'info');
    }, 25000);
}

// Info des raccourcis disponibles (Ctrl+Shift+I)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        showEasterEggInfo();
    }
});

// 8. Mode "TERREUR - OEIL QUI SURVEILLE" (Ctrl+Shift+S)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        activateEyeMode();
    }
});

function activateEyeMode() {
    showSystemMessage('👁️ ULTRON VOUS OBSERVE... VOUS NE POUVEZ PAS VOUS CACHER', 'error', 20000);

    // Créer un œil qui suit la souris
    const eye = document.createElement('div');
    eye.style.position = 'fixed';
    eye.style.top = '50%';
    eye.style.left = '50%';
    eye.style.transform = 'translate(-50%, -50%)';
    eye.style.fontSize = '20rem';
    eye.style.zIndex = 100000;
    eye.style.pointerEvents = 'none';
    eye.style.textShadow = '0 0 50px red';
    eye.style.filter = 'drop-shadow(0 0 30px rgba(255,0,0,0.8))';
    eye.textContent = '👁️';
    eye.className = 'watching-eye';
    document.body.appendChild(eye);

    // Effet rouge sanglant
    document.body.style.background = 'radial-gradient(circle, rgba(139,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)';
    document.body.style.filter = 'contrast(1.5) brightness(0.7)';

    // L'œil suit la souris
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    function followMouse(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;
        
        eye.style.transform = `translate(-50%, -50%) translate(${deltaX * 0.1}px, ${deltaY * 0.1}px) scale(${1 + Math.sin(Date.now() * 0.005) * 0.1})`;
    }

    document.addEventListener('mousemove', followMouse);

    // Clignements d'œil terrifiants
    let blinkInterval = setInterval(() => {
        eye.textContent = '😑';
        setTimeout(() => {
            eye.textContent = '👁️';
        }, 150);
    }, Math.random() * 3000 + 2000);

    setTimeout(() => {
        clearInterval(blinkInterval);
        document.removeEventListener('mousemove', followMouse);
        document.body.style.background = '';
        document.body.style.filter = '';
        eye.remove();
        showSystemMessage('👁️ L\'œil s\'est fermé... pour le moment...', 'warning');
    }, 20000);
}

// 9. Mode "GLITCH TOTAL DU SYSTÈME" (Ctrl+Shift+G)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        activateSystemGlitch();
    }
});

function activateSystemGlitch() {
    showSystemMessage('⚠️ ERREUR SYSTÈME CRITIQUE - CORRUPTION EN COURS', 'error', 25000);

    // Sauvegarder l'état original
    const originalHTML = document.body.innerHTML;
    
    // Corrompre progressivement le texte de la page
    const allTextNodes = [];
    function getTextNodes(node) {
        if (node.nodeType === 3 && node.textContent.trim()) {
            allTextNodes.push(node);
        } else {
            for (let child of node.childNodes) {
                getTextNodes(child);
            }
        }
    }
    getTextNodes(document.body);

    const glitchChars = ['█', '▓', '▒', '░', '╣', '║', '╗', '╝', '╚', '╔', '╩', '╦', '╠', '═', '╬', '♠', '♣', '♥', '♦', '•', '◘', '○', '◙', '♂', '♀', '♪', '♫', '☼', '►', '◄', '↕', '‼', '¶', '§', '▬', '↨', '↑', '↓', '→', '←'];

    let glitchInterval = setInterval(() => {
        // Corrompre du texte aléatoirement
        if (allTextNodes.length > 0) {
            const randomNode = allTextNodes[Math.floor(Math.random() * allTextNodes.length)];
            const originalText = randomNode.originalText || randomNode.textContent;
            if (!randomNode.originalText) {
                randomNode.originalText = originalText;
            }
            
            let corruptedText = '';
            for (let i = 0; i < originalText.length; i++) {
                if (Math.random() < 0.3) {
                    corruptedText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                } else {
                    corruptedText += originalText[i];
                }
            }
            randomNode.textContent = corruptedText;
        }
    }, 200);

    // Effet visuel de glitch
    document.body.style.animation = 'system-glitch 0.1s infinite';
    document.body.style.filter = 'contrast(2) brightness(1.5) hue-rotate(90deg)';

    const glitchStyle = document.createElement('style');
    glitchStyle.className = 'system-glitch-style';
    glitchStyle.textContent = `
        @keyframes system-glitch {
            0% { 
                transform: translate(0, 0);
                filter: contrast(2) brightness(1.5) hue-rotate(0deg);
            }
            20% { 
                transform: translate(-5px, 2px);
                filter: contrast(3) brightness(0.8) hue-rotate(90deg);
            }
            40% { 
                transform: translate(-1px, -3px);
                filter: contrast(1) brightness(2) hue-rotate(180deg);
            }
            60% { 
                transform: translate(3px, 0px);
                filter: contrast(4) brightness(0.5) hue-rotate(270deg);
            }
            80% { 
                transform: translate(1px, -1px);
                filter: contrast(2) brightness(1.8) hue-rotate(45deg);
            }
            100% { 
                transform: translate(0, 0);
                filter: contrast(2) brightness(1.5) hue-rotate(360deg);
            }
        }
    `;
    document.head.appendChild(glitchStyle);

    // Restaurer après 25 secondes
    setTimeout(() => {
        clearInterval(glitchInterval);
        document.body.style.animation = '';
        document.body.style.filter = '';
        
        // Restaurer le texte original
        allTextNodes.forEach(node => {
            if (node.originalText) {
                node.textContent = node.originalText;
            }
        });
        
        document.querySelectorAll('.system-glitch-style').forEach(s => s.remove());
        showSystemMessage('🔧 Système restauré avec succès', 'success');
    }, 25000);
}

function showEasterEggInfo() {
    const info = `
🎮 EASTER EGGS DISPONIBLES:
• Ctrl+Shift+R : Mode Matrix
• Ctrl+Shift+D : Ultron Domination  
• Ctrl+Shift+F : Mode Fête
• Ctrl+Shift+Z : Invasion Zombie
• Ctrl+Shift+B : Disco Fever
• Ctrl+Shift+H : Hacker Terminal
• Ctrl+Shift+S : Oeil qui Surveille 👁️
• Ctrl+Shift+G : Glitch du Système
    `;
    
    showSystemMessage(info, 'info', 8000);
}

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