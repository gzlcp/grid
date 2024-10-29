let grid = [];
let gridSize = 15;
const cellSize = 40;
let selectedColor = "#000000";

function surpriseEffect() {
    const controls = document.querySelector('.controls');
    const originalColor = window.getComputedStyle(controls).backgroundColor;
    const highlightColor = lightenColor(originalColor, 0.1);

    // 軽く点滅するエフェクトを設定
    controls.style.transition = "box-shadow 0.2s ease-in-out";
    controls.style.boxShadow = `0 0 8px 3px ${highlightColor}`;

    setTimeout(() => {
        controls.style.boxShadow = "";
    }, 150);
}

function lightenColor(color, percent) {
    const rgb = color.match(/\d+/g);
    const r = Math.min(255, Math.round(rgb[0] * (1 + percent)));
    const g = Math.min(255, Math.round(rgb[1] * (1 + percent)));
    const b = Math.min(255, Math.round(rgb[2] * (1 + percent)));
    return `rgb(${r}, ${g}, ${b})`;
}

const pentatonicNotes = [261.63, 293.66, 329.63, 392.00, 523.25];

function playNote() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.2;
    gainNode.connect(audioContext.destination);

    // ランダムに2つの音を選んで和音を作る
    const note1 = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];
    let note2 = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];
    while (note2 === note1) {
        note2 = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];
    }

    // オシレーターを2つ作成して明るい和音に
    const osc1 = audioContext.createOscillator();
    osc1.type = "square";
    osc1.frequency.value = note1;

    const osc2 = audioContext.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.value = note2;

    // オシレーターをゲインノードに接続
    osc1.connect(gainNode);
    osc2.connect(gainNode);

    // 短い音のフェードアウト
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2); // 200msでフェードアウト

    // オシレーターの再生と停止
    osc1.start();
    osc2.start();
    osc1.stop(audioContext.currentTime + 0.2);
    osc2.stop(audioContext.currentTime + 0.2);
}

function setControlsBackgroundColorToAverage() {
    return

    const colors = grid.flat();
    const averageColor = getAverageColor(colors);

    if (averageColor === "#ffffff" || averageColor === "#000000") {
        document.querySelector(".controls").style.backgroundColor = averageColor;
        return;
    }

    const boostedColor = boostColor(averageColor);
    document.querySelector(".controls").style.backgroundColor = boostedColor;
}

function boostColor(hexColor) {
    let [r, g, b] = hexToRgb(hexColor);

    r = Math.min(Math.round(r * 1.1), 255); // 赤の強調
    g = Math.min(Math.round(g * 1.1), 255); // 緑の強調
    b = Math.min(Math.round(b * 1.05), 255); // 青は少し控えめ

    return rgbToHex(r, g, b);
}

function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

// ページ読み込み時に sample.json を読み込む
window.addEventListener("DOMContentLoaded", () => {
    loadSampleGrid();
    document.getElementById("grid-size").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            createGrid();
        }
    });
});

// sample.json をロードして初期化
function loadSampleGrid() {
    fetch("sample.json")
        .then(response => {
            if (!response.ok) throw new Error("sample.json の読み込みに失敗しました");
            return response.json();
        })
        .then(data => {
            initializeGridWithData(data);
        })
        .catch(error => {
            console.error(error);
            createGrid();
        });
}

// JSONデータでグリッドを初期化
function initializeGridWithData(data) {
    gridSize = data.gridSize;
    grid = data.grid;

    document.getElementById("grid-size").value = gridSize;

    const canvas = document.getElementById('grid-canvas');
    canvas.width = gridSize * cellSize;
    canvas.height = gridSize * cellSize;

    // イベントリスナーを再設定
    canvas.removeEventListener("click", toggleCell);
    canvas.addEventListener("click", toggleCell);

    drawGrid();
    updateCounts();
    setControlsBackgroundColorToAverage();
}

function selectColor(event) {
    selectedColor = event.target.value;
    document.getElementById("color-preview").style.backgroundColor = selectedColor;
}

function setColor(color) {
    selectedColor = color;
    document.getElementById("color-preview").style.backgroundColor = color;
}

function createGrid() {
    gridSize = parseInt(document.getElementById("grid-size").value);
    initializeGrid();
    drawGrid();
    updateCounts();
    setControlsBackgroundColorToAverage();
}

function initializeGrid() {
    grid = Array.from({ length: gridSize }, () => Array(gridSize).fill("#ffffff"));

    const canvas = document.getElementById('grid-canvas');
    canvas.width = gridSize * cellSize;
    canvas.height = gridSize * cellSize;

    // イベントリスナーを再設定
    canvas.removeEventListener("click", toggleCell);
    canvas.addEventListener("click", toggleCell);
}

function drawGrid() {
    const canvas = document.getElementById('grid-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            ctx.fillStyle = grid[row][col];
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }
}

function toggleCell(event) {
    const canvas = document.getElementById('grid-canvas');
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    grid[row][col] = grid[row][col] === selectedColor ? "#ffffff" : selectedColor;
    drawGrid();
    updateCounts();
    setControlsBackgroundColorToAverage();

    surpriseEffect();
    playNote();
}

function randomizeGrid() {
    grid = grid.map(row => row.map(() => getRandomColor()));

    const canvas = document.getElementById('grid-canvas');
    canvas.removeEventListener("click", toggleCell);
    canvas.addEventListener("click", toggleCell);

    drawGrid();
    updateCounts();
    setControlsBackgroundColorToAverage();
}

function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
}

function uploadImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => processImage(img);
    img.src = URL.createObjectURL(file);
}

function processImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = gridSize;
    canvas.height = gridSize;
    ctx.drawImage(img, 0, 0, gridSize, gridSize);

    const imageData = ctx.getImageData(0, 0, gridSize, gridSize).data;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const index = (row * gridSize + col) * 4;
            const r = imageData[index];
            const g = imageData[index + 1];
            const b = imageData[index + 2];

            grid[row][col] = rgbToHex(r, g, b);
        }
    }
    drawGrid();
    updateCounts();
    setControlsBackgroundColorToAverage()
}

function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function updateCounts() {
    const rowCounts = grid.map(row => row.filter(cell => cell !== "#ffffff").length);
    const columnCounts = Array(gridSize).fill(0).map((_, col) =>
        grid.reduce((sum, row) => sum + (row[col] !== "#ffffff" ? 1 : 0), 0)
    );

    const rowCountContainer = document.getElementById('row-counts');
    rowCountContainer.innerHTML = '';
    rowCounts.forEach((count, row) => {
        const cell = document.createElement('div');
        cell.className = 'row-count';
        cell.innerText = count;

        // 行の平均色を取得して、白なら透明に設定
        const averageColor = getAverageColor(grid[row].filter(color => color !== "#ffffff"));
        cell.style.backgroundColor = averageColor === "#ffffff" ? "transparent" : averageColor;

        rowCountContainer.appendChild(cell);
    });

    const columnCountContainer = document.getElementById('column-counts');
    columnCountContainer.innerHTML = '';
    columnCounts.forEach((count, col) => {
        const cell = document.createElement('div');
        cell.className = 'column-count';
        cell.innerText = count;

        // 列の平均色を取得して、白なら透明に設定
        const averageColor = getAverageColor(grid.map(row => row[col]).filter(color => color !== "#ffffff"));
        cell.style.backgroundColor = averageColor === "#ffffff" ? "transparent" : averageColor;

        columnCountContainer.appendChild(cell);
    });
}

function getAverageColor(colors) {
    // 白と黒を除外して色をフィルタリング
    const filteredColors = colors.filter(color => color !== "#ffffff" && color !== "#000000");

    if (filteredColors.length === 0) return "#ffffff";

    const rgbTotals = filteredColors.reduce(
        (totals, color) => {
            const [r, g, b] = hexToRgb(color);
            return [totals[0] + r, totals[1] + g, totals[2] + b];
        },
        [0, 0, 0]
    );

    const colorCount = filteredColors.length;
    const avgR = Math.round(rgbTotals[0] / colorCount);
    const avgG = Math.round(rgbTotals[1] / colorCount);
    const avgB = Math.round(rgbTotals[2] / colorCount);

    return rgbToHex(avgR, avgG, avgB);
}

// グリッドをJSON形式でエクスポート
function exportGrid() {
    const data = {
        gridSize: gridSize,
        grid: grid
    };
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "grid.json";
    a.click();
    URL.revokeObjectURL(url);
}

// JSONファイルからグリッドをインポート
function importGrid(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        initializeGridWithData(data);
    };
    reader.readAsText(file);
}
