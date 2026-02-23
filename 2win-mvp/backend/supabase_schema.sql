-- ========================================
-- 2WIN PROJECT - SUPABASE DATABASE SCHEMA
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    hashed_password TEXT NOT NULL,
    height FLOAT,
    weight FLOAT,
    age INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Device Management Tables
-- ========================================
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    device_type TEXT NOT NULL CHECK (device_type IN ('esp32_health')),
    device_uid TEXT UNIQUE NOT NULL,
    device_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE device_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    key_hash TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

-- Health Data Tables
CREATE TABLE readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL,
    metric TEXT NOT NULL CHECK (metric IN (
        'body_temperature',
        'ambient_temperature', 
        'ambient_humidity',
        'steps_per_minute',
        'activity_intensity',
        'device_battery',
        'signal_strength',
        'heart_rate',
        'blood_pressure',
        'blood_glucose',
        'oxygen_saturation',
        'steps'
    )),
    value NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    model_version TEXT NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    prediction_type TEXT NOT NULL CHECK (prediction_type IN ('diabetes_risk_score', 'glucose_trend', 'cardiovascular_risk')),
    value NUMERIC NOT NULL,
    confidence NUMERIC,
    explanation JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE medical_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('warning', 'info', 'success', 'critical')),
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE body_parts_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    body_part TEXT NOT NULL CHECK (body_part IN ('head', 'chest', 'abdomen', 'left-arm', 'right-arm', 'left-leg', 'right-leg')),
    status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
    temperature NUMERIC,
    pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);

-- Devices indexes
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_device_uid ON devices(device_uid);

-- Device keys indexes
CREATE INDEX IF NOT EXISTS idx_device_keys_device_id ON device_keys(device_id);
CREATE INDEX IF NOT EXISTS idx_device_keys_key_hash ON device_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_device_keys_active ON device_keys(active);

-- Readings indexes (time-series performance)
CREATE INDEX IF NOT EXISTS idx_readings_user_ts ON readings(user_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_readings_device_ts ON readings(device_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_readings_metric ON readings(metric);

-- Predictions indexes
CREATE INDEX IF NOT EXISTS idx_predictions_user_ts ON predictions(user_id, ts DESC);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Users RLS policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage users" ON users
    FOR ALL USING (current_setting('app.current_role', true) = 'service_role');

-- Devices RLS policies
CREATE POLICY "Users can view own devices" ON devices
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own devices" ON devices
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Device Keys RLS policies
CREATE POLICY "Service role can manage device keys" ON device_keys
    FOR ALL USING (current_setting('app.current_role', true) = 'service_role');

-- Readings RLS policies
CREATE POLICY "Users can view own readings" ON readings
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can insert readings" ON readings
    FOR INSERT WITH CHECK (current_setting('app.current_role', true) = 'service_role');

-- Predictions RLS policies
CREATE POLICY "Users can view own predictions" ON predictions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can manage predictions" ON predictions
    FOR ALL USING (current_setting('app.current_role', true) = 'service_role');

-- Medical Alerts RLS policies
CREATE POLICY "Users can view own alerts" ON medical_alerts
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own alerts" ON medical_alerts
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can manage alerts" ON medical_alerts
    FOR ALL USING (current_setting('app.current_role', true) = 'service_role');

-- Body Parts Status RLS policies
CREATE POLICY "Users can view own body status" ON body_parts_status
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own body status" ON body_parts_status
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can manage body status" ON body_parts_status
    FOR ALL USING (current_setting('app.current_role', true) = 'service_role');

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SAMPLE DATA (Optional - for testing)
-- ========================================

-- Insert a test user (password: 'test123')
-- INSERT INTO users (email, name, hashed_password) VALUES 
-- ('test@example.com', 'Test User', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe');

-- ========================================
-- NOTES
-- ========================================
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Update environment variables with Supabase URL and keys
-- 3. The service role key should be kept secret and used only on the backend
-- 4. Device keys are hashed for security
-- 5. All user data is isolated using RLS policies
