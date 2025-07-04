package demo.backed.service;

import demo.backed.dto.LogPageRequest;
import demo.backed.dto.LogExportRequest;
import demo.backed.entity.Log;
import org.springframework.data.domain.Page;
import java.util.List;

public interface LogService {
    Page<Log> page(LogPageRequest request);
    Log get(Long id);
    List<Log> exportLoginLog(LogExportRequest request);
    List<Log> exportOperationLog(LogExportRequest request);
} 