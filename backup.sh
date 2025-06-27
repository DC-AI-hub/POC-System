#!/bin/bash

# 港交所POC系统备份脚本
# 作者: 系统管理员
# 创建时间: $(date +%Y-%m-%d)

set -e

# 配置变量
BACKUP_DIR="/opt/hkex-poc/backups"
PROJECT_DIR="/opt/hkex-poc"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="hkex-poc-backup-${DATE}"
RETENTION_DAYS=7

# 数据库配置
DB_CONTAINER="hkex-poc-db"
DB_NAME="hkex_poc"
DB_USER="hkex_user"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${BACKUP_DIR}/backup.log"
}

# 创建备份目录
mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}"

log "开始备份港交所POC系统..."

# 1. 备份数据库
log "备份数据库..."
docker exec ${DB_CONTAINER} pg_dump -U ${DB_USER} -d ${DB_NAME} > "${BACKUP_DIR}/${BACKUP_NAME}/database.sql"

# 2. 备份应用代码
log "备份应用代码..."
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}/app-code.tar.gz" -C "${PROJECT_DIR}" app/ --exclude=node_modules --exclude=.next

# 3. 备份配置文件
log "备份配置文件..."
cp -r "${PROJECT_DIR}/nginx" "${BACKUP_DIR}/${BACKUP_NAME}/"
cp "${PROJECT_DIR}/docker-compose.yml" "${BACKUP_DIR}/${BACKUP_NAME}/"
cp "${PROJECT_DIR}/app/fronted/.env.local" "${BACKUP_DIR}/${BACKUP_NAME}/" 2>/dev/null || log "警告: .env.local 文件不存在"

# 4. 备份上传文件
log "备份上传文件..."
if [ -d "${PROJECT_DIR}/uploads" ]; then
    tar -czf "${BACKUP_DIR}/${BACKUP_NAME}/uploads.tar.gz" -C "${PROJECT_DIR}" uploads/
else
    log "警告: uploads 目录不存在"
fi

# 5. 备份SSL证书
log "备份SSL证书..."
if [ -d "${PROJECT_DIR}/ssl" ]; then
    cp -r "${PROJECT_DIR}/ssl" "${BACKUP_DIR}/${BACKUP_NAME}/"
else
    log "警告: ssl 目录不存在"
fi

# 6. 备份Docker数据卷
log "备份Docker数据卷..."
docker run --rm -v hkex-poc_postgres_data:/data -v "${BACKUP_DIR}/${BACKUP_NAME}":/backup alpine tar czf /backup/postgres_data.tar.gz -C /data .
docker run --rm -v hkex-poc_redis_data:/data -v "${BACKUP_DIR}/${BACKUP_NAME}":/backup alpine tar czf /backup/redis_data.tar.gz -C /data .

# 7. 创建系统信息快照
log "创建系统信息快照..."
{
    echo "备份时间: $(date)"
    echo "系统信息: $(uname -a)"
    echo "Docker版本: $(docker --version)"
    echo "Docker Compose版本: $(docker-compose --version)"
    echo "运行中的容器:"
    docker ps
    echo ""
    echo "Docker镜像:"
    docker images
    echo ""
    echo "系统资源使用:"
    df -h
    free -h
} > "${BACKUP_DIR}/${BACKUP_NAME}/system_info.txt"

# 8. 压缩整个备份
log "压缩备份文件..."
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}/"
rm -rf "${BACKUP_NAME}/"

# 9. 清理旧备份
log "清理${RETENTION_DAYS}天前的备份..."
find "${BACKUP_DIR}" -name "hkex-poc-backup-*.tar.gz" -mtime +${RETENTION_DAYS} -delete

# 10. 验证备份
BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)
log "备份完成! 文件: ${BACKUP_NAME}.tar.gz, 大小: ${BACKUP_SIZE}"

# 11. 发送通知 (可选)
if command -v mail &> /dev/null; then
    echo "港交所POC系统备份完成 - ${DATE}" | mail -s "系统备份完成" admin@company.com
fi

log "备份脚本执行完成" 