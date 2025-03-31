import tkinter as tk
from tkinter import messagebox

# ゲームボードのサイズ
BOARD_SIZE = 8
# プレイヤーの定義
BLACK = 'black'
WHITE = 'white'

class OthelloGame:
    def __init__(self, root):
        self.root = root
        self.root.title("オセロゲーム")
        self.current_player = BLACK
        self.board = [[None for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]
        self.last_move = None

        # 初期配置
        center = BOARD_SIZE // 2 - 1
        self.board[center][center] = WHITE
        self.board[center][center + 1] = BLACK
        self.board[center + 1][center] = BLACK
        self.board[center + 1][center + 1] = WHITE

        self.create_widgets()

    def create_widgets(self):
        self.board_frame = tk.Frame(self.root)
        self.board_frame.pack()

        self.buttons = [[None for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]
        for row in range(BOARD_SIZE):
            for col in range(BOARD_SIZE):
                button = tk.Button(self.board_frame, width=5, height=2, command=lambda r=row, c=col: self.cell_click(r, c))
                button.grid(row=row, column=col)
                self.buttons[row][col] = button

        self.status_label = tk.Label(self.root, text=f"{self.current_player}の番です", font=('Arial', 16))
        self.status_label.pack()

        self.update_board()

    def cell_click(self, row, col):
        if self.board[row][col] is not None or not self.can_place_piece(row, col, self.current_player):
            return  # 置けない場所なら何もしない

        self.place_piece(row, col, self.current_player)

        # 次のターンで置ける場所があるか確認
        if not self.has_valid_moves(self.current_player):
            self.toggle_player()

            if not self.has_valid_moves(self.current_player):
                self.check_game_over()  # 両方とも置けない場合はゲーム終了
            else:
                messagebox.showinfo("ターンスキップ", f"{self.current_player}は置ける場所がありません。再度手番を行います。")

    def place_piece(self, row, col, player):
        self.board[row][col] = player
        self.flip_pieces(row, col, player)
        self.last_move = (row, col)
        self.toggle_player()
        self.update_board()

    def toggle_player(self):
        self.current_player = WHITE if self.current_player == BLACK else BLACK
        self.status_label.config(text=f"{self.current_player}の番です")

    def update_board(self):
        for row in range(BOARD_SIZE):
            for col in range(BOARD_SIZE):
                button = self.buttons[row][col]
                piece = self.board[row][col]

                if piece == BLACK:
                    button.config(bg="black")
                elif piece == WHITE:
                    button.config(bg="white")
                else:
                    button.config(bg="green")

                if self.can_place_piece(row, col, self.current_player):
                    button.config(bg='lightgreen')

    def flip_pieces(self, row, col, player):
        opponent = WHITE if player == BLACK else BLACK
        directions = [
            (-1, 0), (1, 0), (0, -1), (0, 1),
            (-1, -1), (-1, 1), (1, -1), (1, 1)
        ]

        for dx, dy in directions:
            x, y = row + dx, col + dy
            flip = []

            while 0 <= x < BOARD_SIZE and 0 <= y < BOARD_SIZE and self.board[x][y] == opponent:
                flip.append((x, y))
                x += dx
                y += dy

            if 0 <= x < BOARD_SIZE and 0 <= y < BOARD_SIZE and self.board[x][y] == player:
                for fx, fy in flip:
                    self.board[fx][fy] = player

    def can_place_piece(self, row, col, player):
        if self.board[row][col] is not None:
            return False

        opponent = WHITE if player == BLACK else BLACK
        directions = [
            (-1, 0), (1, 0), (0, -1), (0, 1),
            (-1, -1), (-1, 1), (1, -1), (1, 1)
        ]

        for dx, dy in directions:
            x, y = row + dx, col + dy
            has_opponent = False

            while 0 <= x < BOARD_SIZE and 0 <= y < BOARD_SIZE and self.board[x][y] == opponent:
                has_opponent = True
                x += dx
                y += dy

            if has_opponent and 0 <= x < BOARD_SIZE and 0 <= y < BOARD_SIZE and self.board[x][y] == player:
                return True

        return False

    def has_valid_moves(self, player):
        for row in range(BOARD_SIZE):
            for col in range(BOARD_SIZE):
                if self.can_place_piece(row, col, player):
                    return True
        return False

    def check_game_over(self):
        black_count = sum(row.count(BLACK) for row in self.board)
        white_count = sum(row.count(WHITE) for row in self.board)

        if black_count > white_count:
            messagebox.showinfo("ゲーム終了", f"ゲーム終了！黒の勝ち ({black_count} 対 {white_count})")
        elif white_count > black_count:
            messagebox.showinfo("ゲーム終了", f"ゲーム終了！白の勝ち ({white_count} 対 {black_count})")
        else:
            messagebox.showinfo("ゲーム終了", f"ゲーム終了！引き分け ({black_count} 対 {white_count})")


if __name__ == "__main__":
    root = tk.Tk()
    game = OthelloGame(root)
    root.mainloop()
