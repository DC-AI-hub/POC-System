package demo.backed.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

@ApiModel(description = "登录响应")
public class LoginResponse {
    
    @ApiModelProperty(value = "访问令牌", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;
    
    @ApiModelProperty(value = "刷新令牌", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String refreshToken;
    
    @ApiModelProperty(value = "令牌类型", example = "Bearer")
    private String tokenType = "Bearer";
    
    @ApiModelProperty(value = "过期时间（秒）", example = "10800")
    private Long expiresIn;
    
    @ApiModelProperty(value = "用户信息")
    private UserDTO userInfo;
    
    public LoginResponse() {}
    
    public LoginResponse(String token, Long expiresIn, UserDTO userInfo) {
        this.token = token;
        this.expiresIn = expiresIn;
        this.userInfo = userInfo;
    }
    
    public LoginResponse(String token, String refreshToken, Long expiresIn, UserDTO userInfo) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.userInfo = userInfo;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    public String getTokenType() {
        return tokenType;
    }
    
    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }
    
    public Long getExpiresIn() {
        return expiresIn;
    }
    
    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }
    
    public UserDTO getUserInfo() {
        return userInfo;
    }
    
    public void setUserInfo(UserDTO userInfo) {
        this.userInfo = userInfo;
    }
} 