package demo.backed.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        
        // 设置响应状态码为401
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        
        // 构建错误响应
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("code", 401);
        errorResponse.put("message", "认证失败，请重新登录");
        errorResponse.put("timestamp", System.currentTimeMillis());
        errorResponse.put("path", request.getRequestURI());
        
        // 根据不同的异常类型提供不同的错误信息
        String errorMessage = getErrorMessage(authException, request);
        errorResponse.put("error", errorMessage);
        
        // 将错误响应写入输出流
        ObjectMapper objectMapper = new ObjectMapper();
        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        
        response.getWriter().write(jsonResponse);
        response.getWriter().flush();
    }
    
    /**
     * 根据异常类型获取错误信息
     */
    private String getErrorMessage(AuthenticationException authException, HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return "缺少认证令牌，请在请求头中添加 Authorization: Bearer <token>";
        }
        
        // 检查是否是Token过期
        String errorMsg = authException.getMessage();
        if (errorMsg != null) {
            if (errorMsg.contains("expired") || errorMsg.contains("过期")) {
                return "认证令牌已过期，请重新登录";
            } else if (errorMsg.contains("malformed") || errorMsg.contains("格式")) {
                return "认证令牌格式错误";
            } else if (errorMsg.contains("signature") || errorMsg.contains("签名")) {
                return "认证令牌签名验证失败";
            }
        }
        
        return "认证失败，令牌无效";
    }
} 