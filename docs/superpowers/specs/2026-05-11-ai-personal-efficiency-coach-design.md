# AI Personal Efficiency Coach — 设计方案 v2

> 文档版本：v2.0
> 日期：2026-05-11
> 状态：已确认，待进入实施阶段

---

## 1. 产品定位与核心价值

### 产品定位
基于 LLM 的智能个人效能教练 App（Mobile-first）。

### 核心痛点
- **规划难**：想得太多，拆解太少，无结构
- **执行散**：被意外打断，无法专注
- **复盘弱**：一天结束不知道完成了什么

### 核心价值
- **自动化拆解**：LLM 将模糊意图变为可执行的原子任务
- **动态调整**：任务随执行情况自动顺延和重平衡
- **数据驱动的自我优化**：通过历史数据发现模式和优化空间

### 产品定位语
> "你的动态规划伙伴，会根据你的执行节奏自动进化。"

### Slogan
> "让每一周都清晰可见，让每一天都从容执行。"

---

## 2. 技术架构决策

| 维度 | 决策 |
|------|------|
| 平台 | Mobile App（React Native / Expo） |
| LLM 调用 | 纯云端，后端统一调用（API Key 安全不泄露） |
| 数据存储 | 自建后端 + PostgreSQL |
| 状态管理 | Zustand |
| 推送通知 | Expo Notifications（APNs iOS + FCM Android） |
| App 导航 | 底部 Tab 导航（4 Tab） |
| 周计划编辑 | 可视化拖拽 |
| 用户定位 | 数据控，偏好极简数字呈现（少图少表） |

### 技术栈总览

```
┌─────────────────────────────────────┐
│           Expo App (RN)             │
│  Zustand / Expo Notifications        │
└──────────────┬──────────────────────┘
               │ HTTP
┌──────────────▼──────────────────────┐
│        FastAPI 后端                 │
│  LLM 调用层（OpenAI/Claude/Qwen）   │
│  任务排程算法 / Roll-over 逻辑      │
│  进化分析引擎                       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         PostgreSQL                  │
│  Users / WeekPlans / Tasks          │
│  DailyReviews / UserPreferences     │
└─────────────────────────────────────┘
```

---

## 3. 功能模块设计

### 模块一：智能周末规划引擎

**触发时机**：每周五 20:00 推送通知

**交互流程**：
1. 用户点击通知或打开 App，进入"周末规划"页面
2. 输入下周核心目标（语音/文字，支持快速入口随时添加单件事）
3. 标记优先级（P0 紧急重要 / P1 重要不紧急 / P2 琐事）
4. 后端 LLM 执行任务拆解与排期，生成周计划草稿
5. 用户在周计划视图拖拽微调，确认后写入数据库

**LLM 任务拆解 Prompt 策略**：
- Role：资深项目管理专家
- Input：用户意图列表 + 优先级 + 用户偏好（工作时段、峰值精力时间）
- Constraint：
  - 拆解为耗时不超过 2 小时的原子任务
  - 每天保留 20% Buffer 时间
  - P0 任务优先安排在精力最好的时间段
- Output：JSON（task_id, title, description, estimated_time, day_of_week, time_slot, priority）

**Roll-over 衰减模型**（MVP 后迭代）：
- 连续延期 3 次：触发"任务重估"流程，LLM 询问用户是否需要缩小范围或拆分
- 连续延期 7 次：建议归档或移至"未来想法"池

---

### 模块二：每日晨间唤醒

**触发时机**：每日 08:00 推送

**交互流程**：
1. 推送展示今日 Top 3 重点任务 + Roll-over 任务（昨日延期，带红色"延期"标签）
2. LLM 生成一句"今日寄语"（基于今日任务重要性给予正向心理暗示）
3. 用户点击"一键开始"进入专注打卡模式
4. 用户勾选已完成任务

---

### 模块三：日间执行与晚间复盘

**触发时机**：每日 22:30 推送

**交互流程**：
1. 用户勾选今日已完成任务
2. 未完成任务选择原因标签（预估不足 / 突发干扰 / 拖延 / 任务太难）
3. 可选快速备注（"为什么没做完？"）
4. 后端 LLM 执行动态调整：未完成任务自动顺延至明日，重新平衡明日工作负载
5. LLM 生成"今日成就总结"，给予正向反馈

**LLM 动态调整 Prompt 策略**：
- Role：敏捷教练
- Input：今日未完成任务列表 + 原因标签 + 明日原有计划
- Action：
  - 评估未完成任务是否适合明天做
  - 如果明日计划已满，建议移除或推迟哪些低优先级任务
- Output：更新后的明日计划 JSON

---

### 模块四：周度进化报告

**触发时机**：下周一早上或周日晚上推送

**数据分析维度**：
- 完成率分析（计划 vs 实际）
- 时间分布（深度工作 vs 浅层工作）
- 延期模式识别（哪类任务最容易延期）
- 精力曲线（哪天/哪个时段效率最高）

**LLM 诊断与建议 Prompt 策略**：
- Role：个人效能分析师
- Input：本周所有任务的完成状态 + 延期原因 + 用户备注
- Output：
  - 本周效能评分（1-10，与上周对比）
  - 发现的一个主要问题模式
  - 三条具体的、可执行的改进建议
  - 语气鼓励且客观

---

## 4. App 导航与页面设计

### 底部 Tab 结构

| Tab | 名称 | 核心内容 |
|-----|------|----------|
| Tab 1 | 今日 | 晨间任务卡片 + 打卡 + 晨间寄语 |
| Tab 2 | 周计划 | 周一~周五时间轴 + 拖拽编辑 |
| Tab 3 | 数据 | 完成率 + 延期分析 + 精力曲线 + 改进建议 |
| Tab 4 | 我的 | 偏好设置 + 推送时间 + 学习期参数 |

### Tab 1：今日
- 今日任务卡片列表（Top 3 高亮，其余次要）
- Roll-over 标记：昨日延期任务置顶，带红色"延期"标签
- 晨间寄语：LLM 生成的一句话
- 一键开始：点击进入任务专注打卡模式

### Tab 2：周计划
- 周视图：周一~周五时间轴，可视化展示任务分布
- 拖拽编辑：长按任务卡片，拖动至任意时间段调整
- 快捷操作：点击任务弹出菜单（改优先级/删任务/查看详情）
- LLM 草稿态：周五生成计划后以"待确认"态展示，确认后正式写入

### Tab 3：数据
- 本周完成率：数字 + 进度条
- 延期分析：数字 + 原因分布文字说明（不用图表）
- 精力曲线：简单数字呈现哪天效率最高
- 改进建议：LLM 生成的 3 条可执行建议（行动导向）

### Tab 4：我的
- 用户偏好设置（工作时段、峰值精力时间）
- 推送时间自定义（晨间/晚间时间可调）
- 学习期参数（预估校准开关）
- 数据导出/匿名化选项
- 通知权限管理

---

## 5. 数据模型

### Entity Relationship

```
User
├── id: UUID (PK)
├── preferences: JSONB
│   ├── work_hours: { start: "09:00", end: "18:00" }
│   ├── peak_energy_time: "morning" | "afternoon" | "evening"
│   ├── notification_enabled: boolean
│   └── learning_mode_enabled: boolean
└── created_at / updated_at

WeekPlan
├── id: UUID (PK)
├── user_id: UUID (FK → User)
├── start_date: DATE
├── status: ENUM('draft', 'active', 'closed')
└── confirmed_at: TIMESTAMP (nullable)

Task
├── id: UUID (PK)
├── week_plan_id: UUID (FK → WeekPlan)
├── title: VARCHAR
├── description: TEXT
├── priority: ENUM('P0', 'P1', 'P2')
├── estimated_duration: INT (minutes)
├── actual_duration: INT (minutes, nullable)
├── scheduled_date: DATE
├── scheduled_time: TIME
├── status: ENUM('pending', 'done', 'skipped', 'rolled_over')
├── delay_reason: ENUM('underestimated', 'interrupted', 'procrastinated', 'too_hard', nullable)
├── completion_note: TEXT (nullable)
├── roll_over_count: INT (default 0)
├── is_rolled_over: BOOLEAN (default false)
└── depends_on: UUID[] (FK → Task, nullable, MVP 后迭代)

DailyReview
├── id: UUID (PK)
├── user_id: UUID (FK → User)
├── date: DATE (PK)
├── summary_text: TEXT
├── mood_score: INT (1-5, nullable)
├── completed_tasks_count: INT
├── total_tasks_count: INT
└── rolled_over_tasks_count: INT
```

### Roll-over 逻辑
1. 每晚 22:30，将 `status = 'pending'` 且 `scheduled_date = today` 的任务更新为 `status = 'rolled_over'`，`scheduled_date = tomorrow`，`is_rolled_over = true`，`roll_over_count += 1`
2. 若 `roll_over_count >= 3`，触发重估流程（LLM 生成"任务调整建议"推送）
3. 若 `roll_over_count >= 7`，建议用户归档任务

---

## 6. MVP 分阶段 Definition of Done

| 阶段 | 内容 | 完成标准 |
|------|------|----------|
| **阶段一** | 周规划流程 | 用户输入意图 → LLM 拆解 → 看到可编辑周计划表 → 完成一次拖拽调整 |
| **阶段二** | 每日执行流程 | 推送正常到达 → 用户打卡完成 → 未完成任务自动出现在次日列表 |
| **阶段三** | 数据分析 | 数据 Tab 显示本周完成率 + 延期原因 + 精力曲线数字 |
| **阶段四** | 智能化 | LLM 具备预估校准能力（基于用户历史实际耗时调整估算值） |

---

## 7. 潜在风险与应对

| 风险 | 应对 |
|------|------|
| LLM 拆解任务不符合用户能力 | 前两周记录实际耗时与预估偏差系数，后续自动校准 |
| 推送打扰用户 | 允许自定义推送时间；连续 3 天忽略复盘则暂停推送并发送关怀消息 |
| 隐私问题 | 明确告知数据仅用于个人分析，提供本地化/匿名化选项 |
| LLM 输出非 JSON 格式 | 后端增加输出校验层 + 降级策略（fallback 到规则引擎） |
| 用户不认可 LLM 生成的计划 | 所有 LLM 输出均为"草稿"，用户拥有最终编辑权 |

---

## 8. LLM Prompt 设计（核心策略）

### Prompt 1：任务拆解（周五）
```
Role: 你是资深项目管理专家。
Input: 用户输入的原始意图列表 {{user_intents}}，优先级 {{priorities}}，用户偏好 {{preferences}}。
Constraint:
1. 将大目标拆解为耗时不超过2小时的原子任务。
2. 每天保留20%的Buffer时间。
3. P0任务优先安排在精力最好的时间段。
4. 输出格式为JSON，包含：task_id, title, description, estimated_time, day_of_week, time_slot, priority。
```

### Prompt 2：动态调整（每日 22:30）
```
Role: 你是敏捷教练。
Input: 今日未完成任务列表 {{unfinished_tasks}}，用户标注的原因 {{reasons}}，明日原有计划 {{tomorrow_plan}}。
Action:
1. 评估未完成任务是否适合明天做。
2. 如果明日计划已满，建议移除或推迟哪些低优先级任务。
3. 输出更新后的明日计划 JSON。
```

### Prompt 3：周度分析（周末）
```
Role: 你是个人效能分析师。
Input: 本周所有任务的完成状态、延期原因、用户备注。
Output:
1. 本周效能评分 (1-10)，与上周对比。
2. 发现的一个主要问题模式。
3. 三条具体的、可执行的改进建议。
4. 语气要鼓励且客观。
```

---

## 9. 非功能性需求

- **性能**：推送到达 < 5s（网络正常时）
- **可用性**：单次规划流程 < 5 分钟完成
- **隐私**：所有用户数据加密存储，LLM 调用日志脱敏
- **容错**：LLM 调用设置 30s 超时 + 3 次重试 + 降级策略
