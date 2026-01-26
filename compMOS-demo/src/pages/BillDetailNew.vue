<template>
  <div class="bill-detail-page">
    <!-- 页面头部：面包屑 -->
    <el-breadcrumb separator="/" class="page-breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">账单列表</el-breadcrumb-item>
      <el-breadcrumb-item>账单详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 账单基本信息卡片 -->
    <el-card class="bill-info-card" shadow="never" v-if="currentBill">
      <div class="bill-info-header">
        <div class="bill-title">
          <h2>{{ formatCycle(currentBill.settlementCycle) }} 账单</h2>
          <el-tag :type="getBillStatusType(currentBill.billStatus)" size="medium">
            {{ getBillStatusName(currentBill.billStatus) }}
          </el-tag>
        </div>
        <div class="bill-amount">
          <span class="amount-label">账单总额：</span>
          <span class="amount-value">{{ formatAmount(currentBill.totalAmount) }}</span>
        </div>
      </div>

      <!-- 流程步骤 -->
      <div class="bill-steps">
        <el-steps :active="currentStep" align-center finish-status="success">
          <el-step title="确认账单"></el-step>
          <el-step title="提交发票"></el-step>
          <el-step title="付款"></el-step>
          <el-step title="已结清"></el-step>
        </el-steps>
      </div>
    </el-card>

    <!-- 主内容区域 -->
    <el-card class="content-card" shadow="never" v-loading="loading">
      <!-- Tab切换 -->
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <!-- 开票汇总Tab（仅待开票状态显示） -->
        <el-tab-pane 
          v-if="currentBill && currentBill.billStatus >= BILL_STATUS.PENDING_INVOICE"
          label="开票汇总" 
          name="invoice"
        >
          <invoice-summary :bill-no="billNo"></invoice-summary>
        </el-tab-pane>

        <!-- 账单汇总Tab -->
        <el-tab-pane label="账单汇总" name="summary">
          <bill-summary 
            v-if="currentBill"
            :bill="currentBill"
          ></bill-summary>
        </el-tab-pane>

        <!-- 账单明细Tab -->
        <el-tab-pane label="账单明细" name="detail">
          <bill-orders 
            v-if="currentBill"
            :bill-no="billNo"
          ></bill-orders>
        </el-tab-pane>
      </el-tabs>

      <!-- 操作按钮区域 -->
      <div class="action-buttons" v-if="currentBill">
        <!-- 待确认状态：显示确认账单按钮 -->
        <template v-if="currentBill.billStatus === BILL_STATUS.PENDING_CONFIRM">
          <el-button 
            type="primary" 
            size="large"
            :loading="submitting"
            @click="handleConfirmBill"
          >
            确认账单
          </el-button>
        </template>

        <!-- 待开票状态：显示一键开票和撤销确认按钮 -->
        <template v-else-if="currentBill.billStatus === BILL_STATUS.PENDING_INVOICE">
          <el-button 
            type="primary" 
            size="large"
            @click="handleApplyInvoice"
          >
            一键开票
          </el-button>
          <el-button 
            size="large"
            @click="handleCancelConfirm"
          >
            撤销确认
          </el-button>
        </template>
      </div>
    </el-card>

    <!-- 确认账单对话框 -->
    <el-dialog
      title="确认账单"
      :visible.sync="confirmDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="confirm-dialog-content">
        <p class="confirm-message">
          是否确认 <strong>{{ formatCycle(currentBill && currentBill.settlementCycle) }}</strong> 账单金额无误？
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
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import { BILL_STATUS, BILL_STATUS_NAMES, BILL_STATUS_COLORS } from "@/utils/constants";
import { formatAmount, formatBillCycle } from "@/utils/format";
import { showSuccess, showWarning, handleApiError } from "@/utils/errorHandler";
import BillSummary from "@/components/bill/BillSummary.vue";
import BillOrders from "@/components/bill/BillOrders.vue";
import InvoiceSummary from "@/components/bill/InvoiceSummary.vue";

export default {
  name: "BillDetail",
  components: {
    BillSummary,
    BillOrders,
    InvoiceSummary
  },
  data() {
    return {
      billNo: this.$route.params.billNo,
      activeTab: "summary",
      confirmDialogVisible: false,
      cancelDialogVisible: false,
      submitting: false,
      BILL_STATUS
    };
  },
  computed: {
    ...mapState("bill", ["currentBill", "loading"]),
    ...mapGetters("bill", ["currentBill"]),
    
    billSummary() {
      return this.currentBill && this.currentBill.summary;
    },
    
    /**
     * 当前流程步骤（0-3）
     */
    currentStep() {
      if (!this.currentBill) return 0;
      
      const statusStepMap = {
        [BILL_STATUS.PENDING_CONFIRM]: 0,
        [BILL_STATUS.ADJUSTING]: 0,
        [BILL_STATUS.PENDING_INVOICE]: 1,
        [BILL_STATUS.PENDING_PAYMENT]: 2,
        [BILL_STATUS.SETTLED]: 3
      };
      
      return statusStepMap[this.currentBill.billStatus] || 0;
    }
  },
  created() {
    this.loadBillDetail();
    this.initActiveTab();
  },
  methods: {
    ...mapActions("bill", ["fetchBillDetail", "confirmBill", "cancelConfirm"]),
    
    /**
     * 加载账单详情
     */
    async loadBillDetail() {
      try {
        await this.fetchBillDetail(this.billNo);
      } catch (error) {
        handleApiError(error, {
          customMessage: "加载账单详情失败"
        });
      }
    },
    
    /**
     * 初始化激活的Tab
     */
    initActiveTab() {
      // 如果是待开票状态，默认显示开票汇总
      if (this.currentBill && this.currentBill.billStatus >= BILL_STATUS.PENDING_INVOICE) {
        this.activeTab = "invoice";
      } else {
        this.activeTab = "summary";
      }
    },
    
    /**
     * Tab点击处理
     */
    handleTabClick(tab) {
      // 可以在这里添加Tab切换的逻辑
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
        await this.confirmBill(this.billNo);
        showSuccess("账单确认成功");
        this.confirmDialogVisible = false;
        
        // 刷新页面数据
        await this.loadBillDetail();
        
        // 切换到开票汇总Tab
        this.activeTab = "invoice";
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
        
        // 刷新页面数据
        await this.loadBillDetail();
        
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
     * 一键开票
     */
    handleApplyInvoice() {
      // TODO: 跳转到开票页面
      showWarning("开票功能将在Phase 5实现");
    },
    
    /**
     * 格式化账单周期
     */
    formatCycle(cycle) {
      return formatBillCycle(cycle);
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

  .page-breadcrumb {
    margin-bottom: @spacing-md;
  }

  .bill-info-card {
    margin-bottom: @spacing-md;

    .bill-info-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: @spacing-xl;

      .bill-title {
        display: flex;
        align-items: center;
        gap: @spacing-md;

        h2 {
          margin: 0;
          font-size: @font-size-xl;
          font-weight: 600;
          color: @text-primary;
        }
      }

      .bill-amount {
        .amount-label {
          font-size: @font-size-base;
          color: @text-secondary;
          margin-right: @spacing-sm;
        }

        .amount-value {
          font-size: 24px;
          font-weight: 600;
          color: @primary-color;
        }
      }
    }

    .bill-steps {
      /deep/ .el-step__title {
        font-size: @font-size-base;
      }
    }
  }

  .content-card {
    /deep/ .el-card__body {
      padding: @spacing-lg;
    }

    /deep/ .el-tabs__header {
      margin-bottom: @spacing-lg;
    }

    .action-buttons {
      margin-top: @spacing-xl;
      padding-top: @spacing-lg;
      border-top: 1px solid @border-base;
      text-align: center;

      .el-button {
        min-width: 150px;
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

