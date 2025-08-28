const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin-btn');
const itemNameInput = document.getElementById('item-name');
const itemQuantityInput = document.getElementById('item-quantity');
const addBtn = document.getElementById('add-btn');
const languageInput = document.getElementById('language');
const resetBtn = document.getElementById('reset-btn');

let language = '0';
// 아이템 구조를 { name, quantity }로 변경
let items = []; // [{ name: 'item', quantity: 2 }, ...]
let colors = [];
let startAngle = 0;
let arc = 0;
let angularVelocity = 0;
let isSpinning = false;
const friction = 0.985;

// 캔버스 크기를 화면에 맞게 조정하는 함수
function resizeCanvas() {
    // 부모 요소의 크기에 맞추거나, window 크기에 맞추기
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
    canvas.width = size;
    canvas.height = size;
    drawRoulette();
}
function getText(key, replacements = {}) {
    let text = translations[language]?.[key] || translations['0'][key];
    for (const placeholder in replacements) {
        text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    }
    return text;
}

// reset 버튼 이벤트
resetBtn.addEventListener("click", e => {
    items = [];
    colors = [];
    drawRoulette();
});
languageInput.addEventListener("change", e => {
    language = e.target.value;
    addBtn.textContent = getText('add-btn');
    spinBtn.textContent = getText('spin-btn');
    itemNameInput.placeholder = getText('itemNameInput');
    resetBtn.textContent = getText('reset-btn');
    drawRoulette();
})

// canvas 클릭 이벤트도 구조에 맞게 수정
canvas.addEventListener('click', function (event) {
    if (items.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const radius = canvas.width / 2;
    // 클릭 위치의 각도를 라디안으로 계산합니다.
    // atan2(y, x) 함수는 원점(0,0)과 점(x,y) 사이의 각도를 라디안으로 반환합니다.
    // 여기서는 원의 중심을 (radius, radius)로 간주하여 각도를 계산합니다.
    const angle = Math.atan2(y - radius, x - radius);

    let adjustedAngle = angle - startAngle;
    while (adjustedAngle < 0) adjustedAngle += 2 * Math.PI;

    // 어느 섹터인지 찾기
    // 모든 항목의 quantity(수량) 합계를 계산합니다.
    const total = items.reduce((sum, item) => sum + item.quantity, 0);
    // 누적 각도를 추적하는 변수와 클릭된 섹터의 인덱스를 초기화합니다.
    let acc = 0;
    let index = 0;
    for (let i = 0; i < items.length; i++) {
        // 각 항목이 차지하는 각도(라디안)를 계산합니다.
        const span = (items[i].quantity / total) * 2 * Math.PI;
        // 조정된 각도가 현재 섹터의 끝 각도보다 작으면
        // 해당 섹터에 속한 것으로 간주하고 루프를 종료합니다.
        if (adjustedAngle < acc + span) {
            index = i;
            break;
        }
        // 다음 섹터의 시작 각도를 위해 현재 섹터의 각도를 누적합니다.
        acc += span;
    }
    const item = items[index];
    const action = prompt(getText('editPromptText', item));

    // 사용자가 입력 없이 확인을 누르면
    // 해당 항목과 색상을 배열에서 제거하고 룰렛을 다시 그립니다.
    if (action == '') {
        items.splice(index, 1);
        colors.splice(index, 1);
        drawRoulette();
    } else if (action != null) {
        // items[index].name = action;
        // 이름이 변경됐을 때, 이미 같은 이름이 있으면 합치기
        const existingIdx = items.findIndex((item, i) => item.name === action && i !== index);
        if (existingIdx !== -1) {
            // 수량 합치기
            items[existingIdx].quantity += items[index].quantity;
            // 현재 아이템과 색상 삭제
            items.splice(index, 1);
            colors.splice(index, 1);
        } else {
            items[index].name = action;
        }
        drawRoulette();
    }
    console.log(items)
});


function drawRoulette() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (items.length === 0) {
        ctx.save();
        ctx.font = 'bold 30px sans-serif';
        ctx.fillStyle = 'black';
        const text = getText('emptyRoulette');
        ctx.fillText(text, canvas.width / 2 - ctx.measureText(text).width / 2, canvas.height / 2);
        ctx.restore();
        return;
    }

    // 전체 개수 합
    const total = items.reduce((sum, item) => sum + item.quantity, 0);
    let currentAngle = startAngle;
    const radius = canvas.width / 2;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const angleSpan = (item.quantity / total) * 2 * Math.PI;

        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.arc(radius, radius, radius, currentAngle, currentAngle + angleSpan);
        ctx.lineTo(radius, radius);
        ctx.fill();

        ctx.save();
        // name of item
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px sans-serif';

        const midAngle = currentAngle + angleSpan / 2;
        ctx.translate(
            radius + Math.cos(midAngle) * radius * 0.72,
            radius + Math.sin(midAngle) * radius * 0.72
        );
        ctx.rotate(midAngle + Math.PI / 2);
        const text = `${item.name} (${item.quantity})`;
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        ctx.restore();

        currentAngle += angleSpan;
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


// spin 함수에서 당첨자 계산도 비율에 맞게 변경
function animate() {
    if (!isSpinning) return;

    startAngle += angularVelocity;
    angularVelocity *= friction;

    drawRoulette();

    if (angularVelocity < 0.001) {
        isSpinning = false;
        angularVelocity = 0;

        // 당첨자 계산
        const total = items.reduce((sum, item) => sum + item.quantity, 0);
        let angle = (startAngle % (2 * Math.PI));
        if (angle < 0) angle += 2 * Math.PI;
        let acc = 0;
        let winnerIdx = 0;
        for (let i = 0; i < items.length; i++) {
            const span = (items[i].quantity / total) * 2 * Math.PI;
            if (angle < acc + span) {
                winnerIdx = i;
                break;
            }
            acc += span;
        }

        ctx.save();

        ctx.font = 'bold 30px sans-serif';
        ctx.fillStyle = 'black';
        const text = `${getText('winner')}: ${items[winnerIdx].name}`;
        ctx.fillText(text, canvas.width / 2 - ctx.measureText(text).width / 2, canvas.height / 2 + 10);
        ctx.restore();
    } else {
        requestAnimationFrame(animate);
    }
}

function addItem() {
    const name = itemNameInput.value.trim();
    const quantity = parseInt(itemQuantityInput.value);

    if (!name || isNaN(quantity) || quantity < 1) {
        alert(getText('addItemAlert'));
        return;
    }

    // 이미 있는 아이템이면 개수만 증가
    const idx = items.findIndex(item => item.name === name);
    if (idx !== -1) {
        items[idx].quantity += quantity;
    } else {
        items.push({ name, quantity });
        colors.push(`hsl(${Math.random() * 360}, 70%, 70%)`);
    }

    itemNameInput.value = '';
    itemQuantityInput.value = '1';
    drawRoulette();
}

addBtn.addEventListener('click', addItem);
spinBtn.addEventListener('click', spin);

// 윈도우 리사이즈 시 캔버스 크기 조정
window.addEventListener('resize', resizeCanvas);

// 최초 실행 시 캔버스 크기 조정
resizeCanvas();
drawRoulette();