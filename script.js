// --- ส่วนที่เพิ่มใหม่: การสร้างกระดาน ---

const gameBoard = document.getElementById('game-board');
const totalSpaces = 52; // จำนวนช่องเดินทั้งหมด (สำหรับเวอร์ชันมาตรฐาน)

// ฟังก์ชันสำหรับสร้างกระดานเกม
function createBoard() {
    // 1. สร้างช่องเดิน 52 ช่อง
    for (let i = 0; i < totalSpaces; i++) {
        const space = document.createElement('div');
        space.classList.add('board-space');
        space.id = `space-${i}`;
        
        // **TODO:** กำหนดตำแหน่งทางกายภาพของช่องเดิน (จะทำใน CSS)
        
        // เพิ่มเลขช่อง (สำหรับ debug)
        space.textContent = i; 
        
        // **TODO:** เพิ่มการตรวจสอบว่าเป็น Home Base หรือ Exit Point
        
        gameBoard.appendChild(space);
    }
    
    // 2. สร้าง Home Base และ Safety Zone (แยกต่างหาก)
    // สำหรับตอนนี้เราจะเน้นที่เส้นทางหลักก่อน
}

// เรียกใช้ฟังก์ชันเมื่อโหลดหน้าจอ
createBoard(); 


// --- ส่วนที่ปรับปรุง: การควบคุมลูกเต๋ายังคงเดิม ---

const diceButton = document.getElementById('dice-button');
// ... (โค้ดส่วน Roll Dice ที่มีอยู่แล้ว) ...
