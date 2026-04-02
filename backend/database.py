from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Wskazujemy, że chcemy utworzyć plik sql_app.db w głównym folderze
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

# Tworzymy "silnik", który zarządza połączeniem z plikiem SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()