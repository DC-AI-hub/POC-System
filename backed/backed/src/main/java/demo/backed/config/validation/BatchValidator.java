package demo.backed.config.validation;

import demo.backed.dto.BatchResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.validation.ConstraintViolation;
import javax.validation.Validator;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * 批量操作验证器
 * 用于验证批量操作中的数据和业务规则
 */
@Component
public class BatchValidator {

    @Autowired
    private Validator validator;

    /**
     * 验证结果类
     */
    public static class ValidationResult {
        private boolean valid;
        private List<String> errors;
        private List<ValidationError> detailErrors;

        public ValidationResult() {
            this.errors = new ArrayList<>();
            this.detailErrors = new ArrayList<>();
            this.valid = true;
        }

        public void addError(String error) {
            this.errors.add(error);
            this.valid = false;
        }

        public void addError(int rowIndex, String field, String message) {
            this.detailErrors.add(new ValidationError(rowIndex, field, message));
            this.errors.add(String.format("第%d行字段%s: %s", rowIndex + 1, field, message));
            this.valid = false;
        }

        // Getter和Setter方法
        public boolean isValid() {
            return valid;
        }

        public void setValid(boolean valid) {
            this.valid = valid;
        }

        public List<String> getErrors() {
            return errors;
        }

        public void setErrors(List<String> errors) {
            this.errors = errors;
        }

        public List<ValidationError> getDetailErrors() {
            return detailErrors;
        }

        public void setDetailErrors(List<ValidationError> detailErrors) {
            this.detailErrors = detailErrors;
        }
    }

    /**
     * 验证错误详情
     */
    public static class ValidationError {
        private int rowIndex;
        private String field;
        private String message;
        private Object invalidValue;

        public ValidationError(int rowIndex, String field, String message) {
            this.rowIndex = rowIndex;
            this.field = field;
            this.message = message;
        }

        public ValidationError(int rowIndex, String field, String message, Object invalidValue) {
            this.rowIndex = rowIndex;
            this.field = field;
            this.message = message;
            this.invalidValue = invalidValue;
        }

        // Getter和Setter方法
        public int getRowIndex() {
            return rowIndex;
        }

        public void setRowIndex(int rowIndex) {
            this.rowIndex = rowIndex;
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

        public Object getInvalidValue() {
            return invalidValue;
        }

        public void setInvalidValue(Object invalidValue) {
            this.invalidValue = invalidValue;
        }
    }

    /**
     * 验证批量实体列表
     */
    public ValidationResult validateBatch(List<?> entities) {
        ValidationResult result = new ValidationResult();

        if (entities == null || entities.isEmpty()) {
            result.addError("批量操作数据不能为空");
            return result;
        }

        // 检查批量操作数量限制
        if (entities.size() > 1000) {
            result.addError("批量操作最大支持1000条记录，当前：" + entities.size() + "条");
            return result;
        }

        // 逐个验证实体
        for (int i = 0; i < entities.size(); i++) {
            Object entity = entities.get(i);
            if (entity == null) {
                result.addError(i, "entity", "实体不能为null");
                continue;
            }

            // Bean Validation验证
            Set<ConstraintViolation<Object>> violations = validator.validate(entity);
            for (ConstraintViolation<Object> violation : violations) {
                result.addError(i, violation.getPropertyPath().toString(), violation.getMessage());
            }

            // 自定义业务规则验证
            validateBusinessRules(entity, i, result);
        }

        return result;
    }

    /**
     * 验证单个实体
     */
    public ValidationResult validateSingle(Object entity) {
        ValidationResult result = new ValidationResult();

        if (entity == null) {
            result.addError("实体不能为null");
            return result;
        }

        // Bean Validation验证
        Set<ConstraintViolation<Object>> violations = validator.validate(entity);
        for (ConstraintViolation<Object> violation : violations) {
            result.addError(0, violation.getPropertyPath().toString(), violation.getMessage());
        }

        // 自定义业务规则验证
        validateBusinessRules(entity, 0, result);

        return result;
    }

    /**
     * 验证业务规则
     */
    public void validateBusinessRules(Object entity, int rowIndex, ValidationResult result) {
        if (entity == null) {
            return;
        }

        String entityClassName = entity.getClass().getSimpleName();

        // 根据实体类型执行不同的业务规则验证
        switch (entityClassName) {
            case "User":
                validateUserBusinessRules(entity, rowIndex, result);
                break;
            case "ExpenseApplication":
                validateExpenseApplicationBusinessRules(entity, rowIndex, result);
                break;
            // 可以添加更多实体类型的验证
            default:
                // 通用业务规则验证
                validateCommonBusinessRules(entity, rowIndex, result);
                break;
        }
    }

    /**
     * 用户业务规则验证
     */
    private void validateUserBusinessRules(Object entity, int rowIndex, ValidationResult result) {
        try {
            // 使用反射获取字段值进行业务规则验证
            Class<?> clazz = entity.getClass();
            
            // 验证员工ID格式
            try {
                java.lang.reflect.Field employeeIdField = clazz.getDeclaredField("employeeId");
                employeeIdField.setAccessible(true);
                String employeeId = (String) employeeIdField.get(entity);
                
                if (employeeId != null && !employeeId.matches("^[A-Z]{2,3}\\d{3,6}$")) {
                    result.addError(rowIndex, "employeeId", "员工ID格式不正确，应为2-3位字母+3-6位数字");
                }
            } catch (NoSuchFieldException | IllegalAccessException ignored) {
                // 字段不存在或无法访问，跳过验证
            }

            // 验证邮箱域名
            try {
                java.lang.reflect.Field emailField = clazz.getDeclaredField("email");
                emailField.setAccessible(true);
                String email = (String) emailField.get(entity);
                
                if (email != null && !email.endsWith("@company.com") && !email.endsWith("@example.com")) {
                    result.addError(rowIndex, "email", "邮箱必须使用公司域名");
                }
            } catch (NoSuchFieldException | IllegalAccessException ignored) {
                // 字段不存在或无法访问，跳过验证
            }

        } catch (Exception e) {
            result.addError(rowIndex, "general", "业务规则验证失败: " + e.getMessage());
        }
    }

    /**
     * 费用申请业务规则验证
     */
    private void validateExpenseApplicationBusinessRules(Object entity, int rowIndex, ValidationResult result) {
        try {
            // 可以添加费用申请相关的业务规则验证
            // 例如：金额范围验证、申请日期验证等
        } catch (Exception e) {
            result.addError(rowIndex, "general", "费用申请业务规则验证失败: " + e.getMessage());
        }
    }

    /**
     * 通用业务规则验证
     */
    private void validateCommonBusinessRules(Object entity, int rowIndex, ValidationResult result) {
        try {
            // 通用业务规则验证逻辑
            // 例如：检查状态值是否合法等
        } catch (Exception e) {
            result.addError(rowIndex, "general", "通用业务规则验证失败: " + e.getMessage());
        }
    }

    /**
     * 将验证结果转换为BatchResult
     */
    public BatchResult convertToBatchResult(ValidationResult validationResult, String operationType) {
        BatchResult batchResult = new BatchResult();
        batchResult.setOperationType(operationType);

        if (!validationResult.isValid()) {
            batchResult.setFailureCount(validationResult.getErrors().size());
            batchResult.setErrors(validationResult.getErrors());
            
            // 转换详细错误信息
            for (ValidationError validationError : validationResult.getDetailErrors()) {
                batchResult.addFailure(
                    validationError.getRowIndex(),
                    null, // 没有ID信息
                    validationError.getField(),
                    validationError.getMessage(),
                    validationError.getInvalidValue() != null ? 
                        validationError.getInvalidValue().toString() : null
                );
            }
        }

        return batchResult;
    }
} 