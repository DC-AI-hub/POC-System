-- Poc System 测试数据初始化脚本
-- 执行前请确保数据库已创建并连接

-- 1. 创建用户表（如果不存在）
CREATE TABLE IF NOT EXISTS t_poc_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    user_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    department VARCHAR(50) NOT NULL,
    position VARCHAR(50),
    user_type VARCHAR(20) NOT NULL DEFAULT '员工',
    status VARCHAR(20) NOT NULL DEFAULT '在职',
    password VARCHAR(255) NOT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    last_login_time TIMESTAMP NULL,
    created_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    hire_date TIMESTAMP NULL,
    manager VARCHAR(50),
    work_location VARCHAR(100),
    emergency_contact VARCHAR(50),
    emergency_phone VARCHAR(20),
    notes VARCHAR(500),
    
    INDEX idx_employee_id (employee_id),
    INDEX idx_email (email),
    INDEX idx_department (department),
    INDEX idx_status (status)
);

-- 2. 清空现有测试数据（可选）
-- DELETE FROM t_poc_users WHERE email IN ('admin@hkex.com', 'testuser@hkex.com');

-- 3. 插入测试用户数据
-- 注意：密码使用BCrypt加密，admin123的加密值为：$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa

INSERT INTO t_poc_users (
    employee_id,
    user_name,
    email,
    phone,
    department,
    position,
    user_type,
    status,
    password,
    is_online,
    created_time,
    created_by
) VALUES 
-- 管理员用户
(
    'EMP001',
    '系统管理员',
    'admin@hkex.com',
    '13800138000',
    'IT部',
    '系统管理员',
    '主管',
    '在职',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', -- admin123
    FALSE,
    NOW(),
    'system'
),
-- 测试用户
(
    'EMP002',
    '测试用户',
    'testuser@hkex.com',
    '13800138001',
    '技术部',
    '高级工程师',
    '员工',
    '在职',
    '$2a$10$8K1p/a0dL1LXMIgoEDFrwOeAQGQZQZQZQZQZQZQZQZQZQZQZQZQZ', -- test123
    FALSE,
    NOW(),
    'system'
),
-- 财务用户
(
    'EMP003',
    '财务主管',
    'finance@hkex.com',
    '13800138002',
    '财务部',
    '财务主管',
    '主管',
    '在职',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', -- admin123
    FALSE,
    NOW(),
    'system'
),
-- 人事用户
(
    'EMP004',
    '人事专员',
    'hr@hkex.com',
    '13800138003',
    '人事部',
    '人事专员',
    '员工',
    '在职',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', -- admin123
    FALSE,
    NOW(),
    'system'
)
ON DUPLICATE KEY UPDATE
    user_name = VALUES(user_name),
    phone = VALUES(phone),
    department = VALUES(department),
    position = VALUES(position),
    user_type = VALUES(user_type),
    status = VALUES(status),
    updated_time = NOW(),
    updated_by = 'system';

-- 4. 验证数据插入
SELECT 
    id,
    employee_id,
    user_name,
    email,
    department,
    position,
    user_type,
    status,
    is_online,
    created_time
FROM t_poc_users 
ORDER BY id;

-- 5. 显示测试账户信息
SELECT 
    '测试账户信息' as info,
    email,
    'admin123' as password,
    status,
    user_type
FROM t_poc_users 
WHERE email IN ('admin@hkex.com', 'testuser@hkex.com', 'finance@hkex.com', 'hr@hkex.com'); 