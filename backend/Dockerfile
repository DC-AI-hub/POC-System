# 使用官方 OpenJDK 8 作为基础镜像
FROM openjdk:8-jdk-alpine

# 设置工作目录
WORKDIR /app

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

# 复制 Maven 配置文件
COPY backed/pom.xml ./pom.xml

# 复制源代码
COPY backed/src ./src

# 设置 Maven 环境变量
ENV MAVEN_VERSION=3.8.6
ENV MAVEN_HOME=/opt/maven
ENV PATH=$PATH:$MAVEN_HOME/bin

# 安装 Maven
RUN wget -q https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz && \
    tar -xzf apache-maven-${MAVEN_VERSION}-bin.tar.gz && \
    mv apache-maven-${MAVEN_VERSION} /opt/maven && \
    rm apache-maven-${MAVEN_VERSION}-bin.tar.gz

# 创建 Maven 配置文件以使用阿里云镜像
RUN mkdir -p /root/.m2 && \
    echo '<?xml version="1.0" encoding="UTF-8"?><settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd"><mirrors><mirror><id>aliyun</id><name>Aliyun Maven</name><url>https://maven.aliyun.com/repository/public</url><mirrorOf>central</mirrorOf></mirror></mirrors></settings>' > /root/.m2/settings.xml

# 构建应用
RUN mvn clean package -DskipTests

# 创建日志目录
RUN mkdir -p /app/logs

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["java", "-jar", "target/backed-0.0.1-SNAPSHOT.jar"] 