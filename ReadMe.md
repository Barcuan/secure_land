# Ultron Survivors

**Projet réalisé par Sacha BONNEL, Maxime ADOLPHE et Killian HENRIET**

---

## 🌍 Contexte

Suite à la prise de contrôle du monde par Ultron, ce projet propose un système complet pour :
- Gérer et identifier les survivants
- Contrôler l’accès aux zones sécurisées via QR code
- Administrer les droits et accréditations de chaque personne
- Assurer la sécurité et la reconstruction de la civilisation

---

## 🚀 Fonctionnalités principales

- **Ajout, modification, suppression de survivants**
- **Génération automatique de QR codes uniques**
- **Contrôle d’accès par scan de QR code**
- **Gestion des niveaux d’accréditation (PUBLIC, CONFIDENTIEL, SECRET, ULTRA-SECRET)**
- **Administration sécurisée réservée aux ULTRA-SECRET**
- **Statistiques, export CSV, sauvegarde des bases**
- **Interface moderne, animations, easter eggs**

---

## 🏗️ Architecture

- **Frontend** : HTML, CSS, JavaScript (`Site/`)
- **Backend** : Python Flask (`Python/`)
- **Bases de données** : SQLite (`Bases/`)
- **QR codes** : PNG générés automatiquement (`qrcodes/`)

---

## ⚡ Lancer le projet

1. Installer les dépendances Python :
    ```bash
    pip install flask flask-cors qrcode[pil]
    ```
2. Lancer le serveur :
    ```bash
    cd Python
    python app.py
    ```
3. Ouvrir `Site/index.html` dans un navigateur pour accéder au scanner.

---

## 👨‍💻 Auteurs

- Sacha BONNEL
- Maxime ADOLPHE
- Killian HENRIET

---
