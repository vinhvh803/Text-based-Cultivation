// Trạng thái hệ thống bản đồ
let isMapOpen = false;

// Kích thước bản đồ lưới ASCII (10 hàng x 15 cột)
const MAP_ROWS = 10;
const MAP_COLS = 15;

// Tọa độ hiện tại của người chơi trên bản đồ
let playerX = 2; // Cột 2
let playerY = 2; // Hàng 2

// Khởi tạo ma trận Bản đồ Cửu Châu
// . : Đất trống (An toàn)
// # : Ngọn núi (Không thể đi qua)
// H : Thái Cốc Sơn Môn (Nơi an toàn)
// X : Yêu Thú Tập Kích (Bước vào sẽ kích hoạt chiến đấu)
// \$ : Khoáng Mạch Linh Thạch (Bước vào sẽ nhặt được Linh thạch)
let worldMap = [
    ['#','#','#','#','#','#','#','#','#','#','#','#','#','#','#'],
    ['#','.','.','.','.','#','.','.','.','.','.','.','.','.','#'],
    ['#','.','H','.','.','#','.','.','X','.','.','.','.','.','#'],
    ['#','.','.','.','.','.','.','.','.','.','#','#','#','.','#'],
    ['#','#','#','.','.','.','.','.','.','.','#','\$','#','.','#'],
    ['#','.','.','.','.','#','#','#','.','.','#','.','#','.','#'],
    ['#','.','X','.','.','#','.','.','.','.','.','.','.','.','#'],
    ['#','.','.','.','.','#','.','.','.','.','.','.','.','.','#'],
    ['#','.','.','\$','.','.','.','.','X','.','.','.','.','.','#'],
    ['#','#','#','#','#','#','#','#','#','#','#','#','#','#','#']
];

// Hàm bật/tắt hiển thị màn hình Bản đồ
function toggleMap() {
    const statsContent = document.getElementById('stats-content');
    const mapContent = document.getElementById('map-content');
    const actionList = document.getElementById('action-list');

    if (!statsContent || !mapContent || !actionList) return;

    // Đóng các cửa sổ khác nếu đang mở
    if (typeof isInventoryOpen !== 'undefined' && isInventoryOpen) toggleInventory();
    if (typeof isShopOpen !== 'undefined' && isShopOpen) toggleShop();

    if (!isMapMapOpen) {
        isMapMapOpen = true;
        statsContent.style.display = 'none';
        actionList.style.display = 'none';
        mapContent.style.display = 'block';
        renderASCIIMap();
    } else {
        isMapMapOpen = false;
        mapContent.style.display = 'none';
        statsContent.style.display = 'block';
        actionList.style.display = 'flex';
        updateUI();
    }
}
// Alias để đồng bộ biến toàn cục lỗi chính tả gọi hàm
let isMapMapOpen = false;

// Hàm vẽ bản đồ ký tự ASCII phong cách A Dark Room
function renderASCIIMap() {
    const mapGrid = document.getElementById('map-grid');
    if (!mapGrid) return;

    let mapHTML = '';

    for (let r = 0; r < MAP_ROWS; r++) {
        let rowText = '';
        for (let c = 0; c < MAP_COLS; c++) {
            // Nếu trùng tọa độ người chơi thì vẽ ký tự đại diện @
            if (r === playerY && c === playerX) {
                rowText += '<span style="color: #00ff00; font-weight: bold;">@</span> ';
            } else {
                let cell = worldMap[r][c];
                // Thêm màu sắc cho các ký tự đặc biệt để dễ nhìn trên điện thoại
                if (cell === '#') rowText += '<span style="color: #555555;">#</span> '; // Núi xám
                else if (cell === 'H') rowText += '<span style="color: #3b82f6; font-weight: bold;">H</span> '; // Giáo phái xanh dương
                else if (cell === 'X') rowText += '<span style="color: #ff0000; font-weight: bold;">X</span> '; // Quái đỏ
                else if (cell === '\$') rowText += '<span style="color: #ffff00; font-weight: bold;">\$</span> '; // Tiền vàng
                else rowText += '. '; // Đất trống
            }
        }
        mapHTML += rowText + '<br>';
    }

    mapGrid.innerHTML = mapHTML;
}

// Hàm xử lý di chuyển của nhân vật (dx, dy nhận các giá trị -1, 0, 1)
function movePlayer(dx, dy) {
    if (isBusy || isDead) return;

    let newX = playerX + dx;
    let newY = playerY + dy;

    // Kiểm tra ranh giới bản đồ và chướng ngại vật ngọn núi (#)
    if (newX >= 0 && newX < MAP_COLS && newY >= 0 && newY < MAP_ROWS) {
        if (worldMap[newY][newX] === '#') {
            logImmediate("[Bản đồ] Phía trước là vách núi dựng đứng thiên nhiên, không thể vượt qua.");
            return;
        }

        // Cập nhật vị trí mới
        playerX = newX;
        playerY = newY;
        
        // Cứ mỗi bước đi thực tế trên bản đồ sẽ tiêu tốn thời gian thọ nguyên (thay cho nút thám hiểm cũ)
        passTime(5); 

        // Kiểm tra vật thể tại ô vừa bước vào
        let currentCell = worldMap[playerY][playerX];
        handleMapEvent(currentCell);

        // Vẽ lại bản đồ sau khi di chuyển
        renderASCIIMap();
    }
}

// Hàm xử lý tương tác trực tiếp khi bước vào ô sự kiện
function handleMapEvent(cellType) {
    if (cellType === 'X') {
        logImmediate("[Bản đồ] Bạn bước vào vùng u minh chướng khí...");
        // Xóa dấu vết quái vật trên bản đồ sau khi chạm trán để biến ô đó thành đất trống (.)
        worldMap[playerY][playerX] = '.'; 
        
        // Gọi kích hoạt trận chiến từ combat.js
        setTimeout(() => {
            if (typeof startCombat === 'function') startCombat();
        }, 50);
    } 
    else if (cellType === '\$') {
        let foundStones = Math.floor(Math.random() * 4) + 2;
        gameState.stones += foundStones;
        logImmediate(`[Bản đồ] Bạn phát hiện một mỏ Linh thạch lộ thiên cổ xưa, khai thác được ${foundStones} Hạ Phẩm Linh Thạch!`, "log-important");
        
        // Xóa mỏ khoáng sau khi đào xong
        worldMap[playerY][playerX] = '.';
    }
    else if (cellType === 'H') {
        // Hồi 10% máu khi quay về bang hội sơn môn an toàn nghỉ ngơi
        let healAmount = Math.floor(gameState.maxHp * 0.1);
        gameState.hp = Math.min(gameState.maxHp, gameState.hp + healAmount);
        logImmediate(`[Bản đồ] Bạn trở về Thái Cốc Sơn Môn bảo địa. Linh trận hộ sơn giúp nhục thân hồi phục nhẹ (+${healAmount} HP).`);
    }
}
