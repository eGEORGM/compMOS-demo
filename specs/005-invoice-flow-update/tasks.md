# Tasks: 开票流程优化

**Input**: Design documents from `/specs/005-invoice-flow-update/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Manual testing only (no automated tests in current phase)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Include exact file paths in descriptions

## Path Conventions

- **Web SPA**: `compMOS-demo/src/` at repository root
- **Pages**: `compMOS-demo/src/pages/`
- **Components**: `compMOS-demo/src/components/bill/`
- **Store**: `compMOS-demo/src/store/modules/`
- **Utils**: `compMOS-demo/src/utils/`
- **Mock**: `compMOS-demo/src/mock/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verification of existing structure

- [ ] T001 Verify existing project structure matches plan.md requirements in compMOS-demo/
- [ ] T002 [P] Verify Vue.js 2.x, Vuex 3.x, Vue Router 3.x, Element UI 2.x dependencies in compMOS-demo/package.json
- [ ] T003 [P] Verify existing router configuration in compMOS-demo/src/router/index.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Create invoiceSplitter utility class in compMOS-demo/src/utils/invoiceSplitter.js with splitOrders method
- [ ] T005 [P] Create configValidator utility functions in compMOS-demo/src/utils/configValidator.js with validateSplitConfig method
- [ ] T006 [P] Create configNew.js mock data file in compMOS-demo/src/mock/configNew.js with getSplitConfig, saveSplitConfig, deleteSplitConfig functions
- [ ] T007 Update mock/index.js to export configNew module in compMOS-demo/src/mock/index.js
- [ ] T008 Enhance invoicesNew.js to support split configuration in generateInvoiceRows function in compMOS-demo/src/mock/invoicesNew.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 确认账单后直接进入开票页面 (Priority: P1) 🎯 MVP

**Goal**: 用户确认账单后，系统自动跳转到开票页面，而不是停留在账单详情页

**Independent Test**: 用户在账单详情页点击"确认账单"，确认后系统自动跳转到开票页面（URL: /#/invoice-apply/BILL202601001?fromConfirm=true），显示开票信息填写表单

### Implementation for User Story 1

- [ ] T009 [US1] Add InvoiceApply route configuration in compMOS-demo/src/router/index.js with path '/invoice-apply/:billNo' and props: true
- [ ] T010 [US1] Modify confirmBillAction method in compMOS-demo/src/pages/BillDetail.vue to add router.push after successful confirmation
- [ ] T011 [US1] Update confirmBill action in compMOS-demo/src/store/modules/bill.js to ensure state sync before returning
- [ ] T012 [US1] Add page header with title and back button in compMOS-demo/src/pages/InvoiceApply.vue
- [ ] T013 [US1] Implement handleBack method with unsaved data check in compMOS-demo/src/pages/InvoiceApply.vue
- [ ] T014 [US1] Add beforeRouteLeave navigation guard to warn on unsaved data in compMOS-demo/src/pages/InvoiceApply.vue

**Checkpoint**: At this point, User Story 1 should be fully functional - confirming a bill should automatically navigate to invoice apply page

---

## Phase 4: User Story 2 - 开票页面自动检查并应用拆分配置 (Priority: P1)

**Goal**: 进入开票页面时自动检查用户拆分配置，已配置则自动应用，未配置则显示引导提示

**Independent Test**: 用户进入开票页面，系统检测到已有拆分配置，开票信息表自动按配置的维度分组显示；或检测到无配置，显示配置引导，用户配置后开票信息表立即按新配置分组

### Implementation for User Story 2

- [ ] T015 [US2] Add loadSplitConfig action in compMOS-demo/src/store/modules/config.js to load from LocalStorage
- [ ] T016 [US2] Add saveSplitConfig action in compMOS-demo/src/store/modules/config.js to save to Vuex and LocalStorage
- [ ] T017 [US2] Add checkSplitConfig method in compMOS-demo/src/pages/InvoiceApply.vue to check config on page load
- [ ] T018 [US2] Add config guide banner component in compMOS-demo/src/pages/InvoiceApply.vue showing when config is missing
- [ ] T019 [US2] Add "立即配置" button in config guide banner in compMOS-demo/src/pages/InvoiceApply.vue
- [ ] T020 [US2] Integrate InvoiceSplitConfig dialog component in compMOS-demo/src/pages/InvoiceApply.vue
- [ ] T021 [US2] Add "重新配置拆分汇总" button in compMOS-demo/src/pages/InvoiceApply.vue header section
- [ ] T022 [US2] Implement handleSaveSplitConfig method to save config and regenerate invoice rows in compMOS-demo/src/pages/InvoiceApply.vue
- [ ] T023 [US2] Add config validation warning when dimensions are duplicate in compMOS-demo/src/components/bill/InvoiceSplitConfig.vue

**Checkpoint**: At this point, User Story 2 should be fully functional - config detection and application should work correctly

---

## Phase 5: User Story 3 - 根据拆分配置生成开票信息行 (Priority: P1)

**Goal**: 根据用户配置的拆分维度，自动将账单数据按维度分组，每个分组生成一行独立的开票信息

**Independent Test**: 用户配置拆分维度后，开票信息表按配置的维度分组展示，每个分组对应一行开票信息，用户可以独立填写每行的开票信息

### Implementation for User Story 3

- [ ] T024 [US3] Implement splitByInvoiceType method in compMOS-demo/src/utils/invoiceSplitter.js for default splitting
- [ ] T025 [US3] Implement splitBySingleDimension method in compMOS-demo/src/utils/invoiceSplitter.js for single dimension splitting
- [ ] T026 [US3] Implement splitByTwoDimensions method in compMOS-demo/src/utils/invoiceSplitter.js for two dimension splitting
- [ ] T027 [US3] Add getDimensionValue and getDimensionLabel helper methods in compMOS-demo/src/utils/invoiceSplitter.js
- [ ] T028 [US3] Add getInvoiceType and getInvoiceTypeName helper methods in compMOS-demo/src/utils/invoiceSplitter.js
- [ ] T029 [US3] Modify InvoiceForm component to support grouped display in compMOS-demo/src/components/bill/InvoiceForm.vue
- [ ] T030 [US3] Add tree table structure for two-dimension grouping in compMOS-demo/src/components/bill/InvoiceForm.vue
- [ ] T031 [US3] Implement generateInvoiceRows method in compMOS-demo/src/pages/InvoiceApply.vue using InvoiceSplitter
- [ ] T032 [US3] Add real-time validation for recipientInfo fields (phone, email, address) in compMOS-demo/src/components/bill/InvoiceForm.vue
- [ ] T033 [US3] Add quantity field validation (max 99999) in compMOS-demo/src/components/bill/InvoiceForm.vue
- [ ] T034 [US3] Add submit button enable/disable logic based on required fields in compMOS-demo/src/pages/InvoiceApply.vue
- [ ] T035 [US3] Add invoice summary display above submit button in compMOS-demo/src/pages/InvoiceApply.vue

**Checkpoint**: At this point, User Story 3 should be fully functional - invoice rows should be generated and displayed correctly based on split configuration

---

## Phase 6: User Story 4 - 提交开票后查看简化的开票汇总 (Priority: P1)

**Goal**: 提交开票后，返回账单详情页的开票汇总tab，仅显示开票申请记录表，移除发票列表

**Independent Test**: 用户提交开票后，返回账单详情页的开票汇总tab，仅显示开票申请记录表，包含刚提交的申请记录及其状态

### Implementation for User Story 4

- [ ] T036 [US4] Modify handleSubmitInvoice method to navigate back to BillDetail after success in compMOS-demo/src/pages/InvoiceApply.vue
- [ ] T037 [US4] Update submitInvoiceApplication action to return application record in compMOS-demo/src/store/modules/invoice.js
- [ ] T038 [US4] Remove invoice list table section from InvoiceSummaryContent in compMOS-demo/src/components/bill/InvoiceSummaryContent.vue
- [ ] T039 [US4] Keep only InvoiceRecordTable component in InvoiceSummaryContent in compMOS-demo/src/components/bill/InvoiceSummaryContent.vue
- [ ] T040 [US4] Update InvoiceRecordTable to show all required columns in compMOS-demo/src/components/bill/InvoiceRecordTable.vue
- [ ] T041 [US4] Ensure application records are sorted by applyTime descending in compMOS-demo/src/components/bill/InvoiceRecordTable.vue
- [ ] T042 [US4] Add success message display after invoice submission in compMOS-demo/src/pages/BillDetail.vue
- [ ] T043 [US4] Update mock API submitInvoiceApplication to generate application record in compMOS-demo/src/mock/index.js

**Checkpoint**: At this point, User Story 4 should be fully functional - submitting invoice should navigate back and show simplified summary

---

## Phase 7: User Story 5 - 主动返回开票汇总查看申请状态 (Priority: P2)

**Goal**: 用户在开票页面可以点击返回按钮返回账单详情页查看开票汇总，然后可以再次点击"一键开票"继续填写

**Independent Test**: 用户在开票页面点击返回按钮，返回账单详情页查看开票汇总tab，可以查看开票申请记录，再次点击"一键开票"可以重新进入开票页面

### Implementation for User Story 5

- [ ] T044 [US5] Enhance handleBack method to navigate to BillDetail with invoice tab in compMOS-demo/src/pages/InvoiceApply.vue
- [ ] T045 [US5] Update handleApplyInvoice method to navigate to InvoiceApply page in compMOS-demo/src/pages/BillDetail.vue
- [ ] T046 [US5] Ensure "一键开票" button is visible in invoice summary tab in compMOS-demo/src/pages/BillDetail.vue
- [ ] T047 [US5] Add logic to clear unsaved invoice form data when re-entering in compMOS-demo/src/pages/InvoiceApply.vue

**Checkpoint**: At this point, User Story 5 should be fully functional - users can navigate back and forth between invoice apply and summary

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T048 [P] Add loading states for all async operations in compMOS-demo/src/pages/InvoiceApply.vue
- [ ] T049 [P] Add error handling and user-friendly error messages in compMOS-demo/src/pages/InvoiceApply.vue
- [ ] T050 [P] Add data protection warning when config changes in compMOS-demo/src/pages/InvoiceApply.vue
- [ ] T051 [P] Optimize InvoiceSplitter performance for large datasets (10,000+ orders) in compMOS-demo/src/utils/invoiceSplitter.js
- [ ] T052 [P] Add empty state handling when no invoice rows generated in compMOS-demo/src/components/bill/InvoiceForm.vue
- [ ] T053 [P] Add form validation feedback (red borders, error messages) in compMOS-demo/src/components/bill/InvoiceForm.vue
- [ ] T054 [P] Update quickstart.md validation - test all demo paths in compMOS-demo/
- [ ] T055 [P] Code cleanup and refactoring - remove unused code and comments
- [ ] T056 [P] Verify all acceptance scenarios from spec.md are implemented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 for InvoiceApply page structure
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Depends on US2 for config detection
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - Depends on US3 for invoice submission
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 and US4 for navigation

### Within Each User Story

- Utils before components
- Components before pages
- Store actions before page methods
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes:
  - T009-T014 (US1) can run sequentially
  - T015-T023 (US2) can run after US1 structure is ready
  - T024-T035 (US3) can run after US2 config is ready
  - T036-T043 (US4) can run after US3 submission is ready
  - T044-T047 (US5) can run after US1 and US4 are ready
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all foundational utils together:
Task: "Create invoiceSplitter utility class in compMOS-demo/src/utils/invoiceSplitter.js"
Task: "Create configValidator utility functions in compMOS-demo/src/utils/configValidator.js"
Task: "Create configNew.js mock data file in compMOS-demo/src/mock/configNew.js"

# Launch all store actions together (after utils):
Task: "Add loadSplitConfig action in compMOS-demo/src/store/modules/config.js"
Task: "Add saveSplitConfig action in compMOS-demo/src/store/modules/config.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Confirm bill → Should navigate to invoice apply page
   - Verify URL and page structure
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (routing and navigation)
   - Developer B: User Story 2 (config detection) - can start after US1 structure
   - Developer C: User Story 3 (data splitting) - can start after US2 config
3. Stories complete and integrate independently

---

## Task Summary

- **Total Tasks**: 56 tasks
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 5 tasks
- **Phase 3 (US1)**: 6 tasks
- **Phase 4 (US2)**: 9 tasks
- **Phase 5 (US3)**: 12 tasks
- **Phase 6 (US4)**: 8 tasks
- **Phase 7 (US5)**: 4 tasks
- **Phase 8 (Polish)**: 9 tasks

### Task Count per User Story

- **User Story 1**: 6 tasks (T009-T014)
- **User Story 2**: 9 tasks (T015-T023)
- **User Story 3**: 12 tasks (T024-T035)
- **User Story 4**: 8 tasks (T036-T043)
- **User Story 5**: 4 tasks (T044-T047)

### Parallel Opportunities Identified

- **Phase 2**: 5 tasks can run in parallel (T004-T008)
- **Phase 8**: 9 tasks can run in parallel (T048-T056)
- **Within US2**: T015 and T016 can run in parallel
- **Within US3**: T024-T027 can run in parallel

### Independent Test Criteria

- **US1**: Confirm bill → Navigate to invoice apply page → Verify URL and page structure
- **US2**: Enter invoice apply page → Check config detection → Verify config guide or auto-application
- **US3**: Configure split dimensions → Verify invoice rows grouped correctly → Fill form fields
- **US4**: Submit invoice → Navigate back → Verify simplified summary (only application records)
- **US5**: Click back button → View summary → Click "一键开票" → Re-enter invoice apply page

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 (User Story 1 only)**

This delivers the core flow change: confirming a bill automatically navigates to the invoice apply page. This is the most critical user experience improvement and can be validated independently.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing only (no automated tests in current phase)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths are relative to compMOS-demo/ directory

