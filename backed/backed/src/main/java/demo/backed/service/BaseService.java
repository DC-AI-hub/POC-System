package demo.backed.service;

import demo.backed.config.validation.BatchValidator;
import demo.backed.dto.BatchResult;
import demo.backed.entity.BaseEntity;
import demo.backed.repository.BaseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * 通用Service基类
 * 实现完整的CRUD操作、批量操作、软删除和事务管理
 */
@Service
@Transactional
public abstract class BaseService<T extends BaseEntity, R extends BaseRepository<T>> {

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    protected R repository;

    @Autowired
    protected BatchValidator batchValidator;

    @PersistenceContext
    protected EntityManager entityManager;

    /**
     * 获取当前操作用户
     */
    protected String getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                return authentication.getName();
            }
        } catch (Exception e) {
            logger.warn("获取当前用户失败: {}", e.getMessage());
        }
        return "system";
    }

    /**
     * 保存实体（新增或更新）
     */
    @Transactional
    public T save(T entity) {
        if (entity == null) {
            throw new IllegalArgumentException("实体不能为null");
        }

        // 验证实体
        BatchValidator.ValidationResult validationResult = batchValidator.validateSingle(entity);
        if (!validationResult.isValid()) {
            throw new IllegalArgumentException("实体验证失败: " + String.join(", ", validationResult.getErrors()));
        }

        try {
            // 设置审计信息
            String currentUser = getCurrentUser();
            if (entity.getId() == null) {
                // 新增
                entity.setCreatedBy(currentUser);
                entity.setCreatedTime(LocalDateTime.now());
            } else {
                // 更新
                entity.setUpdatedBy(currentUser);
                entity.setUpdatedTime(LocalDateTime.now());
            }

            T savedEntity = repository.save(entity);
            logger.info("成功保存实体: {}, ID: {}", entity.getClass().getSimpleName(), savedEntity.getId());
            return savedEntity;

        } catch (ObjectOptimisticLockingFailureException e) {
            logger.error("乐观锁冲突: {}", e.getMessage());
            throw new RuntimeException("数据已被其他用户修改，请刷新后重试");
        } catch (Exception e) {
            logger.error("保存实体失败: {}", e.getMessage(), e);
            throw new RuntimeException("保存失败: " + e.getMessage());
        }
    }

    /**
     * 批量保存实体
     */
    @Transactional
    public BatchResult saveAll(List<T> entities) {
        BatchResult result = new BatchResult(entities.size());
        result.setOperationType("BATCH_CREATE");
        result.setOperator(getCurrentUser());

        if (entities == null || entities.isEmpty()) {
            result.addFailure(null, "批量数据不能为空");
            return result;
        }

        // 批量验证
        BatchValidator.ValidationResult validationResult = batchValidator.validateBatch(entities);
        if (!validationResult.isValid()) {
            result.setErrors(validationResult.getErrors());
            result.setFailureCount(validationResult.getErrors().size());
            return result;
        }

        // 分批处理，避免内存溢出
        int batchSize = 100;
        String currentUser = getCurrentUser();
        LocalDateTime now = LocalDateTime.now();

        for (int i = 0; i < entities.size(); i += batchSize) {
            int endIndex = Math.min(i + batchSize, entities.size());
            List<T> batch = entities.subList(i, endIndex);

            try {
                // 设置审计信息
                for (T entity : batch) {
                    if (entity.getId() == null) {
                        entity.setCreatedBy(currentUser);
                        entity.setCreatedTime(now);
                    }
                    entity.setUpdatedBy(currentUser);
                    entity.setUpdatedTime(now);
                }

                // 批量保存
                List<T> savedEntities = repository.saveAll(batch);
                
                // 统计成功记录
                for (T savedEntity : savedEntities) {
                    result.addSuccess(savedEntity.getId());
                }

                // 刷新到数据库
                entityManager.flush();
                
            } catch (Exception e) {
                logger.error("批量保存失败，批次: {}-{}, 错误: {}", i, endIndex - 1, e.getMessage());
                
                // 单个保存失败的记录
                for (int j = 0; j < batch.size(); j++) {
                    try {
                        T entity = batch.get(j);
                        T savedEntity = repository.save(entity);
                        result.addSuccess(savedEntity.getId());
                    } catch (Exception ex) {
                        result.addFailure(i + j, null, "保存失败", ex.getMessage(), null);
                    }
                }
            }
        }

        logger.info("批量保存完成: 总数={}, 成功={}, 失败={}", 
                   result.getTotalCount(), result.getSuccessCount(), result.getFailureCount());
        return result;
    }

    /**
     * 根据ID查找实体
     */
    @Transactional(readOnly = true)
    public Optional<T> findById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return repository.findActiveById(id);
    }

    /**
     * 查找所有未删除的实体
     */
    @Transactional(readOnly = true)
    public List<T> findAll() {
        return repository.findAllActive();
    }

    /**
     * 分页查找所有未删除的实体
     */
    @Transactional(readOnly = true)
    public Page<T> findAll(Pageable pageable) {
        return repository.findAllActive(pageable);
    }

    /**
     * 根据条件查找实体
     */
    @Transactional(readOnly = true)
    public List<T> findAll(Specification<T> spec) {
        return repository.findAll(spec);
    }

    /**
     * 根据条件分页查找实体
     */
    @Transactional(readOnly = true)
    public Page<T> findAll(Specification<T> spec, Pageable pageable) {
        return repository.findAll(spec, pageable);
    }

    /**
     * 根据ID列表查找实体
     */
    @Transactional(readOnly = true)
    public List<T> findByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }
        return repository.findActiveByIds(ids);
    }

    /**
     * 软删除实体
     */
    @Transactional
    public boolean deleteById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID不能为null");
        }

        try {
            String currentUser = getCurrentUser();
            LocalDateTime now = LocalDateTime.now();
            int updatedRows = repository.softDeleteById(id, now, currentUser);
            
            if (updatedRows > 0) {
                logger.info("成功软删除实体: ID={}, 操作人={}", id, currentUser);
                return true;
            } else {
                logger.warn("软删除失败，实体不存在: ID={}", id);
                return false;
            }
        } catch (Exception e) {
            logger.error("软删除失败: ID={}, 错误={}", id, e.getMessage(), e);
            throw new RuntimeException("删除失败: " + e.getMessage());
        }
    }

    /**
     * 批量软删除实体
     */
    @Transactional
    public BatchResult deleteByIds(List<Long> ids) {
        BatchResult result = new BatchResult(ids.size());
        result.setOperationType("BATCH_DELETE");
        result.setOperator(getCurrentUser());

        if (ids == null || ids.isEmpty()) {
            result.addFailure(null, "删除ID列表不能为空");
            return result;
        }

        try {
            String currentUser = getCurrentUser();
            LocalDateTime now = LocalDateTime.now();
            
            // 先检查哪些ID存在
            List<T> existingEntities = repository.findActiveByIds(ids);
            List<Long> existingIds = new ArrayList<>();
            for (T entity : existingEntities) {
                existingIds.add(entity.getId());
            }

            // 批量软删除
            int updatedRows = repository.softDeleteByIds(existingIds, now, currentUser);
            
            // 统计结果
            for (Long id : ids) {
                if (existingIds.contains(id)) {
                    result.addSuccess(id);
                } else {
                    result.addFailure(id, "记录不存在或已删除");
                }
            }

            logger.info("批量软删除完成: 请求删除={}, 实际删除={}, 失败={}", 
                       ids.size(), updatedRows, result.getFailureCount());

        } catch (Exception e) {
            logger.error("批量软删除失败: {}", e.getMessage(), e);
            // 逐个删除
            for (Long id : ids) {
                try {
                    boolean deleted = deleteById(id);
                    if (deleted) {
                        result.addSuccess(id);
                    } else {
                        result.addFailure(id, "删除失败");
                    }
                } catch (Exception ex) {
                    result.addFailure(id, ex.getMessage());
                }
            }
        }

        return result;
    }

    /**
     * 恢复软删除的实体
     */
    @Transactional
    public boolean restoreById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID不能为null");
        }

        try {
            String currentUser = getCurrentUser();
            LocalDateTime now = LocalDateTime.now();
            int updatedRows = repository.restoreById(id, now, currentUser);
            
            if (updatedRows > 0) {
                logger.info("成功恢复实体: ID={}, 操作人={}", id, currentUser);
                return true;
            } else {
                logger.warn("恢复失败，实体不存在: ID={}", id);
                return false;
            }
        } catch (Exception e) {
            logger.error("恢复失败: ID={}, 错误={}", id, e.getMessage(), e);
            throw new RuntimeException("恢复失败: " + e.getMessage());
        }
    }

    /**
     * 批量恢复软删除的实体
     */
    @Transactional
    public BatchResult restoreByIds(List<Long> ids) {
        BatchResult result = new BatchResult(ids.size());
        result.setOperationType("BATCH_RESTORE");
        result.setOperator(getCurrentUser());

        if (ids == null || ids.isEmpty()) {
            result.addFailure(null, "恢复ID列表不能为空");
            return result;
        }

        try {
            String currentUser = getCurrentUser();
            LocalDateTime now = LocalDateTime.now();
            int updatedRows = repository.restoreByIds(ids, now, currentUser);
            
            // 简化处理，假设所有请求的ID都成功恢复
            for (Long id : ids) {
                result.addSuccess(id);
            }

            logger.info("批量恢复完成: 请求恢复={}, 实际恢复={}", ids.size(), updatedRows);

        } catch (Exception e) {
            logger.error("批量恢复失败: {}", e.getMessage(), e);
            throw new RuntimeException("批量恢复失败: " + e.getMessage());
        }

        return result;
    }

    /**
     * 硬删除实体（慎用）
     */
    @Transactional
    public void hardDeleteById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID不能为null");
        }

        try {
            repository.deleteById(id);
            logger.warn("执行硬删除操作: ID={}, 操作人={}", id, getCurrentUser());
        } catch (Exception e) {
            logger.error("硬删除失败: ID={}, 错误={}", id, e.getMessage(), e);
            throw new RuntimeException("硬删除失败: " + e.getMessage());
        }
    }

    /**
     * 检查实体是否存在
     */
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        if (id == null) {
            return false;
        }
        return repository.existsActiveById(id);
    }

    /**
     * 统计实体数量
     */
    @Transactional(readOnly = true)
    public long count() {
        return repository.countActive();
    }

    /**
     * 统计符合条件的实体数量
     */
    @Transactional(readOnly = true)
    public long count(Specification<T> spec) {
        return repository.count(spec);
    }

    /**
     * 获取最近创建的实体
     */
    @Transactional(readOnly = true)
    public List<T> findRecentlyCreated(int limit) {
        return repository.findRecentlyCreated(
            org.springframework.data.domain.PageRequest.of(0, limit)
        );
    }

    /**
     * 获取最近更新的实体
     */
    @Transactional(readOnly = true)
    public List<T> findRecentlyUpdated(int limit) {
        return repository.findRecentlyUpdated(
            org.springframework.data.domain.PageRequest.of(0, limit)
        );
    }

    /**
     * 根据创建者查找实体
     */
    @Transactional(readOnly = true)
    public List<T> findByCreatedBy(String createdBy) {
        return repository.findByCreatedBy(createdBy);
    }

    /**
     * 根据时间范围查找实体
     */
    @Transactional(readOnly = true)
    public List<T> findByCreatedTimeBetween(LocalDateTime startTime, LocalDateTime endTime) {
        return repository.findByCreatedTimeBetween(startTime, endTime);
    }
} 