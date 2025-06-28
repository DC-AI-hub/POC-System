package demo.backed.config;

import demo.backed.entity.User;
import demo.backed.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("=====================================");
        System.out.println("🔄 检查JWT认证系统用户数据...");
        
        try {
            // 检查数据库中是否已有用户数据
            long existingUserCount = userRepository.count();
            System.out.println("📊 数据库中现有用户数量: " + existingUserCount);
            
            if (existingUserCount > 0) {
                System.out.println("✅ 数据库中已存在用户数据，跳过初始化");
                System.out.println("📋 当前系统用户列表：");
                listExistingUsers();
            } else {
                System.out.println("📝 数据库为空，开始创建初始用户数据...");
                createInitialTestUsers();
                verifyCreatedUsers();
            }
            
        } catch (Exception e) {
            System.err.println("❌ 数据初始化过程中出现异常: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
        
        System.out.println("=====================================");
        System.out.println("✅ JWT认证系统用户数据检查完成！");
        System.out.println("=====================================");
    }

    @Transactional
    private void createInitialTestUsers() {
        System.out.println("👥 创建初始测试用户数据...");
        
        // 1. 创建管理员用户
        createUser(
            "admin@hkex.com", 
            "EMP001", 
            "系统管理员", 
            "admin123",
            "信息技术部", 
            "系统管理员", 
            "主管", 
            "在职",
            "CTO",
            "香港中环",
            "系统初始化管理员账户"
        );
        
        // 2. 创建IT部门用户
        createUser(
            "wangwu@hkex.com", 
            "EMP002", 
            "王五", 
            "user123",
            "信息技术部", 
            "高级软件工程师", 
            "员工", 
            "在职",
            "系统管理员",
            "香港中环",
            "IT部门技术开发人员"
        );
        
        createUser(
            "liuliu@hkex.com", 
            "EMP003", 
            "刘六", 
            "user123",
            "信息技术部", 
            "数据库管理员", 
            "员工", 
            "在职",
            "系统管理员",
            "香港中环",
            "IT部门数据库运维人员"
        );
        
        // 3. 创建财务部用户
        createUser(
            "zhangsan@hkex.com", 
            "EMP004", 
            "张三", 
            "user123",
            "财务部", 
            "财务总监", 
            "主管", 
            "在职",
            "CFO",
            "香港中环",
            "财务部门负责人"
        );
        
        createUser(
            "liqing@hkex.com", 
            "EMP005", 
            "李青", 
            "user123",
            "财务部", 
            "高级会计师", 
            "员工", 
            "在职",
            "张三",
            "香港中环",
            "财务部门会计人员"
        );
        
        createUser(
            "chenfang@hkex.com", 
            "EMP006", 
            "陈芳", 
            "user123",
            "财务部", 
            "出纳员", 
            "员工", 
            "在职",
            "张三",
            "香港中环",
            "财务部门出纳人员"
        );
        
        // 4. 创建人力资源部用户
        createUser(
            "sunqi@hkex.com", 
            "EMP007", 
            "孙七", 
            "user123",
            "人力资源部", 
            "人力资源总监", 
            "主管", 
            "在职",
            "COO",
            "香港中环",
            "人力资源部门负责人"
        );
        
        createUser(
            "zhouba@hkex.com", 
            "EMP008", 
            "周八", 
            "user123",
            "人力资源部", 
            "招聘专员", 
            "员工", 
            "在职",
            "孙七",
            "香港中环",
            "人力资源部门招聘人员"
        );
        
        // 5. 创建业务部门用户
        createUser(
            "wujiu@hkex.com", 
            "EMP009", 
            "吴九", 
            "user123",
            "交易部", 
            "交易总监", 
            "主管", 
            "在职",
            "CEO",
            "香港中环",
            "交易部门负责人"
        );
        
        createUser(
            "zhengshi@hkex.com", 
            "EMP010", 
            "郑十", 
            "user123",
            "交易部", 
            "高级交易员", 
            "员工", 
            "在职",
            "吴九",
            "香港中环",
            "交易部门交易人员"
        );
        
        createUser(
            "huangyi@hkex.com", 
            "EMP011", 
            "黄一", 
            "user123",
            "风控部", 
            "风控经理", 
            "主管", 
            "在职",
            "CRO",
            "香港中环",
            "风控部门负责人"
        );
        
        createUser(
            "xueer@hkex.com", 
            "EMP012", 
            "薛二", 
            "user123",
            "风控部", 
            "风控专员", 
            "员工", 
            "在职",
            "黄一",
            "香港中环",
            "风控部门风险控制人员"
        );
        
        // 6. 创建合规部用户
        createUser(
            "yansan@hkex.com", 
            "EMP013", 
            "严三", 
            "user123",
            "合规部", 
            "合规总监", 
            "主管", 
            "在职",
            "CCO",
            "香港中环",
            "合规部门负责人"
        );
        
        createUser(
            "caosi@hkex.com", 
            "EMP014", 
            "曹四", 
            "user123",
            "合规部", 
            "合规专员", 
            "员工", 
            "在职",
            "严三",
            "香港中环",
            "合规部门合规检查人员"
        );
        
        // 7. 创建一些离职/休假用户用于测试
        createUser(
            "lisi@hkex.com", 
            "EMP015", 
            "李四", 
            "user123",
            "人力资源部", 
            "HR专员", 
            "员工", 
            "离职",
            "孙七",
            "香港中环",
            "已离职员工账户（测试用）"
        );
        
        createUser(
            "zhaowu@hkex.com", 
            "EMP016", 
            "赵五", 
            "user123",
            "财务部", 
            "会计助理", 
            "员工", 
            "休假",
            "张三",
            "香港中环",
            "休假员工账户（测试用）"
        );
    }

    private void createUser(String email, String employeeId, String userName, 
                           String password, String department, String position, 
                           String userType, String status, String manager,
                           String workLocation, String notes) {
        
        System.out.println("🔨 创建用户: " + userName + " (" + email + ", " + employeeId + ")");
        
        // 检查用户是否已存在
        if (userRepository.findByEmail(email).isPresent()) {
            System.out.println("⚠️ 用户已存在，跳过: " + email);
            return;
        }
        
        if (userRepository.findByEmployeeId(employeeId).isPresent()) {
            System.out.println("⚠️ 工号已存在，跳过: " + employeeId);
            return;
        }
        
        // 加密密码
        String encodedPassword = passwordEncoder.encode(password);
        System.out.println("🔐 密码加密完成，长度: " + encodedPassword.length());
        
        User user = new User();
        user.setEmail(email);
        user.setEmployeeId(employeeId);
        user.setUserName(userName);
        user.setPassword(encodedPassword);
        user.setDepartment(department);
        user.setPosition(position);
        user.setUserType(userType);
        user.setStatus(status);
        user.setPhone("138" + employeeId.substring(3) + "00" + (employeeId.length() > 5 ? employeeId.substring(5) : "01"));
        user.setHireDate(LocalDateTime.now().minusYears(2).plusDays(Integer.parseInt(employeeId.substring(3)) * 10));
        user.setIsOnline(false);
        user.setManager(manager);
        user.setWorkLocation(workLocation);
        user.setEmergencyContact("紧急联系人-" + userName);
        user.setEmergencyPhone("139" + employeeId.substring(3) + "00" + (employeeId.length() > 5 ? employeeId.substring(5) : "01"));
        user.setNotes(notes);
        user.setCreatedBy("system");
        user.setUpdatedBy("system");
        user.setCreatedTime(LocalDateTime.now());
        user.setUpdatedTime(LocalDateTime.now());
        
        try {
            User savedUser = userRepository.save(user);
            userRepository.flush(); // 强制刷新到数据库
            System.out.println("✅ 成功创建用户: " + userName + " (ID: " + savedUser.getId() + ")");
            
            // 验证密码加密
            boolean passwordMatch = passwordEncoder.matches(password, savedUser.getPassword());
            System.out.println("🔑 密码验证: " + (passwordMatch ? "✅ 正确" : "❌ 错误"));
            
        } catch (Exception e) {
            System.err.println("❌ 创建用户失败: " + email + " - " + e.getMessage());
            throw e;
        }
    }

    private void listExistingUsers() {
        try {
            List<User> users = userRepository.findAll();
            System.out.println("📋 现有用户列表 (共 " + users.size() + " 个用户):");
            
            // 按部门分组显示
            Map<String, List<User>> usersByDepartment = users.stream()
                .collect(java.util.stream.Collectors.groupingBy(User::getDepartment));
            
            usersByDepartment.forEach((department, deptUsers) -> {
                System.out.println("  📁 " + department + " (" + deptUsers.size() + "人):");
                deptUsers.forEach(user -> {
                    String statusIcon = getStatusIcon(user.getStatus());
                    String typeIcon = "主管".equals(user.getUserType()) ? "👔" : "👤";
                    System.out.println("    " + statusIcon + typeIcon + " " + user.getUserName() + 
                                     " (" + user.getEmployeeId() + ") - " + user.getPosition() + 
                                     " - " + user.getEmail());
                });
            });
            
            // 显示账户信息
            System.out.println("🔑 测试登录账户信息:");
            System.out.println("👤 管理员账户 - 邮箱: admin@hkex.com, 密码: admin123");
            System.out.println("👤 普通用户示例 - 邮箱: zhangsan@hkex.com, 密码: user123");
            System.out.println("👤 其他用户密码均为: user123");
            
        } catch (Exception e) {
            System.err.println("❌ 获取用户列表失败: " + e.getMessage());
        }
    }
    
    private String getStatusIcon(String status) {
        switch (status) {
            case "在职": return "✅";
            case "离职": return "❌";
            case "休假": return "🏖️";
            default: return "❓";
        }
    }

    private void verifyCreatedUsers() {
        System.out.println("🔍 验证创建的用户数据...");
        
        long totalUsers = userRepository.count();
        System.out.println("📊 数据库中用户总数: " + totalUsers);
        
        if (totalUsers < 16) { // 期望至少16个用户
            throw new RuntimeException("❌ 用户创建可能不完整，期望至少16个用户，实际" + totalUsers + "个");
        }
        
        // 验证关键用户
        verifyUser("admin@hkex.com", "EMP001", "系统管理员", "在职");
        verifyUser("zhangsan@hkex.com", "EMP004", "张三", "在职");
        verifyUser("lisi@hkex.com", "EMP015", "李四", "离职");
        
        System.out.println("✅ 核心用户数据验证通过！");
        
        // 显示部门统计
        System.out.println("📊 部门用户统计:");
        List<Object[]> deptStats = userRepository.findUserCountByDepartment();
        if (deptStats != null) {
            deptStats.forEach(stat -> {
                System.out.println("  📁 " + stat[0] + ": " + stat[1] + "人");
            });
        }
    }

    private void verifyUser(String email, String expectedEmployeeId, String expectedName, String expectedStatus) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("✅ 验证用户: " + expectedName + 
                             " | ID=" + user.getId() + 
                             " | 邮箱=" + user.getEmail() + 
                             " | 工号=" + user.getEmployeeId() + 
                             " | 状态=" + user.getStatus());
            
            if (!expectedEmployeeId.equals(user.getEmployeeId())) {
                throw new RuntimeException("❌ 用户工号错误: " + email + ", 期望=" + expectedEmployeeId + ", 实际=" + user.getEmployeeId());
            }
            if (!expectedStatus.equals(user.getStatus())) {
                throw new RuntimeException("❌ 用户状态错误: " + email + ", 期望=" + expectedStatus + ", 实际=" + user.getStatus());
            }
        } else {
            throw new RuntimeException("❌ 用户不存在: " + email);
        }
    }
} 