package demo.backed.config;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {
    
    // JWT密钥 - 生产环境应该从配置文件读取
    private static final String SECRET = "hkex_poc_secret_key_2024_very_long_secret_for_jwt_token_generation_and_validation";
    
    // Token有效期 - 3小时（10800秒）
    @Value("${jwt.expiration:10800}")
    private Long expiration;
    
    // Refresh Token有效期 - 7天
    @Value("${jwt.refresh-expiration:604800}")
    private Long refreshExpiration;
    
    /**
     * 从Token中提取用户名（邮箱）
     */
    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }
    
    /**
     * 从Token中提取过期时间
     */
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }
    
    /**
     * 从Token中提取用户ID
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return Long.valueOf(claims.get("userId").toString());
    }
    
    /**
     * 从Token中提取用户名称
     */
    public String getUserNameFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return (String) claims.get("userName");
    }
    
    /**
     * 从Token中提取部门信息
     */
    public String getDepartmentFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return (String) claims.get("department");
    }
    
    /**
     * 从Token中提取用户角色
     */
    public String getUserTypeFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return (String) claims.get("userType");
    }
    
    /**
     * 从Token中提取指定声明
     */
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }
    
    /**
     * 从Token中提取所有声明
     */
    private Claims getAllClaimsFromToken(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(SECRET)
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            throw new RuntimeException("Token已过期", e);
        } catch (UnsupportedJwtException e) {
            throw new RuntimeException("不支持的Token格式", e);
        } catch (MalformedJwtException e) {
            throw new RuntimeException("Token格式错误", e);
        } catch (SignatureException e) {
            throw new RuntimeException("Token签名验证失败", e);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Token参数非法", e);
        }
    }
    
    /**
     * 检查Token是否过期
     */
    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }
    
    /**
     * 生成访问Token
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername(), expiration);
    }
    
    /**
     * 生成访问Token（包含用户详细信息）
     */
    public String generateToken(String email, Long userId, String userName, String department, String userType) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("userName", userName);
        claims.put("department", department);
        claims.put("userType", userType);
        claims.put("tokenType", "access");
        
        return createToken(claims, email, expiration);
    }
    
    /**
     * 生成刷新Token
     */
    public String generateRefreshToken(String email, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("tokenType", "refresh");
        
        return createToken(claims, email, refreshExpiration);
    }
    
    /**
     * 创建Token
     */
    private String createToken(Map<String, Object> claims, String subject, Long expiration) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration * 1000))
                .signWith(SignatureAlgorithm.HS512, SECRET)
                .compact();
    }
    
    /**
     * 验证Token
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = getUsernameFromToken(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * 验证Token（不需要UserDetails）
     */
    public Boolean validateToken(String token) {
        try {
            getAllClaimsFromToken(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * 检查Token是否需要刷新（过期前30分钟）
     */
    public Boolean shouldRefreshToken(String token) {
        try {
            Date expiration = getExpirationDateFromToken(token);
            Date now = new Date();
            // 如果Token在30分钟内过期，返回true
            long timeToExpire = expiration.getTime() - now.getTime();
            return timeToExpire <= 30 * 60 * 1000; // 30分钟 = 30 * 60 * 1000毫秒
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * 刷新Token
     */
    public String refreshToken(String refreshToken) {
        try {
            Claims claims = getAllClaimsFromToken(refreshToken);
            String tokenType = (String) claims.get("tokenType");
            
            if (!"refresh".equals(tokenType)) {
                throw new RuntimeException("无效的刷新Token");
            }
            
            String email = claims.getSubject();
            Long userId = Long.valueOf(claims.get("userId").toString());
            
            // 重新生成访问Token（这里需要从数据库获取最新的用户信息）
            Map<String, Object> newClaims = new HashMap<>();
            newClaims.put("userId", userId);
            newClaims.put("tokenType", "access");
            
            return createToken(newClaims, email, expiration);
        } catch (Exception e) {
            throw new RuntimeException("刷新Token失败", e);
        }
    }
    
    /**
     * 解析Token获取用户信息（用于调试）
     */
    public Map<String, Object> parseTokenInfo(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            Map<String, Object> info = new HashMap<>();
            info.put("subject", claims.getSubject());
            info.put("issuedAt", claims.getIssuedAt());
            info.put("expiration", claims.getExpiration());
            info.put("userId", claims.get("userId"));
            info.put("userName", claims.get("userName"));
            info.put("department", claims.get("department"));
            info.put("userType", claims.get("userType"));
            info.put("tokenType", claims.get("tokenType"));
            return info;
        } catch (Exception e) {
            throw new RuntimeException("解析Token失败", e);
        }
    }
    
    /**
     * 获取Token过期时间（秒）
     */
    public Long getExpiration() {
        return expiration;
    }
} 