import uuid
import os
import certifi
from fastapi import FastAPI, HTTPException, Request, Depends
import httpx
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from fastapi_sso.sso.google import GoogleSSO

# Naprawa błędu z certyfikatami SSL w Pythonie
os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["SSL_CERT_DIR"] = certifi.where()

# Wczytanie zmiennych środowiskowych z pliku .env
load_dotenv()

# Wymuszamy na bibliotece httpx ignorowanie błędów SSL (obejście proxy/antywirusa)
original_client_init = httpx.AsyncClient.__init__
def patched_client_init(self, *args, **kwargs):
    kwargs["verify"] = False
    original_client_init(self, *args, **kwargs)
httpx.AsyncClient.__init__ = patched_client_init

from fastapi.middleware.cors import CORSMiddleware
from game.engine import Board
from game.schemas import BoardResponse, CellResponse, CellClick
from sqlalchemy.orm import Session

# Importy bazy danych
from database import engine, SessionLocal
import models

# Tworzenie tabel w bazie danych na starcie aplikacji
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Konfiguracja Google SSO
google_sso = GoogleSSO(
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    redirect_uri="http://localhost:8000/auth/google/callback",
    allow_insecure_http=True  # Wymagane, bo testujemy na HTTP (localhost), a nie HTTPS
)

# Konfiguracja CORS, aby przeglądarka nie blokowała zapytań
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Pozwala na zapytania z dowolnego źródła (przydatne przy dewelopmencie)
    allow_credentials=True,
    allow_methods=["*"],  # Pozwala na metody POST, GET itd.
    allow_headers=["*"],
)

active_games = {}

# Funkcja dostarczająca sesję bazy danych dla każdego zapytania HTTP
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def convert_board_to_response(board: Board, game_id: str) -> BoardResponse:
    response_grid = []
    
    for row_data in board.grid:
        response_row = []
        for cell in row_data:
            # Jeśli komórka jest odkryta, pokazujemy liczbę sąsiadów.
            # Jeśli jest zakryta, wysyłamy 0, bo frontend i tak nie powinien tego pokazywać.
            mines_to_show = cell.neighbor_mines if cell.is_revealed else 0
            
            # Bezpieczeństwo: pokazujemy miny TYLKO wtedy, gdy gra się skończyła i to przegraną.
            show_mine = board.game_over and not board.is_win and cell.is_mine
            
            cell_res = CellResponse(
                row=cell.row,
                col=cell.col,
                is_revealed=cell.is_revealed,
                is_flagged=cell.is_flagged,
                neighbor_mines=mines_to_show,
                is_mine=show_mine
            )
            response_row.append(cell_res)
        response_grid.append(response_row)
        
    # Zwracamy całą planszę gotową do wysłania
    return BoardResponse(
        game_id=game_id,
        rows=board.rows,
        cols=board.cols,
        mines=board.mines,
        grid=response_grid,
        game_over=board.game_over,
        is_win=board.is_win
    )



@app.get("/")
def read_root():
    return {"message": "Serwer działa!"}

@app.post("/new", response_model=BoardResponse)
def create_new_game(rows: int = 10, cols: int = 10, mines: int = 10):
    game_id = str(uuid.uuid4())
    board = Board(rows=rows, cols=cols, mines=mines)
    board.setup_board()
    active_games[game_id] = board
    return convert_board_to_response(board, game_id)

@app.post("/game/{game_id}/reveal", response_model=BoardResponse)
def reveal_cell_endpoint(game_id: str, cell_click: CellClick):
    if game_id not in active_games:
        raise HTTPException(status_code=404, detail="Game not found")
    board = active_games[game_id]
    board.reveal_cell(cell_click.row, cell_click.col)
    return convert_board_to_response(board, game_id)
@app.post("/game/{game_id}/flag", response_model=BoardResponse)
def flag_cell_endpoint(game_id: str, cell_click: CellClick):
    if game_id not in active_games:
        raise HTTPException(status_code=404, detail="Game not found")
    board = active_games[game_id]
    board.flag_cell(cell_click.row, cell_click.col)
    return convert_board_to_response(board, game_id)


# --- Endpointy do logowania Google ---

@app.get("/auth/google/login")
async def auth_init():
    """Przekierowuje użytkownika do ekranu logowania Google."""
    async with google_sso:
        return await google_sso.get_login_redirect()

@app.get("/auth/google/callback")
async def auth_callback(request: Request, db: Session = Depends(get_db)):
    """Odbiera dane od Google po udanym logowaniu."""
    async with google_sso:
        user = await google_sso.verify_and_process(request)
    
    # Sprawdzamy, czy gracz o tym adresie email już istnieje w bazie
    player = db.query(models.Player).filter(models.Player.email == user.email).first()
    
    if not player:
        # Jeśli nie istnieje, tworzymy nowe konto
        player = models.Player(
            username=user.display_name,
            email=user.email,
            google_id=user.id,
            auth_provider="google",
            avatar_url=user.picture if hasattr(user, "picture") else None
        )
        db.add(player)
        db.commit()
        db.refresh(player)
    
    # Tworzymy odpowiedź z przekierowaniem
    response = RedirectResponse(url="http://127.0.0.1:3000/frontend/index.html")
    
    # Dodajemy informacje o zalogowanym graczu do ciasteczek (cookies)
    response.set_cookie(key="player_id", value=str(player.id), max_age=3600, httponly=False, samesite="lax")
    response.set_cookie(key="player_name", value=player.username, max_age=3600, httponly=False, samesite="lax")
    return response