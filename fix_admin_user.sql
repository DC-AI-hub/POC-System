-- 修复admin用户的userType (PostgreSQL版本)
UPDATE t_poc_users 
SET user_type = '主管', 
    updated_time = NOW(), 
    updated_by = 'system' 
WHERE email = 'admin@hkex.com';

-- 验证修复结果
SELECT id, employee_id, user_name, email, user_type, status 
FROM t_poc_users 
WHERE email = 'admin@hkex.com'; 