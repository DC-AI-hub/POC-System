package demo.backed.controller;

import demo.backed.dto.ApiResponse;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@Api(tags = "健康检查", description = "应用健康检查相关API")
public class HealthController {
    
    @Autowired
    private DataSource dataSource;
    
    /**
     * 应用健康检查
     */
    @GetMapping("/health")
    @ApiOperation("应用健康检查")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        
        try {
            // 检查数据库连接
            boolean dbHealthy = false;
            try (Connection connection = dataSource.getConnection()) {
                dbHealthy = connection.isValid(3);
            } catch (Exception e) {
                dbHealthy = false;
            }
            
            // 检查应用状态
            boolean appHealthy = true; // 应用本身是健康的
            
            // 整体健康状态
            boolean overallHealthy = appHealthy && dbHealthy;
            
            health.put("status", overallHealthy ? "UP" : "DOWN");
            health.put("timestamp", System.currentTimeMillis());
            health.put("version", "1.0.0");
            
            // 组件健康状态（JDK8兼容写法）
            Map<String, Object> components = new HashMap<>();
            Map<String, Object> applicationStatus = new HashMap<>();
            applicationStatus.put("status", "UP");
            components.put("application", applicationStatus);
            Map<String, Object> dbStatus = new HashMap<>();
            dbStatus.put("status", dbHealthy ? "UP" : "DOWN");
            components.put("database", dbStatus);
            health.put("components", components);
            
            // 详细信息
            Map<String, Object> details = new HashMap<>();
            details.put("application", "POC-System Backend");
            details.put("database", "PostgreSQL");
            details.put("javaVersion", System.getProperty("java.version"));
            details.put("springVersion", "2.7.x");
            health.put("details", details);
            
            if (overallHealthy) {
                return ResponseEntity.ok(health);
            } else {
                return ResponseEntity.status(503).body(health);
            }
            
        } catch (Exception e) {
            health.put("status", "DOWN");
            health.put("error", e.getMessage());
            health.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(503).body(health);
        }
    }
} 