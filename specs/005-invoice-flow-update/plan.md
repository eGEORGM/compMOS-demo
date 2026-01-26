# Implementation Plan: 开票流程优化

**Branch**: `005-invoice-flow-update` | **Date**: 2026-01-23 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/005-invoice-flow-update/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本次实施计划旨在优化结算平台的开票流程，将开票操作前置到账单确认后的第一步，提升用户操作连贯性和效率。核心变更包括：

1. **流程重构**：确认账单后直接跳转到开票页面，减少中间查看步骤
2. **智能配置检测**：自动检查并应用用户的发票拆分汇总维度配置
3. **动态数据拆分**：根据配置维度自动生成分组的开票信息行
4. **界面简化**：开票汇总tab仅显示申请记录表，移除发票列表

**技术方法**：基于现有的 Vue.js + Element UI + Vuex 架构，通过路由重定向、状态管理优化、组件重构实现流程变更。主要涉及 `BillDetail.vue` 页面的跳转逻辑、`InvoiceApply.vue` 页面的配置检测逻辑、`InvoiceSummaryContent.vue` 组件的展示简化。

## Technical Context

**Language/Version**: JavaScript (ES6+) / Vue.js 2.x  
**Primary Dependencies**: Vue.js 2.x, Vuex 3.x, Vue Router 3.x, Element UI 2.x, Mock.js  
**Storage**: LocalStorage (用户配置)，内存状态 (Mock 数据)  
**Testing**: 手动测试 (当前阶段)，Jest + Vue Test Utils (后续考虑)  
**Target Platform**: 现代浏览器 (Chrome 90+, Edge 90+, Firefox 88+)  
**Project Type**: Web 单页应用 (SPA)  
**Performance Goals**: 
- 页面跳转响应时间 < 1秒
- 开票信息表加载 < 2秒 (支持10,000条订单)
- 配置变更重新渲染 < 1秒
**Constraints**: 
- 必须保持与现有 003-settlement-redesign 架构一致
- 仅前端实现，使用 Mock 数据
- 不引入新的第三方依赖
- 保持向后兼容（已有配置不受影响）
**Scale/Scope**: 
- 影响 3个核心页面/组件 (BillDetail, InvoiceApply, InvoiceSummaryContent)
- 新增 1个配置检测模块
- 修改 4-5个 Vuex actions/mutations
- Mock 数据增强 (支持拆分配置应用)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

由于项目使用空模板 constitution，此处基于实际项目实践进行检查：

### ✓ 架构一致性
- **Pass**: 遵循现有 Vue.js + Vuex + Vue Router 架构
- **Pass**: 组件化设计，符合单一职责原则
- **Pass**: 状态管理集中在 Vuex store

### ✓ 数据流规范
- **Pass**: 单向数据流 (Vuex actions → mutations → state → components)
- **Pass**: 组件间通信通过 props 和 events
- **Pass**: 异步操作在 actions 中处理

### ✓ 用户体验原则
- **Pass**: 响应时间目标明确 (< 1-2秒)
- **Pass**: 加载状态和错误处理完善
- **Pass**: 操作反馈及时（成功/失败提示）

### ✓ 代码质量
- **Pass**: 组件复用性高
- **Pass**: 配置与逻辑分离
- **Pass**: Mock 数据结构清晰

**结论**: 通过所有检查项，可以进入 Phase 0 研究阶段

## Project Structure

### Documentation (this feature)

```text
specs/005-invoice-flow-update/
├── spec.md              # 功能规范 (已完成)
├── plan.md              # 本文件 (实施计划)
├── research.md          # Phase 0 输出 (技术研究)
├── data-model.md        # Phase 1 输出 (数据模型)
├── quickstart.md        # Phase 1 输出 (快速开始)
├── contracts/           # Phase 1 输出 (API contracts)
│   ├── split-config-api.yaml
│   └── invoice-application-api.yaml
├── checklists/          # 质量检查清单 (已完成)
│   └── requirements.md
└── tasks.md             # Phase 2 输出 (/speckit.tasks 命令)
```

### Source Code (repository root)

```text
compMOS-demo/
├── src/
│   ├── pages/
│   │   ├── BillDetail.vue           # [修改] 账单详情页，添加确认后跳转逻辑
│   │   └── InvoiceApply.vue         # [修改] 开票申请页，添加配置检测逻辑
│   ├── components/
│   │   └── bill/
│   │       ├── InvoiceSummaryContent.vue  # [修改] 简化展示，移除发票列表
│   │       ├── InvoiceForm.vue            # [修改] 支持配置驱动的分组展示
│   │       └── InvoiceSplitConfig.vue     # [可能复用] 拆分配置对话框
│   ├── store/
│   │   └── modules/
│   │       ├── bill.js              # [修改] 添加确认后跳转的 action
│   │       ├── config.js            # [增强] 配置检测和应用逻辑
│   │       └── invoice.js           # [修改] 简化开票汇总数据结构
│   ├── router/
│   │   └── index.js                 # [修改] 添加开票页面路由参数支持
│   ├── mock/
│   │   ├── index.js                 # [修改] 支持基于配置的数据拆分
│   │   ├── invoicesNew.js           # [增强] 根据拆分配置生成开票行
│   │   └── configNew.js             # [新增] 拆分配置的 Mock 数据和API
│   └── utils/
│       ├── invoiceSplitter.js       # [新增] 开票数据拆分工具函数
│       └── configValidator.js       # [新增] 配置验证工具函数
└── tests/                           # [暂不实施] 单元测试
```

**Structure Decision**: 采用 Web 单页应用结构，保持与 003-settlement-redesign 一致的目录组织。核心修改集中在页面层 (BillDetail, InvoiceApply)、组件层 (InvoiceSummaryContent, InvoiceForm) 和状态管理层 (Vuex modules)。新增工具函数模块 (invoiceSplitter, configValidator) 处理配置相关逻辑。

## Complexity Tracking

> 本实施计划未违反任何架构原则，无需填写此表

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Implementation Phases

### Phase 0: Research & Technology Decisions

**研究任务**：

1. **Vue Router 编程式导航最佳实践**
   - 研究 `router.push()` vs `router.replace()` 的使用场景
   - 确认账单后跳转到开票页面的最佳方式
   - 研究路由参数传递 (billNo, fromConfirm flag)

2. **Vuex 状态同步策略**
   - 研究跨页面状态同步的最佳实践
   - 确保确认账单后状态在新页面正确加载
   - 研究配置变更时的状态重置策略

3. **LocalStorage 配置持久化**
   - 研究用户配置的存储结构设计
   - 确保配置的读取性能
   - 研究配置迁移策略（如果配置结构变更）

4. **动态数据拆分算法**
   - 研究基于多维度配置的数据分组算法
   - 优化大数据量（10,000+ 订单）的拆分性能
   - 研究树形结构的展示和交互模式

5. **组件通信模式**
   - 研究父子组件间的配置传递
   - 确保配置变更能及时通知所有相关组件
   - 研究 EventBus vs props/events 的取舍

**输出**：`research.md`，包含所有技术决策、最佳实践建议和代码示例

### Phase 1: Data Model & API Contracts

#### 数据模型设计

**核心实体**：

1. **SplitConfiguration (拆分配置)**
   ```typescript
   {
     dimension1: 'businessLine' | 'legalEntity' | 'paymentAccount' | 'department' | null,
     dimension2: 'businessLine' | 'legalEntity' | 'paymentAccount' | 'department' | null,
     enabled: boolean,
     lastUpdated: string (ISO 8601)
   }
   ```

2. **InvoiceRow (开票信息行)**
   ```typescript
   {
     id: string,
     groupLabel: string,              // 如 "机票 - 北京分公司"
     invoiceType: string,              // 发票种类
     amount: number,                   // 开票金额
     orderCount: number,               // 订单数量
     titleId: string | null,           // 发票抬头ID
     recipientInfo: {                  // 接收人信息
       name: string,
       phone: string,
       email: string,
       address: string
     } | null,
     quantity: number,                 // 数量
     dimensionValues: {                // 维度值（用于分组）
       dimension1: string | null,
       dimension2: string | null
     }
   }
   ```

3. **InvoiceApplication (开票申请记录)**
   ```typescript
   {
     applicationNo: string,
     billNo: string,
     invoiceType: string,
     content: string,
     amount: number,
     titleName: string,
     taxNumber: string,
     submitter: string,
     applyTime: string (ISO 8601),
     status: 'processing' | 'completed' | 'failed',
     remark: string
   }
   ```

**状态流转**：

```
账单状态: 待确认 → [确认账单] → 待开票 → [提交开票] → 开票中 → [后台处理] → 待付款
```

#### API Contracts

**文件位置**：`/contracts/`

1. **split-config-api.yaml** - 拆分配置相关 API
   - `GET /api/config/split` - 获取当前用户的拆分配置
   - `POST /api/config/split` - 保存拆分配置
   - `DELETE /api/config/split` - 清除拆分配置

2. **invoice-application-api.yaml** - 开票申请相关 API
   - `POST /api/bills/{billNo}/confirm` - 确认账单
   - `GET /api/bills/{billNo}/invoice-rows` - 获取开票信息行（应用拆分配置）
   - `POST /api/bills/{billNo}/invoice-applications` - 提交开票申请
   - `GET /api/bills/{billNo}/invoice-applications` - 获取开票申请记录列表

#### Quickstart Guide

**文件位置**：`quickstart.md`

内容包括：
- 本地开发环境搭建
- 功能演示路径（确认账单 → 开票页面 → 配置拆分 → 提交）
- Mock 数据说明
- 常见问题排查

**输出**：`data-model.md`, `/contracts/*.yaml`, `quickstart.md`

### Phase 2: Task Breakdown (由 /speckit.tasks 命令生成)

**任务生成策略**：

按以下维度拆分任务：
1. **路由和导航** (3-4个任务)
   - 修改确认账单后的跳转逻辑
   - 添加开票页面路由参数支持
   - 实现返回按钮逻辑

2. **配置检测与应用** (4-5个任务)
   - 实现配置检测模块
   - 开票页面加载时的配置检查
   - 配置对话框集成
   - 配置变更时的数据重载

3. **数据拆分与展示** (5-6个任务)
   - 实现 invoiceSplitter 工具函数
   - 修改 InvoiceForm 支持分组展示
   - 实现树形结构的交互
   - Mock 数据增强

4. **开票汇总简化** (2-3个任务)
   - 移除 InvoiceSummaryContent 的发票列表
   - 调整开票申请记录表展示
   - 更新 Vuex invoice module

5. **状态管理优化** (3-4个任务)
   - 修改 bill.js 添加确认后跳转
   - 增强 config.js 配置管理
   - 实现状态同步逻辑

6. **用户体验优化** (3-4个任务)
   - 添加加载状态和错误处理
   - 实现数据保护提示
   - 优化表单验证

**预估总任务数**：20-26个任务

**输出**：将由 `/speckit.tasks` 命令生成 `tasks.md`

## Next Steps

1. **Phase 0 Complete**: 研究文档已生成 → 进入 Phase 1
2. **Phase 1 Complete**: 数据模型和 API Contracts 已生成 → 准备执行 `/speckit.tasks`
3. **Phase 2**: 执行 `/speckit.tasks` 生成详细任务分解
4. **Implementation**: 使用 `/speckit.implement` 按任务执行实施

## Risk Mitigation

### 技术风险

1. **路由跳转时机问题**
   - **风险**：确认账单的异步操作未完成就跳转，导致新页面数据不一致
   - **缓解**：使用 `await` 确保状态更新完成后再跳转，添加加载状态

2. **配置检测性能**
   - **风险**：每次进入开票页面都检测配置，可能影响加载速度
   - **缓解**：在 Vuex 中缓存配置，仅首次加载时从 LocalStorage 读取

3. **大数据量拆分性能**
   - **风险**：10,000+ 订单按多维度拆分时计算耗时
   - **缓解**：实施分页加载和虚拟滚动，优化拆分算法

4. **状态同步复杂度**
   - **风险**：跨页面状态同步可能出现不一致
   - **缓解**：使用 Vuex 作为单一数据源，避免组件内部状态

### 用户体验风险

1. **跳转突兀感**
   - **风险**：自动跳转可能让用户感到困惑
   - **缓解**：在确认弹窗中提示"确认后将进入开票页面"

2. **配置变更数据丢失**
   - **风险**：用户填写一半重新配置导致数据清空
   - **缓解**：配置变更时弹出警告确认

3. **返回时未保存提示**
   - **风险**：用户误操作导致数据丢失
   - **缓解**：实施页面卸载前确认

## Success Metrics

- ✅ 确认账单到进入开票页面 < 1秒
- ✅ 开票页面加载完成 < 2秒
- ✅ 配置检测准确率 100%
- ✅ 拆分数据准确率 100%
- ✅ 用户完成开票时间减少 30%
- ✅ 所有手动测试用例通过

## 附录：Agent Context Update

执行命令：`.specify/scripts/bash/update-agent-context.sh cursor-agent`

**更新内容**：
- 项目类型：Vue.js SPA
- 核心技术：Vue 2.x, Vuex, Vue Router, Element UI
- 新增技术：配置驱动的数据拆分模式
- 开发约束：仅前端实现，使用 Mock 数据
