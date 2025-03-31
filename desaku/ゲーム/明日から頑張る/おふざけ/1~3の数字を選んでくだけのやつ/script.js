let total = 0;
let currentPlayer = 1;
let maxPlayers = 2;
let maxNumber = 30; // ゲームの最大数
let specialRulesEnabled = false;
let playerNames = [];
let negativeMovesRemaining = [];
let currentSpecialMove = 0;

const totalDisplay = document.getElementById('total');
const turnDisplay = document.getElementById('current-player');
const resultDisplay = document.getElementById('result');
const buttons = document.querySelectorAll('.option');
const startButton = document.getElementById('start-game');
const settingsForm = document.getElementById('settings');
const gameContainer = document.getElementById('game');
const negativeButton = document.getElementById('negative-button');
const negativeCountDisplay = document.getElementById('negative-count');
const restartButton = document.getElementById('restart-button');
const negativeButtonsContainer = document.getElementById('negative-buttons-container');
const gameTitle = document.getElementById('game-title'); // ゲームタイトルの要素

// ゲーム設定を読み取る
startButton.addEventListener('click', () => {
  maxPlayers = parseInt(document.getElementById('max-players').value, 10);
  maxNumber = parseInt(document.getElementById('max-number').value, 10);
  specialRulesEnabled = document.getElementById('special-rules').checked;

  playerNames.push(document.getElementById('player1-name').value || 'Player 1');
  playerNames.push(document.getElementById('player2-name').value || 'Player 2');

  // AIを追加する
  for (let i = playerNames.length; i < maxPlayers; i++) {
    playerNames.push(`AI ${i - 1}`);
  }

  // マイナスボタンの回数設定
  negativeMovesRemaining = new Array(maxPlayers).fill(3);

  settingsForm.style.display = 'none';
  gameContainer.style.display = 'block';
  restartButton.style.display = 'inline-block'; // ゲーム進行中も再スタートボタンを表示

  updateButtons();
  updateTurn();
  updateNegativeButtons();

  // タイトルを更新
  gameTitle.textContent = `${maxNumber}を超えたら負けのゲーム`; // 最大数に合わせてタイトルを変更

  // 合計を初期化
  resetGame();

  // AIのターンを開始
  aiTurn();
});

// スタートに戻るボタンのクリックイベント
restartButton.addEventListener('click', () => {
  resetGame();
  settingsForm.style.display = 'block';
  gameContainer.style.display = 'none';
  restartButton.style.display = 'none'; // ゲーム開始時は再スタートボタンを非表示にする
});

// ボタンの更新
function updateButtons() {
  buttons.forEach(button => {
    const value = parseInt(button.getAttribute('data-value'), 10);
    // AIのターンの時はプレイヤー用のボタンを無効化
    if (currentPlayer > 2) {
      button.disabled = true; // AIターン中にプレイヤーが操作できないようにする
    } else {
      button.disabled = total + value > maxNumber; // プレイヤーが操作する場合
    }
  });
}

// マイナスボタンの更新
function updateNegativeButtons() {
  if (specialRulesEnabled) {
    if (currentPlayer > 2) {
      negativeButton.disabled = true; // AIターン中はプレイヤーがマイナスボタンを使用できないようにする
    } else {
      negativeButton.disabled = negativeMovesRemaining[currentPlayer - 1] <= 0;
    }
    negativeButtonsContainer.style.display = 'block';
  } else {
    negativeButtonsContainer.style.display = 'none';
  }

  // 残り回数を表示
  negativeCountDisplay.textContent = negativeMovesRemaining[currentPlayer - 1];
}

// ボタンのクリックイベント処理
buttons.forEach(button => {
  button.addEventListener('click', () => {
    if (currentPlayer <= 2) {  // プレイヤーのみが操作可能
      playTurn(parseInt(button.getAttribute('data-value'), 10));
    }
  });
});

// マイナスボタンのクリックイベント
negativeButton.addEventListener('click', () => {
  if (currentPlayer <= 2 && negativeMovesRemaining[currentPlayer - 1] > 0) {  // プレイヤーのターンのみ
    const negativeValue = prompt('マイナス値を入力: -1 または -2');
    if (negativeValue === '-1' || negativeValue === '-2') {
      total += parseInt(negativeValue, 10); // 合計を減らす
      totalDisplay.textContent = total;
      negativeMovesRemaining[currentPlayer - 1]--; // 使用回数を減らす
      updateNegativeButtons(); // ボタン状態を更新

      // 勝敗判定
      if (total === maxNumber) {
        resultDisplay.textContent = `${playerNames[currentPlayer - 1]} が負けです！`;
        buttons.forEach(btn => btn.disabled = true);
        restartButton.style.display = 'inline-block'; // 終了後に再スタートボタンを表示
        return;
      }

      // ターン切り替え
      currentPlayer = currentPlayer === maxPlayers ? 1 : currentPlayer + 1;
      updateTurn();
    } else {
      alert('無効な値です。-1 または -2 を選んでください。');
    }
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === '1') {
    playTurn(1);
  } else if (event.key === '2') {
    playTurn(2);
  } else if (event.key === '3') {
    playTurn(3);
  } else if (event.key === ' ' && !event.repeat) { // スペースキーで再スタート
    if (total === maxNumber) {
      resetGame();
      settingsForm.style.display = 'block';
      gameContainer.style.display = 'none';
      restartButton.style.display = 'none'; // ゲーム開始時は再スタートボタンを非表示にする
    } else {
      playTurn(1); // ゲーム進行
    }
  } else if (event.key === 'Escape') { // 設定画面に戻る
    resetGame();
    settingsForm.style.display = 'block';
    gameContainer.style.display = 'none';
    restartButton.style.display = 'none'; // ゲーム開始時は再スタートボタンを非表示にする
  }
});

// ゲームをリセットする関数
function resetGame() {
  total = 0; // 合計を0にリセット
  totalDisplay.textContent = total; // 合計の表示も更新
  resultDisplay.textContent = ''; // 結果の表示をクリア
  currentPlayer = 1; // プレイヤーを1にリセット
  updateTurn();
  updateButtons();
}

// プレイヤーのターン処理
function playTurn(value) {
  if (total + value > maxNumber) return; // 合計が超えてしまう場合は処理しない

  total += value;
  totalDisplay.textContent = total;

  // 勝敗判定
  if (total === maxNumber) {
    resultDisplay.textContent = `${playerNames[currentPlayer - 1]} が負けです！`;
    buttons.forEach(btn => btn.disabled = true);
    restartButton.style.display = 'inline-block'; // 終了後に再スタートボタンを表示
    return;
  }

  // ターン切り替え
  currentPlayer = currentPlayer === maxPlayers ? 1 : currentPlayer + 1;
  updateTurn();

  // AIターンの場合は次のターンへ自動で移行
  aiTurn();
}

// AIターン
function aiTurn() {
  if (currentPlayer > 2) {
    setTimeout(() => {
      // AIがランダムな1~3の値を選んでボタンを押す
      const aiChoice = Math.floor(Math.random() * 3) + 1;

      // AIがマイナスボタンを使うか判断
      if (specialRulesEnabled && negativeMovesRemaining[currentPlayer - 1] > 0 && Math.random() < 0.5) {
        negativeButton.click(); // 50%の確率でマイナスボタンを使用
      }

      // AIターンを実行
      playTurn(aiChoice);
    }, 1000); // 1秒遅延させてAIの動きを人間っぽくする
  }
}

// ターンを更新
function updateTurn() {
  turnDisplay.textContent = `${playerNames[currentPlayer - 1]} のターン`;
  updateNegativeButtons();
}
