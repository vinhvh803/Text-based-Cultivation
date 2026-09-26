// Hệ thống định nghĩa cảnh giới, lượng linh khí yêu cầu và thời gian tu luyện (mili-giây)
const REALMS_DATA = [
    { name: "Phàm Nhân", req: 10, baseTime: 1000 },       // Nạp khí mất 1 giây
    { name: "Luyện Khí Sơ Kỳ", req: 50, baseTime: 2500 },  // Nạp khí mất 2.5 giây
    { name: "Luyện Khí Viên Mãn", req: 200, baseTime: 5000 },// Nạp khí mất 5 giây
    { name: "Trúc Cơ Cảnh", req: 9999, baseTime: 10000 }
];

// Định nghĩa danh sách các loại Linh Căn ngẫu nhiên
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

const EXPLORE_EVENTS = [
    {
        weight: 0.25, // Sự kiện nhặt được Di Vật Lạ
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
        weight: 0.4, // Sự kiện gặp NPC nhắc đến Tuổi Thọ và Linh Căn
        execute: (state) => {
            if (!state.hasUnlockedStatsHidden) {
                state.hasUnlockedStatsHidden = true;
                document.getElementById('hidden-stats-section').style.display = 'block';
                return {
                    text: `[Gặp gỡ] Một vị Tán tu râu tóc bạc phơ lướt qua nhìn bạn rồi lắc đầu cảm thán: 'Cốt tuổi mới ${state.age} tuổi, mang trong mình ${state.spiritRoot}, thọ nguyên còn ${state.maxAge - state.age} năm... Tiếc là công pháp quá rách nát!'. Dứt lời lão biến mất. [Hệ thống: Hiện thị tư chất ẩn]`,
                    type: 'log-important'
                };
            }
            return { text: "Bạn gặp một bóng người mờ ảo cưỡi hạc bay qua, tỏa ra uy áp khủng khiếp làm bạn không dám ngước nhìn.", type: 'log-system' };
        }
    },
    {
        weight: 0.6,
        execute: (state) => {
            let foundStones = Math.floor(Math.random() * 3) + 1;
            state.stones += foundStones;
            return {
                text: `Bạn phát hiện một thi thể tán tu, tìm thấy ${foundStones} Hạ Phẩm Linh Thạch trong túi trữ vật của hắn.`,
                type: ''
            };
        }
    },
    {
        weight: 0.7,
        execute: (state) => {
            state.qi = Math.max(0, state.qi - 2);
            return {
                text: "Bạn đụng độ một con Yêu thú cấp thấp (Thử Thử). Bạn dùng linh lực dọa lui nó. Hành động tiêu hao mất 2 điểm Linh Khí.",
                type: ''
            };
        }
    },
    {
        weight: 1.0,
        execute: (state) => {
            return {
                text: "Khu rừng vắng lặng, bạn không tìm thấy gì ngoài vài nhánh cỏ dại.",
                type: ''
            };
        }
    }
];
