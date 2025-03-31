let secretNumber = Math.floor(Math.random() * 1000) + 1;
let attempts = 0;

document.getElementById('guess-button').addEventListener('click', () => {
    const guessInput = document.getElementById('guess-input');
    const guessMessage = document.getElementById('guess-message');
    const guess = Number(guessInput.value);
    attempts++;

    if (guess < secretNumber) {
        guessMessage.textContent = "もっと大きな数です！";
    } else if (guess > secretNumber) {
        guessMessage.textContent = "もっと小さな数です！";
    } else {
        guessMessage.textContent = `正解です！${secretNumber}を当てました！試行回数は${attempts}回でした。`;
        startSlotMachine();
    }
});

function startSlotMachine() {
    document.getElementById('guess-section').style.display = 'none';
    document.getElementById('slot-machine').style.display = 'block';
}

document.getElementById('spin-button').addEventListener('click', () => {
    const slots = [document.getElementById('slot1'), document.getElementById('slot2'), document.getElementById('slot3')];
    const symbols = ['../画像/cherry.png', '../画像/lemon.png', '../画像/orange.png']; // 画像ファイル名
    
    let spinCount = 20;
    const spinInterval = setInterval(() => {
        slots.forEach(slot => {
            slot.src = symbols[Math.floor(Math.random() * symbols.length)];
        });
        
        if (--spinCount <= 0) {
            clearInterval(spinInterval);
            showFinalResult(slots.map(slot => slot.src));
        }
    }, 100);
});

function showFinalResult(finalSlots) {
    const slotMessage = document.getElementById('slot-message');
    if (finalSlots[0] === finalSlots[1] && finalSlots[1] === finalSlots[2]) {
        slotMessage.textContent = "おめでとう！ジャックポット!";
    } else {
        slotMessage.textContent = "もう一度挑戦してみてください。";
    }
}

 // ESCキーでサイトに戻る
 window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        window.location.href = "../サイト/desaku.html";
    }
});