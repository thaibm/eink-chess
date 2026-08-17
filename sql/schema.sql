-- ====================================================================
-- EINKCHESS DATABASE SCHEMA (PostgreSQL / Supabase)
-- Hệ thống cơ sở dữ liệu cho einkchess.fun
-- ====================================================================

-- 1. BẢNG GHI NHẬN ACTIVE USERS VÀ LƯỢT TRUY CẬP (TELEMETRY)
CREATE TABLE IF NOT EXISTS active_pings (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(64) NOT NULL,
    device_type VARCHAR(32) DEFAULT 'kindle',
    lang VARCHAR(8) DEFAULT 'vi',
    action_type VARCHAR(32) DEFAULT 'ping', -- 'ping', 'pageview', 'play_bot', 'play_puzzle', 'play_pvp'
    page_url VARCHAR(64) DEFAULT '/',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index tối ưu tốc độ đếm và thống kê
CREATE INDEX IF NOT EXISTS idx_active_pings_created_at ON active_pings(created_at);
CREATE INDEX IF NOT EXISTS idx_active_pings_device_time ON active_pings(device_id, created_at);
CREATE INDEX IF NOT EXISTS idx_active_pings_action ON active_pings(action_type);

-- 2. VIEW THỐNG KÊ TRAFFIC (REALTIME, DAU, WAU, MAU, YAU)
CREATE OR REPLACE VIEW v_traffic_stats AS
SELECT
    COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '10 minutes' THEN device_id END) AS realtime_active_10m,
    COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '30 minutes' THEN device_id END) AS realtime_active_30m,
    COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '60 minutes' THEN device_id END) AS realtime_active_60m,
    COUNT(DISTINCT CASE WHEN created_at >= CURRENT_DATE THEN device_id END) AS dau_today,
    COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN device_id END) AS wau_this_week,
    COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN device_id END) AS mau_this_month,
    COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '365 days' THEN device_id END) AS yau_this_year,
    COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) AS pageviews_today,
    COUNT(*) AS total_pageviews_all_time
FROM active_pings;

-- 3. BẢNG QUẢN LÝ QUOTA NGÀY VÀ TRẠNG THÁI VIP
CREATE TABLE IF NOT EXISTS user_quotas (
    device_id VARCHAR(64) NOT NULL,
    quota_date DATE NOT NULL DEFAULT CURRENT_DATE,
    bot_cloud_count INT DEFAULT 0,
    puzzle_count INT DEFAULT 0,
    pvp_count INT DEFAULT 0,
    is_vip BOOLEAN DEFAULT FALSE,
    vip_expire_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (device_id, quota_date)
);

CREATE INDEX IF NOT EXISTS idx_user_quotas_device ON user_quotas(device_id);

-- 4. BẢNG PHÒNG CỜ ĐẤU BẠN BÈ (PVP ONLINE)
CREATE TABLE IF NOT EXISTS chess_games (
    game_code VARCHAR(8) PRIMARY KEY,
    white_pid VARCHAR(64) NOT NULL,
    black_pid VARCHAR(64),
    fen VARCHAR(128) NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    last_move VARCHAR(16),
    status VARCHAR(32) DEFAULT 'waiting', -- 'waiting', 'active', 'finished'
    turn VARCHAR(2) DEFAULT 'w',
    result VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chess_games_code ON chess_games(game_code);
CREATE INDEX IF NOT EXISTS idx_chess_games_status ON chess_games(status);

-- 5. FUNCTION RPC: GỬI PING NHANH
CREATE OR REPLACE FUNCTION rpc_ping(
    p_device_id VARCHAR(64),
    p_device_type VARCHAR(32),
    p_lang VARCHAR(8),
    p_action_type VARCHAR(32),
    p_page_url VARCHAR(64)
)
RETURNS JSON AS $$
DECLARE
    v_stats RECORD;
BEGIN
    -- Ghi nhận ping
    INSERT INTO active_pings (device_id, device_type, lang, action_type, page_url, created_at)
    VALUES (p_device_id, p_device_type, p_lang, p_action_type, p_page_url, NOW());

    -- Lấy thống kê cơ bản trả về cho client nếu cần
    SELECT * INTO v_stats FROM v_traffic_stats;

    RETURN json_build_object(
        'success', true,
        'realtime_10m', v_stats.realtime_active_10m,
        'realtime_30m', v_stats.realtime_active_30m,
        'realtime_60m', v_stats.realtime_active_60m,
        'dau_today', v_stats.dau_today
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
