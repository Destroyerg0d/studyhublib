-- Fix remaining authentication security issues

-- 1. Configure OTP expiry to recommended 15 minutes (900 seconds)
UPDATE auth.config 
SET config = config || jsonb_build_object('OTP_EXPIRY', 900)
WHERE key = 'global';

-- If no global config exists, create it
INSERT INTO auth.config (key, config)
SELECT 'global', jsonb_build_object('OTP_EXPIRY', 900)
WHERE NOT EXISTS (SELECT 1 FROM auth.config WHERE key = 'global');

-- 2. Enable leaked password protection
UPDATE auth.config 
SET config = config || jsonb_build_object('PASSWORD_HIBP_ENABLED', true)
WHERE key = 'global';

-- If no global config exists, create it with leaked password protection
INSERT INTO auth.config (key, config)
SELECT 'global', jsonb_build_object('PASSWORD_HIBP_ENABLED', true, 'OTP_EXPIRY', 900)
WHERE NOT EXISTS (SELECT 1 FROM auth.config WHERE key = 'global');