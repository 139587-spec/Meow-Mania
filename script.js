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

//variables
let meows = 0;
let treats = 0;
let meowsPerClick = 1;
let meowsPerSecond = 0;
let pawLevel = 0;
let helperLevel = 0;
let craftingSlots = 1;
let rareYarnActive = false;
let lastClickedElement = null;

const inventory = {
    Toy: 0,
    Bed: 0,
    Blanket: 0
};

//This saves the game progress to local storage
function savegame() {
    const gameState = {
        meows,
        treats,
        meowsPerClick,
        meowsPerSecond,
        pawLevel,
        helperLevel,
        craftingSlots,
        rareYarnActive,
        inventory
    };
    sessionStorage.setItem('meowManiaSave', JSON.stringify(gameState));
}

//This loads the game progress from local storage
function loadGame() {
    const saved = sessionStorage.getItem('meowManiaSave');
    if (saved) {
        const gameState = JSON.parse(saved);
        meows = gameState.meows || 0;
        treats = gameState.treats || 0;
        meowsPerClick = gameState.meowsPerClick || 1;
        meowsPerSecond = gameState.meowsPerSecond || 0;
        pawLevel = gameState.pawLevel || 0;
        helperLevel = gameState.helperLevel || 0;
        craftingSlots = gameState.craftingSlots || 1;
        rareYarnActive = gameState.rareYarnActive || false;
        Object.assign(inventory, gameState.inventory || {Toy:0, Bed:0, Blanket:0});
    }
}

//ALL DOM elements
const meowsDisplay = document.getElementById('meows');
const treatsDisplay = document.getElementById('treats');
const pawBar = document.getElementById('paw-level');
const helperBar = document.getElementById('helper-level');
const yarn = document.getElementById('yarn');
const clickEffect = document.getElementById('click-effects');
const upgradePawBtn = document.getElementById('upgrade-paw');
const hireHelperBtn = document.getElementById('hire-helper');
const buyYarnBtn = document.getElementById('buy-yarn');
const expandCaféBtn = document.getElementById('expand-cafe');
const craftingSlotsContainer = document.getElementById('crafting-slots');
const inventoryDisplay = document.getElementById('inventory');
const sellItemsBtn = document.getElementById('sell-items');
const achievementList = document.getElementById('achievement-list');
const popup = document.getElementById('popup');
const achievementSound = new Audio('assets/achievement.wav');
achievementSound.volume = 0.2;

//Helper functions
function updateDisplay() {
    animateCounter(meowsDisplay, meows);
    animateCounter(treatsDisplay, treats);
    pawBar.style.width = `${Math.min(pawLevel * 20, 100)}%`;
    helperBar.style.width = `${Math.min(helperLevel * 20, 100)}%`;
    inventoryDisplay.textContent = `Toy: ${inventory.Toy} | Bed: ${inventory.Bed} | Blanket: ${inventory.Blanket}`;
    animateGlow();
}

function showPopup(message, targetElement = null) {
    popup.textContent = message;

    const el = targetElement || lastClickedElement;

    if (el) {
        //so that the popup appears near the action
        const rect = el.getBoundingClientRect();
        popup.style.top = `${rect.top + window.scrollY - 10}px`;
        popup.style.left = `${rect.left + rect.width / 2}px`;
        popup.style.transform = 'translateX(-50%)';
    } else {
        //sets to default center of the viewport
        popup.style.top = '20%';
        popup.style.left = '50%';
    }

    //animation
    popup.style.display = 'block';
    requestAnimationFrame(() => {
        popup.style.opacity = 1;
        popup.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        popup.style.opacity = 0;
        popup.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {popup.style.display = 'none';}, 400)
    }, 1500);
}

//Counter Animation
function animateCounter(element, target) {
    const current = parseInt(element.textContent) || 0;
    const step = Math.ceil((target - current) / 10);
    if (current < target) {
        element.textContent = current + step;  
        requestAnimationFrame(() => animateCounter(element, target));
    } else {
        element.textContent = target;
    }
}

//How the clicker works
yarn.addEventListener('click', (e) => {
    lastClickedElement = e.target;
    let earned = meowsPerClick;
    if (rareYarnActive) earned *= 2;
    meows += earned;

    animateClickEffect(5); //this creates multiple sparkles
    animateYarnClick();
    updateDisplay();
    unlockAchievement('First Meow');
    savegame();
});

//The Multiple Sparkles
function animateClickEffect(count) {
    for (let i = 0; i < count; i++) {
        const sparkle = document.createElement('div');
        sparkle.textContent = '✨';
        sparkle.style.position = 'absolute';
        sparkle.style.top = `${(Math.random() - 0.5) * 50}px`;
        sparkle.style.left = `${(Math.random() - 0.5) * 50}px`;
        sparkle.style.fontSize = `${Math.random() * 12}px`;
        sparkle.style.opacity = 1;
        sparkle.style.transition = 'all 0.8s ease-out';
        clickEffect.appendChild(sparkle);

        setTimeout(() => {
            sparkle.style.top = `${parseFloat(sparkle.style.top) - 30}px`;
            sparkle.style.opacity = 0;
        }, 50);

        setTimeout(() => clickEffect.removeChild(sparkle), 850);
    }
}


//The yarn bounce effects
function animateYarnClick() {
    yarn.style.transform = 'scale(1.15) rotate(-5deg)';
    setTimeout(() => {
        yarn.style.transform = 'scale(1) rotate(0deg)'
    }, 150);
}

//color shift - really subtle
function animateGlow() {
    //Yarn pulsing
    const time = Date.now() / 1000;
    const hue = 25 + 10 * Math.sin(time* 2); //pastel purple to blue shift
    yarn.style.boxShadow = `0 0 20px hsla(${hue}, 80%, 60%, 0.7)`;

    //glow for shop items
    document.querySelectorAll('.shop-item').forEach(item => {
        const hueShift = 20 + 8 * Math.sin(time);
        item.style.boxShadow = `0 4px 12px hsla(${hueShift}, 80%, 60%, 0.7)`;
    });
}
setInterval(animateGlow, 50); //the glow continues

//buttons for shop
upgradePawBtn.addEventListener('click', (e) => {
    lastClickedElement = e.target;
    if (meows >= 50) {
        meows -= 50;
        pawLevel += 1;
        meowsPerClick += 1;
        updateDisplay();
        unlockAchievement('Paw Boosted');
        savegame();
    } else showPopup('Sorry, not enough treats!', e);
});

hireHelperBtn.addEventListener('click', (e) => {
    if (meows >= 200) {
        meows -= 200;
        helperLevel += 1;
        meowsPerSecond += 1;
        updateDisplay();
        unlockAchievement('Cat Crew');
        savegame();
    } else showPopup('Sorry, not enough treats!', e);
});

buyYarnBtn.addEventListener('click', (e) => {
    if (meows >= 300) {
        meows -= 300;
        rareYarnActive = true;
        showPopup('Rare Yarn Activated! x2 meows for 30s!');
        updateDisplay();
        setTimeout(() => {
            rareYarnActive = false;
            showPopup("Rare Yarn Effect Wore Off!");
        }, 30000);
    } else showPopup('Sorry, not enough meows!', e);
});

expandCaféBtn.addEventListener('click', (e) => {
    if (meows >= 500) {
        meows -= 500;
        craftingSlots += 1;
        createCraftingSlot();
        updateDisplay();
        showPopup("Café Expanded!")
        savegame();
    } else showPopup('Sorry, not enough meows!', e);
});

//ALL Crafting
function createCraftingSlot() {
    craftingSlotsContainer.innerHTML = '';

    const costs = {
        Toy: 20,
        Bed: 35,
        Blanket: 60
    };

    for (let i = 0; i < craftingSlots; i++) {
        const slot = document.createElement('div');
        slot.className = 'crafting-slot';
        slot.innerHTML = `
          <button onclick="craftItem('Toy')">Toy</button>
          <p class="craft-cost">Cost: ${costs.Toy} meows</p>

          <button onclick="craftItem('Bed')">Toy</button>
          <p class="craft-cost">Cost: ${costs.Bed} meows</p>

          <button onclick="craftItem('Blanket')">Toy</button>
          <p class="craft-cost">Cost: ${costs.Blanket} meows</p>
        `;
        craftingSlotsContainer.appendChild(slot);
    }
}
createCraftingSlot();

function craftItem(item) {
    const costs = {
        Toy: 20,
        Bed: 35,
        Blanket: 60
    };

    const cost = costs[item];

    //check if enough stitches
    if (meows >=cost) {
        meows -= cost;
        inventory[item] += 1;
        showPopup(`Crafted a ${item}`);
        updateDisplay();

        //unlock achievements
        if (inventory.Toy + inventory.Bed + inventory.Blanket === 1) {
            unlockAchievement('First Toy Made');
        }

        const totalItems = inventory.Toy + inventory.Bed + inventory.Blanket;
        if (totalItems >=50) unlockAchievement('Master of Meows');
        savegame();
    } else {
        showPopup(`Sorry, not enough meows to craft a ${item}!`);
    }
}

//Selling items
sellItemsBtn.addEventListener('click', (e) => {
    lastClickedElement = e.target
    if (inventory.Toy + inventory.Bed + inventory.Blanket > 0) {
        //calculates the treats based off of the item
        const earnedTreats = inventory.Toy * 15 + inventory.Bed * 25 + inventory.Blanket * 40;

        treats += earnedTreats;

        //reset the inventory
        inventory.Toy = 0;
        inventory.Bed = 0;
        inventory.Blanket = 0;

        updateDisplay();
        showPopup(`Sold all items for ${earnedTreats} treats!`, e.target);
        savegame();
    } else {
        showPopup('No items to sell!', e.target);
    }
});

//the passive income from helpers
setInterval(() => {
    meows += meowsPerSecond;
    updateDisplay();
}, 1000);

//the achievement unlock function
function unlockAchievement(name, targetElement = null) {
    const achievement = [...achievementList.children].find(
        a => a.dataset.name === name
    );

    if (achievement && !achievement.classList.contains('unlocked')) {
    ///this marks it as unlocked
    achievement.classList.add('unlocked');
    achievement.style.transform = 'scale(1.1)';
    achievement.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    achievement.style.boxShadow = '0 0 15px rgba(255, 194, 150, 0.8)';
    
    //resetting the animation 
    setTimeout(() => {
        achievement.style.transform = 'scale(1)';
        achievement.style.boxShadow = '';
    }, 400);
    
    //popup message
    showPopup(`Achievement Unlocked: ${name}!`, targetElement);

    //sound
    achievementSound.currentTime = 0;
    achievementSound.play();
    }
}

//initialize
window.craftItem = craftItem; //make craftitem globally accessible

loadGame();
updateDisplay();

//glow pulse for yarn
const yarnElement = document.getElementById('yarn');
yarnElement.classList.add('yarn-glow-animation');

//reset button
document.addEventListener('DOMContentLoaded', () => {
const resetBtn = document.getElementById('reset-game');

resetBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to reset the game?")) {
        //this will clear the local history
        sessionStorage.removeItem('meowManiaSave');

        //reset all the variables
        meows = 0;
        treats = 0;
        meowsPerClick = 1;
        meowsPerSecond = 0;
        pawLevel = 0;
        helperLevel = 0;
        craftingSlots = 1;
        rareYarnActive = false;
        Object.keys(inventory).forEach(key => inventory[key] = 0);

        //reset acheivements visually
        document.querySelectorAll('achievement-list .achievement').forEach(a => {
            a.classList.remove('unlocked');
            a.style.boxShadow = '';
            a.style.transform = '';
        });

        //refresh the crafting slots
        createCraftingSlot();

        //update the display
        updateDisplay();

        //popup
        showPopup("Game Fully Reset!");
    }
});
});
