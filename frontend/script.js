// Plik skryptów dla Saper


class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.isMine = false;
        this.isRevealed = false;
        this.isFlagged = false;
        this.neighborMines = 0;
    }
}
class Game {
    constructor(rows, cols, minesCount) {
        this.rows = rows;
        this.cols = cols;
        this.minesCount = minesCount;
        this.board = [];
        this.gameOver = false;
        this.isWin=false;
        this.firstClick = true;
        this.init();
    }

    init() {
        // Logika inicjalizacji gry
        this.createGrid();
        this.render();
    }
    createGrid (){
        
        for (let r = 0; r < this.rows; r++) {
        const row = [];
          // Add the new row to the board

            for (let c = 0; c < this.cols; c++) {
                const cell = new Cell(r, c);
                row.push(cell);
            }
        this.board.push(row);
        }
    }
    revealNeighbors(cell) {
        const neighbors = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        for (const neighbor of neighbors) {
            const neighborRow = cell.row + neighbor[0];
            const neighborCol = cell.col + neighbor[1];
            if (neighborCol >= 0 && neighborCol < this.cols && neighborRow >= 0 && neighborRow < this.rows){
                const neighborCell = this.board[neighborRow][neighborCol];
                if (!neighborCell.isRevealed) {
                    this.handleClick(neighborCell);
                }
            }}
    }
    
    handleClick(cell) {
        if(this.firstClick){
                    this.createMines(cell);
                    this.firstClick=false;
                    this.calculateNeighborMines();
                }
        if (cell.isRevealed || this.gameOver || cell.isFlagged) {
            return;
        }
        cell.isRevealed = true;
        if (cell.isMine) {
                this.gameOver = true;
                console.log("Przegrana!");
            } 
        else if (cell.neighborMines === 0){
            this.revealNeighbors(cell);
        }
        this.isWin=this.checkWinCondition()
        this.render();
    }
    checkWinCondition(){
        for (const row of this.board) {
            for (const cell of row) {
                if (!cell.isRevealed && !cell.isMine) {
                    return false;
                }
            }
        }
        this.gameOver = true;
        console.log("Wygrana!");
        return true;
    }
    render() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        for (const row of this.board) {
            for (const cell of row) {
                const cellElement = document.createElement('div');
                cellElement.dataset.row = cell.row;
                cellElement.dataset.col = cell.col;
                cellElement.classList.add('cell');
                cellElement.addEventListener('contextmenu', (event) => {
                    event.preventDefault();
                    if(!cell.isRevealed){
                        cell.isFlagged = !cell.isFlagged;
                        this.render();
                    }
                });
                cellElement.addEventListener('click', () => {
                    this.handleClick(cell);
                });

                if (cell.isFlagged) {
                    cellElement.classList.add('flagged');
                }

                if (cell.isRevealed) {
                    cellElement.classList.add('revealed');
                    if (cell.isMine) {
                        cellElement.classList.add('mine');
                    } else if (cell.neighborMines > 0) {
                        cellElement.textContent = cell.neighborMines;
                        cellElement.classList.add('n' + cell.neighborMines);
                    }
                }
                
                gameBoard.appendChild(cellElement);
            }
        }
        const statusElement = document.getElementById('game-status');
        if (this.gameOver) {
            if (this.isWin) {
                statusElement.textContent = "Congratulations, you Win!";
                statusElement.style.color = 'green';
            } else {
                statusElement.textContent = "Game Over!";
                statusElement.style.color = 'red';
            }
        } else {
            statusElement.textContent = ""; 
        }
    }
    createMines(firstcell) { 
        let minesPlaced = 0;
        const safezone = [
            [firstcell.row-1, firstcell.col-1], [firstcell.row-1, firstcell.col], [firstcell.row-1, firstcell.col+1],
            [firstcell.row, firstcell.col-1],    [firstcell.row, firstcell.col],   [firstcell.row,firstcell.col+1],
            [firstcell.row+1, firstcell.col-1], [firstcell.row+1, firstcell.col], [firstcell.row+1,firstcell.col+1],
        ];
        
        while (minesPlaced < this.minesCount) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);  
            const cell = this.board[row][col];
            
            if (!cell.isMine){
                if (!safezone.some(safezone => safezone[0] === row && safezone[1] === col)) {
                    cell.isMine = true;
                    minesPlaced++;
                }
                
                
            }
        }

    }
    calculateNeighborMines() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.board[r][c];
                if (!cell.isMine) {
                    let neighborMines = 0;
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            const neighborRow = r + i;
                            const neighborCol = c + j;
                            if (neighborRow >= 0 && neighborRow < this.rows && neighborCol >= 0 && neighborCol < this.cols) {
                                const neighborCell = this.board[neighborRow][neighborCol];  
                                if (neighborCell.isMine) {
                                    neighborMines++;
                                }
                            }
                            
                        }
                    }
                cell.neighborMines = neighborMines;
                }
                
            }
        }
    }
    reset(){
        this.board = [];
        this.gameOver = false;
        this.isWin=false;
        this.firstClick = true;
        this.init();
    }
}
let game;
document.addEventListener('DOMContentLoaded', () => {

    const rows = 10;
    const cols = 10;
    const minesCount = 10;
    game = new Game(rows, cols, minesCount);
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
    
});
