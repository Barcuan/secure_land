// Variables globales
let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let scanning = false;
let stream = null;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initializeParticles();
    setupEventListeners();
    initializeTabs(); // Ajouter cette ligne
    
    // Effet d'entrée retardé
    setTimeout(() => {
        document.querySelector('.container').style.transform = 'translateY(0) scale(1)';
    }, 100);
});

// Créer les particules d'arrière-plan
function initializeParticles() {
    const particlesContainer = document.querySelector('.particles');
    
    for (let i = 0; i < 30; i++) {
        createParticle(particlesContainer);
    }
    
    // Créer de nouvelles particules périodiquement
    setInterval(() => {
        createParticle(particlesContainer);
    }, 2000);
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Position et propriétés aléatoires
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
    particle.style.animationDelay = Math.random() * 2 + 's';
    
    container.appendChild(particle);
    
    // Nettoyer après animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 8000);
}

// Configuration des événements
function setupEventListeners() {
    // Validation avec Entrée
    document.getElementById('qr_token').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            envoyerToken();
        }
    });

    // Nettoyage au changement de page
    window.addEventListener('beforeunload', function() {
        if (scanning) {
            stopScanner();
        }
    });

    // Effets au survol des boutons
    document.querySelectorAll('.scanner-btn, .validate-btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(0)';
            }
        });
    });
}

// Ajoutez cette fonction après setupEventListeners() :

function initializeTabs() {
    // S'assurer que l'onglet caméra est actif par défaut
    switchTab('camera');
    
    // Ajouter des écouteurs d'événements pour les onglets
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Effet visuel au clic
            this.style.transform = 'translateY(-2px) scale(0.98)';
            setTimeout(() => {
                this.style.transform = this.classList.contains('active') ? 'translateY(-2px)' : 'translateY(0)';
            }, 150);
        });
    });
}

// Changer d'onglet
function switchTab(tabName) {
    // Arrêter le scanner si actif
    if (scanning) {
        stopScanner();
    }

    // Mise à jour de l'interface des onglets
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mise à jour des sections de contenu
    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.remove('active');
    });
    
    if (tabName === 'camera') {
        document.querySelector('[onclick="switchTab(\'camera\')"]').classList.add('active');
        document.getElementById('camera-section').classList.add('active');
        
        // Masquer le résultat quand on change d'onglet
        document.getElementById('resultat').style.display = 'none';
        document.getElementById('resultat').className = 'result-container';
        
    } else if (tabName === 'manual') {
        document.querySelector('[onclick="switchTab(\'manual\')"]').classList.add('active');
        document.getElementById('manual-section').classList.add('active');
        
        // Masquer le résultat quand on change d'onglet
        document.getElementById('resultat').style.display = 'none';
        document.getElementById('resultat').className = 'result-container';
        
        // Focus sur l'input après un délai pour permettre l'animation
        setTimeout(() => {
            const tokenInput = document.getElementById('qr_token');
            if (tokenInput) {
                tokenInput.focus();
                tokenInput.value = ''; // Vider le champ au changement d'onglet
            }
        }, 300);
    }
}

// Démarrer le scanner
async function startScanner() {
    try {
        updateStatus('Initialisation de la caméra...', 'scanning');
        
        // Configuration caméra optimisée
        const constraints = {
            video: {
                facingMode: 'environment', // Caméra arrière
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        
        await video.play();
        
        scanning = true;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        
        updateStatus('Recherche de QR code en cours...', 'scanning');
        
        // Démarrer la boucle de scan
        requestAnimationFrame(tick);
        
    } catch (error) {
        console.error('Erreur caméra:', error);
        let errorMessage = 'Erreur d\'accès à la caméra';
        
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Permission caméra refusée';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'Aucune caméra trouvée';
        }
        
        updateStatus(errorMessage, 'error');
        showMessage(errorMessage, 'error');
    }
}

// Arrêter le scanner
function stopScanner() {
    scanning = false;
    
    if (stream) {
        stream.getTracks().forEach(track => {
            track.stop();
        });
        stream = null;
    }
    
    video.srcObject = null;
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('scanner-status').style.display = 'none';
}

// Boucle de détection QR
function tick() {
    if (!scanning || !video.videoWidth) {
        if (scanning) {
            requestAnimationFrame(tick);
        }
        return;
    }
    
    try {
        // Ajuster la taille du canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Dessiner l'image de la vidéo
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Obtenir les données d'image
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Détecter le QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });
        
        if (code) {
            updateStatus('QR Code détecté! Validation...', 'found');
            
            // Effet visuel de succès
            document.querySelector('.scan-frame').style.borderColor = '#4CAF50';
            
            // Arrêter le scanner
            stopScanner();
            
            // Valider automatiquement
            validateQRToken(code.data);
            return;
        }
        
    } catch (error) {
        console.error('Erreur scan:', error);
    }
    
    if (scanning) {
        requestAnimationFrame(tick);
    }
}

// Mise à jour du statut scanner
function updateStatus(message, type) {
    const statusDiv = document.getElementById('scanner-status');
    statusDiv.textContent = message;
    statusDiv.className = `scanner-status status-${type}`;
    statusDiv.style.display = 'block';
    
    // Animation d'apparition
    statusDiv.style.animation = 'none';
    setTimeout(() => {
        statusDiv.style.animation = 'statusPulse 0.5s ease-out';
    }, 10);
}

// Validation QR token (caméra)
async function validateQRToken(token) {
    try {
        showMessage('Validation du token en cours...', 'info');
        
        const response = await fetch('http://localhost:5000/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({qr_token: token})
        });

        const data = await response.json();
        
        if (response.ok && data.status === 'trouvé') {
            showSuccess(data.user);
            showMessage('Token validé avec succès!', 'success');
            updateStatus('✅ Validation réussie', 'found');
        } else {
            const errorMsg = data.error || data.status || 'Token non valide';
            showError(errorMsg);
            showMessage('Token invalide: ' + errorMsg, 'error');
            updateStatus('❌ Token invalide', 'error');
        }
    } catch (error) {
        console.error('Erreur validation:', error);
        showError('Erreur de connexion au serveur');
        showMessage('Erreur de connexion', 'error');
        updateStatus('❌ Erreur connexion', 'error');
    }
    
    // Réinitialiser la couleur du cadre
    setTimeout(() => {
        document.querySelector('.scan-frame').style.borderColor = '#667eea';
    }, 3000);
}

// Validation manuelle du token
async function envoyerToken() {
    const tokenInput = document.getElementById('qr_token');
    const token = tokenInput.value.trim();
    const btnText = document.getElementById('btn-text');
    const spinner = document.getElementById('spinner');
    const btn = document.querySelector('.validate-btn');
    const resultat = document.getElementById('resultat');
    
    if (!token) {
        showError("Veuillez entrer un token");
        showMessage("Token requis", 'error');
        tokenInput.focus();
        return;
    }

    // État de chargement
    btn.disabled = true;
    spinner.style.display = 'inline-block';
    btnText.textContent = 'Validation...';
    resultat.style.display = 'none';

    try {
        const response = await fetch('http://localhost:5000/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({qr_token: token})
        });

        const data = await response.json();
        
        if (response.ok && data.status === 'trouvé') {
            showSuccess(data.user);
            showMessage('Validation réussie!', 'success');
            tokenInput.value = '';
        } else {
            const errorMsg = data.error || data.status || 'Token non valide';
            showError(errorMsg);
            showMessage('Échec: ' + errorMsg, 'error');
        }
    } catch (error) {
        console.error('Erreur réseau:', error);
        showError('Erreur de connexion au serveur');
        showMessage('Problème de connexion', 'error');
    } finally {
        // Réinitialiser le bouton
        btn.disabled = false;
        spinner.style.display = 'none';
        btnText.textContent = 'Valider le token';
    }
}

// Afficher le succès
function showSuccess(user) {
    const resultat = document.getElementById('resultat');
    resultat.className = 'result-container success';
    resultat.innerHTML = `
        <h3>✅ ACCÈS AUTORISÉ</h3>
        <p><strong>Authentification réussie!</strong></p>
        <p>Bienvenue dans le système de résistance.</p>
        <div class="user-info">
            <div class="info-item">
                <span class="info-label">Agent:</span>
                <span class="info-value">${user.prenom} ${user.nom}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Niveau d'accès:</span>
                <span class="info-value">${user.niveau || 'Standard'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Laboratoire DIP:</span>
                <span class="access-badge ${user.acces_labo_DIP ? 'access-yes' : 'access-no'}">
                    ${user.acces_labo_DIP ? '✓ AUTORISÉ' : '✗ REFUSÉ'}
                </span>
            </div>
            <div class="info-item">
                <span class="info-label">Documents:</span>
                <span class="access-badge ${user.acces_docs ? 'access-yes' : 'access-no'}">
                    ${user.acces_docs ? '✓ AUTORISÉ' : '✗ REFUSÉ'}
                </span>
            </div>
        </div>
    `;
    resultat.style.display = 'block';
}

// Afficher l'erreur
function showError(message) {
    const resultat = document.getElementById('resultat');
    resultat.className = 'result-container error';
    resultat.innerHTML = `
        <h3>❌ ACCÈS REFUSÉ</h3>
        <p><strong>Authentification échouée</strong></p>
        <p>${message}</p>
        <p><strong>Veuillez vérifier votre token et réessayer.</strong></p>
        <p style="margin-top: 20px; font-size: 1rem; color: var(--muted-text);">
            Si le problème persiste, contactez l'administrateur système.
        </p>
    `;
    resultat.style.display = 'block';
}

// Afficher un message flash
function showMessage(text, type = 'info', duration = 4000) {
    // Supprimer les anciens messages
    document.querySelectorAll('.system-message').forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = `system-message ${type}`;
    message.textContent = text;
    
    document.body.appendChild(message);
    
    // Effet sonore visuel
    if (type === 'success') {
        message.style.animation = 'slideInRight 0.5s ease-out, successPulse 0.3s ease-out 0.2s';
    } else if (type === 'error') {
        message.style.animation = 'slideInRight 0.5s ease-out, errorShake 0.3s ease-out 0.2s';
    }
    
    // Auto-suppression avec animation de sortie
    setTimeout(() => {
        if (message.parentNode) {
            message.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => message.remove(), 500);
        }
    }, duration);
}

// Ajoutez ces nouvelles animations CSS :
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
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

@keyframes successPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

@keyframes errorShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}
`;
document.head.appendChild(additionalStyles);

// Utilitaires de debug (mode développement)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔍 Mode debug activé');
    
    // Raccourcis clavier pour les tests
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            // Test token
            document.getElementById('qr_token').value = 'test-token-123';
            showMessage('Token de test inséré', 'info');
        }
    });
    
    window.verifDebug = {
        testSuccess: () => showSuccess({
            id: 1,
            nom: 'Test',
            prenom: 'User',
            niveau: 'Admin',
            acces_labo_DIP: true,
            acces_docs: true
        }),
        testError: () => showError('Test d\'erreur'),
        showMessage: showMessage
    };
}