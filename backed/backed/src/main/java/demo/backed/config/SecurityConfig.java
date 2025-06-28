package demo.backed.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Autowired
    private EmployeeAuthenticationService employeeAuthenticationService;
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    
    /**
     * 密码加密器
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    /**
     * 认证管理器
     */
    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
    
    /**
     * 配置认证管理器
     */
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(employeeAuthenticationService)
                .passwordEncoder(passwordEncoder());
    }
    
    /**
     * 配置HTTP安全规则
     */
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                // 禁用CSRF（使用JWT不需要CSRF保护）
                .csrf().disable()
                
                // 配置CORS
                .cors().configurationSource(corsConfigurationSource())
                
                .and()
                
                // 配置异常处理
                .exceptionHandling()
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                
                .and()
                
                // 配置会话管理为无状态
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                
                .and()
                
                // 配置URL权限
                .authorizeRequests()
                
                // 公开访问的接口
                .antMatchers("/api/auth/**").permitAll()
                .antMatchers("/api/test/**").permitAll()
                .antMatchers("/api/database/**").permitAll()  // 添加数据库测试接口公开访问
                
                // Swagger相关路径
                .antMatchers("/swagger-ui/**", "/swagger-ui.html").permitAll()
                .antMatchers("/swagger-resources/**").permitAll()
                .antMatchers("/v2/api-docs", "/v3/api-docs/**").permitAll()
                .antMatchers("/webjars/**").permitAll()
                
                // 健康检查
                .antMatchers("/actuator/health").permitAll()
                
                // 错误页面
                .antMatchers("/error").permitAll()
                
                // 静态资源
                .antMatchers(HttpMethod.GET, "/", "/favicon.ico", "/**/*.html", "/**/*.css", "/**/*.js").permitAll()
                
                // 用户管理接口 - 需要用户权限
                .antMatchers(HttpMethod.GET, "/api/users/**").hasRole("USER")
                .antMatchers(HttpMethod.POST, "/api/users").hasRole("MANAGER")  // 创建用户需要主管权限
                .antMatchers(HttpMethod.PUT, "/api/users/**").hasRole("MANAGER")  // 修改用户需要主管权限
                .antMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("MANAGER")  // 删除用户需要主管权限
                
                // 费用申请接口 - 需要用户权限
                .antMatchers("/api/expenses/**").hasRole("USER")
                
                // 工作流接口 - 需要用户权限
                .antMatchers("/api/workflow/**").hasRole("USER")
                
                // 审批管理接口 - 需要主管权限
                .antMatchers("/api/approvals/**").hasRole("MANAGER")
                
                // 系统管理接口 - 需要主管权限
                .antMatchers("/api/admin/**").hasRole("MANAGER")
                
                // 其他所有请求都需要认证
                .anyRequest().authenticated()
                
                .and()
                
                // 添加JWT过滤器
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    }
    
    /**
     * 配置CORS跨域
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 允许的源
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        
        // 允许的HTTP方法
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // 允许的请求头
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // 允许发送凭据
        configuration.setAllowCredentials(true);
        
        // 预检请求的缓存时间（秒）
        configuration.setMaxAge(3600L);
        
        // 暴露的响应头
        configuration.setExposedHeaders(Arrays.asList("Authorization", "X-Total-Count"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
} 