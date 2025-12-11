// ==========================================================
// JACKAROO GAME LOGIC (script.js)
// ==========================================================

const gameBoard = document.getElementById('game-board');
const diceButton = document.getElementById('dice-button');
const rollResult = document.getElementById('roll-result');
const currentPlayerDisplay = document.getElementById('current-player');

const totalSpaces = 52; 
const boardRadius = 250; // รัศมีของวงกลม (px)
const centerOffset = 300; // จุดศูนย์กลางของกระดาน (ขนาด 600x600)

let currentPlayer = 'Red';

// ฟังก์ชันสำหรับสร้างกระดานเกมและกำหนดตำแหน่ง
function createBoard() {
    gameBoard.innerHTML = ''; 
    
    // คำนวณมุมที่แต่ละช่องเดินควรจะอยู่
    const angleIncrement = (360 / totalSpaces) * (Math.PI / 180); // แปลงเป็นเรเดียน
    
    for (let i = 0; i < totalSpaces; i++) {
        const space = document.createElement('div');
        space.classList.add('board-space');
        space.id = `space-${i}`;
        
        // คำนวณตำแหน่ง X และ Y
        const angle = i * angleIncrement;
        
        // x = รัศมี * cos(มุม) + จุดศูนย์กลาง - ครึ่งหนึ่งของขนาดช่อง
        const x = (boardRadius * Math.cos(angle)) + centerOffset - 15; 
        
        // y = รัศมี * sin(มุม) + จุดศูนย์กลาง - ครึ่งหนึ่งของขนาดช่อง
        const y = (boardRadius * Math.sin(angle)) + centerOffset - 15; 

        // กำหนดตำแหน่งผ่าน CSS
        space.style.left = `${x}px`;
        space.style.top = `${y}px`;
        
        // กำหนดสีให้กับช่องเริ่มต้นของผู้เล่น (สมมติว่าช่อง 0, 13, 26, 39 เป็นช่องเริ่มต้น)
        if (i === 0) { // Red Start
            space.classList.add('start-red');
        } else if (i === 13) { // Blue Start
            space.classList.add('start-blue');
        } else if (i === 26) { // Green Start (ถ้ามี 4 ผู้เล่น)
            space.classList.add('start-green');
        } else if (i === 39) { // Yellow Start (ถ้ามี 4 ผู้เล่น)
            space.classList.add('start-yellow');
        }
        
        // เพิ่มเลขช่อง (สำหรับ debug)
        space.textContent = i; 
        
        gameBoard.appendChild(space);
    }
    
    // **TODO:** สร้าง Home Base (รัง) และ Exit Point (จุดเข้าบ้าน) ในขั้นตอนถัดไป
}

// ฟังก์ชันทอยลูกเต๋า
function rollDice() {
    const roll = Math.floor(Math.random() * 6) + 1;
    
    rollResult.textContent = `Dice Roll: ${roll}`;
    
    // **TODO:** เพิ่มตรรกะการเดินหมากตามผลลูกเต๋า
    
    // เปลี่ยนผู้เล่น (สำหรับทดสอบ)
    switchPlayer(); 
}

// ฟังก์ชันเปลี่ยนผู้เล่น
function switchPlayer() {
    // สำหรับ 2 ผู้เล่น: Red -> Blue -> Red
    if (currentPlayer === 'Red') {
        currentPlayer = 'Blue';
    } else {
        currentPlayer = 'Red';
    }
    currentPlayerDisplay.textContent = `Current Player: ${currentPlayer}`;
}

// เรียกใช้ฟังก์ชันเมื่อโหลดหน้าจอ
createBoard(); 

// ผูกฟังก์ชันกับปุ่ม
diceButton.addEventListener('click', rollDice);
