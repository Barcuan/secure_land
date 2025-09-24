// Variables globales
let currentUsers = [];

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initializeParticles();
    setupEventListeners();
    initializeTabs();
    
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
    
    // Validation côté client
    if (!validateFormData(userData)) {
        return;
    }
    
    // État de chargement
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = document.getElementById('btn-text');
    const spinner = document.getElementById('spinner');
    
    submitBtn.disabled = true;
    spinner.style.display = 'inline-block';
    btnText.textContent = 'Ajout en cours...';
    
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
            showMessage(`✅ Survivant ajouté avec succès! Token QR: ${result.qr_token}`, 'success');
            resetForm();
            
            // Si on est sur l'onglet liste, actualiser
            if (document.getElementById('list-section').classList.contains('active')) {
                loadUserList();
            }
        } else {
            showMessage(`❌ Erreur: ${result.error || 'Impossible d\'ajouter le survivant'}`, 'error');
        }
        
    } catch (error) {
        console.error('Erreur réseau:', error);
        showMessage('❌ Erreur de connexion au serveur', 'error');
    } finally {
        // Réinitialiser le bouton
        submitBtn.disabled = false;
        spinner.style.display = 'none';
        btnText.textContent = '🔐 Ajouter au Réseau';
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

// Afficher les utilisateurs
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
    
    const usersHTML = users.map(user => `
        <div class="user-card">
            <div class="user-header">
                <div class="user-name">${user.prenom} ${user.nom}</div>
                <div class="user-level level-${user.niveau.replace('-', '')}">${user.niveau}</div>
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
                    <div class="info-value" style="font-family: monospace; font-size: 0.9rem;">${user.qr_token}</div>
                </div>
            </div>
            
            <div class="user-permissions">
                <div class="permission-badge ${user.acces_labo_DIP ? 'permission-yes' : 'permission-no'}">
                    ${user.acces_labo_DIP ? '✅' : '❌'} Laboratoire DIP
                </div>
                <div class="permission-badge ${user.acces_docs ? 'permission-yes' : 'permission-no'}">
                    ${user.acces_docs ? '✅' : '❌'} Documents
                </div>
            </div>
        </div>
    `).join('');
    
    userList.innerHTML = usersHTML;
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