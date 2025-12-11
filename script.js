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
// ... (โค้ดเดิมด้านบน) ...

const PLAYER_COLORS = ['Red', 'Blue', 'Green', 'Yellow']; // กำหนดสีผู้เล่น

// ฟังก์ชันสร้างรังและเส้นทางปลอดภัย
function createHomesAndSafetyZones() {
    const homeContainer = document.getElementById('game-board');

    // ตำแหน่งเริ่มต้นสำหรับการวาง Home/Safety (ในหน่วยองศา)
    // Red Start: 0 องศา, Blue Start: 90 องศา (โดยประมาณในวงกลม 4 ส่วน)
    const startAngles = {
        'Red': 0, // อยู่ที่ช่อง 0
        'Blue': 90, // อยู่ที่ช่อง 13
        // ถ้ามี 4 ผู้เล่น:
        // 'Green': 180, // ช่อง 26
        // 'Yellow': 270  // ช่อง 39
    };
    
    // สร้าง Home Base (รัง) และ Safety Zone (5 ช่อง) สำหรับแต่ละสี
    PLAYER_COLORS.forEach(color => {
        // 1. สร้างรัง (Home Base) 4 ช่อง
        for (let i = 0; i < 4; i++) {
            const homeSpace = document.createElement('div');
            homeSpace.classList.add('home-space', `home-${color.toLowerCase()}`);
            homeSpace.id = `home-${color.toLowerCase()}-${i}`;
            // กำหนดตำแหน่งรังที่อยู่ด้านในกระดานวงกลม (ใช้ CSS จัดวาง)
            homeContainer.appendChild(homeSpace);
        }

        // 2. สร้างเส้นทางปลอดภัย (Safety Zone) 5 ช่อง
        for (let i = 0; i < 5; i++) {
            const safetySpace = document.createElement('div');
            safetySpace.classList.add('safety-space', `safety-${color.toLowerCase()}`);
            safetySpace.id = `safety-${color.toLowerCase()}-${i}`;
            
            // เพิ่มเลขช่องปลอดภัย
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

// แก้ไขฟังก์ชัน createBoard() เดิม
function createBoard() {
    gameBoard.innerHTML = ''; 
    
    // ... (โค้ดเดิมสำหรับสร้าง 52 ช่องวงกลม) ...
    // *** ไม่ต้องลบโค้ดนี้ ให้คงไว้ ***
    
    // คำนวณมุมที่แต่ละช่องเดินควรจะอยู่
    const angleIncrement = (360 / totalSpaces) * (Math.PI / 180); 
    // ... (โค้ดการสร้าง space) ...
    
    // --- เพิ่มส่วนนี้: เรียกฟังก์ชันสร้างรังและปลอดภัย ---
    createHomesAndSafetyZones();
    // ... (โค้ดเดิมด้านบน) ...

const PLAYER_COLORS = ['Red', 'Blue']; // สำหรับตอนนี้ เราใช้แค่ Red และ Blue ก่อน
// หากต้องการ 4 ผู้เล่น: const PLAYER_COLORS = ['Red', 'Blue', 'Green', 'Yellow'];

// ----------------------------------------------------------
// เพิ่มฟังก์ชันสำหรับสร้างหมาก (Marbles)
// ----------------------------------------------------------

function createMarbles() {
    PLAYER_COLORS.forEach(color => {
        const lowerColor = color.toLowerCase();
        
        // สร้างหมาก 4 ตัวสำหรับผู้เล่นแต่ละสี
        for (let i = 0; i < 4; i++) {
            const marble = document.createElement('div');
            marble.classList.add('marble', `marble-${lowerColor}`);
            marble.id = `marble-${lowerColor}-${i}`;
            marble.setAttribute('data-color', lowerColor);
            marble.setAttribute('data-position', `home-${lowerColor}-${i}`); // ตำแหน่งเริ่มต้นคือในรัง
            
            // เพิ่มหมากลงในรังที่สร้างไว้ก่อนหน้านี้
            const homeSpace = document.getElementById(`home-${lowerColor}-${i}`);
            if (homeSpace) {
                homeSpace.appendChild(marble);
            }
            // *** NOTE: หมากจะถูกย้ายจากรังไปที่ช่องเริ่มต้น (Start Space) เมื่อเกมเริ่ม ***
        }
    });
}

// ----------------------------------------------------------
// แก้ไขฟังก์ชัน createHomesAndSafetyZones()
// ----------------------------------------------------------

function createHomesAndSafetyZones() {
    const homeContainer = document.getElementById('game-board');

    // ... (โค้ดเดิมสำหรับสร้างรัง 4 ช่อง และ Safety Zone 5 ช่อง) ...
    // *** โค้ดส่วนนี้ยังคงเดิม ***

    // 3. สร้างจุดจบ (Finish/Goal)
    const goal = document.createElement('div');
    goal.id = 'game-goal';
    goal.textContent = 'GOAL';
    homeContainer.appendChild(goal);
}

// ----------------------------------------------------------
// แก้ไขฟังก์ชัน createBoard() เพื่อเรียกใช้ createMarbles()
// ----------------------------------------------------------

function createBoard() {
    gameBoard.innerHTML = ''; 
    
    // ... (โค้ดเดิมสำหรับสร้าง 52 ช่องวงกลม) ...
    
    createHomesAndSafetyZones();
    
    // --- เพิ่มส่วนนี้: เรียกฟังก์ชันสร้างหมาก ---
    createMarbles();
}

// ... (โค้ดส่วน Roll Dice และ Switch Player ยังคงเดิม) ...
}

// ... (โค้ดส่วน Roll Dice และ Switch Player ยังคงเดิม) ...
