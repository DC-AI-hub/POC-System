package demo.backed.example;

import demo.backed.entity.BaseEntity;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * 示例实体类
 * 展示如何继承BaseEntity并使用审计功能
 */
@Entity
@Table(name = "t_poc_sample_entities", indexes = {
    @Index(name = "idx_sample_name", columnList = "name"),
    @Index(name = "idx_sample_category", columnList = "category")
})
@ApiModel(description = "示例实体")
public class SampleEntity extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    @NotBlank(message = "名称不能为空")
    @Size(max = 100, message = "名称长度不能超过100个字符")
    @ApiModelProperty(value = "名称", required = true, example = "示例名称")
    private String name;

    @Column(name = "description", length = 500)
    @Size(max = 500, message = "描述长度不能超过500个字符")
    @ApiModelProperty(value = "描述", example = "这是一个示例描述")
    private String description;

    @Column(name = "category", length = 50)
    @Size(max = 50, message = "分类长度不能超过50个字符")
    @ApiModelProperty(value = "分类", example = "示例分类")
    private String category;

    @Column(name = "status", nullable = false, length = 20)
    @ApiModelProperty(value = "状态", required = true, example = "ACTIVE")
    private String status = "ACTIVE";

    @Column(name = "sort_order")
    @ApiModelProperty(value = "排序", example = "1")
    private Integer sortOrder;

    public SampleEntity() {
        super();
    }

    public SampleEntity(String name, String description, String category) {
        super();
        this.name = name;
        this.description = description;
        this.category = category;
        this.status = "ACTIVE";
    }

    // Getter和Setter方法
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    @Override
    public String toString() {
        return "SampleEntity{" +
                "id=" + getId() +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", category='" + category + '\'' +
                ", status='" + status + '\'' +
                ", sortOrder=" + sortOrder +
                ", createdTime=" + getCreatedTime() +
                ", updatedTime=" + getUpdatedTime() +
                ", createdBy='" + getCreatedBy() + '\'' +
                ", updatedBy='" + getUpdatedBy() + '\'' +
                ", isDeleted=" + getIsDeleted() +
                '}';
    }
} 