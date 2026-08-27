-- ====================================================================
-- EINKCHESS DATABASE SCHEMA (PostgreSQL / Supabase)
-- Database backend schema for einkchess.fun
-- ====================================================================

-- 1. ACTIVE USERS AND TRAFFIC LOGS (TELEMETRY)
CREATE TABLE IF NOT EXISTS active_pings (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(64) NOT NULL,
    device_type VARCHAR(32) DEFAULT 'kindle',
    lang VARCHAR(8) DEFAULT 'vi',
    action_type VARCHAR(32) DEFAULT 'ping', -- 'ping', 'pageview', 'play_bot', 'play_puzzle', 'play_pvp'
    page_url VARCHAR(64) DEFAULT '/',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index optimization for aggregation and statistics
CREATE INDEX IF NOT EXISTS idx_active_pings_created_at ON active_pings(created_at);
CREATE INDEX IF NOT EXISTS idx_active_pings_device_time ON active_pings(device_id, created_at);
CREATE INDEX IF NOT EXISTS idx_active_pings_action ON active_pings(action_type);

-- 2. TRAFFIC STATS VIEW (REALTIME, DAU, WAU, MAU, YAU, TOTAL DEVICE VIEWS)
CREATE OR REPLACE VIEW v_traffic_stats AS
WITH latest_device_pings AS (
    SELECT
        device_id,
        MAX(created_at) AS last_active_at
    FROM active_pings
    GROUP BY device_id
)
SELECT
    COUNT(CASE WHEN last_active_at >= NOW() - INTERVAL '10 minutes' THEN 1 END) AS realtime_active_10m,
    COUNT(CASE WHEN last_active_at >= NOW() - INTERVAL '30 minutes' THEN 1 END) AS realtime_active_30m,
    COUNT(CASE WHEN last_active_at >= NOW() - INTERVAL '60 minutes' THEN 1 END) AS realtime_active_60m,
    COUNT(CASE WHEN last_active_at >= CURRENT_DATE THEN 1 END) AS dau_today,
    COUNT(CASE WHEN last_active_at >= NOW() - INTERVAL '7 days' THEN 1 END) AS wau_this_week,
    COUNT(CASE WHEN last_active_at >= NOW() - INTERVAL '30 days' THEN 1 END) AS mau_this_month,
    COUNT(CASE WHEN last_active_at >= NOW() - INTERVAL '365 days' THEN 1 END) AS yau_this_year,
    COUNT(CASE WHEN last_active_at >= CURRENT_DATE THEN 1 END) AS device_views_today,
    COUNT(*) AS total_device_views_all_time
FROM latest_device_pings;

-- 3. DAILY QUOTA AND VIP STATUS TABLE
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

-- 4. PVP ONLINE ROOM TABLE
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

-- 5. FUNCTION RPC: SEND PING
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
    -- Record ping
    INSERT INTO active_pings (device_id, device_type, lang, action_type, page_url, created_at)
    VALUES (p_device_id, p_device_type, p_lang, p_action_type, p_page_url, NOW());

    -- Fetch summary stats to return to client if needed
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

-- 6. DAILY ACTIVE USERS (DAU) HISTORY VIEW (LAST 90 DAYS)
CREATE OR REPLACE VIEW v_daily_active_users AS
SELECT
    DATE(created_at) AS date,
    COUNT(DISTINCT device_id) AS dau
FROM active_pings
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) ASC;

-- 7. ACTIVE USERS HISTORY (DAU, ROLLING WAU, ROLLING MAU - LAST 90 DAYS)
CREATE OR REPLACE VIEW v_active_users_history AS
WITH daily_series AS (
    SELECT generate_series(
        CURRENT_DATE - INTERVAL '89 days',
        CURRENT_DATE,
        INTERVAL '1 day'
    )::DATE AS date
)
SELECT
    d.date,
    (SELECT COUNT(DISTINCT device_id) FROM active_pings WHERE created_at::DATE = d.date) AS dau,
    (SELECT COUNT(DISTINCT device_id) FROM active_pings WHERE created_at >= (d.date - INTERVAL '6 days')::TIMESTAMPTZ AND created_at < (d.date + INTERVAL '1 day')::TIMESTAMPTZ) AS wau,
    (SELECT COUNT(DISTINCT device_id) FROM active_pings WHERE created_at >= (d.date - INTERVAL '29 days')::TIMESTAMPTZ AND created_at < (d.date + INTERVAL '1 day')::TIMESTAMPTZ) AS mau
FROM daily_series d
ORDER BY d.date ASC;


