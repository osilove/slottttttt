const images = [];
for (let i = 1; i <= 25; i++) {
    images.push(`../神経衰弱/card${i}.png`);
}

const gameBoard = document.getElementById("game-board");
const statusLabel = document.getElementById("status");
const resetButton = document.getElementById("reset-button");
const themeButton = document.getElementById("theme-button");

let cardIds = [];
let flippedCards = [];
let pairsFound = 0;
let clickable = false;
let darkTheme = false;
let db;

// IndexedDB 初期化
const request = indexedDB.open('MemoryGameDB', 1);

request.onupgradeneeded = function (e) {
    db = e.target.result;
    if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
    }
};

request.onsuccess = function (e) {
    db = e.target.result;
    loadTheme();
    initGame();
};

request.onerror = function (e) {
    console.error('IndexedDB エラー', e);
};

function initGame() {
    cardIds = [...Array(25).keys(), ...Array(25).keys()];
    shuffleArray(cardIds);
    pairsFound = 0;
    flippedCards = [];
    clickable = false;
    statusLabel.textContent = "ペアを見つけた数: 0";

    gameBoard.innerHTML = '';
    createCards();

    setTimeout(hideAllCards, 1000);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createCards() {
    cardIds.forEach(id => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.id = id;

        const cardInner = document.createElement("div");
        cardInner.classList.add("card-inner");

        const cardFront = document.createElement("div");
        cardFront.classList.add("card-face", "card-front");

        const cardBack = document.createElement("div");
        cardBack.classList.add("card-face", "card-back");

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);
        
        card.addEventListener("click", () => revealCard(card));

        gameBoard.appendChild(card);
    });
}

function revealCard(card) {
    if (!clickable || card.classList.contains('flipped')) return;

    const cardId = card.dataset.id;
    card.classList.add('flipped');
    
    const cardBack = card.querySelector('.card-back');
    cardBack.style.backgroundImage = `url(${images[cardId]})`;
    
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        clickable = false;
        setTimeout(() => checkMatch(), 1000);
    }
}

function checkMatch() {
    const [firstCard, secondCard] = flippedCards;
    const firstId = firstCard.dataset.id;
    const secondId = secondCard.dataset.id;

    if (firstId === secondId) {
        pairsFound++;
        statusLabel.textContent = `ペアを見つけた数: ${pairsFound}`;
        flippedCards = [];
        clickable = true;

        if (pairsFound === 25) {
            alert("おめでとう! 全てのペアを見つけました!");
        }
    } else {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        flippedCards = [];
        clickable = true;
    }
}

function hideAllCards() {
    document.querySelectorAll(".card").forEach(card => {
        card.classList.remove('flipped');
        card.querySelector('.card-back').style.backgroundImage = '';
    });
    clickable = true;
}

function toggleTheme() {
    darkTheme = !darkTheme;
    document.body.classList.toggle("dark-theme", darkTheme);
    saveTheme(darkTheme);
}

function saveTheme(themeValue) {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    store.put({ key: 'darkTheme', value: themeValue });
}

function loadTheme() {
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const getReq = store.get('darkTheme');

    getReq.onsuccess = () => {
        if (getReq.result) {
            darkTheme = getReq.result.value;
            document.body.classList.toggle("dark-theme", darkTheme);
        }
    };
}

resetButton.addEventListener("click", initGame);
themeButton.addEventListener("click", toggleTheme);

// ESCキーで戻る
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        window.location.href = "../サイト/desaku.html";
    }
});
