import random
class Cell:
    """
    Represents a single cell on the game board.
    """
    def __init__(self, row: int, col: int):
        self.row = row
        self.col = col
        self.is_mine = False
        self.is_revealed = False
        self.is_flagged = False
        self.neighbor_mines = 0

class Board:
    """
    Represents the game board, containing all cells and game state.
    """
    def __init__(self, rows: int, cols: int, mines: int):
        self.rows = rows
        self.cols = cols
        self.mines = mines
        self.grid = []  # Odpowiednik pustej tablicy this.board z JS
        self.game_over = False
        self.is_win = False
        self.first_click = True

    def setup_board(self):
        """
        Initializes the board, places mines, and calculates neighbor values.
        """
        for r in range(self.rows):
            row = []
            for c in range(self.cols):
                cell = Cell(r, c)
                row.append(cell)
            self.grid.append(row)
    def place_mines(self, first_cell: 'Cell'):
        """
        Places mines randomly on the board.
        """
        mines_placed = 0
        safezone = [
            [first_cell.row-1, first_cell.col-1], [first_cell.row-1, first_cell.col], [first_cell.row-1, first_cell.col+1],
            [first_cell.row, first_cell.col-1],    [first_cell.row, first_cell.col],   [first_cell.row,first_cell.col+1],
            [first_cell.row+1, first_cell.col-1], [first_cell.row+1, first_cell.col], [first_cell.row+1,first_cell.col+1],
        ]
        

        while mines_placed < self.mines:
            r = random.randint(0, self.rows - 1)
            c = random.randint(0, self.cols - 1)
            cell = self.grid[r][c]
            if not cell.is_mine and [cell.row,cell.col] not in safezone:
                cell.is_mine = True
                mines_placed += 1

    def calculate_neighbors(self):
        """
        Calculates the number of neighboring mines for each cell.
        """
        for r in range(self.rows):
            for c in range(self.cols):
                cell = self.grid[r][c]
                if not cell.is_mine:
                    mines_count = 0
                    for i in range(-1, 2):
                        for j in range(-1, 2):
                            # Pomiń samą komórkę
                            if i == 0 and j == 0:
                                continue
                            # Sprawdź granice PRZED dostępem do siatki
                            if 0 <= r + i < self.rows and 0 <= c + j < self.cols:
                                neighbor_cell = self.grid[r + i][c + j]
                                if neighbor_cell.is_mine:
                                    mines_count += 1
                    cell.neighbor_mines = mines_count
    def reveal_empty_neighbors(self, row: int, col: int):
        """
        Recursively reveals neighboring cells if the selected cell is empty.
        """
        for i in range(-1, 2):
            for j in range(-1, 2):
                # Pomiń samą komórkę
                if i == 0 and j == 0:
                    continue
                # Sprawdź granice PRZED dostępem do siatki
                if 0 <= row + i < self.rows and 0 <= col + j < self.cols:
                    neighbor_cell = self.grid[row + i][col + j]
                    if not neighbor_cell.is_revealed and not neighbor_cell.is_flagged:
                        self.reveal_cell(row + i, col + j)

    def reveal_cell(self, row: int, col: int):
        """
        Reveals a cell and handles the game logic for that action.
        """
        cell = self.grid[row][col]

        # Jeśli gra się skończyła, pole ma flagę lub jest już odkryte - nic nie robimy
        if self.game_over or cell.is_flagged or cell.is_revealed:
            return

        # Obsługa pierwszego kliknięcia
        if self.first_click:
            self.place_mines(cell)
            self.calculate_neighbors()
            self.first_click = False

        # Odkryj komórkę - to musi być zrobione PRZED rekurencyjnym wywołaniem!
        cell.is_revealed = True

        # Sprawdzenie, czy to mina - koniec gry
        if cell.is_mine:
            self.game_over = True
            return # Zakończ grę, nie ma sensu sprawdzać wygranej

        # Jeśli pole jest puste, odkryj sąsiadów (flood fill)
        elif cell.neighbor_mines == 0:
            self.reveal_empty_neighbors(row, col)

        # Po każdym ruchu sprawdzamy, czy gracz wygrał
        self.check_win_condition()

    def flag_cell(self, row: int, col: int):
        """
        Toggles a flag on a cell.
        """
        cell = self.grid[row][col]

        # Jeśli gra się skończyła lub pole jest już odkryte - nic nie robimy
        if self.game_over or cell.is_revealed or self.first_click:
            return

        # Przełączamy stan flagi (jeśli była, to znika; jeśli nie było, to się pojawia)
        cell.is_flagged = not cell.is_flagged

    def check_win_condition(self):
        """
        Checks if all non-mine cells have been revealed.
        """
        for row in self.grid:
            for cell in row:
                # Jeśli znajdziemy komórkę, która nie jest miną I nie jest odkryta,
                # to gra na pewno jeszcze się nie skończyła.
                if not cell.is_mine and not cell.is_revealed:
                    return  # Koniec sprawdzania, gramy dalej

        # Jeśli pętla przeszła, to znaczy, że gracz wygrał.
        self.is_win = True
        self.game_over = True