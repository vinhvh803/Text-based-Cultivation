// Lưu trữ các Khí Vận (Perks) mà nhân vật đã chọn và kích hoạt
let activePerks = [];
let currentPerkOptions = [];

// Danh sách toàn bộ các Nghịch Thiên Cải Mệnh có thể xuất hiện
const PERKS_POOL = [
    {
        id: "perk_01",
        name: "Kiếm Cốt Trời Sinh",
        desc: "Linh thể phù hợp tu kiếm. Tốc độ Nạp Khí vĩnh viễn tăng thêm +2 Linh Khí mỗi lần vận công.",
        onApply: () => {
            gameState.qiMultiplier = (gameState.qiMultiplier || 1) + 2;
        }
    },
    {
        id: "perk_02",
        name: "Trường Sinh Bất Lão Tuyền",
        desc: "Huyết mạch tràn đầy thọ nguyên. Tăng vĩnh viễn +60 năm vào Tuổi thọ cực hạn.",
        onApply: () => {
            gameState.maxAge += 60;
        }
    },
    {
        id: "perk_03",
        name: "Khí Vận Chi Tử",
        desc: "Được thiên địa chứng giám. Đi thám hiểm xuống núi giảm 50% nguy cơ gặp Yêu thú và tăng tỷ lệ nhặt Linh Thạch x2.",
        onApply: () => {
            gameState.isLucky = true; // Sẽ được check trong logic thám hiểm
        }
    },
    {
        id: "perk_04",
        name: "Linh Hải Cuồn Cuộn",
        desc: "Dung tích linh hải mở rộng vượt bậc. Lượng Linh Khí yêu cầu để đột phá ở các cảnh giới sau giảm đi 20%.",
        onApply: () => {
            gameState.qiDiscount = 0.8; // Giảm 20% yêu cầu linh khí mốc sau
        }
    }
];

// Hàm kích hoạt màn hình chọn Nghịch Thiên Cải Mệnh khi Đột Phá Đại Cảnh Giới
function triggerPerkSelection() {
    isBusy = true;
    updateUI();

    // Ẩn các nút hành động, hiện bảng thiên đạo
    document.getElementById('action-list').style.display = 'none';
    document.getElementById('perk-section').style.display = 'block';

    // Xáo trộn và chọn ngẫu nhiên 3 Perk từ Pool
    const shuffled = [...PERKS_POOL].sort(() => 0.5 - Math.random());
    currentPerkOptions = shuffled.slice(0, 3);

    renderPerkOptions();
}

// Vẽ 3 nút lựa chọn Khí Vận lên giao diện
function renderPerkOptions() {
    const perkGroup = document.getElementById('perk-btn-group');
    if (!perkGroup) return;

    perkGroup.innerHTML = '';

    currentPerkOptions.forEach(perk => {
        const btn = document.createElement('button');
        btn.className = 'log-important';
        btn.style.borderColor = '#00ff00';
        btn.style.marginBottom = '8px';
        btn.innerHTML = `
            <div><strong>【 Nghịch Thiên 】${perk.name}</strong></div>
            <div style="font-size: 0.85rem; color: #888888; margin-top: 4px;">${perk.desc}</div>
        `;
        btn.onclick = () => selectPerk(perk.id);
        perkGroup.appendChild(btn);
    });
}

// Logic xử lý khi người chơi bấm chọn 1 Khí Vận
function selectPerk(perkId) {
    const perk = currentPerkOptions.find(p => p.id === perkId);
    if (!perk) return;

    // Kích hoạt hiệu ứng nội tại của Perk
    perk.onApply();
    activePerks.push(perk);

    logImmediate(`[Thiên Đạo] Bạn đã nghịch thiên cải mệnh, dung hợp khí vận thành công: 【${perk.name}】!`, "log-important");

    // Dọn dẹp giao diện, trả lại màn hình chơi chính
    document.getElementById('perk-section').style.display = 'none';
    document.getElementById('action-list').style.display = 'flex';

    isBusy = false;
    
    // Tiếp tục cập nhật cảnh giới mới sau khi chọn Perk xong
    finishBreakthroughLogic();
}

// Hiển thị danh sách các mệnh đã chọn ở bảng thông số
function renderActivePerksText() {
    const perkDisplay = document.getElementById('stat-perks-list');
    if (!perkDisplay) return;

    if (activePerks.length === 0) {
        perkDisplay.innerText = "Chưa thức tỉnh";
        return;
    }

    perkDisplay.innerText = activePerks.map(p => `【${p.name}】`).join(', ');
}
