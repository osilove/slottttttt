const canvas = document.getElementById('canvas');
const colorPicker = document.getElementById('colorPicker');
const palette = document.getElementById('palette');
const pixelSizeInput = document.getElementById('pixelSize');
const canvasSizeInput = document.getElementById('canvasSize');
const undoButton = document.getElementById('undoButton');
const clearButton = document.getElementById('clearButton');
const imageLoader = document.getElementById('imageLoader');
const loadImageButton = document.getElementById('loadImageButton');
const replaceColorButton = document.getElementById('replaceColorButton');
const x1Input = document.getElementById('x1');
const y1Input = document.getElementById('y1');
const x2Input = document.getElementById('x2');
const y2Input = document.getElementById('y2');
const replaceColorInput = document.getElementById('replaceColor');
const newColorInput = document.getElementById('newColor');

const colors = [
    "#000000", "#FF0000", "#00FF00", "#0000FF",
    "#FFFF00", "#FF00FF", "#00FFFF", "#FFFFFF",
    "#808080", "#FF8080", "#80FF80", "#8080FF",
    "#FFFF80", "#FF80FF", "#80FFFF", "#C0C0C0"
];

let currentColor = '#000000';
let pixelSize = 20;
let canvasSize = 100;
let isPainting = false;
let history = [];
let redoHistory = [];

// IndexedDBの準備
let db;
const request = indexedDB.open("PixelArtDB", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    db.createObjectStore("canvas", { keyPath: "id" });
};

request.onsuccess = function (event) {
    db = event.target.result;
    loadCanvasFromDB();
};

// カラーパレット
colors.forEach(color => {
    const colorDiv = document.createElement('div');
    colorDiv.classList.add('palette-color');
    colorDiv.style.backgroundColor = color;
    colorDiv.addEventListener('click', () => {
        currentColor = color;
        colorPicker.value = color;
        saveToDB();
    });
    palette.appendChild(colorDiv);
});

// キャンバス作成
function createCanvas(size, pixelSize, pixelData = []) {
    canvas.innerHTML = '';
    canvas.style.gridTemplateColumns = `repeat(${size}, ${pixelSize}px)`;
    canvas.style.gridTemplateRows = `repeat(${size}, ${pixelSize}px)`;
    canvas.style.width = `${size * pixelSize}px`;
    canvas.style.height = `${size * pixelSize}px`;

    for (let i = 0; i < size * size; i++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixel');
        pixel.style.width = `${pixelSize}px`;
        pixel.style.height = `${pixelSize}px`;
        pixel.style.backgroundColor = pixelData[i] || '#FFFFFF';

        pixel.addEventListener('mousedown', () => {
            history.push(getCanvasColors());
            redoHistory = [];
            pixel.style.backgroundColor = currentColor;
            saveToDB();
            isPainting = true;
        });

        pixel.addEventListener('mouseover', () => {
            if (isPainting) {
                pixel.style.backgroundColor = currentColor;
                saveToDB();
            }
        });

        canvas.appendChild(pixel);
    }
}

// DB保存
function saveToDB() {
    const tx = db.transaction("canvas", "readwrite");
    const store = tx.objectStore("canvas");
    const pixelData = getCanvasColors();
    store.put({
        id: 1,
        canvasSize: canvasSize,
        pixelSize: pixelSize,
        currentColor: currentColor,
        pixels: pixelData
    });
}

// DB読込
function loadCanvasFromDB() {
    const tx = db.transaction("canvas", "readonly");
    const store = tx.objectStore("canvas");
    const req = store.get(1);
    req.onsuccess = () => {
        const data = req.result;
        if (data) {
            canvasSize = data.canvasSize;
            pixelSize = data.pixelSize;
            currentColor = data.currentColor;
            colorPicker.value = currentColor;
            canvasSizeInput.value = canvasSize;
            pixelSizeInput.value = pixelSize;
            createCanvas(canvasSize, pixelSize, data.pixels);
        } else {
            createCanvas(canvasSize, pixelSize);
        }
    };
}

// ピクセル配列を取得
function getCanvasColors() {
    return [...document.querySelectorAll('.pixel')].map(p => p.style.backgroundColor);
}

// キャンバス更新
canvasSizeInput.addEventListener('input', () => {
    canvasSize = parseInt(canvasSizeInput.value);
    createCanvas(canvasSize, pixelSize);
    saveToDB();
});

pixelSizeInput.addEventListener('input', () => {
    pixelSize = parseInt(pixelSizeInput.value);
    createCanvas(canvasSize, pixelSize);
    saveToDB();
});

canvas.addEventListener('mouseup', () => { isPainting = false; });
canvas.addEventListener('mouseleave', () => { isPainting = false; });

// 色置換
replaceColorButton.addEventListener('click', () => {
    const x1 = parseInt(x1Input.value, 10);
    const y1 = parseInt(y1Input.value, 10);
    const x2 = parseInt(x2Input.value, 10);
    const y2 = parseInt(y2Input.value, 10);
    const replaceColor = hexToRgb(replaceColorInput.value);
    const newColor = newColorInput.value;

    const pixels = document.querySelectorAll('.pixel');
    const size = canvasSize;

    for (let i = 0; i < pixels.length; i++) {
        const row = Math.floor(i / size);
        const col = i % size;
        if (col >= x1 && col <= x2 && row >= y1 && row <= y2) {
            const pixel = pixels[i];
            if (pixel.style.backgroundColor === replaceColor) {
                pixel.style.backgroundColor = newColor;
            }
        }
    }
    saveToDB();
});

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
}

// undo/redo
function undo() {
    if (history.length > 0) {
        redoHistory.push(getCanvasColors());
        applyPixelData(history.pop());
        saveToDB();
    }
}
function redo() {
    if (redoHistory.length > 0) {
        history.push(getCanvasColors());
        applyPixelData(redoHistory.pop());
        saveToDB();
    }
}

function applyPixelData(data) {
    const pixels = document.querySelectorAll('.pixel');
    data.forEach((color, i) => {
        pixels[i].style.backgroundColor = color;
    });
}

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'z') undo();
    if (event.ctrlKey && event.key === 'y') redo();
});

// 画像読込
loadImageButton.addEventListener('click', () => {
    imageLoader.click();
});

imageLoader.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => { img.src = e.target.result; };

    img.onload = () => {
        const size = canvasSize;
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = size;
        ctx.canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size).data;
        const pixels = document.querySelectorAll('.pixel');

        for (let i = 0; i < pixels.length; i++) {
            const r = imageData[i * 4];
            const g = imageData[i * 4 + 1];
            const b = imageData[i * 4 + 2];
            const color = `rgb(${r}, ${g}, ${b})`;
            pixels[i].style.backgroundColor = color;
        }
        saveToDB();
    };
    reader.readAsDataURL(file);
});

// 全消去
clearButton.addEventListener('click', () => {
    const pixels = document.querySelectorAll('.pixel');
    pixels.forEach(pixel => pixel.style.backgroundColor = '#FFFFFF');
    saveToDB();
});

// ESCキーで戻る
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        window.location.href = "../サイト/desaku.html";
    }
});
