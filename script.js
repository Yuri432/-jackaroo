// ==========================================================
// JACKAROO GAME LOGIC (script.js) - MASTER COPY 
// (4 Players, Enhanced AI)
// ==========================================================

const gameBoard = document.getElementById('game-board');
const diceButton = document.getElementById('dice-button');
const rollResult = document.getElementById('roll-result');
const currentPlayerDisplay = document.getElementById('current-player');

const totalSpaces = 52; 
const boardRadius = 250; 
const centerOffset = 300; 
const PLAYER_COLORS = ['Red', 'Blue', 'Green', 'Yellow']; 
const AI_PLAYER = 'Blue'; 

let currentPlayer = 'Red';
let currentRoll = 0;
let isMoving = false; 

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
        
        for (let i = 0; i < 4; i++) {
            const homeSpace = document.createElement('div');
            homeSpace.classList.add('home-space', `home-${lowerColor}`);
            homeSpace.id = `home-${lowerColor}-${i}`;
            homeContainer.appendChild(homeSpace);
        }

        for (let i = 0; i < 5; i++) {
            const safetySpace = document.createElement('div');
            safetySpace.classList.add('safety-space', `safety-${lowerColor}`);
            safetySpace.id = `safety-${lowerColor}-${i}`;
            safetySpace.textContent = `S${i+1}`; 
            homeContainer.appendChild(safetySpace);
        }
    });

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

function checkWinCondition(winningColor) {
    const marblesInGoal = document.querySelectorAll(`#game-goal .marble-${winningColor.toLowerCase()}`).length;

    if (marblesInGoal === 4) {
        alert(`🎉 CONGRATULATIONS! Player ${winningColor} has won the game!`);
        diceButton.disabled = true;
    }
}

function moveIntoSafety(marble, roll) {
    const currentPos = marble.getAttribute('data-position');
    const color = marble.getAttribute('data-color');
    
    if (currentPos.startsWith('safety-')) {
        const currentSafetyIndex = parseInt(currentPos.split('-')[2]);
        const newSafetyIndex = currentSafetyIndex + roll;

        if (newSafetyIndex === 5) {
            // เดินเข้า Goal
            const goalSpace = document.getElementById('game-goal');
            goalSpace.appendChild(marble);
            marble.setAttribute('data-position', 'goal');
            marble.removeEventListener('click', handleMarbleClick);
            
            checkWinCondition(color);
            return true;
            
        } else if (newSafetyIndex > 5) {
            // เดินเลย Goal (ไม่เดิน)
            return false;
            
        } else {
            // เดินต่อใน Safety Zone
            const newSafetyId = `safety-${color}-${newSafetyIndex}`;
            const newSafetySpace = document.getElementById(newSafetyId);
            
            // ตรวจสอบหมากฝ่ายเดียวกัน (ป้องกันการเดินทับ)
            if (newSafetySpace.children.length > 0) return false; 
            
            newSafetySpace.appendChild(marble);
            marble.setAttribute('data-position', newSafetyId);
            return true;
        }
    }
    return false;
}

function moveMarble(marble, roll) {
    const currentPos = marble.getAttribute('data-position');
    const color = marble.getAttribute('data-color');
    const startSpaceIndex = START_POSITIONS[color];
    
    // 0. ถ้าอยู่ใน Safety Zone ให้ใช้ moveIntoSafety
    if (currentPos.startsWith('safety-')) {
        return moveIntoSafety(marble, roll);
    }

    let newPositionId;

    if (currentPos.startsWith('home-') && (roll === 1 || roll === 6)) {
        // A. ออกจากรัง
        newPositionId = `space-${startSpaceIndex}`;
        
    } else if (currentPos.startsWith('space-')) {
        // B. เดินบนกระดานหลัก
        const currentSpaceIndex = parseInt(currentPos.split('-')[1]);
        const finalTargetIndex = currentSpaceIndex + roll;

        // ** 1. ตรวจสอบการเข้า Safety Zone **
        
        // ตรวจสอบว่าหมากเดินข้าม/ถึงช่องเริ่มต้นของตัวเอง (Start Space) หรือไม่
        const passedStart = (currentSpaceIndex < startSpaceIndex && finalTargetIndex >= startSpaceIndex) || (startSpaceIndex === 0 && finalTargetIndex >= totalSpaces);
        
        if (passedStart) {
            // หมากเดินครบหนึ่งรอบและกำลังจะเข้า Safety Zone
            const distancePastStart = finalTargetIndex - startSpaceIndex;
            let rollIntoSafety;
            
            if (distancePastStart >= totalSpaces) {
                rollIntoSafety = finalTargetIndex - totalSpaces;
            } else {
                 rollIntoSafety = distancePastStart;
            }
            
            if (rollIntoSafety >= 0 && rollIntoSafety < 5) {
                 // เข้า Safety Zone ช่อง rollIntoSafety (0-4)
                 const newSafetyId = `safety-${color}-${rollIntoSafety}`;
                 const newSafetySpace = document.getElementById(newSafetyId);
                 
                 // ตรวจสอบหมากฝ่ายเดียวกัน (ไม่ให้เดินทับใน Safety Zone)
                 if (newSafetySpace.children.length > 0) return false; 
                 
                 newSafetySpace.appendChild(marble);
                 marble.setAttribute('data-position', newSafetyId);
                 return true;
            }
            // ถ้า Roll มากเกินไปจนเลย Goal ไปเลย (ไม่เดิน)
            return false;
        }
        
        // ** 2. เดินบนกระดานหลักทั่วไป (วนรอบ) **
        let newIndex = finalTargetIndex % totalSpaces;
        newPositionId = `space-${newIndex}`;
    }
    
    // 3. ดำเนินการย้ายหมาก
    if (newPositionId) {
        const newSpace = document.getElementById(newPositionId);
        
        // 4. ตรวจสอบการกิน (Jumping) - เฉพาะบนช่องเดินหลัก
        if (newPositionId.startsWith('space-') && newSpace.children.length > 0) {
            const existingMarble = newSpace.children[0];
            const existingMarbleColor = existingMarble.getAttribute('data-color');
            
            if (existingMarbleColor !== color) {
                sendMarbleHome(existingMarble);
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
    
    // AI controls Blue only
    if (currentPlayer === AI_PLAYER) {
        setTimeout(handleAIMove, 1000); 
    } else {
        diceButton.disabled = false;
    }
}

function rollDice() {
    if (isMoving) return; 
    
    diceButton.disabled = true; 
    
    currentRoll = Math.floor(Math.random() * 6) + 1; 
    
    rollResult.textContent = `Dice Roll: ${currentRoll}`;
    
    const canMove = highlightPossibleMoves(currentRoll, currentPlayer);
    
    if (!canMove) {
        rollResult.textContent += " - No moves possible, switching player.";
        setTimeout(switchPlayer, 1500); 
    }
}

function highlightPossibleMoves(roll, color) {
    let hasMove = false;
    const playerMarbles = document.querySelectorAll(`.marble-${color.toLowerCase()}`);
    
    playerMarbles.forEach(marble => {
        marble.classList.add('can-move');
        marble.addEventListener('click', handleMarbleClick);
        hasMove = true; 
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
    const moved = moveMarble(marble, currentRoll);
    
    // 3. เตรียมพร้อมสำหรับผู้เล่นคนถัดไป
    setTimeout(() => {
        isMoving = false;
        if (moved) {
            switchPlayer();
        } else {
            // ถ้าเดินไม่ได้ (เช่น เดินทับหมากตัวเอง) ให้ผู้เล่นคนเดิมทอยใหม่
            alert("Invalid move or blocked. Please try again.");
            diceButton.disabled = false;
        }
    }, 500);
}


// ----------------------------------------------------------
// 3. AI LOGIC FUNCTIONS (Enhanced Basic AI)
// ----------------------------------------------------------

function handleAIMove() {
    currentRoll = Math.floor(Math.random() * 6) + 1;
    rollResult.textContent = `Dice Roll (AI): ${currentRoll}`;
    
    const possibleMarbles = getAIMoves(currentRoll, AI_PLAYER.toLowerCase());
    
    if (possibleMarbles.length > 0) {
        const bestMarble = selectBestAIMarble(possibleMarbles);
        
        setTimeout(() => {
            moveMarble(bestMarble, currentRoll); 
            switchPlayer();
        }, 1000); 
    } else {
        rollResult.textContent += " - AI No moves possible.";
        setTimeout(switchPlayer, 1000);
    }
}

function getAIMoves(roll, color) {
    const validMarbles = [];
    const playerMarbles = document.querySelectorAll(`.marble-${color}`);
    
    playerMarbles.forEach(marble => {
        if (marble.getAttribute('data-position').startsWith('home-') && (roll !== 1 && roll !== 6)) {
            // หมากในบ้านแต่ทอยไม่ได้ 1 หรือ 6 - ไม่สามารถเดินได้
        } else {
            validMarbles.push(marble);
        }
    });
    return validMarbles;
}

function selectBestAIMarble(possibleMoves) {
    let bestMarble = null;
    let bestScore = -Infinity;
    const color = AI_PLAYER.toLowerCase();
    
    possibleMoves.forEach(marble => {
        let score = 0;
        const currentPos = marble.getAttribute('data-position');
        const roll = currentRoll;
        
        // --- 1. Priority 1: EATING (New simple check) ---
        if (currentPos.startsWith('space-')) {
            const currentSpaceIndex = parseInt(currentPos.split('-')[1]);
            let newIndex = (currentSpaceIndex + roll) % totalSpaces;
            const targetSpace = document.getElementById(`space-${newIndex}`);
            
            if (targetSpace && targetSpace.children.length > 0) {
                const existingMarble = targetSpace.children[0];
                const existingMarbleColor = existingMarble.getAttribute('data-color');
                if (existingMarbleColor !== color) {
                    score += 5000; // High score for eating
                }
            }
        }
        
        // --- 2. Priority 2: Leaving Home ---
        if (currentPos.startsWith('home-') && (roll === 1 || roll === 6)) {
            score += 1000; 
        }
        
        // --- 3. Priority 3: Entering Safety Zone ---
        if (currentPos.startsWith('space-')) {
            const currentSpaceIndex = parseInt(currentPos.split('-')[1]);
            const startSpaceIndex = START_POSITIONS[AI_PLAYER.toLowerCase()];
            const distanceToStart = (startSpaceIndex - currentSpaceIndex + totalSpaces) % totalSpaces;

            if (distanceToStart === roll) {
                score += 500; // Will enter Safety Zone exactly
            }
        }
        
        // --- 4. Priority 4: Moving Furthest on Track ---
        if (currentPos.startsWith('space-')) {
            const currentSpaceIndex = parseInt(currentPos.split('-')[1]);
            score += currentSpaceIndex;
        }
        
        // --- 5. Priority 5: Moving in Safety Zone ---
        if (currentPos.startsWith('safety-')) {
            const currentSafetyIndex = parseInt(currentPos.split('-')[2]);
            score += 200 + currentSafetyIndex;
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestMarble = marble;
        }
    });
    
    return bestMarble || possibleMoves[0]; 
}


// ----------------------------------------------------------
// 4. INITIALIZATION
// ----------------------------------------------------------

createBoard(); 
diceButton.addEventListener('click', rollDice);
