package demo.backed.repository;

import demo.backed.entity.BaseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 通用Repository基类
 * 提供软删除查询和批量操作支持
 */
@NoRepositoryBean
public interface BaseRepository<T extends BaseEntity> extends JpaRepository<T, Long>, JpaSpecificationExecutor<T> {

    /**
     * 查找所有未删除的记录
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.isDeleted = false OR e.isDeleted IS NULL")
    List<T> findAllActive();

    /**
     * 分页查找所有未删除的记录
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.isDeleted = false OR e.isDeleted IS NULL")
    Page<T> findAllActive(Pageable pageable);

    /**
     * 根据ID查找未删除的记录
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.id = :id AND (e.isDeleted = false OR e.isDeleted IS NULL)")
    Optional<T> findActiveById(@Param("id") Long id);

    /**
     * 根据ID列表查找未删除的记录
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.id IN :ids AND (e.isDeleted = false OR e.isDeleted IS NULL)")
    List<T> findActiveByIds(@Param("ids") List<Long> ids);

    /**
     * 软删除记录
     */
    @Modifying
    @Query("UPDATE #{#entityName} e SET e.isDeleted = true, e.updatedTime = :now, e.updatedBy = :updatedBy WHERE e.id = :id")
    int softDeleteById(@Param("id") Long id, @Param("now") LocalDateTime now, @Param("updatedBy") String updatedBy);

    /**
     * 批量软删除记录
     */
    @Modifying
    @Query("UPDATE #{#entityName} e SET e.isDeleted = true, e.updatedTime = :now, e.updatedBy = :updatedBy WHERE e.id IN :ids")
    int softDeleteByIds(@Param("ids") List<Long> ids, @Param("now") LocalDateTime now, @Param("updatedBy") String updatedBy);

    /**
     * 恢复软删除记录
     */
    @Modifying
    @Query("UPDATE #{#entityName} e SET e.isDeleted = false, e.updatedTime = :now, e.updatedBy = :updatedBy WHERE e.id = :id")
    int restoreById(@Param("id") Long id, @Param("now") LocalDateTime now, @Param("updatedBy") String updatedBy);

    /**
     * 批量恢复软删除记录
     */
    @Modifying
    @Query("UPDATE #{#entityName} e SET e.isDeleted = false, e.updatedTime = :now, e.updatedBy = :updatedBy WHERE e.id IN :ids")
    int restoreByIds(@Param("ids") List<Long> ids, @Param("now") LocalDateTime now, @Param("updatedBy") String updatedBy);

    /**
     * 统计未删除记录数量
     */
    @Query("SELECT COUNT(e) FROM #{#entityName} e WHERE e.isDeleted = false OR e.isDeleted IS NULL")
    long countActive();

    /**
     * 检查记录是否存在且未删除
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM #{#entityName} e WHERE e.id = :id AND (e.isDeleted = false OR e.isDeleted IS NULL)")
    boolean existsActiveById(@Param("id") Long id);

    /**
     * 查找最近创建的记录
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.isDeleted = false OR e.isDeleted IS NULL ORDER BY e.createdTime DESC")
    List<T> findRecentlyCreated(Pageable pageable);

    /**
     * 查找最近更新的记录
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.isDeleted = false OR e.isDeleted IS NULL ORDER BY e.updatedTime DESC")
    List<T> findRecentlyUpdated(Pageable pageable);

    /**
     * 根据创建者查找记录
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.createdBy = :createdBy AND (e.isDeleted = false OR e.isDeleted IS NULL)")
    List<T> findByCreatedBy(@Param("createdBy") String createdBy);

    /**
     * 根据创建者分页查找记录
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.createdBy = :createdBy AND (e.isDeleted = false OR e.isDeleted IS NULL)")
    Page<T> findByCreatedBy(@Param("createdBy") String createdBy, Pageable pageable);

    /**
     * 根据时间范围查找记录
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.createdTime BETWEEN :startTime AND :endTime AND (e.isDeleted = false OR e.isDeleted IS NULL)")
    List<T> findByCreatedTimeBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 根据时间范围分页查找记录
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.createdTime BETWEEN :startTime AND :endTime AND (e.isDeleted = false OR e.isDeleted IS NULL)")
    Page<T> findByCreatedTimeBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime, Pageable pageable);

    /**
     * 批量更新指定字段
     */
    @Modifying
    @Query("UPDATE #{#entityName} e SET e.updatedTime = :now, e.updatedBy = :updatedBy WHERE e.id IN :ids")
    int batchUpdateTimestamp(@Param("ids") List<Long> ids, @Param("now") LocalDateTime now, @Param("updatedBy") String updatedBy);

    /**
     * 获取实体的版本号（用于乐观锁）
     */
    @Query("SELECT e.version FROM #{#entityName} e WHERE e.id = :id")
    Optional<Long> findVersionById(@Param("id") Long id);

    /**
     * 检查是否存在指定版本的记录（用于乐观锁）
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM #{#entityName} e WHERE e.id = :id AND e.version = :version")
    boolean existsByIdAndVersion(@Param("id") Long id, @Param("version") Long version);
} 