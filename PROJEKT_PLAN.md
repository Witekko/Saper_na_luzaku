# Plan Projektu: Gra Saper (JavaScript + Python/Flask)

Projekt edukacyjny polegający na stworzeniu gry Saper krok po kroku, z frontendem w czystym JavaScript i backendem w Pythonie.

## Faza 1: Podstawowa Gra w JavaScript (Zakończona)

- [x] Stworzenie struktury plików HTML, CSS, JS.
- [x] Implementacja dynamicznego generowania planszy.
- [x] Podstawowa logika gry:
    - [x] Rozmieszczanie min.
    - [x] Odkrywanie pól po kliknięciu.
    - [x] Liczenie min w sąsiedztwie.
    - [x] Oznaczanie pól flagą.
    - [x] Mechanizm pierwszego bezpiecznego kliknięcia.

## Faza 2: Ulepszenia i Rozbudowa Frontendu

- [ ] **Dodanie timera do gry:**
    - [ ] Utworzenie elementu HTML do wyświetlania czasu.
    - [ ] Implementacja logiki startu, stopu i aktualizacji timera w `script.js`.
- [ ] **Poprawa UX (User Experience):**
    - [ ] Lepsza wizualna informacja zwrotna po wygranej/przegranej.
    - [ ] Przycisk "Nowa Gra".

## Faza 3: Wprowadzenie Backendu

- [ ] **Stworzenie szkieletu aplikacji w Pythonie:**
    - [ ] Wybór frameworka (Flask).
    - [ ] Utworzenie podstawowego pliku `app.py` w folderze `backend`.
- [ ] **Zaprojektowanie API dla rankingu:**
    - [ ] Stworzenie endpointu `POST /api/scores` do zapisywania wyników.
    - [ ] Stworzenie endpointu `GET /api/scores` do pobierania listy najlepszych wyników.

## Faza 4: Integracja Frontend-Backend i Ranking

- [ ] Skonfigurowanie bazy danych (np. SQLite) do przechowywania wyników.
- [ ] Implementacja logiki zapisywania i pobierania wyników w aplikacji Flask.
- [ ] Połączenie frontendu z backendem:
    - [ ] Wysyłanie wyniku z gry do serwera po wygranej.
    - [ ] Stworzenie w HTML/JS sekcji do wyświetlania rankingu.

## Koncepcje do rozważenia (na przyszłość)

- Migracja logiki gry z frontendu na backend w celu zapewnienia 100% uczciwości rankingu.
- Dodanie profili użytkowników.