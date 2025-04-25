//Variables
var user;
const gridSize = 50; // Define the grid size
var moveDistance = gridSize; // Move one grid square at a time
var lastDirection = null; // Keep track of the last movement direction
var signs = []; // Array to hold sign objects
var isOverlayOpen = false; // Flag to track if the overlay is open
var index; // Variable to store the index of the sign that was clicked

//Arrow key codes
const upArrow = 38;
const downArrow = 40;
const leftArrow = 37;
const rightArrow = 39;

//WASD key codes
const wKey = 87;
const sKey = 83;
const aKey = 65;
const dKey = 68;

const space = 32; // Space key code


//Initializes the game
function startGame() {
    gameMap.start();
    user = new avatar(50, 50, "red", 550, 300);
    signs[0] = new sign(100, 100, 700, 250, false, 'openResume'); // Creates 
    signs[1] = new sign(50, 100, 0, 250, false, 'openAbout'); // Create a sign object and add it to the signs array
    signs[2] = new sign(100, 100, 1400, 250, false, 'openPortfolio'); // Create a sign object and add it to the signs array
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

        gameMap.keys = [];
        for (var i = 0; i < 256; i++) {
            gameMap.keys[i] = false;
        }

        const movementKeys = [upArrow, downArrow, leftArrow, rightArrow, wKey, aKey, sKey, dKey];

        window.addEventListener('keydown', function (e) {
            // Check if the pressed key is not a movement key
            if (!movementKeys.includes(e.keyCode)) {
                console.log('Non-movement key pressed. Resetting direction.');
                lastDirection = null;
                user.speedX = 0;
                user.speedY = 0;
            }
    
            // If a movement key is pressed, update the movement
            gameMap.keys[e.keyCode] = true;
            avatarMovement(e.keyCode);
        });
    
        window.addEventListener('keyup', function (e) {
            gameMap.keys[e.keyCode] = false;
        });
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

        // Ensure the avatar stays within the canvas boundaries
        this.xpos = Math.max(0, Math.min(this.xpos, gameMap.canvas.width - (this.width + 10)));
        this.ypos = Math.max(0, Math.min(this.ypos, gameMap.canvas.height - (this.height + 10)));

        this.xpos = Math.round(this.xpos / gridSize) * gridSize;
        this.ypos = Math.round(this.ypos / gridSize) * gridSize;

        //checks if user overlaps with any signs
        for (var i = 0; i < signs.length; i++) {
            console.log("Checking interaction with sign at index " + i + ": " 
                + signs[i].xpos + signs[i].ypos + " | " + user.xpos + ", " + user.ypos);
            signs[i].interact(user);
            if (signs[i].interacted) {
                console.log("Interacted with sign at index " + i);
                index = i; // Store the index of the sign that was clicked
                signs[i].openPage(i);
            }
        }
    }
}

//Avatar movement based on key press
function avatarMovement(keyCode) {

    if (isOverlayOpen) {
        console.log('Avatar movement disabled while overlay is open.');
        return; // Prevent movement if the overlay is open
    }


    user.speedX = 0;
    user.speedY = 0;
    var moveDistance = gridSize; // Move one grid square at a time

    if (gameMap.keys && gameMap.keys[16]) { moveDistance *= 2; } // Increase speed when shift is held

    var directions = [];

    var canMove = true;

    
    // Move left
    if ((gameMap.keys[leftArrow] || gameMap.keys[aKey]) && user.xpos >= 50) {
        canMove = true; directions.push('left');
    }
    // Move right
    if ((gameMap.keys[rightArrow] || gameMap.keys[dKey]) && user.xpos + user.width <= gameMap.canvas.width - 50) {
        canMove = true; directions.push('right');
    }
    // Move up
    if ((gameMap.keys[upArrow] || gameMap.keys[wKey]) && user.ypos >= 50) {
        canMove = true; directions.push('up');
    }
    // Move down
    if ((gameMap.keys[downArrow] || gameMap.keys[sKey]) && user.ypos + user.height <= gameMap.canvas.height - 50) {
        canMove = true; directions.push('down');
    }

    if (canMove === false) {
        directions = null;
        directions.push('none');
    }

    


    if (directions.length > 1) {
        if (lastDirection === directions[0]) {
            lastDirection = directions[1];
        } else {
            lastDirection = directions[0];
        }
    } else if (directions.length === 1) {
        lastDirection = directions[0];
    }

    switch (lastDirection) { //uses switch cases to allow for multi-directional movement
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
        case null:
            user.speedX = 0;
            user.speedY = 0;
            lastDirection = 'null';
            break;
    }
    user.newPos();
}

function sign(width, height, xpos, ypos, interacted, page) {
    this.gameMap = gameMap;
    this.width = width;
    this.height = height;
    this.xpos = xpos;
    this.ypos = ypos;

    this.interacted = false;
    this.update = function () {
        ctx = gameMap.context;
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.xpos, this.ypos, this.width + 50, this.height + 50);
    }

    this.interact = function (user) {
        if (user.xpos >= this.xpos && user.ypos >= this.ypos 
            && user.xpos <= this.xpos + this.width && user.ypos <= this.ypos + this.height) {
            console.log("interacted with sign!");
            this.interacted = true;
        } else {
            console.log("no sign detected");
            this.interacted = false;
        }

    }

    this.openPage = function (index) {
        if (gameMap.keys[space]) {
            console.log("openPage called for sign at " + this.xpos + ", " + this.ypos + " | index: " + index);
            openPage(index);
        }
    };
}


//Clears map then updates avatar locations as defined
function updateMap() {
    gameMap.clear();

    for (var i = 0; i < signs.length; i++) {
        signs[i].update();
    }

    user.update();

}

//ensures the canvas is the correct size for the window
window.addEventListener('resize', () => {
    console.log('Window resized. Updating canvas dimensions.');
    gameMap.canvas.width = window.innerWidth;
    gameMap.canvas.height = window.innerHeight;
});


//Handles all iframe code
function openPage(index) {
    console.log('Open page!');
    if (index === 0) {
        document.getElementById('resumeOverlay').style.display = 'block';
    } else if( index === 1) {
        document.getElementById('aboutOverlay').style.display = 'block';
    } else if (index === 2) {
        window.location.href="./portfolio.html";
    }
    // Show the homeButton div (which contains both canvases)
    const homeButton = document.getElementById('homeButton');
    homeButton.style.display = 'block';

    isOverlayOpen = true; // Set the flag to true
}

function closeResume(index) {
    console.log('Close resume clicked!');
    if (index === 0) {
        document.getElementById('resumeOverlay').style.display = 'none';
    } else if( index === 1) {
        document.getElementById('aboutOverlay').style.display = 'none';
    }
    // Hide the homeButton div (which contains both canvases)
    const homeButton = document.getElementById('homeButton');
    homeButton.style.display = 'none';

    isOverlayOpen = false; // Set the flag to false
}

document.addEventListener('click', (event) => {
    console.log('Clicked element:', event.target);
});

// Add event listener to homeCanvas to close the resume overlay
document.getElementById('homeCanvas').addEventListener('click', () => {
    closeResume(index);
});



