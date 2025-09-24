from flask import Flask, request, jsonify
import sqlite3
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
