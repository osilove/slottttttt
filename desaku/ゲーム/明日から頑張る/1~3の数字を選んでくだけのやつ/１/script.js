let total = 0;
let currentPlayer = 1;

const totalDisplay = document.getElementById('total');
const turnDisplay = document.getElementById('current-player');
const resultDisplay = document.getElementById('result');
const buttons = document.querySelectorAll('.option');

// ボタンを更新する関数
function updateButtons() {
  buttons.forEach(button => {
    const value = parseInt(button.getAttribute('data-value'), 10);
    // 合計が30を超える選択肢を無効化
    button.disabled = total + value > 30;
  });
}

// ボタンにクリックイベントを追加
buttons.forEach(button => {
  button.addEventListener('click', () => {
    const value = parseInt(button.getAttribute('data-value'), 10);

    // 合計を更新
    total += value;
    totalDisplay.textContent = total;

    // 合計が30を超えた場合の選択肢を無効化
    updateButtons();

    // 勝敗判定
    if (total === 30) {
      resultDisplay.textContent = `Player ${currentPlayer} が負けです！`;
      buttons.forEach(btn => (btn.disabled = true));
      return;
    }

    // ターン切り替え
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    turnDisplay.textContent = `Player ${currentPlayer}`;
  });
});

// 初期状態でボタンを更新
updateButtons();
