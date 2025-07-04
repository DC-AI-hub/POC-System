package demo.backed.dto;

import lombok.Data;

@Data
public class LogPageRequest {
    private String description;
    private String module;
    private String ip;
    private String creator;
    private String status;
    private String startTime;
    private String endTime;
    private int page = 1;
    private int size = 20;
} 