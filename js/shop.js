// Trạng thái hiển thị của Cơ Duyên Các
let isShopOpen = false;

// Danh sách các Bí Tịch Công Pháp có trong Cơ Duyên Các
const SHOP_ITEMS = [
    {
        id: "pills_01",
        name: "Bổ Linh Đan (Hạ Phẩm)",
        cost: 3,
        desc: "Đan dược chứa linh lực nhẹ, nuốt vào lập tức tăng ngay +2 Linh Khí.",
        onBuy: () => {
            gameState.qi = Math.min(gameState.maxQi, gameState.qi + 2);
            logImmediate("[Cơ Duyên Các] Bạn bẻ nhỏ viên Bổ Linh Đan nuốt xuống, linh lực ấm áp hòa tan vào linh hải (+2 Linh Khí).");
        }
    },
    {
        id: "kungfu_01",
        name: "Bí Tịch: Quy Nguyên Quyết",
        cost: 10,
        desc: "Công pháp nhập môn chính tông. Giúp hành động Nạp Khí vĩnh viễn nhận +2 Linh Khí mỗi lần vận công.",
        onBuy: () => {
            gameState.qiMultiplier = (gameState.qiMultiplier || 1) + 1;
            logImmediate("[Cơ Duyên Các] Bạn lĩnh ngộ Quy Nguyên Quyết, kinh mạch vận chuyển mượt mà hơn. Hiệu suất Nạp Khí tăng mạnh!");
        }
    },
    {
        id: "kungfu_02",
        name: "Bí Tịch: Quỷ Cốc Tâm Kinh",
        cost: 30,
        desc: "Tâm pháp tàn quyển nhặt được ở cấm địa. Giúp hành động Nạp Khí vĩnh viễn nhận +4 Linh Khí mỗi lần vận công.",
        onBuy: () => {
            gameState.qiMultiplier = (gameState.qiMultiplier || 1) + 3;
            logImmediate("[Cơ Duyên Các] Thần thức dung hợp Quỷ Cốc Tâm Kinh! Khí vận xung thiên, mỗi hơi thở đều dẫn động linh khí đất trời!");
        }
    }
];

// Hàm chuyển đổi bật/tắt giao diện Cơ Duyên Các
function toggleShop() {
    const statsContent = document.getElementById('stats-content');
    const shopContent = document.getElementById('shop-content');
    const actionList = document.getElementById('action-list');

    if (!statsContent || !shopContent || !actionList) return;

    // Nếu đang mở túi đồ thì bắt buộc đóng túi đồ trước
    if (typeof isInventoryOpen !== 'undefined' && isInventoryOpen) {
        toggleInventory();
    }

    if (!isShopOpen) {
        isShopOpen = true;
        statsContent.style.display = 'none';
        actionList.style.display = 'none';
        shopContent.style.display = 'block';
        renderShopItems();
    } else {
        isShopOpen = false;
        shopContent.style.display = 'none';
        statsContent.style.display = 'block';
        actionList.style.display = 'flex';
        updateUI();
    }
}

// Hàm vẽ danh sách hàng hóa lên giao diện Terminal
function renderShopItems() {
    const shopList = document.getElementById('shop-item-list');
    if (!shopList) return;

    shopList.innerHTML = '';

    // Hiển thị số tiền hiện tại của người chơi ở đầu shop
    const balanceDiv = document.createElement('div');
    balanceDiv.style.marginBottom = '10px';
    balanceDiv.innerHTML = `💰 Tài sản hiện tại: <span class="log-important">${gameState.stones}</span> Hạ Phẩm Linh Thạch.`;
    shopList.appendChild(balanceDiv);

    // Duyệt qua danh sách hàng hóa để in ra các nút mua
    SHOP_ITEMS.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = 'item-row';

        // Kiểm tra xem người chơi có đủ tiền mua không
        const isAffordable = gameState.stones >= item.cost;

        itemRow.innerHTML = `
            <div><strong>${item.name}</strong> - Giá: ${item.cost} Linh Thạch</div>
            <div style="font-size: 0.85rem; color: #888888; margin: 4px 0;">${item.desc}</div>
            <button onclick="buyItem('${item.id}')" ${isAffordable ? '' : 'disabled'}>
                ${isAffordable ? '[Mua Vật Phẩm]' : '[Thiếu Linh Thạch]'}
            </button>
        `;
        shopList.appendChild(itemRow);
    });
}

// Hàm xử lý logic khi nhấn nút Mua
function buyItem(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item || gameState.stones < item.cost) return;

    // Trừ tiền và kích hoạt hiệu ứng của vật phẩm
    gameState.stones -= item.cost;
    item.onBuy();

    // Làm mới lại giao diện shop để cập nhật số tiền và trạng thái nút
    renderShopItems();
}
