package demo.backed.repository;

import demo.backed.entity.TestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestEntityRepository extends JpaRepository<TestEntity, Long> {
    
    // 根据名称查找测试实体
    List<TestEntity> findByTestName(String testName);
    
    // 根据名称模糊查询
    List<TestEntity> findByTestNameContaining(String keyword);
    
    // 自定义查询 - 获取最近的测试记录
    @Query("SELECT t FROM TestEntity t ORDER BY t.createdTime DESC")
    List<TestEntity> findLatestTests();
    
    // 统计总数
    @Query("SELECT COUNT(t) FROM TestEntity t")
    long countAllTests();
} 