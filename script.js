var user;
var gridSize = 25; // Define the grid size
var moveDistance = gridSize; // Move one grid square at a time
var lastDirection = null; // Keep track of the last movement direction

//Initializes the game
function startGame() {
    gameMap.start();
    user = new avatar(50, 50, "red", 525, 125);
}

//Defines the gameMap Canvas
var gameMap = {
    canvas: document.createElement("canvas"),
    start: function () {  // Activates upon calling start on the canvas object
        this.canvas.width = innerWidth; //Sets the canvas width to the computer screen width
        this.canvas.height = innerHeight; //Sets the canvas height to the computer screen height
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateMap, 20);

        window.addEventListener('keydown', function (e) { //If a key is down, its array value is set to true
            gameMap.keys = (gameMap.keys || []);
            gameMap.keys[e.keyCode] = true;
            avatarMovement(e.keyCode);
        })
        window.addEventListener('keyup', function (e) { //If a key is up then its array value is set to false
            gameMap.keys[e.keyCode] = false;
        })
    },

    clear: function () { //Clears the map, used to ensure the moving objects appear to move rather than get smeared across the page
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Function that creates the avatar and updates its coordinates
function avatar(width, height, color, xpos, ypos) {
    this.gameMap = gameMap;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.xpos = xpos;
    this.ypos = ypos;
    this.update = function () {
        ctx = gameMap.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.xpos, this.ypos, this.width, this.height);
    }
    this.newPos = function () {
        this.xpos += this.speedX;
        this.ypos += this.speedY;
        this.xpos = Math.round(this.xpos / gridSize) * gridSize;
        this.ypos = Math.round(this.ypos / gridSize) * gridSize;
    }
}

//Avatar movement based on key press
function avatarMovement(keyCode) {
    user.speedX = 0;
    user.speedY = 0;
    var moveDistance = gridSize; // Move one grid square at a time

    if (gameMap.keys && gameMap.keys[16]) { moveDistance *= 2; } // Increase speed by 50% when shift is held

    var directions = [];
    if (gameMap.keys[37]) { directions.push('left'); } // Move left
    if (gameMap.keys[39]) { directions.push('right'); } // Move right
    if (gameMap.keys[38]) { directions.push('up'); } // Move up
    if (gameMap.keys[40]) { directions.push('down'); } // Move down

    if (directions.length > 1) {
        if (lastDirection === directions[0]) {
            lastDirection = directions[1];
        } else {
            lastDirection = directions[0];
        }
    } else if (directions.length === 1) {
        lastDirection = directions[0];
    }

    switch (lastDirection) {
        case 'left':
            user.speedX = -moveDistance;
            break;
        case 'right':
            user.speedX = moveDistance;
            break;
        case 'up':
            user.speedY = -moveDistance;
            break;
        case 'down':
            user.speedY = moveDistance;
            break;
    }

    user.newPos();
}

//Clears map then updates avatar locations as defined
function updateMap() {
    gameMap.clear();
    user.update();
}
