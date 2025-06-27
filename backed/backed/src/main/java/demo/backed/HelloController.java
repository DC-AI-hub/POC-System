package demo.backed;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    
    @GetMapping("/")
    public String hello() {
        return "Hello, Spring Boot with JDK 1.8!";
    }
    
    @GetMapping("/api/test")
    public String test() {
        return "API测试成功！您的Spring Boot后端已经正常运行。";
    }
} 