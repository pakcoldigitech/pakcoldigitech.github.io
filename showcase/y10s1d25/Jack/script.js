const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const snakeSize = 19;
const offset = (gridSize - snakeSize) / 2;
let snake = [{ x: 200, y: 200 }];
let direction = "RIGHT";
let food = getNewFoodPosition();
let pathCache = {}; // Cache for previously computed paths

function drawRect(x, y, color, size = gridSize) {
    ctx.fillStyle = color;
    ctx.fillRect(x + offset, y + offset, size, size);
}

function getNewFoodPosition() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize,
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

function getNeighbors(node) {
    const moves = [
        { x: node.x + gridSize, y: node.y },
        { x: node.x - gridSize, y: node.y },
        { x: node.x, y: node.y + gridSize },
        { x: node.x, y: node.y - gridSize }
    ];
    return moves.filter(n => n.x >= 0 && n.x < canvas.width && n.y >= 0 && n.y < canvas.height && !snake.some(segment => segment.x === n.x && segment.y === n.y));
}

// Heuristic for A* (Manhattan distance)
function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// A* Pathfinding Algorithm
function aStarPath(start, goal) {
    const cacheKey = `${start.x},${start.y}->${goal.x},${goal.y}`;
    if (pathCache[cacheKey]) {
        return pathCache[cacheKey]; // Return cached path if available
    }

    let openSet = [start];
    let cameFrom = {};
    let gScore = { [`${start.x},${start.y}`]: 0 };
    let fScore = { [`${start.x},${start.y}`]: heuristic(start, goal) };
    let closedSet = new Set();

    while (openSet.length > 0) {
        openSet.sort((a, b) => fScore[`${a.x},${a.y}`] - fScore[`${b.x},${b.y}`]);
        let current = openSet.shift();

        if (current.x === goal.x && current.y === goal.y) {
            let path = [];
            while (current) {
                path.unshift(current);
                current = cameFrom[`${current.x},${current.y}`];
            }
            pathCache[cacheKey] = path; // Cache the computed path
            return path;
        }

        closedSet.add(`${current.x},${current.y}`);

        for (let neighbor of getNeighbors(current)) {
            let tentativeGScore = gScore[`${current.x},${current.y}`] + 1;
            if (closedSet.has(`${neighbor.x},${neighbor.y}`)) continue;

            if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                openSet.push(neighbor);
            }

            if (tentativeGScore < (gScore[`${neighbor.x},${neighbor.y}`] || Infinity)) {
                cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                gScore[`${neighbor.x},${neighbor.y}`] = tentativeGScore;
                fScore[`${neighbor.x},${neighbor.y}`] = tentativeGScore + heuristic(neighbor, goal);
            }
        }
    }
    return null; // No path found
}

function findBestMove() {
    // Calculate the optimal path to the food
    let pathToFood = aStarPath(snake[0], food);

    if (pathToFood && pathToFood.length > 1) {
        return pathToFood[1]; // Move towards the food
    }

    // If no path to the food is found, go to the safest move
    return getSafeMove(snake[0]);
}

function getSafeMove(head) {
    const possibleMoves = getNeighbors(head);

    // Try to predict where the snake might go based on the current direction
    const predictedHead = { ...head };
    if (direction === "RIGHT") predictedHead.x += gridSize;
    if (direction === "LEFT") predictedHead.x -= gridSize;
    if (direction === "UP") predictedHead.y -= gridSize;
    if (direction === "DOWN") predictedHead.y += gridSize;

    // Avoid moving into the snake's own body or the predicted next position
    const safeMoves = possibleMoves.filter(move => !snake.some(segment => segment.x === move.x && segment.y === move.y) && !(predictedHead.x === move.x && predictedHead.y === move.y));
    
    return safeMoves.length > 0 ? safeMoves[0] : possibleMoves[0]; // Return the safest move
}

function update() {
    // Snake Growth Strategy: As the snake grows, the AI becomes more cautious
    let nextMove = findBestMove();
    if (nextMove) {
        direction = nextMove.x > snake[0].x ? "RIGHT" :
            nextMove.x < snake[0].x ? "LEFT" :
            nextMove.y > snake[0].y ? "DOWN" : "UP";
    }

    let head = { ...snake[0] };
    if (direction === "RIGHT") head.x += gridSize;
    if (direction === "LEFT") head.x -= gridSize;
    if (direction === "UP") head.y -= gridSize;
    if (direction === "DOWN") head.y += gridSize;

    if (head.x === food.x && head.y === food.y) {
        food = getNewFoodPosition();
    } else {
        snake.pop();
    }

    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        snake = [{ x: 200, y: 200 }];
        direction = "RIGHT";
        return;
    }

    snake.unshift(head);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRect(food.x, food.y, "red");
    snake.forEach(segment => drawRect(segment.x, segment.y, "lime", snakeSize));
}

function gameLoop() {
    update();
    draw();
    setTimeout(gameLoop, 70); // Slower game loop for visibility
}

gameLoop();
