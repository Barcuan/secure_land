// Animation de la page au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter des effets d'entrée
    const container = document.querySelector('.container');
    const features = document.querySelectorAll('.feature');
    
    // Animation des features avec délai
    features.forEach((feature, index) => {
        feature.style.animationDelay = `${0.2 + index * 0.1}s`;
        feature.classList.add('fade-in');
    });
    
    // Créer des particules d'arrière-plan
    createParticles();
    
    // Initialiser les interactions
    initInteractions();
    
    // Ajouter l'effet de neon au titre principal après 2 secondes
    setTimeout(() => {
        const title = document.querySelector('.header h1');
        if (title) {
            title.classList.add('neon-glow');
        }
    }, 2000);
});

// Créer des particules flottantes
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 20; i++) {
        createParticle(particlesContainer);
    }
    
    // Recréer une particule toutes les 3 secondes
    setInterval(() => {
        createParticle(particlesContainer);
    }, 3000);
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Position aléatoire
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
    particle.style.animationDelay = Math.random() * 2 + 's';
    
    container.appendChild(particle);
    
    // Supprimer la particule après l'animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 8000);
}

// Initialiser les interactions
function initInteractions() {
    // Effet hover sur les boutons
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Effet de clic sur les features
    const features = document.querySelectorAll('.feature');
    features.forEach(feature => {
        feature.addEventListener('click', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            setTimeout(() => {
                this.style.transform = 'translateY(0) scale(1)';
            }, 200);
        });
    });
}

// Fonction pour afficher des messages
function showMessage(text, type = 'info', duration = 3000) {
    // Supprimer les anciens messages
    const oldMessages = document.querySelectorAll('.message');
    oldMessages.forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // Insérer avant le container principal
    const container = document.querySelector('.container');
    document.body.insertBefore(message, container);
    
    // Supprimer après le délai
    setTimeout(() => {
        if (message.parentNode) {
            message.style.animation = 'slideUp 0.5s ease-out reverse';
            setTimeout(() => {
                message.remove();
            }, 500);
        }
    }, duration);
}

// Simuler une connexion au système
function simulateSystemConnection() {
    showMessage('Connexion au système Ultron Survivors...', 'info');
    
    setTimeout(() => {
        showMessage('Connexion établie avec succès!', 'success');
    }, 2000);
}

// Effet de glitch sur le titre (pour l'ambiance)
function triggerGlitchEffect() {
    const title = document.querySelector('.header h1');
    if (title) {
        title.classList.add('glitch');
        setTimeout(() => {
            title.classList.remove('glitch');
        }, 2000);
    }
}

// Navigation fluide (si vous ajoutez des ancres)
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Gestion des boutons avec états de chargement
function handleButtonClick(buttonElement, action) {
    // Sauvegarder l'état original
    const originalContent = buttonElement.innerHTML;
    const originalDisabled = buttonElement.disabled;
    
    // Activer l'état de chargement
    buttonElement.disabled = true;
    buttonElement.innerHTML = '<div class="loading"></div>Chargement...';
    
    // Exécuter l'action
    action().then(() => {
        // Succès
        buttonElement.innerHTML = '✅ Terminé';
        setTimeout(() => {
            buttonElement.innerHTML = originalContent;
            buttonElement.disabled = originalDisabled;
        }, 2000);
    }).catch((error) => {
        // Erreur
        buttonElement.innerHTML = '❌ Erreur';
        showMessage('Une erreur est survenue: ' + error.message, 'error');
        setTimeout(() => {
            buttonElement.innerHTML = originalContent;
            buttonElement.disabled = originalDisabled;
        }, 2000);
    });
}

// Détection de la connexion réseau
function checkNetworkStatus() {
    if (!navigator.onLine) {
        showMessage('Connexion réseau perdue - Mode hors ligne activé', 'error', 5000);
    }
}

// Écouter les changements de connexion
window.addEventListener('online', () => {
    showMessage('Connexion réseau rétablie', 'success');
});

window.addEventListener('offline', () => {
    showMessage('Connexion réseau perdue', 'error');
});

// Raccourcis clavier
document.addEventListener('keydown', function(e) {
    // Ctrl + G pour effet glitch
    if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        triggerGlitchEffect();
    }
    
    // Echap pour nettoyer les messages
    if (e.key === 'Escape') {
        const messages = document.querySelectorAll('.message');
        messages.forEach(msg => msg.remove());
    }
});

// Surveillance de la performance
let performanceMetrics = {
    loadTime: performance.now(),
    interactions: 0
};

// Mise à jour des métriques
document.addEventListener('click', () => {
    performanceMetrics.interactions++;
});

// Fonction utilitaire pour déboguer
function debugInfo() {
    console.group('🚀 Ultron Survivors - Debug Info');
    console.log('⏱️  Temps de chargement:', Math.round(performanceMetrics.loadTime), 'ms');
    console.log('🖱️  Interactions utilisateur:', performanceMetrics.interactions);
    console.log('🌐 Statut réseau:', navigator.onLine ? 'En ligne' : 'Hors ligne');
    console.log('📱 Agent utilisateur:', navigator.userAgent);
    console.groupEnd();
}

// Initialisation automatique après 3 secondes
setTimeout(() => {
    simulateSystemConnection();
}, 3000);

// Afficher les informations de debug dans la console (mode développement)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(debugInfo, 1000);
}

// Export des fonctions utiles pour usage externe
window.UltronSurvivors = {
    showMessage,
    simulateSystemConnection,
    triggerGlitchEffect,
    smoothScroll,
    handleButtonClick,
    debugInfo
};