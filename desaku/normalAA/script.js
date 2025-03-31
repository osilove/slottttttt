document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const generateButton = document.getElementById('generateButton');
    const saveButton = document.getElementById('saveButton');
    const clearButton = document.getElementById('clearButton');
    const asciiContainer = document.getElementById('asciiContainer');
    const charWidthInput = document.getElementById('charWidthInput');

    const grayScaleChars = "@%#*+=-:. ";
    let db;

    // IndexedDBの初期化
    const request = indexedDB.open('AsciiArtDB', 1);

    request.onupgradeneeded = function (e) {
        db = e.target.result;
        if (!db.objectStoreNames.contains('asciiArtStore')) {
            db.createObjectStore('asciiArtStore', { keyPath: 'id' });
        }
    };

    request.onsuccess = function (e) {
        db = e.target.result;
        loadAsciiArt();
    };

    request.onerror = function (e) {
        console.error('IndexedDB エラー:', e.target.errorCode);
    };

    // IndexedDBからアートを読み込み
    function loadAsciiArt() {
        const tx = db.transaction('asciiArtStore', 'readonly');
        const store = tx.objectStore('asciiArtStore');
        const getReq = store.get('ascii');

        getReq.onsuccess = () => {
            if (getReq.result) {
                asciiContainer.innerHTML = getReq.result.html;
            }
        };
    }

    // IndexedDBにアートを保存
    function saveAsciiArt(asciiHtml) {
        const tx = db.transaction('asciiArtStore', 'readwrite');
        const store = tx.objectStore('asciiArtStore');
        store.put({ id: 'ascii', html: asciiHtml });
    }

    // IndexedDBのデータ削除
    function clearAsciiArt() {
        const tx = db.transaction('asciiArtStore', 'readwrite');
        const store = tx.objectStore('asciiArtStore');
        store.delete('ascii');
    }

    // アスキーアートを画像として保存
    const saveAsciiAsImage = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const fontSize = 10;
        const lineHeight = fontSize * 1.2;

        const lines = asciiContainer.querySelectorAll('div');
        const canvasWidth = Math.max(...[...lines].map(line => line.children.length)) * fontSize;
        const canvasHeight = lines.length * lineHeight;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${fontSize}px monospace`;
        ctx.textBaseline = 'top';

        lines.forEach((line, lineIndex) => {
            const spans = line.children;
            let x = 0;
            Array.from(spans).forEach(span => {
                const char = span.textContent;
                const color = span.style.color || 'black';
                ctx.fillStyle = color;
                ctx.fillText(char, x, lineIndex * lineHeight);
                x += fontSize;
            });
        });

        const link = document.createElement('a');
        link.download = 'ascii-art.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    // 画像をアスキーアートに変換
    const generateAsciiArt = (image, charWidth) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const aspectRatio = image.width / image.height;
        const canvasWidth = charWidth;
        const canvasHeight = Math.round(charWidth / aspectRatio);

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        asciiContainer.innerHTML = '';

        for (let y = 0; y < imageData.height; y++) {
            const line = document.createElement('div');
            line.style.display = 'flex';
            for (let x = 0; x < imageData.width; x++) {
                const offset = (y * imageData.width + x) * 4;
                const r = imageData.data[offset];
                const g = imageData.data[offset + 1];
                const b = imageData.data[offset + 2];
                const alpha = imageData.data[offset + 3];
                const gray = (r + g + b) / 3;
                const charIndex = Math.floor((gray / 255) * (grayScaleChars.length - 1));
                const char = grayScaleChars[charIndex];

                if (alpha > 0) {
                    const span = document.createElement('span');
                    span.textContent = char;
                    span.style.color = 'black';
                    line.appendChild(span);
                } else {
                    line.appendChild(document.createTextNode(' '));
                }
            }
            asciiContainer.appendChild(line);
        }

        saveAsciiArt(asciiContainer.innerHTML);
    };

    // 画像読み込み処理
    generateButton.addEventListener('click', () => {
        const file = imageInput.files[0];
        const charWidth = parseInt(charWidthInput.value, 10);
        if (file && charWidth >= 50 && charWidth <= 200) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => generateAsciiArt(img, charWidth);
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            alert('画像を選択し、文字幅を50～200の間で入力してください。');
        }
    });

    saveButton.addEventListener('click', () => {
        saveAsciiAsImage();
    });

    clearButton.addEventListener('click', () => {
        clearAsciiArt();
        asciiContainer.innerHTML = '';
    });
});

// ESCキーでサイトに戻る
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        window.location.href = "../サイト/desaku.html";
    }
});
