package demo.backed.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // 允许前端跨域访问
public class UserController {
    
    @GetMapping
    public List<Map<String, Object>> getAllUsers() {
        // 模拟用户数据
        List<Map<String, Object>> users = new ArrayList<>();
        Map<String, Object> user1 = new HashMap<>();
        user1.put("id", 1);
        user1.put("name", "张三");
        user1.put("email", "zhangsan@example.com");
        
        Map<String, Object> user2 = new HashMap<>();
        user2.put("id", 2);
        user2.put("name", "李四");
        user2.put("email", "lisi@example.com");
        
        users.add(user1);
        users.add(user2);
        return users;
    }
    
    @GetMapping("/{id}")
    public Map<String, Object> getUserById(@PathVariable Long id) {
        Map<String, Object> user = new HashMap<>();
        user.put("id", id);
        user.put("name", "用户" + id);
        user.put("email", "user" + id + "@example.com");
        return user;
    }
    
    @PostMapping
    public Map<String, Object> createUser(@RequestBody Map<String, Object> user) {
        user.put("id", System.currentTimeMillis()); // 简单的ID生成
        user.put("status", "创建成功");
        return user;
    }
} 