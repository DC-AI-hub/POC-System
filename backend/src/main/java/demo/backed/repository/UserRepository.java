package demo.backed.repository;

import demo.backed.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * 根据工号查找用户
     */
    Optional<User> findByEmployeeId(String employeeId);
    
    /**
     * 根据邮箱查找用户
     */
    Optional<User> findByEmail(String email);
    
    /**
     * 根据工号或邮箱查找用户（用于登录验证）
     */
    @Query("SELECT u FROM User u WHERE u.employeeId = :identifier OR u.email = :identifier")
    Optional<User> findByEmployeeIdOrEmail(@Param("identifier") String identifier);
    
    /**
     * 获取在线用户列表
     */
    List<User> findByIsOnlineTrue();
    
    /**
     * 根据部门查找用户
     */
    List<User> findByDepartment(String department);
    
    /**
     * 根据用户类型查找用户
     */
    List<User> findByUserType(String userType);
    
    /**
     * 根据状态查找用户
     */
    List<User> findByStatus(String status);
    
    /**
     * 模糊查询用户（姓名、工号、邮箱、部门）
     */
    @Query("SELECT u FROM User u WHERE " +
           "u.userName LIKE %:keyword% OR " +
           "u.employeeId LIKE %:keyword% OR " +
           "u.email LIKE %:keyword% OR " +
           "u.department LIKE %:keyword%")
    Page<User> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * 根据部门分页查询用户
     */
    Page<User> findByDepartmentContaining(String department, Pageable pageable);
    
    /**
     * 根据状态分页查询用户
     */
    Page<User> findByStatus(String status, Pageable pageable);
    
    /**
     * 根据用户类型分页查询用户
     */
    Page<User> findByUserType(String userType, Pageable pageable);
    
    /**
     * 复合条件查询
     */
    @Query("SELECT u FROM User u WHERE " +
           "(:keyword IS NULL OR u.userName LIKE %:keyword% OR u.employeeId LIKE %:keyword% OR u.email LIKE %:keyword%) AND " +
           "(:department IS NULL OR u.department = :department) AND " +
           "(:status IS NULL OR u.status = :status) AND " +
           "(:userType IS NULL OR u.userType = :userType)")
    Page<User> findByConditions(@Param("keyword") String keyword,
                               @Param("department") String department,
                               @Param("status") String status,
                               @Param("userType") String userType,
                               Pageable pageable);
    
    /**
     * 检查工号是否存在（排除指定ID）
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.employeeId = :employeeId AND (:excludeId IS NULL OR u.id != :excludeId)")
    long countByEmployeeIdAndIdNot(@Param("employeeId") String employeeId, @Param("excludeId") Long excludeId);
    
    /**
     * 检查邮箱是否存在（排除指定ID）
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.email = :email AND (:excludeId IS NULL OR u.id != :excludeId)")
    long countByEmailAndIdNot(@Param("email") String email, @Param("excludeId") Long excludeId);
    
    /**
     * 获取某个部门的主管列表
     */
    @Query("SELECT u FROM User u WHERE u.department = :department AND u.userType = '主管'")
    List<User> findManagersByDepartment(@Param("department") String department);
    
    /**
     * 统计用户数量
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = '在职'")
    long countActiveUsers();
    
    /**
     * 统计在线用户数量
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.isOnline = true")
    long countOnlineUsers();
    
    /**
     * 按部门统计用户数量
     */
    @Query("SELECT u.department, COUNT(u) FROM User u WHERE u.status = '在职' GROUP BY u.department")
    List<Object[]> countUsersByDepartment();
    
    /**
     * 按部门统计用户数量（包含所有状态）
     */
    @Query("SELECT u.department, COUNT(u) FROM User u GROUP BY u.department ORDER BY u.department")
    List<Object[]> findUserCountByDepartment();
} 