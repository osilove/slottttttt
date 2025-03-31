let total = 0;
let currentPlayer = 1;
let maxPlayers = 1;
let aiPlayers = 0;
let maxNumber = 30;  // ゲームの最大数
let specialRulesEnabled = false;
let playerNames = [];
let negativeMovesRemaining = []; // プレイヤーおよびAIごとのマイナス回数を管理

const totalDisplay = document.getElementById('total');
const turnDisplay = document.getElementById('current-player');
const resultDisplay = document.getElementById('result');
const startButton = document.getElementById('start-game');
const settingsForm = document.getElementById('settings');
const gameContainer = document.getElementById('game');
const restartButton = document.getElementById('restart-button');
const maxNumberInput = document.getElementById('max-number');
const playerLimitWarning = document.getElementById('player-limit-warning');
const insufficientPlayersWarning = document.getElementById('insufficient-players-warning');
const maxPlayersInput = document.getElementById('max-players');
const aiPlayersInput = document.getElementById('ai-players');
const negativeButtons = document.querySelectorAll('.option.negative');
const player1Input = document.getElementById('player1-name');
const player2Input = document.getElementById('player2-name');
const playerNamesContainer = document.getElementById('player-names-container');
const allButtons = document.querySelectorAll('.option'); // すべてのボタンを取得
const negativeCountDisplay = document.getElementById('negative-count'); // 残り回数の表示部分

// プレイヤー数を変更したときに名前入力フィールドを動的に追加/削除
maxPlayersInput.addEventListener('change', updatePlayerNameFields);
aiPlayersInput.addEventListener('change', validatePlayerSettings);

// プレイヤー数に応じて名前入力フィールドを更新
function updatePlayerNameFields() {
  const numberOfPlayers = parseInt(maxPlayersInput.value, 10);

  // プレイヤー数が1の場合、AIプレイヤーを1人に設定
  if (numberOfPlayers === 1) {
    aiPlayersInput.value = 1;  // AIプレイヤーを自動で1人に設定
    aiPlayers = 1;  // AIプレイヤー数を1に設定
  } else {
    aiPlayersInput.value = 0;  // プレイヤー数が1でない場合、AIプレイヤー数を0に設定
    aiPlayers = 0;
  }

  // プレイヤー名のフィールドをリセット
  playerNamesContainer.innerHTML = '';

  // 1人以上のプレイヤー名入力フィールドを追加
  for (let i = 0; i < numberOfPlayers; i++) {
    const playerInput = document.createElement('input');
    playerInput.type = 'text';
    playerInput.id = `player${i + 1}-name`;
    playerInput.placeholder = `Player ${i + 1}の名前`;
    playerNamesContainer.appendChild(playerInput);
  }

  // 設定の確認
  validatePlayerSettings();
}

// プレイヤー数とAI数の合計をチェック
function validatePlayerSettings() {
  const totalPlayers = parseInt(maxPlayersInput.value, 10) + parseInt(aiPlayersInput.value, 10);

  // プレイヤーとAIの合計が6を超えないか確認
  if (totalPlayers > 6) {
    playerLimitWarning.style.display = 'block';
    return false;
  } else {
    playerLimitWarning.style.display = 'none';
  }

  // プレイヤーとAIの合計が2人以上あるか確認
  if (totalPlayers < 2) {
    insufficientPlayersWarning.style.display = 'block';
    return false;
  } else {
    insufficientPlayersWarning.style.display = 'none';
  }

  return true;
}

// 設定入力の変更イベントを監視
aiPlayersInput.addEventListener('input', validatePlayerSettings);

// ゲーム設定を読み取る
startButton.addEventListener('click', () => {
  if (!validatePlayerSettings()) {
    alert('設定を確認してください。');
    return;
  }

  maxPlayers = parseInt(maxPlayersInput.value, 10);
  aiPlayers = parseInt(aiPlayersInput.value, 10);
  maxNumber = parseInt(maxNumberInput.value, 10);  // ゲームの最大数を更新

  // プレイヤー名を取得
  playerNames = [];
  for (let i = 0; i < maxPlayers; i++) {
    const playerNameInput = document.getElementById(`player${i + 1}-name`);
    playerNames.push(playerNameInput.value.trim() || `Player ${i + 1}`);
  }

  // 各プレイヤーおよびAIにマイナス回数を設定 (初期値3回)
  negativeMovesRemaining = new Array(playerNames.length).fill(3); // 初期設定で各プレイヤー/AIに3回のマイナス回数

  // ゲームタイトルの最大数を反映
  document.getElementById('game-title').textContent = `${maxNumber} を超えたら負けのゲーム`;

  // 特殊ルールが有効かどうかを取得
  specialRulesEnabled = document.getElementById('special-rules').checked;

  settingsForm.style.display = 'none';
  gameContainer.style.display = 'block';
  resetGame();
  updateButtons();
});

// スタートに戻るボタンのクリックイベント
restartButton.addEventListener('click', () => {
  resetGame();
  settingsForm.style.display = 'block';
  gameContainer.style.display = 'none';
});

// ゲームのリセット
function resetGame() {
  total = 0;
  currentPlayer = 1;
  negativeMovesRemaining = new Array(playerNames.length).fill(3); // 各プレイヤーおよびAIのマイナス回数をリセット
  totalDisplay.textContent = total;
  resultDisplay.textContent = '';
  updateTurn();
  updateButtons();
}

// 現在のターン情報を更新
function updateTurn() {
  turnDisplay.textContent = `${playerNames[currentPlayer - 1]} のターン`;
  updateNegativeCountDisplay(); // 残り回数を更新
}

// ボタンの更新
function updateButtons() {
  allButtons.forEach(button => {
    const value = parseInt(button.getAttribute('data-value'), 10);

    // 現在の合計が3未満のとき、マイナスボタンを無効化
    if (total < 3) {
      document.getElementById('negative-button').disabled = true;
    } else {
      document.getElementById('negative-button').disabled = false;
    }

    button.disabled = total + value > maxNumber || (value < 0 && negativeMovesRemaining[currentPlayer - 1] <= 0);

    // 特殊ルールが無効ならマイナスボタンを非表示
    if (value < 0) {
      button.style.display = specialRulesEnabled ? 'inline-block' : 'none';
    }
  });
}

// 残り回数を表示/非表示
function updateNegativeCountDisplay() {
  if (specialRulesEnabled) {
    negativeCountDisplay.style.display = 'inline-block';
    negativeCountDisplay.textContent = `残り回数: ${negativeMovesRemaining[currentPlayer - 1]}`;
  } else {
    negativeCountDisplay.style.display = 'none'; // 特殊ルールが無効な場合、非表示
  }
}

// クリックイベントの設定
document.getElementById('negative-button').addEventListener('click', () => {
  // 数値入力を促すalert()メソッド
  const inputValue = prompt("使用するマイナス値を入力してください (-1 または -2):");

  // キャンセル時は何も処理しない
  if (inputValue === null) {
    return;  // キャンセルの場合は何も実行しない
  }

  // 入力された数値をチェック
  if (inputValue === '-1' || inputValue === '-2') {
    // 使用回数を減らす
    negativeMovesRemaining[currentPlayer - 1] = Math.max(negativeMovesRemaining[currentPlayer - 1] - 1, 0);
    updateNegativeCountDisplay();
  } else {
    alert("無効な数値です");
  }
});

// クリックイベントの設定
allButtons.forEach(button => {
  button.addEventListener('click', () => {
    const value = parseInt(button.getAttribute('data-value'), 10);
    total += value;

    // 特殊ボタン（負の値）の処理
    if (value < 0) {
      // 現在のプレイヤーのマイナス回数を減らす
      negativeMovesRemaining[currentPlayer - 1] = Math.max(negativeMovesRemaining[currentPlayer - 1] - 1, 0); // 使用回数が0未満にならないように
    }

    totalDisplay.textContent = total;
    updateButtons();
    updateNegativeCountDisplay(); // 残り回数の更新

    // 勝敗判定
    if (total === maxNumber) {
      resultDisplay.textContent = `${playerNames[currentPlayer - 1]} が負けです！`;
      allButtons.forEach(btn => (btn.disabled = true));
      return;
    }

    // ターンの切り替え
    currentPlayer = currentPlayer === maxPlayers + aiPlayers ? 1 : currentPlayer + 1;
    updateTurn();
  });
});
