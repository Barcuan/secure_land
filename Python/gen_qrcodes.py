import sqlite3
import qrcode
import os

# Création dossier pour QR codes
os.makedirs('qrcodes', exist_ok=True)

conn = sqlite3.connect(r'C:\All\Taff\Git\secure_land\Bases\population.db')
c = conn.cursor()

c.execute("SELECT id, nom, prenom, qr_token FROM population")
rows = c.fetchall()

for id_, nom, prenom, token in rows:

    # Génération QR code à partir du token unique
    img = qrcode.make(token)

    # Sauvegarde avec nom utilisateur pour repérage
    filename = f'qrcodes/{id_}_{nom}_{prenom}.png'
    img.save(filename)
    print(f"QR code généré: {filename}")

conn.close()
print("Tous les QR codes ont été générés.")

