from urllib.parse import quote_plus

DB_USER = "root" #change if username is diff
DB_PASSWORD = quote_plus("")  #put password for mariadb here
DB_HOST = "localhost"
DB_NAME = "student_event_system"

class Config:
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
