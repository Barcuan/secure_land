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
    switchAuthMethod('qr'); // Démarrer sur QR par défaut
    
    // Vérifier si déjà connecté
    checkExistingAuth();
    
    // Effet d'entrée retardé
    setTimeout(() => {
        document.querySelector('.container').style.transform = 'translateY(0) scale(1)';
    }, 100);
});

// Créer les particules ultra-secrètes
function initializeParticles() {
    const particlesContainer = document.querySelector('.particles');
    
    for (let i = 0; i < 20; i++) {
        createUltraSecretParticle(particlesContainer);
    }
    
    // Créer de nouvelles particules périodiquement
    setInterval(() => {
        createUltraSecretParticle(particlesContainer);
    }, 3000);
}

function createUltraSecretParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'ultra-particle';
    
    // Position et propriétés aléatoires avec couleurs ultra-secrètes
    particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 6 + 2}px;
        height: ${Math.random() * 6 + 2}px;
        background: ${Math.random() > 0.5 ? '#9c27b0' : '#e91e63'};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: ultraParticleFloat ${Math.random() * 15 + 8}s linear infinite;
        pointer-events: none;
        box-shadow: 0 0 10px currentColor;
    `;
    
    container.appendChild(particle);
    
    // Nettoyer après animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, (Math.random() * 15 + 8) * 1000);
}

// Styles pour particules ultra-secrètes
const ultraParticleStyles = document.createElement('style');
ultraParticleStyles.textContent = `
    @keyframes ultraParticleFloat {
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
document.head.appendChild(ultraParticleStyles);

// Configuration des événements
function setupEventListeners() {
    // Validation avec Entrée sur le token
    document.getElementById('admin_token').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            authenticateWithToken();
        }
    });

    // Nettoyage au changement de page
    window.addEventListener('beforeunload', function() {
        if (scanning) {
            stopScanner();
        }
    });
}

// Vérifier si l'utilisateur est déjà authentifié
function checkExistingAuth() {
    const adminSession = sessionStorage.getItem('ultron_admin_session');
    if (adminSession) {
        try {
            const session = JSON.parse(adminSession);
            if (session.niveau === 'ultra-secret' && Date.now() < session.expires) {
                // Rediriger directement vers l'admin
                showSuccess('Session active détectée', session.user);
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 2000);
                return;
            }
        } catch (e) {
            // Session corrompue, la supprimer
            sessionStorage.removeItem('ultron_admin_session');
        }
    }
}

// Changer de méthode d'authentification
function switchAuthMethod(method) {
    // Arrêter le scanner si actif
    if (scanning) {
        stopScanner();
    }

    // Mise à jour de l'interface des onglets
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.auth-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (method === 'qr') {
        document.querySelector('[onclick="switchAuthMethod(\'qr\')"]').classList.add('active');
        document.getElementById('qr-auth').classList.add('active');
        
    } else if (method === 'token') {
        document.querySelector('[onclick="switchAuthMethod(\'token\')"]').classList.add('active');
        document.getElementById('token-auth').classList.add('active');
        
        // Focus sur l'input après un délai
        setTimeout(() => {
            document.getElementById('admin_token').focus();
        }, 300);
    }
    
    // Masquer le résultat précédent
    document.getElementById('auth-result').style.display = 'none';
}

// Démarrer le scanner QR
async function startScanner() {
    try {
        updateStatus('Initialisation de la caméra...', 'scanning');
        
        const constraints = {
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        
        // Masquer le placeholder et afficher la vidéo
        const placeholder = document.getElementById('camera-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        video.style.display = 'block';
        await video.play();
        
        scanning = true;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        
        updateStatus('Recherche de QR code ultra-secret...', 'scanning');
        
        // Démarrer la boucle de scan
        requestAnimationFrame(tick);
        
    } catch (error) {
        console.error('Erreur caméra:', error);
        let errorMessage = 'Erreur d\'accès à la caméra';
        
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Permission caméra refusée - Autorisez l\'accès pour scanner';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'Aucune caméra trouvée sur cet appareil';
        } else if (error.name === 'NotSupportedError') {
            errorMessage = 'Caméra non supportée par ce navigateur';
        }
        
        updateStatus(errorMessage, 'error');
        
        // Remettre le bouton en état normal
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
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
    video.style.display = 'none';
    
    // Afficher le placeholder
    const placeholder = document.getElementById('camera-placeholder');
    if (placeholder) {
        placeholder.style.display = 'flex';
    }
    
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
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });
        
        if (code) {
            updateStatus('QR Code détecté! Vérification des privilèges...', 'found');
            
            // Arrêter le scanner
            stopScanner();
            
            // Authentifier automatiquement
            authenticateWithQR(code.data);
            return;
        }
        
    } catch (error) {
        console.error('Erreur scan:', error);
    }
    
    if (scanning) {
        requestAnimationFrame(tick);
    }
}

// Authentification par QR
async function authenticateWithQR(token) {
    try {
        updateStatus('Validation des privilèges ultra-secrets...', 'found');
        
        const response = await fetch('http://localhost:5000/admin_auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({qr_token: token})
        });

        const data = await response.json();
        
        if (response.ok && data.authorized) {
            // Créer une session admin
            createAdminSession(data.user);
            showSuccess('Authentification réussie', data.user);
            
            // Rediriger vers l'admin après 2 secondes
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 2000);
            
        } else {
            showError(data.error || 'Privilèges insuffisants');
            updateStatus('❌ Accès refusé', 'error');
        }
    } catch (error) {
        console.error('Erreur authentification:', error);
        showError('Erreur de connexion au serveur');
        updateStatus('❌ Erreur connexion', 'error');
    }
}

// Authentification par token manuel
async function authenticateWithToken() {
    const tokenInput = document.getElementById('admin_token');
    const token = tokenInput.value.trim();
    const btnText = document.getElementById('token-btn-text');
    const spinner = document.getElementById('token-spinner');
    const btn = document.querySelector('.auth-btn');
    
    if (!token) {
        showError("Veuillez entrer votre token d'accès");
        tokenInput.focus();
        return;
    }

    // État de chargement
    btn.disabled = true;
    spinner.style.display = 'inline-block';
    btnText.textContent = 'Vérification...';
    
    try {
        const response = await fetch('http://localhost:5000/admin_auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({qr_token: token})
        });

        const data = await response.json();
        
        if (response.ok && data.authorized) {
            // Créer une session admin
            createAdminSession(data.user);
            showSuccess('Authentification réussie', data.user);
            tokenInput.value = '';
            
            // Rediriger vers l'admin après 2 secondes
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 2000);
            
        } else {
            showError(data.error || 'Token invalide ou privilèges insuffisants');
        }
    } catch (error) {
        console.error('Erreur authentification:', error);
        showError('Erreur de connexion au serveur');
    } finally {
        // Réinitialiser le bouton
        btn.disabled = false;
        spinner.style.display = 'none';
        btnText.textContent = '🔓 S\'authentifier';
    }
}

// Créer une session admin sécurisée
function createAdminSession(user) {
    const session = {
        user: user,
        niveau: user.niveau,
        expires: Date.now() + (2 * 60 * 60 * 1000), // 2 heures maximum
        created: Date.now(),
        lastActivity: Date.now()
    };
    
    // Utiliser sessionStorage (se vide à la fermeture de l'onglet)
    sessionStorage.setItem('ultron_admin_session', JSON.stringify(session));
    
    console.log('✅ Session ultra-secrète créée:', {
        user: `${user.prenom} ${user.nom}`,
        niveau: user.niveau,
        expires: new Date(session.expires).toLocaleString()
    });
}

// Mise à jour du statut scanner
function updateStatus(message, type) {
    const statusDiv = document.getElementById('scanner-status');
    statusDiv.textContent = message;
    statusDiv.className = `status-display status-${type}`;
    statusDiv.style.display = 'block';
}

// Afficher le succès
function showSuccess(message, user) {
    const resultDiv = document.getElementById('auth-result');
    resultDiv.className = 'result-container success';
    resultDiv.innerHTML = `
        <h3>✅ ACCÈS AUTORISÉ</h3>
        <p><strong>${message}</strong></p>
        <div style="margin: 20px 0; padding: 20px; background: rgba(156, 39, 176, 0.1); border-radius: 12px; border: 1px solid rgba(156, 39, 176, 0.3);">
            <p><strong>Agent:</strong> ${user.prenom} ${user.nom}</p>
            <p><strong>Niveau:</strong> <span style="color: #e91e63; font-weight: 700; text-shadow: 0 0 10px rgba(233, 30, 99, 0.5);">${user.niveau.toUpperCase()}</span></p>
            <p><strong>Privilèges:</strong> Administration Complète</p>
        </div>
        <p>🚀 Redirection vers le panneau d'administration...</p>
        <a href="admin.html" class="admin-redirect-btn">
            🔐 Accéder à l'Administration
        </a>
    `;
    resultDiv.style.display = 'block';
}

// Afficher l'erreur
function showError(message) {
    const resultDiv = document.getElementById('auth-result');
    resultDiv.className = 'result-container error';
    resultDiv.innerHTML = `
        <h3>❌ ACCÈS REFUSÉ</h3>
        <p><strong>Authentification échouée</strong></p>
        <p>${message}</p>
        <div style="margin: 20px 0; padding: 20px; background: rgba(255, 71, 87, 0.1); border-radius: 12px; border: 1px solid rgba(255, 71, 87, 0.3);">
            <p><strong>⚠️ Seuls les agents avec accréditation ULTRA-SECRET peuvent accéder au panneau d'administration.</strong></p>
            <p>Si vous pensez qu'il s'agit d'une erreur, contactez votre superviseur.</p>
        </div>
        <p>🔒 L'accès à cette zone est strictement réservé au personnel autorisé.</p>
    `;
    resultDiv.style.display = 'block';
}

// Debug (mode développement)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔐 Mode authentification admin - Debug activé');
    
    window.loginDebug = {
        testUltraSecret: () => {
            // Simuler un utilisateur ultra-secret pour les tests
            const testUser = {
                id: 999,
                nom: 'Admin',
                prenom: 'Test',
                niveau: 'ultra-secret',
                acces_labo_DIP: true,
                acces_docs: true
            };
            createAdminSession(testUser);
            showSuccess('Test: Session ultra-secrète créée', testUser);
        },
        clearSession: () => {
            sessionStorage.removeItem('ultron_admin_session');
            console.log('Session admin supprimée');
        }
    };
}