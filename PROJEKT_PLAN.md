# Plan Projektu: Gra Saper (Frontend JS + Backend Python/FastAPI)

Projekt edukacyjny polegający na stworzeniu gry Saper, gdzie frontend w czystym JavaScript komunikuje się z backendem w Pythonie, na którym spoczywa cała logika gry.

## Faza 1: Stworzenie Backendu z Logiką Gry (Python/FastAPI)

- [ ] **Konfiguracja środowiska:**
    - [ ] Utworzenie i aktywacja środowiska wirtualnego w folderze `backend`.
    - [ ] Instalacja `FastAPI` i `uvicorn`.
- [ ] **Implementacja logiki gry w Pythonie:**
    - [ ] Stworzenie modelu danych dla planszy i komórek.
    - [ ] Implementacja funkcji do generowania planszy i losowego rozmieszczania min.
    - [ ] Stworzenie logiki odkrywania pól i liczenia sąsiadujących min.
    - [ ] Implementacja mechanizmu wygranej/przegranej.
- [ ] **Stworzenie API do zarządzania grą:**
    - [ ] Zaprojektowanie i implementacja endpointu `POST /game/new` do tworzenia nowej gry.
    - [ ] Zaprojektowanie i implementacja endpointu `POST /game/{game_id}/click` do odkrywania pola.
    - [ ] Zaprojektowanie i implementacja endpointu `POST /game/{game_id}/flag` do oznaczania pola flagą.

## Faza 2: Połączenie Frontendu z Backendem

- [ ] **Modyfikacja kodu JavaScript:**
    - [ ] Usunięcie istniejącej logiki gry z pliku `script.js`.
    - [ ] Stworzenie funkcji do komunikacji z API backendu (np. przy użyciu `fetch`).
- [ ] **Dynamiczne renderowanie gry:**
    - [ ] Implementacja logiki, która na podstawie odpowiedzi z API będzie rysować planszę i aktualizować jej stan.
    - [ ] Powiązanie akcji użytkownika (kliknięcia na planszy) z odpowiednimi wywołaniami API.

## Faza 3: Implementacja Timera i Rankingu

- [ ] **Dodanie Timera:**
    - [ ] Uruchomienie licznika czasu na frontendzie po wykonaniu pierwszej akcji.
    - [ ] Przesyłanie czasu do backendu po zakończeniu gry w celu weryfikacji i zapisu.
- [ ] **Stworzenie systemu rankingu:**
    - [ ] Zaprojektowanie endpointów API `GET /scores` i `POST /scores`.
    - [ ] Skonfigurowanie prostej bazy danych (np. SQLite) do przechowywania wyników.
    - [ ] Implementacja logiki zapisu i odczytu wyników.
- [ ] **Wyświetlanie rankingu:**
    - [ ] Stworzenie na frontendzie sekcji do wyświetlania listy najlepszych wyników.

## Faza 4: Ulepszenia (Opcjonalnie)

- [ ] Poprawa interfejsu i doświadczenia użytkownika (UX/UI).
- [ ] Dodanie przycisku "Nowa Gra", który wywołuje API.
- [ ] Wprowadzenie różnych poziomów trudności.
