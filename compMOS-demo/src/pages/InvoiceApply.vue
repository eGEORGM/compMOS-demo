<template>
  <div class="invoice-apply-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button 
        icon="el-icon-arrow-left" 
        @click="handleBack"
        size="small"
      >
        返回
      </el-button>
      <h2 class="page-title">填写开票信息</h2>
    </div>

    <div v-loading="loading" class="invoice-apply-content">
      <!-- 拆分汇总按钮 -->
      <el-card class="action-card" shadow="never">
        <el-button icon="el-icon-folder-opened" @click="handleSplitConfig">
          拆分汇总
        </el-button>
      </el-card>

      <!-- 开票信息表单 -->
      <el-card class="form-card" shadow="never">
        <h3 class="section-title">开票信息</h3>
        <invoice-form
          ref="invoiceForm"
          :bill-no="billNo"
          :invoice-rows="invoiceRows"
          :invoice-titles="invoiceTitles"
          :split-config="splitConfig"
          @update="handleFormUpdate"
        ></invoice-form>
      </el-card>

      <!-- 底部操作区 -->
      <div class="footer-actions">
        <div class="summary-info">
          <span class="summary-label">共</span>
          <span class="summary-value">{{ invoiceRowCount }}</span>
          <span class="summary-label">行开票信息，总金额</span>
          <span class="summary-value highlight">{{ formatAmount(totalAmount) }}</span>
          <span class="summary-label">元</span>
        </div>
        <el-button
          type="primary"
          size="large"
          :loading="submitting"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          申请开票
        </el-button>
      </div>
    </div>

    <!-- 拆分汇总配置对话框 -->
    <invoice-split-config
      v-model="splitConfigVisible"
      :current-config="splitConfig"
      @save="handleSplitConfigSave"
    ></invoice-split-config>

    <!-- 最终确认对话框 -->
    <el-dialog
      title="确认开票信息"
      :visible.sync="confirmDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="confirm-content">
        <p class="confirm-message">请确认以下开票信息：</p>
        <div class="confirm-summary">
          <div 
            v-for="(row, index) in validInvoiceRows" 
            :key="index"
            class="summary-row"
          >
            <div class="summary-item">
              <span class="label">发票种类：</span>
              <span class="value">{{ row.invoiceType }}</span>
            </div>
            <div class="summary-item">
              <span class="label">开票金额：</span>
              <span class="value">{{ formatAmount(row.amount) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">发票抬头：</span>
              <span class="value">{{ row.titleName }}</span>
            </div>
            <div class="summary-item">
              <span class="label">接收人：</span>
              <span class="value">{{ row.receiverName }} {{ row.receiverPhone }}</span>
            </div>
          </div>
        </div>
        <p class="confirm-hint">确认提交后将开始开票流程，请仔细核对信息。</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmSubmit">确定提交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { formatAmount } from "@/utils/format";
import { showSuccess, showWarning, handleApiError } from "@/utils/errorHandler";
import InvoiceForm from "@/components/bill/InvoiceForm.vue";
import InvoiceSplitConfig from "@/components/bill/InvoiceSplitConfig.vue";

export default {
  name: "InvoiceApply",
  components: {
    InvoiceForm,
    InvoiceSplitConfig
  },
  data() {
    return {
      billNo: this.$route.params.billNo,
      confirmDialogVisible: false,
      splitConfigVisible: false,
      invoiceRows: [],
      loading: false,
      submitting: false,
      splitConfig: {
        dimension1: "",
        dimension2: ""
      }
    };
  },
  computed: {
    ...mapState("invoice", ["invoiceTitles", "invoiceSummary"]),
    
    invoiceRowCount() {
      return this.invoiceRows.length;
    },
    
    totalAmount() {
      return this.invoiceRows.reduce((sum, row) => sum + (row.amount || 0), 0);
    },
    
    validInvoiceRows() {
      return this.invoiceRows.filter(row => row.isValid);
    },
    
    canSubmit() {
      return this.validInvoiceRows.length > 0 && 
             this.validInvoiceRows.length === this.invoiceRows.length;
    }
  },
  created() {
    this.loadData();
  },
  methods: {
    ...mapActions("invoice", [
      "fetchInvoiceSummary",
      "fetchInvoiceTitles",
      "submitInvoiceApplication",
      "updateSplitConfig"
    ]),
    
    async loadData() {
      this.loading = true;
      try {
        await Promise.all([
          this.fetchInvoiceSummary(this.billNo),
          this.fetchInvoiceTitles()
        ]);
        
        // 初始化开票行数据
        this.initInvoiceRows();
      } catch (error) {
        handleApiError(error, {
          customMessage: "加载开票数据失败"
        });
      } finally {
        this.loading = false;
      }
    },
    
    initInvoiceRows() {
      // 根据发票明细初始化开票行
      if (this.invoiceSummary && this.invoiceSummary.invoiceDetails) {
        this.invoiceRows = this.invoiceSummary.invoiceDetails
          .filter(detail => detail.remainingAmount > 0)
          .map(detail => ({
            invoiceType: detail.type,
            summary: detail.summary,
            amount: detail.remainingAmount,
            orderCount: detail.orderCount,
            titleId: "",
            titleName: "",
            receiverName: "",
            receiverPhone: "",
            receiverEmail: "",
            receiverAddress: "",
            unit: "元",
            quantity: 1,
            isValid: false
          }));
      }
    },
    
    handleFormUpdate(updatedRows) {
      this.invoiceRows = updatedRows;
    },
    
    handleSplitConfig() {
      this.splitConfigVisible = true;
    },
    
    async handleSplitConfigSave(config) {
      try {
        // 保存配置到Vuex
        await this.updateSplitConfig({
          enabled: true,
          dimension1: config.dimension1,
          dimension2: config.dimension2
        });
        
        // 更新本地配置
        this.splitConfig = { ...config };
        
        // 根据配置重新生成开票行
        this.generateInvoiceRowsBySplit();
        
        showSuccess("拆分汇总配置已应用");
      } catch (error) {
        handleApiError(error, {
          customMessage: "保存拆分配置失败"
        });
      }
    },
    
    generateInvoiceRowsBySplit() {
      if (!this.invoiceSummary || !this.invoiceSummary.invoiceDetails) {
        return;
      }
      
      const { dimension1, dimension2 } = this.splitConfig;
      
      if (!dimension1) {
        // 如果没有配置拆分维度，使用默认方式
        this.initInvoiceRows();
        return;
      }
      
      // 根据配置拆分生成多行开票信息
      // Demo: 简化处理，按业务线和发票类型拆分
      const invoiceDetails = this.invoiceSummary.invoiceDetails || [];
      const newRows = [];
      
      invoiceDetails.forEach(detail => {
        if (detail.remainingAmount > 0) {
          // 根据dimension1拆分（这里简化处理，实际需要从订单数据中统计）
          if (dimension1 === "BUSINESS_LINE") {
            // 按业务线拆分
            const businessLines = ["机票", "酒店", "火车票"];
            businessLines.forEach(businessLine => {
              const amount = detail.remainingAmount / businessLines.length;
              if (amount > 0) {
                newRows.push({
                  invoiceType: detail.type,
                  summary: `${businessLine} - ${detail.summary}`,
                  amount: parseFloat(amount.toFixed(2)),
                  orderCount: Math.ceil(detail.orderCount / businessLines.length),
                  titleId: "",
                  titleName: "",
                  receiverName: "",
                  receiverPhone: "",
                  receiverEmail: "",
                  receiverAddress: "",
                  unit: "元",
                  quantity: 1,
                  isValid: false,
                  splitDimension1: businessLine,
                  splitDimension2: dimension2 ? "" : undefined
                });
              }
            });
          } else if (dimension1 === "LEGAL_ENTITY") {
            // 按法人实体拆分
            const legalEntities = ["北京分公司", "上海分公司"];
            legalEntities.forEach(entity => {
              const amount = detail.remainingAmount / legalEntities.length;
              if (amount > 0) {
                newRows.push({
                  invoiceType: detail.type,
                  summary: `${entity} - ${detail.summary}`,
                  amount: parseFloat(amount.toFixed(2)),
                  orderCount: Math.ceil(detail.orderCount / legalEntities.length),
                  titleId: "",
                  titleName: "",
                  receiverName: "",
                  receiverPhone: "",
                  receiverEmail: "",
                  receiverAddress: "",
                  unit: "元",
                  quantity: 1,
                  isValid: false,
                  splitDimension1: entity,
                  splitDimension2: dimension2 ? "" : undefined
                });
              }
            });
          } else {
            // 其他维度，保持原有方式
            newRows.push({
              invoiceType: detail.type,
              summary: detail.summary,
              amount: detail.remainingAmount,
              orderCount: detail.orderCount,
              titleId: "",
              titleName: "",
              receiverName: "",
              receiverPhone: "",
              receiverEmail: "",
              receiverAddress: "",
              unit: "元",
              quantity: 1,
              isValid: false
            });
          }
        }
      });
      
      this.invoiceRows = newRows;
    },
    
    handleBack() {
      this.$router.push({
        name: "BillDetail",
        params: { billNo: this.billNo }
      });
    },
    
    handleSubmit() {
      // 校验表单
      if (!this.$refs.invoiceForm.validate()) {
        showWarning("请填写完整的开票信息");
        return;
      }
      
      // 打开确认对话框
      this.confirmDialogVisible = true;
    },
    
    async confirmSubmit() {
      this.submitting = true;
      
      try {
        await this.submitInvoiceApplication({
          billNo: this.billNo,
          invoiceRows: this.validInvoiceRows
        });
        
        showSuccess("开票申请提交成功");
        this.confirmDialogVisible = false;
        
        // 返回账单详情页并切换到开票汇总Tab
        this.$router.push({
          name: "BillDetail",
          params: { billNo: this.billNo },
          query: { tab: "invoice" }
        });
      } catch (error) {
        handleApiError(error, {
          customMessage: "开票申请提交失败"
        });
      } finally {
        this.submitting = false;
      }
    },
    
    formatAmount(amount) {
      return formatAmount(amount);
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.invoice-apply-page {
  padding: @spacing-lg;
  background: @bg-light;
  min-height: 100vh;

  .page-header {
    display: flex;
    align-items: center;
    margin-bottom: @spacing-lg;
    gap: @spacing-md;

    .page-title {
      margin: 0;
      font-size: @font-size-xl;
      font-weight: 600;
      color: @text-primary;
    }
  }

  .invoice-apply-content {
    .action-card {
      margin-bottom: @spacing-md;
    }

    .form-card {
      margin-bottom: @spacing-lg;

      .section-title {
        font-size: @font-size-lg;
        font-weight: 600;
        color: @text-primary;
        margin-bottom: @spacing-md;
        padding-bottom: @spacing-sm;
        border-bottom: 2px solid @border-base;
      }
    }

    .footer-actions {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: @bg-white;
      border-top: 1px solid @border-base;
      padding: @spacing-md @spacing-xl;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
      z-index: 100;

      .summary-info {
        font-size: @font-size-base;
        color: @text-secondary;

        .summary-label {
          margin: 0 @spacing-xs;
        }

        .summary-value {
          font-weight: 600;
          color: @text-primary;
          font-size: @font-size-lg;

          &.highlight {
            color: @primary-color;
            font-size: 24px;
          }
        }
      }
    }
  }

  .confirm-content {
    .confirm-message {
      font-size: @font-size-lg;
      color: @text-primary;
      margin-bottom: @spacing-lg;
    }

    .confirm-summary {
      background: @bg-light;
      padding: @spacing-md;
      border-radius: @border-radius-base;
      margin-bottom: @spacing-lg;
      max-height: 400px;
      overflow-y: auto;

      .summary-row {
        padding: @spacing-md;
        background: @bg-white;
        border-radius: @border-radius-base;
        margin-bottom: @spacing-sm;

        &:last-child {
          margin-bottom: 0;
        }

        .summary-item {
          display: flex;
          margin-bottom: @spacing-xs;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            color: @text-secondary;
            min-width: 80px;
            font-size: @font-size-sm;
          }

          .value {
            flex: 1;
            color: @text-primary;
            font-weight: 500;
          }
        }
      }
    }

    .confirm-hint {
      font-size: @font-size-sm;
      color: @text-placeholder;
      margin: 0;
      text-align: center;
    }
  }
}
</style>
