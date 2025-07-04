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
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import javax.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class LogServiceImpl implements LogService {
    @Autowired
    private LogRepository logRepository;

    @Override
    public Page<Log> page(LogPageRequest request) {
        Specification<Log> spec = buildSpecification(request.getDescription(), request.getModule(), request.getIp(), request.getCreator(), request.getStatus(), request.getStartTime(), request.getEndTime());
        Pageable pageable = PageRequest.of(request.getPage() - 1, request.getSize(), Sort.by(Sort.Direction.DESC, "createTime"));
        return logRepository.findAll(spec, pageable);
    }

    @Override
    public Log get(Long id) {
        // TODO: 查询详情
        return logRepository.findById(id).orElse(null);
    }

    @Override
    public List<Log> exportLoginLog(LogExportRequest request) {
        // 假设登录日志为 module = "认证模块" 或 module = "登录"
        Specification<Log> spec = buildSpecification(request.getDescription(), request.getModule(), request.getIp(), request.getCreator(), request.getStatus(), request.getStartTime(), request.getEndTime());
        Specification<Log> loginSpec = spec.and((root, query, cb) -> cb.or(
                cb.equal(root.get("module"), "认证模块"),
                cb.equal(root.get("module"), "登录")
        ));
        Sort sort = Sort.by(Sort.Direction.DESC, "createTime");
        return logRepository.findAll(loginSpec, sort);
    }

    @Override
    public List<Log> exportOperationLog(LogExportRequest request) {
        // 假设操作日志为 module != "认证模块" && module != "登录"
        Specification<Log> spec = buildSpecification(request.getDescription(), request.getModule(), request.getIp(), request.getCreator(), request.getStatus(), request.getStartTime(), request.getEndTime());
        Specification<Log> opSpec = spec.and((root, query, cb) -> cb.and(
                cb.notEqual(root.get("module"), "认证模块"),
                cb.notEqual(root.get("module"), "登录")
        ));
        Sort sort = Sort.by(Sort.Direction.DESC, "createTime");
        return logRepository.findAll(opSpec, sort);
    }

    /**
     * 构建多条件动态查询
     */
    private Specification<Log> buildSpecification(String description, String module, String ip, String creator, String status, String startTime, String endTime) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(description)) {
                predicates.add(cb.like(root.get("description"), "%" + description + "%"));
            }
            if (StringUtils.hasText(module)) {
                predicates.add(cb.equal(root.get("module"), module));
            }
            if (StringUtils.hasText(ip)) {
                predicates.add(cb.equal(root.get("ip"), ip));
            }
            if (StringUtils.hasText(creator)) {
                predicates.add(cb.equal(root.get("creator"), creator));
            }
            if (StringUtils.hasText(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            if (StringUtils.hasText(startTime)) {
                try {
                    LocalDateTime start = LocalDateTime.parse(startTime + "T00:00:00");
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createTime"), start));
                } catch (Exception ignored) {}
            }
            if (StringUtils.hasText(endTime)) {
                try {
                    LocalDateTime end = LocalDateTime.parse(endTime + "T23:59:59");
                    predicates.add(cb.lessThanOrEqualTo(root.get("createTime"), end));
                } catch (Exception ignored) {}
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
} 