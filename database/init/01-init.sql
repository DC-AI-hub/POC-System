-- 港交所POC系统数据库初始化脚本
-- 创建时间: $(date)
-- 版本: 1.0

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建部门表
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES departments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建员工表
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    employee_number VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    department_id UUID REFERENCES departments(id),
    position VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建审批流程表
CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    steps JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建审批记录表
CREATE TABLE IF NOT EXISTS approval_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES approval_workflows(id),
    applicant_id UUID REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    current_step INTEGER DEFAULT 1,
    approvers JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建费用申请表
CREATE TABLE IF NOT EXISTS expense_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_record_id UUID REFERENCES approval_records(id),
    employee_id UUID REFERENCES employees(id),
    expense_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CNY',
    description TEXT,
    receipt_files TEXT[],
    travel_destination VARCHAR(200),
    travel_start_date DATE,
    travel_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建审计日志表
CREATE TABLE IF NOT EXISTS t_poc_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    log_type VARCHAR(50) NOT NULL,
    module VARCHAR(100),
    module_name VARCHAR(100),
    operation VARCHAR(100),
    operation_name VARCHAR(100),
    user_id BIGINT,
    username VARCHAR(100),
    department VARCHAR(100),
    operation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    resource_id VARCHAR(100),
    resource_type VARCHAR(100),
    ip_address VARCHAR(45),
    details TEXT,
    status VARCHAR(20) DEFAULT 'SUCCESS',
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建系统日志表
CREATE TABLE IF NOT EXISTS t_poc_system_logs (
    id BIGSERIAL PRIMARY KEY,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    logger VARCHAR(200),
    thread VARCHAR(100),
    stack_trace TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建安全日志表
CREATE TABLE IF NOT EXISTS t_poc_security_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    user_id BIGINT,
    username VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) NOT NULL,
    description TEXT,
    session_id VARCHAR(100),
    failure_reason VARCHAR(100),
    target_user_id BIGINT,
    target_username VARCHAR(100),
    permission_change TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认管理员用户
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@hkex.com', '$2b$10$defaulthashedpassword', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 插入默认部门
INSERT INTO departments (name, code, description) VALUES
('技术部', 'TECH', '负责系统开发和维护'),
('人事部', 'HR', '负责人力资源管理'),
('财务部', 'FIN', '负责财务管理'),
('运营部', 'OPS', '负责日常运营')
ON CONFLICT (code) DO NOTHING;

-- 插入系统配置
INSERT INTO system_configs (config_key, config_value, description) VALUES
('system_name', '港交所POC系统', '系统名称'),
('system_version', '1.0.0', '系统版本'),
('max_file_size', '10485760', '最大文件上传大小(字节)'),
('allowed_file_types', 'jpg,jpeg,png,pdf,doc,docx', '允许上传的文件类型'),
('session_timeout', '3600', '会话超时时间(秒)')
ON CONFLICT (config_key) DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_employees_employee_number ON employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_approval_records_status ON approval_records(status);
CREATE INDEX IF NOT EXISTS idx_operation_logs_user_id ON operation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON operation_logs(created_at);

-- 创建日志表索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON t_poc_audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation ON t_poc_audit_logs(operation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON t_poc_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation_time ON t_poc_audit_logs(operation_time);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON t_poc_audit_logs(resource_type);

CREATE INDEX IF NOT EXISTS idx_system_logs_level ON t_poc_system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON t_poc_system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_logger ON t_poc_system_logs(logger);

CREATE INDEX IF NOT EXISTS idx_security_logs_action ON t_poc_security_logs(action);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON t_poc_security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_status ON t_poc_security_logs(status);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON t_poc_security_logs(created_at);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approval_workflows_updated_at BEFORE UPDATE ON approval_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approval_records_updated_at BEFORE UPDATE ON approval_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expense_applications_updated_at BEFORE UPDATE ON expense_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_configs_updated_at BEFORE UPDATE ON system_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建视图：用户详细信息
CREATE OR REPLACE VIEW user_details AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.role,
    u.status as user_status,
    e.employee_number,
    e.first_name,
    e.last_name,
    e.position,
    d.name as department_name,
    d.code as department_code,
    e.hire_date,
    e.salary
FROM users u
LEFT JOIN employees e ON u.id = e.user_id
LEFT JOIN departments d ON e.department_id = d.id;

-- 创建视图：审批记录详情
CREATE OR REPLACE VIEW approval_details AS
SELECT 
    ar.id,
    ar.title,
    ar.content,
    ar.status,
    ar.current_step,
    ar.created_at,
    u.username as applicant_name,
    u.email as applicant_email,
    aw.name as workflow_name,
    aw.type as workflow_type
FROM approval_records ar
JOIN users u ON ar.applicant_id = u.id
JOIN approval_workflows aw ON ar.workflow_id = aw.id;

-- 输出初始化完成信息
SELECT 'Database initialization completed successfully!' as status; 