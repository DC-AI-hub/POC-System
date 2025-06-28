package demo.backed.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * JPA审计配置
 * 启用自动审计功能，自动填充创建者、更新者等信息
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class AuditConfig {

    /**
     * 审计人员提供者
     * 自动获取当前登录用户作为审计人员
     */
    @Bean
    public AuditorAware<String> auditorProvider() {
        return new AuditorAwareImpl();
    }

    /**
     * 审计人员提供者实现类
     */
    public static class AuditorAwareImpl implements AuditorAware<String> {

        @Override
        public Optional<String> getCurrentAuditor() {
            try {
                // 从Spring Security上下文获取当前用户
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                
                if (authentication != null && authentication.isAuthenticated()) {
                    String username = authentication.getName();
                    
                    // 过滤掉匿名用户
                    if (!"anonymousUser".equals(username)) {
                        return Optional.of(username);
                    }
                }
                
                // 如果没有认证用户，返回系统用户
                return Optional.of("system");
                
            } catch (Exception e) {
                // 如果获取用户失败，返回系统用户
                return Optional.of("system");
            }
        }
    }
} 