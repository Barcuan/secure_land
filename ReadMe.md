# ⚔️ Ultron Survivors  

> **Projet réalisé par :**  
> 👤 Sacha BONNEL · 👤 Maxime ADOLPHE · 👤 Killian HENRIET  

---

## 🌍 Contexte  

Après la prise de contrôle du monde par **Ultron 🤖**, l’humanité doit s’organiser pour survivre.  
Ce projet propose un **système complet** permettant de :  

- 🔎 Identifier et gérer les survivants  
- 🎫 Contrôler l’accès aux zones sécurisées via **QR codes**  
- 🛡️ Administrer les droits et accréditations de chaque personne  
- 🏗️ Assurer la sécurité et la reconstruction de la civilisation  

---

## 🚀 Fonctionnalités principales  

✔️ Ajout, modification et suppression de survivants  
✔️ Génération automatique de QR codes uniques  
✔️ Contrôle d’accès par scan de QR code  
✔️ Gestion des niveaux d’accréditation :  
   - PUBLIC
   - RESTREINT
   - CONFIDENTIEL  
   - SECRET  
   - ULTRA-SECRET  
✔️ Administration sécurisée réservée aux ULTRA-SECRET  
✔️ Statistiques, export CSV, sauvegarde des bases  
✔️ Interface moderne avec animations & easter eggs 🎉  

---

## 🏗️ Architecture du projet  

Ultron-Survivors/
├── Site/ → Frontend (HTML, CSS, JS)
├── Python/ → Backend Flask (API)
├── Bases/ → Bases de données SQLite
└── qrcodes/ → QR codes générés automatiquement

markdown
Copier le code

- **Frontend** : HTML, CSS, JavaScript  
- **Backend** : Python (Flask + Flask-CORS)  
- **Base de données** : SQLite  
- **QR codes** : Générés en PNG avec `qrcode[pil]`  

---

## ⚡ Installation & Lancement  

### 1️⃣ Installer les dépendances  

```bash
pip install flask flask-cors qrcode[pil]
```
2️⃣ Lancer le serveur
```bash
cd Python
python app.py
```
3️⃣ Ouvrir le site

Accéder à Site/index.html dans votre navigateur 🌐

---


👨‍💻 Auteurs

Nom	Rôle
Sacha BONNEL
Maxime ADOLPHE	
Killian HENRIET	

```
