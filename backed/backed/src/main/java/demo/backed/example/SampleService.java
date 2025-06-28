package demo.backed.example;

import demo.backed.dto.BatchResult;
import demo.backed.service.BaseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 示例Service类
 * 展示如何继承BaseService并添加业务逻辑
 */
@Service
@Transactional
public class SampleService extends BaseService<SampleEntity, SampleRepository> {

    /**
     * 根据名称搜索
     */
    @Transactional(readOnly = true)
    public List<SampleEntity> searchByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return findAll();
        }
        return repository.findByNameContaining(name.trim());
    }

    /**
     * 根据分类查找
     */
    @Transactional(readOnly = true)
    public List<SampleEntity> findByCategory(String category) {
        return repository.findByCategory(category);
    }

    /**
     * 根据分类分页查找
     */
    @Transactional(readOnly = true)
    public Page<SampleEntity> findByCategory(String category, Pageable pageable) {
        return repository.findByCategory(category, pageable);
    }

    /**
     * 根据状态查找
     */
    @Transactional(readOnly = true)
    public List<SampleEntity> findByStatus(String status) {
        return repository.findByStatus(status);
    }

    /**
     * 多条件搜索
     */
    @Transactional(readOnly = true)
    public List<SampleEntity> searchByNameAndCategory(String name, String category) {
        return repository.findByNameContainingAndCategory(name, category);
    }

    /**
     * 根据排序范围查找
     */
    @Transactional(readOnly = true)
    public List<SampleEntity> findBySortOrderRange(Integer minOrder, Integer maxOrder) {
        if (minOrder == null) minOrder = 0;
        if (maxOrder == null) maxOrder = Integer.MAX_VALUE;
        return repository.findBySortOrderBetween(minOrder, maxOrder);
    }

    /**
     * 激活实体
     */
    @Transactional
    public boolean activate(Long id) {
        try {
            Optional<SampleEntity> entity = repository.findActiveById(id);
            if (entity.isPresent()) {
                SampleEntity sample = entity.get();
                sample.setStatus("ACTIVE");
                repository.save(sample);
                logger.info("成功激活实体: ID={}", id);
                return true;
            }
            return false;
        } catch (Exception e) {
            logger.error("激活实体失败: ID={}, 错误={}", id, e.getMessage(), e);
            throw new RuntimeException("激活失败: " + e.getMessage());
        }
    }

    /**
     * 批量激活实体
     */
    @Transactional
    public BatchResult batchActivate(List<Long> ids) {
        BatchResult result = new BatchResult(ids.size());
        result.setOperationType("BATCH_ACTIVATE");
        result.setOperator(getCurrentUser());

        for (Long id : ids) {
            try {
                boolean activated = activate(id);
                if (activated) {
                    result.addSuccess(id);
                } else {
                    result.addFailure(id, "实体不存在");
                }
            } catch (Exception e) {
                result.addFailure(id, e.getMessage());
            }
        }

        return result;
    }

    /**
     * 停用实体
     */
    @Transactional
    public boolean deactivate(Long id) {
        try {
            Optional<SampleEntity> entity = repository.findActiveById(id);
            if (entity.isPresent()) {
                SampleEntity sample = entity.get();
                sample.setStatus("INACTIVE");
                repository.save(sample);
                logger.info("成功停用实体: ID={}", id);
                return true;
            }
            return false;
        } catch (Exception e) {
            logger.error("停用实体失败: ID={}, 错误={}", id, e.getMessage(), e);
            throw new RuntimeException("停用失败: " + e.getMessage());
        }
    }

    /**
     * 更新排序
     */
    @Transactional
    public boolean updateSortOrder(Long id, Integer sortOrder) {
        try {
            Optional<SampleEntity> entity = repository.findActiveById(id);
            if (entity.isPresent()) {
                SampleEntity sample = entity.get();
                sample.setSortOrder(sortOrder);
                repository.save(sample);
                logger.info("成功更新排序: ID={}, sortOrder={}", id, sortOrder);
                return true;
            }
            return false;
        } catch (Exception e) {
            logger.error("更新排序失败: ID={}, 错误={}", id, e.getMessage(), e);
            throw new RuntimeException("更新排序失败: " + e.getMessage());
        }
    }

    /**
     * 获取统计信息
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // 基础统计
        stats.put("totalCount", count());
        stats.put("activeCount", repository.countByStatus("ACTIVE"));
        stats.put("inactiveCount", repository.countByStatus("INACTIVE"));
        
        // 分类统计
        Map<String, Long> categoryStats = new HashMap<>();
        List<SampleEntity> allEntities = findAll();
        allEntities.forEach(entity -> {
            String category = entity.getCategory() != null ? entity.getCategory() : "未分类";
            categoryStats.put(category, categoryStats.getOrDefault(category, 0L) + 1);
        });
        stats.put("categoryStats", categoryStats);
        
        // 最近数据
        stats.put("recentlyCreated", findRecentlyCreated(5));
        stats.put("recentlyUpdated", findRecentlyUpdated(5));
        
        return stats;
    }

    /**
     * 验证业务规则
     */
    public boolean validateBusinessRules(SampleEntity entity) {
        // 示例业务规则验证
        if (entity.getName() == null || entity.getName().trim().isEmpty()) {
            return false;
        }
        
        // 检查名称是否重复（排除自身）
        List<SampleEntity> existingEntities = repository.findByNameContaining(entity.getName());
        for (SampleEntity existing : existingEntities) {
            if (!existing.getId().equals(entity.getId())) {
                return false; // 名称重复
            }
        }
        
        return true;
    }
} 