<template>
  <div class="bill-detail-page">
    <!-- 面包屑 -->
    <div class="breadcrumb-container">
      <span class="breadcrumb-item" @click="$router.back()">账单列表</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item active">账单详情</span>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 账单内容 -->
    <div v-else-if="currentBill" class="bill-content">
      <!-- 流程步骤条 -->
      <el-card class="steps-card">
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step title="确认账单"></el-step>
          <el-step title="开票"></el-step>
          <el-step title="付款"></el-step>
          <el-step title="已结清"></el-step>
        </el-steps>
      </el-card>

      <!-- 日期和操作区域 -->
      <el-card class="action-card">
        <div class="action-header">
          <div class="date-range">
            <i class="el-icon-date"></i>
            {{ formatBillCycleRange(currentBill.settlementCycle) }}
          </div>
          <div class="action-buttons">
            <!-- 待确认状态：确认账单按钮 -->
            <el-button
              v-if="currentBill.billStatus === BILL_STATUS.PENDING_CONFIRM"
              type="primary"
              :loading="submitting"
              @click="handleConfirmBill"
            >
              确认账单
            </el-button>
            <!-- 开票中状态：一键开票和撤销确认 -->
            <template v-else-if="currentBill.billStatus === BILL_STATUS.INVOICING">
              <el-button type="primary" @click="handleApplyInvoice">一键开票</el-button>
              <el-button @click="handleCancelConfirm">撤销确认</el-button>
            </template>
            <!-- 待付款状态：显示开票完成 -->
            <template v-else-if="currentBill.billStatus === BILL_STATUS.PENDING_PAYMENT">
              <el-tag type="success">开票完成</el-tag>
            </template>
            <!-- 所有状态都显示拆分汇总 -->
            <el-button icon="el-icon-folder-opened" @click="handleDetailSettings">拆分汇总</el-button>
            <el-button icon="el-icon-download" @click="handleExportExcel">导出全部Excel</el-button>
            <el-button icon="el-icon-download" @click="handleExportPDF">导出全部PDF</el-button>
          </div>
        </div>
      </el-card>

      <!-- 标签页和内容区域 -->
      <el-row :gutter="16">
        <!-- 左侧主内容区 -->
        <el-col :xs="24" :lg="16">
          <!-- 开票表单模式 -->
          <el-card v-if="showInvoiceForm" class="tabs-card">
            <div class="invoice-apply-header">
              <el-button icon="el-icon-arrow-left" @click="exitInvoiceForm" size="small">
                返回账单详情
              </el-button>
              <h3 class="section-title">填写开票信息</h3>
            </div>
            
            <div v-loading="invoiceFormLoading" class="invoice-apply-content">
              <!-- 拆分汇总按钮 -->
              <div class="action-section">
                <el-button icon="el-icon-folder-opened" @click="handleDetailSettings">
                  拆分汇总
                </el-button>
              </div>

              <!-- 开票信息表单 -->
              <invoice-form
                ref="invoiceForm"
                :bill-no="billNo"
                :invoice-rows="invoiceRows"
                :invoice-titles="invoiceTitles"
                :split-config="splitConfig"
                @update="handleInvoiceFormUpdate"
              ></invoice-form>

              <!-- 底部操作区 -->
              <div class="invoice-footer-actions">
                <div class="summary-info">
                  <span class="summary-label">共</span>
                  <span class="summary-value">{{ invoiceRowCount }}</span>
                  <span class="summary-label">行开票信息，总金额</span>
                  <span class="summary-value highlight">{{ formatAmount(invoiceTotalAmount) }}</span>
                  <span class="summary-label">元</span>
                </div>
                <el-button
                  type="primary"
                  size="large"
                  :loading="submitting"
                  :disabled="!canSubmitInvoice"
                  @click="handleSubmitInvoice"
                >
                  申请开票
                </el-button>
              </div>
            </div>
          </el-card>
          
          <!-- 标签页（正常模式） -->
          <el-card v-else class="tabs-card">
            <el-tabs v-model="activeTab">
              <!-- 开票汇总（开票中及以后状态显示） -->
              <el-tab-pane
                v-if="currentBill.billStatus >= BILL_STATUS.INVOICING"
                label="开票汇总"
                name="invoice"
              >
                <invoice-summary-content :bill-no="billNo"></invoice-summary-content>
              </el-tab-pane>

              <!-- 账单汇总（待确认和开票中状态显示） -->
              <el-tab-pane
                v-if="currentBill.billStatus < BILL_STATUS.PENDING_PAYMENT"
                label="账单汇总"
                name="summary"
              >
                <bill-summary-content :bill="currentBill"></bill-summary-content>
              </el-tab-pane>

              <!-- 账单明细（包含各业务线子Tab，待确认和开票中状态显示） -->
              <el-tab-pane
                v-if="currentBill.billStatus < BILL_STATUS.PENDING_PAYMENT"
                label="账单明细"
                name="orders"
              >
                <bill-orders-tab :bill-no="billNo"></bill-orders-tab>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>

        <!-- 右侧边栏 -->
        <el-col :xs="24" :lg="8">
          <!-- 基本信息 -->
          <el-card class="info-card">
            <div slot="header" class="card-header">
              <span>基本信息</span>
            </div>
            <div class="info-content">
              <div class="info-item">
                <span class="info-label">企业名称：</span>
                <span class="info-value">{{ currentBill.companyName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">企业ID：</span>
                <span class="info-value">{{ currentBill.companyId }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">账单状态：</span>
                <span class="info-value">
                  <el-tag :type="getBillStatusType(currentBill.billStatus)" size="small">
                    {{ getBillStatusName(currentBill.billStatus) }}
                  </el-tag>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">账单总额：</span>
                <span class="info-value highlight">{{ formatAmount(currentBill.totalAmount) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">待开票金额：</span>
                <span class="info-value">{{ formatAmount(currentBill.pendingInvoiceAmount) }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 确认账单对话框 -->
    <el-dialog
      title="确认账单"
      :visible.sync="confirmDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="confirm-dialog-content">
        <p class="confirm-message">
          是否确认 <strong>{{ formatBillCycleRange(currentBill && currentBill.settlementCycle) }}</strong> 账单金额无误？
        </p>
        <div class="confirm-amount">
          <div class="amount-item">
            <span class="label">账单总额：</span>
            <span class="value">{{ formatAmount(currentBill && currentBill.totalAmount) }}</span>
          </div>
          <div class="amount-item">
            <span class="label">订单数量：</span>
            <span class="value">{{ billSummary && billSummary.totalCount }}笔</span>
          </div>
        </div>
        <p class="confirm-hint">确认后账单将进入开票流程，请仔细核对数据。</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmBillAction">确定</el-button>
      </span>
    </el-dialog>

    <!-- 撤销确认对话框 -->
    <el-dialog
      title="撤销确认"
      :visible.sync="cancelDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="confirm-dialog-content">
        <p class="confirm-message">
          撤销确认后，账单状态将回退到 <strong>待确认</strong>，是否继续？
        </p>
        <p class="confirm-hint warn">此操作不可恢复，请谨慎操作。</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelDialogVisible = false">取消</el-button>
        <el-button type="warning" :loading="submitting" @click="cancelConfirmAction">确定</el-button>
      </span>
    </el-dialog>
    
    <!-- 拆分汇总配置对话框（统一使用） -->
    <invoice-split-config
      v-model="splitConfigVisible"
      :current-config="splitConfig"
      @save="handleSaveSplitConfig"
    ></invoice-split-config>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import { BILL_STATUS, BILL_STATUS_NAMES, BILL_STATUS_COLORS } from "@/utils/constants";
import { formatAmount, formatBillCycle } from "@/utils/format";
import { showSuccess, showWarning, handleApiError } from "@/utils/errorHandler";
import BillSummaryContent from "@/components/bill/BillSummaryContent.vue";
import BillOrdersTab from "@/components/bill/BillOrdersTab.vue";
import InvoiceSummaryContent from "@/components/bill/InvoiceSummaryContent.vue";
import InvoiceForm from "@/components/bill/InvoiceForm.vue";
import InvoiceSplitConfig from "@/components/bill/InvoiceSplitConfig.vue";

export default {
  name: "BillDetail",
  components: {
    BillSummaryContent,
    BillOrdersTab,
    InvoiceSummaryContent,
    InvoiceForm,
    InvoiceSplitConfig
  },
  data() {
    return {
      billNo: this.$route.params.billNo,
      activeTab: "summary",
      confirmDialogVisible: false,
      cancelDialogVisible: false,
      submitting: false,
      BILL_STATUS,
      
      // 开票表单相关
      showInvoiceForm: false,
      invoiceFormLoading: false,
      invoiceRows: [],
      invoiceTitles: [],
      invoiceTotalAmount: 0,
      invoiceRowCount: 0,
      
      // 拆分汇总配置（统一使用）
      splitConfigVisible: false,
      splitConfig: { dimensions: [] }
    };
  },
  computed: {
    ...mapState("bill", ["currentBill", "loading"]),
    ...mapState("order", ["orderList"]),
    
    billSummary() {
      return this.currentBill && this.currentBill.summary;
    },
    
    /**
     * 已核对订单数
     */
    checkedOrderCount() {
      if (!this.billSummary || !this.billSummary.businessLineSummary) return 0;
      return this.billSummary.businessLineSummary.reduce((sum, item) => {
        return sum + (item.checkedCount || 0);
      }, 0);
    },
    
    /**
     * 当前流程步骤（0-3）
     */
    currentStep() {
      if (!this.currentBill) return 0;

      const statusStepMap = {
        [BILL_STATUS.PENDING_CONFIRM]: 0,
        [BILL_STATUS.ADJUSTING]: 0,
        [BILL_STATUS.INVOICING]: 1,
        [BILL_STATUS.PENDING_PAYMENT]: 2,
        [BILL_STATUS.SETTLED]: 3
      };

      return statusStepMap[this.currentBill.billStatus] || 0;
    },
    
    /**
     * 是否可以提交开票申请
     */
    canSubmitInvoice() {
      return this.invoiceRowCount > 0 && this.invoiceTotalAmount > 0;
    }
  },
  created() {
    this.loadBillDetail();
    this.initActiveTab();
    this.initSplitConfig();
  },
  methods: {
    ...mapActions("bill", ["fetchBillDetail", "confirmBill", "cancelConfirm"]),
    ...mapActions("order", ["fetchOrderList"]),
    
    /**
     * 加载账单详情
     */
    async loadBillDetail() {
      try {
        await this.fetchBillDetail(this.billNo);
        await this.fetchOrderList(this.billNo);
      } catch (error) {
        handleApiError(error, {
          customMessage: "加载账单详情失败"
        });
      }
    },
    
    /**
     * 初始化拆分汇总配置
     */
    initSplitConfig() {
      // 从 Vuex store 加载配置
      const storeConfig = this.$store.state.config.splitConfig || this.$store.state.config.detailSettings;
      if (storeConfig && storeConfig.dimensions) {
        this.splitConfig = { dimensions: storeConfig.dimensions };
      }
    },
    
    /**
     * 初始化激活的Tab
     */
    initActiveTab() {
      // 优先使用URL query参数
      if (this.$route.query.tab) {
        this.activeTab = this.$route.query.tab;
        return;
      }

      // 否则根据账单状态自动选择
      if (this.currentBill && this.currentBill.billStatus >= BILL_STATUS.INVOICING) {
        this.activeTab = "invoice";
      } else {
        this.activeTab = "summary";
      }
    },
    
    /**
     * 确认账单
     */
    handleConfirmBill() {
      this.confirmDialogVisible = true;
    },
    
    /**
     * 执行确认账单操作
     */
    async confirmBillAction() {
      this.submitting = true;
      
      try {
        // 确认账单
        await this.confirmBill(this.billNo);
        
        showSuccess("账单确认成功，所有订单已标记为已核对");
        this.confirmDialogVisible = false;
        
        // 延迟刷新，确保 mock 数据已更新
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 重新加载账单详情和订单列表（确保数据同步）
        await this.loadBillDetail();
        
        // 强制更新组件
        this.$forceUpdate();

        // 直接进入开票页面
        await this.handleApplyInvoice();
      } catch (error) {
        handleApiError(error, {
          customMessage: "账单确认失败"
        });
      } finally {
        this.submitting = false;
      }
    },
    
    /**
     * 撤销确认
     */
    handleCancelConfirm() {
      this.cancelDialogVisible = true;
    },
    
    /**
     * 执行撤销确认操作
     */
    async cancelConfirmAction() {
      this.submitting = true;
      
      try {
        await this.cancelConfirm(this.billNo);
        showSuccess("账单确认已撤销");
        this.cancelDialogVisible = false;
        
        // 延迟刷新，确保 mock 数据已更新
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 刷新页面数据
        await this.loadBillDetail();
        
        // 强制更新组件
        this.$forceUpdate();
        
        // 切换到账单汇总Tab
        this.activeTab = "summary";
      } catch (error) {
        handleApiError(error, {
          customMessage: "撤销确认失败"
        });
      } finally {
        this.submitting = false;
      }
    },
    
    /**
     * 一键开票（在当前页面显示开票表单）
     */
    async handleApplyInvoice() {
      // 检查是否有发票的拆分汇总字段
      const hasInvoiceSplitConfig = this.splitConfig &&
        this.splitConfig.dimensions &&
        this.splitConfig.dimensions.length > 0;

      if (!hasInvoiceSplitConfig) {
        // 如果没有发票拆分汇总配置，显示拆分汇总设置对话框
        this.splitConfigVisible = true;
        return;
      }

      // 有发票拆分配置时，进入开票表单
      await this.proceedToInvoiceForm();
    },

    /**
     * 继续进入开票表单
     */
    async proceedToInvoiceForm() {
      this.invoiceFormLoading = true;
      this.showInvoiceForm = true;

      try {
        // 加载开票数据
        await this.loadInvoiceData();
      } catch (error) {
        handleApiError(error, {
          customMessage: "加载开票数据失败"
        });
        this.showInvoiceForm = false;
      } finally {
        this.invoiceFormLoading = false;
      }
    },
    
    /**
     * 退出开票表单，返回账单详情
     */
    exitInvoiceForm() {
      this.showInvoiceForm = false;
      this.invoiceRows = [];
      // 保持 splitConfig，不重置（配置是全局的）
    },
    
    /**
     * 加载开票数据
     */
    async loadInvoiceData() {
      const mockApi = require("@/mock/index").default;

      // 加载发票抬头
      const titleRes = await mockApi.getInvoiceTitles();
      this.invoiceTitles = titleRes.data.list || [];

      // 根据拆分汇总字段生成开票行
      const rowRes = await mockApi.generateInvoiceRows(this.billNo, this.splitConfig);
      this.invoiceRows = rowRes.data || [];

      // 更新统计信息
      this.updateInvoiceStats();
    },
    
    /**
     * 更新开票统计信息
     */
    updateInvoiceStats() {
      this.invoiceRowCount = this.invoiceRows.length;
      this.invoiceTotalAmount = this.invoiceRows.reduce((sum, row) => {
        return sum + (row.amount || 0);
      }, 0);
    },
    
    /**
     * 开票表单更新
     */
    handleInvoiceFormUpdate(data) {
      if (data.invoiceRows) {
        this.invoiceRows = data.invoiceRows;
        this.updateInvoiceStats();
      }
    },
    
    /**
     * 提交开票申请
     */
    async handleSubmitInvoice() {
      this.submitting = true;
      
      try {
        const mockApi = require("@/mock/index").default;
        await mockApi.applyInvoice({
          billNo: this.billNo,
          invoiceRows: this.invoiceRows
        });
        
        showSuccess("开票申请提交成功");

        // 退出开票表单
        this.exitInvoiceForm();

        // 延迟刷新，确保 mock 数据已更新
        await new Promise(resolve => setTimeout(resolve, 100));

        // 刷新账单数据
        await this.loadBillDetail();

        // 强制更新组件
        this.$forceUpdate();

        // 切换到开票汇总tab
        this.activeTab = "invoice";
      } catch (error) {
        handleApiError(error, {
          customMessage: "提交开票申请失败"
        });
      } finally {
        this.submitting = false;
      }
    },
    
    /**
     * 拆分汇总配置（统一入口）
     */
    handleDetailSettings() {
      this.splitConfigVisible = true;
    },
    
    /**
     * 保存拆分汇总配置（统一处理）
     */
    async handleSaveSplitConfig(config) {
      try {
        // 构建维度数组
        const dimensions = [];
        if (config.dimension1) dimensions.push(config.dimension1);
        if (config.dimension2) dimensions.push(config.dimension2);

        // 保存配置到 Vuex（同时保存到 detailSettings 和 splitConfig）
        await this.$store.dispatch("config/saveDetailSettings", { dimensions });
        await this.$store.dispatch("config/saveSplitConfig", config);

        // 更新本地配置
        this.splitConfig = { ...config, dimensions };
        this.splitConfigVisible = false;

        showSuccess("拆分汇总配置已保存");

        // 如果是从确认账单进入的，保存配置后自动进入开票表单
        if (this.currentBill && this.currentBill.billStatus >= 3) {
          await this.proceedToInvoiceForm();
        } else if (!this.showInvoiceForm) {
          // 如果不在开票表单模式，刷新账单数据以应用新设置
          await this.loadBillDetail();
        }
      } catch (error) {
        handleApiError(error, {
          customMessage: "保存拆分汇总配置失败"
        });
      }
    },
    
    /**
     * 导出Excel
     */
    handleExportExcel() {
      showWarning("导出Excel功能将在User Story 4实现");
    },
    
    /**
     * 导出PDF
     */
    handleExportPDF() {
      showWarning("导出PDF功能将在User Story 4实现");
    },
    
    /**
     * 格式化账单周期范围
     */
    formatBillCycleRange(cycle) {
      if (!cycle) return "-";
      return formatBillCycle(cycle, this.currentBill);
    },
    
    /**
     * 格式化金额
     */
    formatAmount(amount) {
      return formatAmount(amount);
    },
    
    /**
     * 获取账单状态名称
     */
    getBillStatusName(status) {
      return BILL_STATUS_NAMES[status] || "-";
    },
    
    /**
     * 获取账单状态标签类型
     */
    getBillStatusType(status) {
      return BILL_STATUS_COLORS[status] || "";
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.bill-detail-page {
  padding: @spacing-lg;
  background: @bg-light;
  min-height: 100vh;

  // 面包屑
  .breadcrumb-container {
    margin-bottom: @spacing-md;
    font-size: @font-size-base;
    color: @text-secondary;

    .breadcrumb-item {
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: @primary-color;
      }

      &.active {
        color: @text-primary;
        cursor: default;
      }
    }

    .breadcrumb-separator {
      margin: 0 @spacing-sm;
    }
  }

  // 加载状态
  .loading-container {
    background: @bg-white;
    padding: @spacing-xl;
    border-radius: @border-radius-base;
  }

  // 账单内容
  .bill-content {
    // 步骤卡片
    .steps-card {
      margin-bottom: @spacing-md;
    }

    // 操作卡片
    .action-card {
      margin-bottom: @spacing-md;

      .action-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .date-range {
          font-size: @font-size-lg;
          font-weight: 600;
          color: @text-primary;

          i {
            margin-right: @spacing-sm;
            color: @primary-color;
          }
        }

        .action-buttons {
          display: flex;
          gap: @spacing-sm;
        }
      }
    }

    // Tab卡片
    .tabs-card {
      min-height: 500px;
      
      // 开票表单头部
      .invoice-apply-header {
        display: flex;
        align-items: center;
        gap: @spacing-md;
        margin-bottom: @spacing-lg;
        padding-bottom: @spacing-md;
        border-bottom: 1px solid @border-base;
        
        .section-title {
          font-size: @font-size-lg;
          font-weight: 600;
          color: @text-primary;
          margin: 0;
        }
      }
      
      // 开票表单内容
      .invoice-apply-content {
        .action-section {
          margin-bottom: @spacing-lg;
        }
        
        // 底部操作区
        .invoice-footer-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: @spacing-xl;
          padding-top: @spacing-lg;
          border-top: 2px solid @border-base;
          
          .summary-info {
            font-size: @font-size-base;
            color: @text-secondary;
            
            .summary-value {
              color: @text-primary;
              font-weight: 600;
              margin: 0 @spacing-xs;
              
              &.highlight {
                color: @primary-color;
                font-size: @font-size-xl;
              }
            }
          }
        }
      }
    }

    // 信息卡片
    .info-card {
      margin-bottom: @spacing-md;

      .card-header {
        font-weight: 600;
      }

      .info-content {
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: @spacing-sm 0;
          border-bottom: 1px dashed @border-light;

          &:last-child {
            border-bottom: none;
          }

          .info-label {
            color: @text-secondary;
            font-size: @font-size-sm;
          }

          .info-value {
            color: @text-primary;
            font-weight: 500;

            &.highlight {
              color: @primary-color;
              font-size: @font-size-lg;
              font-weight: 600;
            }
          }
        }
      }
    }
  }

  // 对话框样式
  .confirm-dialog-content {
    .confirm-message {
      font-size: @font-size-lg;
      color: @text-primary;
      margin-bottom: @spacing-lg;
      text-align: center;

      strong {
        color: @primary-color;
      }
    }

    .confirm-amount {
      background: @bg-light;
      padding: @spacing-md;
      border-radius: @border-radius-base;
      margin-bottom: @spacing-lg;

      .amount-item {
        display: flex;
        justify-content: space-between;
        padding: @spacing-sm 0;

        .label {
          color: @text-secondary;
        }

        .value {
          font-weight: 600;
          color: @text-primary;
        }
      }
    }

    .confirm-hint {
      font-size: @font-size-sm;
      color: @text-placeholder;
      text-align: center;
      margin: 0;

      &.warn {
        color: @warning-color;
      }
    }
  }
}
</style>
