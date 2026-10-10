-- PostgreSQL Normalized Schema for Crypto Trading Platform
-- Supports PostgreSQL and @electric-sql/pglite embedded WASM database

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY,
    role_id TEXT REFERENCES roles(id) ON DELETE CASCADE,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_credentials (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    exchange TEXT NOT NULL DEFAULT 'binance',
    encrypted_api_key TEXT NOT NULL,
    encrypted_api_secret TEXT NOT NULL,
    encrypted_passphrase TEXT,
    is_testnet BOOLEAN DEFAULT TRUE,
    can_trade BOOLEAN DEFAULT FALSE,
    can_withdraw BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'active',
    last_validated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, exchange)
);

CREATE TABLE IF NOT EXISTS exchanges (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    rest_url TEXT NOT NULL,
    ws_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    supported_timeframes TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exchange_accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    exchange_id TEXT REFERENCES exchanges(id),
    account_type TEXT NOT NULL DEFAULT 'spot',
    balance_usd NUMERIC(18, 8) DEFAULT 0,
    available_usd NUMERIC(18, 8) DEFAULT 0,
    locked_usd NUMERIC(18, 8) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS symbols (
    id TEXT PRIMARY KEY,
    exchange_id TEXT REFERENCES exchanges(id),
    symbol TEXT NOT NULL,
    base_asset TEXT NOT NULL,
    quote_asset TEXT NOT NULL,
    min_order_size NUMERIC(18, 8) DEFAULT 0.0001,
    tick_size NUMERIC(18, 8) DEFAULT 0.01,
    is_active BOOLEAN DEFAULT TRUE,
    is_monitored BOOLEAN DEFAULT FALSE,
    is_delisting BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exchange_id, symbol)
);

CREATE TABLE IF NOT EXISTS trading_pairs (
    id TEXT PRIMARY KEY,
    base_symbol TEXT NOT NULL,
    quote_symbol TEXT NOT NULL,
    pair_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS candles (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    open_time BIGINT NOT NULL,
    close_time BIGINT NOT NULL,
    open NUMERIC(18, 8) NOT NULL,
    high NUMERIC(18, 8) NOT NULL,
    low NUMERIC(18, 8) NOT NULL,
    close NUMERIC(18, 8) NOT NULL,
    volume NUMERIC(24, 8) NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    source TEXT NOT NULL DEFAULT 'binance',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, timeframe, open_time)
);
CREATE INDEX IF NOT EXISTS idx_candles_lookup ON candles(symbol, timeframe, open_time DESC);

CREATE TABLE IF NOT EXISTS market_snapshots (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    price NUMERIC(18, 8) NOT NULL,
    price_change_24h NUMERIC(10, 4),
    volume_24h NUMERIC(24, 8),
    high_24h NUMERIC(18, 8),
    low_24h NUMERIC(18, 8),
    rank_24h INT,
    source TEXT DEFAULT 'binance',
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_snapshots_sym ON market_snapshots(symbol, timestamp DESC);

CREATE TABLE IF NOT EXISTS trend_analysis (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    trend_state TEXT NOT NULL, -- UPTREND, DOWNTREND, SIDEWAYS
    confidence NUMERIC(5, 2),
    support_zone NUMERIC(18, 8),
    resistance_zone NUMERIC(18, 8),
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_resistance (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    level_type TEXT NOT NULL, -- SUPPORT, RESISTANCE
    price_level NUMERIC(18, 8) NOT NULL,
    zone_low NUMERIC(18, 8),
    zone_high NUMERIC(18, 8),
    strength INT DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'VALID', -- VALID, BROKEN, UNTESTED
    is_manual_override BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rsi_values (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    period INT DEFAULT 14,
    rsi_value NUMERIC(6, 2) NOT NULL,
    prev_rsi NUMERIC(6, 2),
    slope TEXT, -- RISING, FALLING, FLAT
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ema_values (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    length INT NOT NULL,
    ema_value NUMERIC(18, 8) NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS v1_values (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    color_state TEXT NOT NULL, -- GREEN, TRANSPARENT, RED
    ha_open NUMERIC(18, 8),
    ha_high NUMERIC(18, 8),
    ha_low NUMERIC(18, 8),
    ha_close NUMERIC(18, 8),
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS liquidity_snapshots (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'coinglass',
    heatmap_window TEXT NOT NULL DEFAULT '24h',
    liquidity_above NUMERIC(24, 8),
    liquidity_below NUMERIC(24, 8),
    nearest_pool_price NUMERIC(18, 8),
    distance_pct NUMERIC(6, 2),
    freshness_status TEXT NOT NULL DEFAULT 'FRESH', -- FRESH, AGING, STALE, UNAVAILABLE
    received_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_blocks (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    ob_type TEXT NOT NULL DEFAULT 'BULLISH',
    ob_low NUMERIC(18, 8) NOT NULL,
    ob_high NUMERIC(18, 8) NOT NULL,
    source_candle_time BIGINT NOT NULL,
    pump_candles_count INT NOT NULL DEFAULT 3,
    status TEXT NOT NULL DEFAULT 'UNTESTED', -- UNTESTED, TESTED, BROKEN
    retest_count INT DEFAULT 0,
    formed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ict_analysis (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    prev_candle_color TEXT NOT NULL,
    curr_candle_color TEXT NOT NULL,
    green_candles_count INT,
    pump_pct NUMERIC(6, 2),
    trendline_condition_met BOOLEAN DEFAULT FALSE,
    selected_interpretation TEXT,
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS strategies (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    target_pct NUMERIC(5, 2) DEFAULT 1.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS strategy_versions (
    id TEXT PRIMARY KEY,
    strategy_id TEXT REFERENCES strategies(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    source_rule_version TEXT NOT NULL DEFAULT '1.0',
    config_version TEXT NOT NULL DEFAULT '1.0',
    is_current BOOLEAN DEFAULT TRUE,
    change_summary TEXT,
    created_by TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(strategy_id, version)
);

CREATE TABLE IF NOT EXISTS strategy_rules (
    id TEXT PRIMARY KEY,
    strategy_version_id TEXT REFERENCES strategy_versions(id) ON DELETE CASCADE,
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL, -- SOURCE_RULE, CUSTOM_CONFIG, OPTIONAL_CONFLUENCE, AMBIGUOUS
    is_ambiguous BOOLEAN DEFAULT FALSE,
    selected_interpretation TEXT,
    rule_definition JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS strategy_parameters (
    id TEXT PRIMARY KEY,
    strategy_version_id TEXT REFERENCES strategy_versions(id) ON DELETE CASCADE,
    param_key TEXT NOT NULL,
    param_value JSONB NOT NULL,
    param_type TEXT NOT NULL DEFAULT 'number',
    is_editable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS strategy_signals (
    id TEXT PRIMARY KEY,
    strategy_id TEXT REFERENCES strategies(id),
    strategy_version_id TEXT REFERENCES strategy_versions(id),
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    signal_type TEXT NOT NULL DEFAULT 'LONG',
    entry_price NUMERIC(18, 8) NOT NULL,
    target_price NUMERIC(18, 8) NOT NULL,
    stop_loss_price NUMERIC(18, 8),
    detected_at TIMESTAMPTZ NOT NULL,
    confirmed_at TIMESTAMPTZ NOT NULL,
    lead_time_seconds NUMERIC(8, 2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, EXECUTED, EXPIRED, CANCELLED, DATA_STALE
    source_rules_snapshot JSONB NOT NULL,
    indicators_snapshot JSONB NOT NULL,
    explanation_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_signals_sym ON strategy_signals(symbol, created_at DESC);

CREATE TABLE IF NOT EXISTS master_opportunities (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    primary_strategy_id TEXT REFERENCES strategies(id),
    confluence_strategies JSONB DEFAULT '[]',
    entry_price NUMERIC(18, 8) NOT NULL,
    target_price NUMERIC(18, 8) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_RISK', -- PENDING_RISK, APPROVED, REJECTED, EXECUTED, CLOSED
    risk_evaluation JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risk_checks (
    id TEXT PRIMARY KEY,
    opportunity_id TEXT REFERENCES master_opportunities(id) ON DELETE CASCADE,
    passed BOOLEAN NOT NULL,
    checks_passed JSONB NOT NULL,
    checks_failed JSONB NOT NULL,
    reason TEXT,
    checked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    symbol TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'PAPER', -- PAPER, LIVE
    strategy_id TEXT REFERENCES strategies(id),
    strategy_version_id TEXT,
    side TEXT NOT NULL DEFAULT 'BUY',
    type TEXT NOT NULL DEFAULT 'MARKET',
    quantity NUMERIC(18, 8) NOT NULL,
    price NUMERIC(18, 8),
    executed_price NUMERIC(18, 8),
    status TEXT NOT NULL DEFAULT 'NEW', -- NEW, FILLED, PARTIALLY_FILLED, CANCELLED, REJECTED
    exchange_order_id TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_events (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS positions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    symbol TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'PAPER',
    strategy_id TEXT REFERENCES strategies(id),
    strategy_version_id TEXT,
    entry_price NUMERIC(18, 8) NOT NULL,
    quantity NUMERIC(18, 8) NOT NULL,
    target_price NUMERIC(18, 8) NOT NULL, -- Target +1%
    current_price NUMERIC(18, 8) NOT NULL,
    unrealized_pnl NUMERIC(18, 8) DEFAULT 0,
    unrealized_pnl_pct NUMERIC(8, 4) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, CLOSED
    opened_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY,
    position_id TEXT REFERENCES positions(id),
    user_id TEXT REFERENCES users(id),
    symbol TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'PAPER',
    strategy_id TEXT REFERENCES strategies(id),
    strategy_version_id TEXT,
    entry_time TIMESTAMPTZ NOT NULL,
    entry_price NUMERIC(18, 8) NOT NULL,
    exit_time TIMESTAMPTZ NOT NULL,
    exit_price NUMERIC(18, 8) NOT NULL,
    quantity NUMERIC(18, 8) NOT NULL,
    target_pct NUMERIC(5, 2) DEFAULT 1.0,
    gross_pnl NUMERIC(18, 8) NOT NULL,
    gross_pnl_pct NUMERIC(8, 4) NOT NULL,
    fees NUMERIC(18, 8) DEFAULT 0,
    slippage NUMERIC(18, 8) DEFAULT 0,
    net_pnl NUMERIC(18, 8) NOT NULL,
    net_pnl_pct NUMERIC(8, 4) NOT NULL,
    exit_reason TEXT NOT NULL DEFAULT 'TARGET_REACHED', -- TARGET_REACHED, STOP_LOSS, EMERGENCY_STOP, MANUAL
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trade_exits (
    id TEXT PRIMARY KEY,
    trade_id TEXT REFERENCES trades(id) ON DELETE CASCADE,
    exit_type TEXT NOT NULL DEFAULT 'FULL',
    price NUMERIC(18, 8) NOT NULL,
    quantity NUMERIC(18, 8) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trade_journal (
    id TEXT PRIMARY KEY,
    trade_id TEXT REFERENCES trades(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    strategy_code TEXT NOT NULL,
    strategy_version TEXT NOT NULL,
    source_rules_snapshot JSONB NOT NULL,
    indicator_values_snapshot JSONB NOT NULL,
    agent_decisions JSONB NOT NULL,
    explanation TEXT NOT NULL,
    data_freshness_snapshot JSONB NOT NULL,
    screenshot_url TEXT,
    user_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS backtests (
    id TEXT PRIMARY KEY,
    strategy_id TEXT REFERENCES strategies(id),
    strategy_version_id TEXT,
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL DEFAULT '1h',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    initial_balance NUMERIC(18, 8) DEFAULT 10000,
    final_balance NUMERIC(18, 8),
    total_trades INT DEFAULT 0,
    winning_trades INT DEFAULT 0,
    losing_trades INT DEFAULT 0,
    win_rate NUMERIC(6, 2) DEFAULT 0,
    gross_pnl NUMERIC(18, 8) DEFAULT 0,
    net_pnl NUMERIC(18, 8) DEFAULT 0,
    max_drawdown NUMERIC(6, 2) DEFAULT 0,
    parameters JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS backtest_trades (
    id TEXT PRIMARY KEY,
    backtest_id TEXT REFERENCES backtests(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    entry_time TIMESTAMPTZ NOT NULL,
    entry_price NUMERIC(18, 8) NOT NULL,
    exit_time TIMESTAMPTZ NOT NULL,
    exit_price NUMERIC(18, 8) NOT NULL,
    pnl NUMERIC(18, 8) NOT NULL,
    pnl_pct NUMERIC(8, 4) NOT NULL,
    reason TEXT
);

CREATE TABLE IF NOT EXISTS replay_sessions (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    current_index INT DEFAULT 0,
    total_candles INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PAUSED', -- PLAYING, PAUSED, FINISHED
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- DATA, ANALYSIS, STRATEGY, DECISION, EXECUTION, INTELLIGENCE, OPERATIONS
    status TEXT NOT NULL DEFAULT 'RUNNING', -- RUNNING, STOPPED, PAUSED, ERROR
    is_enabled BOOLEAN DEFAULT TRUE,
    version TEXT NOT NULL DEFAULT '1.0.0',
    current_task TEXT,
    processed_count BIGINT DEFAULT 0,
    error_count INT DEFAULT 0,
    latency_ms NUMERIC(8, 2) DEFAULT 0,
    last_heartbeat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_successful_job TIMESTAMPTZ,
    last_error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_runs (
    id TEXT PRIMARY KEY,
    agent_id TEXT REFERENCES agents(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'SUCCESS',
    details JSONB
);

CREATE TABLE IF NOT EXISTS agent_logs (
    id TEXT PRIMARY KEY,
    agent_id TEXT REFERENCES agents(id) ON DELETE CASCADE,
    log_level TEXT NOT NULL DEFAULT 'INFO', -- INFO, WARN, ERROR, DEBUG
    message TEXT NOT NULL,
    context JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_agent_logs_ts ON agent_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS agent_events (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    agent_id TEXT REFERENCES agents(id),
    symbol TEXT,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- SIGNAL, TRADE, RISK_ALERT, SYSTEM_ALERT, EMERGENCY
    channel TEXT NOT NULL DEFAULT 'IN_APP', -- IN_APP, EMAIL, TELEGRAM
    is_read BOOLEAN DEFAULT FALSE,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_channels (
    id TEXT PRIMARY KEY,
    channel_type TEXT UNIQUE NOT NULL, -- EMAIL, TELEGRAM, BROWSER
    is_enabled BOOLEAN DEFAULT TRUE,
    config JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS commands (
    id TEXT PRIMARY KEY,
    user_prompt TEXT NOT NULL,
    structured_action TEXT NOT NULL,
    parsed_parameters JSONB NOT NULL,
    execution_status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS command_results (
    id TEXT PRIMARY KEY,
    command_id TEXT REFERENCES commands(id) ON DELETE CASCADE,
    result_data JSONB NOT NULL,
    error_message TEXT,
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS research_reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    summary TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    findings JSONB,
    proposed_version_id TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    actor TEXT NOT NULL DEFAULT 'system',
    target_entity TEXT NOT NULL,
    target_id TEXT,
    previous_state JSONB,
    new_state JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ts ON audit_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS health_checks (
    id TEXT PRIMARY KEY,
    service_name TEXT NOT NULL,
    status TEXT NOT NULL, -- HEALTHY, DEGRADED, DOWN
    latency_ms NUMERIC(8, 2) DEFAULT 0,
    details JSONB,
    checked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_quality_events (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    timeframe TEXT,
    event_type TEXT NOT NULL, -- MISSING_CANDLE, OUT_OF_ORDER, STALE_DATA, OUTAGE
    severity TEXT NOT NULL DEFAULT 'WARN',
    details JSONB,
    detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
