package demo.backed.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/organization")
@CrossOrigin(origins = "*")
public class OrganizationController {
    
    // 获取组织架构树
    @GetMapping("/tree")
    public Map<String, Object> getOrganizationTree() {
        Map<String, Object> response = new HashMap<>();
        
        // 构建组织架构树形数据
        Map<String, Object> rootOrg = new HashMap<>();
        rootOrg.put("id", 1);
        rootOrg.put("name", "总公司");
        rootOrg.put("type", "company");
        rootOrg.put("level", 0);
        
        List<Map<String, Object>> departments = new ArrayList<>();
        
        // 技术部
        Map<String, Object> techDept = new HashMap<>();
        techDept.put("id", 2);
        techDept.put("name", "技术部");
        techDept.put("type", "department");
        techDept.put("level", 1);
        techDept.put("parentId", 1);
        
        List<Map<String, Object>> techPositions = new ArrayList<>();
        Map<String, Object> techManager = new HashMap<>();
        techManager.put("id", 3);
        techManager.put("name", "技术主管");
        techManager.put("type", "position");
        techManager.put("level", 2);
        techManager.put("parentId", 2);
        techManager.put("isManager", true);
        
        Map<String, Object> developer = new HashMap<>();
        developer.put("id", 4);
        developer.put("name", "开发工程师");
        developer.put("type", "position");
        developer.put("level", 2);
        developer.put("parentId", 2);
        developer.put("isManager", false);
        
        techPositions.add(techManager);
        techPositions.add(developer);
        techDept.put("children", techPositions);
        
        // 财务部
        Map<String, Object> financeDept = new HashMap<>();
        financeDept.put("id", 5);
        financeDept.put("name", "财务部");
        financeDept.put("type", "department");
        financeDept.put("level", 1);
        financeDept.put("parentId", 1);
        
        List<Map<String, Object>> financePositions = new ArrayList<>();
        Map<String, Object> financeManager = new HashMap<>();
        financeManager.put("id", 6);
        financeManager.put("name", "财务主管");
        financeManager.put("type", "position");
        financeManager.put("level", 2);
        financeManager.put("parentId", 5);
        financeManager.put("isManager", true);
        
        financePositions.add(financeManager);
        financeDept.put("children", financePositions);
        
        departments.add(techDept);
        departments.add(financeDept);
        rootOrg.put("children", departments);
        
        response.put("success", true);
        response.put("data", rootOrg);
        response.put("message", "获取组织架构成功");
        return response;
    }
    
    // 获取部门列表
    @GetMapping("/departments")
    public Map<String, Object> getDepartments() {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> departments = new ArrayList<>();
        
        Map<String, Object> dept1 = new HashMap<>();
        dept1.put("id", 2);
        dept1.put("name", "技术部");
        dept1.put("description", "负责系统开发和技术支持");
        dept1.put("managerName", "李技术");
        
        Map<String, Object> dept2 = new HashMap<>();
        dept2.put("id", 5);
        dept2.put("name", "财务部");
        dept2.put("description", "负责财务管理和报销审批");
        dept2.put("managerName", "王财务");
        
        departments.add(dept1);
        departments.add(dept2);
        
        response.put("success", true);
        response.put("data", departments);
        return response;
    }
    
    // 获取岗位列表
    @GetMapping("/positions")
    public Map<String, Object> getPositions(@RequestParam(required = false) Long departmentId) {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> positions = new ArrayList<>();
        
        if (departmentId == null || departmentId == 2) { // 技术部
            Map<String, Object> pos1 = new HashMap<>();
            pos1.put("id", 3);
            pos1.put("name", "技术主管");
            pos1.put("departmentId", 2);
            pos1.put("departmentName", "技术部");
            pos1.put("isManager", true);
            pos1.put("level", "主管级");
            
            Map<String, Object> pos2 = new HashMap<>();
            pos2.put("id", 4);
            pos2.put("name", "开发工程师");
            pos2.put("departmentId", 2);
            pos2.put("departmentName", "技术部");
            pos2.put("isManager", false);
            pos2.put("level", "员工级");
            
            positions.add(pos1);
            positions.add(pos2);
        }
        
        if (departmentId == null || departmentId == 5) { // 财务部
            Map<String, Object> pos3 = new HashMap<>();
            pos3.put("id", 6);
            pos3.put("name", "财务主管");
            pos3.put("departmentId", 5);
            pos3.put("departmentName", "财务部");
            pos3.put("isManager", true);
            pos3.put("level", "主管级");
            
            positions.add(pos3);
        }
        
        response.put("success", true);
        response.put("data", positions);
        return response;
    }
    
    // 获取在线用户
    @GetMapping("/online-users")
    public Map<String, Object> getOnlineUsers() {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> onlineUsers = new ArrayList<>();
        
        Map<String, Object> user1 = new HashMap<>();
        user1.put("id", 1);
        user1.put("name", "张三");
        user1.put("department", "技术部");
        user1.put("position", "开发工程师");
        user1.put("isManager", false);
        user1.put("loginTime", new Date(System.currentTimeMillis() - 3600000)); // 1小时前登录
        user1.put("status", "online");
        
        Map<String, Object> user2 = new HashMap<>();
        user2.put("id", 2);
        user2.put("name", "李技术");
        user2.put("department", "技术部");
        user2.put("position", "技术主管");
        user2.put("isManager", true);
        user2.put("loginTime", new Date(System.currentTimeMillis() - 1800000)); // 30分钟前登录
        user2.put("status", "online");
        
        onlineUsers.add(user1);
        onlineUsers.add(user2);
        
        response.put("success", true);
        response.put("data", onlineUsers);
        response.put("totalCount", onlineUsers.size());
        return response;
    }
} 