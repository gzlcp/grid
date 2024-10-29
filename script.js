let grid = [];
let gridSize = 15;  // Nのデフォルトを15に設定
const cellSize = 40;

function createGrid() {
    gridSize = parseInt(document.getElementById("grid-size").value);
    initializeGrid();
    drawGrid();
    updateCounts();
}

function initializeGrid() {
    grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

    const canvas = document.getElementById('grid-canvas');
    canvas.width = gridSize * cellSize;
    canvas.height = gridSize * cellSize;
    canvas.addEventListener("click", toggleCell);
}

function randomizeGrid() {
    // グリッドをランダムに埋める
    grid = grid.map(row => row.map(() => Math.random() > 0.5));
    drawGrid();
    updateCounts();
}

function drawGrid() {
    const canvas = document.getElementById('grid-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            ctx.fillStyle = grid[row][col] ? "black" : "white";
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

    grid[row][col] = !grid[row][col];
    drawGrid();
    updateCounts();
}

function updateCounts() {
    const rowCounts = grid.map(row => row.filter(cell => cell).length);
    const columnCounts = Array(gridSize).fill(0).map((_, col) =>
        grid.reduce((sum, row) => sum + (row[col] ? 1 : 0), 0)
    );

    const rowCountContainer = document.getElementById('row-counts');
    rowCountContainer.innerHTML = '';
    rowCounts.forEach(count => {
        const cell = document.createElement('div');
        cell.className = 'row-count';
        cell.innerText = count;
        rowCountContainer.appendChild(cell);
    });

    const columnCountContainer = document.getElementById('column-counts');
    columnCountContainer.innerHTML = '';
    columnCounts.forEach(count => {
        const cell = document.createElement('div');
        cell.className = 'column-count';
        cell.innerText = count;
        columnCountContainer.appendChild(cell);
    });
}
