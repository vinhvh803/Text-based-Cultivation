// Quản lý trạng thái hiển thị của túi đồ
let isInventoryOpen = false;

// Hàm chuyển đổi qua lại giữa Màn hình Thông số và Màn hình Túi Đồ
function toggleInventory() {
    const statsContent = document.getElementById('stats-content');
    const inventoryContent = document.getElementById('inventory-content');
    const actionList = document.getElementById('action-list');

    if (!statsContent || !inventoryContent || !actionList) return;

    if (!isInventoryOpen) {
        // MỞ TÚI ĐỒ
        isInventoryOpen = true;
        statsContent.style.display = 'none'; // Ẩn thông số nhân vật
        actionList.style.display = 'none';   // Ẩn các nút hành động chính
        inventoryContent.style.display = 'block'; // Hiện giao diện túi đồ chi tiết
        renderInventoryList();
    } else {
        // ĐÓNG TÚI ĐỒ
        isInventoryOpen = false;
        inventoryContent.style.display = 'none';
        statsContent.style.display = 'block';
        actionList.style.display = 'flex';
        updateUI(); // Cập nhật lại giao diện chính
    }
}

// Hàm render danh sách vật phẩm chi tiết bên trong Túi đồ
function renderInventoryList() {
    const itemList = document.getElementById('item-list');
    if (!itemList) return;

    // Xóa danh sách cũ trước khi nạp mới
    itemList.innerHTML = '';

    // 1. Hiển thị Linh Thạch
    const stoneRow = document.createElement('div');
    stoneRow.className = 'item-row';
    stoneRow.innerText = `💎 Hạ Phẩm Linh Thạch: ${gameState.stones} viên (Nguyên liệu giao dịch phổ thông)`;
    itemList.appendChild(stoneRow);

    // 2. Hiển thị Di Vật Lạ nếu có
    if (gameState.hasRelic) {
        const relicRow = document.createElement('div');
        relicRow.className = 'item-row log-important';
        relicRow.style.color = '#ff0000';
        relicRow.innerHTML = `☠️ Di Vật Lạ (Ẩn chứa thiên cơ luân hồi) <button onclick="discardRelicFromBag()">[Vứt bỏ]</button>`;
        itemList.appendChild(relicRow);
    }

    // Nếu sau này bạn thêm đan dược, vũ khí... chỉ cần push cấu trúc vào đây
}

// Hàm bọc để xử lý vứt bỏ vật phẩm ngay bên trong túi đồ
function discardRelicFromBag() {
    // Gọi hàm vứt bỏ từ game.js
    discardRelic();
    // Vẽ lại danh sách vật phẩm để cập nhật màn hình lập tức
    renderInventoryList();
}
