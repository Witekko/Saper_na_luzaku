from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=True)

    # Kolumny dla OAuth2 (Google)
    email = Column(String, unique=True, index=True, nullable=True)
    google_id = Column(String, unique=True, index=True, nullable=True)
    auth_provider = Column(String, default="local") # np. "google"
    avatar_url = Column(String, nullable=True)

    # Pozwala z poziomu obiektu gracza odwołać się do listy jego wyników: gracz.scores
    scores = relationship("Score", back_populates="player")

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    time_seconds = Column(Integer)
    difficulty = Column(String, index=True)
    player_id = Column(Integer, ForeignKey("players.id"))

    # Pozwala z poziomu wyniku sprawdzić jego autora: wynik.player
    player = relationship("Player", back_populates="scores")
