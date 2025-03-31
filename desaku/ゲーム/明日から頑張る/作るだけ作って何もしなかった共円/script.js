let boardSize = 9; // 初期盤面サイズ
const board = document.getElementById("board");
const message = document.getElementById("message");
const boardSizeInput = document.getElementById("board-size");
const boardSizeValue = document.getElementById("board-size-value");
const resetButton = document.getElementById("reset-game");

let currentPlayer = "black"; // 現在のプレイヤー
let stones = []; // 石の配置を記録

// 碁盤を生成
function createBoard(size) {
    // 盤面の初期化
    board.innerHTML = "";
    board.style.gridTemplateColumns = `repeat(${size}, 30px)`;
    stones = Array.from({ length: size }, () => Array(size).fill(null));

    // 盤面の生成
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.x = x;
            cell.dataset.y = y;
            board.appendChild(cell);

            cell.addEventListener("click", () => placeStone(x, y, cell));
        }
    }
}

// 石を置く処理
function placeStone(x, y, cell) {
    if (stones[y][x] !== null || message.textContent !== "") return;

    // 石を配置
    const stone = document.createElement("div");
    stone.classList.add("stone", currentPlayer);
    cell.appendChild(stone);
    cell.classList.add("taken");
    stones[y][x] = currentPlayer;

    // 共円のチェック
    if (checkForCircle(x, y)) {
        message.textContent = "共円だよwww";
        board.style.pointerEvents = "none"; // 盤面を操作不可に
        return;
    }

    // 次のプレイヤーに交代
    currentPlayer = currentPlayer === "black" ? "white" : "black";
}

// 共円を検出
function checkForCircle(x, y) {
    const points = [];

    // 現在の石の位置を収集
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (stones[row][col] !== null) {
                points.push([col, row]);
            }
        }
    }

    // 任意の4点で円が作れるかをチェック
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            for (let k = j + 1; k < points.length; k++) {
                for (let l = k + 1; l < points.length; l++) {
                    if (isCircle(points[i], points[j], points[k], points[l])) {
                        return true; // 共円が検出された
                    }
                }
            }
        }
    }
    return false;
}





// 4点が円を形成するかを判定
function isCircle(p1, p2, p3, p4) {
    const [x1, y1] = p1;
    const [x2, y2] = p2;
    const [x3, y3] = p3;
    const [x4, y4] = p4;

    // 行列式を用いて同一円周上にあるかを判定
    const det = (x1 * x1 + y1 * y1) * det3x3(x2, y2, x3, y3, x4, y4)
              - (x2 * x2 + y2 * y2) * det3x3(x1, y1, x3, y3, x4, y4)
              + (x3 * x3 + y3 * y3) * det3x3(x1, y1, x2, y2, x4, y4)
              - (x4 * x4 + y4 * y4) * det3x3(x1, y1, x2, y2, x3, y3);
    return Math.abs(det) < 1e-6;
}

// 3x3行列式を計算
function det3x3(x1, y1, x2, y2, x3, y3) {
    return x1 * (y2 - y3) - x2 * (y1 - y3) + x3 * (y1 - y2);
}

// 盤面サイズ変更イベント
boardSizeInput.addEventListener("input", () => {
    boardSize = parseInt(boardSizeInput.value);
    boardSizeValue.textContent = boardSize;
    message.textContent = ""; // メッセージをクリア
    board.style.pointerEvents = ""; // 盤面操作を可能に
    currentPlayer = "black"; // 初期プレイヤーに戻す
    createBoard(boardSize); // 新しい盤面を生成
});

// ゲームを初期化
function resetGame() {
  message.textContent = ""; // メッセージをクリア
  board.style.pointerEvents = ""; // 盤面操作を可能に
  currentPlayer = "black"; // 初期プレイヤーに戻す
  createBoard(boardSize); // 新しい盤面を生成
}

// 初期化ボタンのイベントリスナー
resetButton.addEventListener("click", resetGame);

// 初期化
boardSizeValue.textContent = boardSize;
createBoard(boardSize);

