package demo.backed.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.text.SimpleDateFormat;
import java.text.ParseException;

@RestController
@RequestMapping("/api/proxy")
@CrossOrigin(origins = "*")
public class ProxyController {
    
    // 获取代理设置列表
    @GetMapping("/settings")
    public Map<String, Object> getProxySettings(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String status) {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> proxySettings = new ArrayList<>();
        
        // 模拟代理设置数据
        Map<String, Object> proxy1 = new HashMap<>();
        proxy1.put("id", 1);
        proxy1.put("principalId", 1);
        proxy1.put("principalName", "张三");
        proxy1.put("principalDepartment", "技术部");
        proxy1.put("principalPosition", "开发工程师");
        proxy1.put("proxyId", 2);
        proxy1.put("proxyName", "李四");
        proxy1.put("proxyDepartment", "技术部");
        proxy1.put("proxyPosition", "高级工程师");
        proxy1.put("proxyContent", "费用申请审批");
        proxy1.put("startDate", "2025-06-28");
        proxy1.put("endDate", "2025-07-05");
        proxy1.put("reason", "年假");
        proxy1.put("status", "active");
        proxy1.put("createTime", new Date(System.currentTimeMillis() - 86400000));
        proxy1.put("createdBy", "张三");
        
        Map<String, Object> proxy2 = new HashMap<>();
        proxy2.put("id", 2);
        proxy2.put("principalId", 3);
        proxy2.put("principalName", "王五");
        proxy2.put("principalDepartment", "财务部");
        proxy2.put("principalPosition", "财务主管");
        proxy2.put("proxyId", 4);
        proxy2.put("proxyName", "赵六");
        proxy2.put("proxyDepartment", "财务部");
        proxy2.put("proxyPosition", "财务专员");
        proxy2.put("proxyContent", "报销审批,预算审核");
        proxy2.put("startDate", "2025-07-01");
        proxy2.put("endDate", "2025-07-10");
        proxy2.put("reason", "出差");
        proxy2.put("status", "pending");
        proxy2.put("createTime", new Date());
        proxy2.put("createdBy", "王五");
        
        proxySettings.add(proxy1);
        proxySettings.add(proxy2);
        
        // 根据条件筛选
        if (status != null && !status.isEmpty()) {
            proxySettings.removeIf(proxy -> !status.equals(proxy.get("status")));
        }
        
        if (userId != null) {
            proxySettings.removeIf(proxy -> 
                !userId.equals(proxy.get("principalId")) && !userId.equals(proxy.get("proxyId")));
        }
        
        response.put("success", true);
        response.put("data", proxySettings);
        response.put("totalCount", proxySettings.size());
        return response;
    }
    
    // 获取单个代理设置详情
    @GetMapping("/settings/{id}")
    public Map<String, Object> getProxySetting(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        Map<String, Object> proxySetting = new HashMap<>();
        proxySetting.put("id", id);
        proxySetting.put("principalId", 1);
        proxySetting.put("principalName", "张三");
        proxySetting.put("principalDepartment", "技术部");
        proxySetting.put("principalPosition", "开发工程师");
        proxySetting.put("principalEmail", "zhangsan@company.com");
        proxySetting.put("proxyId", 2);
        proxySetting.put("proxyName", "李四");
        proxySetting.put("proxyDepartment", "技术部");
        proxySetting.put("proxyPosition", "高级工程师");
        proxySetting.put("proxyEmail", "lisi@company.com");
        proxySetting.put("proxyContent", "费用申请审批");
        proxySetting.put("startDate", "2025-06-28");
        proxySetting.put("endDate", "2025-07-05");
        proxySetting.put("reason", "年假");
        proxySetting.put("status", "active");
        proxySetting.put("description", "年假期间的工作代理安排");
        proxySetting.put("createTime", new Date());
        proxySetting.put("createdBy", "张三");
        proxySetting.put("lastModifiedTime", new Date());
        proxySetting.put("lastModifiedBy", "张三");
        
        // 代理权限详情
        List<Map<String, Object>> permissions = new ArrayList<>();
        Map<String, Object> perm1 = new HashMap<>();
        perm1.put("module", "expense");
        perm1.put("moduleName", "费用管理");
        perm1.put("permissions", Arrays.asList("approve", "view", "comment"));
        perm1.put("permissionNames", Arrays.asList("审批", "查看", "评论"));
        
        permissions.add(perm1);
        proxySetting.put("permissions", permissions);
        
        response.put("success", true);
        response.put("data", proxySetting);
        return response;
    }
    
    // 创建代理设置
    @PostMapping("/settings")
    public Map<String, Object> createProxySetting(@RequestBody Map<String, Object> proxyData) {
        Map<String, Object> response = new HashMap<>();
        
        // 验证必要字段
        if (!proxyData.containsKey("principalId") || !proxyData.containsKey("proxyId") ||
            !proxyData.containsKey("startDate") || !proxyData.containsKey("endDate")) {
            response.put("success", false);
            response.put("message", "缺少必要的字段信息");
            return response;
        }
        
        // 验证日期格式和逻辑
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            Date startDate = sdf.parse((String) proxyData.get("startDate"));
            Date endDate = sdf.parse((String) proxyData.get("endDate"));
            
            if (startDate.after(endDate)) {
                response.put("success", false);
                response.put("message", "开始时间不能晚于结束时间");
                return response;
            }
            
            if (startDate.before(new Date())) {
                response.put("success", false);
                response.put("message", "开始时间不能早于当前时间");
                return response;
            }
        } catch (ParseException e) {
            response.put("success", false);
            response.put("message", "日期格式错误，请使用 yyyy-MM-dd 格式");
            return response;
        }
        
        Map<String, Object> newProxy = new HashMap<>();
        newProxy.put("id", System.currentTimeMillis());
        newProxy.put("status", "pending"); // 待生效
        newProxy.put("createTime", new Date());
        newProxy.put("createdBy", proxyData.get("createdBy"));
        newProxy.putAll(proxyData);
        
        response.put("success", true);
        response.put("data", newProxy);
        response.put("message", "代理设置创建成功");
        return response;
    }
    
    // 更新代理设置
    @PutMapping("/settings/{id}")
    public Map<String, Object> updateProxySetting(
            @PathVariable Long id,
            @RequestBody Map<String, Object> proxyData) {
        Map<String, Object> response = new HashMap<>();
        
        // 这里应该更新数据库中的代理设置
        proxyData.put("id", id);
        proxyData.put("lastModifiedTime", new Date());
        
        response.put("success", true);
        response.put("data", proxyData);
        response.put("message", "代理设置更新成功");
        return response;
    }
    
    // 激活代理设置
    @PostMapping("/settings/{id}/activate")
    public Map<String, Object> activateProxySetting(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        response.put("success", true);
        response.put("message", "代理设置已激活");
        response.put("id", id);
        response.put("status", "active");
        response.put("activateTime", new Date());
        
        return response;
    }
    
    // 停用代理设置
    @PostMapping("/settings/{id}/deactivate")
    public Map<String, Object> deactivateProxySetting(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> deactivateData) {
        Map<String, Object> response = new HashMap<>();
        
        String reason = deactivateData != null ? (String) deactivateData.get("reason") : "手动停用";
        
        response.put("success", true);
        response.put("message", "代理设置已停用");
        response.put("id", id);
        response.put("status", "inactive");
        response.put("deactivateTime", new Date());
        response.put("deactivateReason", reason);
        
        return response;
    }
    
    // 删除代理设置
    @DeleteMapping("/settings/{id}")
    public Map<String, Object> deleteProxySetting(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        response.put("success", true);
        response.put("message", "代理设置已删除");
        response.put("id", id);
        response.put("deleteTime", new Date());
        
        return response;
    }
    
    // 获取用户的代理权限
    @GetMapping("/permissions/{userId}")
    public Map<String, Object> getUserProxyPermissions(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        
        // 作为代理人的权限
        List<Map<String, Object>> asProxy = new ArrayList<>();
        Map<String, Object> proxyPerm1 = new HashMap<>();
        proxyPerm1.put("principalName", "张三");
        proxyPerm1.put("principalDepartment", "技术部");
        proxyPerm1.put("proxyContent", "费用申请审批");
        proxyPerm1.put("validUntil", "2025-07-05");
        proxyPerm1.put("status", "active");
        
        asProxy.add(proxyPerm1);
        
        // 被代理的权限
        List<Map<String, Object>> asPrincipal = new ArrayList<>();
        Map<String, Object> principalPerm1 = new HashMap<>();
        principalPerm1.put("proxyName", "李四");
        principalPerm1.put("proxyDepartment", "技术部");
        principalPerm1.put("proxyContent", "费用申请审批");
        principalPerm1.put("validUntil", "2025-07-05");
        principalPerm1.put("status", "active");
        
        asPrincipal.add(principalPerm1);
        
        Map<String, Object> permissions = new HashMap<>();
        permissions.put("asProxy", asProxy);
        permissions.put("asPrincipal", asPrincipal);
        
        response.put("success", true);
        response.put("data", permissions);
        return response;
    }
    
    // 导出代理设置文档
    @GetMapping("/settings/export")
    public Map<String, Object> exportProxySettings(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String format) {
        Map<String, Object> response = new HashMap<>();
        
        // 这里应该生成实际的导出文件
        Map<String, Object> exportInfo = new HashMap<>();
        exportInfo.put("fileName", "proxy_settings_" + System.currentTimeMillis() + ".xlsx");
        exportInfo.put("fileSize", "25KB");
        exportInfo.put("recordCount", 15);
        exportInfo.put("exportTime", new Date());
        exportInfo.put("downloadUrl", "/api/proxy/download/" + System.currentTimeMillis());
        
        response.put("success", true);
        response.put("data", exportInfo);
        response.put("message", "代理设置文档导出成功");
        
        return response;
    }
    
    // 获取可代理的权限列表
    @GetMapping("/available-permissions")
    public Map<String, Object> getAvailablePermissions() {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> permissions = new ArrayList<>();
        
        Map<String, Object> perm1 = new HashMap<>();
        perm1.put("module", "expense");
        perm1.put("moduleName", "费用管理");
        
        List<Map<String, String>> expensePerms = new ArrayList<>();
        Map<String, String> expensePerm1 = new HashMap<>();
        expensePerm1.put("code", "approve");
        expensePerm1.put("name", "审批");
        Map<String, String> expensePerm2 = new HashMap<>();
        expensePerm2.put("code", "view");
        expensePerm2.put("name", "查看");
        Map<String, String> expensePerm3 = new HashMap<>();
        expensePerm3.put("code", "comment");
        expensePerm3.put("name", "评论");
        expensePerms.add(expensePerm1);
        expensePerms.add(expensePerm2);
        expensePerms.add(expensePerm3);
        perm1.put("permissions", expensePerms);
        
        Map<String, Object> perm2 = new HashMap<>();
        perm2.put("module", "workflow");
        perm2.put("moduleName", "工作流管理");
        
        List<Map<String, String>> workflowPerms = new ArrayList<>();
        Map<String, String> workflowPerm1 = new HashMap<>();
        workflowPerm1.put("code", "approve");
        workflowPerm1.put("name", "审批");
        Map<String, String> workflowPerm2 = new HashMap<>();
        workflowPerm2.put("code", "reject");
        workflowPerm2.put("name", "打回");
        Map<String, String> workflowPerm3 = new HashMap<>();
        workflowPerm3.put("code", "view");
        workflowPerm3.put("name", "查看");
        workflowPerms.add(workflowPerm1);
        workflowPerms.add(workflowPerm2);
        workflowPerms.add(workflowPerm3);
        perm2.put("permissions", workflowPerms);
        
        permissions.add(perm1);
        permissions.add(perm2);
        
        response.put("success", true);
        response.put("data", permissions);
        return response;
    }
} 