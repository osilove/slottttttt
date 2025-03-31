document.addEventListener('DOMContentLoaded', () => {
    const resultText = document.getElementById('result-text');
    const statsText = document.getElementById('stats');
    const singleGachaButton = document.getElementById('single-gacha-button');
    const tenGachaButton = document.getElementById('ten-gacha-button');
    const setProbabilitiesButton = document.getElementById('set-probabilities');
    
    const puProbabilityInput = document.getElementById('pu-probability');
    const skipProbabilityInput = document.getElementById('skip-probability');

    // 初期値
    let puProbability = 0.007; // 初期のPUキャラ確率 0.7%
    let skipProbability = 0.003; // 初期のすり抜け確率 0.3%
    const failureProbability = 0.99; // 外れの確率 99%

    // ガチャ結果のリスト
    const results = {
        pu: 'PUキャラ!!🍋',
        skip: 'すり抜け🦔',
        failure: '外れ'
    };

    // カウンタ
    let totalCount = 0;
    let puCount = 0;
    let skipCount = 0;

    // ランダムなガチャ結果を取得する関数
    const getGachaResult = () => {
        const randomValue = Math.random();
        if (randomValue < puProbability) {
            puCount++;
            return results.pu;
        } else if (randomValue < puProbability + skipProbability) {
            skipCount++;
            return results.skip;
        } else {
            return results.failure;
        }
    };

    // 統計を更新する関数
    const updateStats = () => {
        statsText.textContent = `回数: ${totalCount}回, PUキャラ🍋: ${puCount}回, すり抜け🦔: ${skipCount}回`;
    };

    // 確率を設定する関数
    const setProbabilities = () => {
        const newPuProbability = parseFloat(puProbabilityInput.value) / 100;
        const newSkipProbability = parseFloat(skipProbabilityInput.value) / 100;

        if (!isNaN(newPuProbability) && !isNaN(newSkipProbability)) {
            puProbability = newPuProbability;
            skipProbability = newSkipProbability;
            // 外れの確率は残りで計算
            const remainingFailureProbability = 1 - (puProbability + skipProbability);
            if (remainingFailureProbability < 0) {
                alert("確率の合計が100%を超えています。");
                return;
            }
            // 更新された確率の確認
            alert(`PUキャラの確率: ${puProbability * 100}%\nすり抜けの確率: ${skipProbability * 100}%\n外れの確率: ${remainingFailureProbability * 100}%`);
        } else {
            alert("確率を正しく入力してください。");
        }
    };

    // 確率設定ボタンがクリックされた時の処理
    setProbabilitiesButton.addEventListener('click', setProbabilities);

    // 単発ガチャを引く処理
    singleGachaButton.addEventListener('click', () => {
        totalCount++;
        resultText.innerHTML = getGachaResult();
        updateStats();
    });

    // 10連ガチャを引く処理
    tenGachaButton.addEventListener('click', () => {
        const tenResults = Array.from({ length: 10 }, getGachaResult);
        resultText.innerHTML = tenResults.map(result => `<p>${result}</p>`).join('');
        totalCount += 10;
        updateStats();
    });
});

 // ESCキーでサイトに戻る
 window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        window.location.href = "../サイト/desaku.html";
    }
});