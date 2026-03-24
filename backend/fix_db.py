import os
from sqlalchemy import create_all, text, create_engine
from app.core.database import SQLALCHEMY_DATABASE_URL

def fix_database():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # List of columns to ensure exist in the 'users' table
    # format: (column_name, column_type)
    columns_to_add = [
        ("profile_image", "VARCHAR"),
        ("is_verified", "BOOLEAN DEFAULT FALSE"),
        ("verification_token", "VARCHAR"),
        ("reset_token", "VARCHAR"),
        ("reset_token_expiry", "TIMESTAMP")
    ]
    
    print("Checking database schema...")
    with engine.connect() as conn:
        for col_name, col_type in columns_to_add:
            try:
                # Check if column exists
                result = conn.execute(text(f"""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='users' AND column_name='{col_name}';
                """))
                
                if not result.fetchone():
                    print(f"Adding missing column: {col_name}")
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type};"))
                    conn.commit()
                else:
                    print(f"Column {col_name} already exists.")
            except Exception as e:
                print(f"Error checking/adding {col_name}: {e}")
                conn.rollback()
        
        # Finally, ensure alembic version is set to head so it stops trying to re-run old migrations
        print("Ensuring alembic_version is at latest...")
        try:
            # This is the ID of our latest migration
            latest_rev = "74e4ed408c44"
            conn.execute(text("CREATE TABLE IF NOT EXISTS alembic_version (version_num VARCHAR(32) PRIMARY KEY);"))
            conn.execute(text("DELETE FROM alembic_version;"))
            conn.execute(text(f"INSERT INTO alembic_version (version_num) VALUES ('{latest_rev}');"))
            conn.commit()
            print(f"Database marked as version {latest_rev}")
        except Exception as e:
            print(f"Error updating alembic_version: {e}")
            conn.rollback()

if __name__ == "__main__":
    fix_database()
