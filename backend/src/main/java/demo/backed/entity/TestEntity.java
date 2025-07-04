package demo.backed.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_test_connection")
public class TestEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "test_name", nullable = false, length = 100)
    private String testName;
    
    @Column(name = "test_message", length = 500)
    private String testMessage;
    
    @Column(name = "created_time")
    private LocalDateTime createdTime;
    
    // 构造函数
    public TestEntity() {}
    
    public TestEntity(String testName, String testMessage) {
        this.testName = testName;
        this.testMessage = testMessage;
        this.createdTime = LocalDateTime.now();
    }
    
    // Getter 和 Setter
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTestName() {
        return testName;
    }
    
    public void setTestName(String testName) {
        this.testName = testName;
    }
    
    public String getTestMessage() {
        return testMessage;
    }
    
    public void setTestMessage(String testMessage) {
        this.testMessage = testMessage;
    }
    
    public LocalDateTime getCreatedTime() {
        return createdTime;
    }
    
    public void setCreatedTime(LocalDateTime createdTime) {
        this.createdTime = createdTime;
    }
    
    @PrePersist
    protected void onCreate() {
        this.createdTime = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "TestEntity{" +
                "id=" + id +
                ", testName='" + testName + '\'' +
                ", testMessage='" + testMessage + '\'' +
                ", createdTime=" + createdTime +
                '}';
    }
} 