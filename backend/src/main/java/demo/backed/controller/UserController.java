package demo.backed.controller;

import demo.backed.dto.ApiResponse;
import demo.backed.dto.LoginRequest;
import demo.backed.dto.LoginResponse;
import demo.backed.dto.UserDTO;
import demo.backed.service.UserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@Api(tags = "用户管理", description = "用户管理相关API")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    /**
     * 获取用户列表（分页和搜索）
     */
    @GetMapping
    @ApiOperation("获取用户列表")
    public ApiResponse<Page<UserDTO>> getUsers(
            @ApiParam("页码（从0开始）") @RequestParam(defaultValue = "0") int page,
            @ApiParam("每页大小") @RequestParam(defaultValue = "100") int size,
            @ApiParam("搜索关键词") @RequestParam(required = false) String keyword,
            @ApiParam("部门") @RequestParam(required = false) String department,
            @ApiParam("状态") @RequestParam(required = false) String status,
            @ApiParam("用户类型") @RequestParam(required = false) String userType) {
        
        try {
            Page<UserDTO> users = userService.getUsers(page, size, keyword, department, status, userType);
            return ApiResponse.success(users);
        } catch (Exception e) {
            return ApiResponse.error("获取用户列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据ID获取用户详情
     */
    @GetMapping("/{id}")
    @ApiOperation("获取用户详情")
    public ApiResponse<UserDTO> getUserById(@ApiParam("用户ID") @PathVariable Long id) {
        try {
            Optional<UserDTO> user = userService.getUserById(id);
            if (user.isPresent()) {
                return ApiResponse.success(user.get());
            } else {
                return ApiResponse.notFound("用户不存在");
            }
        } catch (Exception e) {
            return ApiResponse.error("获取用户详情失败: " + e.getMessage());
        }
    }
    
    /**
     * 创建用户
     */
    @PostMapping
    @ApiOperation("创建用户")
    public ApiResponse<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        try {
            UserDTO createdUser = userService.createUser(userDTO);
            return ApiResponse.success("用户创建成功", createdUser);
        } catch (Exception e) {
            return ApiResponse.badRequest("创建用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新用户信息
     */
    @PutMapping("/{id}")
    @ApiOperation("更新用户信息")
    public ApiResponse<UserDTO> updateUser(
            @ApiParam("用户ID") @PathVariable Long id,
            @RequestBody UserDTO userDTO) {
        try {
            UserDTO updatedUser = userService.updateUser(id, userDTO);
            return ApiResponse.success("用户更新成功", updatedUser);
        } catch (Exception e) {
            return ApiResponse.badRequest("更新用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    @ApiOperation("删除用户")
    public ApiResponse<Void> deleteUser(@ApiParam("用户ID") @PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ApiResponse.success("用户删除成功", null);
        } catch (Exception e) {
            return ApiResponse.badRequest("删除用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取在线用户列表
     */
    @GetMapping("/online")
    @ApiOperation("获取在线用户列表")
    public ApiResponse<List<UserDTO>> getOnlineUsers() {
        try {
            List<UserDTO> onlineUsers = userService.getOnlineUsers();
            return ApiResponse.success(onlineUsers);
        } catch (Exception e) {
            return ApiResponse.error("获取在线用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 用户登录
     */
    @PostMapping("/login")
    @ApiOperation("用户登录")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse loginResponse = userService.login(loginRequest);
            return ApiResponse.success("登录成功", loginResponse);
        } catch (Exception e) {
            return ApiResponse.unauthorized("登录失败: " + e.getMessage());
        }
    }
    
    /**
     * 用户登出
     */
    @PostMapping("/logout")
    @ApiOperation("用户登出")
    public ApiResponse<Void> logout(@RequestParam Long userId) {
        try {
            userService.logout(userId);
            return ApiResponse.success("登出成功", null);
        } catch (Exception e) {
            return ApiResponse.error("登出失败: " + e.getMessage());
        }
    }
    
    /**
     * 重置用户密码
     */
    @PostMapping("/{id}/reset-password")
    @ApiOperation("重置用户密码")
    public ApiResponse<Void> resetPassword(
            @ApiParam("用户ID") @PathVariable Long id,
            @RequestBody Map<String, String> passwordData) {
        try {
            String newPassword = passwordData.get("newPassword");
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ApiResponse.badRequest("新密码不能为空");
            }
            userService.resetPassword(id, newPassword);
            return ApiResponse.success("密码重置成功", null);
        } catch (Exception e) {
            return ApiResponse.badRequest("密码重置失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取用户统计信息
     */
    @GetMapping("/stats")
    @ApiOperation("获取用户统计信息")
    public ApiResponse<Map<String, Object>> getUserStats() {
        try {
            long onlineCount = userService.getOnlineUserCount();
            List<Object[]> departmentStats = userService.getUserStatsByDepartment();
            
            Map<String, Object> stats = new java.util.HashMap<>();
            stats.put("onlineCount", onlineCount);
            stats.put("departmentStats", departmentStats);
            
            return ApiResponse.success(stats);
        } catch (Exception e) {
            return ApiResponse.error("获取用户统计失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据工号获取用户
     */
    @GetMapping("/employee/{employeeId}")
    @ApiOperation("根据工号获取用户")
    public ApiResponse<UserDTO> getUserByEmployeeId(@ApiParam("工号") @PathVariable String employeeId) {
        try {
            Optional<UserDTO> user = userService.getUserByEmployeeId(employeeId);
            if (user.isPresent()) {
                return ApiResponse.success(user.get());
            } else {
                return ApiResponse.notFound("用户不存在");
            }
        } catch (Exception e) {
            return ApiResponse.error("获取用户信息失败: " + e.getMessage());
        }
    }
    
    /**
     * 批量创建测试用户数据
     */
    @PostMapping("/batch-create-test-users")
    @ApiOperation("批量创建测试用户数据")
    public ResponseEntity<Map<String, Object>> batchCreateTestUsers() {
        Map<String, Object> result = new HashMap<>();
        List<String> createdUsers = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        
        try {
            // 检查当前用户数量
            long currentCount = userService.getTotalUserCount();
            result.put("beforeCount", currentCount);
            
            // 要创建的测试用户数据
            List<TestUserData> testUsers = Arrays.asList(
                // IT部门用户
                new TestUserData("wangwu@hkex.com", "EMP017", "王五", "信息技术部", "高级软件工程师", "员工", "在职", "系统管理员"),
                new TestUserData("liuliu@hkex.com", "EMP018", "刘六", "信息技术部", "数据库管理员", "员工", "在职", "系统管理员"),
                new TestUserData("zhaoming@hkex.com", "EMP019", "赵明", "信息技术部", "系统架构师", "员工", "在职", "系统管理员"),
                
                // 财务部用户
                new TestUserData("liqing@hkex.com", "EMP020", "李青", "财务部", "高级会计师", "员工", "在职", "张三"),
                new TestUserData("chenfang@hkex.com", "EMP021", "陈芳", "财务部", "出纳员", "员工", "在职", "张三"),
                new TestUserData("wanghua@hkex.com", "EMP022", "王华", "财务部", "财务分析师", "员工", "在职", "张三"),
                
                // 人力资源部用户
                new TestUserData("sunqi@hkex.com", "EMP023", "孙七", "人力资源部", "人力资源总监", "主管", "在职", "COO"),
                new TestUserData("zhouba@hkex.com", "EMP024", "周八", "人力资源部", "招聘专员", "员工", "在职", "孙七"),
                new TestUserData("wuming@hkex.com", "EMP025", "吴明", "人力资源部", "薪酬专员", "员工", "在职", "孙七"),
                
                // 业务部门用户
                new TestUserData("wujiu@hkex.com", "EMP026", "吴九", "交易部", "交易总监", "主管", "在职", "CEO"),
                new TestUserData("zhengshi@hkex.com", "EMP027", "郑十", "交易部", "高级交易员", "员工", "在职", "吴九"),
                new TestUserData("liwei@hkex.com", "EMP028", "李伟", "交易部", "交易员", "员工", "在职", "吴九"),
                
                // 风控部用户
                new TestUserData("huangyi@hkex.com", "EMP029", "黄一", "风控部", "风控经理", "主管", "在职", "CRO"),
                new TestUserData("xueer@hkex.com", "EMP030", "薛二", "风控部", "风控专员", "员工", "在职", "黄一"),
                new TestUserData("tangtao@hkex.com", "EMP031", "汤涛", "风控部", "风险分析师", "员工", "在职", "黄一"),
                
                // 合规部用户
                new TestUserData("yansan@hkex.com", "EMP032", "严三", "合规部", "合规总监", "主管", "在职", "CCO"),
                new TestUserData("caosi@hkex.com", "EMP033", "曹四", "合规部", "合规专员", "员工", "在职", "严三"),
                new TestUserData("dengfei@hkex.com", "EMP034", "邓飞", "合规部", "法务专员", "员工", "在职", "严三"),
                
                // 客户服务部用户
                new TestUserData("fangjie@hkex.com", "EMP035", "方杰", "客户服务部", "客服总监", "主管", "在职", "COO"),
                new TestUserData("gaoxin@hkex.com", "EMP036", "高辛", "客户服务部", "高级客服", "员工", "在职", "方杰"),
                new TestUserData("heyun@hkex.com", "EMP037", "何云", "客户服务部", "客服专员", "员工", "在职", "方杰"),
                
                // 运营部用户
                new TestUserData("jiaxing@hkex.com", "EMP038", "贾星", "运营部", "运营总监", "主管", "在职", "COO"),
                new TestUserData("kangyang@hkex.com", "EMP039", "康阳", "运营部", "运营专员", "员工", "在职", "贾星"),
                new TestUserData("luobin@hkex.com", "EMP040", "罗斌", "运营部", "业务运营", "员工", "在职", "贾星"),
                
                // 测试状态用户
                new TestUserData("majun@hkex.com", "EMP041", "马军", "财务部", "会计助理", "员工", "休假", "张三"),
                new TestUserData("niegang@hkex.com", "EMP042", "聂刚", "IT部", "前端开发", "员工", "离职", "系统管理员")
            );
            
            for (TestUserData userData : testUsers) {
                try {
                    // 检查用户是否已存在
                    if (userService.getUserByEmail(userData.email).isPresent() || 
                        userService.getUserByEmployeeId(userData.employeeId).isPresent()) {
                        continue; // 跳过已存在的用户
                    }
                    
                    UserDTO userDTO = createTestUserDTO(userData);
                    UserDTO createdUser = userService.createUser(userDTO);
                    createdUsers.add(userData.userName + " (" + userData.email + ")");
                    
                } catch (Exception e) {
                    errors.add(userData.userName + ": " + e.getMessage());
                }
            }
            
            long afterCount = userService.getTotalUserCount();
            result.put("afterCount", afterCount);
            result.put("createdCount", createdUsers.size());
            result.put("createdUsers", createdUsers);
            result.put("errors", errors);
            result.put("success", true);
            result.put("message", "批量创建测试用户完成，成功创建 " + createdUsers.size() + " 个用户");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "批量创建用户失败: " + e.getMessage());
            result.put("errors", errors);
            return ResponseEntity.status(500).body(result);
        }
    }
    
    private UserDTO createTestUserDTO(TestUserData userData) {
        UserDTO userDTO = new UserDTO();
        userDTO.setEmployeeId(userData.employeeId);
        userDTO.setUserName(userData.userName);
        userDTO.setEmail(userData.email);
        userDTO.setDepartment(userData.department);
        userDTO.setPosition(userData.position);
        userDTO.setUserType(userData.userType);
        userDTO.setStatus(userData.status);
        userDTO.setManager(userData.manager);
        userDTO.setWorkLocation("香港中环");
        userDTO.setPhone("138" + userData.employeeId.substring(3) + "0000");
        userDTO.setEmergencyContact("紧急联系人-" + userData.userName);
        userDTO.setEmergencyPhone("139" + userData.employeeId.substring(3) + "0000");
        userDTO.setNotes("批量创建的测试用户 - " + userData.department + userData.position);
        userDTO.setHireDate(LocalDateTime.now().minusYears(1).plusDays(Integer.parseInt(userData.employeeId.substring(3)) * 5));
        return userDTO;
    }
    
    // 测试用户数据内部类
    private static class TestUserData {
        String email, employeeId, userName, department, position, userType, status, manager;
        
        TestUserData(String email, String employeeId, String userName, String department, 
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
    
    /**
     * 导入用户数据（CSV文件）
     */
    @PostMapping("/import")
    @ApiOperation("导入用户数据")
    public ApiResponse<Map<String, Object>> importUsers(@RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ApiResponse.badRequest("请选择要导入的文件");
            }
            
            String fileName = file.getOriginalFilename();
            if (fileName == null || !fileName.toLowerCase().endsWith(".csv")) {
                return ApiResponse.badRequest("请上传CSV格式的文件");
            }
            
            Map<String, Object> result = userService.importUsersFromCsv(file);
            return ApiResponse.success("导入完成", result);
        } catch (Exception e) {
            return ApiResponse.error("导入失败: " + e.getMessage());
        }
    }
} 