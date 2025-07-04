package demo.backed.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/workflow")
@CrossOrigin(origins = "*")
public class WorkflowController {
    
    // 获取所有工作流
    @GetMapping
    public Map<String, Object> getAllWorkflows() {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> workflows = new ArrayList<>();
        
        // 模拟工作流数据
        Map<String, Object> workflow1 = new HashMap<>();
        workflow1.put("id", 1);
        workflow1.put("name", "费用申请流程");
        workflow1.put("status", "active");
        workflow1.put("createTime", new Date());
        
        Map<String, Object> workflow2 = new HashMap<>();
        workflow2.put("id", 2);
        workflow2.put("name", "请假申请流程");
        workflow2.put("status", "active");
        workflow2.put("createTime", new Date());
        
        workflows.add(workflow1);
        workflows.add(workflow2);
        
        response.put("success", true);
        response.put("data", workflows);
        response.put("message", "获取工作流列表成功");
        return response;
    }
    
    // 获取工作流节点
    @GetMapping("/{workflowId}/nodes")
    public Map<String, Object> getWorkflowNodes(@PathVariable Long workflowId) {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> nodes = new ArrayList<>();
        
        // 模拟节点数据
        Map<String, Object> node1 = new HashMap<>();
        node1.put("id", 1);
        node1.put("name", "申请提交");
        node1.put("status", "completed");
        node1.put("assignee", "张三");
        node1.put("order", 1);
        
        Map<String, Object> node2 = new HashMap<>();
        node2.put("id", 2);
        node2.put("name", "主管审批");
        node2.put("status", "pending");
        node2.put("assignee", "李主管");
        node2.put("order", 2);
        
        nodes.add(node1);
        nodes.add(node2);
        
        response.put("success", true);
        response.put("data", nodes);
        response.put("workflowId", workflowId);
        return response;
    }
    
    // 更新节点状态
    @PutMapping("/nodes/{nodeId}/status")
    public Map<String, Object> updateNodeStatus(
            @PathVariable Long nodeId, 
            @RequestBody Map<String, Object> statusUpdate) {
        Map<String, Object> response = new HashMap<>();
        
        String newStatus = (String) statusUpdate.get("status");
        String comment = (String) statusUpdate.get("comment");
        
        // 这里应该更新数据库中的节点状态
        response.put("success", true);
        response.put("message", "节点状态更新成功");
        response.put("nodeId", nodeId);
        response.put("newStatus", newStatus);
        response.put("comment", comment);  // 将评论信息也返回给前端
        response.put("updateTime", new Date());
        
        return response;
    }
    
    // 打回操作
    @PostMapping("/nodes/{nodeId}/reject")
    public Map<String, Object> rejectNode(
            @PathVariable Long nodeId,
            @RequestBody Map<String, Object> rejectInfo) {
        Map<String, Object> response = new HashMap<>();
        
        String reason = (String) rejectInfo.get("reason");
        Long targetNodeId = Long.valueOf(rejectInfo.get("targetNodeId").toString());
        
        response.put("success", true);
        response.put("message", "节点打回成功");
        response.put("nodeId", nodeId);
        response.put("targetNodeId", targetNodeId);
        response.put("reason", reason);
        response.put("rejectTime", new Date());
        
        return response;
    }
} 