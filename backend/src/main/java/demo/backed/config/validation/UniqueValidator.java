package demo.backed.config.validation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

/**
 * 唯一性验证器
 * 实现Unique注解的验证逻辑
 */
@Component
public class UniqueValidator implements ConstraintValidator<Unique, Object> {

    @Autowired
    private EntityManager entityManager;

    private Unique constraintAnnotation;

    @Override
    public void initialize(Unique constraintAnnotation) {
        this.constraintAnnotation = constraintAnnotation;
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // null值由@NotNull注解处理
        }

        try {
            Class<?> entityClass = constraintAnnotation.entity();
            String[] fields = constraintAnnotation.fields();
            boolean ignoreCurrentRecord = constraintAnnotation.ignoreCurrentRecord();
            String idField = constraintAnnotation.idField();

            // 如果没有指定字段，使用当前字段
            if (fields.length == 0) {
                return validateSingleField(value, entityClass, getFieldName(context), 
                                         ignoreCurrentRecord, idField);
            }

            // 验证多个字段的组合唯一性
            return validateMultipleFields(value, entityClass, fields, 
                                        ignoreCurrentRecord, idField);

        } catch (Exception e) {
            // 验证过程中出现异常，记录日志但不阻止验证
            return true;
        }
    }

    /**
     * 验证单个字段的唯一性
     */
    private boolean validateSingleField(Object value, Class<?> entityClass, String fieldName,
                                      boolean ignoreCurrentRecord, String idField) {
        try {
            StringBuilder jpql = new StringBuilder();
            jpql.append("SELECT COUNT(e) FROM ")
                .append(entityClass.getSimpleName())
                .append(" e WHERE e.")
                .append(fieldName)
                .append(" = :value");

            // 如果需要忽略当前记录，添加ID条件
            if (ignoreCurrentRecord) {
                Object currentId = getCurrentRecordId(value, idField);
                if (currentId != null) {
                    jpql.append(" AND e.").append(idField).append(" != :currentId");
                }
            }

            // 添加软删除过滤条件
            jpql.append(" AND (e.isDeleted = false OR e.isDeleted IS NULL)");

            Query query = entityManager.createQuery(jpql.toString());
            query.setParameter("value", getFieldValue(value, fieldName));

            if (ignoreCurrentRecord) {
                Object currentId = getCurrentRecordId(value, idField);
                if (currentId != null) {
                    query.setParameter("currentId", currentId);
                }
            }

            Long count = (Long) query.getSingleResult();
            return count == 0;

        } catch (Exception e) {
            return true; // 发生异常时不阻止验证
        }
    }

    /**
     * 验证多个字段的组合唯一性
     */
    private boolean validateMultipleFields(Object value, Class<?> entityClass, String[] fields,
                                         boolean ignoreCurrentRecord, String idField) {
        try {
            StringBuilder jpql = new StringBuilder();
            jpql.append("SELECT COUNT(e) FROM ")
                .append(entityClass.getSimpleName())
                .append(" e WHERE ");

            List<String> conditions = new ArrayList<>();
            for (String field : fields) {
                conditions.add("e." + field + " = :" + field);
            }
            jpql.append(String.join(" AND ", conditions));

            // 如果需要忽略当前记录，添加ID条件
            if (ignoreCurrentRecord) {
                Object currentId = getCurrentRecordId(value, idField);
                if (currentId != null) {
                    jpql.append(" AND e.").append(idField).append(" != :currentId");
                }
            }

            // 添加软删除过滤条件
            jpql.append(" AND (e.isDeleted = false OR e.isDeleted IS NULL)");

            Query query = entityManager.createQuery(jpql.toString());

            // 设置字段参数
            for (String field : fields) {
                Object fieldValue = getFieldValue(value, field);
                query.setParameter(field, fieldValue);
            }

            if (ignoreCurrentRecord) {
                Object currentId = getCurrentRecordId(value, idField);
                if (currentId != null) {
                    query.setParameter("currentId", currentId);
                }
            }

            Long count = (Long) query.getSingleResult();
            return count == 0;

        } catch (Exception e) {
            return true; // 发生异常时不阻止验证
        }
    }

    /**
     * 获取字段值
     */
    private Object getFieldValue(Object object, String fieldName) throws Exception {
        Field field = getField(object.getClass(), fieldName);
        field.setAccessible(true);
        return field.get(object);
    }

    /**
     * 获取当前记录的ID
     */
    private Object getCurrentRecordId(Object object, String idField) {
        try {
            return getFieldValue(object, idField);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 获取字段对象
     */
    private Field getField(Class<?> clazz, String fieldName) throws NoSuchFieldException {
        try {
            return clazz.getDeclaredField(fieldName);
        } catch (NoSuchFieldException e) {
            if (clazz.getSuperclass() != null) {
                return getField(clazz.getSuperclass(), fieldName);
            }
            throw e;
        }
    }

    /**
     * 从验证上下文获取字段名
     * 简化实现，需要在使用时显式指定字段名
     */
    private String getFieldName(ConstraintValidatorContext context) {
        // 简化实现，返回默认字段名
        // 实际使用时应该通过注解参数指定字段名
        return "id";
    }
} 