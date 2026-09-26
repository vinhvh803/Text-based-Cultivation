const gameState = {
    qi: 0,
    maxQi: REALMS_DATA[0].req,
    realmIndex: 0,
    stones: 0,
    // Tính năng ẩn ban đầu
    age: 16,
    maxAge: 18, // Đặt thọ nguyên phàm nhân ngắn lại (40 tuổi) để người chơi dễ test tính năng chết
    spiritRoot: "",
    hasRelic: false, // Sở hữu Di Vật Lạ
    hasUnlockedStatsHidden: false
};

let hasUnlockedMenu = false;
let hasUnlockedExplore = false;
let isDead = false; // Trạng thái chết hẳn hoặc đang chọn luân hồi
let isBusy = false;

document.addEventListener("DOMContentLoaded", () => {
    // Khởi tạo Linh căn ngẫu nhiên cho nhân vật từ đầu game
    if (!gameState.spiritRoot) {
        gameState.spiritRoot = SPIRIT_ROOTS[Math.floor(Math.random() * SPIRIT_ROOTS.length)];
    }

    queueLog(STORY_STRINGS.welcomeSystem, "log-system");
    queueLog(STORY_STRINGS.welcomePlayer, "", 1200);
    updateUI();
});

function fadePreviousLogs() {
    document.querySelectorAll('.log-entry').forEach(log => log.classList.add('old-log'));
}

function queueLog(message, type = '', customDelay = 800) {
    logDelayAccumulator += customDelay;
    setTimeout(() => {
        const logContainer = document.getElementById('log-container');
        if (!logContainer) return;
        fadePreviousLogs();
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerText = `> ${message}`;
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
        logDelayAccumulator = Math.max(0, logDelayAccumulator - customDelay);
    }, logDelayAccumulator);
}

let logDelayAccumulator = 0;
function logImmediate(message, type = '') {
    const logContainer = document.getElementById('log-container');
    if (!logContainer) return;
    fadePreviousLogs();
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerText = `> ${message}`;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function startProgressBar(duration, callback) {
    isBusy = true;
    updateUI();
    const logContainer = document.getElementById('log-container');
    const progressEntry = document.createElement('div');
    progressEntry.className = 'log-entry log-system';
    logContainer.appendChild(progressEntry);

    const ticks = 10;
    const intervalTime = duration / ticks;
    let currentTick = 0;

    const interval = setInterval(() => {
        currentTick++;
        let bar = "[";
        for (let i = 0; i < ticks; i++) {
            if (i < currentTick) bar += "=";
            else if (i === currentTick) bar += ">";
            else bar += ".";
        }
        bar += `] ${currentTick * 10}%`;
        progressEntry.innerText = `> Vận công: ${bar}`;
        logContainer.scrollTop = logContainer.scrollHeight;

        if (currentTick >= ticks) {
            clearInterval(interval);
            progressEntry.remove();
            isBusy = false;
            callback();
        }
    }, intervalTime);
}

// Hàm tăng tuổi thọ ngẫu nhiên sau chuỗi hành động dài (mô phỏng thời gian trôi qua)
function passTime(days = 1) {
    // Cứ tích lũy thời gian thực tế, ở đây giả lập đơn giản: mỗi hành động tốn 10 ngày tuổi
    // 365 ngày = 1 tuổi
    gameState.age += (days / 365);
    if (gameState.age >= gameState.maxAge) {
        logImmediate("[!] Thọ nguyên đã cạn. Cơ thể phế hoại, linh hồn tiêu tán... BẠN ĐÃ TỬ VONG.", "log-system");
       
        isDead = true;
        isBusy = true;
        updateUI();
      
        if (gameState.hasRelic) {
            // Có di vật lạ -> Kích hoạt Luân hồi chọn 1 trong 3
            setTimeout(() => {
                triggerRebirthMenu();
            }, 1500);
        } else {
            // Không có di vật -> Chết thật, xóa hết chơi lại từ đầu
            logImmediate("[!] Bạn không có bảo vật hộ mệnh hồn phách. Tu vi một đời tan thành mây khói. [Hệ thống: Hãy F5/Tải lại trang để trùng sinh hoàn toàn]", "log-important");
        }
    }
}

// Hàm chủ động vứt bỏ Di Vật Lạ
function discardRelic() {
    if (isBusy || !gameState.hasRelic) return;
    gameState.hasRelic = false;
    logImmediate("Bạn ném khối ngọc bội dị bảo sang một bên. Tử khí xung quanh bạn lập tức tiêu tán.");
    updateUI();
}

function meditate() {
    if (isBusy || gameState.qi >= gameState.maxQi) return;
    logImmediate(STORY_STRINGS.meditateStart);
    startProgressBar(REALMS_DATA[gameState.realmIndex].baseTime, () => {
        gameState.qi += 1;
        logImmediate(STORY_STRINGS.meditateLog);
        passTime(5); // Tu luyện tốn 5 ngày thọ nguyên

        if (!hasUnlockedMenu && gameState.qi >= 3) {
            hasUnlockedMenu = true;
            document.getElementById('menu-panel').style.display = 'block';
            logImmediate(STORY_STRINGS.unlockMenu, "log-important");
        }
        if (gameState.qi >= gameState.maxQi) {
            gameState.qi = gameState.maxQi;
            addBreakthroughAction();
        }
        updateUI();
    });
}

function addBreakthroughAction() {
    if (document.getElementById('btn-breakthrough')) return;
    const actionList = document.getElementById('action-list');
    const btn = document.createElement('button');
    btn.id = 'btn-breakthrough';
    btn.className = 'log-important';
    btn.innerText = `[!] Xung kích cảnh giới: Lên ${REALMS_DATA[gameState.realmIndex + 1].name}`;
    btn.onclick = breakthrough;
    actionList.appendChild(btn);
    logImmediate(STORY_STRINGS.saturatedQi, "log-important");
}

function breakthrough() {
    if (isBusy || gameState.qi < gameState.maxQi) return;
    logImmediate("Đang ngưng tụ tinh huyết phá vỡ thiên địa gông xiềng...");
    startProgressBar(2000, () => {
        gameState.realmIndex++;
        gameState.qi = 0;
        gameState.maxQi = REALMS_DATA[gameState.realmIndex].req;
        
        // Đột phá tăng thọ nguyên cực hạn (Đúng chất Quỷ Cốc Bát Hoang)
        gameState.maxAge += 50; 

        logImmediate(`${STORY_STRINGS.breakthroughSuccess} [${REALMS_DATA[gameState.realmIndex].name}]! Thọ nguyên cực hạn tăng thêm 50 năm.`, "log-important");
        passTime(30);

        const btn = document.getElementById('btn-breakthrough');
        if (btn) btn.remove();

        if (gameState.realmIndex === 1 && !hasUnlockedExplore) {
            hasUnlockedExplore = true;
            addExploreAction();
            document.getElementById('inventory-section').style.display = 'block';
        }
        updateUI();
    });
}

function addExploreAction() {
    if (document.getElementById('btn-explore')) return;
    const actionList = document.getElementById('action-list');
    const btn = document.createElement('button');
    btn.id = 'btn-explore';
    btn.innerText = " Lén xuống núi tìm kiếm cơ duyên";
    btn.onclick = explore;
    actionList.appendChild(btn);
    logImmediate(STORY_STRINGS.unlockExplore, "log-important");
}

function explore() {
    if (isBusy) return;
    logImmediate(STORY_STRINGS.exploreStart);
    startProgressBar(1500, () => {
        passTime(15);
        const rand = Math.random();
        for (const event of EXPLORE_EVENTS) {
            if (rand < event.weight) {
                const result = event.execute(gameState);
                logImmediate(result.text, result.type);
                break;
            }
        }
        updateUI();
    });
}

// --- CƠ CHẾ LUÂN HỒI NGHỊCH THIÊN CHỌN 1 TRONG 3 ---
function triggerRebirthMenu() {
    logImmediate("U MINH DỊ BẢO CHẤN ĐỘNG! Linh hồn bạn không đi vào luân hồi mà bị hút ngược vào khối ngọc bội...", "log-important");
    
    // Ẩn tất cả nút hành động thông thường, hiện menu chọn khí vận kế thừa kiếp sau
    document.getElementById('action-list').style.display = 'none';
    document.getElementById('rebirth-section').style.display = 'block';
}

function chooseHeritage(choice) {
    // Lưu tạm các giá trị cũ của kiếp trước
    const oldRealmIndex = gameState.realmIndex;
    const oldStones = gameState.stones;
    const oldSpiritRoot = gameState.spiritRoot;

    // Tiến hành RESET toàn bộ nhân vật về trạng thái kiếp mới (Phàm nhân 16 tuổi)
    gameState.age = 16;
    gameState.maxAge = 40; 
    gameState.qi = 0;
    gameState.hasRelic = false; // Mất di vật (phải đi nhặt lại)
    isDead = false;
    isBusy = false;

    // Áp dụng đúng 1 khí vận được chọn để kế thừa sang kiếp sau
    if (choice === 'realm') {
        gameState.realmIndex = oldRealmIndex;
        gameState.maxQi = REALMS_DATA[oldRealmIndex].req;
        // Bù lại thọ nguyên tương ứng cấp bậc kiếp trước tích lũy
        gameState.maxAge += (oldRealmIndex * 30); 
        logImmediate(`[Luân Hồi] Kiếp này bẩm sinh thần thông, kế thừa nguyên vẹn tu vi [${REALMS_DATA[oldRealmIndex].name}] từ kiếp trước!`, "log-important");
    } else if (choice === 'relic') {
        gameState.realmIndex = 0;
        gameState.maxQi = REALMS_DATA[0].req;
        gameState.stones = oldStones;
        logImmediate(`[Luân Hồi] Kiếp này sinh ra tại tài phiệt thế gia, thừa kế gia sản ${oldStones} Linh Thạch từ tiền kiếp!`, "log-important");
    } else if (choice === 'root') {
        gameState.realmIndex = 0;
        gameState.maxQi = REALMS_DATA[0].req;
        gameState.stones = 0;
        gameState.spiritRoot = oldSpiritRoot;
        logImmediate(`[Luân Hồi] Kiếp này linh cốt dị thường, bảo lưu tinh thuần [${oldSpiritRoot}] từ tiền kiếp!`, "log-important");
    }

    // Nếu kiếp trước chưa mở linh căn ngẫu nhiên mới thì đổi linh căn mới nếu không chọn Linh Căn
    if (choice !== 'root') {
        gameState.spiritRoot = SPIRIT_ROOTS[Math.floor(Math.random() * SPIRIT_ROOTS.length)];
    }

    // Khôi phục giao diện chơi tiếp
    document.getElementById('rebirth-section').style.display = 'none';
    document.getElementById('action-list').style.display = 'flex';
    
    // Cập nhật lại các nút hành động cho đúng cảnh giới được giữ
    const btnExplore = document.getElementById('btn-explore');
    if (gameState.realmIndex >= 1) {
        if (!btnExplore) addExploreAction();
        document.getElementById('inventory-section').style.display = 'block';
    } else {
        if (btnExplore) btnExplore.remove();
        document.getElementById('inventory-section').style.display = 'none';
    }
    const btnBreak = document.getElementById('btn-breakthrough');if (btnBreak) btnBreak.remove();
}

function updateUI() {
    const rName = document.getElementById('stat-realm');
    if (!rName) return;

    rName.innerText = REALMS_DATA[gameState.realmIndex].name;
    document.getElementById('stat-qi').innerText = gameState.qi;
    document.getElementById('max-qi').innerText = gameState.maxQi;
  
    // Cập nhật số lượng linh thạch ở dòng hiển thị nhanh bên ngoài
    document.getElementById('stat-stone').innerText = gameState.stones;

    // Cập nhật hiển thị Di Vật Lạ trong túi đồ
    const relicUi = document.getElementById('relic-item');
    if (gameState.hasRelic) {relicUi.style.display = 'block';} 
    else {relicUi.style.display = 'none';}
    
    // Cập nhật giao diện thuộc tính ẩn
    document.getElementById('stat-age').innerText = Math.floor(gameState.age);
    document.getElementById('stat-max-age').innerText = gameState.maxAge;
    document.getElementById('stat-root').innerText = gameState.spiritRoot;

    // Hiển thị lại các khu vực nếu dữ liệu tải từ file Save đã mở khóa sẵn
    if (gameState.hasUnlockedSave) document.getElementById('save-section').style.display = 'block';
    if (gameState.hasUnlockedStatsHidden) document.getElementById('hidden-stats-section').style.display = 'block';

    const btnMeditate = document.getElementById('btn-meditate');
    const btnExplore = document.getElementById('btn-explore');
    const btnBreakthrough = document.getElementById('btn-breakthrough');

    // Nếu đang mở túi đồ hoặc đang bận/chết thì khóa các nút hành động chính lại
    if (isBusy || isDead || isInventoryOpen) {
        if (btnMeditate) btnMeditate.disabled = true;
        if (btnExplore) btnExplore.disabled = true;
        if (btnBreakthrough) btnBreakthrough.disabled = true;
    } else {
        if (btnMeditate) btnMeditate.disabled = (gameState.qi >= gameState.maxQi);
        if (btnExplore) btnExplore.disabled = false;
        if (btnBreakthrough) btnBreakthrough.disabled = false;
    }
}
