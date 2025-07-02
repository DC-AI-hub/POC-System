# Testing and Security Guide

## Table of Contents
1. [Testing Strategies](#testing-strategies)
2. [Security Best Practices](#security-best-practices)
3. [Integration Examples](#integration-examples)
4. [Performance Testing](#performance-testing)
5. [API Testing](#api-testing)
6. [Security Testing](#security-testing)

---

## Testing Strategies

### Backend Testing (Spring Boot)

#### 1. Unit Tests

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private UserService userService;
    
    @Test
    void shouldCreateUser() {
        // Given
        CreateUserRequest request = CreateUserRequest.builder()
            .name("John Doe")
            .email("john@example.com")
            .department("Engineering")
            .build();
        
        User expectedUser = User.builder()
            .id(1L)
            .name("John Doe")
            .email("john@example.com")
            .build();
        
        when(userRepository.save(any(User.class))).thenReturn(expectedUser);
        
        // When
        User result = userService.createUser(request);
        
        // Then
        assertThat(result.getName()).isEqualTo("John Doe");
        assertThat(result.getEmail()).isEqualTo("john@example.com");
        verify(userRepository).save(any(User.class));
    }
    
    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        // Given
        Long userId = 999L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());
        
        // When & Then
        assertThatThrownBy(() -> userService.getUserById(userId))
            .isInstanceOf(UserNotFoundException.class)
            .hasMessage("User not found with id: 999");
    }
}
```

#### 2. Integration Tests

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
class UserControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    void shouldCreateUserSuccessfully() {
        // Given
        CreateUserRequest request = CreateUserRequest.builder()
            .name("Jane Doe")
            .email("jane@example.com")
            .department("Marketing")
            .build();
        
        // When
        ResponseEntity<UserResponse> response = restTemplate.postForEntity(
            "/api/users", request, UserResponse.class);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getName()).isEqualTo("Jane Doe");
        
        // Verify in database
        Optional<User> savedUser = userRepository.findByEmail("jane@example.com");
        assertThat(savedUser).isPresent();
        assertThat(savedUser.get().getName()).isEqualTo("Jane Doe");
    }
    
    @Test
    void shouldReturn404WhenUserNotFound() {
        // When
        ResponseEntity<String> response = restTemplate.getForEntity(
            "/api/users/999", String.class);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
```

#### 3. Repository Tests

```java
@DataJpaTest
class UserRepositoryTest {
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    void shouldFindUsersByDepartment() {
        // Given
        User user1 = User.builder()
            .name("John Doe")
            .email("john@example.com")
            .department("Engineering")
            .build();
        
        User user2 = User.builder()
            .name("Jane Smith")
            .email("jane@example.com")
            .department("Engineering")
            .build();
        
        entityManager.persistAndFlush(user1);
        entityManager.persistAndFlush(user2);
        
        // When
        List<User> engineeringUsers = userRepository.findByDepartment("Engineering");
        
        // Then
        assertThat(engineeringUsers).hasSize(2);
        assertThat(engineeringUsers).extracting(User::getName)
            .containsExactlyInAnyOrder("John Doe", "Jane Smith");
    }
}
```

### Frontend Testing (React/Next.js)

#### 1. Component Tests

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PersonnelForm from '@/components/personnel-form';

describe('PersonnelForm', () => {
  const mockOnSubmit = vi.fn();
  
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });
  
  test('should render form fields correctly', () => {
    render(<PersonnelForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Department')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });
  
  test('should validate email format', async () => {
    render(<PersonnelForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address'))
        .toBeInTheDocument();
    });
  });
  
  test('should submit form with valid data', async () => {
    render(<PersonnelForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Department'), {
      target: { value: 'Engineering' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering'
      });
    });
  });
});
```

#### 2. Hook Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { usePersonnelManagement } from '@/hooks/use-personnel-management';

// Mock API
const mockApi = {
  getEmployees: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn()
};

vi.mock('@/lib/api', () => ({
  personnelApi: mockApi
}));

describe('usePersonnelManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('should load employees on mount', async () => {
    const mockEmployees = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
    ];
    
    mockApi.getEmployees.mockResolvedValue(mockEmployees);
    
    const { result } = renderHook(() => usePersonnelManagement());
    
    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.employees).toEqual(mockEmployees);
    expect(mockApi.getEmployees).toHaveBeenCalledTimes(1);
  });
  
  test('should create employee successfully', async () => {
    const newEmployee = {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      department: 'Sales'
    };
    
    const createdEmployee = { id: '3', ...newEmployee };
    mockApi.createEmployee.mockResolvedValue(createdEmployee);
    mockApi.getEmployees.mockResolvedValue([]);
    
    const { result } = renderHook(() => usePersonnelManagement());
    
    await act(async () => {
      await result.current.addEmployee(newEmployee);
    });
    
    expect(mockApi.createEmployee).toHaveBeenCalledWith(newEmployee);
    expect(result.current.error).toBeNull();
  });
});
```

#### 3. API Route Tests

```typescript
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/integrations';

describe('/api/integrations', () => {
  test('GET should return integrations list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { type: 'auth' }
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data).toBeInstanceOf(Array);
  });
  
  test('POST should create new integration', async () => {
    const integrationData = {
      name: 'Test LDAP',
      type: 'auth',
      provider: 'ldap',
      endpoint: 'ldap://test.com:389',
      authType: 'basic'
    };
    
    const { req, res } = createMocks({
      method: 'POST',
      body: integrationData
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(201);
    
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Test LDAP');
  });
  
  test('should return 400 for missing required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { name: 'Incomplete Integration' }
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(400);
    
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.errors).toContain('缺少字段: type, provider, endpoint, authType');
  });
});
```

---

## Security Best Practices

### 1. Authentication & Authorization

#### JWT Token Security

```java
@Component
public class JwtTokenProvider {
    
    @Value("${app.jwtSecret}")
    private String jwtSecret;
    
    @Value("${app.jwtExpirationInMs}")
    private int jwtExpirationInMs;
    
    public String generateToken(UserPrincipal userPrincipal) {
        Date expiryDate = new Date(System.currentTimeMillis() + jwtExpirationInMs);
        
        return Jwts.builder()
            .setSubject(Long.toString(userPrincipal.getId()))
            .setIssuedAt(new Date())
            .setExpiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
    
    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken);
            return true;
        } catch (SignatureException ex) {
            logger.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty");
        }
        return false;
    }
}
```

#### Role-Based Access Control

```java
@PreAuthorize("hasRole('ADMIN') or (hasRole('USER') and #userId == authentication.principal.id)")
@GetMapping("/users/{userId}")
public ResponseEntity<UserResponse> getUser(@PathVariable Long userId) {
    User user = userService.getUserById(userId);
    return ResponseEntity.ok(UserResponse.from(user));
}

@PreAuthorize("hasPermission(#applicationId, 'EXPENSE_APPLICATION', 'APPROVE')")
@PostMapping("/expense/applications/{applicationId}/approve")
public ResponseEntity<ApprovalResponse> approveApplication(
    @PathVariable Long applicationId,
    @RequestBody ApprovalRequest request) {
    
    ApprovalResponse response = expenseService.approveApplication(applicationId, request);
    return ResponseEntity.ok(response);
}
```

#### Input Validation

```java
@RestController
@Validated
public class UserController {
    
    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(
        @Valid @RequestBody CreateUserRequest request) {
        
        User user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(UserResponse.from(user));
    }
}

@Data
@Builder
public class CreateUserRequest {
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "Username can only contain letters, numbers, hyphens, and underscores")
    private String username;
    
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$", 
             message = "Password must contain at least one lowercase letter, one uppercase letter, and one digit")
    private String password;
}
```

### 2. Data Protection

#### Password Encryption

```java
@Service
public class PasswordService {
    
    private final PasswordEncoder passwordEncoder;
    
    public PasswordService() {
        this.passwordEncoder = new BCryptPasswordEncoder(12);
    }
    
    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
    
    public boolean matches(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
```

#### Data Encryption at Rest

```java
@Entity
@Table(name = "integration_configs")
public class IntegrationConfig {
    
    @Id
    private String id;
    
    @Column(name = "credentials")
    @Convert(converter = CredentialsConverter.class)
    private Map<String, String> credentials;
}

@Converter
public class CredentialsConverter implements AttributeConverter<Map<String, String>, String> {
    
    private final AESUtil aesUtil;
    
    @Override
    public String convertToDatabaseColumn(Map<String, String> credentials) {
        try {
            String json = objectMapper.writeValueAsString(credentials);
            return aesUtil.encrypt(json);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting credentials", e);
        }
    }
    
    @Override
    public Map<String, String> convertToEntityAttribute(String encryptedData) {
        try {
            String json = aesUtil.decrypt(encryptedData);
            return objectMapper.readValue(json, new TypeReference<Map<String, String>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Error decrypting credentials", e);
        }
    }
}
```

### 3. CORS and CSRF Protection

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("https://*.company.com"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringRequestMatchers("/api/auth/**"))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**", "/api/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/users").hasRole("USER")
                .requestMatchers(HttpMethod.POST, "/api/users").hasRole("ADMIN")
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### 4. API Rate Limiting

```java
@Component
public class RateLimitingFilter implements Filter {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final int maxRequestsPerMinute = 100;
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String clientIp = getClientIpAddress(httpRequest);
        String key = "rate_limit:" + clientIp;
        
        String count = redisTemplate.opsForValue().get(key);
        
        if (count == null) {
            redisTemplate.opsForValue().set(key, "1", Duration.ofMinutes(1));
        } else if (Integer.parseInt(count) >= maxRequestsPerMinute) {
            httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            httpResponse.getWriter().write("Rate limit exceeded");
            return;
        } else {
            redisTemplate.opsForValue().increment(key);
        }
        
        chain.doFilter(request, response);
    }
}
```

---

## Integration Examples

### 1. LDAP Integration

```java
@Service
public class LdapIntegrationService {
    
    @Autowired
    private LdapTemplate ldapTemplate;
    
    public List<LdapUser> syncUsers() {
        return ldapTemplate.search(
            query().where("objectclass").is("person"),
            new LdapUserAttributeMapper()
        );
    }
    
    public boolean authenticateUser(String username, String password) {
        return ldapTemplate.authenticate(
            query().where("uid").is(username),
            password
        );
    }
    
    private class LdapUserAttributeMapper implements AttributesMapper<LdapUser> {
        @Override
        public LdapUser mapFromAttributes(Attributes attrs) throws NamingException {
            return LdapUser.builder()
                .username(getString(attrs, "uid"))
                .email(getString(attrs, "mail"))
                .displayName(getString(attrs, "cn"))
                .department(getString(attrs, "ou"))
                .build();
        }
        
        private String getString(Attributes attrs, String name) throws NamingException {
            Attribute attr = attrs.get(name);
            return attr != null ? (String) attr.get() : null;
        }
    }
}
```

### 2. SAP Finance Integration

```typescript
export class SapFinanceIntegration {
  private config: IntegrationConfig;
  private httpClient: AxiosInstance;
  
  constructor(config: IntegrationConfig) {
    this.config = config;
    this.httpClient = axios.create({
      baseURL: config.endpoint,
      auth: {
        username: config.credentials.username,
        password: config.credentials.password
      },
      timeout: 30000
    });
  }
  
  async syncAccounts(): Promise<SyncResult> {
    try {
      const response = await this.httpClient.get('/sap/opu/odata/sap/ZFI_ACCOUNTS');
      const accounts = response.data.d.results;
      
      const mappedAccounts = accounts.map(this.mapAccount.bind(this));
      
      return {
        success: true,
        recordsProcessed: accounts.length,
        recordsSucceeded: mappedAccounts.length,
        data: mappedAccounts
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        recordsProcessed: 0,
        recordsSucceeded: 0
      };
    }
  }
  
  private mapAccount(sapAccount: any): FinanceAccount {
    const mapping = this.config.mapping.find(m => m.sourceField === 'SAKNR');
    
    return {
      accountCode: sapAccount.SAKNR,
      accountName: sapAccount.TXT50,
      accountType: this.mapAccountType(sapAccount.KTOKS),
      costCenter: sapAccount.KOSTL,
      currency: sapAccount.WAERS,
      lastUpdated: new Date(sapAccount.AEDAT)
    };
  }
  
  private mapAccountType(ktoks: string): string {
    const typeMapping = {
      'SACH': 'asset',
      'VERB': 'liability',
      'EIGE': 'equity',
      'ERLO': 'revenue',
      'AUFW': 'expense'
    };
    
    return typeMapping[ktoks] || 'unknown';
  }
}
```

### 3. Email Notification Integration

```typescript
export class EmailNotificationService {
  private transporter: nodemailer.Transporter;
  
  constructor(config: IntegrationConfig) {
    this.transporter = nodemailer.createTransporter({
      host: config.endpoint,
      port: 587,
      secure: false,
      auth: {
        user: config.credentials.username,
        pass: config.credentials.password
      }
    });
  }
  
  async sendApprovalNotification(
    application: ExpenseApplication,
    approver: User
  ): Promise<void> {
    const template = `
      <h2>Expense Application Pending Approval</h2>
      <p>Dear ${approver.name},</p>
      <p>A new expense application requires your approval:</p>
      
      <div style="border: 1px solid #ccc; padding: 15px; margin: 10px 0;">
        <h3>${application.title}</h3>
        <p><strong>Applicant:</strong> ${application.applicant.name}</p>
        <p><strong>Amount:</strong> ${application.amount} ${application.currency}</p>
        <p><strong>Category:</strong> ${application.category.name}</p>
        <p><strong>Description:</strong> ${application.description}</p>
      </div>
      
      <p>
        <a href="${process.env.APP_URL}/approvals/${application.id}" 
           style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none;">
          Review Application
        </a>
      </p>
    `;
    
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM_ADDRESS,
      to: approver.email,
      subject: `Expense Approval Required: ${application.title}`,
      html: template
    });
  }
  
  async sendBulkNotifications(notifications: NotificationRequest[]): Promise<SyncResult> {
    let succeeded = 0;
    let failed = 0;
    const errors: string[] = [];
    
    for (const notification of notifications) {
      try {
        await this.transporter.sendMail({
          from: notification.from || process.env.SMTP_FROM_ADDRESS,
          to: notification.to,
          subject: notification.subject,
          html: notification.htmlContent,
          text: notification.textContent
        });
        succeeded++;
      } catch (error) {
        failed++;
        errors.push(`Failed to send to ${notification.to}: ${error.message}`);
      }
    }
    
    return {
      success: failed === 0,
      recordsProcessed: notifications.length,
      recordsSucceeded: succeeded,
      recordsFailed: failed,
      errors
    };
  }
}
```

---

## Performance Testing

### 1. Load Testing with Artillery

```yaml
# artillery-config.yml
config:
  target: 'http://localhost:8080'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 120
      arrivalRate: 100
      name: "Peak load"
  variables:
    authToken: "Bearer eyJhbGciOiJIUzUxMiJ9..."

scenarios:
  - name: "User Management Workflow"
    weight: 30
    flow:
      - get:
          url: "/api/users"
          headers:
            Authorization: "{{ authToken }}"
      - post:
          url: "/api/users"
          headers:
            Authorization: "{{ authToken }}"
            Content-Type: "application/json"
          json:
            name: "Test User {{ $randomString() }}"
            email: "test{{ $randomString() }}@example.com"
            department: "Engineering"
  
  - name: "Expense Application Workflow"
    weight: 50
    flow:
      - get:
          url: "/api/expense/categories"
          headers:
            Authorization: "{{ authToken }}"
      - post:
          url: "/api/expense/applications"
          headers:
            Authorization: "{{ authToken }}"
            Content-Type: "application/json"
          json:
            title: "Test Expense {{ $randomString() }}"
            amount: "{{ $randomInt(100, 1000) }}"
            currency: "USD"
            categoryId: "1"
            description: "Performance test expense"
```

### 2. Database Performance Testing

```sql
-- Create test data for performance testing
CREATE OR REPLACE FUNCTION generate_test_users(count INTEGER)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..count LOOP
        INSERT INTO users (
            username, email, name, department_id, 
            created_at, updated_at
        ) VALUES (
            'testuser' || i,
            'testuser' || i || '@example.com',
            'Test User ' || i,
            (i % 5) + 1,
            NOW() - (random() * INTERVAL '365 days'),
            NOW()
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate test data
SELECT generate_test_users(100000);

-- Performance test queries
EXPLAIN ANALYZE 
SELECT u.*, d.name as department_name 
FROM users u 
JOIN departments d ON u.department_id = d.id 
WHERE u.created_at >= NOW() - INTERVAL '30 days'
ORDER BY u.created_at DESC 
LIMIT 50;

-- Index performance test
CREATE INDEX CONCURRENTLY idx_users_created_at_dept 
ON users(created_at, department_id);

-- Test query performance after index
EXPLAIN ANALYZE 
SELECT COUNT(*) 
FROM users 
WHERE created_at >= NOW() - INTERVAL '30 days' 
  AND department_id = 1;
```

---

## API Testing

### 1. Postman Collection

```json
{
  "info": {
    "name": "POC System API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080"
    },
    {
      "key": "authToken",
      "value": ""
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{authToken}}"
      }
    ]
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Login successful', function () {",
                  "    pm.response.to.have.status(200);",
                  "    const response = pm.response.json();",
                  "    pm.expect(response.success).to.be.true;",
                  "    pm.expect(response.token).to.exist;",
                  "    pm.collectionVariables.set('authToken', response.token);",
                  "});"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"admin\",\n  \"password\": \"admin123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "User Management",
      "item": [
        {
          "name": "Get All Users",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Get users successful', function () {",
                  "    pm.response.to.have.status(200);",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.be.an('array');",
                  "});"
                ]
              }
            }
          ],
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/api/users",
              "host": ["{{baseUrl}}"],
              "path": ["api", "users"]
            }
          }
        }
      ]
    }
  ]
}
```

### 2. Automated API Testing with Jest

```typescript
import axios, { AxiosInstance } from 'axios';

describe('API Integration Tests', () => {
  let client: AxiosInstance;
  let authToken: string;
  
  beforeAll(async () => {
    client = axios.create({
      baseURL: 'http://localhost:8080',
      timeout: 10000
    });
    
    // Login and get auth token
    const loginResponse = await client.post('/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    authToken = loginResponse.data.token;
    client.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });
  
  describe('User Management', () => {
    let createdUserId: string;
    
    test('should create a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'testuser@example.com',
        department: 'Engineering'
      };
      
      const response = await client.post('/api/users', userData);
      
      expect(response.status).toBe(201);
      expect(response.data.name).toBe(userData.name);
      expect(response.data.email).toBe(userData.email);
      
      createdUserId = response.data.id;
    });
    
    test('should get user by ID', async () => {
      const response = await client.get(`/api/users/${createdUserId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(createdUserId);
      expect(response.data.name).toBe('Test User');
    });
    
    test('should update user', async () => {
      const updateData = {
        name: 'Updated Test User',
        department: 'Marketing'
      };
      
      const response = await client.put(`/api/users/${createdUserId}`, updateData);
      
      expect(response.status).toBe(200);
      expect(response.data.name).toBe(updateData.name);
      expect(response.data.department).toBe(updateData.department);
    });
    
    test('should delete user', async () => {
      const response = await client.delete(`/api/users/${createdUserId}`);
      
      expect(response.status).toBe(204);
      
      // Verify user is deleted
      await expect(client.get(`/api/users/${createdUserId}`))
        .rejects.toMatchObject({
          response: { status: 404 }
        });
    });
  });
  
  describe('Expense Management', () => {
    test('should create and approve expense application', async () => {
      // Create expense application
      const expenseData = {
        title: 'Test Expense',
        amount: 500.00,
        currency: 'USD',
        categoryId: '1',
        description: 'Test expense for API testing'
      };
      
      const createResponse = await client.post('/api/expense/applications', expenseData);
      expect(createResponse.status).toBe(201);
      
      const applicationId = createResponse.data.id;
      
      // Submit for approval
      const submitResponse = await client.post(
        `/api/expense/applications/${applicationId}/submit`
      );
      expect(submitResponse.status).toBe(200);
      
      // Approve application
      const approvalData = {
        approved: true,
        comment: 'Approved via API test'
      };
      
      const approveResponse = await client.post(
        `/api/expense/applications/${applicationId}/approve`,
        approvalData
      );
      expect(approveResponse.status).toBe(200);
      expect(approveResponse.data.status).toBe('approved');
    });
  });
});
```

---

## Security Testing

### 1. OWASP ZAP Integration

```python
#!/usr/bin/env python3
"""
Security testing with OWASP ZAP
"""

import time
from zapv2 import ZAPv2

# ZAP proxy configuration
zap = ZAPv2(proxies={'http': 'http://127.0.0.1:8080', 'https': 'http://127.0.0.1:8080'})

# Target application
target_url = 'http://localhost:3000'

def security_scan():
    """Run comprehensive security scan"""
    
    print('Starting security scan...')
    
    # Spider the application
    print('Spidering target...')
    scan_id = zap.spider.scan(target_url)
    
    while int(zap.spider.status(scan_id)) < 100:
        print(f'Spider progress: {zap.spider.status(scan_id)}%')
        time.sleep(2)
    
    print('Spider completed')
    
    # Active security scan
    print('Starting active scan...')
    scan_id = zap.ascan.scan(target_url)
    
    while int(zap.ascan.status(scan_id)) < 100:
        print(f'Active scan progress: {zap.ascan.status(scan_id)}%')
        time.sleep(5)
    
    print('Active scan completed')
    
    # Generate report
    print('Generating security report...')
    
    alerts = zap.core.alerts()
    high_risk = [alert for alert in alerts if alert['risk'] == 'High']
    medium_risk = [alert for alert in alerts if alert['risk'] == 'Medium']
    
    print(f'Security scan results:')
    print(f'High risk vulnerabilities: {len(high_risk)}')
    print(f'Medium risk vulnerabilities: {len(medium_risk)}')
    print(f'Total alerts: {len(alerts)}')
    
    # Save detailed report
    with open('security_report.html', 'w') as f:
        f.write(zap.core.htmlreport())
    
    return len(high_risk) == 0  # Return True if no high-risk vulnerabilities

if __name__ == '__main__':
    success = security_scan()
    exit(0 if success else 1)
```

### 2. SQL Injection Testing

```typescript
describe('SQL Injection Security Tests', () => {
  test('should prevent SQL injection in user search', async () => {
    const maliciousInputs = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      "'; INSERT INTO users (name) VALUES ('hacker'); --"
    ];
    
    for (const input of maliciousInputs) {
      const response = await client.get('/api/users', {
        params: { search: input }
      });
      
      // Should return empty results or error, not crash
      expect(response.status).toBeLessThan(500);
      
      // Verify database integrity
      const userCount = await client.get('/api/users/count');
      expect(userCount.data.count).toBeGreaterThan(0);
    }
  });
  
  test('should prevent SQL injection in expense filters', async () => {
    const maliciousFilter = "1'; DELETE FROM expense_applications; --";
    
    const response = await client.get('/api/expense/applications', {
      params: { userId: maliciousFilter }
    });
    
    expect(response.status).toBe(400); // Should reject invalid input
    
    // Verify data integrity
    const expenses = await client.get('/api/expense/applications');
    expect(expenses.data).toBeInstanceOf(Array);
  });
});
```

### 3. Authentication Security Tests

```typescript
describe('Authentication Security Tests', () => {
  test('should reject requests without valid JWT token', async () => {
    const clientWithoutAuth = axios.create({
      baseURL: 'http://localhost:8080'
    });
    
    await expect(clientWithoutAuth.get('/api/users'))
      .rejects.toMatchObject({
        response: { status: 401 }
      });
  });
  
  test('should reject expired JWT tokens', async () => {
    const expiredToken = 'eyJhbGciOiJIUzUxMiJ9.expired.token';
    
    const clientWithExpiredToken = axios.create({
      baseURL: 'http://localhost:8080',
      headers: {
        Authorization: `Bearer ${expiredToken}`
      }
    });
    
    await expect(clientWithExpiredToken.get('/api/users'))
      .rejects.toMatchObject({
        response: { status: 401 }
      });
  });
  
  test('should enforce role-based access control', async () => {
    // Login as regular user
    const userResponse = await axios.post('http://localhost:8080/api/auth/login', {
      username: 'user',
      password: 'user123'
    });
    
    const userClient = axios.create({
      baseURL: 'http://localhost:8080',
      headers: {
        Authorization: `Bearer ${userResponse.data.token}`
      }
    });
    
    // Should be able to read own profile
    const profileResponse = await userClient.get('/api/users/me');
    expect(profileResponse.status).toBe(200);
    
    // Should not be able to create users (admin only)
    await expect(userClient.post('/api/users', {
      name: 'Unauthorized User',
      email: 'unauthorized@example.com'
    })).rejects.toMatchObject({
      response: { status: 403 }
    });
  });
  
  test('should prevent brute force attacks', async () => {
    const clientWithoutAuth = axios.create({
      baseURL: 'http://localhost:8080'
    });
    
    // Attempt multiple failed logins
    const attempts = [];
    for (let i = 0; i < 10; i++) {
      attempts.push(
        clientWithoutAuth.post('/api/auth/login', {
          username: 'admin',
          password: 'wrongpassword'
        }).catch(err => err.response)
      );
    }
    
    const responses = await Promise.all(attempts);
    
    // Should start rate limiting after several failed attempts
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});
```

This comprehensive testing and security guide provides a solid foundation for ensuring your API is robust, secure, and performant. The examples cover unit testing, integration testing, security testing, and performance testing across both frontend and backend components.