# POC系统后端开发规范文档

## 📋 目录
- [项目架构](#项目架构)
- [开发规范](#开发规范)
- [编码规范](#编码规范)
- [数据库操作规范](#数据库操作规范)
- [工作流系统规范](#工作流系统规范)
- [认证与授权规范](#认证与授权规范)
- [日志系统规范](#日志系统规范)
- [前后端接口规范](#前后端接口规范)
- [常见问题与解决方案](#常见问题与解决方案)
- [最佳实践](#最佳实践)

---

## 🏗️ 项目架构

### 标准模块结构
```
poc_system/
├── backed/                      # 后端项目
│   ├── src/main/java/demo/backed/
│   │   ├── controller/          # REST控制器层
│   │   ├── service/             # 业务逻辑层
│   │   │   └── impl/           # 服务实现
│   │   ├── repository/          # 数据访问层
│   │   ├── entity/              # 数据实体层
│   │   ├── dto/                 # 数据传输对象
│   │   ├── config/              # 配置类
│   │   ├── security/            # 安全相关
│   │   ├── workflow/            # 工作流引擎
│   │   ├── utils/               # 工具类
│   │   └── exception/           # 异常处理
│   └── src/main/resources/
│       ├── application.properties
│       ├── schema.sql           # 数据库表结构
│       └── data.sql             # 初始化数据
└── fronted/                     # 前端项目（Next.js）
```

### 分层职责

| 层次 | 注解 | 职责 | 返回类型 |
|-----|------|------|---------|
| **Controller** | `@RestController` | 处理HTTP请求，参数验证 | `ResponseEntity<?>` |
| **Service** | `@Service` | 业务逻辑处理，事务管理 | 业务对象 |
| **Repository** | `@Repository` | 数据访问，CRUD操作 | 实体对象 |
| **Entity** | `@Entity` | 数据实体映射 | - |

### 技术栈
- **后端框架**: Spring Boot 2.7+
- **数据库**: PostgreSQL 13+
- **构建工具**: Maven 3.6+
- **认证方式**: JWT Token
- **工作流引擎**: Spring Workflow (内置)
- **文档工具**: Swagger/OpenAPI
- **部署方式**: Docker + Docker Compose

---

## 📝 开发规范

### 必用注解
```java
// Entity类
@Entity
@Table(name = "t_poc_workflow_node")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowNode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "node_name", nullable = false, length = 100)
    private String nodeName;
    
    @Column(name = "node_status")
    @Enumerated(EnumType.STRING)
    private NodeStatus status;
    
    @CreationTimestamp
    @Column(name = "created_time")
    private LocalDateTime createdTime;
    
    @UpdateTimestamp
    @Column(name = "updated_time")
    private LocalDateTime updatedTime;
    
    @Column(name = "created_by", length = 50)
    private String createdBy;
}

// Service层
@Service
@Transactional(readOnly = true)
@Slf4j
public class WorkflowServiceImpl implements WorkflowService {
    
    @Autowired
    private WorkflowNodeRepository nodeRepository;
    
    @Override
    @Transactional
    public WorkflowNode createNode(WorkflowNodeDTO nodeDTO) {
        log.info("创建工作流节点: {}", nodeDTO.getNodeName());
        // 业务逻辑
        return nodeRepository.save(node);
    }
}

// Controller层
@RestController
@RequestMapping("/api/workflow")
@Api(tags = "工作流管理")
@Slf4j
public class WorkflowController {
    
    @Autowired
    private WorkflowService workflowService;
    
    @PostMapping("/nodes")
    @ApiOperation("创建工作流节点")
    public ResponseEntity<WorkflowNode> createNode(@Valid @RequestBody WorkflowNodeDTO nodeDTO) {
        WorkflowNode node = workflowService.createNode(nodeDTO);
        return ResponseEntity.ok(node);
    }
}
```

### 命名规范
```java
// 实体类命名
public class ExpenseApplication {}     // 费用申请单
public class OrganizationStructure {}  // 组织架构
public class ProxySettings {}          // 代理设置

// 服务类命名
public interface UserService {}
public class UserServiceImpl implements UserService {}

// Controller命名
public class UserController {}
public class ExpenseController {}

// Repository命名
public interface UserRepository extends JpaRepository<User, Long> {}

// DTO命名
public class UserLoginDTO {}
public class ExpenseApplicationDTO {}
```

### 包结构规范
```java
demo.backed.controller    // 控制器
demo.backed.service      // 服务接口
demo.backed.service.impl // 服务实现
demo.backed.repository   // 数据访问
demo.backed.entity       // 实体类
demo.backed.dto          // 传输对象
demo.backed.config       // 配置类
demo.backed.security     // 安全相关
demo.backed.workflow     // 工作流
demo.backed.utils        // 工具类
demo.backed.exception    // 异常类
```

---

## 💻 编码规范

### 统一响应格式
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private Integer code;
    private String message;
    private T data;
    private Long timestamp;
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .code(200)
                .message("success")
                .data(data)
                .timestamp(System.currentTimeMillis())
                .build();
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .code(500)
                .message(message)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}
```

### 异常处理规范
```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e) {
        log.error("业务异常: {}", e.getMessage(), e);
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(ValidationException e) {
        log.error("参数验证异常: {}", e.getMessage(), e);
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("参数验证失败"));
    }
}
```

### DTO验证规范
```java
@Data
public class ExpenseApplicationDTO {
    @NotBlank(message = "费用科目不能为空")
    @Size(max = 100, message = "费用科目长度不能超过100")
    private String expenseCategory;
    
    @NotNull(message = "申请金额不能为空")
    @DecimalMin(value = "0.01", message = "申请金额必须大于0")
    private BigDecimal amount;
    
    @Size(max = 500, message = "费用明细长度不能超过500")
    private String expenseDetails;
    
    @Email(message = "邮箱格式不正确")
    private String applicantEmail;
}
```

### 日志规范
```java
@Slf4j
public class SampleService {
    
    public void processExpense(ExpenseApplicationDTO dto) {
        // 入参日志
        log.info("开始处理费用申请, 申请人: {}, 金额: {}", 
                dto.getApplicantName(), dto.getAmount());
        
        try {
            // 业务处理
            String result = expenseProcessor.process(dto);
            
            // 成功日志
            log.info("费用申请处理成功, 申请单号: {}", result);
            
        } catch (Exception e) {
            // 异常日志
            log.error("费用申请处理失败, 申请人: {}", dto.getApplicantName(), e);
            throw new BusinessException("费用申请处理失败", e);
        }
    }
}
```

---

## 🗄️ 数据库操作规范

### PostgreSQL建表规范
```sql
-- 工作流节点表
CREATE TABLE t_poc_workflow_node (
    id BIGSERIAL PRIMARY KEY,
    node_name VARCHAR(100) NOT NULL COMMENT '节点名称',
    node_type VARCHAR(50) NOT NULL COMMENT '节点类型',
    node_status VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '节点状态',
    workflow_id BIGINT NOT NULL COMMENT '工作流ID',
    parent_node_id BIGINT COMMENT '父节点ID',
    node_config JSONB COMMENT '节点配置',
    sort_order INTEGER DEFAULT 0 COMMENT '排序',
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(50) COMMENT '创建人',
    updated_by VARCHAR(50) COMMENT '更新人',
    FOREIGN KEY (workflow_id) REFERENCES t_poc_workflow(id),
    FOREIGN KEY (parent_node_id) REFERENCES t_poc_workflow_node(id)
);

-- 创建索引
CREATE INDEX idx_workflow_node_workflow_id ON t_poc_workflow_node(workflow_id);
CREATE INDEX idx_workflow_node_status ON t_poc_workflow_node(node_status);
CREATE INDEX idx_workflow_node_created_time ON t_poc_workflow_node(created_time);

-- 添加注释
COMMENT ON TABLE t_poc_workflow_node IS '工作流节点表';
```

### Repository层规范
```java
public interface WorkflowNodeRepository extends JpaRepository<WorkflowNode, Long> {
    
    // 查询方法命名规范
    List<WorkflowNode> findByWorkflowIdAndStatus(Long workflowId, NodeStatus status);
    
    List<WorkflowNode> findByWorkflowIdOrderBySortOrder(Long workflowId);
    
    @Query("SELECT n FROM WorkflowNode n WHERE n.workflowId = :workflowId AND n.status = 'ACTIVE'")
    List<WorkflowNode> findActiveNodesByWorkflowId(@Param("workflowId") Long workflowId);
    
    // 自定义更新方法
    @Modifying
    @Query("UPDATE WorkflowNode n SET n.status = :status WHERE n.id = :id")
    int updateNodeStatus(@Param("id") Long id, @Param("status") NodeStatus status);
}
```

### 事务管理规范
```java
@Service
@Transactional(readOnly = true)
public class ExpenseServiceImpl implements ExpenseService {
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public String submitExpenseApplication(ExpenseApplicationDTO dto) {
        // 1. 保存申请单
        ExpenseApplication application = saveApplication(dto);
        
        // 2. 启动工作流
        workflowService.startWorkflow(application.getId(), WorkflowType.EXPENSE_APPROVAL);
        
        // 3. 发送通知
        notificationService.sendApprovalNotification(application);
        
        return application.getApplicationNo();
    }
    
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordAuditLog(AuditLogDTO logDTO) {
        // 独立事务记录审计日志
        auditLogRepository.save(convertToEntity(logDTO));
    }
}
```

---

## 🔄 工作流系统规范

### 工作流节点状态管理
```java
public enum NodeStatus {
    PENDING("待处理"),
    IN_PROGRESS("处理中"),
    APPROVED("已通过"),
    REJECTED("已拒绝"),
    RETURNED("已打回"),
    COMPLETED("已完成");
    
    private final String description;
    
    NodeStatus(String description) {
        this.description = description;
    }
}

@Service
public class WorkflowNodeService {
    
    public void updateNodeStatus(Long nodeId, NodeStatus newStatus, String operator) {
        WorkflowNode node = nodeRepository.findById(nodeId)
                .orElseThrow(() -> new BusinessException("节点不存在"));
        
        // 状态变更验证
        validateStatusTransition(node.getStatus(), newStatus);
        
        // 更新状态
        node.setStatus(newStatus);
        node.setUpdatedBy(operator);
        node.setUpdatedTime(LocalDateTime.now());
        
        nodeRepository.save(node);
        
        // 记录状态变更日志
        recordStatusChangeLog(nodeId, node.getStatus(), newStatus, operator);
    }
}
```

### 工作流打回机制
```java
@Service
public class WorkflowReturnService {
    
    public void returnToNode(Long currentNodeId, Long targetNodeId, String reason, String operator) {
        // 1. 验证打回操作的合法性
        validateReturnOperation(currentNodeId, targetNodeId);
        
        // 2. 更新当前节点状态
        updateNodeStatus(currentNodeId, NodeStatus.RETURNED, operator);
        
        // 3. 重置目标节点及其后续节点状态
        resetSubsequentNodes(targetNodeId);
        
        // 4. 激活目标节点
        updateNodeStatus(targetNodeId, NodeStatus.PENDING, operator);
        
        // 5. 记录打回原因
        recordReturnReason(currentNodeId, targetNodeId, reason, operator);
        
        // 6. 发送通知
        sendReturnNotification(targetNodeId, reason);
    }
}
```

---

## 🔐 认证与授权规范

### JWT Token配置
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests()
                .antMatchers("/api/auth/**").permitAll()
                .antMatchers("/api/health").permitAll()
                .anyRequest().authenticated()
                .and()
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
    }
}
```

### 用户登录管理
```java
@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    public LoginResponseDTO login(LoginRequestDTO loginRequest) {
        // 1. 验证用户凭据
        User user = validateUser(loginRequest.getUsername(), loginRequest.getPassword());
        
        // 2. 生成Token
        String token = tokenProvider.generateToken(user);
        
        // 3. 记录登录日志
        recordLoginLog(user, loginRequest.getIpAddress());
        
        // 4. 更新在线状态
        updateUserOnlineStatus(user.getId(), true);
        
        return LoginResponseDTO.builder()
                .token(token)
                .userInfo(convertToUserInfo(user))
                .expiresIn(tokenProvider.getExpirationTime())
                .build();
    }
    
    public void logout(String token) {
        Long userId = tokenProvider.getUserIdFromToken(token);
        
        // 1. 将token加入黑名单
        tokenBlacklistService.addToBlacklist(token);
        
        // 2. 更新在线状态
        updateUserOnlineStatus(userId, false);
        
        // 3. 记录登出日志
        recordLogoutLog(userId);
    }
}
```

### 代理人（AB岗）管理
```java
@Entity
@Table(name = "t_poc_proxy_settings")
@Data
public class ProxySettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "principal_user_id")
    private Long principalUserId;      // 被代理人
    
    @Column(name = "proxy_user_id")
    private Long proxyUserId;          // 代理人
    
    @Column(name = "proxy_content")
    private String proxyContent;       // 代理内容
    
    @Column(name = "start_time")
    private LocalDateTime startTime;   // 开始时间
    
    @Column(name = "end_time")
    private LocalDateTime endTime;     // 结束时间
    
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private ProxyStatus status;        // 代理状态
}

@Service
public class ProxyService {
    
    public boolean hasProxyPermission(Long proxyUserId, Long principalUserId, String operationType) {
        LocalDateTime now = LocalDateTime.now();
        
        List<ProxySettings> activeProxies = proxyRepository
                .findByProxyUserIdAndPrincipalUserIdAndStatusAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                        proxyUserId, principalUserId, ProxyStatus.ACTIVE, now, now);
        
        return activeProxies.stream()
                .anyMatch(proxy -> proxy.getProxyContent().contains(operationType));
    }
}
```

---

## 📋 日志系统规范

### 审计日志记录
```java
@Aspect
@Component
@Slf4j
public class AuditLogAspect {
    
    @Autowired
    private AuditLogService auditLogService;
    
    @Around("@annotation(auditLog)")
    public Object recordAuditLog(ProceedingJoinPoint joinPoint, AuditLog auditLog) throws Throwable {
        String operation = auditLog.operation();
        String module = auditLog.module();
        
        // 获取当前用户
        String currentUser = getCurrentUser();
        
        // 执行前记录
        AuditLogEntry logEntry = AuditLogEntry.builder()
                .module(module)
                .operation(operation)
                .operator(currentUser)
                .operationTime(LocalDateTime.now())
                .ipAddress(getClientIpAddress())
                .build();
        
        try {
            Object result = joinPoint.proceed();
            
            // 执行成功
            logEntry.setStatus("SUCCESS");
            logEntry.setDetails("操作成功");
            
            return result;
        } catch (Exception e) {
            // 执行失败
            logEntry.setStatus("FAILED");
            logEntry.setDetails("操作失败: " + e.getMessage());
            
            throw e;
        } finally {
            // 保存审计日志
            auditLogService.saveAuditLog(logEntry);
        }
    }
}
```

### 系统日志配置
```properties
# application.properties
logging.level.root=INFO
logging.level.demo.backed=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=INFO

# 日志文件配置
logging.file.name=logs/poc-system.log
logging.file.max-size=10MB
logging.file.max-history=30

# 日志格式
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

---

## 🌐 前后端接口规范

### API接口标准格式
```java
@RestController
@RequestMapping("/api/users")
@Api(tags = "用户管理")
public class UserController {
    
    @GetMapping
    @ApiOperation("获取用户列表")
    public ResponseEntity<ApiResponse<PageResult<UserVO>>> getUsers(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {
        
        PageResult<UserVO> result = userService.getUsers(page, size, keyword);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    
    @PostMapping
    @ApiOperation("创建用户")
    public ResponseEntity<ApiResponse<UserVO>> createUser(@Valid @RequestBody CreateUserDTO userDTO) {
        UserVO user = userService.createUser(userDTO);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
    
    @PutMapping("/{id}")
    @ApiOperation("更新用户")
    public ResponseEntity<ApiResponse<UserVO>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserDTO userDTO) {
        
        UserVO user = userService.updateUser(id, userDTO);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
```

### 分页查询规范
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResult<T> {
    private List<T> data;
    private Long total;
    private Integer page;
    private Integer size;
    private Integer totalPages;
    
    public static <T> PageResult<T> of(Page<T> page) {
        return PageResult.<T>builder()
                .data(page.getContent())
                .total(page.getTotalElements())
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .totalPages(page.getTotalPages())
                .build();
    }
}
```

### 组织架构接口
```java
@RestController
@RequestMapping("/api/organization")
@Api(tags = "组织架构管理")
public class OrganizationController {
    
    @GetMapping("/tree")
    @ApiOperation("获取组织架构树")
    public ResponseEntity<ApiResponse<List<OrganizationTreeNode>>> getOrganizationTree() {
        List<OrganizationTreeNode> tree = organizationService.getOrganizationTree();
        return ResponseEntity.ok(ApiResponse.success(tree));
    }
    
    @GetMapping("/departments")
    @ApiOperation("获取部门列表")
    public ResponseEntity<ApiResponse<List<DepartmentVO>>> getDepartments() {
        List<DepartmentVO> departments = organizationService.getDepartments();
        return ResponseEntity.ok(ApiResponse.success(departments));
    }
}
```

---

## ⚠️ 常见问题与解决方案

### 数据库连接问题
**问题**: PostgreSQL连接失败  
**解决**:
```properties
# application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/poc_system
spring.datasource.username=poc_user
spring.datasource.password=poc_password
spring.datasource.driver-class-name=org.postgresql.Driver

# 连接池配置
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
```

### 工作流状态不一致问题
**问题**: 并发操作导致工作流状态不一致  
**解决**: 使用数据库锁机制
```java
@Repository
public interface WorkflowNodeRepository extends JpaRepository<WorkflowNode, Long> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT n FROM WorkflowNode n WHERE n.id = :id")
    Optional<WorkflowNode> findByIdWithLock(@Param("id") Long id);
}

@Service
@Transactional
public class WorkflowService {
    
    public void updateNodeStatus(Long nodeId, NodeStatus status) {
        WorkflowNode node = nodeRepository.findByIdWithLock(nodeId)
                .orElseThrow(() -> new BusinessException("节点不存在"));
        
        node.setStatus(status);
        nodeRepository.save(node);
    }
}
```

### Token过期处理
**问题**: Token过期导致接口调用失败  
**解决**: 实现Token刷新机制
```java
@Component
public class JwtTokenProvider {
    
    public String refreshToken(String oldToken) {
        if (isTokenExpired(oldToken)) {
            throw new TokenExpiredException("Token已过期");
        }
        
        Long userId = getUserIdFromToken(oldToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("用户不存在"));
        
        return generateToken(user);
    }
}
```

### 大量数据查询性能问题
**问题**: 大量数据查询导致响应缓慢  
**解决**: 实现分页查询和索引优化
```java
@Service
public class ExpenseService {
    
    public PageResult<ExpenseApplicationVO> getExpenseApplications(PageRequest pageRequest, String keyword) {
        Specification<ExpenseApplication> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (StringUtils.hasText(keyword)) {
                predicates.add(cb.or(
                        cb.like(root.get("applicantName"), "%" + keyword + "%"),
                        cb.like(root.get("expenseCategory"), "%" + keyword + "%")
                ));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        Page<ExpenseApplication> page = expenseRepository.findAll(spec, pageRequest);
        return PageResult.of(page.map(this::convertToVO));
    }
}
```

---

## 🎯 最佳实践

### 表单定制管理实现
```java
@Entity
@Table(name = "t_poc_form_template")
@Data
public class FormTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "template_name")
    private String templateName;
    
    @Column(name = "form_config", columnDefinition = "jsonb")
    private String formConfig;      // JSON格式的表单配置
    
    @Column(name = "table_name")
    private String tableName;       // 对应的数据库表名
    
    @Column(name = "company_id")
    private Long companyId;         // 关联公司
}

@Service
public class FormTemplateService {
    
    public Map<String, Object> generateFormData(Long templateId, Map<String, Object> formData) {
        FormTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new BusinessException("表单模板不存在"));
        
        // 解析表单配置
        FormConfig config = JsonUtils.parseObject(template.getFormConfig(), FormConfig.class);
        
        // 动态生成SQL
        String sql = buildInsertSql(template.getTableName(), config.getFields());
        
        // 执行数据插入
        return executeFormSubmission(sql, formData);
    }
}
```

### 报销单格式管理
```java
@Entity
@Table(name = "t_poc_expense_template")
@Data
public class ExpenseTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "company_id")
    private Long companyId;
    
    @Column(name = "template_name")
    private String templateName;
    
    @Column(name = "template_config", columnDefinition = "jsonb")
    private String templateConfig;  // 报销单格式配置
    
    @Column(name = "is_default")
    private Boolean isDefault;      // 是否默认模板
}

@Service
public class ExpenseTemplateService {
    
    public List<ExpenseTemplateVO> getTemplatesByCompany(Long companyId) {
        List<ExpenseTemplate> templates = templateRepository.findByCompanyIdOrderByIsDefaultDesc(companyId);
        return templates.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }
    
    public ExpenseTemplate getDefaultTemplate(Long companyId) {
        return templateRepository.findByCompanyIdAndIsDefaultTrue(companyId)
                .orElseThrow(() -> new BusinessException("未找到默认报销单模板"));
    }
}
```

### 在线用户管理
```java
@Component
public class OnlineUserManager {
    
    private final Map<Long, UserOnlineInfo> onlineUsers = new ConcurrentHashMap<>();
    
    public void userLogin(Long userId, String userName, String department, String position) {
        UserOnlineInfo userInfo = UserOnlineInfo.builder()
                .userId(userId)
                .userName(userName)
                .department(department)
                .position(position)
                .loginTime(LocalDateTime.now())
                .lastActiveTime(LocalDateTime.now())
                .build();
        
        onlineUsers.put(userId, userInfo);
        
        // 发布用户上线事件
        applicationEventPublisher.publishEvent(new UserOnlineEvent(userInfo));
    }
    
    public void userLogout(Long userId) {
        UserOnlineInfo userInfo = onlineUsers.remove(userId);
        if (userInfo != null) {
            // 发布用户下线事件
            applicationEventPublisher.publishEvent(new UserOfflineEvent(userInfo));
        }
    }
    
    public List<UserOnlineInfo> getOnlineUsers() {
        return new ArrayList<>(onlineUsers.values());
    }
    
    @Scheduled(fixedRate = 60000) // 每分钟检查一次
    public void cleanInactiveUsers() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(30);
        
        onlineUsers.entrySet().removeIf(entry -> {
            UserOnlineInfo userInfo = entry.getValue();
            return userInfo.getLastActiveTime().isBefore(threshold);
        });
    }
}
```

### 文件上传与附件管理
```java
@RestController
@RequestMapping("/api/files")
public class FileController {
    
    @PostMapping("/upload")
    @ApiOperation("文件上传")
    public ResponseEntity<ApiResponse<FileUploadResult>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "businessType", required = false) String businessType) {
        
        // 文件验证
        validateFile(file);
        
        // 保存文件
        FileUploadResult result = fileService.saveFile(file, businessType);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    
    @GetMapping("/download/{fileId}")
    @ApiOperation("文件下载")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileId) {
        FileInfo fileInfo = fileService.getFileInfo(fileId);
        
        Resource resource = fileService.loadFileAsResource(fileInfo.getFilePath());
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + fileInfo.getOriginalName() + "\"")
                .body(resource);
    }
}
```

---

## 📚 开发部署指南

### 本地开发环境配置
```bash
# 1. 启动PostgreSQL数据库
docker run -d \
  --name poc-postgres \
  -e POSTGRES_DB=poc_system \
  -e POSTGRES_USER=poc_user \
  -e POSTGRES_PASSWORD=poc_password \
  -p 5432:5432 \
  postgres:13

# 2. 编译运行后端项目
cd backed
mvn clean compile
mvn spring-boot:run

# 3. 启动前端项目
cd fronted
npm run dev
```

### 生产环境部署
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: poc_system
      POSTGRES_USER: poc_user
      POSTGRES_PASSWORD: poc_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backed
    environment:
      SPRING_PROFILES_ACTIVE: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: poc_system
      DB_USER: poc_user
      DB_PASSWORD: poc_password
    ports:
      - "8080:8080"
    depends_on:
      - postgres

  frontend:
    build: ./fronted
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 📝 核心原则

### 开发原则
1. **RESTful API设计**: 遵循REST规范，使用标准HTTP方法
2. **统一异常处理**: 全局异常处理，统一错误响应格式
3. **数据验证**: 入参验证和业务规则验证
4. **事务管理**: 合理使用事务，确保数据一致性
5. **安全性**: 认证授权、防SQL注入、XSS防护

### 质量保证
- **单元测试**: 核心业务逻辑编写单元测试，测试覆盖率>80%
- **集成测试**: API接口集成测试
- **代码审查**: 代码提交前必须经过代码审查
- **文档维护**: API文档与代码同步更新

### 性能优化
- **数据库索引**: 为常用查询字段创建索引
- **缓存策略**: 合理使用Redis缓存热点数据
- **分页查询**: 大数据量查询必须分页
- **异步处理**: 耗时操作使用异步处理

---

**文档版本**: v1.0  
**最后更新**: 2024年1月  
**维护人**: POC开发团队
**项目地址**: /d:/poc_system
</rewritten_file> 