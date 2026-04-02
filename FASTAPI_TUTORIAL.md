# Przewodnik po FastAPI

Ten przewodnik pomoże Ci zrozumieć podstawy tworzenia API za pomocą FastAPI.

## 1. Czym jest FastAPI?

FastAPI to nowoczesny i bardzo wydajny framework webowy do budowania API w Pythonie (wersja 3.7+). Jego główne zalety to:

*   **Szybkość działania:** Jest jednym z najszybszych frameworków Pythona, porównywalnym wydajnościowo do Node.js i Go.
*   **Szybkość kodowania:** Dzięki prostocie i automatyzacji, pozwala pisać kod nawet 2-3 razy szybciej.
*   **Mniej błędów:** Wykorzystanie wskazówek typów (type hints) redukuje błędy ludzkie o około 40%.
*   **Intuicyjność:** Świetne wsparcie dla edytorów kodu z autouzupełnianiem.
*   **Automatyczna dokumentacja:** Automatycznie generuje interaktywną dokumentację API (Swagger UI / OpenAPI).

## 2. Instalacja

Do działania FastAPI potrzebuje serwera ASGI, takiego jak `uvicorn`.

**Wskazówka:** Użyj menedżera pakietów `pip`, aby zainstalować obie biblioteki.

```bash
pip install fastapi uvicorn[standard]
```
*`[standard]`* dodaje zalecane zależności, które poprawiają wydajność serwera.

## 3. Pierwsza Aplikacja

Stwórzmy plik `main.py` i napiszmy w nim minimalną aplikację.

**Wskazówka:**
1.  Zaimportuj klasę `FastAPI`.
2.  Stwórz jej instancję: `app = FastAPI()`.
3.  Użyj dekoratora `@app.get("/")`, aby określić, że poniższa funkcja będzie obsługiwać żądania `GET` pod głównym adresem `/`.
4.  Zdefiniuj funkcję (może być `async`), która zwróci dane. FastAPI automatycznie przekonwertuje słowniki Pythona na format JSON.

```python
# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Hello, Saper!"}
```

## 4. Uruchamianie Serwera

Aby uruchomić aplikację, użyj `uvicorn` w terminalu.

**Wskazówka:** Komenda `uvicorn` przyjmuje dwa argumenty: `nazwa_pliku:nazwa_instancji_aplikacji`. Flaga `--reload` sprawia, że serwer automatycznie restartuje się po każdej zmianie w kodzie, co jest niezwykle przydatne podczas dewelopmentu.

```bash
uvicorn main:app --reload
```

Po uruchomieniu, Twoje API będzie dostępne pod adresem `http://127.0.0.1:8000`.

## 5. Interaktywna Dokumentacja

To jedna z najlepszych funkcji FastAPI. Bez żadnego dodatkowego wysiłku masz dostęp do w pełni funkcjonalnej dokumentacji swojego API.

*   Otwórz w przeglądarce: `http://127.0.0.1:8000/docs`
*   Zobaczysz interfejs Swagger UI, gdzie możesz przeglądać wszystkie swoje "endpointy" (adresy URL) i testować je bezpośrednio z przeglądarki.

## 6. Parametry w Ścieżce (Path Parameters)

Możesz definiować dynamiczne części w adresie URL.

**Wskazówka:** Użyj nawiasów klamrowych `{}` w dekoratorze, a następnie przekaż zmienną o tej samej nazwie jako argument do funkcji. Użycie wskazówek typów (`: int`) zapewnia walidację danych.

```python
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}
```
Teraz możesz wejść na `http://127.0.0.1:8000/items/5`, a FastAPI sprawdzi, czy podana wartość to liczba całkowita.

## 7. Parametry Zapytania (Query Parameters)

Parametry zapytania to te po znaku `?` w URL, np. `?skip=0&limit=10`.

**Wskazówka:** Zdefiniuj je jako argumenty funkcji, które nie występują w ścieżce. Możesz im nadać wartości domyślne.

```python
@app.get("/players/")
async def read_players(skip: int = 0, limit: int = 10):
    # Tutaj logika do pobrania graczy z bazy danych
    return {"skip": skip, "limit": limit}
```
Możesz go wywołać pod adresem `http://127.0.0.1:8000/players/?skip=5`.

## 8. Ciało Żądania (Request Body) i Pydantic

Do wysyłania danych (np. przy tworzeniu nowego obiektu przez `POST`) używamy "ciała żądania". FastAPI wykorzystuje bibliotekę `Pydantic` do definiowania struktury tych danych.

**Wskazówka:**
1.  Zaimportuj `BaseModel` z `pydantic`.
2.  Stwórz klasę dziedziczącą po `BaseModel`, aby zdefiniować model danych.
3.  Użyj tej klasy jako wskazówki typu w funkcji dla metody `POST`.

```python
from pydantic import BaseModel

class Player(BaseModel):
    username: str
    email: str
    is_active: bool = True

@app.post("/players/")
async def create_player(player: Player):
    # Tutaj logika do zapisu gracza w bazie danych
    return {"status": "success", "player_data": player}
```
FastAPI automatycznie:
*   Sprawdzi, czy dane wysłane przez klienta pasują do modelu `Player`.
*   Zwróci czytelny błąd, jeśli dane są nieprawidłowe.
*   Udostępni `player` jako obiekt `Player` w Twojej funkcji.
*   Doda ten model do dokumentacji OpenAPI.

Możesz to przetestować w `http://127.0.0.1:8000/docs`.