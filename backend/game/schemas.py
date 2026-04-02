from pydantic import BaseModel
from typing import List, Optional

class CellResponse(BaseModel):
    row: int
    col: int
    is_revealed: bool = False
    is_flagged: bool = False
    neighbor_mines: int = 0
    is_mine: bool = False

class BoardResponse(BaseModel):
    game_id: str
    rows: int
    cols: int
    mines: int
    grid: List[List[CellResponse]]
    game_over: bool = False
    is_win: bool = False

class CellClick(BaseModel):
    row: int
    col: int

# Schematy dla bazy danych i uwierzytelniania
class PlayerCreate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    google_id: Optional[str] = None
    auth_provider: str = "local"
    avatar_url: Optional[str] = None

class ScoreCreate(BaseModel):
    time_seconds: int
    difficulty: str
