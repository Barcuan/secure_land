from flask import Flask, request, jsonify, send_file
import sqlite3
import uuid
import qrcode
import os
from flask_cors import CORS
from io import BytesIO
import base64

app = Flask(__name__)

# Configuration CORS plus permissive pour le développement
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5000", "file://"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
        "supports_credentials": True
    }
})

# Ajouter des headers CORS manuellement
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Configuration CORS :
# Permet aux pages web servies sur un port (ex : 5500 via Live Server) 
# de faire des requêtes HTTP vers notre API Flask qui tourne sur un autre port (ex : 5000).
# Sans cette configuration, le navigateur bloque ces requêtes pour des raisons de sécurité.
# C’est donc indispensable en développement local pour que le frontend puisse valider les QR codes via l’API.

# Créer le dossier qrcodes s'il n'existe pas
os.makedirs('qrcodes', exist_ok=True)

def generate_qr_code(token, user_id, nom, prenom):
    """Génère un QR code pour un utilisateur et le sauvegarde"""
    try:
        # Générer le QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(token)
        qr.make(fit=True)
        
        # Créer l'image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Sauvegarder le fichier
        filename = f'qrcodes/{user_id}_{nom}_{prenom}.png'
        img.save(filename)
        
        print(f"✅ QR code généré: {filename}")
        return filename
        
    except Exception as e:
        print(f"❌ Erreur génération QR code: {e}")
        return None

def generate_qr_code_base64(token):
    """Génère un QR code en base64 pour l'affichage web"""
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=8,
            border=4,
        )
        qr.add_data(token)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convertir en base64
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{img_base64}"
        
    except Exception as e:
        print(f"❌ Erreur génération QR base64: {e}")
        return None

def verifier_qr_token(qr_token):
    """
    Vérifie le token QR et récupère les informations de l'utilisateur avec ses accréditations.
    """
    try:
        # Étape 1: Chercher l'utilisateur dans la base population
        conn_pop = sqlite3.connect(r'C:\All\Taff\Git\secure_land\Bases\population.db') # A modifier quand installation sur serveur distant
        c_pop = conn_pop.cursor()
        c_pop.execute("SELECT id, nom, prenom, date_naissance, localisation FROM population WHERE qr_token=?", (qr_token,))
        user = c_pop.fetchone()
        conn_pop.close()
        
        if not user:
            return None

        user_id, nom, prenom, date_naissance, localisation = user

        # Chercher les accréditations dans la base accred
        conn_accred = sqlite3.connect(r'C:\All\Taff\Git\secure_land\Bases\accred.db') # A modifier quand installation sur serveur distant
        c_accred = conn_accred.cursor()
        c_accred.execute("SELECT niveau, acces_labo_DIP, acces_docs FROM accreditations WHERE population_id=?", (user_id,))
        accred = c_accred.fetchone()
        conn_accred.close()

        return {
            "id": user_id,
            "nom": nom,
            "prenom": prenom,
            "date_naissance": date_naissance,
            "localisation": localisation,
            "niveau": accred[0] if accred else "public",
            "acces_labo_DIP": bool(accred[1]) if accred else False,
            "acces_docs": bool(accred[2]) if accred else False
        }
    except Exception as e:
        print(f"Erreur verifier_qr_token: {e}")
        return None

@app.route('/scan', methods=['POST'])
def scan():
    try:
        data = request.get_json()
        qr_token = data.get('qr_token')
        
        if not qr_token:
            return jsonify({'error': 'qr_token manquant'}), 400
        
        user_info = verifier_qr_token(qr_token)
        if not user_info:
            return jsonify({'status': 'non trouvé', 'error': 'Token invalide'}), 404
        
        return jsonify({'status': 'trouvé', 'user': user_info})
    except Exception as e:
        print(f"Erreur scan: {e}")
        return jsonify({'error': 'Erreur serveur'}), 500

@app.route('/add_user', methods=['POST'])
def add_user():
    try:
        data = request.json
        print(f"📥 Données reçues: {data}")  # Debug
        
        # Validation des données
        required_fields = ['nom', 'prenom', 'date_naissance', 'localisation', 'niveau']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Le champ {field} est requis'}), 400
        
        # Générer un token QR unique
        qr_token = str(uuid.uuid4())
        print(f"🎫 Token généré: {qr_token}")  # Debug
        
        # Ajouter à la base population
        conn_pop = sqlite3.connect(r'C:\All\Taff\Git\secure_land\Bases\population.db')
        c_pop = conn_pop.cursor()
        
        c_pop.execute('''
            INSERT INTO population (nom, prenom, date_naissance, localisation, qr_token) 
            VALUES (?, ?, ?, ?, ?)
        ''', (data['nom'], data['prenom'], data['date_naissance'], 
              data['localisation'], qr_token))
        
        population_id = c_pop.lastrowid
        conn_pop.commit()
        conn_pop.close()
        print(f"👤 Utilisateur ajouté avec ID: {population_id}")  # Debug
        
        # Ajouter les accréditations
        conn_accred = sqlite3.connect(r'C:\All\Taff\Git\secure_land\Bases\accred.db')
        c_accred = conn_accred.cursor()
        
        c_accred.execute('''
            INSERT INTO accreditations (population_id, niveau, acces_labo_DIP, acces_docs) 
            VALUES (?, ?, ?, ?)
        ''', (population_id, data['niveau'], 
              data.get('acces_labo_DIP', 0), data.get('acces_docs', 0)))
        
        conn_accred.commit()
        conn_accred.close()
        print("🔐 Accréditations ajoutées")  # Debug
        
        # GÉNÉRATION AUTOMATIQUE DU QR CODE
        qr_filename = generate_qr_code(qr_token, population_id, data['nom'], data['prenom'])
        qr_base64 = generate_qr_code_base64(qr_token)
        
        return jsonify({
            'message': 'Utilisateur ajouté avec succès',
            'qr_token': qr_token,
            'user_id': population_id,
            'qr_filename': qr_filename,
            'qr_base64': qr_base64,
            'user_data': {
                'nom': data['nom'],
                'prenom': data['prenom'],
                'niveau': data['niveau'],
                'localisation': data['localisation'],
                'date_naissance': data['date_naissance']
            }
        })
        
    except Exception as e:
        print(f"❌ Erreur add_user: {e}")  # Debug
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/users', methods=['GET'])
def get_users():
    try:
        print("🔍 Récupération de la liste des utilisateurs...")  # Debug
        
        users = []
        
        # 1. D'abord, récupérer tous les utilisateurs de la base population
        conn_pop = sqlite3.connect(r'C:\All\Taff\Git\secure_land\Bases\population.db')
        c_pop = conn_pop.cursor()  # ✅ CORRECTION ICI
        
        c_pop.execute("SELECT id, nom, prenom, date_naissance, localisation, qr_token FROM population ORDER BY nom, prenom")
        population_data = c_pop.fetchall()
        conn_pop.close()
        
        print(f"📊 Trouvé {len(population_data)} utilisateurs dans population.db")  # Debug
        
        # 2. Ouvrir la connexion aux accréditations UNE SEULE FOIS
        conn_accred = sqlite3.connect(r'C:\All\Taff\Git\secure_land\Bases\accred.db')
        c_accred = conn_accred.cursor()
        
        # 3. Traiter chaque utilisateur
        for pop_row in population_data:
            try:
                user_id, nom, prenom, date_naissance, localisation, qr_token = pop_row
                
                # Chercher les accréditations pour cet utilisateur
                c_accred.execute(
                    "SELECT niveau, acces_labo_DIP, acces_docs FROM accreditations WHERE population_id=?", 
                    (user_id,)
                )
                accred_row = c_accred.fetchone()
                
                # Construire l'objet utilisateur avec ses accréditations
                user_obj = {
                    'id': user_id,
                    'nom': nom,
                    'prenom': prenom,
                    'date_naissance': date_naissance,
                    'localisation': localisation,
                    'qr_token': qr_token,
                    'niveau': accred_row[0] if accred_row else 'public',
                    'acces_labo_DIP': bool(accred_row[1]) if accred_row and accred_row[1] is not None else False,
                    'acces_docs': bool(accred_row[2]) if accred_row and accred_row[2] is not None else False
                }
                
                users.append(user_obj)
                print(f"👤 Utilisateur traité: {prenom} {nom} - Niveau: {user_obj['niveau']}")  # Debug
                
            except Exception as user_error:
                print(f"❌ Erreur pour utilisateur {user_id}: {user_error}")
                continue
        
        # 4. Fermer la connexion accréditations
        conn_accred.close()
        
        print(f"✅ Total utilisateurs retournés: {len(users)}")  # Debug
        return jsonify({'users': users})
        
    except Exception as e:
        print(f"❌ Erreur get_users: {e}")  # Debug
        import traceback
        traceback.print_exc()  # Afficher la stack trace complète
        
        # S'assurer de fermer les connexions en cas d'erreur
        try:
            if 'conn_pop' in locals():
                conn_pop.close()
        except:
            pass
            
        try:
            if 'conn_accred' in locals():
                conn_accred.close()
        except:
            pass
            
        return jsonify({'error': str(e)}), 500

# Nouvelle route pour télécharger les QR codes
@app.route('/qr/<filename>')
def get_qr_file(filename):
    try:
        qr_path = os.path.join('qrcodes', filename)
        if os.path.exists(qr_path):
            return send_file(qr_path, as_attachment=True)
        else:
            return jsonify({'error': 'Fichier QR non trouvé'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route pour régénérer tous les QR codes existants
@app.route('/regenerate_all_qr', methods=['POST'])
def regenerate_all_qr():
    try:
        print("🔄 Régénération de tous les QR codes...")
        
        conn_pop = sqlite3.connect(r'C:\All\Taff\Git\secure_land\Bases\population.db')
        c_pop = conn_pop.cursor()
        
        c_pop.execute("SELECT id, nom, prenom, qr_token FROM population")
        users = c_pop.fetchall()
        conn_pop.close()
        
        generated_count = 0
        for user_id, nom, prenom, token in users:
            filename = generate_qr_code(token, user_id, nom, prenom)
            if filename:
                generated_count += 1
        
        return jsonify({
            'message': f'{generated_count} QR codes régénérés avec succès',
            'count': generated_count
        })
        
    except Exception as e:
        print(f"❌ Erreur régénération QR: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/generate_qr', methods=['POST'])
def generate_qr():
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token manquant'}), 400
        
        qr_base64 = generate_qr_code_base64(token)
        if qr_base64:
            return jsonify({'qr_base64': qr_base64})
        else:
            return jsonify({'error': 'Erreur génération QR'}), 500
            
    except Exception as e:
        print(f"Erreur generate_qr: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/admin_auth', methods=['POST'])
def admin_auth():
    """Route d'authentification pour l'accès administrateur"""
    try:
        data = request.get_json()
        qr_token = data.get('qr_token')
        
        if not qr_token:
            return jsonify({'error': 'Token manquant', 'authorized': False}), 400
        
        # Vérifier le token avec la fonction existante
        user_info = verifier_qr_token(qr_token)
        if not user_info:
            return jsonify({'error': 'Token invalide', 'authorized': False}), 404
        
        # Vérifier que l'utilisateur a le niveau ultra-secret
        if user_info['niveau'].lower() != 'ultra-secret':
            print(f"🚨 Tentative d'accès admin refusée - Utilisateur: {user_info['prenom']} {user_info['nom']}, Niveau: {user_info['niveau']}")
            return jsonify({
                'error': f'Privilèges insuffisants. Niveau requis: ULTRA-SECRET, Niveau actuel: {user_info["niveau"].upper()}',
                'authorized': False,
                'user_level': user_info['niveau']
            }), 403
        
        print(f"✅ Accès admin autorisé - Agent: {user_info['prenom']} {user_info['nom']}")
        
        return jsonify({
            'message': 'Authentification réussie',
            'authorized': True,
            'user': user_info
        })
        
    except Exception as e:
        print(f"❌ Erreur admin_auth: {e}")
        return jsonify({'error': 'Erreur serveur', 'authorized': False}), 500

# Route de test pour vérifier si le serveur fonctionne
@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Serveur opérationnel', 'status': 'OK'})

# IMPORTANT: Toutes les routes doivent être définies AVANT cette ligne !
if __name__ == '__main__':
    print("🚀 Démarrage du serveur Ultron Survivors...")
    print("📡 Serveur accessible sur: http://localhost:5000")
    print("🎯 QR codes sauvegardés dans: ./qrcodes/")
    print("🔍 Route de test: http://localhost:5000/test")
    print("👥 Route users: http://localhost:5000/users")
    app.run(host='localhost', port=5000, debug=True)