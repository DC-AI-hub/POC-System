package demo.backed.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_poc_users", indexes = {
    @Index(name = "idx_employee_id", columnList = "employee_id", unique = true),
    @Index(name = "idx_email", columnList = "email", unique = true),
    @Index(name = "idx_department", columnList = "department"),
    @Index(name = "idx_status", columnList = "status")
})
@ApiModel(description = "用户实体")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @ApiModelProperty(value = "用户ID", example = "1")
    private Long id;
    
    @Column(name = "employee_id", nullable = false, unique = true, length = 20)
    @ApiModelProperty(value = "工号", required = true, example = "EMP001")
    private String employeeId;
    
    @Column(name = "user_name", nullable = false, length = 50)
    @ApiModelProperty(value = "姓名", required = true, example = "张三")
    private String userName;
    
    @Column(name = "email", nullable = false, unique = true, length = 100)
    @ApiModelProperty(value = "邮箱", required = true, example = "zhangsan@example.com")
    private String email;
    
    @Column(name = "phone", length = 20)
    @ApiModelProperty(value = "电话", example = "13800138000")
    private String phone;
    
    @Column(name = "department", nullable = false, length = 50)
    @ApiModelProperty(value = "部门", required = true, example = "技术部")
    private String department;
    
    @Column(name = "position", length = 50)
    @ApiModelProperty(value = "岗位", example = "高级工程师")
    private String position;
    
    @Column(name = "user_type", nullable = false, length = 20)
    @ApiModelProperty(value = "用户类型(主管/员工)", required = true, example = "员工")
    private String userType;
    
    @Column(name = "status", nullable = false, length = 20)
    @ApiModelProperty(value = "状态", required = true, example = "在职")
    private String status;
    
    @Column(name = "password", nullable = false)
    @JsonIgnore
    @ApiModelProperty(hidden = true)
    private String password;
    
    @Column(name = "is_online")
    @ApiModelProperty(value = "是否在线", example = "true")
    private Boolean isOnline;
    
    @Column(name = "last_login_time")
    @ApiModelProperty(value = "最后登录时间")
    private LocalDateTime lastLoginTime;
    
    @Column(name = "created_time", nullable = false)
    @ApiModelProperty(value = "创建时间")
    private LocalDateTime createdTime;
    
    @Column(name = "updated_time")
    @ApiModelProperty(value = "更新时间")
    private LocalDateTime updatedTime;
    
    @Column(name = "created_by", length = 50)
    @ApiModelProperty(value = "创建者")
    private String createdBy;
    
    @Column(name = "updated_by", length = 50)
    @ApiModelProperty(value = "更新者")
    private String updatedBy;
    
    @Column(name = "hire_date")
    @ApiModelProperty(value = "入职日期")
    private LocalDateTime hireDate;
    
    @Column(name = "manager", length = 50)
    @ApiModelProperty(value = "直属主管")
    private String manager;
    
    @Column(name = "work_location", length = 100)
    @ApiModelProperty(value = "工作地点")
    private String workLocation;
    
    @Column(name = "emergency_contact", length = 50)
    @ApiModelProperty(value = "紧急联系人")
    private String emergencyContact;
    
    @Column(name = "emergency_phone", length = 20)
    @ApiModelProperty(value = "紧急联系人电话")
    private String emergencyPhone;
    
    @Column(name = "notes", length = 500)
    @ApiModelProperty(value = "备注")
    private String notes;
    
    // 构造函数
    public User() {
        this.isOnline = false;
        this.status = "在职";
        this.userType = "员工";
    }
    
    public User(String employeeId, String userName, String email, String department) {
        this();
        this.employeeId = employeeId;
        this.userName = userName;
        this.email = email;
        this.department = department;
    }
    
    // JPA生命周期回调
    @PrePersist
    protected void onCreate() {
        this.createdTime = LocalDateTime.now();
        this.updatedTime = LocalDateTime.now();
        if (this.isOnline == null) {
            this.isOnline = false;
        }
        if (this.status == null) {
            this.status = "在职";
        }
        if (this.userType == null) {
            this.userType = "员工";
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedTime = LocalDateTime.now();
    }
    
    // Getter和Setter方法
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getEmployeeId() {
        return employeeId;
    }
    
    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getDepartment() {
        return department;
    }
    
    public void setDepartment(String department) {
        this.department = department;
    }
    
    public String getPosition() {
        return position;
    }
    
    public void setPosition(String position) {
        this.position = position;
    }
    
    public String getUserType() {
        return userType;
    }
    
    public void setUserType(String userType) {
        this.userType = userType;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public Boolean getIsOnline() {
        return isOnline;
    }
    
    public void setIsOnline(Boolean isOnline) {
        this.isOnline = isOnline;
    }
    
    public LocalDateTime getLastLoginTime() {
        return lastLoginTime;
    }
    
    public void setLastLoginTime(LocalDateTime lastLoginTime) {
        this.lastLoginTime = lastLoginTime;
    }
    
    public LocalDateTime getCreatedTime() {
        return createdTime;
    }
    
    public void setCreatedTime(LocalDateTime createdTime) {
        this.createdTime = createdTime;
    }
    
    public LocalDateTime getUpdatedTime() {
        return updatedTime;
    }
    
    public void setUpdatedTime(LocalDateTime updatedTime) {
        this.updatedTime = updatedTime;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    public String getUpdatedBy() {
        return updatedBy;
    }
    
    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
    
    public LocalDateTime getHireDate() {
        return hireDate;
    }
    
    public void setHireDate(LocalDateTime hireDate) {
        this.hireDate = hireDate;
    }
    
    public String getManager() {
        return manager;
    }
    
    public void setManager(String manager) {
        this.manager = manager;
    }
    
    public String getWorkLocation() {
        return workLocation;
    }
    
    public void setWorkLocation(String workLocation) {
        this.workLocation = workLocation;
    }
    
    public String getEmergencyContact() {
        return emergencyContact;
    }
    
    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
    }
    
    public String getEmergencyPhone() {
        return emergencyPhone;
    }
    
    public void setEmergencyPhone(String emergencyPhone) {
        this.emergencyPhone = emergencyPhone;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", employeeId='" + employeeId + '\'' +
                ", userName='" + userName + '\'' +
                ", email='" + email + '\'' +
                ", department='" + department + '\'' +
                ", position='" + position + '\'' +
                ", userType='" + userType + '\'' +
                ", status='" + status + '\'' +
                ", isOnline=" + isOnline +
                ", lastLoginTime=" + lastLoginTime +
                '}';
    }
} 