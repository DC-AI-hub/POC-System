package demo.backed.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

import java.time.LocalDateTime;

@ApiModel(description = "用户数据传输对象")
public class UserDTO {
    
    @ApiModelProperty(value = "用户ID", example = "1")
    private Long id;
    
    @ApiModelProperty(value = "工号", required = true, example = "EMP001")
    private String employeeId;
    
    @ApiModelProperty(value = "姓名", required = true, example = "张三")
    private String userName;
    
    @ApiModelProperty(value = "邮箱", required = true, example = "zhangsan@example.com")
    private String email;
    
    @ApiModelProperty(value = "电话", example = "13800138000")
    private String phone;
    
    @ApiModelProperty(value = "部门", required = true, example = "技术部")
    private String department;
    
    @ApiModelProperty(value = "岗位", example = "高级工程师")
    private String position;
    
    @ApiModelProperty(value = "用户类型", required = true, example = "员工")
    private String userType;
    
    @ApiModelProperty(value = "状态", required = true, example = "在职")
    private String status;
    
    @ApiModelProperty(value = "是否在线", example = "true")
    private Boolean isOnline;
    
    @ApiModelProperty(value = "最后登录时间")
    private LocalDateTime lastLoginTime;
    
    @ApiModelProperty(value = "创建时间")
    private LocalDateTime createdTime;
    
    @ApiModelProperty(value = "更新时间")
    private LocalDateTime updatedTime;
    
    @ApiModelProperty(value = "入职日期")
    private LocalDateTime hireDate;
    
    @ApiModelProperty(value = "直属主管")
    private String manager;
    
    @ApiModelProperty(value = "工作地点")
    private String workLocation;
    
    @ApiModelProperty(value = "紧急联系人")
    private String emergencyContact;
    
    @ApiModelProperty(value = "紧急联系人电话")
    private String emergencyPhone;
    
    @ApiModelProperty(value = "备注")
    private String notes;
    
    // 构造函数
    public UserDTO() {}
    
    // Getter 和 Setter
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
} 