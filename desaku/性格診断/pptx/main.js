// main.js

function updateScore(question, value) {
    // 現在のスコアを取得
    let score = parseInt(localStorage.getItem('score')) || 0;
    
    // 新しいスコアを加算
    score += value;
    
    // スコアをローカルストレージに保存
    localStorage.setItem('score', score);
}

function getScore() {
    return parseInt(localStorage.getItem('score')) || 0;
}

function clearScore() {
    localStorage.removeItem('score');
}

