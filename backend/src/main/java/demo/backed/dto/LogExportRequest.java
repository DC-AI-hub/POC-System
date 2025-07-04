package demo.backed.dto;

import lombok.Data;

@Data
public class LogExportRequest {
    private String description;
    private String module;
    private String ip;
    private String creator;
    private String status;
    private String startTime;
    private String endTime;
    private String sort = "createTime desc";
} 