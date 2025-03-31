let playerScore = 0;
let dealerScore = 0;
let playerCards = [];
let dealerCards = [];
let deck = [];

const playerScoreElement = document.getElementById('player-score');
const dealerScoreElement = document.getElementById('dealer-score');
const playerCardsElement = document.getElementById('player-cards');
const dealerCardsElement = document.getElementById('dealer-cards');
const resultElement = document.getElementById('result');

const gameButton = document.getElementById('game-button');
const standButton = document.getElementById('stand');

let gameStarted = false; // ゲームが開始されたかどうか

// トランプのデッキを作成
function createDeck() {
    for (let i = 1; i <= 13; i++) {
        deck.push(i); // 1～13までの数字
        deck.push(i);
        deck.push(i);
        deck.push(i);
    }
}

// シャッフル
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// カードを引く
function drawCard() {
    const card = deck.pop();
    return card;
}

// スコア計算
function calculateScore(cards) {
    let score = 0;
    let aceCount = 0;

    for (let card of cards) {
        if (card > 10) {
            score += 10; // 11, 12, 13 は 10 とみなす
        } else if (card === 1) {
            score += 11; // エースは最初11として扱う
            aceCount++;
        } else {
            score += card;
        }
    }

    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }

    return score;
}

// カードの表示（プレイヤー・ディーラー両方）
function displayCards() {
    dealerCardsElement.innerHTML = `
        <div class="card">ディーラーの引いたカード:</div>
        ${dealerCards.map(card => `<div class="card">${card}</div>`).join('')}
    `;
    playerCardsElement.innerHTML = `
        <div class="card">プレイヤーの引いたカード:</div>
        ${playerCards.map(card => `<div class="card">${card}</div>`).join('')}
    `;
    playerScoreElement.textContent = playerScore;
    dealerScoreElement.textContent = dealerScore;
}

// ゲームのリセット
function resetGame() {
    deck = [];
    playerScore = 0;
    dealerScore = 0;
    playerCards = [];
    dealerCards = [];
    createDeck();
    shuffleDeck();
    gameStarted = false;
    gameButton.textContent = 'ゲームを開始する';
    standButton.disabled = true;
    resultElement.textContent = '';
    displayCards();
}

// ゲーム開始
function startGame() {
    resetGame();

    // プレイヤーとディーラーにカードを配る
    playerCards.push(drawCard(), drawCard());
    dealerCards.push(drawCard(), drawCard());

    playerScore = calculateScore(playerCards);
    dealerScore = calculateScore(dealerCards);

    gameStarted = true;
    gameButton.textContent = 'カードを引く';
    standButton.disabled = false;

    displayCards();
}

// プレイヤーがカードを引く
function playerDrawCard() {
    const card = drawCard();
    playerCards.push(card);
    playerScore = calculateScore(playerCards);
    displayCards();

    if (playerScore > 21) {
        resultElement.textContent = 'プレイヤーのバースト! ディーラーの勝ち!';
        endGame();
    }
}

// ディーラーがカードを引く
function dealerDrawCard() {
    while (dealerScore < 17) {
        const card = drawCard();
        dealerCards.push(card);
        dealerScore = calculateScore(dealerCards);
    }
    displayCards();
    determineWinner();
}

// 勝者判定
function determineWinner() {
    if (dealerScore > 21) {
        resultElement.textContent = 'ディーラーのバースト! プレイヤーの勝ち!';
    } else if (playerScore > dealerScore) {
        resultElement.textContent = 'プレイヤーの勝ち!';
    } else if (playerScore < dealerScore) {
        resultElement.textContent = 'ディーラーの勝ち!';
    } else {
        resultElement.textContent = '引き分け!';
    }
    endGame();
}

// ゲーム終了
function endGame() {
    gameButton.textContent = 'ゲームを開始する';
    standButton.disabled = true;
    gameStarted = false;
}

// ボタンの動作
gameButton.addEventListener('click', () => {
    if (!gameStarted) {
        startGame();
    } else {
        playerDrawCard();
    }
});

standButton.addEventListener('click', dealerDrawCard);
