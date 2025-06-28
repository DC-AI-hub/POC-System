package demo.backed.controller;

import demo.backed.dto.ApiResponse;
import demo.backed.dto.BatchResult;
import demo.backed.entity.BaseEntity;
import demo.backed.service.BaseService;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 通用Controller基类
 * 提供标准的RESTful API接口和批量操作接口
 */
@Validated
public abstract class BaseControllerFixed<T extends BaseEntity, S extends BaseService<T, ?>> {

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    protected S service;

    /**
     * 获取所有记录（分页）
     */
    @GetMapping
    @ApiOperation(value = "获取分页列表", notes = "获取所有未删除记录的分页列表")
    public ResponseEntity<ApiResponse<Page<T>>> findAll(
            @ApiParam(value = "页码", example = "0") @RequestParam(defaultValue = "0") @Min(0) int page,
            @ApiParam(value = "每页大小", example = "20") @RequestParam(defaultValue = "20") @Min(1) int size,
            @ApiParam(value = "排序字段", example = "id") @RequestParam(defaultValue = "id") String sort,
            @ApiParam(value = "排序方向", example = "asc") @RequestParam(defaultValue = "asc") String direction) {
        
        try {
            // 创建排序对象
            Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
            Sort sortObj = Sort.by(sortDirection, sort);
            
            // 创建分页对象
            Pageable pageable = PageRequest.of(page, size, sortObj);
            
            // 查询数据
            Page<T> result = service.findAll(pageable);
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            logger.error("查询分页列表失败: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("查询失败: " + e.getMessage()));
        }
    }

    /**
     * 根据ID获取记录
     */
    @GetMapping("/{id}")
    @ApiOperation(value = "根据ID获取记录", notes = "根据ID获取单个记录详情")
    public ResponseEntity<ApiResponse<T>> findById(
            @ApiParam(value = "记录ID", required = true) @PathVariable @NotNull Long id) {
        
        try {
            Optional<T> entity = service.findById(id);
            if (entity.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(entity.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("记录不存在: ID=" + id));
            }
        } catch (Exception e) {
            logger.error("根据ID查询记录失败: ID={}, 错误={}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("查询失败: " + e.getMessage()));
        }
    }

    /**
     * 创建新记录
     */
    @PostMapping
    @ApiOperation(value = "创建新记录", notes = "创建新的记录")
    public ResponseEntity<ApiResponse<T>> create(
            @ApiParam(value = "实体数据", required = true) @Valid @RequestBody T entity) {
        
        try {
            // 确保ID为空（新增操作）
            entity.setId(null);
            
            T savedEntity = service.save(entity);
            
            logger.info("成功创建记录: {}, ID: {}", entity.getClass().getSimpleName(), savedEntity.getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("创建成功", savedEntity));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("请求参数错误: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("创建记录失败: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("创建失败: " + e.getMessage()));
        }
    }

    /**
     * 更新记录
     */
    @PutMapping("/{id}")
    @ApiOperation(value = "更新记录", notes = "根据ID更新记录")
    public ResponseEntity<ApiResponse<T>> update(
            @ApiParam(value = "记录ID", required = true) @PathVariable @NotNull Long id,
            @ApiParam(value = "实体数据", required = true) @Valid @RequestBody T entity) {
        
        try {
            // 检查记录是否存在
            if (!service.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("记录不存在: ID=" + id));
            }
            
            // 设置ID
            entity.setId(id);
            
            T savedEntity = service.save(entity);
            
            logger.info("成功更新记录: {}, ID: {}", entity.getClass().getSimpleName(), id);
            return ResponseEntity.ok(ApiResponse.success("更新成功", savedEntity));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("请求参数错误: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("更新记录失败: ID={}, 错误={}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("更新失败: " + e.getMessage()));
        }
    }

    /**
     * 删除记录（软删除）
     */
    @DeleteMapping("/{id}")
    @ApiOperation(value = "删除记录", notes = "软删除指定ID的记录")
    public ResponseEntity<ApiResponse<String>> delete(
            @ApiParam(value = "记录ID", required = true) @PathVariable @NotNull Long id) {
        
        try {
            boolean deleted = service.deleteById(id);
            if (deleted) {
                logger.info("成功删除记录: ID={}", id);
                return ResponseEntity.ok(ApiResponse.success("删除成功"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("记录不存在: ID=" + id));
            }
        } catch (Exception e) {
            logger.error("删除记录失败: ID={}, 错误={}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("删除失败: " + e.getMessage()));
        }
    }

    /**
     * 批量创建记录
     */
    @PostMapping("/batch-create")
    @ApiOperation(value = "批量创建记录", notes = "批量创建多个记录")
    public ResponseEntity<ApiResponse<BatchResult>> batchCreate(
            @ApiParam(value = "实体列表", required = true) @Valid @RequestBody @NotEmpty List<T> entities) {
        
        try {
            // 确保所有实体的ID为空
            entities.forEach(entity -> entity.setId(null));
            
            BatchResult result = service.saveAll(entities);
            
            if (result.hasErrors()) {
                logger.warn("批量创建部分失败: 总数={}, 成功={}, 失败={}", 
                          result.getTotalCount(), result.getSuccessCount(), result.getFailureCount());
                return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                        .body(ApiResponse.success("批量创建部分成功", result));
            } else {
                logger.info("批量创建成功: 总数={}", result.getSuccessCount());
                return ResponseEntity.ok(ApiResponse.success("批量创建成功", result));
            }
        } catch (Exception e) {
            logger.error("批量创建失败: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("批量创建失败: " + e.getMessage()));
        }
    }

    /**
     * 批量更新记录
     */
    @PutMapping("/batch-update")
    @ApiOperation(value = "批量更新记录", notes = "批量更新多个记录")
    public ResponseEntity<ApiResponse<BatchResult>> batchUpdate(
            @ApiParam(value = "实体列表", required = true) @Valid @RequestBody @NotEmpty List<T> entities) {
        
        try {
            BatchResult result = service.saveAll(entities);
            
            if (result.hasErrors()) {
                logger.warn("批量更新部分失败: 总数={}, 成功={}, 失败={}", 
                          result.getTotalCount(), result.getSuccessCount(), result.getFailureCount());
                return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                        .body(ApiResponse.success("批量更新部分成功", result));
            } else {
                logger.info("批量更新成功: 总数={}", result.getSuccessCount());
                return ResponseEntity.ok(ApiResponse.success("批量更新成功", result));
            }
        } catch (Exception e) {
            logger.error("批量更新失败: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("批量更新失败: " + e.getMessage()));
        }
    }

    /**
     * 批量删除记录
     */
    @DeleteMapping("/batch-delete")
    @ApiOperation(value = "批量删除记录", notes = "批量软删除多个记录")
    public ResponseEntity<ApiResponse<BatchResult>> batchDelete(
            @ApiParam(value = "ID列表", required = true) @RequestBody @NotEmpty List<Long> ids) {
        
        try {
            BatchResult result = service.deleteByIds(ids);
            
            if (result.hasErrors()) {
                logger.warn("批量删除部分失败: 总数={}, 成功={}, 失败={}", 
                          result.getTotalCount(), result.getSuccessCount(), result.getFailureCount());
                return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                        .body(ApiResponse.success("批量删除部分成功", result));
            } else {
                logger.info("批量删除成功: 总数={}", result.getSuccessCount());
                return ResponseEntity.ok(ApiResponse.success("批量删除成功", result));
            }
        } catch (Exception e) {
            logger.error("批量删除失败: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("批量删除失败: " + e.getMessage()));
        }
    }

    /**
     * 批量恢复记录
     */
    @PostMapping("/batch-restore")
    @ApiOperation(value = "批量恢复记录", notes = "批量恢复已删除的记录")
    public ResponseEntity<ApiResponse<BatchResult>> batchRestore(
            @ApiParam(value = "ID列表", required = true) @RequestBody @NotEmpty List<Long> ids) {
        
        try {
            BatchResult result = service.restoreByIds(ids);
            
            logger.info("批量恢复完成: 总数={}, 成功={}", result.getTotalCount(), result.getSuccessCount());
            return ResponseEntity.ok(ApiResponse.success("批量恢复成功", result));
        } catch (Exception e) {
            logger.error("批量恢复失败: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("批量恢复失败: " + e.getMessage()));
        }
    }

    /**
     * 获取统计信息
     */
    @GetMapping("/stats")
    @ApiOperation(value = "获取统计信息", notes = "获取记录的统计信息")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        try {
            long totalCount = service.count();
            List<T> recentlyCreated = service.findRecentlyCreated(5);
            List<T> recentlyUpdated = service.findRecentlyUpdated(5);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalCount", totalCount);
            stats.put("recentlyCreated", recentlyCreated);
            stats.put("recentlyUpdated", recentlyUpdated);
            stats.put("queryTime", LocalDateTime.now());
            
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            logger.error("获取统计信息失败: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("获取统计信息失败: " + e.getMessage()));
        }
    }

    /**
     * 检查记录是否存在
     */
    @GetMapping("/{id}/exists")
    @ApiOperation(value = "检查记录是否存在", notes = "检查指定ID的记录是否存在")
    public ResponseEntity<ApiResponse<Boolean>> exists(
            @ApiParam(value = "记录ID", required = true) @PathVariable @NotNull Long id) {
        
        try {
            boolean exists = service.existsById(id);
            return ResponseEntity.ok(ApiResponse.success(exists));
        } catch (Exception e) {
            logger.error("检查记录存在性失败: ID={}, 错误={}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("检查失败: " + e.getMessage()));
        }
    }
} 