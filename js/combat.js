// Trạng thái hệ thống chiến đấu
let isInCombat = false;
let currentEnemy = null;

// Định nghĩa các loại kỹ năng nguyên tố của người chơi
const PLAYER_SKILLS = [
    { id: "fire", name: "🔥 Hỏa Đạn Thuật", element: "Hỏa", desc: "Ngưng tụ hỏa diễm tấn công (Mạnh khi đấu với Mộc)" },
    { id: "water", name: "💧 Thủy Tiễn Kích", element: "Thủy", desc: "Triệu hoán tiễn nước xuyên thấu (Mạnh khi đấu với Hỏa)" },
    { id: "wood", name: "🌱 Mộc Đằng Trói", element: "Mộc", desc: "Thao túng dây leo quất mạnh (Mạnh khi đấu với Thủy)" }
];

// Danh sách Yêu thú có thể gặp trong cấm địa
const ENEMY_POOL = [
    { name: "Cửu Vĩ Hỏa Ly", hp: 30, maxHp: 30, dmg: 5, element: "Hỏa", rewardStones: 5 },
    { name: "Hắc Thủy Huyền Quy", hp: 45, maxHp: 45, dmg: 3, element: "Thủy", rewardStones: 6 },
    { name: "Thần Mộc Thụ Tinh", hp: 35, maxHp: 35, dmg: 4, element: "Mộc", rewardStones: 5 }
];

// Hàm khởi chạy trận đấu (được gọi từ sự kiện ngẫu nhiên khi đi thám hiểm)
function startCombat() {
    isInCombat = true;
    isBusy = true;

    // Lấy ngẫu nhiên 1 yêu thú trong pool và sao chép dữ liệu (Deep Copy)
    const baseEnemy = ENEMY_POOL[Math.floor(Math.random() * ENEMY_POOL.length)];
    currentEnemy = JSON.parse(JSON.stringify(baseEnemy));

    logImmediate(`[!] NGUY HIỂM: Phía trước xuất hiện một con 【${currentEnemy.name}】 (Hệ ${currentEnemy.element}) đầy sát khí lao về phía bạn!`, "log-important");

    // Ẩn giao diện chính, hiện màn hình chiến đấu
    document.getElementById('stats-content').style.display = 'none';
    document.getElementById('action-list').style.display = 'none';
    document.getElementById('combat-content').style.display = 'block';

    renderCombatUI();
    updateUI();
}

// Vẽ giao diện trận đấu và các nút kỹ năng
function renderCombatUI() {
    const enemyInfo = document.getElementById('combat-enemy-info');
    const skillGroup = document.getElementById('combat-skill-group');
    if (!enemyInfo || !skillGroup) return;

    // Hiện thông số kẻ địch
    enemyInfo.innerHTML = `
        <div style="font-size: 1.1rem; color: #ff0000; font-weight: bold;">YÊU THÚ: ${currentEnemy.name} (Hệ ${currentEnemy.element})</div>
        <div>[MÁU]: <span style="color: #ff0000;">${currentEnemy.hp}</span> / ${currentEnemy.maxHp} HP</div>
        <div>[SÁT THƯƠNG]: ${currentEnemy.dmg} điểm</div>
    `;

    // Hiện thông số máu người chơi bên trong trận đấu
    const playerHpInfo = document.getElementById('combat-player-hp');
    playerHpInfo.innerHTML = `[MÁU CỦA BẠN]: <span style="color: #00ff00;">${gameState.hp}</span> / ${gameState.maxHp} HP`;

    // Tạo danh sách nút bấm kỹ năng
    skillGroup.innerHTML = '';
    PLAYER_SKILLS.forEach(skill => {
        const btn = document.createElement('button');
        btn.innerText = `${skill.name} (Hệ ${skill.element})`;
        btn.style.marginBottom = '6px';
        btn.onclick = () => executeCombatTurn(skill);
        skillGroup.appendChild(btn);
    });
}

// Xử lý một lượt đấu (Người chơi đánh -> Tính khắc chế -> Quái đánh trả)
function executeCombatTurn(chosenSkill) {
    if (!isInCombat || isDead) return;

    // 1. LƯỢT NGƯỜI CHƠI TẤN CÔNG
    let baseDmg = 8 + (gameState.realmIndex * 2); // Sát thương cơ bản tăng theo cảnh giới
    let finalDmg = baseDmg;
    let isCounter = false;

    // Tính toán vòng tròn khắc chế: Thủy > Hỏa > Mộc > Thủy
    if (
        (chosenSkill.element === "Thủy" && currentEnemy.element === "Hỏa") ||
        (chosenSkill.element === "Hỏa" && currentEnemy.element === "Mộc") ||
        (chosenSkill.element === "Mộc" && currentEnemy.element === "Thủy")
    ) {
        finalDmg = baseDmg * 2; // Khắc chế thành công: Nhân đôi sát thương
        isCounter = true;
    }

    currentEnemy.hp = Math.max(0, currentEnemy.hp - finalDmg);
    
    if (isCounter) {
        logImmediate(`Bạn thi triển ${chosenSkill.name}. KHẮC CHẾ THÀNH CÔNG! Nguyên tố bùng nổ gây ${finalDmg} sát thương lên ${currentEnemy.name}!`, "log-important");
    } else {
        logImmediate(`Bạn thi triển ${chosenSkill.name}, gây ${finalDmg} sát thương lên ${currentEnemy.name}.`);
    }

    // Kiểm tra xem quái đã chết chưa
    if (currentEnemy.hp <= 0) {
        winCombat();
        return;
    }

    // 2. LƯỢT YÊU THÚ ĐÁNH TRẢ
    let enemyDmg = currentEnemy.dmg;
    gameState.hp = Math.max(0, gameState.hp - enemyDmg);
    logImmediate(`${currentEnemy.name} gầm lên điên cuồng, phản kích gây ${enemyDmg} sát thương lên nhục thân của bạn.`, "log-system");

    // Kiểm tra xem người chơi đã chết chưa
    if (gameState.hp <= 0) {
        endCombatCleanly();
        // Gọi hàm xử lý cái chết từ game.js bằng cách ép tuổi thọ vượt mức để đồng bộ logic cốt truyện cũ
        passTime(36500); // Ép trôi qua 100 năm để kích hoạt cái chết lập tức
        return;
    }

    // Cập nhật lại màn hình đấu pháp cho lượt kế tiếp
    renderCombatUI();
}

// Xử lý khi chiến thắng trận đấu
function winCombat() {
    logImmediate(`[Chiến Thắng] Bạn đã tiêu diệt thành công ${currentEnemy.name}! Thu hoạch được ${currentEnemy.rewardStones} Hạ Phẩm Linh Thạch từ nội đan của nó.`, "log-important");
    gameState.stones += currentEnemy.rewardStones;
    
    endCombatCleanly();
}

// Dọn dẹp chiến trường, trả lại màn hình chính
function endCombatCleanly() {
    isInCombat = false;
    isBusy = false;
    currentEnemy = null;

    document.getElementById('combat-content').style.display = 'none';
    document.getElementById('stats-content').style.display = 'block';
    document.getElementById('action-list').style.display = 'flex';
    
    updateUI();
}
