// Variables globales
let currentUsers = [];

// Variables pour la gestion de session
let sessionCheckInterval;
let inactivityTimer;
let lastActivity = Date.now();
const INACTIVITY_TIMEOUT = 3 * 60 * 1000; // 3 minutes en millisecondes
const SESSION_CHECK_INTERVAL = 10 * 1000; // Vérifier toutes les 10 secondes

// Vérification d'authentification au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'authentification AVANT d'initialiser
    if (!checkAdminAuth()) {
        return; // Arrêter l'initialisation si pas authentifié
    }
    
    // Initialiser le suivi d'activité
    initializeActivityTracking();
    
    // Continuer l'initialisation normale seulement si authentifié
    initializeParticles();
    setupEventListeners();
    initializeTabs();
    
    // Effet d'entrée retardé
    setTimeout(() => {
        document.querySelector('.container').style.transform = 'translateY(0) scale(1)';
    }, 100);
});

// Initialiser le suivi d'activité utilisateur
function initializeActivityTracking() {
    console.log('🕐 Initialisation du suivi d\'activité (3 min max)');
    
    // Événements qui comptent comme activité
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Fonction pour réinitialiser le timer d'inactivité
    function resetInactivityTimer() {
        lastActivity = Date.now();
        
        // Effacer le timer précédent
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }
        
        // Créer un nouveau timer
        inactivityTimer = setTimeout(() => {
            console.log('⏰ Déconnexion automatique - Inactivité détectée');
            forceLogout('Session expirée par inactivité (3 minutes)');
        }, INACTIVITY_TIMEOUT);
    }
    
    // Écouter les événements d'activité
    activityEvents.forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });
    
    // Démarrer le timer initial
    resetInactivityTimer();
    
    // Vérification périodique de la session
    sessionCheckInterval = setInterval(checkSessionValidity, SESSION_CHECK_INTERVAL);
}

// Fonction de vérification d'authentification améliorée
function checkAdminAuth() {
    const adminSession = sessionStorage.getItem('ultron_admin_session');
    
    if (!adminSession) {
        redirectToLogin('Authentification requise');
        return false;
    }
    
    try {
        const session = JSON.parse(adminSession);
        
        // Vérifier l'expiration
        if (Date.now() >= session.expires) {
            sessionStorage.removeItem('ultron_admin_session');
            redirectToLogin('Session expirée');
            return false;
        }
        
        // Vérifier le niveau d'accréditation
        if (session.niveau !== 'ultra-secret') {
            sessionStorage.removeItem('ultron_admin_session');
            redirectToLogin('Privilèges insuffisants');
            return false;
        }
        
        // Afficher info utilisateur connecté
        displayCurrentUser(session.user);
        return true;
        
    } catch (e) {
        // Session corrompue
        sessionStorage.removeItem('ultron_admin_session');
        redirectToLogin('Session invalide');
        return false;
    }
}

// Vérification périodique de la validité de la session
function checkSessionValidity() {
    const adminSession = sessionStorage.getItem('ultron_admin_session');
    
    if (!adminSession) {
        forceLogout('Session supprimée');
        return;
    }
    
    try {
        const session = JSON.parse(adminSession);
        
        // Vérifier l'expiration
        if (Date.now() >= session.expires) {
            forceLogout('Session expirée');
            return;
        }
        
        // Mettre à jour l'affichage du temps restant
        updateSessionDisplay(session);
        
    } catch (e) {
        forceLogout('Session corrompue');
    }
}

// Mettre à jour l'affichage du temps de session
function updateSessionDisplay(session) {
    const timeLeft = session.expires - Date.now();
    const minutesLeft = Math.floor(timeLeft / (1000 * 60));
    
    // Chercher l'élément d'info utilisateur
    const userInfo = document.querySelector('.current-user-info');
    if (userInfo) {
        let timeDisplay = userInfo.querySelector('.session-time');
        
        if (!timeDisplay) {
            timeDisplay = document.createElement('span');
            timeDisplay.className = 'session-time';
            timeDisplay.style.cssText = `
                margin-left: 15px;
                color: #ffa502;
                font-size: 0.9rem;
                font-weight: 600;
            `;
            userInfo.querySelector('div').appendChild(timeDisplay);
        }
        
        // Changer la couleur selon le temps restant
        if (minutesLeft <= 5) {
            timeDisplay.style.color = '#ff4757';
            timeDisplay.style.animation = 'sessionWarning 1s infinite alternate';
        } else if (minutesLeft <= 10) {
            timeDisplay.style.color = '#ffa502';
        } else {
            timeDisplay.style.color = '#2ed573';
        }
        
        timeDisplay.textContent = `⏱️ ${minutesLeft}min`;
    }
}

// Redirection vers la page de connexion améliorée
function redirectToLogin(message) {
    console.log(`🔒 Accès admin refusé: ${message}`);
    
    // Nettoyer les timers
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
    }
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    // Afficher message d'erreur avec animation de redirection
    document.body.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            font-family: 'Rajdhani', sans-serif;
            text-align: center;
            padding: 20px;
        ">
            <div style="
                background: rgba(255, 71, 87, 0.1);
                border: 2px solid #ff4757;
                border-radius: 20px;
                padding: 40px;
                max-width: 500px;
                backdrop-filter: blur(20px);
                animation: sessionExpiredPulse 2s infinite;
            ">
                <h1 style="font-size: 2rem; margin-bottom: 20px; color: #ff4757;">🔒 SESSION TERMINÉE</h1>
                <p style="font-size: 1.2rem; margin-bottom: 20px;">${message}</p>
                <p style="margin-bottom: 30px; color: #a0a3bd;">
                    Redirection automatique vers la page de connexion...
                </p>
                <div style="
                    width: 100%;
                    height: 4px;
                    background: rgba(255, 71, 87, 0.2);
                    border-radius: 2px;
                    overflow: hidden;
                    margin-bottom: 20px;
                ">
                    <div style="
                        width: 0%;
                        height: 100%;
                        background: linear-gradient(90deg, #ff4757, #ffa502);
                        border-radius: 2px;
                        animation: redirectProgress 3s linear forwards;
                    "></div>
                </div>
                <a href="login.html" style="
                    display: inline-block;
                    padding: 15px 30px;
                    background: linear-gradient(135deg, #9c27b0, #e91e63);
                    color: white;
                    text-decoration: none;
                    border-radius: 50px;
                    font-weight: 700;
                    transition: transform 0.3s ease;
                " onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                    🔐 Se reconnecter
                </a>
            </div>
        </div>
        
        <style>
            @keyframes sessionExpiredPulse {
                0%, 100% { 
                    box-shadow: 0 0 20px rgba(255, 71, 87, 0.3);
                    transform: scale(1);
                }
                50% { 
                    box-shadow: 0 0 40px rgba(255, 71, 87, 0.6);
                    transform: scale(1.02);
                }
            }
            
            @keyframes redirectProgress {
                0% { width: 0%; }
                100% { width: 100%; }
            }
            
            @keyframes sessionWarning {
                0% { opacity: 1; }
                100% { opacity: 0.5; }
            }
        </style>
    `;
    
    // Redirection automatique après 3 secondes
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 3000);
}

// Déconnexion forcée (inactivité ou session expirée)
function forceLogout(reason) {
    console.log(`🚪 Déconnexion forcée: ${reason}`);
    
    // Nettoyer la session
    sessionStorage.removeItem('ultron_admin_session');
    
    // Nettoyer les timers
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
    }
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    // Rediriger avec le message
    redirectToLogin(reason);
}

// Afficher l'utilisateur connecté (version améliorée)
function displayCurrentUser(user) {
    // Ajouter info utilisateur dans le header
    const adminContent = document.querySelector('.admin-content');
    if (adminContent && !document.querySelector('.current-user-info')) {
        const userInfo = document.createElement('div');
        userInfo.className = 'current-user-info';
        userInfo.innerHTML = `
            <div style="
                margin-top: 15px;
                padding: 15px 25px;
                background: rgba(156, 39, 176, 0.1);
                border: 1px solid rgba(156, 39, 176, 0.3);
                border-radius: 25px;
                display: inline-flex;
                align-items: center;
                gap: 15px;
                flex-wrap: wrap;
            ">
                <span style="color: #e91e63; font-weight: 700;">👤 ${user.prenom} ${user.nom}</span>
                <span style="color: #9c27b0; font-weight: 600;">🔐 ${user.niveau.toUpperCase()}</span>
                <button onclick="logoutAdmin()" style="
                    background: rgba(255, 71, 87, 0.2);
                    border: 1px solid #ff4757;
                    border-radius: 15px;
                    color: #ff4757;
                    padding: 8px 15px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                " title="Se déconnecter" onmouseover="this.style.background='rgba(255, 71, 87, 0.3)'" onmouseout="this.style.background='rgba(255, 71, 87, 0.2)'">
                    🚪 Déconnexion
                </button>
            </div>
        `;
        adminContent.appendChild(userInfo);
    }
}

// Fonction de déconnexion manuelle améliorée
function logoutAdmin() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        console.log('🚪 Déconnexion manuelle demandée');
        
        // Nettoyer la session
        sessionStorage.removeItem('ultron_admin_session');
        
        // Nettoyer les timers
        if (sessionCheckInterval) {
            clearInterval(sessionCheckInterval);
        }
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }
        
        // Message de confirmation avec redirection
        showSuccessMessage('Déconnexion réussie - Redirection...');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}

// Fonction pour gérer la fermeture/rechargement de l'onglet
window.addEventListener('beforeunload', function(e) {
    // Nettoyer les timers
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
    }
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    // Note: sessionStorage se vide automatiquement à la fermeture de l'onglet
    // Pas besoin de le faire manuellement
});

// Gérer la visibilité de la page (onglet inactif)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('📵 Onglet masqué - Pause des vérifications');
        // Optionnel: on peut pausern les vérifications quand l'onglet n'est pas visible
    } else {
        console.log('👁️ Onglet visible - Reprise des vérifications');
        // Vérifier immédiatement la session au retour
        if (!checkAdminAuth()) {
            return;
        }
    }
});

// Redirection vers la page de connexion
function redirectToLogin(message) {
    console.log(`🔒 Accès admin refusé: ${message}`);
    
    // Afficher message d'erreur temporaire
    document.body.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            font-family: 'Rajdhani', sans-serif;
            text-align: center;
            padding: 20px;
        ">
            <div style="
                background: rgba(255, 71, 87, 0.1);
                border: 2px solid #ff4757;
                border-radius: 20px;
                padding: 40px;
                max-width: 500px;
                backdrop-filter: blur(20px);
            ">
                <h1 style="font-size: 2rem; margin-bottom: 20px; color: #ff4757;">🔒 ACCÈS REFUSÉ</h1>
                <p style="font-size: 1.2rem; margin-bottom: 30px;">${message}</p>
                <p style="margin-bottom: 30px; color: #a0a3bd;">
                    Seuls les agents avec accréditation <strong style="color: #e91e63;">ULTRA-SECRET</strong> 
                    peuvent accéder au panneau d'administration.
                </p>
                <a href="login.html" style="
                    display: inline-block;
                    padding: 15px 30px;
                    background: linear-gradient(135deg, #9c27b0, #e91e63);
                    color: white;
                    text-decoration: none;
                    border-radius: 50px;
                    font-weight: 700;
                    transition: transform 0.3s ease;
                " onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                    🔐 S'authentifier
                </a>
            </div>
        </div>
    `;
    
    // Redirection automatique après 3 secondes
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 3000);
}

// Afficher l'utilisateur connecté
function displayCurrentUser(user) {
    // Ajouter info utilisateur dans le header
    const adminContent = document.querySelector('.admin-content');
    if (adminContent && !document.querySelector('.current-user-info')) {
        const userInfo = document.createElement('div');
        userInfo.className = 'current-user-info';
        userInfo.innerHTML = `
            <div style="
                margin-top: 15px;
                padding: 10px 20px;
                background: rgba(156, 39, 176, 0.1);
                border: 1px solid rgba(156, 39, 176, 0.3);
                border-radius: 25px;
                display: inline-block;
            ">
                <span style="color: #e91e63; font-weight: 700;">👤 ${user.prenom} ${user.nom}</span>
                <span style="margin-left: 15px; color: #9c27b0; font-weight: 600;">🔐 ${user.niveau.toUpperCase()}</span>
                <button onclick="logoutAdmin()" style="
                    margin-left: 15px;
                    background: rgba(255, 71, 87, 0.2);
                    border: 1px solid #ff4757;
                    border-radius: 15px;
                    color: #ff4757;
                    padding: 5px 12px;
                    cursor: pointer;
                    font-size: 0.9rem;
                " title="Se déconnecter">🚪 Déconnexion</button>
            </div>
        `;
        adminContent.appendChild(userInfo);
    }
}

// Fonction de déconnexion
function logoutAdmin() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        sessionStorage.removeItem('ultron_admin_session');
        showSuccessMessage('Déconnexion réussie');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Vérification périodique de la session
setInterval(() => {
    const adminSession = sessionStorage.getItem('ultron_admin_session');
    if (adminSession) {
        try {
            const session = JSON.parse(adminSession);
            if (Date.now() >= session.expires) {
                logoutAdmin();
            }
        } catch (e) {
            logoutAdmin();
        }
    }
}, 60000); // Vérifier toutes les minutes

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
    particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 1}px;
        height: ${Math.random() * 4 + 1}px;
        background: rgba(255, 165, 2, ${Math.random() * 0.8 + 0.2});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: particleFloat ${Math.random() * 20 + 10}s linear infinite;
        pointer-events: none;
    `;
    
    container.appendChild(particle);
    
    // Nettoyer après animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
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

// Configuration des événements
function setupEventListeners() {
    // Soumission du formulaire
    document.getElementById('addUserForm').addEventListener('submit', handleFormSubmit);
    
    // Recherche en temps réel
    document.getElementById('searchInput').addEventListener('input', filterUsers);
    
    // Effets au survol des boutons
    document.querySelectorAll('.submit-btn, .reset-btn, .refresh-btn').forEach(btn => {
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

// Initialiser les onglets
function initializeTabs() {
    switchTab('add');
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            this.style.transform = 'translateY(-2px) scale(0.98)';
            setTimeout(() => {
                this.style.transform = this.classList.contains('active') ? 'translateY(-2px)' : 'translateY(0)';
            }, 150);
        });
    });
}

// Changer d'onglet
function switchTab(tabName) {
    // Mise à jour de l'interface des onglets
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.remove('active');
    });
    
    if (tabName === 'add') {
        document.querySelector('[onclick="switchTab(\'add\')"]').classList.add('active');
        document.getElementById('add-section').classList.add('active');
        
    } else if (tabName === 'list') {
        document.querySelector('[onclick="switchTab(\'list\')"]').classList.add('active');
        document.getElementById('list-section').classList.add('active');
        
        // Charger la liste des utilisateurs
        loadUserList();
    }
}

// Gérer la soumission du formulaire
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        nom: formData.get('nom'),
        prenom: formData.get('prenom'),
        date_naissance: formData.get('date_naissance'),
        localisation: formData.get('localisation'),
        niveau: formData.get('niveau'),
        acces_labo_DIP: formData.get('acces_labo_DIP') ? 1 : 0,
        acces_docs: formData.get('acces_docs') ? 1 : 0
    };
    
    // État de chargement
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = document.getElementById('btn-text');
    const spinner = document.getElementById('spinner');
    
    submitBtn.disabled = true;
    spinner.style.display = 'inline-block';
    btnText.textContent = 'Génération QR en cours...';
    
    try {
        const response = await fetch('http://localhost:5000/add_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Afficher le message de succès
            showSuccessMessage('Survivant ajouté avec succès !');
            
            // Afficher automatiquement le QR code
            displayQRResult(result);
            
            // Réinitialiser le formulaire
            document.getElementById('addUserForm').reset();
            
            // Actualiser la liste si on est sur l'onglet liste
            if (document.getElementById('list-section').classList.contains('active')) {
                loadUserList();
            }
            
        } else {
            showErrorMessage(result.error || 'Erreur lors de l\'ajout');
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        showErrorMessage('Erreur de connexion au serveur');
    } finally {
        // Remettre le bouton en état normal
        submitBtn.disabled = false;
        spinner.style.display = 'none';
        btnText.textContent = '🔐 Ajouter au Réseau';
    }
}

// Nouvelle fonction pour afficher le résultat QR
function displayQRResult(result) {
    const qrSection = document.getElementById('qr-result');
    
    // Remplir les données utilisateur
    document.getElementById('qr-nom').textContent = result.user_data.nom;
    document.getElementById('qr-prenom').textContent = result.user_data.prenom;
    document.getElementById('qr-niveau').textContent = result.user_data.niveau.toUpperCase();
    document.getElementById('qr-token').textContent = result.qr_token;
    
    // Afficher le QR code
    if (result.qr_base64) {
        const canvas = document.getElementById('qr-canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            canvas.width = 200;
            canvas.height = 200;
            ctx.drawImage(img, 0, 0, 200, 200);
        };
        
        img.src = result.qr_base64;
    }
    
    // Stocker les données pour les actions
    window.currentQRData = result;
    
    // Afficher la section
    qrSection.style.display = 'block';
    qrSection.scrollIntoView({ behavior: 'smooth' });
}

// Fonction pour télécharger le QR code
function downloadQRCode() {
    if (!window.currentQRData) return;
    
    const canvas = document.getElementById('qr-canvas');
    const link = document.createElement('a');
    
    link.download = `QR_${window.currentQRData.user_data.nom}_${window.currentQRData.user_data.prenom}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    showSuccessMessage('QR Code téléchargé !');
}

// Fonction pour imprimer le QR code
function printQRCode() {
    if (!window.currentQRData) return;
    
    const printWindow = window.open('', '_blank');
    const canvas = document.getElementById('qr-canvas');
    const dataURL = canvas.toDataURL();
    
    printWindow.document.write(`
        <html>
        <head>
            <title>QR Code - ${window.currentQRData.user_data.prenom} ${window.currentQRData.user_data.nom}</title>
            <style>
                body { text-align: center; font-family: Arial, sans-serif; margin: 50px; }
                .qr-info { margin-bottom: 30px; }
                .qr-info h2 { color: #333; }
                .qr-info p { color: #666; margin: 5px 0; }
                img { border: 2px solid #333; padding: 20px; }
            </style>
        </head>
        <body>
            <div class="qr-info">
                <h2>ULTRON SURVIVORS - TOKEN QR</h2>
                <p><strong>Nom:</strong> ${window.currentQRData.user_data.nom}</p>
                <p><strong>Prénom:</strong> ${window.currentQRData.user_data.prenom}</p>
                <p><strong>Niveau:</strong> ${window.currentQRData.user_data.niveau.toUpperCase()}</p>
                <p><strong>Token:</strong> ${window.currentQRData.qr_token}</p>
            </div>
            <img src="${dataURL}" alt="QR Code">
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Fonction pour préparer l'ajout d'un nouveau survivant
function resetForNewUser() {
    const qrSection = document.getElementById('qr-result');
    qrSection.style.display = 'none';
    
    document.getElementById('addUserForm').reset();
    document.getElementById('nom').focus();
    
    window.currentQRData = null;
}

// Ajoutez aussi cette fonction pour régénérer tous les QR codes existants
async function regenerateAllQRCodes() {
    try {
        const response = await fetch('http://localhost:5000/regenerate_all_qr', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccessMessage(`${result.count} QR codes régénérés avec succès !`);
        } else {
            showErrorMessage(result.error || 'Erreur lors de la régénération');
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        showErrorMessage('Erreur de connexion au serveur');
    }
}

// Valider les données du formulaire
function validateFormData(data) {
    if (!data.nom.trim()) {
        showMessage('❌ Le nom est requis', 'error');
        return false;
    }
    
    if (!data.prenom.trim()) {
        showMessage('❌ Le prénom est requis', 'error');
        return false;
    }
    
    if (!data.date_naissance) {
        showMessage('❌ La date de naissance est requise', 'error');
        return false;
    }
    
    if (!data.localisation.trim()) {
        showMessage('❌ La localisation est requise', 'error');
        return false;
    }
    
    if (!data.niveau) {
        showMessage('❌ Le niveau d\'accréditation est requis', 'error');
        return false;
    }
    
    // Vérifier que l'âge est raisonnable
    const birthDate = new Date(data.date_naissance);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 0 || age > 120) {
        showMessage('❌ Date de naissance invalide', 'error');
        return false;
    }
    
    return true;
}

// Réinitialiser le formulaire
function resetForm() {
    document.getElementById('addUserForm').reset();
    showMessage('📝 Formulaire réinitialisé', 'info');
}

// Charger la liste des utilisateurs
async function loadUserList() {
    const userList = document.getElementById('userList');
    
    // Afficher le loading
    userList.innerHTML = `
        <div class="loading-message">
            <div class="loading-spinner"></div>
            <p>Chargement des survivants...</p>
        </div>
    `;
    
    try {
        const response = await fetch('http://localhost:5000/users');
        const data = await response.json();
        
        if (response.ok) {
            currentUsers = data.users || [];
            displayUsers(currentUsers);
        } else {
            userList.innerHTML = `
                <div class="loading-message">
                    <p style="color: var(--danger-color);">❌ Erreur de chargement: ${data.error}</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Erreur de chargement:', error);
        userList.innerHTML = `
            <div class="loading-message">
                <p style="color: var(--danger-color);">❌ Erreur de connexion au serveur</p>
            </div>
        `;
    }
}

// Remplacez la fonction displayUsers par :

function displayUsers(users) {
    const userList = document.getElementById('userList');
    
    if (users.length === 0) {
        userList.innerHTML = `
            <div class="loading-message">
                <p>📭 Aucun survivant trouvé</p>
            </div>
        `;
        return;
    }
    
    const usersHTML = users.map(user => {
        // Nettoyer le niveau pour la classe CSS
        const levelClass = user.niveau.toLowerCase().replace('-', '').replace('_', '');
        
        return `
            <div class="user-card">
                <div class="user-header">
                    <div class="user-name">${user.prenom} ${user.nom}</div>
                    <div class="user-level level-${levelClass}">${user.niveau.toUpperCase()}</div>
                </div>
                
                <div class="user-info">
                    <div class="info-item">
                        <div class="info-label">Date de naissance</div>
                        <div class="info-value">${formatDate(user.date_naissance)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Localisation</div>
                        <div class="info-value">${user.localisation}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Token QR</div>
                        <div class="info-value" style="font-family: monospace; font-size: 0.8rem; word-break: break-all;">${user.qr_token}</div>
                    </div>
                </div>
                
                <div class="user-permissions">
                    <div class="permission-badge ${user.acces_labo_DIP ? 'permission-yes' : 'permission-no'}">
                        ${user.acces_labo_DIP ? '✅' : '❌'} Laboratoire DIP
                    </div>
                    <div class="permission-badge ${user.acces_docs ? 'permission-yes' : 'permission-no'}">
                        ${user.acces_docs ? '✅' : '❌'} Documents Classifiés
                    </div>
                </div>
                
                <!-- Section QR Code -->
                <div class="user-qr-section">
                    <div class="user-qr-container">
                        <canvas class="user-qr-canvas" id="qr-${user.id}" width="120" height="120"></canvas>
                        <div class="qr-actions-mini">
                            <button class="qr-btn-mini" onclick="downloadUserQR(${user.id}, '${user.nom}', '${user.prenom}')">
                                💾 Télécharger
                            </button>
                            <button class="qr-btn-mini" onclick="printUserQR(${user.id}, '${user.nom}', '${user.prenom}', '${user.qr_token}')">
                                🖨️ Imprimer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    userList.innerHTML = usersHTML;
    
    // Générer les QR codes après l'affichage
    setTimeout(() => {
        users.forEach(user => {
            generateUserQRCode(user.qr_token, user.id);
        });
    }, 100);
}

// Nouvelle fonction pour générer un QR code pour un utilisateur spécifique
function generateUserQRCode(token, userId) {
    try {
        const canvas = document.getElementById(`qr-${userId}`);
        if (!canvas) {
            console.error(`Canvas qr-${userId} not found`);
            return;
        }
        
        // Utilisez une bibliothèque QR simple en JavaScript
        // Vous pouvez utiliser qrcode.js ou une alternative
        
        // Solution temporaire avec un placeholder
        const ctx = canvas.getContext('2d');
        
        // Créer une requête vers le serveur pour obtenir le QR en base64
        fetch('http://localhost:5000/generate_qr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: token })
        })
        .then(response => response.json())
        .then(data => {
            if (data.qr_base64) {
                const img = new Image();
                img.onload = function() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = data.qr_base64;
            }
        })
        .catch(error => {
            console.error('Erreur génération QR:', error);
            // Afficher un placeholder en cas d'erreur
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('QR Error', canvas.width/2, canvas.height/2);
        });
        
    } catch (error) {
        console.error('Erreur QR code:', error);
    }
}

// Fonctions pour télécharger et imprimer les QR codes individuels
function downloadUserQR(userId, nom, prenom) {
    const canvas = document.getElementById(`qr-${userId}`);
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `QR_${nom}_${prenom}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    showSuccessMessage(`QR Code de ${prenom} ${nom} téléchargé !`);
}

function printUserQR(userId, nom, prenom, token) {
    const canvas = document.getElementById(`qr-${userId}`);
    if (!canvas) return;
    
    const printWindow = window.open('', '_blank');
    const dataURL = canvas.toDataURL();
    
    printWindow.document.write(`
        <html>
        <head>
            <title>QR Code - ${prenom} ${nom}</title>
            <style>
                body { text-align: center; font-family: Arial, sans-serif; margin: 50px; }
                .qr-info { margin-bottom: 30px; }
                .qr-info h2 { color: #333; }
                .qr-info p { color: #666; margin: 5px 0; }
                img { border: 2px solid #333; padding: 20px; }
            </style>
        </head>
        <body>
            <div class="qr-info">
                <h2>ULTRON SURVIVORS - TOKEN QR</h2>
                <p><strong>Nom:</strong> ${nom}</p>
                <p><strong>Prénom:</strong> ${prenom}</p>
                <p><strong>Token:</strong> ${token}</p>
            </div>
            <img src="${dataURL}" alt="QR Code">
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Filtrer les utilisateurs
function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        displayUsers(currentUsers);
        return;
    }
    
    const filteredUsers = currentUsers.filter(user => 
        user.nom.toLowerCase().includes(searchTerm) ||
        user.prenom.toLowerCase().includes(searchTerm) ||
        user.localisation.toLowerCase().includes(searchTerm) ||
        user.niveau.toLowerCase().includes(searchTerm)
    );
    
    displayUsers(filteredUsers);
}

// Formater la date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Afficher un message
function showMessage(text, type = 'info', duration = 5000) {
    // Supprimer les anciens messages
    document.querySelectorAll('.message').forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    document.getElementById('message-container').appendChild(message);
    
    // Auto-suppression
    setTimeout(() => {
        if (message.parentNode) {
            message.style.animation = 'messageSlide 0.5s ease-out reverse';
            setTimeout(() => message.remove(), 500);
        }
    }, duration);
}

// Raccourcis clavier utiles
document.addEventListener('keydown', function(e) {
    // Ctrl + R pour actualiser la liste
    if (e.ctrlKey && e.key === 'r' && document.getElementById('list-section').classList.contains('active')) {
        e.preventDefault();
        loadUserList();
        showMessage('🔄 Liste actualisée', 'info');
    }
    
    // Ctrl + N pour nouveau utilisateur
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        switchTab('add');
        document.getElementById('nom').focus();
    }
    
    // Echap pour nettoyer les messages
    if (e.key === 'Escape') {
        document.querySelectorAll('.message').forEach(msg => msg.remove());
    }
});

// Debug info (mode développement)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 Mode Admin - Debug activé');
    
    window.adminDebug = {
        testAddUser: () => {
            document.getElementById('nom').value = 'Test';
            document.getElementById('prenom').value = 'User';
            document.getElementById('date_naissance').value = '1990-01-01';
            document.getElementById('localisation').value = 'Test City';
            document.getElementById('niveau').value = 'confidentiel';
            document.getElementById('acces_labo_DIP').checked = true;
            document.getElementById('acces_docs').checked = true;
            showMessage('🧪 Données de test remplies', 'info');
        },
        showUsers: () => currentUsers,
        showMessage: showMessage
    };
}