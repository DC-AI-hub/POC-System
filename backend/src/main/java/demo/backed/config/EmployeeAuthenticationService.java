package demo.backed.config;

import demo.backed.entity.User;
import demo.backed.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class EmployeeAuthenticationService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 根据邮箱查找用户
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (!userOptional.isPresent()) {
            throw new UsernameNotFoundException("员工不存在: " + email);
        }
        
        User user = userOptional.get();
        
        // 检查用户状态 - 只允许在职员工登录
        if (!"在职".equals(user.getStatus())) {
            throw new UsernameNotFoundException("员工已离职或状态异常，无法登录: " + email);
        }
        
        // 构建UserDetails对象
        return buildUserDetails(user);
    }
    
    /**
     * 根据用户ID加载用户详情
     */
    public UserDetails loadUserById(Long userId) throws UsernameNotFoundException {
        Optional<User> userOptional = userRepository.findById(userId);
        
        if (!userOptional.isPresent()) {
            throw new UsernameNotFoundException("员工不存在: " + userId);
        }
        
        User user = userOptional.get();
        
        // 检查用户状态
        if (!"在职".equals(user.getStatus())) {
            throw new UsernameNotFoundException("员工已离职或状态异常: " + userId);
        }
        
        return buildUserDetails(user);
    }
    
    /**
     * 构建UserDetails对象
     */
    private UserDetails buildUserDetails(User user) {
        // 根据用户类型设置权限
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        
        // 基础用户权限
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        
        // 根据用户类型添加额外权限
        if ("主管".equals(user.getUserType())) {
            authorities.add(new SimpleGrantedAuthority("ROLE_MANAGER"));
        }
        
        // 根据部门添加权限（如果需要）
        if ("财务部".equals(user.getDepartment())) {
            authorities.add(new SimpleGrantedAuthority("ROLE_FINANCE"));
        }
        
        if ("人事部".equals(user.getDepartment())) {
            authorities.add(new SimpleGrantedAuthority("ROLE_HR"));
        }
        
        // 创建UserDetails对象
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
    
    /**
     * 验证用户是否可以登录
     */
    public boolean canUserLogin(String email) {
        try {
            System.out.println("🔍 检查用户登录权限: " + email);
            
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (!userOptional.isPresent()) {
                System.out.println("❌ 用户不存在: " + email);
                return false;
            }
            
            User user = userOptional.get();
            System.out.println("📋 找到用户: " + user.getUserName() + 
                             " | 状态: '" + user.getStatus() + "'" +
                             " | 工号: " + user.getEmployeeId() +
                             " | 部门: " + user.getDepartment());
            
            boolean canLogin = "在职".equals(user.getStatus());
            System.out.println("✅ 登录权限检查结果: " + (canLogin ? "允许登录" : "拒绝登录"));
            
            // 调试：检查状态字符串的长度和字符
            if (!canLogin) {
                System.out.println("🔍 状态字符串调试:");
                System.out.println("   长度: " + (user.getStatus() != null ? user.getStatus().length() : "null"));
                System.out.println("   字符: " + (user.getStatus() != null ? java.util.Arrays.toString(user.getStatus().toCharArray()) : "null"));
                System.out.println("   期望: " + java.util.Arrays.toString("在职".toCharArray()));
            }
            
            return canLogin;
        } catch (Exception e) {
            System.err.println("❌ 检查用户登录权限时出现异常: " + email + " - " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * 获取用户的完整信息（用于JWT生成）
     */
    public User getFullUserInfo(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (!userOptional.isPresent()) {
            throw new UsernameNotFoundException("员工不存在: " + email);
        }
        
        User user = userOptional.get();
        if (!"在职".equals(user.getStatus())) {
            throw new UsernameNotFoundException("员工已离职或状态异常: " + email);
        }
        
        return user;
    }
    
    /**
     * 检查用户权限
     */
    public boolean hasPermission(String email, String permission) {
        try {
            UserDetails userDetails = loadUserByUsername(email);
            return userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals(permission));
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * 检查用户是否为主管
     */
    public boolean isManager(String email) {
        return hasPermission(email, "ROLE_MANAGER");
    }
    
    /**
     * 检查用户是否有财务权限
     */
    public boolean hasFinancePermission(String email) {
        return hasPermission(email, "ROLE_FINANCE");
    }
    
    /**
     * 检查用户是否有人事权限
     */
    public boolean hasHRPermission(String email) {
        return hasPermission(email, "ROLE_HR");
    }
} 