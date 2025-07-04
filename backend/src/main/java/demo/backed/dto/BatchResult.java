package demo.backed.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 批量操作结果DTO
 * 用于返回批量操作的统计信息和错误详情
 */
@ApiModel(description = "批量操作结果")
public class BatchResult {

    @ApiModelProperty(value = "总操作数", example = "100")
    private int totalCount;

    @ApiModelProperty(value = "成功数", example = "95")
    private int successCount;

    @ApiModelProperty(value = "失败数", example = "5")
    private int failureCount;

    @ApiModelProperty(value = "操作是否全部成功", example = "false")
    private boolean allSuccess;

    @ApiModelProperty(value = "操作时间")
    private LocalDateTime operationTime;

    @ApiModelProperty(value = "操作者")
    private String operator;

    @ApiModelProperty(value = "操作类型", example = "BATCH_CREATE")
    private String operationType;

    @ApiModelProperty(value = "错误信息列表")
    private List<String> errors;

    @ApiModelProperty(value = "成功的ID列表")
    private List<Long> successIds;

    @ApiModelProperty(value = "失败的ID列表")
    private List<Long> failureIds;

    @ApiModelProperty(value = "详细错误信息")
    private List<BatchError> detailErrors;

    public BatchResult() {
        this.errors = new ArrayList<>();
        this.successIds = new ArrayList<>();
        this.failureIds = new ArrayList<>();
        this.detailErrors = new ArrayList<>();
        this.operationTime = LocalDateTime.now();
    }

    public BatchResult(int totalCount) {
        this();
        this.totalCount = totalCount;
    }

    /**
     * 批量错误详情
     */
    public static class BatchError {
        @ApiModelProperty(value = "错误行号", example = "10")
        private int rowIndex;

        @ApiModelProperty(value = "记录ID", example = "123")
        private Long recordId;

        @ApiModelProperty(value = "错误字段", example = "email")
        private String field;

        @ApiModelProperty(value = "错误信息", example = "邮箱格式不正确")
        private String message;

        @ApiModelProperty(value = "原始值", example = "invalid-email")
        private String originalValue;

        public BatchError() {}

        public BatchError(int rowIndex, String field, String message) {
            this.rowIndex = rowIndex;
            this.field = field;
            this.message = message;
        }

        public BatchError(int rowIndex, Long recordId, String field, String message, String originalValue) {
            this.rowIndex = rowIndex;
            this.recordId = recordId;
            this.field = field;
            this.message = message;
            this.originalValue = originalValue;
        }

        // Getter和Setter方法
        public int getRowIndex() {
            return rowIndex;
        }

        public void setRowIndex(int rowIndex) {
            this.rowIndex = rowIndex;
        }

        public Long getRecordId() {
            return recordId;
        }

        public void setRecordId(Long recordId) {
            this.recordId = recordId;
        }

        public String getField() {
            return field;
        }

        public void setField(String field) {
            this.field = field;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getOriginalValue() {
            return originalValue;
        }

        public void setOriginalValue(String originalValue) {
            this.originalValue = originalValue;
        }
    }

    /**
     * 添加成功记录
     */
    public void addSuccess(Long id) {
        this.successIds.add(id);
        this.successCount++;
        updateResults();
    }

    /**
     * 添加失败记录
     */
    public void addFailure(Long id, String error) {
        this.failureIds.add(id);
        this.errors.add(error);
        this.failureCount++;
        updateResults();
    }

    /**
     * 添加失败记录（带详细错误信息）
     */
    public void addFailure(int rowIndex, Long id, String field, String error, String originalValue) {
        this.failureIds.add(id);
        this.errors.add(error);
        this.detailErrors.add(new BatchError(rowIndex, id, field, error, originalValue));
        this.failureCount++;
        updateResults();
    }

    /**
     * 更新结果统计
     */
    private void updateResults() {
        this.allSuccess = (this.failureCount == 0 && this.successCount > 0);
    }

    /**
     * 获取成功率
     */
    public double getSuccessRate() {
        if (totalCount == 0) return 0.0;
        return (double) successCount / totalCount * 100;
    }

    /**
     * 是否有错误
     */
    public boolean hasErrors() {
        return failureCount > 0;
    }

    // Getter和Setter方法
    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
        updateResults();
    }

    public int getFailureCount() {
        return failureCount;
    }

    public void setFailureCount(int failureCount) {
        this.failureCount = failureCount;
        updateResults();
    }

    public boolean isAllSuccess() {
        return allSuccess;
    }

    public void setAllSuccess(boolean allSuccess) {
        this.allSuccess = allSuccess;
    }

    public LocalDateTime getOperationTime() {
        return operationTime;
    }

    public void setOperationTime(LocalDateTime operationTime) {
        this.operationTime = operationTime;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public String getOperationType() {
        return operationType;
    }

    public void setOperationType(String operationType) {
        this.operationType = operationType;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public List<Long> getSuccessIds() {
        return successIds;
    }

    public void setSuccessIds(List<Long> successIds) {
        this.successIds = successIds;
    }

    public List<Long> getFailureIds() {
        return failureIds;
    }

    public void setFailureIds(List<Long> failureIds) {
        this.failureIds = failureIds;
    }

    public List<BatchError> getDetailErrors() {
        return detailErrors;
    }

    public void setDetailErrors(List<BatchError> detailErrors) {
        this.detailErrors = detailErrors;
    }

    @Override
    public String toString() {
        return "BatchResult{" +
                "totalCount=" + totalCount +
                ", successCount=" + successCount +
                ", failureCount=" + failureCount +
                ", allSuccess=" + allSuccess +
                ", operationTime=" + operationTime +
                ", operator='" + operator + '\'' +
                ", operationType='" + operationType + '\'' +
                ", successRate=" + String.format("%.2f", getSuccessRate()) + "%" +
                '}';
    }
} 