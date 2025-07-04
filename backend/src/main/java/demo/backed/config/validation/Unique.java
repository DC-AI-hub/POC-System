package demo.backed.config.validation;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

/**
 * 唯一性验证注解
 * 用于检查字段值在数据库中的唯一性
 */
@Target({ElementType.FIELD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {UniqueValidator.class})
@Documented
public @interface Unique {

    /**
     * 错误消息
     */
    String message() default "该值已存在";

    /**
     * 实体类
     */
    Class<?> entity();

    /**
     * 需要检查的字段名
     */
    String[] fields() default {};

    /**
     * 验证分组
     */
    Class<?>[] groups() default {};

    /**
     * 负载
     */
    Class<? extends Payload>[] payload() default {};

    /**
     * 是否忽略当前记录（用于更新时忽略自身）
     */
    boolean ignoreCurrentRecord() default true;

    /**
     * 当前记录ID字段名（用于更新时获取当前记录ID）
     */
    String idField() default "id";

    /**
     * 多个Unique注解
     */
    @Target({ElementType.FIELD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @interface List {
        Unique[] value();
    }
} 