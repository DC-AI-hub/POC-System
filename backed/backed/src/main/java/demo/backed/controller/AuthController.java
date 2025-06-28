package demo.backed.controller;

import demo.backed.config.EmployeeAuthenticationService;
import demo.backed.config.JwtUtil;
import demo.backed.dto.ApiResponse;
import demo.backed.dto.LoginRequest;
import demo.backed.dto.LoginResponse;
import demo.backed.dto.UserDTO;
import demo.backed.entity.User;
import demo.backed.service.UserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Api(tags = "认证管理", description = "JWT认证相关API")
@Validated
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private EmployeeAuthenticationService employeeAuthenticationService;
    
    @Autowired
    private UserService userService;
    
    /**
     * 用户登录
     */
    @PostMapping("/login")
    @ApiOperation("员工邮箱登录")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // 验证用户是否可以登录
            if (!employeeAuthenticationService.canUserLogin(loginRequest.getEmail())) {
                return ApiResponse.unauthorized("用户不存在或状态异常，无法登录");
            }
            
            // 执行认证
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );
            
            // 认证成功，获取用户详细信息
            User user = employeeAuthenticationService.getFullUserInfo(loginRequest.getEmail());
            
            // 生成JWT Token
            String accessToken = jwtUtil.generateToken(
                    user.getEmail(),
                    user.getId(),
                    user.getUserName(),
                    user.getDepartment(),
                    user.getUserType()
            );
            
            // 生成Refresh Token
            String refreshToken = jwtUtil.generateRefreshToken(user.getEmail(), user.getId());
            
            // 更新用户登录信息
            user.setIsOnline(true);
            user.setLastLoginTime(LocalDateTime.now());
            userService.updateUserLoginInfo(user.getId(), true, LocalDateTime.now());
            
            // 构建响应
            UserDTO userDTO = convertToDTO(user);
            LoginResponse loginResponse = new LoginResponse(
                    accessToken,
                    refreshToken,
                    jwtUtil.getExpiration(),
                    userDTO
            );
            
            return ApiResponse.success("登录成功", loginResponse);
            
        } catch (BadCredentialsException e) {
            return ApiResponse.unauthorized("邮箱或密码错误");
        } catch (Exception e) {
            return ApiResponse.error("登录失败: " + e.getMessage());
        }
    }
    
    /**
     * 刷新Token
     */
    @PostMapping("/refresh")
    @ApiOperation("刷新访问令牌")
    public ApiResponse<Map<String, Object>> refreshToken(
            @ApiParam("刷新令牌") @RequestParam String refreshToken) {
        try {
            // 验证并刷新Token
            String newAccessToken = jwtUtil.refreshToken(refreshToken);
            
            // 从refreshToken中获取用户信息
            String email = jwtUtil.getUsernameFromToken(refreshToken);
            Long userId = jwtUtil.getUserIdFromToken(refreshToken);
            
            // 获取最新的用户信息并重新生成完整的Token
            User user = employeeAuthenticationService.getFullUserInfo(email);
            newAccessToken = jwtUtil.generateToken(
                    user.getEmail(),
                    user.getId(),
                    user.getUserName(),
                    user.getDepartment(),
                    user.getUserType()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", newAccessToken);
            response.put("expiresIn", jwtUtil.getExpiration());
            
            return ApiResponse.success("Token刷新成功", response);
            
        } catch (Exception e) {
            return ApiResponse.unauthorized("刷新Token失败: " + e.getMessage());
        }
    }
    
    /**
     * 用户登出
     */
    @PostMapping("/logout")
    @ApiOperation("用户登出")
    public ApiResponse<Void> logout(HttpServletRequest request) {
        try {
            // 从request中获取用户ID（由JWT过滤器设置）
            Long userId = (Long) request.getAttribute("userId");
            
            if (userId != null) {
                // 更新用户在线状态
                userService.updateUserLoginInfo(userId, false, null);
            }
            
            // 清除SecurityContext
            SecurityContextHolder.clearContext();
            
            return ApiResponse.success("登出成功", null);
            
        } catch (Exception e) {
            return ApiResponse.error("登出失败: " + e.getMessage());
        }
    }
    
    /**
     * 验证Token
     */
    @GetMapping("/verify")
    @ApiOperation("验证Token有效性")
    public ApiResponse<Map<String, Object>> verifyToken(HttpServletRequest request) {
        try {
            // 从请求头获取Token
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ApiResponse.unauthorized("缺少认证令牌");
            }
            
            String token = authHeader.substring(7);
            
            // 验证Token
            if (jwtUtil.validateToken(token)) {
                Map<String, Object> tokenInfo = jwtUtil.parseTokenInfo(token);
                return ApiResponse.success("Token有效", tokenInfo);
            } else {
                return ApiResponse.unauthorized("Token无效或已过期");
            }
            
        } catch (Exception e) {
            return ApiResponse.unauthorized("Token验证失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取当前登录用户信息
     */
    @GetMapping("/userinfo")
    @ApiOperation("获取当前登录员工信息")
    public ApiResponse<UserDTO> getCurrentUserInfo(HttpServletRequest request) {
        try {
            // 从request中获取用户信息（由JWT过滤器设置）
            Long userId = (Long) request.getAttribute("userId");
            String userEmail = (String) request.getAttribute("userEmail");
            
            if (userId == null) {
                return ApiResponse.unauthorized("未找到用户信息，请重新登录");
            }
            
            // 获取最新的用户信息
            Optional<UserDTO> userOptional = userService.getUserById(userId);
            if (!userOptional.isPresent()) {
                return ApiResponse.notFound("用户不存在");
            }
            
            UserDTO userDTO = userOptional.get();
            return ApiResponse.success("获取用户信息成功", userDTO);
            
        } catch (Exception e) {
            return ApiResponse.error("获取用户信息失败: " + e.getMessage());
        }
    }
    
    /**
     * 检查Token是否需要刷新
     */
    @GetMapping("/check-refresh")
    @ApiOperation("检查Token是否需要刷新")
    public ApiResponse<Map<String, Object>> checkTokenRefresh(HttpServletRequest request) {
        try {
            // 从请求头获取Token
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ApiResponse.unauthorized("缺少认证令牌");
            }
            
            String token = authHeader.substring(7);
            
            // 检查是否需要刷新
            boolean shouldRefresh = jwtUtil.shouldRefreshToken(token);
            
            Map<String, Object> response = new HashMap<>();
            response.put("shouldRefresh", shouldRefresh);
            response.put("expirationTime", jwtUtil.getExpirationDateFromToken(token));
            
            return ApiResponse.success("检查完成", response);
            
        } catch (Exception e) {
            return ApiResponse.error("检查失败: " + e.getMessage());
        }
    }
    
    /**
     * 转换User实体到DTO
     */
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        BeanUtils.copyProperties(user, dto);
        return dto;
    }
} 