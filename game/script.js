const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin-btn');
const itemNameInput = document.getElementById('item-name');
const itemQuantityInput = document.getElementById('item-quantity');
const addBtn = document.getElementById('add-btn');
const languageInput = document.getElementById('language');

let language = '0';
let items = [];
let colors = [];
let startAngle = 0;
let arc = 0;
let angularVelocity = 0;
let isSpinning = false;
const friction = 0.985;

function getText(key, replacements = {}) {
    let text = translations[language]?.[key] || translations['0'][key];
    for (const placeholder in replacements) {
        text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    }
    return text;
}

languageInput.addEventListener("change", e => {
    language = e.target.value;
    drawRoulette();
})

canvas.addEventListener('click', function (event) {
    if (items.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const angle = Math.atan2(y - 250, x - 250);

    let adjustedAngle = angle - startAngle;
    while (adjustedAngle < 0) adjustedAngle += 2 * Math.PI;
    const index = Math.floor(adjustedAngle / arc);

    const item = items[index];
    const action = prompt(getText('editPromptText', item));

    // Enter a new name to edit                                                                                                                                                                                                               │
    if (action == '') {
        items.splice(index, 1);
        colors.splice(index, 1);
        drawRoulette();
    } else if (action != null) {
        items[index] = action;
        drawRoulette();
    }
});

function drawRoulette() {
    if (items.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.font = 'bold 30px sans-serif';
        ctx.fillStyle = 'black';
        const text = getText('emptyRoulette');
        ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250);
        ctx.restore();
        return;
    }

    arc = Math.PI / (items.length / 2);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < items.length; i++) {
        const angle = startAngle + i * arc;
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.arc(250, 250, 250, angle, angle + arc);
        ctx.lineTo(250, 250);
        ctx.fill();

        ctx.save();
        // name of item
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px sans-serif';
        ctx.translate(250 + Math.cos(angle + arc / 2) * 180, 250 + Math.sin(angle + arc / 2) * 180);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        const text = items[i];
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        ctx.restore();
    }
}

function spin() {
    if (isSpinning) return;
    if (items.length === 0) {
        alert(getText('spinAlert'));
        return;
    }
    isSpinning = true;
    angularVelocity = Math.random() * 0.2 + 0.2; // Initial velocity
    animate();
}

function animate() {
    if (!isSpinning) return;

    startAngle += angularVelocity;
    angularVelocity *= friction;

    drawRoulette();

    if (angularVelocity < 0.001) {
        isSpinning = false;
        angularVelocity = 0;
        const degrees = startAngle * 180 / Math.PI + 90;
        const arcd = arc * 180 / Math.PI;
        const index = Math.floor((360 - degrees % 360) / arcd);
        ctx.save();

        ctx.font = 'bold 30px sans-serif';
        ctx.fillStyle = 'black';
        const text = `${getText('winner')}: ${items[index]}`;
        ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10);
        ctx.restore();
    } else {
        requestAnimationFrame(animate);
    }
}

function addItem() {
    const name = itemNameInput.value;
    const quantity = parseInt(itemQuantityInput.value);

    if (!name || isNaN(quantity) || quantity < 1) {
        alert(getText('addItemAlert'));
        return;
    }

    for (let i = 0; i < quantity; i++) {
        items.push(name);
        colors.push(`hsl(${Math.random() * 360}, 70%, 70%)`);
    }

    itemNameInput.value = '';
    itemQuantityInput.value = '1';
    drawRoulette();
}

addBtn.addEventListener('click', addItem);
spinBtn.addEventListener('click', spin);

drawRoulette();