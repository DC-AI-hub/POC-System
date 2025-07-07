package demo.backed.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        try {
            String jwt = getJwtFromRequest(request);
            
            if (StringUtils.hasText(jwt)) {
                // 验证Token
                if (jwtUtil.validateToken(jwt)) {
                    // 从Token中提取用户信息
                    String email = jwtUtil.getUsernameFromToken(jwt);
                    Long userId = jwtUtil.getUserIdFromToken(jwt);
                    String userName = jwtUtil.getUserNameFromToken(jwt);
                    String userType = jwtUtil.getUserTypeFromToken(jwt);
                    String department = jwtUtil.getDepartmentFromToken(jwt);
                    
                    // 创建用户权限
                    List<SimpleGrantedAuthority> authorities = getAuthorities(userType);
                    
                    // 创建UserDetails对象
                    UserDetails userDetails = User.builder()
                            .username(email)
                            .password("") // 这里不需要密码，因为已经通过JWT验证
                            .authorities(authorities)
                            .build();
                    
                    // 创建认证对象
                    UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    
                    // 设置认证详情
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // 将用户信息添加到request中，方便Controller获取
                    request.setAttribute("userId", userId);
                    request.setAttribute("userName", userName);
                    request.setAttribute("userEmail", email);
                    request.setAttribute("userType", userType);
                    request.setAttribute("department", department);
                    
                    // 设置到SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    logger.debug("JWT认证成功，用户: " + email + ", 部门: " + department);
                } else {
                    logger.warn("JWT Token验证失败");
                }
            }
        } catch (Exception e) {
            logger.error("JWT认证过程中发生异常", e);
            // 清除SecurityContext
            SecurityContextHolder.clearContext();
        }
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * 从请求中提取JWT Token
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
    
    /**
     * 根据用户类型获取权限列表
     */
    private List<SimpleGrantedAuthority> getAuthorities(String userType) {
        if ("主管".equals(userType)) {
            return Arrays.asList(
                    new SimpleGrantedAuthority("ROLE_MANAGER"),
                    new SimpleGrantedAuthority("ROLE_USER")
            );
        } else if ("正式员工".equals(userType)) {
            return Arrays.asList(
                    new SimpleGrantedAuthority("ROLE_MANAGER"),
                    new SimpleGrantedAuthority("ROLE_USER")
            );
        } else {
            // 所有用户都应该有基础的用户权限
            return Arrays.asList(
                    new SimpleGrantedAuthority("ROLE_USER")
            );
        }
    }
    
    /**
     * 检查是否需要跳过JWT认证的路径
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        
        // 白名单路径，不需要JWT认证
        String[] whitelistPaths = {
                "/api/auth/login",
                "/api/auth/refresh",
                "/api/test/",
                "/api/database/",
                "/api/health",
                "/api/integrations/",
                "/swagger-ui/",
                "/swagger-resources/",
                "/v2/api-docs",
                "/webjars/",
                "/actuator/health",
                "/error"
        };
        
        for (String whitelistPath : whitelistPaths) {
            if (path.startsWith(whitelistPath)) {
                return true;
            }
        }
        
        return false;
    }
} 