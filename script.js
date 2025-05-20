//Variables
var user;
const gridSize = 50; // Define the grid size
var moveDistance = gridSize; // Move one grid square at a time
var lastDirection = null; // Keep track of the last movement direction
var signs = []; // Array to hold sign objects
var stars = []; // Array to hold star objects
var inventory = []; // Array to hold inventory items
var isOverlayOpen = false; // Flag to track if the overlay is open
var index;
var collectedNum = 0;
var deposited = 0;
var avatars = []; // Array to hold avatar objects
var starImg = new Image(); // Create a new image object for the star
starImg.src = "star.png"; // Set the source of the image


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
    user = new avatar(50, 50, 550, 300);
    //user.image.onload(1);
    signs[0] = new sign(100, 50, 150, 0, false, 'openResume');
    signs[1] = new sign(50, 100, 0, 250, false, 'openAbout');
    signs[2] = new sign(100, 100, 1400, 250, false, 'openPortfolio');
    signs[3] = new sign(100, 100, 700, 250, false, 'openHelp');
    signs[4] = new sign(100, 100, 1300, 0, false, 'depositStars');

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

        createStars(); // Create stars when the game starts
    },

    clear: function () { //Clears the map, used to ensure the moving objects appear to move rather than get smeared across the page
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Function that creates the avatar and updates its coordinates
function avatar(width, height, xpos, ypos) {
    this.gameMap = gameMap;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.xpos = xpos;
    this.ypos = ypos;
    this.mood = 0; // 0 = neutral, 1 = happy, 2 = sad, 3 = angry
    this.image = new Image(); // Create a new image object
    this.image.src = "avatar0.png";

    //need to test
    this.image.onload = function (instance) {
        for (var i = 0; i < 4; i++) {
            avatars[i] = new Image(); // Create a new image object
            avatars[i].src = "avatar" + (i ) + ".png"; // Set the source of the image + (instance * 3)
        }
    }
    this.moodImage = function () {
        console.log("Setting mood image to: " + this.mood);
        if (this.mood === 0) {
            this.image.src = avatars[0].src; // Neutral mood
        } else if (this.mood === 1) {
            this.image.src = avatars[1].src; // happy mood
        } else if (this.mood === 2) {
            this.image.src = avatars[2].src; // mad mood
        }
    }
    this.update = function () {
        ctx = gameMap.context;
        this.moodImage();
        ctx.drawImage(this.image, this.xpos, this.ypos, this.width, this.height); // Draw the image

    }
    this.newPos = function () {
        this.mood = 0;
        this.xpos += this.speedX;
        this.ypos += this.speedY;

        // Ensure the avatar stays within the canvas boundaries
        this.xpos = Math.max(0, Math.min(this.xpos, gameMap.canvas.width - (this.width + 10)));
        this.ypos = Math.max(0, Math.min(this.ypos, gameMap.canvas.height - (this.height + 10)));
        if (this.xpos < 50 || this.xpos > gameMap.canvas.width - (this.width + 10) - 50 || this.ypos < 50 || this.ypos > gameMap.canvas.height - (this.height + 10) - 25) {
            this.mood = 3; // Change mood to angry if out of bounds
        }

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
                this.mood = 1; // Change mood to happy
                signs[i].openPage(i);
            }

        }

        for (var i = 0; i < stars.length; i++) {
            console.log("Checking to collect star at index " + i + ": "
                + stars[i].xpos + stars[i].ypos + " | " + user.xpos + ", " + user.ypos);
            stars[i].collect(user);

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
        user.mood = 3; // Change mood to sad
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
        ctx.fillStyle = '#002855';
        ctx.fillRect(this.xpos, this.ypos, this.width + 50, this.height + 50);
        ctx.fillStyle = '#fdf6e3';
        ctx.font = '20px Arial';
        ctx.fillText(page, this.xpos + 10, this.ypos + 50);
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

//defines the star object
function star(xpos, ypos, collected) {
    this.gameMap = gameMap;
    this.xpos = xpos;
    this.ypos = ypos;
    this.collected = false;
    this.index = 0;
    this.update = function () {
        if (this.collected) {
            this.xpos = ((user.xpos + 10) + Math.cos(this.index / 2.5 * Math.PI) * 30); // Move the star to the user's position
            this.ypos = ((user.ypos + 10) + Math.sin(this.index / 2.5 * Math.PI) * 30); // Move the star to the user's position
        }
        ctx = gameMap.context;
        ctx.drawImage(starImg, this.xpos, this.ypos, 25, 25); // Use starImg here
    }
    this.collect = function (user) {
        if (collectedNum > 4) {
            console.log("You have collected too many stars!"); // Limit the number of stars that can be collected
        }
        else if (user.xpos >= this.xpos - 50 && user.ypos >= this.ypos - 50
            && user.xpos <= this.xpos + 50 && user.ypos <= this.ypos + 50) {
            console.log("interacted with star!");
            inventory.push(this); // Add the star to the inventory
            stars.splice(stars.indexOf(this), 1); // Remove the star from the array
            console.log("Star collected! Inventory size: " + inventory.length);
            console.log("Star collected! Stars left: " + stars.length);
            this.collected = true;
            this.xpos = user.xpos; // Move the star to the user's position
            this.ypos = user.ypos; // Move the star to the user's position
            collectedNum++;
            this.index = collectedNum; // Set the index of the star
        } else {
            console.log("no star detected");
            this.collected = false;
        }

    }
}

//creates the initial stars on the map
function createStars() {
    for (var i = 0; i < 10; i++) { // Create 10 stars   
        var xpos = Math.floor(Math.random() * (gameMap.canvas.width - 50)) + 50; // Random x position
        var ypos = Math.floor(Math.random() * (gameMap.canvas.height - 50)) + 50; // Random y position
        stars[i] = new star(xpos, ypos, false); // Create a new star object
        stars[i].update(); // Update the star's position
        stars[i].index = i; // Set the index of the star
    }
}

function depositStars() {
    deposited += inventory.length; // Increment the deposited count by the number of stars in the inventory
    inventory = []; // Clear the inventory
    collectedNum = 0; // Reset the collected number
    console.log("Star deposited! Inventory size: " + inventory.length);
    console.log("Star deposited! Stars left: " + stars.length);
    console.log("Star deposited! Stars deposited: " + deposited);
    updateMap();
}


//Clears map then updates avatar locations as defined
function updateMap() {
    gameMap.clear();
    ctx = gameMap.context;
    for (var i = 0; i < signs.length; i++) {
        signs[i].update();
    }
    for (var i = 0; i < stars.length; i++) {
        stars[i].update();
    }
    for (var i = 0; i < inventory.length; i++) {
        inventory[i].update(); // Update the star's position
    }
    for (var i = 0; i < deposited; i++) {
        ctx.drawImage(starImg, 1325 + 25 * (i % 4), 75 + (Math.floor(i / 4) * 25), 25, 25); // Use starImg here
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
    } else if (index === 1) {
        document.getElementById('aboutOverlay').style.display = 'block';
    } else if (index === 2) {
        window.location.href = "./portfolio.html";
    } else if (index === 3) {
        document.getElementById('helpOverlay').style.display = 'block';;
    }

    if (index === 4) {
        depositStars();
    } else {
        // Show the homeButton div (which contains both canvases)
        const homeButton = document.getElementById('homeButton');
        homeButton.style.display = 'block';

        isOverlayOpen = true; // Set the flag to true
    }
}

function closeResume(index) {
    console.log('Close resume clicked!');
    if (index === 0) {
        document.getElementById('resumeOverlay').style.display = 'none';
    } else if (index === 1) {
        document.getElementById('aboutOverlay').style.display = 'none';
    } else if (index === 3) {
        document.getElementById('helpOverlay').style.display = 'none';
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

//add event listener so esc key closes the overlay
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeResume(index);
    }
});


