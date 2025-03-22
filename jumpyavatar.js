// jumpyavatar.js

// Create a canvas element and append it to the document
const canvas = document.createElement('canvas');
canvas.width = 50; // Set canvas width
canvas.height = 50; // Set canvas height
canvas.style.position = 'fixed'; // Change position to fixed
canvas.style.top = '10px'; // Adjust top position
canvas.style.left = '10px'; // Adjust left position
canvas.style.cursor = 'pointer'; // Make it look clickable
canvas.style.border = '2px solid black'; // Add a black border around the canvas

document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

// Box properties
let avatar = {
    x: canvas.width / 2 - 10, // Center horizontally
    y: canvas.height / 2 + 10, // Start vertically in the middle
    width: 20,
    height: 20,
    amplitude: 15, // Amplitude of the sine wave
    frequency: 0.05, // Frequency of the sine wave
    color: '#e74c3c', // Red color
    time: 0 // Time variable for the sine wave
};

// Animation function
function animate() {
     // Clear the canvas
     ctx.clearRect(0, 0, canvas.width, canvas.height);

     ctx.font = '12px Arial'; // Set font size and family
     ctx.fillStyle = '#000'; // Set text color to black
     ctx.textAlign = 'center'; // Center the text horizontally
     ctx.fillText('Home', 25, 15); // Draw text above the box 

     // Calculate the new vertical position using a sine function
     avatar.y = canvas.height / 2 + avatar.amplitude * Math.sin(avatar.time);
 
     // Draw the box
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
    window.location.href = '/index.html'; // Redirect to the home page
});