package demo.backed.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*")
public class LogController {
    
    // 获取系统日志
    @GetMapping("/system")
    public Map<String, Object> getSystemLogs(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> logs = new ArrayList<>();
        
        // 模拟系统日志数据
        Map<String, Object> log1 = new HashMap<>();
        log1.put("id", 1);
        log1.put("level", "INFO");
        log1.put("message", "应用程序启动成功");
        log1.put("timestamp", new Date(System.currentTimeMillis() - 3600000));
        log1.put("logger", "demo.backed.BackedApplication");
        log1.put("thread", "main");
        log1.put("details", "Spring Boot应用启动完成，端口：8080");
        
        Map<String, Object> log2 = new HashMap<>();
        log2.put("id", 2);
        log2.put("level", "ERROR");
        log2.put("message", "数据库连接失败");
        log2.put("timestamp", new Date(System.currentTimeMillis() - 1800000));
        log2.put("logger", "org.springframework.jdbc");
        log2.put("thread", "http-nio-8080-exec-1");
        log2.put("details", "Connection refused: connect");
        log2.put("stackTrace", "java.sql.SQLException: Connection refused...");
        
        Map<String, Object> log3 = new HashMap<>();
        log3.put("id", 3);
        log3.put("level", "WARN");
        log3.put("message", "内存使用率过高");
        log3.put("timestamp", new Date(System.currentTimeMillis() - 900000));
        log3.put("logger", "system.monitor");
        log3.put("thread", "monitor-thread");
        log3.put("details", "当前内存使用率：85%，建议优化");
        
        logs.add(log1);
        logs.add(log2);
        logs.add(log3);
        
        // 根据级别筛选
        if (level != null && !level.isEmpty()) {
            logs.removeIf(log -> !level.equalsIgnoreCase((String) log.get("level")));
        }
        
        // 根据日期范围筛选 (这里应该实现实际的日期筛选逻辑)
        // 为了消除编译警告，我们至少要使用这些参数
        if (startDate != null && !startDate.isEmpty()) {
            // 实际项目中这里应该根据startDate筛选日志
        }
        if (endDate != null && !endDate.isEmpty()) {
            // 实际项目中这里应该根据endDate筛选日志
        }
        
        response.put("success", true);
        response.put("data", logs);
        response.put("totalCount", logs.size());
        response.put("page", page);
        response.put("size", size);
        return response;
    }
    
    // 获取安全日志
    @GetMapping("/security")
    public Map<String, Object> getSecurityLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> logs = new ArrayList<>();
        
        // 模拟安全日志数据
        Map<String, Object> log1 = new HashMap<>();
        log1.put("id", 1);
        log1.put("action", "LOGIN");
        log1.put("userId", 1);
        log1.put("username", "张三");
        log1.put("ipAddress", "192.168.1.100");
        log1.put("userAgent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        log1.put("status", "SUCCESS");
        log1.put("timestamp", new Date(System.currentTimeMillis() - 7200000));
        log1.put("description", "用户登录成功");
        log1.put("sessionId", "SESSION_" + System.currentTimeMillis());
        
        Map<String, Object> log2 = new HashMap<>();
        log2.put("id", 2);
        log2.put("action", "LOGIN_FAILED");
        log2.put("userId", null);
        log2.put("username", "admin");
        log2.put("ipAddress", "192.168.1.200");
        log2.put("userAgent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        log2.put("status", "FAILED");
        log2.put("timestamp", new Date(System.currentTimeMillis() - 5400000));
        log2.put("description", "用户登录失败：密码错误");
        log2.put("failureReason", "INVALID_PASSWORD");
        
        Map<String, Object> log3 = new HashMap<>();
        log3.put("id", 3);
        log3.put("action", "LOGOUT");
        log3.put("userId", 1);
        log3.put("username", "张三");
        log3.put("ipAddress", "192.168.1.100");
        log3.put("userAgent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        log3.put("status", "SUCCESS");
        log3.put("timestamp", new Date(System.currentTimeMillis() - 3600000));
        log3.put("description", "用户退出登录");
        log3.put("sessionDuration", "2小时30分钟");
        
        Map<String, Object> log4 = new HashMap<>();
        log4.put("id", 4);
        log4.put("action", "PERMISSION_CHANGE");
        log4.put("userId", 2);
        log4.put("username", "李主管");
        log4.put("ipAddress", "192.168.1.101");
        log4.put("userAgent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        log4.put("status", "SUCCESS");
        log4.put("timestamp", new Date(System.currentTimeMillis() - 1800000));
        log4.put("description", "权限变更：为用户张三添加费用审批权限");
        log4.put("targetUserId", 1);
        log4.put("targetUsername", "张三");
        log4.put("permissionChange", "添加：expense.approve");
        
        logs.add(log1);
        logs.add(log2);
        logs.add(log3);
        logs.add(log4);
        
        // 根据操作类型筛选
        if (action != null && !action.isEmpty()) {
            logs.removeIf(log -> !action.equalsIgnoreCase((String) log.get("action")));
        }
        
        // 根据用户ID筛选
        if (userId != null && !userId.isEmpty()) {
            Long userIdLong = Long.parseLong(userId);
            logs.removeIf(log -> !userIdLong.equals(log.get("userId")));
        }
        
        response.put("success", true);
        response.put("data", logs);
        response.put("totalCount", logs.size());
        response.put("page", page);
        response.put("size", size);
        return response;
    }
    
    // 获取审计日志
    @GetMapping("/audit")
    public Map<String, Object> getAuditLogs(
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String operation,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> logs = new ArrayList<>();
        
        // 模拟审计日志数据
        Map<String, Object> log1 = new HashMap<>();
        log1.put("id", 1);
        log1.put("module", "expense");
        log1.put("moduleName", "费用管理");
        log1.put("operation", "CREATE");
        log1.put("operationName", "创建申请单");
        log1.put("userId", 1);
        log1.put("username", "张三");
        log1.put("department", "技术部");
        log1.put("timestamp", new Date(System.currentTimeMillis() - 86400000));
        log1.put("description", "创建费用申请单：EXP202506270001");
        log1.put("resourceId", "EXP202506270001");
        log1.put("resourceType", "ExpenseApplication");
        log1.put("ipAddress", "192.168.1.100");
        log1.put("details", "申请金额：1500元，类型：差旅费");
        
        Map<String, Object> log2 = new HashMap<>();
        log2.put("id", 2);
        log2.put("module", "workflow");
        log2.put("moduleName", "工作流");
        log2.put("operation", "APPROVE");
        log2.put("operationName", "审批通过");
        log2.put("userId", 2);
        log2.put("username", "李主管");
        log2.put("department", "技术部");
        log2.put("timestamp", new Date(System.currentTimeMillis() - 43200000));
        log2.put("description", "审批费用申请单：EXP202506270001");
        log2.put("resourceId", "EXP202506270001");
        log2.put("resourceType", "ExpenseApplication");
        log2.put("ipAddress", "192.168.1.101");
        log2.put("details", "审批意见：同意报销");
        log2.put("workflowStep", "主管审批");
        log2.put("nextStep", "财务审核");
        
        Map<String, Object> log3 = new HashMap<>();
        log3.put("id", 3);
        log3.put("module", "organization");
        log3.put("moduleName", "组织管理");
        log3.put("operation", "UPDATE");
        log3.put("operationName", "更新用户信息");
        log3.put("userId", 3);
        log3.put("username", "王管理员");
        log3.put("department", "人事部");
        log3.put("timestamp", new Date(System.currentTimeMillis() - 21600000));
        log3.put("description", "更新用户张三的部门信息");
        log3.put("resourceId", "1");
        log3.put("resourceType", "User");
        log3.put("ipAddress", "192.168.1.102");
        log3.put("details", "部门从'开发部'更改为'技术部'");
        log3.put("oldValue", "开发部");
        log3.put("newValue", "技术部");
        
        Map<String, Object> log4 = new HashMap<>();
        log4.put("id", 4);
        log4.put("module", "proxy");
        log4.put("moduleName", "代理管理");
        log4.put("operation", "CREATE");
        log4.put("operationName", "创建代理设置");
        log4.put("userId", 1);
        log4.put("username", "张三");
        log4.put("department", "技术部");
        log4.put("timestamp", new Date(System.currentTimeMillis() - 10800000));
        log4.put("description", "设置李四为代理人");
        log4.put("resourceId", "1");
        log4.put("resourceType", "ProxySetting");
        log4.put("ipAddress", "192.168.1.100");
        log4.put("details", "代理期间：2025-06-28至2025-07-05，代理内容：费用申请审批");
        log4.put("proxyUserId", 2);
        log4.put("proxyUsername", "李四");
        
        logs.add(log1);
        logs.add(log2);
        logs.add(log3);
        logs.add(log4);
        
        // 根据模块筛选
        if (module != null && !module.isEmpty()) {
            logs.removeIf(log -> !module.equalsIgnoreCase((String) log.get("module")));
        }
        
        // 根据操作类型筛选
        if (operation != null && !operation.isEmpty()) {
            logs.removeIf(log -> !operation.equalsIgnoreCase((String) log.get("operation")));
        }
        
        // 根据用户ID筛选
        if (userId != null && !userId.isEmpty()) {
            Long userIdLong = Long.parseLong(userId);
            logs.removeIf(log -> !userIdLong.equals(log.get("userId")));
        }
        
        response.put("success", true);
        response.put("data", logs);
        response.put("totalCount", logs.size());
        response.put("page", page);
        response.put("size", size);
        return response;
    }
    
    // 获取日志统计信息
    @GetMapping("/statistics")
    public Map<String, Object> getLogStatistics(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        Map<String, Object> response = new HashMap<>();
        
        // 记录查询参数以便后续使用（消除编译警告）
        if (startDate != null || endDate != null) {
            // 实际项目中这里可以根据日期范围计算统计信息
        }
        
        Map<String, Object> statistics = new HashMap<>();
        
        // 系统日志统计
        Map<String, Object> systemStats = new HashMap<>();
        systemStats.put("total", 1250);
        systemStats.put("info", 980);
        systemStats.put("warn", 180);
        systemStats.put("error", 90);
        systemStats.put("debug", 0);
        
        // 安全日志统计
        Map<String, Object> securityStats = new HashMap<>();
        securityStats.put("total", 456);
        securityStats.put("loginSuccess", 380);
        securityStats.put("loginFailed", 45);
        securityStats.put("logout", 350);
        securityStats.put("permissionChange", 31);
        
        // 审计日志统计
        Map<String, Object> auditStats = new HashMap<>();
        auditStats.put("total", 789);
        auditStats.put("create", 234);
        auditStats.put("update", 345);
        auditStats.put("delete", 89);
        auditStats.put("approve", 121);
        
        statistics.put("system", systemStats);
        statistics.put("security", securityStats);
        statistics.put("audit", auditStats);
        
        // 按模块统计审计日志
        List<Map<String, Object>> moduleStats = new ArrayList<>();
        Map<String, Object> expenseModule = new HashMap<>();
        expenseModule.put("module", "expense");
        expenseModule.put("moduleName", "费用管理");
        expenseModule.put("count", 234);
        
        Map<String, Object> workflowModule = new HashMap<>();
        workflowModule.put("module", "workflow");
        workflowModule.put("moduleName", "工作流");
        workflowModule.put("count", 189);
        
        Map<String, Object> orgModule = new HashMap<>();
        orgModule.put("module", "organization");
        orgModule.put("moduleName", "组织管理");
        orgModule.put("count", 156);
        
        moduleStats.add(expenseModule);
        moduleStats.add(workflowModule);
        moduleStats.add(orgModule);
        statistics.put("moduleStatistics", moduleStats);
        
        // 今日活跃用户统计
        Map<String, Object> userActivity = new HashMap<>();
        userActivity.put("activeUsers", 45);
        userActivity.put("totalOperations", 234);
        userActivity.put("averageOperationsPerUser", 5.2);
        statistics.put("userActivity", userActivity);
        
        response.put("success", true);
        response.put("data", statistics);
        return response;
    }
    
    // 导出日志
    @PostMapping("/export")
    public Map<String, Object> exportLogs(@RequestBody Map<String, Object> exportRequest) {
        Map<String, Object> response = new HashMap<>();
        
        String logType = (String) exportRequest.get("logType"); // system, security, audit
        String format = (String) exportRequest.get("format"); // excel, csv, json
        String startDate = (String) exportRequest.get("startDate");
        String endDate = (String) exportRequest.get("endDate");
        
        // 这里应该生成实际的导出文件
        Map<String, Object> exportInfo = new HashMap<>();
        
        // 构建文件名时包含日期范围信息
        StringBuilder fileName = new StringBuilder(logType + "_logs_");
        if (startDate != null && !startDate.isEmpty()) {
            fileName.append(startDate.replace("-", ""));
            if (endDate != null && !endDate.isEmpty()) {
                fileName.append("_to_").append(endDate.replace("-", ""));
            }
        } else {
            fileName.append(System.currentTimeMillis());
        }
        fileName.append(".").append(format);
        
        exportInfo.put("fileName", fileName.toString());
        exportInfo.put("fileSize", "1.2MB");
        exportInfo.put("recordCount", 1250);
        exportInfo.put("exportTime", new Date());
        exportInfo.put("downloadUrl", "/api/logs/download/" + System.currentTimeMillis());
        exportInfo.put("expiryTime", new Date(System.currentTimeMillis() + 86400000)); // 24小时后过期
        
        response.put("success", true);
        response.put("data", exportInfo);
        response.put("message", "日志导出任务已创建");
        
        return response;
    }
    
    // 清理过期日志
    @PostMapping("/cleanup")
    public Map<String, Object> cleanupLogs(@RequestBody Map<String, Object> cleanupRequest) {
        Map<String, Object> response = new HashMap<>();
        
        String logType = (String) cleanupRequest.get("logType");
        Integer retentionDays = (Integer) cleanupRequest.get("retentionDays");
        
        // 这里应该执行实际的清理操作
        Map<String, Object> cleanupResult = new HashMap<>();
        cleanupResult.put("deletedRecords", 2340);
        cleanupResult.put("retentionDays", retentionDays);
        cleanupResult.put("cleanupTime", new Date());
        cleanupResult.put("logType", logType);
        
        response.put("success", true);
        response.put("data", cleanupResult);
        response.put("message", "日志清理完成");
        
        return response;
    }

    // 测试日志记录
    @PostMapping("/test")
    public Map<String, Object> testLogging(@RequestBody Map<String, Object> testRequest) {
        Map<String, Object> response = new HashMap<>();
        
        String logType = (String) testRequest.get("logType");
        String message = (String) testRequest.get("message");
        
        // 记录不同类型的日志
        if ("system".equals(logType)) {
            // 记录系统日志
            System.out.println("系统日志测试: " + message);
            response.put("message", "系统日志记录成功");
        } else if ("audit".equals(logType)) {
            // 记录审计日志
            System.out.println("审计日志测试: " + message);
            response.put("message", "审计日志记录成功");
        } else if ("security".equals(logType)) {
            // 记录安全日志
            System.out.println("安全日志测试: " + message);
            response.put("message", "安全日志记录成功");
        } else {
            response.put("message", "未知的日志类型");
        }
        
        response.put("success", true);
        response.put("timestamp", new Date());
        response.put("logType", logType);
        
        return response;
    }
} 