const endScreen = document.getElementById('endScreen');

const ctx = endScreen.getContext('2d');

// Avatar class
function avatar(x, y, imageSrc) {
    this.x = x;
    this.starting = y;
    this.y = y;
    this.width = 60;
    this.height = 60;
    this.amplitude = 60 + Math.random() * 50;
    this.frequency = 0.05 + Math.random() * 0.01;
    this.time = Math.random() * Math.PI * 2;
    this.image = new Image();
    this.image.src = imageSrc;
}

// Star class
function star(x, y, speed, size) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.size = size;
    this.image = star.starImage;
}
star.starImage = new Image();
star.starImage.src = 'star.png';

// Setup avatars in the bottom half of the screen
const avatarImages = ["avatar1.png", "avatar4.png", "avatar7.png", "avatar10.png"];
const avatars = [];
const avatarSpacing = endScreen.width / (avatarImages.length + 1);
for (let i = 0; i < avatarImages.length; i++) {
    avatars.push(
        new avatar(
            avatarSpacing * (i + 1) - 30,
            endScreen.height * 0.7,
            avatarImages[i]
        )
    );
}

// Setup stars
const stars = [];
const STAR_COUNT = 30;
function spawnStar() {
    const x = Math.random() * endScreen.width;
    const y = -30 - Math.random() * 100;
    const speed = 2 + Math.random() * 3;
    const size = 15 + Math.random() * 4;
    return new star(x, y, speed, size);
}
for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(spawnStar());
}

// Animation function
function animate() {
    console.log("Animating celebration screen");
    ctx.clearRect(0, 0, endScreen.width, endScreen.height);

    // Draw and update stars
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        ctx.drawImage(star.image, star.x, star.y, star.size, star.size);
        star.y += star.speed;
        if (star.y > endScreen.height + 40) {
            // Respawn at top
            stars[i] = spawnStar();
        }
    }

    // Draw and update avatars (bouncing in bottom half)
    for (let i = 0; i < avatars.length; i++) {
        let avatar = avatars[i];
        avatar.y = avatar.starting + avatar.amplitude * Math.sin(avatar.time);
        ctx.drawImage(avatar.image, avatar.x, avatar.y, avatar.width, avatar.height);
        avatar.time += avatar.frequency;
    }

    requestAnimationFrame(animate);
}
animate();

