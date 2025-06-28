package demo.backed.config;

import demo.backed.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import javax.persistence.EntityNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    /**
     * 处理业务异常
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntimeException(RuntimeException e) {
        logger.error("业务异常: ", e);
        return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
    }
    
    /**
     * 处理实体不存在异常
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleEntityNotFoundException(EntityNotFoundException e) {
        logger.error("实体不存在: ", e);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.notFound(e.getMessage()));
    }
    
    /**
     * 处理数据完整性违反异常（如唯一约束）
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrityViolationException(DataIntegrityViolationException e) {
        logger.error("数据完整性违反: ", e);
        String message = "数据操作失败，可能存在重复数据或违反约束条件";
        if (e.getMessage().contains("duplicate key")) {
            message = "数据已存在，不能重复添加";
        }
        return ResponseEntity.badRequest().body(ApiResponse.badRequest(message));
    }
    
    /**
     * 处理参数验证异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(MethodArgumentNotValidException e) {
        logger.error("参数验证失败: ", e);
        StringBuilder errorMsg = new StringBuilder("参数验证失败: ");
        e.getBindingResult().getFieldErrors().forEach(error -> 
            errorMsg.append(error.getField()).append(" ").append(error.getDefaultMessage()).append("; ")
        );
        return ResponseEntity.badRequest().body(ApiResponse.badRequest(errorMsg.toString()));
    }
    
    /**
     * 处理参数类型不匹配异常
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException e) {
        logger.error("参数类型不匹配: ", e);
        String message = String.format("参数 '%s' 的值 '%s' 类型不正确", e.getName(), e.getValue());
        return ResponseEntity.badRequest().body(ApiResponse.badRequest(message));
    }
    
    /**
     * 处理其他未知异常
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneralException(Exception e) {
        logger.error("系统异常: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("系统内部错误，请联系管理员"));
    }
} 