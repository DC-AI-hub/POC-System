package demo.backed.example;

import demo.backed.controller.BaseControllerFixed;
import demo.backed.dto.ApiResponse;
import demo.backed.dto.BatchResult;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

/**
 * 示例Controller类
 * 展示如何继承BaseController并添加自定义API接口
 */
@RestController
@RequestMapping("/api/samples")
@Api(tags = "示例管理", description = "示例实体的CRUD操作和自定义业务接口")
public class SampleController extends BaseControllerFixed<SampleEntity, SampleService> {

    /**
     * 根据名称搜索
     */
    @GetMapping("/search")
    @ApiOperation(value = "根据名称搜索", notes = "根据名称模糊搜索示例实体")
    public ResponseEntity<ApiResponse<List<SampleEntity>>> searchByName(
            @ApiParam(value = "搜索名称", required = true) @RequestParam @NotNull String name) {
        
        try {
            List<SampleEntity> entities = service.searchByName(name);
            return ResponseEntity.ok(ApiResponse.success(entities));
        } catch (Exception e) {
            logger.error("根据名称搜索失败: name={}, 错误={}", name, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("搜索失败: " + e.getMessage()));
        }
    }

    /**
     * 根据分类查找
     */
    @GetMapping("/category/{category}")
    @ApiOperation(value = "根据分类查找", notes = "根据分类查找示例实体")
    public ResponseEntity<ApiResponse<List<SampleEntity>>> findByCategory(
            @ApiParam(value = "分类名称", required = true) @PathVariable @NotNull String category) {
        
        try {
            List<SampleEntity> entities = service.findByCategory(category);
            return ResponseEntity.ok(ApiResponse.success(entities));
        } catch (Exception e) {
            logger.error("根据分类查找失败: category={}, 错误={}", category, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("查找失败: " + e.getMessage()));
        }
    }

    /**
     * 根据分类分页查找
     */
    @GetMapping("/category/{category}/page")
    @ApiOperation(value = "根据分类分页查找", notes = "根据分类分页查找示例实体")
    public ResponseEntity<ApiResponse<Page<SampleEntity>>> findByCategoryPage(
            @ApiParam(value = "分类名称", required = true) @PathVariable @NotNull String category,
            @ApiParam(value = "页码", example = "0") @RequestParam(defaultValue = "0") int page,
            @ApiParam(value = "每页大小", example = "20") @RequestParam(defaultValue = "20") int size,
            @ApiParam(value = "排序字段", example = "id") @RequestParam(defaultValue = "id") String sort,
            @ApiParam(value = "排序方向", example = "asc") @RequestParam(defaultValue = "asc") String direction) {
        
        try {
            Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
            Sort sortObj = Sort.by(sortDirection, sort);
            Pageable pageable = PageRequest.of(page, size, sortObj);
            
            Page<SampleEntity> entities = service.findByCategory(category, pageable);
            return ResponseEntity.ok(ApiResponse.success(entities));
        } catch (Exception e) {
            logger.error("根据分类分页查找失败: category={}, 错误={}", category, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("查找失败: " + e.getMessage()));
        }
    }

    /**
     * 根据状态查找
     */
    @GetMapping("/status/{status}")
    @ApiOperation(value = "根据状态查找", notes = "根据状态查找示例实体")
    public ResponseEntity<ApiResponse<List<SampleEntity>>> findByStatus(
            @ApiParam(value = "状态", required = true) @PathVariable @NotNull String status) {
        
        try {
            List<SampleEntity> entities = service.findByStatus(status);
            return ResponseEntity.ok(ApiResponse.success(entities));
        } catch (Exception e) {
            logger.error("根据状态查找失败: status={}, 错误={}", status, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("查找失败: " + e.getMessage()));
        }
    }

    /**
     * 激活实体
     */
    @PostMapping("/{id}/activate")
    @ApiOperation(value = "激活实体", notes = "激活指定ID的示例实体")
    public ResponseEntity<ApiResponse<String>> activate(
            @ApiParam(value = "实体ID", required = true) @PathVariable @NotNull Long id) {
        
        try {
            boolean activated = service.activate(id);
            if (activated) {
                return ResponseEntity.ok(ApiResponse.success("激活成功"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("实体不存在: ID=" + id));
            }
        } catch (Exception e) {
            logger.error("激活实体失败: ID={}, 错误={}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("激活失败: " + e.getMessage()));
        }
    }

    /**
     * 停用实体
     */
    @PostMapping("/{id}/deactivate")
    @ApiOperation(value = "停用实体", notes = "停用指定ID的示例实体")
    public ResponseEntity<ApiResponse<String>> deactivate(
            @ApiParam(value = "实体ID", required = true) @PathVariable @NotNull Long id) {
        
        try {
            boolean deactivated = service.deactivate(id);
            if (deactivated) {
                return ResponseEntity.ok(ApiResponse.success("停用成功"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("实体不存在: ID=" + id));
            }
        } catch (Exception e) {
            logger.error("停用实体失败: ID={}, 错误={}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("停用失败: " + e.getMessage()));
        }
    }

    /**
     * 批量激活实体
     */
    @PostMapping("/batch-activate")
    @ApiOperation(value = "批量激活实体", notes = "批量激活多个示例实体")
    public ResponseEntity<ApiResponse<BatchResult>> batchActivate(
            @ApiParam(value = "实体ID列表", required = true) @RequestBody @NotEmpty List<Long> ids) {
        
        try {
            BatchResult result = service.batchActivate(ids);
            
            if (result.hasErrors()) {
                return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                        .body(ApiResponse.success("批量激活部分成功", result));
            } else {
                return ResponseEntity.ok(ApiResponse.success("批量激活成功", result));
            }
        } catch (Exception e) {
            logger.error("批量激活失败: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("批量激活失败: " + e.getMessage()));
        }
    }

    /**
     * 更新排序
     */
    @PutMapping("/{id}/sort-order")
    @ApiOperation(value = "更新排序", notes = "更新指定实体的排序值")
    public ResponseEntity<ApiResponse<String>> updateSortOrder(
            @ApiParam(value = "实体ID", required = true) @PathVariable @NotNull Long id,
            @ApiParam(value = "排序值", required = true) @RequestParam @NotNull Integer sortOrder) {
        
        try {
            boolean updated = service.updateSortOrder(id, sortOrder);
            if (updated) {
                return ResponseEntity.ok(ApiResponse.success("排序更新成功"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("实体不存在: ID=" + id));
            }
        } catch (Exception e) {
            logger.error("更新排序失败: ID={}, sortOrder={}, 错误={}", id, sortOrder, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("更新排序失败: " + e.getMessage()));
        }
    }

    /**
     * 获取统计信息
     */
    @GetMapping("/statistics")
    @ApiOperation(value = "获取统计信息", notes = "获取示例实体的详细统计信息")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics() {
        try {
            Map<String, Object> statistics = service.getStatistics();
            return ResponseEntity.ok(ApiResponse.success(statistics));
        } catch (Exception e) {
            logger.error("获取统计信息失败: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("获取统计信息失败: " + e.getMessage()));
        }
    }

    /**
     * 复合搜索
     */
    @GetMapping("/search/advanced")
    @ApiOperation(value = "复合搜索", notes = "根据名称和分类进行复合搜索")
    public ResponseEntity<ApiResponse<List<SampleEntity>>> advancedSearch(
            @ApiParam(value = "名称关键字") @RequestParam(required = false) String name,
            @ApiParam(value = "分类") @RequestParam(required = false) String category) {
        
        try {
            List<SampleEntity> entities;
            
            if (name != null && category != null) {
                entities = service.searchByNameAndCategory(name, category);
            } else if (name != null) {
                entities = service.searchByName(name);
            } else if (category != null) {
                entities = service.findByCategory(category);
            } else {
                entities = service.findAll();
            }
            
            return ResponseEntity.ok(ApiResponse.success(entities));
        } catch (Exception e) {
            logger.error("复合搜索失败: name={}, category={}, 错误={}", name, category, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("搜索失败: " + e.getMessage()));
        }
    }

    /**
     * 根据排序范围查找
     */
    @GetMapping("/sort-order/range")
    @ApiOperation(value = "根据排序范围查找", notes = "查找指定排序范围内的实体")
    public ResponseEntity<ApiResponse<List<SampleEntity>>> findBySortOrderRange(
            @ApiParam(value = "最小排序值") @RequestParam(required = false) Integer minOrder,
            @ApiParam(value = "最大排序值") @RequestParam(required = false) Integer maxOrder) {
        
        try {
            List<SampleEntity> entities = service.findBySortOrderRange(minOrder, maxOrder);
            return ResponseEntity.ok(ApiResponse.success(entities));
        } catch (Exception e) {
            logger.error("根据排序范围查找失败: minOrder={}, maxOrder={}, 错误={}", 
                        minOrder, maxOrder, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("查找失败: " + e.getMessage()));
        }
    }
} 