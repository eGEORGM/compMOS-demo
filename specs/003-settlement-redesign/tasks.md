# Tasks: 结算平台UI重构

**Feature Branch**: `003-settlement-redesign`  
**Input**: 设计文档来自 `/specs/003-settlement-redesign/`  
**Prerequisites**: plan.md (✅), spec.md (✅), research.md (✅), data-model.md (✅), contracts/ (✅)

**目标**: 完成前端的改造，并且mock出合适的数据

**Organization**: 任务按用户故事分组，确保每个故事可以独立实现和测试

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖关系）
- **[Story]**: 任务所属用户故事（如US1, US2, US3）
- 包含具体文件路径

## Path Conventions

本项目为前端单页应用（Web SPA），基于现有 compMOS-demo 项目：
- **源代码**: `compMOS-demo/src/`
- **测试代码**: `compMOS-demo/tests/`（按需创建）
- **配置文件**: `compMOS-demo/`

---

## Phase 1: Setup（项目初始化和结构调整）

**Purpose**: 准备项目环境，创建基础目录结构

- [x] T001 检查并确认compMOS-demo项目依赖完整性，确保已安装Vue.js 2.7.12、Element UI 2.15.x、Vuex 3.x、Axios
- [x] T002 创建Vuex store目录结构：`compMOS-demo/src/store/index.js`和`compMOS-demo/src/store/modules/`
- [x] T003 [P] 创建API服务层目录：`compMOS-demo/src/api/`，包含`request.js`、`bill.js`、`invoice.js`、`config.js`
- [x] T004 [P] 创建工具函数目录：`compMOS-demo/src/utils/validators.js`和`compMOS-demo/src/utils/errorHandler.js`
- [x] T005 [P] 创建账单相关组件目录：`compMOS-demo/src/components/bill/`
- [x] T006 [P] 备份现有BillList.vue和BillDetail.vue到`compMOS-demo/src/pages/backup/`，准备重构

---

## Phase 2: Foundational（基础设施和公共组件）

**Purpose**: 核心基础设施，所有用户故事的前置依赖

**⚠️ CRITICAL**: 本阶段必须完成后才能开始任何用户故事的开发

### Vuex Store设置

- [x] T007 实现Vuex store入口文件`compMOS-demo/src/store/index.js`，配置严格模式和模块化
- [x] T008 [P] 实现bill模块`compMOS-demo/src/store/modules/bill.js`，包含状态、mutations、actions（账单列表、当前账单、确认账单、撤销确认）
- [x] T009 [P] 实现order模块`compMOS-demo/src/store/modules/order.js`，包含订单列表、筛选、批量查询逻辑
- [x] T010 [P] 实现invoice模块`compMOS-demo/src/store/modules/invoice.js`，包含开票汇总、发票申请、发票抬头管理
- [x] T011 [P] 实现config模块`compMOS-demo/src/store/modules/config.js`，包含明细设置、字段配置
- [x] T012 [P] 实现user模块`compMOS-demo/src/store/modules/user.js`，包含用户信息、登录状态
- [x] T013 创建Vuex action/mutation类型常量文件`compMOS-demo/src/store/types.js`
- [x] T014 在`compMOS-demo/src/main.js`中引入并注册Vuex store

### API服务层

- [x] T015 实现Axios配置和拦截器`compMOS-demo/src/api/request.js`，包含统一错误处理、token注入、超时设置
- [x] T016 [P] 实现账单API服务`compMOS-demo/src/api/bill.js`，封装账单列表、详情、确认、撤销确认、订单查询等接口
- [x] T017 [P] 实现开票API服务`compMOS-demo/src/api/invoice.js`，封装开票汇总、申请开票、发票抬头管理等接口
- [x] T018 [P] 实现配置API服务`compMOS-demo/src/api/config.js`，封装明细设置、字段配置等接口

### 工具函数和常量

- [x] T019 更新常量定义`compMOS-demo/src/utils/constants.js`，添加新的账单状态枚举、发票类型、明细维度枚举
- [x] T020 [P] 实现表单验证工具`compMOS-demo/src/utils/validators.js`，包含税号、手机号、邮箱、数量等验证函数
- [x] T021 [P] 实现错误处理工具`compMOS-demo/src/utils/errorHandler.js`，业务错误码映射、HTTP错误处理
- [x] T022 [P] 增强格式化工具`compMOS-demo/src/utils/format.js`，补充业务类型映射、订单字段格式化函数

### 布局和公共组件改造

- [x] T023 重构MainLayout组件`compMOS-demo/src/components/layout/MainLayout.vue`，移除侧边栏Sidebar，简化为顶部导航+内容区域
- [x] T024 删除Sidebar组件`compMOS-demo/src/components/layout/Sidebar.vue`（不再使用）
- [x] T025 [P] 优化Breadcrumb组件`compMOS-demo/src/components/layout/Breadcrumb.vue`，支持账单详情页的动态面包屑
- [x] T026 [P] 增强StatusTag组件`compMOS-demo/src/components/common/StatusTag.vue`，添加新账单状态样式（调账中、待开票）
- [x] T027 [P] 确认EmptyState组件存在`compMOS-demo/src/components/common/EmptyState.vue`，用于空数据提示
- [x] T028 [P] 确认ConfirmDialog组件存在`compMOS-demo/src/components/common/ConfirmDialog.vue`，用于二次确认

### Mock数据准备

- [x] T029 更新账单Mock数据`compMOS-demo/src/mock/bills.js`，添加完整的账单包数据（包含各业务线金额统计、企业信息）
- [x] T030 [P] 更新订单Mock数据`compMOS-demo/src/mock/orders.js`，为每个业务线（机票/酒店/火车票/用车）生成完整字段的订单数据，包含通用字段+业务特有字段+财务字段
- [x] T031 [P] 更新发票Mock数据`compMOS-demo/src/mock/invoices.js`，添加完整的开票汇总数据、发票抬头列表、历史开票记录
- [x] T032 [P] 在`compMOS-demo/src/mock/mockData.js`中导出所有Mock数据，确保在开发模式下自动加载

**Checkpoint**: ✅ 基础设施完成，可以开始用户故事开发

---

## Phase 3: User Story 1 - 查看和筛选账单列表 (Priority: P1) 🎯 MVP

**Goal**: 实现账单列表作为系统唯一入口，支持日期范围、状态、订单号筛选

**Independent Test**: 用户登录后直接进入账单列表页，可以使用日期范围（默认最近1个月，最多180天）、账单状态、订单号进行筛选，列表显示结算周期、状态、账单总计、待开票金额，点击"查看详情"跳转到账单详情页

### Implementation for User Story 1

- [x] T033 [US1] 重构BillList页面组件`compMOS-demo/src/pages/BillList.vue`，移除卡片布局改为表格布局
- [x] T034 [US1] 在BillList中集成Vuex store，连接bill module的state和actions
- [x] T035 [US1] 实现日期范围筛选功能（Element UI DatePicker），默认显示最近1个月，限制最多180天
- [x] T036 [US1] 实现账单状态筛选功能（Select下拉），状态包括：待确认、调账中、待开票、待付款、已结清
- [x] T037 [US1] 实现订单号搜索功能，输入订单号点击搜索后跳转到对应账单详情页并自动搜索该订单
- [x] T038 [US1] 实现账单列表表格展示，字段包括：结算周期、状态（StatusTag）、账单总计、待开票金额、操作（查看详情）
- [x] T039 [US1] 实现分页功能（Element UI Pagination），每页20条
- [x] T040 [US1] 添加空状态展示（EmptyState），当筛选无结果时显示友好提示
- [x] T041 [US1] 添加加载状态和错误处理，使用LoadingButton和全局Message提示
- [x] T042 [US1] 更新路由配置`compMOS-demo/src/router/index.js`，将BillList设为默认首页（path: '/'）

**Checkpoint**: ✅ User Story 1完成，用户可以查看和筛选账单列表

---

## Phase 4: User Story 2 - 查看和确认账单详情（含完整数据展示） (Priority: P1)

**Goal**: 实现账单详情页，展示完整的账单汇总和订单明细数据（17个核心字段），支持确认账单操作

**Independent Test**: 用户点击账单详情后，可以查看账单汇总（总金额、各业务线金额统计、订单数量、企业信息）和账单明细（各业务线订单表，每条订单包含通用字段+业务特有字段+财务字段），点击"确认账单"按钮，经二次确认后账单状态变更为"待开票"，所有订单状态变为"已核对"

### Implementation for User Story 2

#### 账单详情页基础结构

- [x] T043 [US2] 重构BillDetail页面组件`compMOS-demo/src/pages/BillDetail.vue`，改为新的4步流程布局（确认账单→提交发票→付款→已结清）
- [x] T044 [US2] 在BillDetail中集成Vuex store，连接bill、order模块
- [x] T045 [US2] 实现流程步骤组件（使用Element UI Steps），根据账单状态动态高亮当前步骤
- [x] T046 [US2] 实现待确认状态的Tab切换（账单汇总、账单明细），移除预存机票/酒店tab

#### 账单汇总Tab

- [x] T047 [P] [US2] 创建BillSummary组件`compMOS-demo/src/components/bill/BillSummary.vue`，展示完整的账单汇总数据
- [x] T048 [US2] 在BillSummary中实现本期消费金额展示（大字号高亮显示）
- [x] T049 [US2] 实现业务线金额统计卡片，显示机票/酒店/火车票/用车的金额及占比（饼图或柱状图可选）
- [x] T050 [US2] 实现订单数量统计展示，包括总订单数、各业务线订单数、平均订单金额
- [x] T051 [US2] 实现企业信息卡片展示，包括企业名称、账户类型、信用额度/余额
- [x] T052 [US2] 实现结算周期时间范围展示（开始日期~结束日期）
- [x] T053 [US2] 添加"明细设置"按钮占位（US3将实现具体功能）

#### 账单明细Tab

- [x] T054 [P] [US2] 创建OrderTable组件`compMOS-demo/src/components/bill/OrderTable.vue`，展示订单列表表格
- [x] T055 [US2] 在账单明细Tab实现业务线子Tab（机票/酒店/火车票/用车），仅显示有数据的业务线
- [x] T056 [US2] 实现订单搜索功能，支持按订单号、核对状态、出行人/入住人、法人实体条件筛选
- [x] T057 [US2] 在OrderTable中实现订单列表展示，通用字段：订单号、预订日期、出行日期、预订人、出行人、支付金额、核对状态
- [x] T058 [US2] 实现机票订单特有字段展示：航班号、起飞时间、航线、舱位等级、电子客票号
- [x] T059 [US2] 实现酒店订单特有字段展示：酒店名称、入住日期、离店日期、房间数量、房型、入住人姓名
- [x] T060 [US2] 实现火车票订单特有字段展示：车次、出发时间、线路、座位等级、身份证号后四位
- [x] T061 [US2] 实现用车订单特有字段展示：用车时间、起点、终点、车型、行驶里程
- [x] T062 [US2] 实现财务字段展示：法人实体、支付账户、成本中心、项目部门、费用类型
- [x] T063 [US2] 实现订单明细底部汇总统计，显示当前查看/筛选的订单总数、总金额、各支付方式金额小计
- [x] T064 [US2] 添加"导出Excel"、"导出PDF"、"对账单字段配置"按钮占位（US4将实现具体功能）

#### 确认账单操作

- [x] T065 [US2] 在BillDetail底部实现"确认账单"按钮，仅在待确认状态显示
- [x] T066 [US2] 实现确认账单二次确认弹窗，显示"是否确认X~Y账单金额无误"及关键金额数据
- [x] T067 [US2] 实现确认账单操作，调用Vuex action确认账单，同步更新账单状态和订单状态
- [x] T068 [US2] 确认成功后自动刷新页面，流程步骤高亮移动到"提交发票"，操作按钮区域更新为"一键开票"和"撤销确认"
- [x] T069 [US2] 添加错误处理，确认失败时显示清晰的错误提示并保持原状态

**Checkpoint**: ✅ User Story 2完成，用户可以查看完整账单数据并确认账单

---

## Phase 5: User Story 5 - 提交发票申请（含完整开票数据） (Priority: P1)

**Goal**: 实现开票汇总展示、一键开票功能、撤销确认功能

**Independent Test**: 账单确认后，用户进入详情页看到三个Tab（开票汇总、账单汇总、账单明细），开票汇总Tab显示完整的应开票金额统计、发票明细表、发票抬头列表，点击"一键开票"进入开票页，填写完整开票信息并提交，账单进入"开票中"状态

### Implementation for User Story 5

#### 开票汇总Tab

- [x] T070 [P] [US5] 创建InvoiceSummary组件`compMOS-demo/src/components/bill/InvoiceSummary.vue`，展示开票汇总信息
- [x] T071 [US5] 在BillDetail中添加开票汇总Tab（待开票状态才显示，默认激活）
- [x] T072 [US5] 在InvoiceSummary中实现开票金额统计卡片，醒目展示：应开票金额、已开票金额、还可提交金额（高亮）
- [x] T073 [US5] 实现发票明细表格，按发票种类和发票摘要拆分展示，字段包括：发票种类、发票摘要、应开票金额、已开票金额、还可提交金额、对应订单数量
- [x] T074 [US5] 根据业务类型自动分类发票种类（机票→机票电子行程单，酒店/火车票/用车→增值税普票或专票）
- [x] T075 [US5] 实现发票抬头列表展示区域，显示企业已配置的发票抬头（抬头名称、税号、地址电话、开户行账号、默认标记）
- [x] T076 [US5] 添加"新增发票抬头"按钮占位（功能暂不实现，后续扩展）
- [x] T077 [US5] 实现开票申请记录列表展示（初始为空，提交开票后显示）

#### 撤销确认功能

- [x] T078 [US5] 在BillDetail操作按钮区域添加"撤销确认"按钮（待开票状态显示）
- [x] T079 [US5] 实现撤销确认二次确认弹窗，显示"撤销确认后账单状态将回退到待确认，是否继续？"
- [x] T080 [US5] 实现撤销确认操作，调用Vuex action回退账单状态和订单状态，记录完全回退
- [x] T081 [US5] 撤销成功后页面自动切换到账单汇总Tab，流程步骤高亮回退到"确认账单"
- [x] T082 [US5] 实现账单进入"开票中"状态后禁止撤销，按钮置灰并显示提示

#### 开票页

- [x] T083 [P] [US5] 创建InvoiceApply页面组件`compMOS-demo/src/pages/InvoiceApply.vue`，用于填写开票信息
- [x] T084 [P] [US5] 创建InvoiceForm组件`compMOS-demo/src/components/bill/InvoiceForm.vue`，开票信息表单
- [x] T085 [P] [US5] 创建InvoiceTitleSelector组件`compMOS-demo/src/components/bill/InvoiceTitleSelector.vue`，发票抬头选择器
- [x] T086 [US5] 在BillDetail中实现"一键开票"按钮点击，跳转到InvoiceApply页面（替换Tab区域）
- [x] T087 [US5] 在InvoiceApply中显示页面标题"填写开票信息"和返回按钮
- [x] T088 [US5] 实现开票信息表格展示，按发票种类和发票摘要拆分显示开票行
- [x] T089 [US5] 在InvoiceForm中实现每行开票信息的8个字段：发票种类（下拉）、发票摘要（只读）、开票金额（只读）、发票抬头（下拉）、接收人信息（姓名/电话/邮箱/地址）、单位（默认"元"）、数量（输入，最大5位数）、订单数（只读）
- [x] T090 [US5] 实现发票抬头下拉选择器，显示已配置抬头的完整信息，选中后自动填充税号、地址电话、开户行账号
- [x] T091 [US5] 实现接收人信息表单验证，电话格式、邮箱格式、地址长度验证（使用validators.js）
- [x] T092 [US5] 实现数量字段验证，限制最大5位数，超出时实时提示
- [x] T093 [US5] 实现必填字段实时验证，未填写字段标红显示，底部"申请开票"按钮根据验证状态置灰或高亮
- [x] T094 [US5] 在开票页顶部添加"拆分汇总"按钮占位（US7将实现具体功能）
- [x] T095 [US5] 在开票页底部实现"申请开票"按钮，按钮上方显示"共X行开票信息，总金额Y元"
- [x] T096 [US5] 实现点击"申请开票"后弹出最终确认窗口，显示开票信息汇总（发票种类、金额、抬头、接收人）
- [x] T097 [US5] 实现提交开票申请操作，调用Vuex action提交开票，更新账单状态为"开票中"
- [x] T098 [US5] 提交成功后返回开票汇总Tab，显示成功提示，已开票金额更新，还可提交金额减少，开票申请记录列表新增记录
- [x] T099 [US5] 添加开票申请提交失败的错误处理，显示清晰错误提示并保持原状态
- [x] T100 [US5] 更新路由配置，添加InvoiceApply页面路由

**Checkpoint**: ✅ User Story 5完成，用户可以查看开票汇总并提交开票申请

---

## Phase 6: User Story 3 - 配置账单明细展示维度 (Priority: P2)

**Goal**: 实现账单汇总的"明细设置"功能，支持按多维度拆分展示

**Independent Test**: 用户在账单汇总Tab点击"明细设置"，选择拆分维度（业务线/法人实体/支付账户/部门），保存后明细数据按多层级树形结构展示

### Implementation for User Story 3

- [x] T101 [P] [US3] 创建BillDetailSettings组件`compMOS-demo/src/components/bill/BillDetailSettings.vue`，明细设置弹窗
- [x] T102 [US3] 在BillSummary中实现"明细设置"按钮点击，唤起BillDetailSettings弹窗
- [x] T103 [US3] 在BillDetailSettings中实现拆分维度选择，从"业务线"、"法人实体"、"支付账户"、"部门"中多选
- [x] T104 [US3] 实现保存配置操作，调用Vuex action更新config模块的明细设置
- [x] T105 [US3] 在BillSummary中实现明细数据的多层级树形展示（Element UI Tree或自定义树形结构）
- [x] T106 [US3] 根据明细设置配置动态渲染树形结构，每个层级显示维度名称、汇总金额、订单数量
- [x] T107 [US3] 实现树形节点的展开/收起功能
- [x] T108 [US3] 将明细设置保存到LocalStorage，下次打开自动应用

**Checkpoint**: ✅ User Story 3完成，用户可以配置并查看多维度明细

---

## Phase 7: User Story 4 - 配置和导出对账单 (Priority: P2)

**Goal**: 实现对账单字段配置和Excel/PDF导出功能

**Independent Test**: 用户在账单明细Tab点击"对账单字段配置"，分别配置显示字段、Excel导出字段、PDF导出字段（最多20个），保存后可以点击"导出Excel"和"导出PDF"，下载包含配置字段的文件

### Implementation for User Story 4

#### 字段配置

- [x] T109 [P] [US4] 创建FieldConfigDialog组件`compMOS-demo/src/components/bill/FieldConfigDialog.vue`，字段配置弹窗
- [x] T110 [US4] 在账单明细Tab实现"对账单字段配置"按钮点击，唤起FieldConfigDialog弹窗
- [x] T111 [US4] 在FieldConfigDialog中实现三个字段列表配置：显示字段、Excel导出字段、PDF导出字段（使用Element UI Transfer穿梭框）
- [x] T112 [US4] 实现PDF字段数量限制，最多20个，超出时阻止保存并提示
- [x] T113 [US4] 实现保存配置操作，调用Vuex action更新config模块的字段配置
- [x] T114 [US4] 根据配置的显示字段动态更新OrderTable的列显示
- [x] T115 [US4] 将字段配置保存到LocalStorage，下次打开自动应用

#### Excel导出（前端实现）

- [x] T116 [P] [US4] 安装xlsx库：`npm install xlsx --save`（需要用户手动安装）
- [x] T117 [US4] 创建Excel导出工具函数`compMOS-demo/src/utils/excel.js`，封装exportToExcel方法
- [x] T118 [US4] 在账单明细Tab实现"导出Excel"按钮点击，调用excel.js导出当前业务线的订单数据
- [x] T119 [US4] 根据配置的Excel导出字段筛选数据列，设置列宽和样式
- [x] T120 [US4] 实现导出进度提示（Loading状态），导出成功后显示成功消息
- [x] T121 [US4] 添加导出失败的错误处理

#### PDF导出（后端实现，前端调用）

- [x] T122 [US4] 在账单明细Tab实现"导出PDF"按钮点击，调用bill API的exportBillToPDF方法
- [x] T123 [US4] 传递配置的PDF导出字段（最多20个）到后端API
- [x] T124 [US4] 接收后端返回的PDF Blob，创建下载链接并触发下载
- [x] T125 [US4] 实现导出进度提示（Loading状态），导出成功后显示成功消息
- [x] T126 [US4] 添加PDF导出失败的错误处理（如字段超过20个、后端服务异常）

**Checkpoint**: ✅ User Story 4完成，用户可以配置字段并导出Excel/PDF

---

## Phase 8: User Story 6 - 查看和管理已开发票 (Priority: P2)

**Goal**: 在开票汇总Tab显示发票申请记录列表，支持下载、红冲、换开操作

**Independent Test**: 账单进入"开票中"或"待付款"状态后，用户在开票汇总Tab查看发票申请记录列表，列表显示发票类型、内容、金额、抬头、提交人、申请时间、状态，可以对每条记录进行下载、红冲、换开操作

### Implementation for User Story 6

- [X] T127 [P] [US6] 创建InvoiceRecordTable组件`compMOS-demo/src/components/bill/InvoiceRecordTable.vue`，发票申请记录列表
- [X] T128 [US6] 在InvoiceSummary中集成InvoiceRecordTable，显示在开票汇总Tab底部
- [X] T129 [US6] 实现发票申请记录列表展示，字段包括：发票类型、内容、金额、抬头、提交人、申请时间、状态（pending/processing/completed/failed）
- [X] T130 [US6] 实现列表行可勾选功能（Element UI Table Selection）
- [X] T131 [US6] 在操作列添加"下载"、"红冲"、"换开"按钮
- [X] T132 [US6] 实现"下载"操作，调用invoice API的downloadInvoice方法，下载发票PDF文件
- [X] T133 [US6] 实现"红冲"操作，弹出确认窗口，确认后调用invoice API的redFlushInvoice方法
- [X] T134 [US6] 实现"换开"操作，弹出表单窗口要求输入新的发票抬头和税号，验证后调用invoice API的reissueInvoice方法
- [X] T135 [US6] 实现操作成功后的消息提示和列表刷新
- [X] T136 [US6] 添加操作失败的错误处理和用户提示

**Checkpoint**: ✅ User Story 6完成，用户可以查看和管理已开发票

---

## Phase 9: User Story 7 - 配置拆分汇总维度 (Priority: P3)

**Goal**: 在开票页实现"拆分汇总"功能，按维度拆分开票信息

**Independent Test**: 用户在开票页点击"拆分汇总"按钮，配置字段一和字段二（业务线/法人实体/支付账户/部门），保存后开票信息表按配置的维度分组展示，每组显示汇总金额和订单数，可展开查看明细

### Implementation for User Story 7

- [X] T137 [P] [US7] 创建InvoiceSplitConfig组件`compMOS-demo/src/components/bill/InvoiceSplitConfig.vue`，拆分汇总配置弹窗
- [X] T138 [US7] 在InvoiceApply页面实现"拆分汇总"按钮点击，唤起InvoiceSplitConfig弹窗
- [X] T139 [US7] 在InvoiceSplitConfig中实现字段一和字段二的选择，从"业务线"、"法人实体"、"支付账户"、"部门"中选择
- [X] T140 [US7] 实现字段重复验证，两个字段不能相同，重复时阻止保存并提示"字段不能重复"
- [X] T141 [US7] 实现保存配置操作，调用Vuex action更新invoice模块的拆分配置
- [X] T142 [US7] 在InvoiceForm中根据拆分配置动态生成多行开票信息，每行对应一个维度组合
- [X] T143 [US7] 实现开票信息表的分组展示（Element UI Table Group或自定义分组），每组显示汇总金额和订单数
- [X] T144 [US7] 实现分组的展开/收起功能，展开后显示该组的明细开票行
- [X] T145 [US7] 支持用户为每行独立配置发票抬头和接收人信息

**Checkpoint**: ✅ User Story 7完成，用户可以配置拆分汇总维度

---

## Phase 10: Polish & Cross-Cutting Concerns（优化和完善）

**Purpose**: 全局优化、性能提升、用户体验增强

- [X] T146 [P] 全局样式优化：统一颜色主题、间距、字号，确保UI一致性
- [X] T147 [P] 响应式布局检查：确保在1366x768和1920x1080分辨率下正常显示
- [X] T148 [P] 性能优化：实现虚拟滚动（如订单列表超过1000条），优化大列表渲染性能
- [X] T149 [P] Loading状态优化：为所有异步操作添加统一的Loading提示（Skeleton或Spinner）
- [X] T150 [P] 错误提示优化：统一错误消息样式，提供明确的用户引导（如"请重试"、"请联系管理员"）
- [X] T151 代码重构和清理：移除未使用的组件、函数、变量，优化代码结构
- [X] T152 [P] 注释和文档：为关键组件、复杂逻辑添加注释，更新README.md
- [X] T153 [P] 验证quickstart.md：按照快速启动指南测试项目初始化和运行流程
- [ ] T154 浏览器兼容性测试：在Chrome、Edge、Firefox、Safari中测试主要功能
- [X] T155 Mock数据完整性检查：确保所有Mock数据字段完整、逻辑一致
- [ ] T156 [P] Vuex状态调试：使用Vue Devtools检查状态变更流程，确保状态管理正确
- [ ] T157 路由跳转测试：测试所有路由跳转和面包屑导航
- [ ] T158 边界情况处理：测试空数据、超长文本、特殊字符等边界情况
- [X] T159 [P] 代码格式化：运行ESLint和Prettier，确保代码风格一致
- [ ] T160 最终验收测试：按照spec.md中的所有Acceptance Scenarios逐项测试

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 无依赖，可立即开始
- **Phase 2 (Foundational)**: 依赖Phase 1完成 - **阻塞所有用户故事**
- **Phase 3-9 (User Stories)**: 依赖Phase 2完成
  - User Story 1, 2, 5 (P1) 优先实现
  - User Story 3, 4, 6 (P2) 次优先
  - User Story 7 (P3) 最低优先级
- **Phase 10 (Polish)**: 依赖所有目标用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 依赖Foundational完成 - 无其他故事依赖
- **User Story 2 (P1)**: 依赖Foundational完成 - 依赖US1（账单列表跳转到详情）
- **User Story 5 (P1)**: 依赖Foundational完成 - 依赖US2（账单确认后才能开票）
- **User Story 3 (P2)**: 依赖US2完成（需要账单汇总Tab）
- **User Story 4 (P2)**: 依赖US2完成（需要账单明细Tab）
- **User Story 6 (P2)**: 依赖US5完成（需要开票申请数据）
- **User Story 7 (P3)**: 依赖US5完成（需要开票页）

### Within Each User Story

- 组件创建 → 数据集成 → 交互实现 → 验证优化
- Mock数据准备在Foundational阶段完成
- 所有用户故事可以在完成后独立测试

### Parallel Opportunities

- **Setup阶段**: T003-T006可并行
- **Foundational阶段**: 
  - Vuex模块（T008-T012）可并行
  - API服务（T016-T018）可并行
  - 工具函数（T020-T022）可并行
  - 布局组件（T025-T028）可并行
  - Mock数据（T030-T032）可并行
- **User Story阶段**: 
  - 不同用户故事可由不同团队成员并行开发（US1, US2独立）
  - US3, US4在US2完成后可并行
  - 同一用户故事内标记[P]的任务可并行

---

## Parallel Example: User Story 2

```bash
# 并行创建组件（T047, T054同时开始）:
Task T047: "创建BillSummary组件"
Task T054: "创建OrderTable组件"

# 并行实现订单不同业务类型字段（T058-T061同时开始）:
Task T058: "实现机票订单特有字段展示"
Task T059: "实现酒店订单特有字段展示"
Task T060: "实现火车票订单特有字段展示"
Task T061: "实现用车订单特有字段展示"
```

---

## Implementation Strategy

### MVP First（仅P1用户故事）

1. ✅ 完成Phase 1: Setup
2. ✅ 完成Phase 2: Foundational（**关键阶段** - 阻塞所有故事）
3. ✅ 完成Phase 3: User Story 1（账单列表）
4. ✅ 完成Phase 4: User Story 2（账单详情和确认）
5. ✅ 完成Phase 5: User Story 5（开票申请）
6. **STOP and VALIDATE**: 独立测试P1用户故事，确保核心流程完整
7. Deploy/Demo MVP版本

### Incremental Delivery（增量交付）

1. Setup + Foundational → 基础就绪
2. Add User Story 1 → 测试 → 部署/演示（MVP入口）
3. Add User Story 2 → 测试 → 部署/演示（核心对账功能）
4. Add User Story 5 → 测试 → 部署/演示（核心开票功能）✅ **完整MVP**
5. Add User Story 3 → 测试 → 部署/演示（明细配置增强）
6. Add User Story 4 → 测试 → 部署/演示（导出功能）
7. Add User Story 6 → 测试 → 部署/演示（发票管理）
8. Add User Story 7 → 测试 → 部署/演示（高级功能）
9. 每个故事独立交付，不破坏已有功能

### Parallel Team Strategy（团队并行策略）

如果有多位开发人员：

1. **共同完成** Setup + Foundational
2. **Foundational完成后分工**:
   - 开发者A: User Story 1（账单列表）
   - 开发者B: User Story 2（账单详情）
   - Mock数据由专人准备（T029-T032）
3. **US1, US2完成后**:
   - 开发者A: User Story 5（开票）
   - 开发者B: User Story 3+4（配置和导出）
4. **P1完成后**:
   - 开发者A: User Story 6（发票管理）
   - 开发者B: User Story 7（拆分汇总）
5. **共同完成** Polish & 验收测试

---

## Notes

- **[P] 标记**: 表示任务可与同阶段其他[P]任务并行，不同文件、无依赖
- **[Story] 标签**: 映射到spec.md中的用户故事，便于追踪
- **每个用户故事独立可测**: 完成一个故事后可立即验证功能
- **提交策略**: 每完成一个任务或一组相关任务后提交代码
- **Checkpoint验证**: 每个Phase结束时停下来验证该故事是否独立工作
- **避免**: 模糊任务、同文件冲突、破坏故事独立性的交叉依赖
- **Mock数据优先**: Foundational阶段完成所有Mock数据准备，确保用户故事开发时数据充足
- **前端优先**: 本项目重点是前端UI改造和Mock数据，API集成保留接口但暂时使用Mock数据

---

## Task Summary

**Total Tasks**: 160  
**Setup**: 6 tasks  
**Foundational**: 26 tasks（**阻塞关键**）  
**User Story 1 (P1)**: 10 tasks  
**User Story 2 (P1)**: 27 tasks  
**User Story 5 (P1)**: 30 tasks  
**User Story 3 (P2)**: 8 tasks  
**User Story 4 (P2)**: 18 tasks  
**User Story 6 (P2)**: 10 tasks  
**User Story 7 (P3)**: 9 tasks  
**Polish**: 15 tasks  

**MVP Scope** (P1 Only): Setup + Foundational + US1 + US2 + US5 = **99 tasks**

**Parallel Opportunities**: 约40%的任务标记为[P]，可并行执行

---

**Ready to Start?** 建议从 **Phase 1: Setup** 开始，使用命令：

```bash
/speckit.implement --phase 1
```

或从 **MVP核心功能** 开始：

```bash
/speckit.implement --story US1  # 账单列表
/speckit.implement --story US2  # 账单详情和确认
/speckit.implement --story US5  # 开票申请
```

