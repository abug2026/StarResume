//Variables
var user;
const gridSize = 50;
var moveDistance = gridSize; // Move one grid square at a time
var lastDirection = null; // Keep track of the last movement direction
var signs = []; // Array to hold sign objects
var stars = []; // Array to hold star objects
var inventory = []; // Array to hold inventory items (stars)
var isOverlayOpen = false; // Flag to track if the overlay is open
var index;
var deposited = 0; //deposited stars counter
var avatars = [];
var starImg = new Image(); // Create a new image object for the star
starImg.src = "star.png";


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
    imageLoader(0); // Load the first set of avatar images
    user = new avatar(50, 50, 550, 300);
    signs[0] = new sign(150, 150, 150, 0, false, 'openResume');
    signs[1] = new sign(150, 150, 0, 300, false, 'openAbout');
    signs[2] = new sign(150, 150, 1400, 300, false, 'openPortfolio');
    signs[3] = new sign(150, 150, 700, 250, false, 'openHelp');
    signs[4] = new sign(150, 150, 1200, 0, false, 'Deposit Stars');

}

//Defines the gameMap Canvas,
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
                //console.log('Non-movement key pressed. Resetting direction.');
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

        createStars(6); // Create stars when the game starts
    },
    //Clears the map, used to ensure the moving objects 
    //appear to move rather than get smeared across the page
    clear: function () {
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
    this.mood = 0; // 1 = happy, 2 = sad, 3 = angry
    this.multiplier = 0;
    this.image = avatars[0]; // Start with neutral

    this.moodImage = function () {
        var tempMood = (this.mood + (this.multiplier * 3));
        //console.log("Setting mood image to: " + tempMood);
        if (this.mood >= 0 && this.mood < avatars.length) {
            this.image = avatars[tempMood];
        }

    }
    this.update = function () {
        ctx = gameMap.context;
        colorToggle();
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
        if (this.xpos < 50 || this.xpos > gameMap.canvas.width - (this.width + 10) - 50 ||
            this.ypos < 50 || this.ypos > gameMap.canvas.height - (this.height + 10) - 25) {
            this.mood = 2; // Change mood to angry if out of bounds
        }

        this.xpos = Math.round(this.xpos / gridSize) * gridSize;
        this.ypos = Math.round(this.ypos / gridSize) * gridSize;

        //checks if user overlaps with any signs
        for (var i = 0; i < signs.length; i++) {
            //console.log("Checking interaction with sign at index " + i + ": "
            //    + signs[i].xpos + signs[i].ypos + " | " + user.xpos + ", " + user.ypos);
            signs[i].interact(user);
            if (signs[i].interacted) {
                //console.log("Interacted with sign at index " + i);
                index = i; // Store the index of the sign that was clicked
                this.mood = 1; // Change mood to happy
                signs[i].openPage(i);
            }

        }

        for (var i = 0; i < stars.length; i++) {
            //console.log("Checking to collect star at index " + i + ": "
            //    + stars[i].xpos + stars[i].ypos + " | " + user.xpos + ", " + user.ypos);
            stars[i].collect(user);

        }
    }
}

//Avatar movement based on key press
function avatarMovement() {

    if (isOverlayOpen) {
        console.log('Avatar movement disabled while overlay is open.');
        return; // Prevent movement if the overlay is open
    }


    user.speedX = 0;
    user.speedY = 0;
    var moveDistance = 50; // Move one grid square at a time

    // Increase speed when shift is held
    if (gameMap.keys && gameMap.keys[16]) {
        moveDistance *= 2;
    }

    var directions = [];

    var canMove = true;


    // Move left
    if ((gameMap.keys[leftArrow] || gameMap.keys[aKey]) && user.xpos >= 50) {
        canMove = true; directions.push('left');
    }
    // Move right
    if ((gameMap.keys[rightArrow] || gameMap.keys[dKey])
        && user.xpos + user.width <= gameMap.canvas.width - 50) {
        canMove = true; directions.push('right');
    }
    // Move up
    if ((gameMap.keys[upArrow] || gameMap.keys[wKey]) && user.ypos >= 50) {
        canMove = true; directions.push('up');
    }
    // Move down
    if ((gameMap.keys[downArrow] || gameMap.keys[sKey])
        && user.ypos + user.height <= gameMap.canvas.height - 50) {
        canMove = true; directions.push('down');
    }

    if (canMove === false) {
        directions = null;
        directions.push('none');
        user.mood = 2; // Change mood to sad
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

    //uses switch cases to allow for multi-directional movement
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
        case null:
            user.speedX = 0;
            user.speedY = 0;
            lastDirection = 'null';
            break;
    }
    user.newPos();
}

//loads the avatar images
function imageLoader(inst) {
    for (let i = inst * 3; i < inst * 3 + 3; i++) {
        avatars[i] = new Image();
        avatars[i].src = `./avatarss/avatar${i}.png`;
    console.log("Loaded avatar images: " + inst);
}

//toggles the multiplier for color for the user depending on the user input
//if those colors haven't been loaded yet, it will not do anything
function colorToggle() {
    if (deposited > 4) {
        document.addEventListener('keydown', (event) => {
            if (event.key <= (deposited / 4) + 1 && event.key > 0) {
                if (event.key === '1') {
                    user.multiplier = 0; // Reset multiplier to 0
                } else if (event.key === '2') {
                    user.multiplier = 1; // Set multiplier to 1
                }
                else if (event.key === '3') {
                    user.multiplier = 2; // Set multiplier to 2
                } else if (event.key === '4') {
                    user.multiplier = 3; // Set multiplier to 3
                }
            }
        });
    }
}

//creates the sign object
function sign(width, height, xpos, ypos, interacted, page) {
    this.gameMap = gameMap;
    this.width = width;
    this.height = height;
    this.xpos = xpos;
    this.ypos = ypos;

    this.interacted = false;

    //redraws the sign on the map
    this.update = function () {
        ctx = gameMap.context;
        roundedRect(this.xpos, this.ypos, this.width, this.height, 5, '#002855');
        ctx.fillStyle = '#fdf6e3';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = '20px Arial';
        let label = page.substring(page.indexOf('n') + 1); // Remove 'open' from the page name
        // Center of the sign rectangle:
        var centerX = this.xpos + this.width / 2;
        var centerY = this.ypos + this.height / 2;
        ctx.fillText(label, centerX, centerY);

    }

    //determines if the user is interacting with the sign
    this.interact = function (user) {
        if (user.xpos >= this.xpos && user.ypos >= this.ypos
            && user.xpos <= this.xpos + this.width - 50 &&
            user.ypos <= this.ypos + this.height - 50) {
            //console.log("interacted with sign!");
            this.interacted = true;
        } else {
            //console.log("no sign detected");
            this.interacted = false;
        }

    }

    this.openPage = function (index) {
        if (gameMap.keys[space]) {
            console.log("openPage called for sign at " + this.xpos
                + ", " + this.ypos + " | index: " + index);
            openPage(index);
        }
    };
}

function roundedRect(x, y, width, height, radius, color) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fillStyle = color;
    ctx.fill();
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
            // Move the star to the user's position
            this.xpos = ((user.xpos + 10) + Math.cos(this.index / 2.5 * Math.PI) * 30);
            this.ypos = ((user.ypos + 10) + Math.sin(this.index / 2.5 * Math.PI) * 30);
        }
        ctx = gameMap.context;
        ctx.drawImage(starImg, this.xpos, this.ypos, 25, 25); // Use starImg here
    }
    this.collect = function (user) {
        if (inventory.length > 4) {
            console.log("You have collected too many stars!"); // Limit the number of stars that can be collected
        }
        else if (user.xpos >= this.xpos - 50 && user.ypos >= this.ypos - 50
            && user.xpos <= this.xpos + 50 && user.ypos <= this.ypos + 50) {
            //console.log("interacted with star!");
            inventory.push(this); // Add the star to the inventory
            stars.splice(stars.indexOf(this), 1); // Remove the star from the array
            //console.log("Star collected! Inventory size: " + inventory.length);
            //console.log("Star collected! Stars left: " + stars.length);
            this.collected = true;
            this.xpos = user.xpos; // Move the star to the user's position
            this.ypos = user.ypos; // Move the star to the user's position
            this.index = inventory.length;

        }
        else {
            //console.log("no star detected");
            this.collected = false;
        }
    }
}

//creates the initial stars on the map
function createStars(num) {
    for (var i = 0; i < num; i++) { // Create 10 stars   
        var xpos = Math.floor(Math.random() * (gameMap.canvas.width - 50));
        var ypos = Math.floor(Math.random() * (gameMap.canvas.height - 50));
        stars[i] = new star(xpos, ypos, false); // Create a new star object
        stars[i].update(); // Update the star's position
        stars[i].index = i; // Set the index of the star
    }
}

//loads new stars everytime the deposited stars is a greater multiple of 4
function depositStars() {
    deposited += inventory.length; // Increment the deposited count by the number of stars in the inventory
    if (inventory.length > 0 && (deposited / 4) >= user.multiplier && deposited < 16) {
        user.multiplier = Math.floor(deposited / 4); // Set the multiplier based on the deposited stars
        imageLoader(Math.floor(deposited / 4)); // Load the second set of avatar images 
        console.log("Loaded avatar images: " + (deposited / 4));

    }
    if (deposited === 6) {
        createStars(6); // Create new stars when the deposited count reaches 6
    } else if (deposited === 12) {
        createStars(4); // Create new stars when the deposited count reaches 12
    }
    inventory = []; // Clear the inventory
    /*console.log("Star deposited! Inventory size: " + inventory.length);
    console.log("Star deposited! Stars left: " + stars.length);
    console.log("Star deposited! Stars deposited: " + deposited);*/
    updateMap();

    if (deposited === 16) {
        celebrationPage(); // Call the celebration page function when all 12 stars are deposited
    }

}

function celebrationPage() {
    document.getElementById('celebrationOverlay').style.display = 'block';
    isOverlayOpen = true; // Set the flag to true
    let close = document.getElementById('celebrationCloseBtn');
    if (!close) {
        close = document.createElement('button');
        close.id = 'celebrationCloseBtn';
        close.innerText = 'Close';
        document.getElementById('celebrationOverlay').appendChild(close);
    } else {
        close.style.display = 'block';
    }

    close.onclick = function () {
        document.getElementById('celebrationOverlay').style.display = 'none';
        close.style.display = 'none';
        isOverlayOpen = false;
        updateMap(); // Update the map after closing the celebration overlay
    };
}


//Clears map then updates avatar locations as defined
function updateMap() {
    gameMap.clear();
    ctx = gameMap.context;
    for (var i = 0; i < signs.length; i++) {
        signs[i].update();
    }
    for (var j = 0; j < stars.length; j++) {
        stars[j].update();
    }
    for (var k = 0; k < inventory.length; k++) {
        inventory[k].update(); // Update the star's position
    }
    var starHeight = 15;
    for (var i = 0; i < deposited; i++) {
        if (i >= 8) {
            starHeight = 35; // Adjust height for more than 8 stars
        }
        ctx.drawImage(starImg, 1225 + 25 * (i % 4), starHeight
            + (Math.floor(i / 4) * 25), 25, 25);
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
        document.getElementById('portfolioOverlay').style.display = 'block';
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
        // Add event listener to homeCanvas to close the resume overlay
        document.getElementById('homeCanvas').addEventListener('click', () => {
            closeResume(index);
        });
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
    } else if (index === 2) {
        document.getElementById('portfolioOverlay').style.display = 'none';
    }

    // Hide the homeButton div (which contains both canvases)
    const homeButton = document.getElementById('homeButton');
    homeButton.style.display = 'none';

    isOverlayOpen = false; // Set the flag to false
}

document.addEventListener('click', (event) => {
    console.log('Clicked element:', event.target);
});


//add event listener so esc key closes the overlay
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeResume(index);
    }
});


