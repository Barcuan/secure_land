from flask import Flask, request, jsonify
import sqlite3
import uuid
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def verifier_qr_token(qr_token):
    """
    Vérifie le token QR et récupère les informations de l'utilisateur avec ses accréditations.
    Cette fonction effectue une vérification en deux étapes:
    1. Vérifie si le token QR existe dans la base de données de population
    2. Si l'utilisateur existe, récupère ses informations d'accréditation
    Paramètres:
    -----------
    qr_token : str
        Le token QR à vérifier
    Retourne:
    ---------
    dict ou None
        Si le token est valide, retourne un dictionnaire contenant:
            - id (int): ID de l'utilisateur
            - nom (str): Nom de famille de l'utilisateur
            - prenom (str): Prénom de l'utilisateur
            - niveau (int ou None): Niveau d'accréditation de l'utilisateur
            - acces_labo_DIP (bool): Si l'utilisateur a accès au laboratoire DIP
            - acces_docs (bool): Si l'utilisateur a accès aux documents
        Retourne None si le token ne correspond à aucun utilisateur
    """
    conn_pop = sqlite3.connect(r'C:\All\Taff\Git\secure_land\Bases\population.db')
    c_pop = conn_pop.cursor()
    c_pop.execute("SELECT id, nom, prenom FROM population WHERE qr_token=?", (qr_token,))
    user = c_pop.fetchone()
    conn_pop.close()
    if not user:
        return None

    user_id, nom, prenom = user

    conn_accred = sqlite3.connect(r'C:\All\Taff\Git\secure_land\Bases\accred.db')
    c_accred = conn_accred.cursor()
    c_accred.execute("SELECT niveau, acces_labo_DIP, acces_docs FROM accreditations WHERE population_id=?", (user_id,))
    accred = c_accred.fetchone()
    conn_accred.close()

    return {
        "id": user_id,
        "nom": nom,
        "prenom": prenom,
        "niveau": accred[0] if accred else None,
        "acces_labo_DIP": bool(accred[1]) if accred else False,
        "acces_docs": bool(accred[2]) if accred else False
    }

@app.route('/scan', methods=['POST'])
def scan():
    data = request.get_json()
    qr_token = data.get('qr_token')
    if not qr_token:
        return jsonify({'error': 'qr_token manquant'}), 400
    
    user_info = verifier_qr_token(qr_token)
    if not user_info:
        return jsonify({'status': 'non trouvé'}), 404
    
    return jsonify({'status': 'trouvé', 'user': user_info})

if __name__ == '__main__':
    app.run(port=5000, debug=True)

# Ajoutez ces routes à votre serveur existant

@app.route('/add_user', methods=['POST'])
def add_user():
    try:
        data = request.json
        
        # Validation des données
        required_fields = ['nom', 'prenom', 'date_naissance', 'localisation', 'niveau']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Le champ {field} est requis'}), 400
        
        # Générer un token QR unique
        qr_token = str(uuid.uuid4())
        
        # Ajouter à la base population
        conn_pop = sqlite3.connect('population.db')
        c_pop = conn_pop.cursor()
        
        c_pop.execute('''
            INSERT INTO population (nom, prenom, date_naissance, localisation, qr_token) 
            VALUES (?, ?, ?, ?, ?)
        ''', (data['nom'], data['prenom'], data['date_naissance'], 
              data['localisation'], qr_token))
        
        population_id = c_pop.lastrowid
        conn_pop.commit()
        conn_pop.close()
        
        # Ajouter les accréditations
        conn_accred = sqlite3.connect('accred.db')
        c_accred = conn_accred.cursor()
        
        c_accred.execute('''
            INSERT INTO accreditations (population_id, niveau, acces_labo_DIP, acces_docs) 
            VALUES (?, ?, ?, ?)
        ''', (population_id, data['niveau'], 
              data.get('acces_labo_DIP', 0), data.get('acces_docs', 0)))
        
        conn_accred.commit()
        conn_accred.close()
        
        return jsonify({
            'message': 'Utilisateur ajouté avec succès',
            'qr_token': qr_token,
            'user_id': population_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users', methods=['GET'])
def get_users():
    try:
        # Récupérer tous les utilisateurs avec leurs accréditations
        conn_pop = sqlite3.connect('population.db')
        conn_accred = sqlite3.connect('accred.db')
        
        c_pop = conn_pop.cursor()
        c_accred = conn_accred.cursor()
        
        # Jointure pour récupérer toutes les informations
        query = '''
            SELECT p.id, p.nom, p.prenom, p.date_naissance, p.localisation, p.qr_token,
                   a.niveau, a.acces_labo_DIP, a.acces_docs
            FROM population p
            LEFT JOIN accreditations a ON p.id = a.population_id
            ORDER BY p.nom, p.prenom
        '''
        
        c_pop.execute(query)
        results = c_pop.fetchall()
        
        users = []
        for row in results:
            users.append({
                'id': row[0],
                'nom': row[1],
                'prenom': row[2],
                'date_naissance': row[3],
                'localisation': row[4],
                'qr_token': row[5],
                'niveau': row[6] or 'public',
                'acces_labo_DIP': bool(row[7]) if row[7] is not None else False,
                'acces_docs': bool(row[8]) if row[8] is not None else False
            })
        
        conn_pop.close()
        conn_accred.close()
        
        return jsonify({'users': users})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500