// Create a canvas element and append it to the document
const minicanvas = document.createElement('canvas');
minicanvas.id = 'minicanvas'; // Assign an ID for styling
minicanvas.width = 50;
minicanvas.height = 50;
homeButton.appendChild(minicanvas);

const ctx = minicanvas.getContext('2d');

// Box properties
let avatar = {
    x: minicanvas.width / 2 - 15,
    y: minicanvas.height / 2 + 10,
    width: 30,
    height: 30,
    amplitude: 15, // Amplitude
    frequency: 0.05, // Frequency
    time: 0,
    image: "avatar.png"// Set the source to the avatar image
};

// Load the avatar image
avatar.imageObj = new Image();
avatar.imageObj.src = avatar.image; // Set the source to the avatar image

// Animation function
function animate() {
    // Clear the canvas
    ctx.clearRect(0, 0, minicanvas.width, minicanvas.height);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText('Home', 25, 15);

    // Calculate the new vertical position using a sine function
    avatar.y = minicanvas.height / 2 + avatar.amplitude * Math.sin(avatar.time);

    // Draw the avatar image
    ctx.drawImage(avatar.imageObj, avatar.x, avatar.y, avatar.width, avatar.height);

    // Increment the time variable to progress the sine wave
    avatar.time += avatar.frequency;

    // Request the next frame
    requestAnimationFrame(animate);
}

// Start the animation
animate();

minicanvas.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent interference with homeCanvas
    console.log('Jumpy avatar canvas clicked!');
});