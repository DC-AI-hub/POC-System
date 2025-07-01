package demo.backed.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_log")
public class Log {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 255)
    private String description;

    @Column(length = 100)
    private String module;

    @Column(length = 50)
    private String ip;

    @Column(length = 50)
    private String creator;

    @Column(length = 20)
    private String status;

    private LocalDateTime createTime;

    // getter & setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getModule() { return module; }
    public void setModule(String module) { this.module = module; }

    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }

    public String getCreator() { return creator; }
    public void setCreator(String creator) { this.creator = creator; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
} 