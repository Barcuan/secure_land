import sqlite3
import uuid

# Création base population.db avec nouvelles colonnes
conn_pop = sqlite3.connect('population.db')
c_pop = conn_pop.cursor()
c_pop.execute('''
CREATE TABLE IF NOT EXISTS population (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    prenom TEXT,
    date_naissance TEXT,
    localisation TEXT,
    qr_token TEXT UNIQUE
)
''')

# Exemple d'ajout utilisateurs dans population avec date_naissance et localisation
users = [
    ("Dupont", "Alice", "1990-05-12", "Paris", str(uuid.uuid4())),
    ("Martin", "Bob", "1985-11-01", "Lyon", str(uuid.uuid4())),
    ("Durand", "Claire", "1995-07-23", "Marseille", str(uuid.uuid4())),
]
for nom, prenom, dob, loc, token in users:
    c_pop.execute('INSERT INTO population (nom, prenom, date_naissance, localisation, qr_token) VALUES (?, ?, ?, ?, ?)', 
                  (nom, prenom, dob, loc, token))

conn_pop.commit()

# Création base accred.db inchangée
conn_accred = sqlite3.connect('accred.db')
c_accred = conn_accred.cursor()
c_accred.execute('''
CREATE TABLE IF NOT EXISTS accreditations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    population_id INTEGER,
    niveau TEXT,
    acces_labo_DIP INTEGER,
    acces_docs INTEGER
)
''')

# Ajout accréditations liées (récupérer IDs population créés)
c_pop.execute("SELECT id FROM population ORDER BY id ASC")
pop_ids = [row[0] for row in c_pop.fetchall()]

accreds = [
    (pop_ids[0], "confidentiel", 1, 1),
    (pop_ids[1], "restreint", 1, 0),
    (pop_ids[2], "public", 0, 0),
]

for pop_id, niveau, labo, docs in accreds:
    c_accred.execute('INSERT INTO accreditations (population_id, niveau, acces_labo_DIP, acces_docs) VALUES (?, ?, ?, ?)', (pop_id, niveau, labo, docs))

conn_accred.commit()

# Fermer connexions
conn_pop.close()
conn_accred.close()

print("Bases de données créées et données d'exemple avec date_naissance & localisation ajoutées avec succès.")
