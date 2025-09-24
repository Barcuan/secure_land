import sqlite3
import os

def test_databases():
    """Test les bases de données pour vérifier leur contenu"""
    
    bases_dir = r'C:\All\Taff\Git\secure_land\Bases'
    
    # Test population.db
    pop_path = os.path.join(bases_dir, 'population.db')
    if os.path.exists(pop_path):
        print("📊 Contenu de population.db:")
        conn_pop = sqlite3.connect(pop_path)
        c_pop = conn_pop.cursor()
        
        # Vérifier la structure de la table
        c_pop.execute("PRAGMA table_info(population)")
        columns = c_pop.fetchall()
        print(f"Colonnes: {[col[1] for col in columns]}")
        
        # Afficher les données
        c_pop.execute("SELECT * FROM population")
        users = c_pop.fetchall()
        print(f"Nombre d'utilisateurs: {len(users)}")
        for user in users:
            print(f"  - {user}")
        conn_pop.close()
    else:
        print(f"❌ {pop_path} n'existe pas")
    
    print("\n" + "="*50 + "\n")
    
    # Test accred.db
    accred_path = os.path.join(bases_dir, 'accred.db')
    if os.path.exists(accred_path):
        print("📊 Contenu de accred.db:")
        conn_accred = sqlite3.connect(accred_path)
        c_accred = conn_accred.cursor()
        
        # Vérifier la structure de la table
        c_accred.execute("PRAGMA table_info(accreditations)")
        columns = c_accred.fetchall()
        print(f"Colonnes: {[col[1] for col in columns]}")
        
        # Afficher les données
        c_accred.execute("SELECT * FROM accreditations")
        accreds = c_accred.fetchall()
        print(f"Nombre d'accréditations: {len(accreds)}")
        for accred in accreds:
            print(f"  - {accred}")
        conn_accred.close()
    else:
        print(f"❌ {accred_path} n'existe pas")

if __name__ == '__main__':
    test_databases()