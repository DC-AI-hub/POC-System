package demo.backed.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

@ApiModel(description = "统一API响应格式")
public class ApiResponse<T> {
    
    @ApiModelProperty(value = "响应状态码", example = "200")
    private int code;
    
    @ApiModelProperty(value = "响应消息", example = "success")
    private String message;
    
    @ApiModelProperty(value = "响应数据")
    private T data;
    
    @ApiModelProperty(value = "时间戳", example = "1640995200000")
    private long timestamp;
    
    public ApiResponse() {
        this.timestamp = System.currentTimeMillis();
    }
    
    public ApiResponse(int code, String message) {
        this();
        this.code = code;
        this.message = message;
    }
    
    public ApiResponse(int code, String message, T data) {
        this(code, message);
        this.data = data;
    }
    
    public static <T> ApiResponse<T> success() {
        return new ApiResponse<>(200, "success");
    }
    
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "success", data);
    }
    
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(200, message, data);
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(500, message);
    }
    
    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(code, message);
    }
    
    public static <T> ApiResponse<T> badRequest(String message) {
        return new ApiResponse<>(400, message);
    }
    
    public static <T> ApiResponse<T> unauthorized(String message) {
        return new ApiResponse<>(401, message);
    }
    
    public static <T> ApiResponse<T> forbidden(String message) {
        return new ApiResponse<>(403, message);
    }
    
    public static <T> ApiResponse<T> notFound(String message) {
        return new ApiResponse<>(404, message);
    }
    
    // Getter 和 Setter
    public int getCode() {
        return code;
    }
    
    public void setCode(int code) {
        this.code = code;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public T getData() {
        return data;
    }
    
    public void setData(T data) {
        this.data = data;
    }
    
    public long getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
} 