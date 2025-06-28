package demo.backed.service;

import demo.backed.dto.LoginRequest;
import demo.backed.dto.LoginResponse;
import demo.backed.dto.UserDTO;
import demo.backed.entity.User;
import demo.backed.repository.UserRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.*;

@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    /**
     * 获取用户列表（分页和搜索）
     */
    public Page<UserDTO> getUsers(int page, int size, String keyword, String department, String status, String userType) {
        // 创建分页对象，按创建时间倒序排列
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdTime"));
        
        Page<User> userPage;
        
        // 根据条件查询
        if (StringUtils.hasText(keyword) || StringUtils.hasText(department) || 
            StringUtils.hasText(status) || StringUtils.hasText(userType)) {
            // 复合条件查询
            userPage = userRepository.findByConditions(
                StringUtils.hasText(keyword) ? keyword : null,
                StringUtils.hasText(department) ? department : null,
                StringUtils.hasText(status) ? status : null,
                StringUtils.hasText(userType) ? userType : null,
                pageable
            );
        } else {
            // 获取所有用户
            userPage = userRepository.findAll(pageable);
        }
        
        // 转换为DTO
        return userPage.map(this::convertToDTO);
    }
    
    /**
     * 根据ID获取用户
     */
    public Optional<UserDTO> getUserById(Long id) {
        return userRepository.findById(id).map(this::convertToDTO);
    }
    
    /**
     * 根据工号获取用户
     */
    public Optional<UserDTO> getUserByEmployeeId(String employeeId) {
        return userRepository.findByEmployeeId(employeeId).map(this::convertToDTO);
    }
    
    /**
     * 创建用户
     */
    public UserDTO createUser(UserDTO userDTO) {
        // 验证业务规则
        validateUser(userDTO, null);
        
        User user = new User();
        BeanUtils.copyProperties(userDTO, user);
        
        // 设置默认密码（工号）并加密
        if (!StringUtils.hasText(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(userDTO.getEmployeeId()));
        }
        
        // 设置创建信息
        user.setCreatedBy("system"); // 这里可以从当前登录用户获取
        user.setUpdatedBy("system");
        
        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }
    
    /**
     * 更新用户
     */
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User existingUser = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 验证业务规则
        validateUser(userDTO, id);
        
        // 更新字段（排除密码和系统字段）
        existingUser.setEmployeeId(userDTO.getEmployeeId());
        existingUser.setUserName(userDTO.getUserName());
        existingUser.setEmail(userDTO.getEmail());
        existingUser.setPhone(userDTO.getPhone());
        existingUser.setDepartment(userDTO.getDepartment());
        existingUser.setPosition(userDTO.getPosition());
        existingUser.setUserType(userDTO.getUserType());
        existingUser.setStatus(userDTO.getStatus());
        existingUser.setHireDate(userDTO.getHireDate());
        existingUser.setManager(userDTO.getManager());
        existingUser.setWorkLocation(userDTO.getWorkLocation());
        existingUser.setEmergencyContact(userDTO.getEmergencyContact());
        existingUser.setEmergencyPhone(userDTO.getEmergencyPhone());
        existingUser.setNotes(userDTO.getNotes());
        existingUser.setUpdatedBy("system"); // 这里可以从当前登录用户获取
        
        User savedUser = userRepository.save(existingUser);
        return convertToDTO(savedUser);
    }
    
    /**
     * 删除用户
     */
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 检查是否可以删除（例如：不能删除有业务数据的用户）
        // 这里可以添加更多业务规则检查
        
        userRepository.delete(user);
    }
    
    /**
     * 获取在线用户列表
     */
    public List<UserDTO> getOnlineUsers() {
        List<User> onlineUsers = userRepository.findByIsOnlineTrue();
        return onlineUsers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * 用户登录
     */
    public LoginResponse login(LoginRequest loginRequest) {
        // 根据邮箱查找用户
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        
        if (!userOptional.isPresent()) {
            throw new RuntimeException("用户不存在");
        }
        
        User user = userOptional.get();
        
        // 检查用户状态
        if (!"在职".equals(user.getStatus())) {
            throw new RuntimeException("用户状态异常，无法登录");
        }
        
        // 验证密码
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("密码错误");
        }
        
        // 更新登录信息
        user.setIsOnline(true);
        user.setLastLoginTime(LocalDateTime.now());
        userRepository.save(user);
        
        // 生成JWT token（这里简化处理，实际应该使用JWT工具）
        String token = generateToken(user);
        
        UserDTO userDTO = convertToDTO(user);
        return new LoginResponse(token, 86400L, userDTO); // 24小时过期
    }
    
    /**
     * 用户登出
     */
    public void logout(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setIsOnline(false);
            userRepository.save(user);
        }
    }
    
    /**
     * 更新用户登录信息（为JWT认证使用）
     */
    public void updateUserLoginInfo(Long userId, Boolean isOnline, LocalDateTime lastLoginTime) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (isOnline != null) {
                user.setIsOnline(isOnline);
            }
            if (lastLoginTime != null) {
                user.setLastLoginTime(lastLoginTime);
            }
            user.setUpdatedBy("system");
            userRepository.save(user);
        }
    }
    
    /**
     * 重置用户密码
     */
    public void resetPassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 加密新密码
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedBy("system");
        
        userRepository.save(user);
    }
    
    /**
     * 从CSV文件导入用户数据
     */
    public Map<String, Object> importUsersFromCsv(MultipartFile file) throws Exception {
        List<Map<String, String>> errorList = new ArrayList<>();
        List<UserDTO> successList = new ArrayList<>();
        int totalRecords = 0;
        
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            
            String line;
            int rowNum = 0;
            String[] headers = null;
            
            while ((line = reader.readLine()) != null) {
                rowNum++;
                String[] values = line.split(",");
                
                // 处理表头
                if (rowNum == 1) {
                    headers = values;
                    continue;
                }
                
                totalRecords++;
                
                try {
                    // 解析CSV行数据
                    UserDTO userDTO = parseCsvRow(values, headers, rowNum);
                    
                    // 验证数据
                    final int currentRow = rowNum;  // 创建final变量供lambda使用
                    validateImportUser(userDTO, currentRow, errorList);
                    
                    if (errorList.stream().noneMatch(error -> error.get("row").equals(String.valueOf(currentRow)))) {
                        // 创建用户
                        UserDTO createdUser = createUser(userDTO);
                        successList.add(createdUser);
                    }
                    
                } catch (Exception e) {
                    Map<String, String> error = new HashMap<>();
                    error.put("row", String.valueOf(rowNum));
                    error.put("field", "全部");
                    error.put("message", "数据解析失败: " + e.getMessage());
                    error.put("value", line);
                    errorList.add(error);
                }
            }
        }
        
        // 返回导入结果
        Map<String, Object> result = new HashMap<>();
        result.put("totalRecords", totalRecords);
        result.put("successCount", successList.size());
        result.put("errorCount", errorList.size());
        result.put("errors", errorList);
        result.put("success", errorList.size() == 0);
        
        return result;
    }
    
    /**
     * 解析CSV行数据
     */
    private UserDTO parseCsvRow(String[] values, String[] headers, int rowNum) {
        UserDTO userDTO = new UserDTO();
        
        for (int i = 0; i < headers.length && i < values.length; i++) {
            String header = headers[i].trim();
            String value = values[i].trim();
            
            switch (header) {
                case "姓名":
                case "用户姓名":
                    userDTO.setUserName(value);
                    break;
                case "登录名":
                case "用户名":
                    // 如果没有提供登录名，使用姓名的拼音或工号
                    break;
                case "工号":
                case "员工编号":
                    userDTO.setEmployeeId(value);
                    break;
                case "邮箱":
                case "电子邮箱":
                    userDTO.setEmail(value);
                    break;
                case "手机":
                case "手机号":
                case "联系电话":
                    userDTO.setPhone(value);
                    break;
                case "部门":
                case "所属部门":
                    userDTO.setDepartment(value);
                    break;
                case "职位":
                case "岗位":
                    userDTO.setPosition(value);
                    break;
                case "员工类型":
                case "人员类型":
                    userDTO.setUserType(mapEmployeeTypeFromCsv(value));
                    break;
                case "员工状态":
                case "人员状态":
                case "状态":
                    userDTO.setStatus(mapStatusFromCsv(value));
                    break;
                case "主管":
                case "直属主管":
                    userDTO.setManager(value);
                    break;
                case "工作地点":
                case "办公地点":
                    userDTO.setWorkLocation(value);
                    break;
                case "紧急联系人":
                    userDTO.setEmergencyContact(value);
                    break;
                case "紧急联系电话":
                    userDTO.setEmergencyPhone(value);
                    break;
                case "备注":
                    userDTO.setNotes(value);
                    break;
            }
        }
        
        // 设置默认值
        if (!StringUtils.hasText(userDTO.getStatus())) {
            userDTO.setStatus("在职");
        }
        if (!StringUtils.hasText(userDTO.getUserType())) {
            userDTO.setUserType("员工");
        }
        
        return userDTO;
    }
    
    /**
     * 验证导入的用户数据
     */
    private void validateImportUser(UserDTO userDTO, int rowNum, List<Map<String, String>> errorList) {
        // 必填字段验证
        if (!StringUtils.hasText(userDTO.getUserName())) {
            addError(errorList, rowNum, "姓名", "姓名不能为空", userDTO.getUserName());
        }
        
        if (!StringUtils.hasText(userDTO.getEmployeeId())) {
            addError(errorList, rowNum, "工号", "工号不能为空", userDTO.getEmployeeId());
        }
        
        if (!StringUtils.hasText(userDTO.getEmail())) {
            addError(errorList, rowNum, "邮箱", "邮箱不能为空", userDTO.getEmail());
        }
        
        if (!StringUtils.hasText(userDTO.getDepartment())) {
            addError(errorList, rowNum, "部门", "部门不能为空", userDTO.getDepartment());
        }
        
        // 格式验证
        if (StringUtils.hasText(userDTO.getEmail()) && !isValidEmail(userDTO.getEmail())) {
            addError(errorList, rowNum, "邮箱", "邮箱格式不正确", userDTO.getEmail());
        }
        
        // 唯一性验证
        if (StringUtils.hasText(userDTO.getEmployeeId())) {
            Optional<User> existingUserByEmployeeId = userRepository.findByEmployeeId(userDTO.getEmployeeId());
            if (existingUserByEmployeeId.isPresent()) {
                addError(errorList, rowNum, "工号", "工号已存在", userDTO.getEmployeeId());
            }
        }
        
        if (StringUtils.hasText(userDTO.getEmail())) {
            Optional<User> existingUserByEmail = userRepository.findByEmail(userDTO.getEmail());
            if (existingUserByEmail.isPresent()) {
                addError(errorList, rowNum, "邮箱", "邮箱已存在", userDTO.getEmail());
            }
        }
    }
    
    /**
     * 添加错误信息
     */
    private void addError(List<Map<String, String>> errorList, int rowNum, String field, String message, String value) {
        Map<String, String> error = new HashMap<>();
        error.put("row", String.valueOf(rowNum));
        error.put("field", field);
        error.put("message", message);
        error.put("value", value != null ? value : "");
        errorList.add(error);
    }
    
    /**
     * 映射CSV中的员工类型
     */
    private String mapEmployeeTypeFromCsv(String csvType) {
        if (!StringUtils.hasText(csvType)) {
            return "员工";
        }
        
        switch (csvType.trim()) {
            case "正式员工":
            case "正式":
                return "员工";
            case "兼职员工":
            case "兼职":
                return "兼职员工";
            case "合同工":
            case "外包":
                return "合同工";
            case "主管":
            case "经理":
            case "总监":
                return "主管";
            default:
                return "员工";
        }
    }
    
    /**
     * 映射CSV中的员工状态
     */
    private String mapStatusFromCsv(String csvStatus) {
        if (!StringUtils.hasText(csvStatus)) {
            return "在职";
        }
        
        switch (csvStatus.trim()) {
            case "在职":
            case "正常":
            case "活跃":
                return "在职";
            case "离职":
            case "已离职":
                return "离职";
            case "调动":
            case "转岗":
                return "调动";
            case "辞职":
            case "主动离职":
                return "辞职";
            case "休假":
            case "请假":
                return "休假";
            default:
                return "在职";
        }
    }
    
    /**
     * 获取部门用户统计
     */
    public List<Object[]> getUserStatsByDepartment() {
        return userRepository.countUsersByDepartment();
    }
    
    /**
     * 获取在线用户数量
     */
    public long getOnlineUserCount() {
        return userRepository.countOnlineUsers();
    }
    
    /**
     * 验证用户数据
     */
    private void validateUser(UserDTO userDTO, Long excludeId) {
        // 验证必填字段
        if (!StringUtils.hasText(userDTO.getEmployeeId())) {
            throw new RuntimeException("工号不能为空");
        }
        if (!StringUtils.hasText(userDTO.getUserName())) {
            throw new RuntimeException("姓名不能为空");
        }
        if (!StringUtils.hasText(userDTO.getEmail())) {
            throw new RuntimeException("邮箱不能为空");
        }
        if (!StringUtils.hasText(userDTO.getDepartment())) {
            throw new RuntimeException("部门不能为空");
        }
        
        // 验证工号唯一性
        long employeeIdCount = userRepository.countByEmployeeIdAndIdNot(userDTO.getEmployeeId(), excludeId);
        if (employeeIdCount > 0) {
            throw new RuntimeException("工号已存在");
        }
        
        // 验证邮箱唯一性
        long emailCount = userRepository.countByEmailAndIdNot(userDTO.getEmail(), excludeId);
        if (emailCount > 0) {
            throw new RuntimeException("邮箱已存在");
        }
        
        // 验证邮箱格式
        if (!isValidEmail(userDTO.getEmail())) {
            throw new RuntimeException("邮箱格式不正确");
        }
    }
    
    /**
     * 验证邮箱格式
     */
    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
    
    /**
     * 生成JWT Token（简化版本）
     */
    private String generateToken(User user) {
        // 这里应该使用JWT库生成真正的token
        // 为了简化，这里返回一个简单的token格式
        return "Bearer_" + user.getId() + "_" + System.currentTimeMillis();
    }
    
    /**
     * 转换Entity到DTO
     */
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        BeanUtils.copyProperties(user, dto);
        return dto;
    }
    
    /**
     * 转换DTO到Entity
     */
    private User convertToEntity(UserDTO dto) {
        User user = new User();
        BeanUtils.copyProperties(dto, user);
        return user;
    }
    
    /**
     * 根据邮箱获取用户
     */
    public Optional<UserDTO> getUserByEmail(String email) {
        return userRepository.findByEmail(email).map(this::convertToDTO);
    }
    
    /**
     * 获取用户总数
     */
    public long getTotalUserCount() {
        return userRepository.count();
    }
} 