package demo.backed.example;

import demo.backed.repository.BaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 示例Repository接口
 * 展示如何继承BaseRepository并添加自定义查询方法
 */
@Repository
public interface SampleRepository extends BaseRepository<SampleEntity> {

    /**
     * 根据名称查找未删除的记录
     */
    @Query("SELECT s FROM SampleEntity s WHERE s.name LIKE %:name% AND (s.isDeleted = false OR s.isDeleted IS NULL)")
    List<SampleEntity> findByNameContaining(@Param("name") String name);

    /**
     * 根据分类查找未删除的记录
     */
    @Query("SELECT s FROM SampleEntity s WHERE s.category = :category AND (s.isDeleted = false OR s.isDeleted IS NULL)")
    List<SampleEntity> findByCategory(@Param("category") String category);

    /**
     * 根据分类分页查找未删除的记录
     */
    @Query("SELECT s FROM SampleEntity s WHERE s.category = :category AND (s.isDeleted = false OR s.isDeleted IS NULL)")
    Page<SampleEntity> findByCategory(@Param("category") String category, Pageable pageable);

    /**
     * 根据状态查找未删除的记录
     */
    @Query("SELECT s FROM SampleEntity s WHERE s.status = :status AND (s.isDeleted = false OR s.isDeleted IS NULL)")
    List<SampleEntity> findByStatus(@Param("status") String status);

    /**
     * 根据名称和分类查找未删除的记录
     */
    @Query("SELECT s FROM SampleEntity s WHERE s.name LIKE %:name% AND s.category = :category AND (s.isDeleted = false OR s.isDeleted IS NULL)")
    List<SampleEntity> findByNameContainingAndCategory(@Param("name") String name, @Param("category") String category);

    /**
     * 查找指定排序范围内的记录
     */
    @Query("SELECT s FROM SampleEntity s WHERE s.sortOrder BETWEEN :minOrder AND :maxOrder AND (s.isDeleted = false OR s.isDeleted IS NULL) ORDER BY s.sortOrder")
    List<SampleEntity> findBySortOrderBetween(@Param("minOrder") Integer minOrder, @Param("maxOrder") Integer maxOrder);

    /**
     * 统计指定分类的记录数量
     */
    @Query("SELECT COUNT(s) FROM SampleEntity s WHERE s.category = :category AND (s.isDeleted = false OR s.isDeleted IS NULL)")
    long countByCategory(@Param("category") String category);

    /**
     * 统计指定状态的记录数量
     */
    @Query("SELECT COUNT(s) FROM SampleEntity s WHERE s.status = :status AND (s.isDeleted = false OR s.isDeleted IS NULL)")
    long countByStatus(@Param("status") String status);
} 