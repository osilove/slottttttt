document.addEventListener('DOMContentLoaded', () => {
    const updateDateTime = () => {
        const currentDate = new Date();
        const dateString = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日 ${currentDate.getHours()}時${currentDate.getMinutes()}分${currentDate.getSeconds()}秒`;
        document.getElementById('current-date').textContent = `日付: ${dateString}`;
    };

    // 1秒ごとに時間を更新
    setInterval(updateDateTime, 1000);

    const ctx = document.getElementById('gacha-chart').getContext('2d');
    let chart;

    // ローカルストレージに名前ごとのガチャ運データを保存
    const getGachaData = (name) => {
        const today = new Date().toISOString().slice(0, 10); // 今日の日付（YYYY-MM-DD）
        const storedData = localStorage.getItem(`gachaData_${name}`);

        // 保存されているデータがあり、かつ日付が一致する場合、そのデータを返す
        if (storedData) {
            const { date, data } = JSON.parse(storedData);
            if (date === today) {
                return data;
            }
        }

        // データが保存されていないか、日付が違う場合は新しいデータを生成
        const newData = generateRandomData(today);
        localStorage.setItem(`gachaData_${name}`, JSON.stringify({
            date: today,
            data: newData
        }));
        return newData;
    };

    // ランダムなガチャ運データを生成
    const generateRandomData = (seed) => {
        const randomValue = (seed, index) => {
            const random = Math.random() * 200 - 100; // -100 から 100 の範囲
            return Math.floor(random);
        };

        const labels = Array.from({ length: 24 }, (_, i) => `${i}時`);
        const data = Array.from({ length: 24 }, (_, i) => randomValue(seed, i));

        return data;
    };

    const updateChart = (data) => {
        const labels = Array.from({ length: 24 }, (_, i) => `${i}時`);

        if (chart) {
            chart.data.labels = labels;
            chart.data.datasets[0].data = data;
            chart.update();
        } else {
            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'ガチャ運',
                        data: data,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)', // 赤色の背景
                        borderColor: 'rgba(255, 99, 132, 1)', // 赤色の枠線
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: {
                                color: 'black' // x軸ラベルの色
                            }
                        },
                        y: {
                            min: -100,
                            max: 100,
                            ticks: {
                                color: 'black', // y軸ラベルの色
                                stepSize: 20
                            }
                        }
                    }
                }
            });
        }
    };

    // 初期表示時にガチャ運を表示
    document.getElementById('name-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('name-input').value.trim();
        if (name) {
            const gachaData = getGachaData(name); // 名前に基づいてガチャ運データを取得
            updateChart(gachaData);
        }
    });
});

 // ESCキーでサイトに戻る
 window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        window.location.href = "../サイト/desaku.html";
    }
});