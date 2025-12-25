//background particles
const canvas = document.getElementById('season-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//this determines what season it is
const month = new Date().getMonth();
let season = 'winter'; 
if (month >= 2 && month <= 4) season = 'spring';
else if (month >= 5 && month <= 7) season = 'summer';
else if (month >= 8 && month <= 10) season = 'autumn';

const images =  {
    winter: new Image(),
    spring: new Image(),
    summer: new Image(),
    autumn: new Image()
};

images.winter.src = 'assets/snowflake.png';
images.spring.src = 'assets/flower.png';
images.summer.src = 'assets/watermelon.png';
images.autumn.src = 'assets/leaf.png';

const particles = [];
const particleCount = 60;

//initialize particles
for (let i = 0; i < particleCount; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: (i / particleCount) * canvas.height,
        size: 20 + Math.random() * 30,
        offset: Math.random() * 1000,
        angle: Math.random() * 360/180 * Math.PI,
        scale: 0.5 + Math.random() * 0.5,
        flipX: Math.random() > 0.5 ? -1 : 1,
        flipY: Math.random() > 0.5 ? -1 : 1
    });
}

//movement being applied
    const speed = { x: 0, y:1};
    const summerBounce = 0.5;

//Animation loop
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);

        //random mirroring and scale
        ctx.scale(p.flipX * p.scale, p.flipY * p.scale);

        //draw the image centered
        const img = images[season];
        const maxSize = 80;
        const scale = p.scale * ( maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    
        ctx.globalCompositeOperation = 'destination-over';
        ctx.globalAlpha = 0.7;
        ctx.drawImage(
            img,
            -img.naturalWidth / 2,
            -img.naturalHeight / 2,
            img.naturalWidth * scale,
            img.naturalHeight * scale
        );
    
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();

        //movement
        p.x += speed.x;
        p.y += speed.y;

        //summer bounce effect
        if (season === 'summer') {
            p.y += Math.sin((Date.now() + p.offset) / 300) * summerBounce;
        }

        //this wraps it around the edges
        if (p.y > canvas.height) p.y = -p.size;
        if (p.y < -p.size) p.y = canvas.height;
        if (p.x > canvas.width) p.x = -p.size;
        if (p.x < -p.size) p.x = canvas.width;
    });

    requestAnimationFrame(animateParticles);
}

//this sizes the canvas onto the window
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
    
const allImages = Object.values(images);
let loadedCount = 0;

allImages.forEach(img => {
    img.onload = () => {
        loadedCount++;
        if (loadedCount === allImages.length) {
            animateParticles();
        }
    }
});