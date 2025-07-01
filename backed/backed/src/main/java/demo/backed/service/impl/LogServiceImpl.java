package demo.backed.service.impl;

import demo.backed.dto.LogPageRequest;
import demo.backed.dto.LogExportRequest;
import demo.backed.entity.Log;
import demo.backed.repository.LogRepository;
import demo.backed.service.LogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class LogServiceImpl implements LogService {
    @Autowired
    private LogRepository logRepository;

    @Override
    public Page<Log> page(LogPageRequest request) {
        // TODO: 实现多条件分页查询
        return new PageImpl<>(Collections.emptyList(), PageRequest.of(request.getPage() - 1, request.getSize()), 0);
    }

    @Override
    public Log get(Long id) {
        // TODO: 查询详情
        return logRepository.findById(id).orElse(null);
    }

    @Override
    public List<Log> exportLoginLog(LogExportRequest request) {
        // TODO: 实现导出登录日志
        return Collections.emptyList();
    }

    @Override
    public List<Log> exportOperationLog(LogExportRequest request) {
        // TODO: 实现导出操作日志
        return Collections.emptyList();
    }
} 