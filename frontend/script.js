// Plik skryptów dla Saper

class Game {
    constructor() {
        this.seconds = 0;
        this.timerInterval = null; // Zmiana nazwy, by nie konfliktowała z systemowym setInterval
        
        // Domyślne ustawienia dla poziomu "Łatwy"
        this.currentRows = 8;
        this.currentCols = 10;
        this.currentMines = 8;
        this.init(this.currentRows, this.currentCols, this.currentMines);
    }

    async init(rows = this.currentRows, cols = this.currentCols, mines = this.currentMines) {
        // Zapamiętujemy aktualnie wybrany poziom do późniejszego restartu
        this.currentRows = rows;
        this.currentCols = cols;
        this.currentMines = mines;

        // Logika inicjalizacji gry
        try{
            const response = await fetch(`http://127.0.0.1:8000/new?rows=${rows}&cols=${cols}&mines=${mines}`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'}
            });
            const gameState = await response.json();
            this.seconds = 0;
            
            // Zatrzymujemy stary stoper i resetujemy wyświetlacz
            this.stopTimer();
            document.getElementById('timer').textContent = this.seconds;
            document.getElementById('game-board').innerHTML = '';


            this.gameId = gameState.game_id;
            this.render(gameState)
        } catch(error){
            console.error("Nie udało się zainicjować gry:", error);
        }
    }

    startTimer() {
        // Uruchom stoper tylko wtedy, jeśli jeszcze nie działa
        if (!this.timerInterval) {
            // window.setInterval wykonuje podaną funkcję co 1000 milisekund (1 sekundę)
            this.timerInterval = window.setInterval(() => {
                this.seconds++;
                document.getElementById('timer').textContent = this.seconds;
            }, 1000);
        }
    }

    stopTimer() {
        // Jeśli stoper działa, zatrzymaj go
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    render(gameState) {
        const gameBoard = document.getElementById('game-board');

        // Dynamiczne dopasowanie siatki CSS do rozmiaru planszy przysłanego z serwera
        gameBoard.style.gridTemplateColumns = `repeat(${gameState.cols}, 40px)`;
        let flagscount = 0

        if (gameBoard.children.length === 0){
            for (const row of gameState.grid){
                for (const cell of row){
                    const cellElement = document.createElement('div');
                cellElement.dataset.row = cell.row;
                cellElement.dataset.col = cell.col;
                cellElement.classList.add('cell');

                // Prawy klik (flagowanie)
                cellElement.addEventListener('contextmenu', async (event) => {
                    event.preventDefault();
                    if (cell.is_revealed || gameState.game_over) return;

                    try {
                        // Uruchom czas przy pierwszym postawieniu flagi (opcjonalne, ale częste w Saperze)
                        this.startTimer();

                        const response = await fetch(`http://127.0.0.1:8000/game/${this.gameId}/flag`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ row: cell.row, col: cell.col })
                        });
                        if (!response.ok) {
                            alert("Gra wygasła (zrestartowano serwer). Inicjuję nową planszę!");
                            this.init();
                            return;
                        }
                        const newGameState = await response.json();
                        this.render(newGameState);
                    } catch (error) {
                        console.error("Błąd podczas flagowania komórki:", error);
                    }
                });

                // Lewy klik (odkrywanie)
                cellElement.addEventListener('click', async () => {
                    if (cell.is_revealed || cell.is_flagged || gameState.game_over) return;

                    try {
                        // Uruchom czas przy pierwszym kliknięciu
                        this.startTimer();

                        const response = await fetch(`http://127.0.0.1:8000/game/${this.gameId}/reveal`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ row: cell.row, col: cell.col })
                        });
                        if (!response.ok) {
                            alert("Gra wygasła (zrestartowano serwer). Inicjuję nową planszę!");
                            this.init();
                            return;
                        }
                        const newGameState = await response.json();
                        this.render(newGameState);
                    } catch (error) {
                        console.error("Błąd podczas odkrywania komórki:", error);
                    }
                });
                
                // Dodajemy zbudowaną komórkę do planszy w HTML (tylko raz!)
                gameBoard.appendChild(cellElement);
                }
            }   
        }
        
        // FAZA 2: AKTUALIZACJA (wykona się po każdym kliknięciu)
        for (const row of gameState.grid) {
            for (const cell of row) {
                const index = cell.row * gameState.cols + cell.col;
                const cellElement = gameBoard.children[index];

                cellElement.className = 'cell';
                cellElement.textContent = '';

                // Ustawianie wyglądu komórki na podstawie danych z serwera
                if (cell.is_flagged) {
                    cellElement.classList.add('flagged');
                    flagscount++;
                }

                if (cell.is_revealed) {
                    cellElement.classList.add('revealed');
                    if (cell.neighbor_mines > 0) {
                        cellElement.textContent = cell.neighbor_mines;
                        cellElement.classList.add('n' + cell.neighbor_mines);
                    }
                }

                // Jeśli serwer odesłał nam informację o minie (oznacza to koniec gry)
                if (cell.is_mine) {
                    cellElement.classList.add('revealed', 'mine');
                }
            }
        }

        const statusElement = document.getElementById('game-status');
        if (gameState.game_over) {
            // Gra się skończyła, zatrzymujemy stoper
            this.stopTimer();

            // Po przegranej, backend w przyszłości może zwrócić planszę z odkrytymi minami
            // Na razie po prostu pokazujemy status
            if (gameState.is_win) {
                flagscount = gameState.mines;
                statusElement.textContent = "Congratulations, you Win!";
                statusElement.style.color = 'green';
            } else {
                statusElement.textContent = "Game Over!";
                statusElement.style.color = 'red';
            }
        } else {
            statusElement.textContent = ""; 
        }
        const minesLeftElement = document.getElementById('mines-count');
        minesLeftElement.textContent = gameState.mines - flagscount;
    }

    reset(){
        // Reset po prostu inicjuje nową grę
        this.init();
    }
}
let game;
document.addEventListener('DOMContentLoaded', () => {

    // Funkcja pomocnicza do wyciągania wartości konkretnego ciastka z document.cookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Sprawdzamy, czy w ciasteczkach jest nazwa gracza (co oznacza, że wrócił z Google!)
    const playerName = getCookie("player_name");
    if (playerName) {
        const authSection = document.getElementById("auth-section");
        // Zamieniamy przycisk logowania na tekst powitalny ORAZ przycisk wyloguj
        authSection.innerHTML = `
            <span style="font-weight: bold; color: #4285F4; font-size: 1.2rem; margin-right: 15px;">Witaj, ${decodeURIComponent(playerName)}!</span>
            <button id="logout-button" style="background-color: #e57373; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">Wyloguj</button>
        `;

        document.getElementById('logout-button').addEventListener('click', () => {
            // Usuwamy ciasteczka ustawiając ich datę ważności na przeszłość
            document.cookie = "player_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "player_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.reload();
        });
    }

    game = new Game();
    console.log("Utworzono obiekt gry:", game);
    const resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', () => {
        game.reset();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "r") {
            game.reset();
        }
    });
    easyButton = document.getElementById('btn-easy');
    easyButton.addEventListener('click', () => {
        game.init(8, 10, 8);
    });
    mediumButton = document.getElementById('btn-medium');
    mediumButton.addEventListener('click', () => {
        game.init(16, 20, 40);
    });
    hardButton = document.getElementById('btn-hard');
    hardButton.addEventListener('click', () => {
        game.init(16, 30, 99);
    });
    
});
