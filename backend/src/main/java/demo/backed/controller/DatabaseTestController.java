package demo.backed.controller;

import demo.backed.entity.TestEntity;
import demo.backed.repository.TestEntityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/database")
@Api(tags = "数据库连接测试")
public class DatabaseTestController {
    
    @Autowired
    private DataSource dataSource;
    
    @Autowired
    private TestEntityRepository testEntityRepository;
    
    @GetMapping("/test-connection")
    @ApiOperation("测试数据库连接")
    public ResponseEntity<Map<String, Object>> testConnection() {
        Map<String, Object> result = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            // 测试连接是否有效
            boolean isValid = connection.isValid(5);
            result.put("connected", isValid);
            result.put("message", isValid ? "数据库连接成功!" : "数据库连接失败!");
            
            if (isValid) {
                // 获取数据库基本信息
                result.put("databaseProductName", connection.getMetaData().getDatabaseProductName());
                result.put("databaseProductVersion", connection.getMetaData().getDatabaseProductVersion());
                result.put("url", connection.getMetaData().getURL());
                result.put("userName", connection.getMetaData().getUserName());
                
                // 测试查询
                try (PreparedStatement stmt = connection.prepareStatement("SELECT current_timestamp as current_time, version() as db_version");
                     ResultSet rs = stmt.executeQuery()) {
                    
                    if (rs.next()) {
                        result.put("currentTime", rs.getTimestamp("current_time"));
                        result.put("version", rs.getString("db_version"));
                    }
                }
                
                // 测试数据库是否为空
                try (PreparedStatement stmt = connection.prepareStatement(
                        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
                     ResultSet rs = stmt.executeQuery()) {
                    
                    int tableCount = 0;
                    while (rs.next()) {
                        tableCount++;
                    }
                    result.put("tableCount", tableCount);
                }
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            result.put("connected", false);
            result.put("message", "数据库连接失败: " + e.getMessage());
            result.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(result);
        }
    }
    
    @GetMapping("/health")
    @ApiOperation("健康检查")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            boolean isValid = connection.isValid(3);
            health.put("status", isValid ? "UP" : "DOWN");
            health.put("database", "PostgreSQL");
            health.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(health);
            
        } catch (Exception e) {
            health.put("status", "DOWN");
            health.put("error", e.getMessage());
            health.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(503).body(health);
        }
    }
    
    @PostMapping("/test-jpa")
    @ApiOperation("测试JPA数据操作")
    public ResponseEntity<Map<String, Object>> testJPA() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 创建测试数据
            TestEntity testEntity = new TestEntity("数据库连接测试", "PostgreSQL连接成功，JPA工作正常！");
            TestEntity saved = testEntityRepository.save(testEntity);
            result.put("saved", saved);
            
            // 查询所有测试数据
            List<TestEntity> allTests = testEntityRepository.findAll();
            result.put("allTests", allTests);
            result.put("totalCount", allTests.size());
            
            // 统计总数
            long count = testEntityRepository.countAllTests();
            result.put("countFromQuery", count);
            
            result.put("jpaStatus", "SUCCESS");
            result.put("message", "JPA测试成功！表已自动创建，数据操作正常。");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            result.put("jpaStatus", "FAILED");
            result.put("message", "JPA测试失败: " + e.getMessage());
            result.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(result);
        }
    }
    
    @GetMapping("/test-data")
    @ApiOperation("获取测试数据")
    public ResponseEntity<Map<String, Object>> getTestData() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<TestEntity> allTests = testEntityRepository.findAll();
            List<TestEntity> latestTests = testEntityRepository.findLatestTests();
            long count = testEntityRepository.count();
            
            result.put("allTests", allTests);
            result.put("latestTests", latestTests);
            result.put("totalCount", count);
            result.put("status", "SUCCESS");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            result.put("status", "FAILED");
            result.put("message", "获取测试数据失败: " + e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }
    
    @DeleteMapping("/clear-test-data")
    @ApiOperation("清空测试数据")
    public ResponseEntity<Map<String, Object>> clearTestData() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            long count = testEntityRepository.count();
            testEntityRepository.deleteAll();
            
            result.put("deletedCount", count);
            result.put("status", "SUCCESS");
            result.put("message", "测试数据已清空");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            result.put("status", "FAILED");
            result.put("message", "清空测试数据失败: " + e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }
    
    @PostMapping("/create-more-test-users")
    @ApiOperation("创建更多测试用户（无需认证）")
    public ResponseEntity<Map<String, Object>> createMoreTestUsers() {
        Map<String, Object> result = new HashMap<>();
        List<String> createdUsers = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        
        try {
            // 模拟用户数据
            List<TestUserInfo> testUsers = Arrays.asList(
                // IT部门用户
                new TestUserInfo("wangwu@hkex.com", "EMP017", "王五", "信息技术部", "高级软件工程师", "员工", "在职", "系统管理员"),
                new TestUserInfo("liuliu@hkex.com", "EMP018", "刘六", "信息技术部", "数据库管理员", "员工", "在职", "系统管理员"),
                new TestUserInfo("zhaoming@hkex.com", "EMP019", "赵明", "信息技术部", "系统架构师", "员工", "在职", "系统管理员"),
                
                // 财务部用户
                new TestUserInfo("liqing@hkex.com", "EMP020", "李青", "财务部", "高级会计师", "员工", "在职", "张三"),
                new TestUserInfo("chenfang@hkex.com", "EMP021", "陈芳", "财务部", "出纳员", "员工", "在职", "张三"),
                new TestUserInfo("wanghua@hkex.com", "EMP022", "王华", "财务部", "财务分析师", "员工", "在职", "张三"),
                
                // 人力资源部用户
                new TestUserInfo("sunqi@hkex.com", "EMP023", "孙七", "人力资源部", "人力资源总监", "主管", "在职", "COO"),
                new TestUserInfo("zhouba@hkex.com", "EMP024", "周八", "人力资源部", "招聘专员", "员工", "在职", "孙七"),
                new TestUserInfo("wuming@hkex.com", "EMP025", "吴明", "人力资源部", "薪酬专员", "员工", "在职", "孙七"),
                
                // 业务部门用户
                new TestUserInfo("wujiu@hkex.com", "EMP026", "吴九", "交易部", "交易总监", "主管", "在职", "CEO"),
                new TestUserInfo("zhengshi@hkex.com", "EMP027", "郑十", "交易部", "高级交易员", "员工", "在职", "吴九"),
                new TestUserInfo("liwei@hkex.com", "EMP028", "李伟", "交易部", "交易员", "员工", "在职", "吴九"),
                
                // 风控部用户
                new TestUserInfo("huangyi@hkex.com", "EMP029", "黄一", "风控部", "风控经理", "主管", "在职", "CRO"),
                new TestUserInfo("xueer@hkex.com", "EMP030", "薛二", "风控部", "风控专员", "员工", "在职", "黄一"),
                new TestUserInfo("tangtao@hkex.com", "EMP031", "汤涛", "风控部", "风险分析师", "员工", "在职", "黄一"),
                
                // 合规部用户
                new TestUserInfo("yansan@hkex.com", "EMP032", "严三", "合规部", "合规总监", "主管", "在职", "CCO"),
                new TestUserInfo("caosi@hkex.com", "EMP033", "曹四", "合规部", "合规专员", "员工", "在职", "严三"),
                new TestUserInfo("dengfei@hkex.com", "EMP034", "邓飞", "合规部", "法务专员", "员工", "在职", "严三"),
                
                // 客户服务部用户
                new TestUserInfo("fangjie@hkex.com", "EMP035", "方杰", "客户服务部", "客服总监", "主管", "在职", "COO"),
                new TestUserInfo("gaoxin@hkex.com", "EMP036", "高辛", "客户服务部", "高级客服", "员工", "在职", "方杰"),
                new TestUserInfo("heyun@hkex.com", "EMP037", "何云", "客户服务部", "客服专员", "员工", "在职", "方杰"),
                
                // 运营部用户
                new TestUserInfo("jiaxing@hkex.com", "EMP038", "贾星", "运营部", "运营总监", "主管", "在职", "COO"),
                new TestUserInfo("kangyang@hkex.com", "EMP039", "康阳", "运营部", "运营专员", "员工", "在职", "贾星"),
                new TestUserInfo("luobin@hkex.com", "EMP040", "罗斌", "运营部", "业务运营", "员工", "在职", "贾星"),
                
                // 测试状态用户
                new TestUserInfo("majun@hkex.com", "EMP041", "马军", "财务部", "会计助理", "员工", "休假", "张三"),
                new TestUserInfo("niegang@hkex.com", "EMP042", "聂刚", "信息技术部", "前端开发", "员工", "离职", "系统管理员")
            );
            
            long beforeCount = countUsersInDatabase();
            result.put("beforeCount", beforeCount);
            
            for (TestUserInfo userInfo : testUsers) {
                try {
                    // 检查用户是否已存在
                    boolean emailExists = checkUserExistsByEmail(userInfo.email);
                    boolean employeeIdExists = checkUserExistsByEmployeeId(userInfo.employeeId);
                    
                    if (emailExists || employeeIdExists) {
                        continue; // 跳过已存在的用户
                    }
                    
                    // 创建用户
                    createTestUser(userInfo);
                    createdUsers.add(userInfo.userName + " (" + userInfo.email + ")");
                    
                } catch (Exception e) {
                    errors.add(userInfo.userName + ": " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            long afterCount = countUsersInDatabase();
            result.put("afterCount", afterCount);
            result.put("createdCount", createdUsers.size());
            result.put("createdUsers", createdUsers);
            result.put("errors", errors);
            result.put("status", "SUCCESS");
            result.put("message", "批量创建测试用户完成，成功创建 " + createdUsers.size() + " 个用户");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            result.put("status", "FAILED");
            result.put("message", "批量创建用户失败: " + e.getMessage());
            result.put("errors", errors);
            e.printStackTrace();
            return ResponseEntity.status(500).body(result);
        }
    }
    
    private long countUsersInDatabase() {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM t_poc_users")) {
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong(1);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }
    
    private boolean checkUserExistsByEmail(String email) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM t_poc_users WHERE email = ?")) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
    
    private boolean checkUserExistsByEmployeeId(String employeeId) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM t_poc_users WHERE employee_id = ?")) {
            ps.setString(1, employeeId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
    
    private void createTestUser(TestUserInfo userInfo) throws Exception {
        String sql = "INSERT INTO t_poc_users (employee_id, user_name, email, phone, department, position, " +
                    "user_type, status, password, is_online, hire_date, manager, work_location, " +
                    "emergency_contact, emergency_phone, notes, created_by, updated_by, created_time, updated_time) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            // 生成加密密码（默认密码为user123）
            String encodedPassword = "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z2EuHE2M.9/6aDr9R0F5E.Y6"; // BCrypt hash of "user123"
            
            ps.setString(1, userInfo.employeeId);
            ps.setString(2, userInfo.userName);
            ps.setString(3, userInfo.email);
            ps.setString(4, "138" + userInfo.employeeId.substring(3) + "0000");
            ps.setString(5, userInfo.department);
            ps.setString(6, userInfo.position);
            ps.setString(7, userInfo.userType);
            ps.setString(8, userInfo.status);
            ps.setString(9, encodedPassword);
            ps.setBoolean(10, false); // is_online
            ps.setTimestamp(11, java.sql.Timestamp.valueOf(java.time.LocalDateTime.now().minusYears(1))); // hire_date
            ps.setString(12, userInfo.manager);
            ps.setString(13, "香港中环");
            ps.setString(14, "紧急联系人-" + userInfo.userName);
            ps.setString(15, "139" + userInfo.employeeId.substring(3) + "0000");
            ps.setString(16, "批量创建的测试用户 - " + userInfo.department + userInfo.position);
            ps.setString(17, "system");
            ps.setString(18, "system");
            ps.setTimestamp(19, java.sql.Timestamp.valueOf(java.time.LocalDateTime.now()));
            ps.setTimestamp(20, java.sql.Timestamp.valueOf(java.time.LocalDateTime.now()));
            
            ps.executeUpdate();
        }
    }
    
    @GetMapping("/user-stats")
    @ApiOperation("获取用户统计信息")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 查询用户总数
            long totalUsers = countUsersInDatabase();
            result.put("totalUsers", totalUsers);
            
            // 查询用户列表（前20个）
            List<Map<String, Object>> userList = getUserList();
            result.put("userList", userList);
            
            // 按部门统计用户数
            Map<String, Integer> departmentStats = getDepartmentStats();
            result.put("departmentStats", departmentStats);
            
            // 按状态统计用户数
            Map<String, Integer> statusStats = getStatusStats();
            result.put("statusStats", statusStats);
            
            result.put("status", "SUCCESS");
            result.put("message", "用户统计信息获取成功");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            result.put("status", "FAILED");
            result.put("message", "获取用户统计失败: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(result);
        }
    }
    
    private List<Map<String, Object>> getUserList() {
        List<Map<String, Object>> users = new ArrayList<>();
        String sql = "SELECT id, employee_id, user_name, email, department, position, user_type, status " +
                    "FROM t_poc_users ORDER BY id LIMIT 30";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            
            while (rs.next()) {
                Map<String, Object> user = new HashMap<>();
                user.put("id", rs.getLong("id"));
                user.put("employeeId", rs.getString("employee_id"));
                user.put("userName", rs.getString("user_name"));
                user.put("email", rs.getString("email"));
                user.put("department", rs.getString("department"));
                user.put("position", rs.getString("position"));
                user.put("userType", rs.getString("user_type"));
                user.put("status", rs.getString("status"));
                users.add(user);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return users;
    }
    
    private Map<String, Integer> getDepartmentStats() {
        Map<String, Integer> stats = new HashMap<>();
        String sql = "SELECT department, COUNT(*) as count FROM t_poc_users GROUP BY department ORDER BY department";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            
            while (rs.next()) {
                stats.put(rs.getString("department"), rs.getInt("count"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return stats;
    }
    
    private Map<String, Integer> getStatusStats() {
        Map<String, Integer> stats = new HashMap<>();
        String sql = "SELECT status, COUNT(*) as count FROM t_poc_users GROUP BY status ORDER BY status";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            
            while (rs.next()) {
                stats.put(rs.getString("status"), rs.getInt("count"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return stats;
    }
    
    @PostMapping("/update-managers")
    @ApiOperation("批量更新所有用户的直属主管")
    public ResponseEntity<Map<String, Object>> updateAllUsersManagers() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 定义5个指定的主管
            List<String> managers = Arrays.asList("李总监", "魏主管", "钟总监", "CEO", "CTO");
            
            // 获取所有用户ID
            List<Long> userIds = getAllUserIds();
            int updatedCount = 0;
            
            // 为每个用户随机分配主管
            for (Long userId : userIds) {
                // 随机选择一个主管
                String randomManager = managers.get((int) (Math.random() * managers.size()));
                
                // 更新用户的主管
                if (updateUserManager(userId, randomManager)) {
                    updatedCount++;
                }
            }
            
            result.put("status", "SUCCESS");
            result.put("message", "批量更新用户主管成功");
            result.put("totalUsers", userIds.size());
            result.put("updatedCount", updatedCount);
            result.put("managers", managers);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            result.put("status", "FAILED");
            result.put("message", "批量更新用户主管失败: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(result);
        }
    }
    
    private List<Long> getAllUserIds() {
        List<Long> userIds = new ArrayList<>();
        String sql = "SELECT id FROM t_poc_users ORDER BY id";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            
            while (rs.next()) {
                userIds.add(rs.getLong("id"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return userIds;
    }
    
    private boolean updateUserManager(Long userId, String manager) {
        String sql = "UPDATE t_poc_users SET manager = ?, updated_time = ? WHERE id = ?";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, manager);
            ps.setTimestamp(2, java.sql.Timestamp.valueOf(java.time.LocalDateTime.now()));
            ps.setLong(3, userId);
            
            int affectedRows = ps.executeUpdate();
            return affectedRows > 0;
            
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    // 测试用户信息类
    private static class TestUserInfo {
        String email, employeeId, userName, department, position, userType, status, manager;
        
        TestUserInfo(String email, String employeeId, String userName, String department, 
                    String position, String userType, String status, String manager) {
            this.email = email;
            this.employeeId = employeeId;
            this.userName = userName;
            this.department = department;
            this.position = position;
            this.userType = userType;
            this.status = status;
            this.manager = manager;
        }
    }
} 