// Hệ thống định nghĩa cảnh giới, lượng linh khí yêu cầu và thời gian tu luyện (mili-giây)
const REALMS_DATA = [
    { name: "Phàm Nhân", req: 10, baseTime: 1000 },
    { name: "Luyện Khí Sơ Kỳ", req: 50, baseTime: 2500 },
    { name: "Luyện Khí Viên Mãn", req: 200, baseTime: 5000 },
    { name: "Trúc Cơ Cảnh", req: 9999, baseTime: 10000 }
];

const SPIRIT_ROOTS = [
    "Hỏa Linh Căn (Hạ Phẩm)", "Thủy Linh Căn (Trung Phẩm)", 
    "Mộc Linh Căn (Thượng Phẩm)", "Thiên Linh Căn (Cực Phẩm)", "Lôi Linh Căn (Dị Biến)"
];

const STORY_STRINGS = {
    welcomeSystem: "[Hệ thống] Trời đất bất nhân, coi vạn vật như rơm rác...",
    welcomePlayer: "Bạn tỉnh dậy trên một tảng đá phẳng tại Thái Cổ Sơn, linh hải trống rỗng.",
    meditateStart: "Bạn nhắm mắt tĩnh tọa, bắt đầu vận chuyển đại chu thiên nạp khí...",
    meditateLog: "Vận khí hoàn thành. Một luồng linh khí mỏng manh nhập thể.",
    unlockMenu: "Cảm quan nhạy bén hơn. Bạn bắt đầu nội thị được Linh Hải của bản thân.",
    saturatedQi: "Linh khí trong cơ thể đã bão hòa. Thời cơ phá cảnh đã đến!",
    breakthroughSuccess: "ẦM! Kinh mạch giãn nở. Bạn đã đột phá lên",
    unlockExplore: "Bạn đã có chút tu vi, kết giới sơn môn không còn cản được bạn nữa. Lối đi mới đã mở.",
    exploreStart: "Bạn lang thang trong cấm địa Quỷ Cốc..."
};

// =========================================================================
// HỆ THỐNG SỰ KIỆN TUYẾN TÍNH CỐ ĐỊNH (Kích hoạt tự động theo mốc thời gian/tuổi)
// =========================================================================
const TIMELINE_EVENTS = [
    {
        id: "time_event_18",
        hasTriggered: false,
        // Điều kiện: Khi nhân vật đạt đủ 18 tuổi
        trigger: (state) => Math.floor(state.age) >= 18,
        execute: (state) => {
            // Sự kiện thức tỉnh hoặc NPC xuất hiện kích hoạt chỉ số ẩn ban đầu như yêu cầu trước
            state.hasUnlockedStatsHidden = true;
            document.getElementById('hidden-stats-section').style.display = 'block';
            return {
                text: `[Cốt Truyện - Tuổi Trưởng Thành] Năm nay bạn tròn 18 tuổi, cơ thể đột ngột phát ra hào quang. Một tia thần niệm của tiền kiếp thức tỉnh, giúp bạn thấu suốt tư chất của mình: Bạn mang [${state.spiritRoot}] và thọ nguyên cực hạn là ${state.maxAge} năm! [Hệ thống: Mở khóa hiển thị Tư chất ẩn]`,
                type: 'log-important'
            };
        }
    },
    {
        id: "time_event_25",
        hasTriggered: false,
        // Điều kiện: Đạt 25 tuổi và chưa đột phá lên Trúc Cơ
        trigger: (state) => Math.floor(state.age) >= 25 && state.realmIndex < 3,
        execute: (state) => {
            state.maxAge -= 2; // Khí độc làm giảm thọ nguyên
            return {
                text: "[Cốt Truyện - Thiên Địa Dị Biến] Năm 25 tuổi, hồng thủy tràn ngập Cửu Châu, u minh độc khí bao phủ Thái Cổ Sơn. Do tu vi chưa đạt Trúc Cơ, cơ thể bạn nhiễm độc khí, thọ nguyên cực hạn giảm mất 2 năm!",
                type: 'log-important'
            };
        }
    },
    {
        id: "time_event_35",
        hasTriggered: false,
        // Điều kiện: Đạt 35 tuổi
        trigger: (state) => Math.floor(state.age) >= 35,
        execute: (state) => {
            state.stones += 20; // Được tặng tài nguyên
            return {
                text: "[Cốt Truyện - Tiên Nhân Chỉ Lộ] Năm 35 tuổi, một vị đại năng từ Thượng Giới lướt qua bến núi, thấy bạn kiên trì tu luyện ròng rã mười mấy năm liền ban thưởng cho bạn 20 Hạ Phẩm Linh Thạch rồi rời đi.",
                type: 'log-important'
            };
        }
    }
];

// =========================================================================
// HỆ THỐNG SỰ KIỆN NGẪU NHIÊN KHI ĐI THÁM HIỂM (Giữ nguyên cơ chế cũ)
// =========================================================================
const EXPLORE_EVENTS = [
    {
        weight: 0.25,
        execute: (state) => {
            if (!state.hasRelic) {
                state.hasRelic = true;
                return {
                    text: "[Kỳ Ngộ] Bạn vô tình đào được một khối ngọc bội nứt nẻ, toát ra tử khí u minh quái dị. Thần thức mách bảo vật này ẩn chứa bí mật về nghịch chuyển sinh tử, bạn quyết định cất vào túi đồ. [Hệ thống: Nhận được Di Vật Lạ]",
                    type: 'log-important'
                };
            }
            state.stones += 3;
            return { text: "Bạn phát hiện vài viên khoáng thạch vụn, thu hoạch được 3 Hạ Phẩm Linh Thạch.", type: '' };
        }
    },
    {
        weight: 0.65,
        execute: (state) => {
            let foundStones = Math.floor(Math.random() * 3) + 1;
            state.stones += foundStones;
            return { text: `Bạn phát hiện một thi thể tán tu, tìm thấy ${foundStones} Hạ Phẩm Linh Thạch trong túi trữ vật của hắn.`, type: '' };
        }
    },
    {
        weight: 0.75,
        execute: (state) => {
            // Thay vì in text, chúng ta gọi hàm kích hoạt trận chiến từ combat.js bằng một luồng bất đồng bộ ngắn
            setTimeout(() => {
                if (typeof startCombat === 'function') startCombat();
            }, 50);
            return { text: "Yêu khí xung thiên nghẹt thở! Một bóng đen khổng lồ từ bụi rậm lao ra chặn đường...", type: 'log-important' };
        }
    },
    {
        weight: 1.0,
        execute: (state) => {
            return { text: "Khu rừng vắng lặng, bạn không tìm thấy gì ngoài vài nhánh cỏ dại.", type: '' };
        }
    }
];
