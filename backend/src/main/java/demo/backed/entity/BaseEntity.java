package demo.backed.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.annotations.ApiModelProperty;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 通用实体基类
 * 包含审计字段、软删除机制和JPA生命周期回调
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @ApiModelProperty(value = "主键ID", example = "1")
    private Long id;

    @Column(name = "created_time", nullable = false, updatable = false)
    @CreatedDate
    @ApiModelProperty(value = "创建时间")
    private LocalDateTime createdTime;

    @Column(name = "updated_time")
    @LastModifiedDate
    @ApiModelProperty(value = "更新时间")
    private LocalDateTime updatedTime;

    @Column(name = "created_by", length = 50, updatable = false)
    @CreatedBy
    @ApiModelProperty(value = "创建者")
    private String createdBy;

    @Column(name = "updated_by", length = 50)
    @LastModifiedBy
    @ApiModelProperty(value = "更新者")
    private String updatedBy;

    @Column(name = "is_deleted", nullable = false)
    @ApiModelProperty(value = "是否已删除", hidden = true)
    @JsonIgnore
    private Boolean isDeleted = false;

    @Version
    @Column(name = "version")
    @ApiModelProperty(value = "版本号（乐观锁）", hidden = true)
    @JsonIgnore
    private Long version = 0L;

    // 构造函数
    public BaseEntity() {
        this.isDeleted = false;
        this.version = 0L;
    }

    // JPA生命周期回调
    @PrePersist
    protected void onCreate() {
        if (this.createdTime == null) {
            this.createdTime = LocalDateTime.now();
        }
        if (this.updatedTime == null) {
            this.updatedTime = LocalDateTime.now();
        }
        if (this.isDeleted == null) {
            this.isDeleted = false;
        }
        if (this.version == null) {
            this.version = 0L;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedTime = LocalDateTime.now();
    }

    // 软删除方法
    public void softDelete() {
        this.isDeleted = true;
        this.updatedTime = LocalDateTime.now();
    }

    // 恢复软删除
    public void restore() {
        this.isDeleted = false;
        this.updatedTime = LocalDateTime.now();
    }

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        BaseEntity that = (BaseEntity) obj;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "{" +
                "id=" + id +
                ", createdTime=" + createdTime +
                ", updatedTime=" + updatedTime +
                ", createdBy='" + createdBy + '\'' +
                ", updatedBy='" + updatedBy + '\'' +
                ", isDeleted=" + isDeleted +
                ", version=" + version +
                '}';
    }
} 