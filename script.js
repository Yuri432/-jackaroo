// ==========================================================
// JACKAROO GAME LOGIC (script.js) - WITH BASIC AI
// ==========================================================

const gameBoard = document.getElementById('game-board');
const diceButton = document.getElementById('dice-button');
const rollResult = document.getElementById('roll-result');
const currentPlayerDisplay = document.getElementById('current-player');

const totalSpaces = 52; 
const boardRadius = 250; 
const centerOffset = 300; 
const PLAYER_COLORS = ['Red', 'Blue']; // Red is Human, Blue is AI
const AI_PLAYER = 'Blue'; 

let currentPlayer = 'Red';
let currentRoll = 0;
let isMoving = false; // ป้องกันการคลิกซ้ำขณะกำลังย้ายหมาก

const START_POSITIONS = { 
    'red': 0, 
    'blue': 13, 
    'green': 26, 
    'yellow': 39 
};


// ----------------------------------------------------------
// 1. BOARD SETUP FUNCTIONS
// ----------------------------------------------------------

function createHomesAndSafetyZones() {
    const homeContainer = document.getElementById('game-board');

    PLAYER_COLORS.forEach(color => {
        const lowerColor = color.toLowerCase();
        
        // 1. สร้างรัง (Home Base) 4 ช่อง
        for (let i = 0; i < 4; i++) {
            const homeSpace = document.createElement('div');
            homeSpace.classList.add('home-space', `home-${lowerColor}`);
            homeSpace.id = `home-${lowerColor}-${i}`;
            homeContainer.appendChild(homeSpace);
        }

        // 2. สร้างเส้นทางปลอดภัย (Safety Zone) 5 ช่อง
        for (let i = 0; i < 5; i++) {
            const safetySpace = document.createElement('div');
            safetySpace.classList.add('safety-space', `safety-${lowerColor}`);
            safetySpace.id = `safety-${lowerColor}-${i}`;
            safetySpace.textContent = `S${i+1}`; 
            homeContainer.appendChild(safetySpace);
        }
    });

    // 3. สร้างจุดจบ (Finish/Goal)
    const goal = document.createElement('div');
    goal.id = 'game-goal';
    goal.textContent = 'GOAL';
    homeContainer.appendChild(goal);
}

function createMarbles() {
    PLAYER_COLORS.forEach(color => {
        const lowerColor = color.toLowerCase();
        
        for (let i = 0; i < 4; i++) {
            const marble = document.createElement('div');
            marble.classList.add('marble', `marble-${lowerColor}`);
            marble.id = `marble-${lowerColor}-${i}`;
            marble.setAttribute('data-color', lowerColor);
            marble.setAttribute('data-position', `home-${lowerColor}-${i}`);
            
            const homeSpace = document.getElementById(`home-${lowerColor}-${i}`);
            if (homeSpace) {
                homeSpace.appendChild(marble);
            }
        }
    });
}

function createBoard() {
    gameBoard.innerHTML = ''; 
    const angleIncrement = (360 / totalSpaces) * (Math.PI / 180); 
    
    for (let i = 0; i < totalSpaces; i++) {
        const space = document.createElement('div');
        space.classList.add('board-space');
        space.id = `space-${i}`;
        
        const angle = i * angleIncrement;
        const x = (boardRadius * Math.cos(angle)) + centerOffset - 15; 
        const y = (boardRadius * Math.sin(angle)) + centerOffset - 15; 

        space.style.left = `${x}px`;
        space.style.top = `${y}px`;
        
        const startColors = Object.keys(START_POSITIONS);
        startColors.forEach(color => {
            if (i === START_POSITIONS[color]) {
                space.classList.add(`start-${color}`);
            }
        });
        
        space.textContent = i; 
        gameBoard.appendChild(space);
    }
    
    createHomesAndSafetyZones();
    createMarbles();
}


// ----------------------------------------------------------
// 2. GAME LOGIC FUNCTIONS
// ----------------------------------------------------------

function sendMarbleHome(marble) {
    const color = marble.getAttribute('data-color');
    
    let foundHome = false;
    for (let i = 0; i < 4; i++) {
        const homeId = `home-${color}-${i}`;
        const homeSpace = document.getElementById(homeId);
        
        if (homeSpace && homeSpace.children.length === 0) {
            homeSpace.appendChild(marble);
            marble.setAttribute('data-position', homeId);
            foundHome = true;
            break;
        }
    }
}

function moveMarble(marble, roll) {
    const currentPos = marble.getAttribute('data-position');
    const color = marble.getAttribute('data-color');
    const startSpaceIndex = START_POSITIONS[color];
    
    let newPositionId;
    let newIndex = -1;

    if (currentPos.startsWith('home-') && (roll === 1 || roll === 6)) {
        // A. ออกจากรัง
        newPositionId = `space-${startSpaceIndex}`;
        
    } else if (currentPos.startsWith('space-')) {
        // B. เดินบนกระดานหลัก
        const currentSpaceIndex = parseInt(currentPos.split('-')[1]);
        
        // *** ตรวจสอบการเดินเข้า Safety Zone ***
        const movesToSafety = (startSpaceIndex - currentSpaceIndex + totalSpaces) % totalSpaces;
        
        if (roll === movesToSafety && roll > 0) {
            // หมากกำลังจะเดินถึงช่องเข้าบ้าน (Start Space ของตัวเอง) พอดี
            newPositionId = `safety-${color}-0`; // เข้า Safety Zone ช่องแรก
            // **TODO: ตรรกะการเข้า Safety Zone
        
        } else if (currentSpaceIndex + roll >= totalSpaces && startSpaceIndex === 0) {
            // กรณี Red (Start=0) เดินข้ามช่อง 51
            // **TODO: ตรรกะการเข้า Safety Zone สำหรับ Red
            
        } else {
            // เดินบนกระดานหลักทั่วไป (วนรอบ)
            newIndex = (currentSpaceIndex + roll) % totalSpaces;
            newPositionId = `space-${newIndex}`;
        }
    }
    
    // 3. ดำเนินการย้ายหมาก
    if (newPositionId) {
        const newSpace = document.getElementById(newPositionId);
        
        // 4. ตรวจสอบการกิน (Jumping)
        if (newPositionId.startsWith('space-') && newSpace.children.length > 0) {
            const existingMarble = newSpace.children[0];
            const existingMarbleColor = existingMarble.getAttribute('data-color');
            
            if (existingMarbleColor !== color) {
                sendMarbleHome(existingMarble);
                console.log(`Captured ${existingMarbleColor}!`);
            } else {
                // เดินทับหมากฝ่ายเดียวกัน ไม่อนุญาต
                return false; 
            }
        }
        
        // 5. ย้ายหมากจริง
        newSpace.appendChild(marble);
        marble.setAttribute('data-position', newPositionId);
        return true;
    }
    return false;
}

function switchPlayer() {
    const currentIndex = PLAYER_COLORS.indexOf(currentPlayer);
    const nextIndex = (currentIndex + 1) % PLAYER_COLORS.length;
    currentPlayer = PLAYER_COLORS[nextIndex];
    
    currentPlayerDisplay.textContent = `Current Player: ${currentPlayer}`;
    
    if (currentPlayer === AI_PLAYER) {
        // ถ้าตา AI
        setTimeout(handleAIMove, 1000); 
    } else {
        // ถ้าตาคน
        diceButton.disabled = false;
    }
}

function highlightPossibleMoves(roll, color) {
    let hasMove = false;
    const playerMarbles = document.querySelectorAll(`.marble-${color.toLowerCase()}`);
    
    playerMarbles.forEach(marble => {
        const currentPos = marble.getAttribute('data-position');
        let isMoveValid = false;
        
        // 1. ตรวจสอบการออกจากรัง
        if (currentPos.startsWith('home-') && (roll === 1 || roll === 6)) {
            isMoveValid = true;
        } 
        // 2. ตรวจสอบการเดินบนกระดาน (ไม่ซับซ้อนเกินไป)
        else if (currentPos.startsWith('space-')) {
            // **TODO: การตรวจสอบที่ซับซ้อน (เข้า Safety Zone, เดินทับฝ่ายเดียวกัน) จะถูกจัดการใน moveMarble()
            isMoveValid = true; 
        }
        
        if (isMoveValid) {
            marble.classList.add('can-move');
            marble.addEventListener('click', handleMarbleClick);
            hasMove = true;
        }
    });
    return hasMove;
}

function handleMarbleClick(event) {
    if (isMoving) return;
    isMoving = true;
    
    const marble = event.currentTarget;
    
    // 1. ลบ Event Listener และไฮไลต์
    document.querySelectorAll('.marble').forEach(m => {
        m.classList.remove('can-move');
        m.removeEventListener('click', handleMarbleClick);
    });

    // 2. ย้ายหมาก
    moveMarble(marble, currentRoll);
    
    // 3. เตรียมพร้อมสำหรับผู้เล่นคนถัดไป
    setTimeout(() => {
        isMoving = false;
        switchPlayer();
    }, 500);
}


// ----------------------------------------------------------
// 3. AI LOGIC FUNCTIONS
// ----------------------------------------------------------

function handleAIMove() {
    // 1. AI ทอยลูกเต๋า
    currentRoll = Math.floor(Math.random() * 6) + 1;
    rollResult.textContent = `Dice Roll (AI): ${currentRoll}`;
    
    // 2. ตรวจสอบหมากที่เดินได้
    const possibleMoves = getAIMoves(currentRoll, AI_PLAYER.toLowerCase());
    
    if (possibleMoves.length > 0) {
        // 3. AI เลือกหมากที่ดีที่สุด (Basic Strategy)
        const bestMarble = selectBestAIMarble(possibleMoves);
        
        // 4. AI ย้ายหมาก
        setTimeout(() => {
            if (moveMarble(bestMarble, currentRoll)) {
                // ย้ายสำเร็จ
            }
            switchPlayer();
        }, 1000); // หน่วงเวลาเพื่อให้ดูเหมือน AI กำลังคิด
    } else {
        // เดินไม่ได้, เปลี่ยนผู้เล่นทันที
        rollResult.textContent += " - AI No moves possible.";
        setTimeout(switchPlayer, 1000);
    }
}

function getAIMoves(roll, color) {
    const validMarbles = [];
    const playerMarbles = document.querySelectorAll(`.marble-${color}`);
    
    playerMarbles.forEach(marble => {
        const currentPos = marble.getAttribute('data-position');
        let isMoveValid = false;
        
        // ตรรกะการเดินหมากแบบง่าย ๆ สำหรับ AI (เหมือน highlightPossibleMoves)
        if (currentPos.startsWith('home-') && (roll === 1 || roll === 6)) {
            isMoveValid = true;
        } 
        else if (currentPos.startsWith('space-')) {
            isMoveValid = true;
        }
        
        if (isMoveValid) {
            validMarbles.push(marble);
        }
    });
    return validMarbles;
}

function selectBestAIMarble(possibleMoves) {
    let bestMarble = null;
    let bestScore = -Infinity;
    
    possibleMoves.forEach(marble => {
        let score = 0;
        const currentPos = marble.getAttribute('data-position');
        const roll = currentRoll;
        
        // ******* AI STRATEGY *******
        
        // 1. Priority 1: พยายามออกจากบ้าน
        if (currentPos.startsWith('home-') && (roll === 1 || roll === 6)) {
            score += 100; 
        }
        
        // 2. Priority 2: พยายามกินหมากฝ่ายตรงข้าม (ถ้าคำนวณแล้วว่าเดินไปกินได้)
        // **TODO: เพิ่มตรรกะการคำนวณการกิน (ซับซ้อน)
        
        // 3. Priority 3: เดินหมากที่อยู่ไกลที่สุด (ใกล้ Goal ที่สุด)
        if (currentPos.startsWith('space-')) {
            const currentSpaceIndex = parseInt(currentPos.split('-')[1]);
            score += currentSpaceIndex; // ยิ่งเดินไกล ยิ่งคะแนนสูง
        }
        
        // ******* END AI STRATEGY *******
        
        if (score > bestScore) {
            bestScore = score;
            bestMarble = marble;
        }
    });
    
    // ถ้าไม่พบการเคลื่อนไหวที่ดีกว่า ให้เลือกหมากตัวแรก
    return bestMarble || possibleMoves[0]; 
}


// ----------------------------------------------------------
// 4. INITIALIZATION
// ----------------------------------------------------------

createBoard(); 
diceButton.addEventListener('click', rollDice);
