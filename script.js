//Variables
    var user;
    const gridSize = 50; // Define the grid size
    var moveDistance = gridSize; // Move one grid square at a time
    var lastDirection = null; // Keep track of the last movement direction
    var signs = []; // Array to hold sign objects
    var isOverlayOpen = false; // Flag to track if the overlay is open
    
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


//Initializes the game
function startGame() {
    gameMap.start();
    user = new avatar(50, 50, "red", 550, 300);
    signs[0] = new sign(100, 100, 700, 300, false); // Create a sign object and add it to the signs array
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

        window.addEventListener('keydown', function (e) { //If a key is down, its array value is set to true
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

        // Ensure the avatar stays within the canvas boundaries
        this.xpos = Math.max(0, Math.min(this.xpos, gameMap.canvas.width - (this.width + 15)));
        this.ypos = Math.max(0, Math.min(this.ypos, gameMap.canvas.height - (this.height + 15)));

        this.xpos = Math.round(this.xpos / gridSize) * gridSize;
        this.ypos = Math.round(this.ypos / gridSize) * gridSize;

        //checks if user overlaps with any signs
        for(var i = 0; i < signs.length; i++) {
            console.log("Checking interaction with sign at index " + i + ": " + signs[i].xpos + signs[i].ypos + " | " + user.xpos + ", " + user.ypos);
            interact(user, signs[i]);
            if(signs[i].interacted) {
                console.log("Interacted with sign at index " + i);
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
            lastDirection = 'null';
            break;
        case 'right':
            user.speedX = moveDistance;
            lastDirection = 'null';
            break;
        case 'up':
            user.speedY = -moveDistance;
            lastDirection = 'null';
            break;
        case 'down':
            user.speedY = moveDistance;
            lastDirection = 'null';
            break;
        case null:
            user.speedX = 0;
            user.speedY = 0;
            break;
    }

    user.newPos();
}

function sign(width, height, xpos, ypos, interacted) {
    this.gameMap = gameMap;
    this.width = width;
    this.height = height;
    this.xpos = xpos;
    this.ypos = ypos;
    interacted = false;

    if (interacted) {
        console.log("true");
    }
}


function interact(user, sign) {
    if (user.xpos === sign.xpos && user.ypos === sign.ypos) {
        console.log("interacted with sign!");
        sign.interacted = true;
    } else {
        console.log("no sign detected");
        sign.interacted = false;
    }

}

//Clears map then updates avatar locations as defined
function updateMap() {
    gameMap.clear();
    user.update();

}

//ensures the canvas is the correct size for the window
window.addEventListener('resize', () => {
    console.log('Window resized. Updating canvas dimensions.');
    gameMap.canvas.width = window.innerWidth;
    gameMap.canvas.height = window.innerHeight;
});


//Handles all iframe code
    function openResume() {
        console.log('Open resume clicked!');
        document.getElementById('resumeOverlay').style.display = 'block';

        // Show the homeButton div (which contains both canvases)
        const homeButton = document.getElementById('homeButton');
        homeButton.style.display = 'block';

        isOverlayOpen = true; // Set the flag to true
    }

    function closeResume() {
        console.log('Close resume clicked!');
        document.getElementById('resumeOverlay').style.display = 'none';

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
        closeResume();
    });


    // Open the resume overlay
    document.getElementById('openResume').addEventListener('click', () => {
        openResume();
    });
