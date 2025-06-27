package demo.backed.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/api/expense")
@CrossOrigin(origins = "*")
public class ExpenseController {
    
    // 获取费用申请单列表
    @GetMapping("/applications")
    public Map<String, Object> getExpenseApplications(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long userId) {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> applications = new ArrayList<>();
        
        // 模拟费用申请单数据
        Map<String, Object> app1 = new HashMap<>();
        app1.put("id", 1);
        app1.put("applicationNo", "EXP202506270001");
        app1.put("applicantName", "张三");
        app1.put("department", "技术部");
        app1.put("expenseType", "差旅费");
        app1.put("totalAmount", 1500.00);
        app1.put("currency", "CNY");
        app1.put("status", "pending");
        app1.put("submitTime", new Date(System.currentTimeMillis() - 86400000)); // 1天前
        app1.put("description", "北京出差费用报销");
        
        List<Map<String, Object>> items1 = new ArrayList<>();
        Map<String, Object> item1 = new HashMap<>();
        item1.put("expenseCategory", "交通费");
        item1.put("amount", 800.00);
        item1.put("description", "高铁票");
        item1.put("date", "2025-06-25");
        
        Map<String, Object> item2 = new HashMap<>();
        item2.put("expenseCategory", "住宿费");
        item2.put("amount", 700.00);
        item2.put("description", "酒店住宿");
        item2.put("date", "2025-06-25");
        
        items1.add(item1);
        items1.add(item2);
        app1.put("expenseItems", items1);
        
        Map<String, Object> app2 = new HashMap<>();
        app2.put("id", 2);
        app2.put("applicationNo", "EXP202506270002");
        app2.put("applicantName", "李四");
        app2.put("department", "财务部");
        app2.put("expenseType", "办公用品");
        app2.put("totalAmount", 350.00);
        app2.put("currency", "CNY");
        app2.put("status", "approved");
        app2.put("submitTime", new Date(System.currentTimeMillis() - 172800000)); // 2天前
        app2.put("description", "办公用品采购");
        
        applications.add(app1);
        applications.add(app2);
        
        // 根据状态筛选
        if (status != null && !status.isEmpty()) {
            applications.removeIf(app -> !status.equals(app.get("status")));
        }
        
        response.put("success", true);
        response.put("data", applications);
        response.put("totalCount", applications.size());
        return response;
    }
    
    // 获取单个费用申请单详情
    @GetMapping("/applications/{id}")
    public Map<String, Object> getExpenseApplication(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        Map<String, Object> application = new HashMap<>();
        application.put("id", id);
        application.put("applicationNo", "EXP202506270001");
        application.put("applicantName", "张三");
        application.put("applicantId", 1);
        application.put("department", "技术部");
        application.put("position", "开发工程师");
        application.put("expenseType", "差旅费");
        application.put("totalAmount", 1500.00);
        application.put("currency", "CNY");
        application.put("status", "pending");
        application.put("submitTime", new Date());
        application.put("description", "北京出差费用报销");
        
        // 费用明细
        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> item1 = new HashMap<>();
        item1.put("id", 1);
        item1.put("expenseCategory", "交通费");
        item1.put("amount", 800.00);
        item1.put("description", "高铁票");
        item1.put("date", "2025-06-25");
        item1.put("receipt", "receipt_001.jpg");
        
        items.add(item1);
        application.put("expenseItems", items);
        
        // 附件信息
        List<Map<String, Object>> attachments = new ArrayList<>();
        Map<String, Object> attachment1 = new HashMap<>();
        attachment1.put("id", 1);
        attachment1.put("fileName", "发票.jpg");
        attachment1.put("fileSize", "2.5MB");
        attachment1.put("uploadTime", new Date());
        attachment1.put("uploadBy", "张三");
        
        attachments.add(attachment1);
        application.put("attachments", attachments);
        
        // 审批历史
        List<Map<String, Object>> approvalHistory = new ArrayList<>();
        Map<String, Object> history1 = new HashMap<>();
        history1.put("step", 1);
        history1.put("approverName", "李主管");
        history1.put("action", "pending");
        history1.put("comment", "");
        history1.put("processTime", null);
        
        approvalHistory.add(history1);
        application.put("approvalHistory", approvalHistory);
        
        response.put("success", true);
        response.put("data", application);
        return response;
    }
    
    // 创建费用申请单
    @PostMapping("/applications")
    public Map<String, Object> createExpenseApplication(@RequestBody Map<String, Object> applicationData) {
        Map<String, Object> response = new HashMap<>();
        
        // 生成申请单号
        String applicationNo = "EXP" + System.currentTimeMillis();
        
        Map<String, Object> newApplication = new HashMap<>();
        newApplication.put("id", System.currentTimeMillis());
        newApplication.put("applicationNo", applicationNo);
        newApplication.put("status", "draft");
        newApplication.put("submitTime", new Date());
        newApplication.putAll(applicationData);
        
        response.put("success", true);
        response.put("data", newApplication);
        response.put("message", "费用申请单创建成功");
        return response;
    }
    
    // 提交费用申请单
    @PostMapping("/applications/{id}/submit")
    public Map<String, Object> submitExpenseApplication(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        // 这里应该更新数据库中的申请单状态为 pending
        response.put("success", true);
        response.put("message", "费用申请单已提交，等待审批");
        response.put("applicationId", id);
        response.put("status", "pending");
        response.put("submitTime", new Date());
        
        return response;
    }
    
    // 审批费用申请单
    @PostMapping("/applications/{id}/approve")
    public Map<String, Object> approveExpenseApplication(
            @PathVariable Long id,
            @RequestBody Map<String, Object> approvalData) {
        Map<String, Object> response = new HashMap<>();
        
        String action = (String) approvalData.get("action"); // approve, reject
        String comment = (String) approvalData.get("comment");
        String approverId = approvalData.get("approverId").toString();
        
        response.put("success", true);
        response.put("message", "approve".equals(action) ? "申请单审批通过" : "申请单已拒绝");
        response.put("applicationId", id);
        response.put("action", action);
        response.put("approverId", approverId);
        response.put("comment", comment);
        response.put("processTime", new Date());
        
        return response;
    }
    
    // 上传附件
    @PostMapping("/applications/{id}/attachments")
    public Map<String, Object> uploadAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String description) {
        Map<String, Object> response = new HashMap<>();
        
        if (file.isEmpty()) {
            response.put("success", false);
            response.put("message", "请选择要上传的文件");
            return response;
        }
        
        // 这里应该保存文件到服务器或云存储
        Map<String, Object> attachment = new HashMap<>();
        attachment.put("id", System.currentTimeMillis());
        attachment.put("fileName", file.getOriginalFilename());
        attachment.put("fileSize", file.getSize() + " bytes");
        attachment.put("contentType", file.getContentType());
        attachment.put("description", description);
        attachment.put("uploadTime", new Date());
        attachment.put("applicationId", id);
        
        response.put("success", true);
        response.put("data", attachment);
        response.put("message", "附件上传成功");
        
        return response;
    }
    
    // 获取费用科目列表
    @GetMapping("/categories")
    public Map<String, Object> getExpenseCategories() {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> categories = new ArrayList<>();
        
        String[] categoryNames = {"交通费", "住宿费", "餐饮费", "办公用品", "通讯费", "培训费", "其他"};
        
        for (int i = 0; i < categoryNames.length; i++) {
            Map<String, Object> category = new HashMap<>();
            category.put("id", i + 1);
            category.put("name", categoryNames[i]);
            category.put("code", "CAT_" + String.format("%03d", i + 1));
            category.put("description", categoryNames[i] + "相关费用");
            category.put("isActive", true);
            categories.add(category);
        }
        
        response.put("success", true);
        response.put("data", categories);
        return response;
    }
    
    // 获取报销统计信息
    @GetMapping("/statistics")
    public Map<String, Object> getExpenseStatistics(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long departmentId) {
        Map<String, Object> response = new HashMap<>();
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalApplications", 25);
        statistics.put("pendingApplications", 8);
        statistics.put("approvedApplications", 15);
        statistics.put("rejectedApplications", 2);
        statistics.put("totalAmount", 45600.00);
        statistics.put("averageAmount", 1824.00);
        
        // 按类别统计
        List<Map<String, Object>> categoryStats = new ArrayList<>();
        Map<String, Object> cat1 = new HashMap<>();
        cat1.put("category", "差旅费");
        cat1.put("count", 12);
        cat1.put("amount", 28500.00);
        
        Map<String, Object> cat2 = new HashMap<>();
        cat2.put("category", "办公用品");
        cat2.put("count", 8);
        cat2.put("amount", 12300.00);
        
        categoryStats.add(cat1);
        categoryStats.add(cat2);
        statistics.put("categoryStatistics", categoryStats);
        
        response.put("success", true);
        response.put("data", statistics);
        return response;
    }
} 