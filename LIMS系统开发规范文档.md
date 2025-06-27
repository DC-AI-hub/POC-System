# LIMS系统开发规范文档

## 📋 目录
- [项目架构](#项目架构)
- [开发规范](#开发规范)
- [编码规范](#编码规范)
- [前端开发规范](#前端开发规范)
- [数据库操作规范](#数据库操作规范)
- [常见问题与解决方案](#常见问题与解决方案)
- [最佳实践](#最佳实践)

---

## 🏗️ 项目架构

### 标准模块结构
```
模块名/
├── bean/                    # 数据实体层
├── controller/              # 页面控制器层 (@Controller)
├── resource/                # REST API层 (@RestController)
├── service/                 # 业务逻辑层
├── dao/                     # 数据访问层
├── mapper/                  # MyBatis映射器
│   └── conf/               # 多数据库支持
└── helper/                  # 工具类
```

### 分层职责

| 层次 | 注解 | 职责 | URL映射 |
|-----|------|------|---------|
| **Controller** | `@Controller` | 返回前端页面路径 | `/secure/.../page` |
| **Resource** | `@RestController` | 处理REST API请求 | `/secure/...` |
| **Service** | `@Service` | 业务逻辑处理 | - |
| **Dao** | `@Repository` | 数据访问 | - |
| **Mapper** | `@GikamBean` | SQL映射 | - |

---

## 📝 开发规范

### 必用注解
```java
// Bean类
@Table("T_TABLE_NAME")
@GikamBean
public class XxxBean extends AbstractInsertable<String> implements Insertable<String> {
    @Id
    private String id;
    
    // 只有日期字段使用@JSONField
    @JSONField(format = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateField;
    
    @Transient
    private String transientField;
}

// Service层
@Service
@GikamBean
@Transactional
public class XxxServiceImpl implements XxxService {
    @Autowired
    private XxxDao xxxDao;
    
    @Override
    public XxxDao getDao() {
        return xxxDao;
    }
}

// Resource层
@LogModule("模块名称")
@RestController
@GikamBean
public class XxxResourceImpl implements XxxResource {
    @Log(value = "操作描述", type = LogType.INSERT)
    @Override
    public void someAction(RestJsonWrapperBean wrapper) {
        getService().someAction(wrapper);
    }
}
```

### 继承关系规范
```java
// 基础功能Bean
public class XxxBean extends AbstractInsertable<String> implements Insertable<String>

// 启用停用功能Bean
public class XxxBean extends AbstractInsertable<String> 
    implements Insertable<String>, Activatable<String>

// 基础Service
public interface XxxService extends GenericService<XxxBean, String>

// 启用停用功能Service
public interface XxxService extends 
    GenericService<XxxBean, String>,
    GenericActivatableService<XxxBean, String>

// 基础Resource
public interface XxxResource extends GenericResource<XxxService, XxxBean, String>

// 启用停用功能Resource
public interface XxxResource extends 
    GenericResource<XxxService, XxxBean, String>,
    GenericActivatableResource<XxxService, XxxBean, String>
```

### 常用工具类
```java
// 日志工具
import org.apache.logging.log4j.Logger;
import com.sunwayworld.lims4.framework.utils.LimsLogUtils;

protected final static Logger logger = LimsLogUtils.getLogger(XxxClass.class);

// 上下文工具
CoreUserBean currentUser = LimsLocalContextHelper.getLoginUser();
String id = LimsApplicationContextHelper.getNextStringIdentity();

// 字符串工具
if (LimsStringUtils.isNotEmpty(str)) {
    // 处理逻辑
}

// 请求参数解析
String value = wrapper.getFilterValue("paramName");
List<String> ids = wrapper.parseId(String.class);
```

---

## 💻 编码规范

### Bean类字段注解规范
- **@JSONField使用原则**: 只有日期字段使用`@JSONField(format = "yyyy-MM-dd HH:mm:ss")`进行格式化
- **字段映射**: 普通字段通过驼峰命名自动映射到数据库字段，无需@JSONField注解
- **扩展字段**: 数据库存在但Bean无对应字段时，使用`setExt$Item("字段名", 值)`设置

```java
// ✅ 正确的字段注解
@JSONField(format = "yyyy-MM-dd HH:mm:ss")
@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
private LocalDateTime createdTime;

// ✅ 正确的扩展字段设置
bean.setExt$Item("customField", value);

// ❌ 错误的字段注解
@JSONField(name = "FIELD_NAME")
private String normalField; // 普通字段无需name映射
```

### 包导入规范
- **Logger导入**: `import org.apache.logging.log4j.Logger;`
- **SearchFilter导入**: `import com.sunwayworld.framework.mybatis.mapper.SearchFilter;`
- **CoreUserBean导入**: `import com.sunwayworld.module.mdm.user.bean.CoreUserBean;`
- **Activatable导入**: `import com.sunwayworld.framework.support.domain.Activatable;`

⚠️ **注意**: 不要自己捏造不存在的包名，必须参考其他地方的正确导入

### Service层实现规范
- **完整性**: Service接口中定义的方法必须在实现类中具体实现
- **异常处理**: 实现的方法应包含适当的异常处理和日志记录
- **事务管理**: 数据操作方法应添加`@Transactional`注解
- **审计注解**: 重要操作添加`@AuditTrailEntry`审计注解

```java
// ✅ 正确的Service方法实现
@Override
@Transactional
@AuditTrailEntry(AuditTrailType.INSERT)
public String insertData(RestJsonWrapperBean wrapper) {
    try {
        List<Bean> dataList = wrapper.parse(Bean.class);
        
        CoreUserBean currentUser = LimsLocalContextHelper.getLoginUser();
        dataList.forEach(item -> {
            item.setId(LimsApplicationContextHelper.getNextStringIdentity());
            item.setCreatedTime(LocalDateTime.now());
            if (currentUser != null) {
                item.setCreatedById(currentUser.getId());
                item.setCreatedByName(currentUser.getUserName());
            }
        });
        
        this.getDao().insert(dataList);
        logger.info("数据插入成功，数量：{}", dataList.size());
        
        return dataList.get(0).getId();
    } catch (Exception e) {
        logger.error("数据插入失败", e);
        throw new RuntimeException("数据插入失败：" + e.getMessage(), e);
    }
}
```

---

## 🌐 前端开发规范

### 文件结构
```
static/project/module/business/模块名/
├── 模块名.js                      # 主要业务逻辑和公共方法
├── 模块名-edit-list.js            # 编制列表页专用逻辑
├── 模块名-search-list.js          # 搜索列表页专用逻辑
└── 模块名-detail.js               # 详情页面专用逻辑

templates/project/module/business/模块名/
├── 模块名-edit-list.html
├── 模块名-search-list.html
└── 模块名-detail.html
```

### 模态框操作规范
```javascript
// ✅ 正确的模态框创建
Gikam.create('modal', {
    title: '标题',
    url: '/path/to/page',
    width: '400',
    height: '200',
    param: {},
    onAfterClose: function(data) {
        if (data) {
            this.getGrid().refresh(); // 有数据返回时刷新
        }
    }
});

// ✅ 正确的模态框关闭和错误处理
var modal = Gikam.getLastModal();
modal.window.showMask();
Gikam.postText(url, data).done(function(r) {
    modal.window.closeMask();
    Gikam.toast('操作成功');
    modal.close(true); // 传递true触发父页面刷新
}).fail(function(error) {
    modal.window.closeMask();
    Gikam.alert('操作失败');
});
```

### Grid操作规范
```javascript
// ✅ 正确的选中数据获取
Gikam.getGridSelected(grid, '请选择数据', function(rows) {
    // 处理选中的数据
});

// ✅ 正确的启用停用按钮
activateEvent: function() {
    var _this = this;
    Gikam.getGridSelected(this.getGrid(), '请选择需要启用的数据', function(rows) {
        if (rows.length > 0) {
            _this.getGrid().activateRows(_this.baseUrl + '/action/activate');
        }
    });
}
```

### 通知方法规范
- **成功提示**: `Gikam.toast('成功消息')` - 绿色背景，自动消失
- **错误提示**: `Gikam.alert('错误消息')` - 弹出确认框，需要用户手动关闭

---

## 🗄️ 数据库操作规范

### 国抽建表脚本标准规范

#### 建表脚本组织结构
```sql
-- =============================================================================
-- 脚本标题和说明
-- 创建日期：YYYY-MM-DD
-- 功能说明：详细说明脚本用途和功能
-- 版本说明：版本变更记录和重要说明
-- =============================================================================

-- 1. 主要业务表（按依赖关系排序）
-- 2. 关联辅助表
-- 3. 对照映射表  
-- 4. 配置管理表
-- 5. 字典数据插入
-- 6. 权限配置
-- 7. 索引创建
-- 8. 事务提交
```

#### 表结构设计规范
```sql
-- ✅ 正确的表结构定义
CREATE TABLE T_LIMS_GC_[MODULE_NAME] (
    -- 主键字段（必须）
    id VARCHAR2(32) NOT NULL,
    
    -- ===== 业务字段分组 =====
    -- 基本信息字段
    field1 VARCHAR2(200),                    -- 字段说明
    field2 VARCHAR2(50),                     -- 字段说明
    
    -- 关联信息字段  
    parentId VARCHAR2(32),                   -- 父级ID
    relatedField VARCHAR2(100),              -- 关联字段
    
    -- ===== 系统管理字段（标准） =====
    activatedFlag VARCHAR2(2) DEFAULT '1',   -- 启用状态(0停用,1启用)
    createdById VARCHAR2(32),                -- 创建人ID
    createdByName VARCHAR2(60),              -- 创建人姓名
    createdTime DATE,                        -- 创建时间
    lastUpdatedById VARCHAR2(32),            -- 最后更新人ID
    lastUpdatedByName VARCHAR2(60),          -- 最后更新人姓名
    lastUpdatedTime DATE,                    -- 最后更新时间
    
    -- 主键约束
    CONSTRAINT PK_T_LIMS_GC_[MODULE_NAME] PRIMARY KEY (id)
);
```

#### 字段注释规范
```sql
-- ✅ 完整的字段注释
COMMENT ON TABLE T_LIMS_GC_[MODULE_NAME] IS '表功能说明';
COMMENT ON COLUMN T_LIMS_GC_[MODULE_NAME].id IS '主键';
COMMENT ON COLUMN T_LIMS_GC_[MODULE_NAME].field1 IS '字段功能说明';
COMMENT ON COLUMN T_LIMS_GC_[MODULE_NAME].activatedFlag IS '启用状态(0停用,1启用)';
```

#### 索引创建规范
```sql
-- ✅ 标准索引命名和创建
-- 主要查询字段索引
CREATE INDEX IDX_[TABLE_NAME]_[FIELD_NAME] ON T_LIMS_GC_[MODULE_NAME](field_name);
-- 外键关联索引
CREATE INDEX IDX_[TABLE_NAME]_PARENT_ID ON T_LIMS_GC_[MODULE_NAME](parent_id);
-- 状态查询索引
CREATE INDEX IDX_[TABLE_NAME]_ACTIVATED_FLAG ON T_LIMS_GC_[MODULE_NAME](activatedFlag);
```

#### 国抽模块表设计原则
1. **表名规范**: `T_LIMS_GC_[功能模块名]`，如`T_LIMS_GC_CLEARANCEFORM`
2. **字段分组**: 按业务逻辑分组，用注释分隔不同功能区域
3. **字段类型**: 遵循业务需求，VARCHAR2长度根据实际需要设定
4. **系统字段**: 所有表必须包含标准的系统管理字段
5. **索引策略**: 为主要查询字段、外键字段、状态字段创建索引
6. **注释完整性**: 表和字段都必须有完整的功能说明注释

#### 国抽接口字段映射原则
```sql
-- ✅ 基于API03查询接口设计表结构
-- API03返回字段 → 数据库表字段
samplingSheetNo → samplingSheetNo           -- 直接映射
spdata_3 → spdata3                         -- 下划线转驼峰
testReason[0].spdata_3 → spdata3           -- 数组展开为单独字段

-- ❌ 错误：基于API04录入接口设计表（API04用于DTO设计）
```

#### 数据完整性保证
```sql
-- ✅ 外键约束（可选，根据业务需要）
CONSTRAINT FK_[TABLE_NAME]_PARENT FOREIGN KEY (parent_id) 
    REFERENCES T_LIMS_GC_PARENT_TABLE (id) ON DELETE CASCADE;

-- ✅ 检查约束
CONSTRAINT CK_[TABLE_NAME]_ACTIVATED_FLAG 
    CHECK (activatedFlag IN ('0', '1'));
```

### DAO层操作规范
```java
// ✅ 正确的update操作（含ID验证和异常处理）
try {
    if (LimsStringUtils.isNotEmpty(bean.getId())) {
        dao.update(bean, "field1", "field2", "field3");
        logger.debug("更新成功：{}", bean.getId());
    } else {
        logger.warn("记录ID为空，跳过更新");
    }
} catch (Exception e) {
    logger.error("更新失败：ID={}", bean.getId(), e);
    throw new RuntimeException("更新失败：" + e.getMessage(), e);
}

// ✅ 正确的批量更新（含兜底策略）
try {
    dao.update(beanList, "field1", "field2");
} catch (Exception e) {
    logger.error("批量更新失败，尝试逐个更新", e);
    for (Bean item : beanList) {
        try {
            if (LimsStringUtils.isNotEmpty(item.getId())) {
                dao.update(item, "field1", "field2");
            }
        } catch (Exception ex) {
            logger.error("单个更新失败：ID={}", item.getId(), ex);
        }
    }
}
```

### Service层查询规范
```java
// ✅ 正确的Service层查询
List<Bean> list = this.selectListByFilter(
    SearchFilter.instance()
        .match("field1", value1).filter(MatchPattern.EQ)
        .match("field2", value2).filter(MatchPattern.EQ)
);

// ❌ 错误：DAO层没有selectListByFilter方法
// getDao().selectListByFilter(...);
```

---

## ⚠️ 常见问题与解决方案

### 国抽接口表结构设计问题
**问题**: 按照错误的接口结构设计数据库表  
**解决**: 严格按照接口文档的返回结构设计表

```sql
-- ✅ 正确：基于API03返回的itemInfo结构设计表
-- API03返回示例：
-- "itemInfo": [
--   {
--     "item": "项目名称",
--     "itemType": "检验项目", 
--     "testReason": [{"spdata_3": "检验依据", "sm": "简称"}],
--     "verifyReason": [{"verifyStandard": "判定依据"}]
--   }
-- ]

CREATE TABLE T_LIMS_GC_TEST_DETECTION (
    item VARCHAR2(255),                    -- 对应API03.item
    spdata_3 VARCHAR2(500),               -- 对应API03.testReason.spdata_3
    verifyStandard VARCHAR2(500)          -- 对应API03.verifyReason.verifyStandard
);

-- ❌ 错误：基于API04录入结构或自己想象设计表
-- API04是数据录入接口，需要DTO而不是建表
```

**重要原则**：
1. **查询接口（API03）** → 用于建表和Entity Bean设计
2. **录入接口（API04）** → 用于DTO设计，不需要建表
3. **严格对应字段名称**：API03返回什么字段，表就设计什么字段
4. **数组字段处理**：testReason和verifyReason是数组，但通常只有一个元素，可以展开为单独字段
5. **完整处理数组数据**：如果API返回数组，必须处理所有元素，不能只取第一个

```java
// ❌ 错误：只处理数组的第一个元素，会丢失数据
JSONArray testReasonArray = itemObject.getJSONArray("testReason");
if (testReasonArray != null && testReasonArray.size() > 0) {
    JSONObject testReason = testReasonArray.getJSONObject(0); // 只取第一个
    // 处理第一个元素，其他元素丢失
}

// ✅ 正确：为每个数组元素创建单独的记录
JSONArray testReasonArray = itemObject.getJSONArray("testReason");
if (testReasonArray != null) {
    for (int j = 0; j < testReasonArray.size(); j++) {
        JSONObject testReason = testReasonArray.getJSONObject(j);
        // 为每个元素创建一条记录，保证数据完整性
    }
}
```

### 国抽数据同步到LIMS字段映射规范

#### 字段映射原则
```java
// ✅ 正确的字段映射实现
private void convertGcClearanceformBeanToClearanceformBean(
    LimsGcClearanceformBean gcBean, 
    LimsClearanceformBean limsBean, 
    Map<String, String> paramMap) {
    
    // 严格按照LIMS抽样单字段说明文档进行映射
    limsBean.setMatName(gcBean.getSampleName()); // MATNAME -> sampleName
    limsBean.setBatchNo(gcBean.getSampleBatchNumber()); // BATCHNO -> sampleBatchNumber
    limsBean.setSampleMedicineType(gcBean.getSpecificationAndModel()); // SAMPLEMEDICINETYPE -> specificationAndModel
    
    // 固定值设置
    limsBean.setIsSampleReject("否"); // 是否退样固定为否
    limsBean.setType("农产品"); // 领域固定为农产品
    limsBean.setCollectPackageInfo("正常"); // 封样状态固定为正常
    limsBean.setNeedMakeSample("是"); // 是否已制样固定为是
    
    // 特殊解析：从备注中提取抽样编号
    String fromFolderNo = parseFromFolderNoFromRemarks(gcBean.getRemarks());
    if (LimsStringUtils.isNotEmpty(fromFolderNo)) {
        limsBean.setFromFolderNo(fromFolderNo);
    }
}

// ✅ 正确的备注解析实现
private String parseFromFolderNoFromRemarks(String remarks) {
    if (LimsStringUtils.isEmpty(remarks)) {
        return null;
    }
    
    int index = remarks.indexOf("抽样编号");
    if (index >= 0) {
        String substring = remarks.substring(index + 4);
        // 匹配首个字母加数字的组合
        Pattern pattern = Pattern.compile("([A-Za-z]+\\d+)");
        Matcher matcher = pattern.matcher(substring);
        if (matcher.find()) {
            return matcher.group(1);
        }
    }
    
    return null;
}
```

#### 同步时固定值设置规范
```java
// ✅ 正确的固定值设置
limsBean.setIsSampleReject("否"); // 是否退样：否
limsBean.setReturnedQuantity(null); // 退样数量：空
limsBean.setReturnedPerson(null); // 退样人：空
limsBean.setAcceptDate(LocalDateTime.now()); // 收样品日期：同步时的当前时间
limsBean.setType("农产品"); // 领域：固定为农产品
limsBean.setCollectPackageInfo("正常"); // 封样状态：固定为正常
limsBean.setNeedMakeSample("是"); // 是否已制样：固定为是
limsBean.setOrgName(null); // 检测部门：先空着，逻辑复杂后续补充
limsBean.setInspectionCompletionDate(null); // 要求完成日期：先空着，等需求确认

// 业务类型从参数中获取
if (paramMap != null) {
    limsBean.setTestAimDetailedType(paramMap.get("reqTypNam")); // 检验类别：选择的业务大类
    limsBean.setReqSubTyp(paramMap.get("reqSubTyp")); // 业务类型：选择的业务小类
}
```

#### 数据标准化处理规范
```java
// ✅ 正确的数据标准化处理
private Long parseNumber(String numberStr) {
    if (LimsStringUtils.isEmpty(numberStr)) {
        return null;
    }
    try {
        return Long.parseLong(numberStr);
    } catch (NumberFormatException e) {
        logger.warn("数字解析失败: {}", numberStr);
        return null;
    }
}

private LocalDateTime parseDate(String dateStr) {
    if (LimsStringUtils.isEmpty(dateStr)) {
        return null;
    }
    try {
        if (dateStr.length() > 10) {
            return LocalDateTime.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        } else {
            return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd")).atStartOfDay();
        }
    } catch (Exception e) {
        logger.warn("日期解析失败: {}", dateStr, e);
        return null;
    }
}
```

#### Bean字段与数据库字段不一致处理规范
```java
// ❌ 错误：直接调用Bean中不存在的字段setter方法
limsBean.setSamplingLink(value); // 编译错误：方法不存在
limsBean.setReturnedQuantity(value); // 编译错误：方法不存在

// ✅ 正确：使用扩展字段方式设置数据库字段
limsBean.setExt$Item("samplingLink", value); // 通过扩展字段设置
limsBean.setExt$Item("returnedQuantity", value); // 通过扩展字段设置

// ✅ 正确：只使用Bean中确实存在的字段
limsBean.setReqTypNam(value); // reqTypNam字段存在
// limsBean.setReqTypNamId(value); // reqTypNamId字段不存在，不要使用

// ✅ 正确：使用正确的时间字段
gcBean.setLastUpdatedTime(LocalDateTime.now()); // 使用存在的时间字段
// gcBean.setSyncLimsTime(LocalDateTime.now()); // syncLimsTime方法不存在
```

**重要原则**：
1. **字段存在性验证**：使用Bean字段前必须确认该字段在Bean类中确实存在
2. **扩展字段使用**：当数据库字段存在但Bean中无对应字段时，使用`setExt$Item()`方法
3. **字段命名一致性**：Bean字段名应与数据库字段名保持一致（驼峰命名转换）
4. **时间字段规范**：优先使用标准的时间字段如`lastUpdatedTime`，避免使用不存在的字段

### 包导入问题
**问题**: 使用了错误的包路径  
**解决**: 查阅现有代码，使用正确的包路径

```java
// ✅ 正确的包导入
import com.sunwayworld.framework.mybatis.mapper.SearchFilter;
import com.sunwayworld.module.mdm.user.bean.CoreUserBean;

// ❌ 错误的包导入
import com.sunwayworld.framework.data.filter.SearchFilter; // 不存在
import com.sunwayworld.lims4.module.main.bean.CoreUserBean; // 过时路径
```

### MyBatis映射文件问题
**问题**: `Invalid bound statement (not found)`  
**解决**:
1. 确认XML映射文件存在于正确路径
2. 检查namespace与Mapper接口完全匹配
3. 确认XML中定义了`selectByCondition`方法
4. 重启应用服务器

### Resource方法不支持问题
**问题**: `Request method 'XXX' not supported`  
**解决**:
1. 检查应用是否重启（新增Mapper需要重启）
2. 确认接口继承了正确的Generic接口
3. 避免重复实现框架已提供的方法

### 启用停用功能问题
**问题**: Bean缺少setActivatedFlag方法或启用停用按钮报404错误  
**解决**: 确保完整实现启用停用功能的三个层面

```java
// ✅ 1. Bean类正确实现
@Table("T_TABLE_NAME")
public class XxxBean extends AbstractInsertable<String> 
    implements Insertable<String>, Activatable<String> {
    
    private String activatedFlag; // 启用状态(1启用 0停用)
    private String activatedById; // 启用人ID
    private String activatedByName; // 启用人姓名
    
    @JSONField(format = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime activatedTime; // 启用时间
    
    // getter和setter方法...
}

// ✅ 2. Service接口正确继承
public interface XxxService extends 
    GenericService<XxxBean, String>,
    GenericActivatableService<XxxBean, String> {
}

// ✅ 3. Resource接口正确继承
public interface XxxResource extends 
    GenericResource<XxxService, XxxBean, String>,
    GenericActivatableResource<XxxService, XxxBean, String> {
}
```

⚠️ **重要**: 
- 三个层面必须全部正确实现，缺一不可
- 框架会自动提供`/action/activate`和`/action/deactivate`接口
- 不需要在Resource实现类中手动添加这些方法
- 如果遇到404错误，检查Resource接口是否继承了`GenericActivatableResource`

### 前端选择字段配置问题
**问题**: 使用了不存在的选择配置category  
**解决**: 使用系统中已存在的选择配置

```javascript
// ✅ 正确的检验项目选择配置
{
    field: 'itemLims',
    title: 'LIMS检验项目名称',
    type: 'choose',
    category: 'test', // 使用已存在的配置
    targetFields: [{
        itemLims: 'testNo',
        itemCode: 'testCode',
        itemLimsId: 'id'
    }],
    single: true
}

// ❌ 错误：使用不存在的配置
category: 'lims-tests' // 这个配置不存在
```

### 前端Service调用问题
**问题**: 前端调用Service时一直转圈  
**解决**: 使用正确的Service Bean名称，格式为`类名首字母小写+Impl`

```javascript
// ✅ 正确的Service名称
var wrapper = Gikam.getJsonWrapper({}, ['xxxServiceImpl', [formData]]);

// ❌ 错误的Service名称
var wrapper = Gikam.getJsonWrapper({}, ['xxxService', [formData]]);
```

### 前端参数传递与后端获取不匹配问题
**问题**: 前端传递了参数但后端获取到空值  
**原因**: 前端参数传递方式与后端获取方式不匹配
**解决**: 根据前端传参方式选择正确的后端获取方法

```javascript
// 前端传递方式1：作为普通参数传递
var data = {startDate: '2024-01-01', endDate: '2024-01-31'};
Gikam.postText(url, Gikam.getJsonWrapper(data));
```

```java
// 后端获取方式1：从普通参数中获取
String startDate = wrapper.getParamValue("startDate");     // ✅ 正确
String endDate = wrapper.getFilterValue("endDate");        // ❌ 错误，获取不到值
```

```javascript
// 前端传递方式2：作为过滤参数传递
var filter = {startDate: '2024-01-01'};
var data = [...];
Gikam.postText(url, Gikam.getJsonWrapper({}, filter, data));
```

```java
// 后端获取方式2：从过滤参数中获取
String startDate = wrapper.getFilterValue("startDate");    // ✅ 正确
String endDate = wrapper.getParamValue("endDate");         // ❌ 错误，获取不到值
```

⚠️ **重要**: 前端使用`Gikam.getJsonWrapper(data)`传递的参数，后端必须用`wrapper.getParamValue()`获取；使用`Gikam.getJsonWrapper({}, filter, data)`传递的过滤参数，后端必须用`wrapper.getFilterValue()`获取。

### Bean字段修改后使用代码不同步问题
**问题**: 修改了Bean类的字段定义，但使用Bean的Service、Helper等代码仍在使用旧字段名  
**解决**: 修改Bean字段后，必须同时修改所有使用该Bean的代码

```java
// ❌ 错误：Bean中删除了某个字段，但使用代码仍在调用
// 修改Bean后删除了setSamplingSheetNo方法
testDetection.setSamplingSheetNo(sampleNo); // 编译错误

// ✅ 正确：修改Bean字段后，同步修改所有使用代码
// 如果Bean中不需要该字段，使用代码中也要删除相关调用
// testDetection.setSamplingSheetNo(sampleNo); // 删除这行代码
```

**修复步骤**：
1. **全局搜索字段使用**：使用IDE全局搜索功能查找所有使用旧字段的地方
2. **逐一修改调用代码**：根据新的Bean结构修改所有调用代码
3. **检查SQL字段匹配**：确保数据库表字段名与Bean字段名一致
4. **验证编译通过**：确保所有修改后的代码能正常编译

**重要原则**：
- **Bean字段与数据库字段一致**：Bean的字段名应该与数据库表字段名保持一致（驼峰命名转换）
- **同步修改使用代码**：修改Bean后必须修改所有使用该Bean的Service、Helper、Resource等代码
- **API字段与Bean字段区分**：API接口中的字段名（如spdata_3）与Bean字段名（如spdata3）可能不同，需要正确映射

---

## 🎯 最佳实践

### Excel导入功能实现标准流程
```java
@Override
@Transactional
@AuditTrailEntry(value = AuditTrailType.INSERT)
public String importExcel(RestJsonWrapperBean wrapper) {
    // 1. 参数验证
    String templateId = wrapper.getParamValue("templateId");
    List<Long> fileIdList = wrapper.parseId(Long.class);
    
    if (LimsListUtils.isEmpty(fileIdList)) {
        throw new LimsTipBaseException("未获取到上传的导入文件数据！");
    }
    
    // 2. 文件验证
    CoreFileBean fileBean = coreFileService.selectById(fileIdList.get(0));
    File excelFile = LimsFileServerContextHelper.get(LimsPathUtils.getAbsolutePath(FileRepresentation.of(fileBean)));
    if (!LimsFileUtils.isExcelFile(excelFile)) {
        throw new LimsTipBaseException("该文件不是Excel文件，请重新上传！");
    }
    
    // 3. 模板验证
    List<LimsImportTemplateInfoBean> templateInfo = templateInfoService.selectListByFilter(
        SearchFilter.instance().match("templateId", templateId).filter(MatchPattern.EQ));
    if (LimsListUtils.isEmpty(templateInfo)) {
        throw new CheckedException("请先维护【" + templateId + "】模板类型的导入字段！");
    }
    
    // 4. 读取Excel数据
    List<Bean> dataList = templateService.readExcelDataToBeanList(
        excelFile.getPath(), 0, 1, templateInfo, Bean.class);
    
    // 5. 数据处理和验证
        CoreUserBean currentUser = LimsLocalContextHelper.getLoginUser();
    dataList.forEach(item -> {
        item.setId(LimsApplicationContextHelper.getNextStringIdentity());
        item.setCreatedTime(LocalDateTime.now());
        if (currentUser != null) {
            item.setCreatedById(currentUser.getId());
            item.setCreatedByName(currentUser.getUserName());
        }
        // 业务验证
        validateImportData(item);
    });
    
    // 6. 批量插入
    this.getDao().insert(dataList);
    logger.info("Excel导入完成，导入{}条数据", dataList.size());
    
    return dataList.stream().map(Bean::getId).collect(Collectors.toList()).toString();
}
```

### 前端详情页面标准实现
```javascript
// ✅ 推荐的简洁Form实现（避免框架自动GET请求）
moduleObject.detailPage = {
    init: function(param) {
        this.param = param;
        this.create();
    },

    create: function() {
        Gikam.create('layout', {
            renderTo: Gikam.getLastModal().window.$dom,
            center: {
                items: [this.getBtnToolbarParam(), this.getFormParam()]
            }
    });
},

    getFormParam: function() {
        return {
            type: 'form',
            id: 'detail-form',
            fields: this.getDetailFormFields()
            // ✅ 不指定url、dbTable、service等属性，避免框架自动GET请求
        };
    },

    confirmEvent: function() {
        if (this.getForm().validate()) {
            var formData = this.getForm().getData();
            var wrapper = Gikam.getJsonWrapper({}, ['serviceImpl', [formData]]);
            var modal = Gikam.getLastModal();
            
            modal.window.showMask();
            Gikam.postText(this.baseUrl, wrapper).done(function(r) {
                modal.window.closeMask();
                Gikam.toast('操作成功');
                modal.close(true); // 传递true触发父页面刷新
            }).fail(function(error) {
                modal.window.closeMask();
                Gikam.alert('操作失败');
            });
        }
    }
};
```

### 启用停用功能完整实现
```java
// 1. Bean类实现
@Table("T_TABLE_NAME")
public class XxxBean extends AbstractInsertable<String> 
    implements Insertable<String>, Activatable<String> {
    
    private String activatedFlag; // 启用状态(1启用 0停用)
    private String activatedById; // 启用人ID
    private String activatedByName; // 启用人姓名
    
    @JSONField(format = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime activatedTime; // 启用时间
    
    // getter和setter方法...
}

// 2. Service接口
public interface XxxService extends 
    GenericService<XxxBean, String>,
    GenericActivatableService<XxxBean, String> {
}

// 3. Resource接口
public interface XxxResource extends 
    GenericResource<XxxService, XxxBean, String>,
    GenericActivatableResource<XxxService, XxxBean, String> {
}

// 4. 前端启用停用按钮
{
    type: 'button',
    text: '启用',
    icon: 'enable',
    onClick: function() {
        _this.activateEvent();
    }
}

activateEvent: function() {
    var _this = this;
    Gikam.getGridSelected(this.getGrid(), '请选择需要启用的数据', function(rows) {
        if (rows.length > 0) {
            _this.getGrid().activateRows(_this.baseUrl + '/action/activate');
        }
    });
}
```

---

## 📚 核心原则

### 开发原则
1. **一致性**: 遵循统一的命名规范和代码风格
2. **可读性**: 代码清晰易懂，适当添加注释
3. **可维护性**: 合理的分层架构，低耦合高内聚
4. **健壮性**: 完善的异常处理和日志记录
5. **可扩展性**: 预留扩展接口，支持功能增强

### 质量保证
- **代码审查**: 提交前进行代码审查
- **单元测试**: 关键业务逻辑编写单元测试
- **集成测试**: 验证各模块间的协作
- **性能测试**: 确保系统性能满足要求

---

**文档版本**: v3.0  
**最后更新**: 2024年1月  
**维护人**: 开发团队