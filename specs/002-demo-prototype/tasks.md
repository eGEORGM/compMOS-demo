---
description: "结算平台Demo原型的实现任务清单"
---

# Tasks: 结算平台Demo原型

**Input**: 设计文档来自 `/specs/002-demo-prototype/`  
**Prerequisites**: plan.md, spec.md, mock-data.md, quickstart.md  
**Generated**: 2026-01-16

**Tests**: Demo原型阶段不要求自动化测试，仅进行手动功能验证

**Organization**: 任务按用户故事组织，每个故事可独立实现和演示

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 所属用户故事（如 US1, US2, US3, US4）
- 所有任务描述包含明确的文件路径

## Path Conventions

Demo原型使用单项目结构，所有代码位于 `compMOS-demo/` 根目录下：
- 源代码：`src/`
- 公共资源：`public/`
- 配置文件：根目录

---

## Phase 1: Setup（项目初始化）

**Purpose**: 创建项目结构，初始化开发环境

- [x] T001 创建 compMOS-demo 项目目录结构
- [x] T002 初始化 package.json 并安装核心依赖（Vue.js 2.7.12, Element UI 2.13.0, Mock.js, Vue Router, Moment.js, Lodash）
- [x] T003 [P] 配置 webpack.config.js 打包工具
- [x] T004 [P] 配置 babel.config.js ES6+转译
- [x] T005 [P] 创建 .eslintrc.js 和 .prettierrc.js 代码规范配置
- [x] T006 创建 public/index.html 入口HTML文件
- [x] T007 创建 src/main.js 应用入口文件
- [x] T008 创建 src/App.vue 根组件
- [x] T009 [P] 创建全局样式文件 src/assets/styles/variables.less 和 src/assets/styles/global.less

**Checkpoint**: 项目可启动，显示空白页面或欢迎页 ✅ **已完成**

---

## Phase 2: Foundational（基础设施）

**Purpose**: 核心基础设施，所有用户故事依赖的共享组件和工具

**⚠️ CRITICAL**: 此阶段完成前，用户故事实现无法开始

### Mock数据基础

- [x] T010 创建 src/mock/mockData.js Mock.js数据生成器主文件
- [x] T011 [P] 创建 src/mock/bills.js 账单包模拟数据（4个账单，涵盖4种状态）
- [x] T012 [P] 创建 src/mock/orders.js 订单明细模拟数据（150条订单，分布在4个账单中）
- [x] T013 [P] 创建 src/mock/invoices.js 发票模拟数据（20张发票，3个批次）
- [x] T014 [P] 创建 src/mock/users.js 用户模拟数据（2个用户：1预存、1授信）
- [x] T015 在 src/main.js 中初始化Mock数据，验证数据结构正确

### 路由基础

- [x] T016 创建 src/router/index.js 路由配置文件
- [x] T017 定义基础路由（账单列表、账单详情、发票申请、发票列表）
- [x] T018 配置路由模式为 hash 模式（本地demo无需history模式）

### 通用组件

- [x] T019 [P] 创建 src/components/common/PageHeader.vue 页面头部组件
- [x] T020 [P] 创建 src/components/common/StatusTag.vue 状态标签组件（待对账/已核对/开票中/已结清）
- [x] T021 [P] 创建 src/components/common/LoadingButton.vue 带加载状态的按钮组件
- [x] T022 [P] 创建 src/components/common/ConfirmDialog.vue 确认对话框组件

### 工具函数

- [x] T023 [P] 创建 src/utils/format.js 格式化工具（金额、日期、百分比）
- [x] T024 [P] 创建 src/utils/constants.js 常量和枚举定义（业务类型、状态码）
- [x] T025 [P] 创建 src/utils/storage.js LocalStorage封装（用户类型切换、演示状态）

### 布局组件

- [x] T026 创建 src/components/layout/MainLayout.vue 主布局组件（包含侧边栏和内容区）
- [x] T027 创建 src/components/layout/Sidebar.vue 侧边导航栏组件
- [x] T028 创建 src/components/layout/Breadcrumb.vue 面包屑导航组件

**Checkpoint**: 基础设施完成，可以访问任意路由并看到布局框架 ✅ **已完成**

---

## Phase 3: User Story 1 - 演示账单查看与核对流程 (Priority: P1) 🎯 MVP

**Goal**: 实现账单列表展示、账单详情查看、订单核对和账单确认的完整流程

**Independent Test**: 启动demo → 访问账单列表 → 查看"待对账"账单 → 勾选订单核对 → 点击"全部确认" → 返回列表查看状态更新

### 页面组件

- [x] T029 [US1] 创建 src/pages/BillList.vue 账单列表页面
- [x] T030 [US1] 创建 src/pages/BillDetail.vue 账单详情页面

### 业务组件（账单）

- [x] T031 [P] [US1] 创建 src/components/bill/BillCard.vue 账单卡片组件（展示账单概览信息）
- [x] T032 [P] [US1] 创建 src/components/bill/BillStatusFilter.vue 账单状态筛选组件
- [x] T033 [P] [US1] 创建 src/components/bill/OrderTable.vue 订单明细表格组件（支持核对勾选）
- [x] T034 [P] [US1] 创建 src/components/bill/OrderCheckSummary.vue 订单核对统计组件（已核对/总数）
- [x] T035 [P] [US1] 创建 src/components/bill/BillSummary.vue 账单汇总组件（按业务线分类统计）

### 业务逻辑实现

- [x] T036 [US1] 在 BillList.vue 中实现账单列表数据加载（从Mock数据读取）
- [x] T037 [US1] 在 BillList.vue 中实现状态筛选功能（待对账/已核对/开票中/已结清）
- [x] T038 [US1] 在 BillDetail.vue 中实现账单详情数据加载（根据billNo获取）
- [x] T039 [US1] 在 BillDetail.vue 中实现订单明细表格渲染（按业务线分类）
- [x] T040 [US1] 在 OrderTable.vue 中实现订单核对勾选功能（单选和全选）
- [x] T041 [US1] 在 OrderCheckSummary.vue 中实现已核对订单数量的实时统计
- [x] T042 [US1] 实现"全部确认"按钮点击事件（弹出确认对话框 → 更新账单状态 → 显示成功提示）
- [x] T043 [US1] 实现账单状态更新后的视觉反馈（颜色变化、标签更新）

### 样式和交互优化

- [x] T044 [US1] 为 BillCard 添加悬停效果和点击跳转
- [x] T045 [US1] 为 OrderTable 添加斑马纹和行悬停效果
- [x] T046 [US1] 为状态标签添加不同颜色的样式（待对账-橙色、已核对-绿色）

**Checkpoint**: User Story 1 完成 - 可以完整演示账单核对流程 ✅ **已完成**

---

## Phase 4: User Story 2 - 演示发票申请与查看流程 (Priority: P2)

**Goal**: 实现对账完成后的发票申请、开票进度查看和发票列表展示

**Independent Test**: 选择"已核对"账单 → 点击"申请发票" → 填写发票信息 → 提交 → 查看开票批次 → 查看发票列表

### 页面组件

- [ ] T047 [US2] 创建 src/pages/InvoiceApply.vue 发票申请页面
- [ ] T048 [US2] 创建 src/pages/InvoiceBatchList.vue 开票批次列表页面
- [ ] T049 [US2] 创建 src/pages/InvoiceList.vue 发票列表页面

### 业务组件（发票）

- [ ] T050 [P] [US2] 创建 src/components/invoice/InvoiceApplyForm.vue 发票申请表单组件
- [ ] T051 [P] [US2] 创建 src/components/invoice/AddressSelector.vue 收货地址选择组件（含预置地址）
- [ ] T052 [P] [US2] 创建 src/components/invoice/InvoiceBatchCard.vue 开票批次卡片组件
- [ ] T053 [P] [US2] 创建 src/components/invoice/InvoiceProgress.vue 开票进度条组件（模拟0%-100%）
- [ ] T054 [P] [US2] 创建 src/components/invoice/InvoiceTable.vue 发票列表表格组件
- [ ] T055 [P] [US2] 创建 src/components/invoice/InvoiceSummary.vue 发票汇总统计组件（专票/普票/行程单）

### 业务逻辑实现

- [ ] T056 [US2] 在 BillDetail.vue 中添加"申请发票"按钮（仅"已核对"状态可见）
- [ ] T057 [US2] 在 InvoiceApply.vue 中实现表单数据加载（预填充默认发票抬头和纳税人识别号）
- [ ] T058 [US2] 在 InvoiceApply.vue 中实现收货地址选择（展示2-3个预置地址）
- [ ] T059 [US2] 在 InvoiceApply.vue 中实现表单验证（发票抬头、纳税人识别号、收货信息必填）
- [ ] T060 [US2] 实现发票申请提交逻辑（生成批次记录 → 更新Mock数据 → 显示成功提示 → 跳转到批次列表）
- [ ] T061 [US2] 在 InvoiceBatchList.vue 中实现批次列表数据加载
- [ ] T062 [US2] 实现开票进度模拟（使用setTimeout延迟2-3秒，进度条从0%到100%）
- [ ] T063 [US2] 在批次完成后更新状态为"开票完成"并显示发票汇总统计
- [ ] T064 [US2] 在 InvoiceList.vue 中实现发票列表数据加载（根据批次ID筛选）
- [ ] T065 [US2] 实现发票"查看"按钮点击事件（弹出对话框展示发票详情或模拟PDF预览）

### 样式和交互优化

- [ ] T066 [US2] 为 InvoiceApplyForm 添加表单验证提示样式
- [ ] T067 [US2] 为 InvoiceProgress 添加动画效果（进度条平滑过渡）
- [ ] T068 [US2] 为发票类型标签添加不同颜色（专票-蓝色、普票-绿色、行程单-紫色）

**Checkpoint**: User Story 2 完成 - 可以完整演示发票申请和查看流程

---

## Phase 5: User Story 3 - 演示数据筛选与导出功能 (Priority: P3)

**Goal**: 实现订单搜索、筛选和数据导出（模拟）功能

**Independent Test**: 在账单详情页 → 搜索出行人姓名 → 选择业务类型筛选 → 点击"导出Excel" → 显示导出进度和成功提示

### 业务组件（数据管理）

- [ ] T069 [P] [US3] 创建 src/components/bill/OrderSearchBar.vue 订单搜索组件（支持姓名搜索）
- [ ] T070 [P] [US3] 创建 src/components/bill/BusinessTypeFilter.vue 业务类型筛选组件（机票/火车票/酒店）
- [ ] T071 [P] [US3] 创建 src/components/bill/ExportDialog.vue 导出确认对话框组件

### 业务逻辑实现

- [ ] T072 [US3] 在 BillDetail.vue 中添加 OrderSearchBar 组件并实现实时搜索功能
- [ ] T073 [US3] 在 BillDetail.vue 中添加 BusinessTypeFilter 组件并实现筛选功能
- [ ] T074 [US3] 实现搜索和筛选的组合逻辑（搜索结果 + 筛选条件）
- [ ] T075 [US3] 实现筛选结果数量的实时显示（如"共找到X条订单"）
- [ ] T076 [US3] 在 BillDetail.vue 中添加"导出Excel"按钮
- [ ] T077 [US3] 实现导出确认对话框（显示订单数量和预计文件大小模拟值）
- [ ] T078 [US3] 实现导出进度模拟（显示"正在生成文件..."加载动画，延迟2秒）
- [ ] T079 [US3] 实现导出完成提示（显示"文件已生成"消息，demo中不实际下载文件）
- [ ] T080 [US3] 在 BillList.vue 中添加账单周期筛选器
- [ ] T081 [US3] 在 BillList.vue 中实现账单列表的实时筛选更新

### 样式和交互优化

- [ ] T082 [US3] 为搜索框添加搜索图标和清除按钮
- [ ] T083 [US3] 为筛选器添加活动状态样式（选中时高亮）
- [ ] T084 [US3] 为导出按钮添加禁用状态（当没有订单时）

**Checkpoint**: User Story 3 完成 - 可以完整演示数据筛选和导出功能

---

## Phase 6: User Story 4 - 演示预存企业调账功能 (Priority: P4)

**Goal**: 实现预存企业的批量调账功能和权限控制演示

**Independent Test**: 切换为预存企业用户 → 选择订单 → 点击"批量调账" → 修改字段 → 保存 → 查看更新；切换为授信企业 → "批量调账"按钮隐藏或禁用

### 业务组件（调账）

- [ ] T085 [P] [US4] 创建 src/components/bill/AdjustDialog.vue 批量调账对话框组件
- [ ] T086 [P] [US4] 创建 src/components/bill/AdjustForm.vue 调账表单组件（成本中心/项目部门/发票抬头）
- [ ] T087 [P] [US4] 创建 src/components/common/UserTypeSwitcher.vue 用户类型切换组件（预存/授信切换）

### 业务逻辑实现

- [ ] T088 [US4] 创建 src/utils/permission.js 权限判断工具（根据用户类型判断权限）
- [ ] T089 [US4] 在 BillDetail.vue 中添加"批量调账"按钮（仅预存企业可见）
- [ ] T090 [US4] 实现订单多选逻辑（复选框选择，启用/禁用"批量调账"按钮）
- [ ] T091 [US4] 在 AdjustForm.vue 中实现表单数据预填充（当前值一致则预填充，不一致显示"多个值"）
- [ ] T092 [US4] 实现调账表单验证（至少修改一个字段）
- [ ] T093 [US4] 实现调账提交逻辑（更新Mock数据中的订单字段 → 刷新表格 → 显示成功提示）
- [ ] T094 [US4] 为已修改的订单添加高亮标记（如背景色变化或标签提示）
- [ ] T095 [US4] 在 MainLayout.vue 中添加 UserTypeSwitcher 组件
- [ ] T096 [US4] 实现用户类型切换逻辑（更新LocalStorage → 刷新页面权限状态）
- [ ] T097 [US4] 为授信企业用户隐藏或禁用"批量调账"按钮，并添加悬停提示
- [ ] T098 [US4] 实现授信企业点击调账按钮时的权限不足提示对话框

### 样式和交互优化

- [ ] T099 [US4] 为调账表单添加字段说明和示例值
- [ ] T100 [US4] 为已修改订单添加特殊标记（如蓝色边框或修改标签）
- [ ] T101 [US4] 为用户类型切换组件添加切换动画

**Checkpoint**: User Story 4 完成 - 可以完整演示调账功能和权限控制

---

## Phase 7: Polish & Cross-Cutting Concerns（优化和完善）

**Purpose**: 跨用户故事的改进和收尾工作

### 边缘情况处理

- [ ] T102 [P] 实现数据加载失败的友好提示（在各页面组件中添加错误边界）
- [ ] T103 [P] 实现重复提交防护（为所有异步按钮添加loading状态和禁用逻辑）
- [ ] T104 [P] 实现表单验证的实时提示（发票申请、调账表单）
- [ ] T105 实现状态一致性检查（确保账单状态更新后相关按钮变化）

### 用户体验优化

- [ ] T106 [P] 添加页面加载骨架屏（在首次加载时显示）
- [ ] T107 [P] 添加空状态提示（当筛选结果为空时）
- [ ] T108 [P] 优化移动端兼容性（虽然不是主要目标，但基础响应式可以添加）
- [ ] T109 添加操作成功的动画效果（如账单状态更新后的过渡动画）

### 文档和演示准备

- [ ] T110 创建 specs/002-demo-prototype/demo-script.md 演示脚本文档（用于stakeholder演示）
- [ ] T111 在 README.md 中添加demo启动和使用说明
- [ ] T112 添加demo演示数据的重置功能（刷新页面恢复初始状态）

### 代码质量

- [ ] T113 [P] 运行 ESLint 并修复所有代码规范问题
- [ ] T114 [P] 运行 Prettier 格式化所有代码
- [ ] T115 [P] 移除所有 console.log 调试代码
- [ ] T116 添加关键组件的代码注释（复杂逻辑说明）

### 最终验证

- [ ] T117 在 Chrome 浏览器中完整走一遍4个用户故事流程
- [ ] T118 在 Firefox 浏览器中验证基础功能
- [ ] T119 在 Safari 浏览器中验证基础功能（如果可用）
- [ ] T120 运行 quickstart.md 中的验证步骤

**Checkpoint**: Demo原型完成，所有功能可正常演示

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-6)**: 所有依赖 Foundational 完成
  - 用户故事之间无依赖，可并行开发（如果有多人团队）
  - 或按优先级顺序开发（P1 → P2 → P3 → P4）
- **Polish (Phase 7)**: 依赖所有目标用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 可在 Foundational 完成后开始 - 无其他依赖 ✅ MVP
- **User Story 2 (P2)**: 可在 Foundational 完成后开始 - 逻辑上依赖 US1（需要"已核对"状态账单），但可独立演示
- **User Story 3 (P3)**: 可在 Foundational 完成后开始 - 扩展 US1 的功能，但可独立实现
- **User Story 4 (P4)**: 可在 Foundational 完成后开始 - 扩展 US1 的功能，但可独立实现

### Within Each User Story

- 页面组件创建 → 业务组件创建 → 业务逻辑实现 → 样式优化
- 组件之间标记 [P] 的可以并行开发
- 逻辑实现通常依赖组件已创建

### Parallel Opportunities

**Phase 2（基础设施）最大化并行**:
- T011-T014（Mock数据文件）可以4个任务同时进行
- T019-T022（通用组件）可以4个任务同时进行
- T023-T025（工具函数）可以3个任务同时进行

**User Story 1（核心功能）**:
- T031-T035（业务组件）可以5个任务同时进行
- T044-T046（样式优化）可以3个任务同时进行

**User Story 2（发票功能）**:
- T050-T055（业务组件）可以6个任务同时进行
- T066-T068（样式优化）可以3个任务同时进行

**User Story 3（数据管理）**:
- T069-T071（业务组件）可以3个任务同时进行
- T082-T084（样式优化）可以3个任务同时进行

**User Story 4（权限控制）**:
- T085-T087（业务组件）可以3个任务同时进行
- T099-T101（样式优化）可以3个任务同时进行

**Phase 7（优化完善）**:
- T102-T105（边缘情况）可以4个任务同时进行
- T106-T109（UX优化）可以4个任务同时进行
- T113-T116（代码质量）可以4个任务同时进行
- T117-T120（最终验证）需按浏览器顺序进行

---

## Parallel Example: User Story 1 Core Components

```bash
# 并行创建User Story 1的所有业务组件（5个任务同时执行）:
Task T031: "创建 src/components/bill/BillCard.vue 账单卡片组件"
Task T032: "创建 src/components/bill/BillStatusFilter.vue 账单状态筛选组件"
Task T033: "创建 src/components/bill/OrderTable.vue 订单明细表格组件"
Task T034: "创建 src/components/bill/OrderCheckSummary.vue 订单核对统计组件"
Task T035: "创建 src/components/bill/BillSummary.vue 账单汇总组件"
```

---

## Implementation Strategy

### MVP First（仅 User Story 1）

**5天内完成可演示的MVP**:

1. **Day 1**: Complete Phase 1 (Setup) + Phase 2前半部分（Mock数据和路由）
2. **Day 2**: Complete Phase 2后半部分（通用组件、工具、布局）
3. **Day 3**: Complete Phase 3（User Story 1 - 账单核对流程）
4. **Day 4**: 测试 User Story 1 + 修复问题
5. **Day 5**: 简单的 Phase 7 优化（边缘情况、代码质量）

**STOP and VALIDATE**: 在Day 4-5之间，完整演示账单核对流程给团队内部验证

### Incremental Delivery（完整4个用户故事）

**如果时间充足，可继续添加功能**:

1. **Week 1 (5天)**: Setup + Foundational + US1 → MVP ready
2. **Week 2 (3-5天)**: US2（发票流程）→ Demo v1.1
3. **Week 2-3 (2-3天)**: US3（数据筛选）→ Demo v1.2
4. **Week 3 (2-3天)**: US4（权限控制）→ Demo v1.3（完整版）
5. **Final (1-2天)**: Phase 7 完整优化 → Demo v2.0

每个用户故事独立可演示，不影响前面已完成的功能。

### Parallel Team Strategy

**如果有2-3人团队**:

1. **Day 1-2**: 所有人一起完成 Phase 1 + Phase 2（基础设施）
2. **Day 3起**，分工并行开发:
   - Developer A: User Story 1（账单核对）
   - Developer B: User Story 2（发票申请）
   - Developer C: User Story 3 + US4（数据管理和权限）
3. 各自测试后集成，通常不会有冲突（不同页面和组件）

---

## Notes

- ✅ **[P] 标记**: 表示可以并行开发的任务（不同文件，无依赖关系）
- ✅ **[Story] 标记**: 将任务映射到特定用户故事，便于追溯和独立交付
- ✅ **独立性**: 每个用户故事都可以独立完成和演示，不破坏其他功能
- ✅ **Demo特点**: 所有数据都是Mock，刷新页面后恢复初始状态（符合demo演示需求）
- ⚠️ **无测试**: Demo阶段不编写自动化测试，仅进行手动功能验证
- ⚠️ **简化架构**: 不使用Vuex，使用组件内部状态和LocalStorage
- 📝 **Commit建议**: 每完成一个任务或一组逻辑相关的任务后commit
- 🎯 **Checkpoint**: 在每个用户故事完成后停下来验证，确保独立可演示
- 🚫 **避免**: 模糊的任务描述、同一文件的并行修改、跨用户故事的强依赖

---

## 总结

- **总任务数**: 120个任务
- **MVP任务数**: 约46个任务（Phase 1-2 + Phase 3）
- **User Story 任务分布**:
  - US1（账单核对）: 18个任务
  - US2（发票流程）: 22个任务
  - US3（数据管理）: 16个任务
  - US4（权限控制）: 17个任务
- **并行机会**: 约40-50个任务可并行执行（标记为[P]）
- **建议MVP范围**: Phase 1-3（Setup + Foundational + User Story 1）
- **预计开发时间**: 
  - MVP（US1）: 5个工作日（单人）或3个工作日（2人团队）
  - 完整版（US1-4）: 10-15个工作日（单人）或6-8个工作日（2-3人团队）

