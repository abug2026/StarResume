// Create a canvas element and append it to the document
const canvas = document.createElement('canvas');
canvas.width = 50; 
canvas.height = 50; 
canvas.style.position = 'fixed'; 
canvas.style.top = '10px'; 
canvas.style.left = '10px'; 
canvas.style.cursor = 'pointer'; // Make it look clickable
canvas.style.border = '2px solid black'; 
canvas.style.zIndex = '1000'; // Bring the canvas to the front
canvas.style.pointerEvents = 'auto'; // Ensure the canvas can receive pointer events
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

// Box properties
let avatar = {
    x: canvas.width / 2 - 10,
    y: canvas.height / 2 + 10, 
    width: 20,
    height: 20,
    amplitude: 15, // Amplitude 
    frequency: 0.05, // Frequency 
    color: '#e74c3c', 
    time: 0 
};

// Animation function
function animate() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = '12px Arial'; 
    ctx.fillStyle = '#000'; 
    ctx.textAlign = 'center'; 
    ctx.fillText('Home', 25, 15); 

    // Calculate the new vertical position using a sine function
    avatar.y = canvas.height / 2 + avatar.amplitude * Math.sin(avatar.time);

    ctx.fillStyle = avatar.color;
    ctx.fillRect(avatar.x, avatar.y, avatar.width, avatar.height);

    // Increment the time variable to progress the sine wave
    avatar.time += avatar.frequency;

    // Request the next frame
    requestAnimationFrame(animate);
}

// Start the animation
animate();

// Add click event to navigate to the home page
canvas.addEventListener('click', () => {
    console.log('Canvas clicked!'); 
    window.location.href = '/index.html'; // Redirect
});