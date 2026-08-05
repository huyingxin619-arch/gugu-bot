# Case设计问题修正清单

基于API文档逐条对照，共发现28个case有设计问题，分4类：

## 一、固定模版N+场景数组放错（12个）

**文档规则**："仅当total/accumulate/byday中出现对应指标ID时该场景的字段才需要传值"
即：NPlus/NPlus1（总览）→ 56须在total数组；NPlus2/NPlus3（累计）→ 56须在accumulate数组；NPlus4/NPlus5（按天）→ 56须在byday数组。

| Case编号 | 问题 | 修正方案 |
|---------|------|---------|
| ADM-FIX-CRT-047（累计） | 56只在total，但用NPlus2/NPlus3 | total去掉56，accumulate加56 |
| ADM-FIX-CRT-048（按天） | 56只在total，但用NPlus4/NPlus5 | total去掉56，byday加56 |
| ADM-FIX-CRT-049（全场景） | 56只在total，但用了全部6个字段 | total+accumulate+byday都加56 |
| ADM-FIX-CRT-057（累计） | 57只在total，但用reachN2/reachN3 | total去掉57，accumulate加57 |
| ADM-FIX-CRT-058（按天） | 57只在total，但用reachN4/reachN5 | total去掉57，byday加57 |
| ADM-FIX-CRT-059（全场景） | 57只在total，但用了全部6个字段 | total+accumulate+byday都加57 |
| TVM-CRT-040（累计） | 56只在total，但用NPlus2/NPlus3 | total去掉56，accumulate加56 |
| TVM-CRT-041（按天） | 56只在total，但用NPlus4/NPlus5 | total去掉56，byday加56 |
| TVM-CRT-042（全场景） | 56只在total，但用了全部6个字段 | total+accumulate+byday都加56 |
| TVM-CRT-050（累计） | 57只在total，但用reachN2/reachN3 | total去掉57，accumulate加57 |
| TVM-CRT-051（按天） | 57只在total，但用reachN4/reachN5 | total去掉57，byday加57 |
| TVM-CRT-052（全场景） | 57只在total，但用了全部6个字段 | total+accumulate+byday都加57 |

修正后指标ID列示例（ADM-FIX-CRT-047）：
- 修正前: total=[43,44,45,56]
- 修正后: accumulate=[43,44,45,56]

修正后指标ID列示例（ADM-FIX-CRT-049全场景）：
- 修正前: total=[43,44,45,56]
- 修正后: total=[43,44,45,56];accumulate=[43,44,45,56];byday=[43,44,45,56]

## 二、base/cap写反（5个）

**文档规则**：NPlus=base（下限），NPlus1=cap（上限），cap ≥ base

| Case编号 | 原值 | 修正值 |
|---------|------|--------|
| ADM-FIX-CRT-056 | reachN1=1;reachN=79 | reachN=1;reachN1=79 |
| TVM-CRT-039 | NPlus1=1;NPlus=20 | NPlus=1;NPlus1=20 |
| TVM-CRT-049 | reachN1=1;reachN=19 | reachN=1;reachN1=19 |
| ADM-CUS-CRT-080 | NPlus1=1;NPlus=80 | NPlus=1;NPlus1=80 |
| ADM-CUS-CRT-090 | reachN1=1;reachN=79 | reachN=1;reachN1=79 |

## 三、自定义模版N+传法错误（8个）

**文档规则**：自定义模版（custom/create）不使用NPlus/NPlus1等独立字段，N+用打包格式`"56_1_80"`放在indexSet.index[]数组里。每个场景（Total/Accumulated/ByDay）是独立的table，各有自己的indexSet.type和index数组。

| Case编号 | 问题 | 修正方案 |
|---------|------|---------|
| ADM-CUS-CRT-080 | 用NPlus1/NPlus独立字段 | index加"56_1_80"，N+列改写index格式 |
| ADM-CUS-CRT-081（累计） | 用NPlus2/NPlus3独立字段 | 该table的indexSet.type改为Accumulated_*，index加"56_1_80" |
| ADM-CUS-CRT-082（按天） | 用NPlus4/NPlus5独立字段 | 该table的indexSet.type改为ByDay_*，index加"56_1_80" |
| ADM-CUS-CRT-083（全场景） | 用全部6个独立字段 | 拆成3个table：Total_*+index[56_1_1], Accumulated_*+index[56_1_80], ByDay_*+index[56_1_80] |
| ADM-CUS-CRT-090 | 用reachN1/reachN独立字段 | index加"57_1_79"，N+列改写index格式 |
| ADM-CUS-CRT-091（累计） | 用reachN2/reachN3独立字段 | 该table的indexSet.type改为Accumulated_*，index加"57_1_79" |
| ADM-CUS-CRT-092（按天） | 用reachN4/reachN5独立字段 | 该table的indexSet.type改为ByDay_*，index加"57_1_79" |
| ADM-CUS-CRT-093（全场景） | 用全部6个独立字段 | 拆成3个table，各自indexSet.type+index[57_1_79] |

注：ADM-CUS-CRT-076~079/084/085/086~089/094/095这12个case也用了独立NPlus字段，但它们测试的是边界值（越界、非法0、cap<base），需要改成打包格式才能正确测试。例如：
- 076: NPlus=1;NPlus1=1 → index=["56_1_1"]
- 078: NPlus=81;NPlus1=81 → index=["56_81_81"]（文档说自定义模版不对base/cap做值域校验，越界不会因范围被拒，所以这个case的预期可能要改）

**重要**：文档说"自定义模版不对base/cap数值做值域校验（越界值不会因范围原因被拒）"，所以084/085/088/089/094/095这些边界case在自定义模版下预期40001可能不成立，需要改预期或改用固定模版测试。

## 四、指标ID写错（2个）

| Case编号 | 问题 | 修正方案 |
|---------|------|---------|
| ADM-FIX-CRT-066 | 指标ID写96，但用nvNPlus（对应98） | 指标ID改为98 |
| ADM-FIX-CRT-067 | 指标ID写96，但用nvNPlus（对应98） | 指标ID改为98 |

## 五、indexSet.type格式错误（3个）

**文档正则**：`^(Total|Accumulated|ByDay)_[a-z,]+$`，例：`"Total_pc,mb"`

| Case编号 | 原值 | 修正方案 |
|---------|------|---------|
| ADM-CUS-CRT-001 | Total_pc/Total_mb/Total_pm/Accumulated_pc/Accumulated_mb/ByDay_pc/ByDay_mb | 拆成多个table，每个table一个type：Total_pc,mb,pm / Accumulated_pc,mb / ByDay_pc,mb |
| ADM-CUS-CRT-002 | Total_pc/Total_mb/Accumulated_pc/ByDay_pc | 拆成：Total_pc,mb / Accumulated_pc / ByDay_pc |
| ADM-CUS-CRT-003 | Total_pc/Total_mb/Accumulated_pc/ByDay_pc | 同上 |

## 六、补充说明

### 自定义模版边界case预期问题
ADM-CUS-CRT-078/079/084/085/088/089/094/095这些测试N+越界/非法0/cap<base的case，在自定义模版下API不做值域校验（文档明确说明），预期40001可能不成立。建议：
- 方案A：改用固定模版测试这些边界值（固定模版会校验值域）
- 方案B：改预期为code=0（自定义模版不做值域校验）
- 推荐方案A，因为边界值测试的目的是验证API的校验逻辑，固定模版才是校验入口
