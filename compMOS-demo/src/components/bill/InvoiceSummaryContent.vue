<template>
  <div class="invoice-summary-content">
    <div v-loading="loading">
      <!-- 开票申请记录 -->
      <div class="invoice-applications">
        <invoice-record-table
          :records="applicationList"
          :loading="loading"
          @download="handleDownload"
          @red-flush="handleRedFlush"
          @reissue="handleReissue"
        ></invoice-record-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { INVOICE_STATUS_NAMES, INVOICE_STATUS_COLORS } from "@/utils/constants";
import { formatAmount, formatDate } from "@/utils/format";
import { showSuccess, showWarning, handleApiError } from "@/utils/errorHandler";
import InvoiceRecordTable from "./InvoiceRecordTable.vue";

export default {
  name: "InvoiceSummaryContent",
  components: {
    InvoiceRecordTable
  },
  props: {
    billNo: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: false
    };
  },
  computed: {
    ...mapState("invoice", ["invoiceSummary", "applicationList", "invoiceList", "invoiceTitles"]),
    
    summary() {
      return {
        totalAmount: this.invoiceSummary.shouldInvoiceAmount || 0,
        invoicedAmount: this.invoiceSummary.invoicedAmount || 0,
        remainingAmount: this.invoiceSummary.remainingAmount || 0,
        details: this.invoiceSummary.invoiceDetails || []
      };
    }
  },
  created() {
    this.loadData();
  },
  methods: {
    ...mapActions("invoice", [
      "fetchInvoiceApplications",
      "downloadInvoice",
      "redFlushInvoice",
      "reissueInvoice"
    ]),
    
    async loadData() {
      this.loading = true;
      try {
        await this.fetchInvoiceApplications(this.billNo);
      } catch (error) {
        handleApiError(error, {
          customMessage: "加载开票数据失败"
        });
      } finally {
        this.loading = false;
      }
    },
    
    formatAmount(amount) {
      return formatAmount(amount);
    },
    
    formatDate(date, format = 'YYYY-MM-DD HH:mm') {
      return formatDate(date, format);
    },
    
    getStatusName(status) {
      return INVOICE_STATUS_NAMES[status] || "-";
    },
    
    getStatusType(status) {
      return INVOICE_STATUS_COLORS[status] || "";
    },
    
    async handleDownload(record) {
      try {
        this.loading = true;
        
        const response = await this.downloadInvoice(record.applicationNo);
        
        // 模拟下载
        if (response && response.data && response.data.fileUrl) {
          // 在真实环境中，这里会创建下载链接
          showSuccess(`发票下载成功！\n申请编号：${record.applicationNo}`);
          
          // Demo环境提示
          this.$message.info({
            message: "Demo环境：实际环境中将自动下载PDF文件到本地",
            duration: 3000
          });
        }
      } catch (error) {
        handleApiError(error, {
          customMessage: "下载发票失败"
        });
      } finally {
        this.loading = false;
      }
    },
    
    async handleRedFlush(payload) {
      const { record, reason } = payload;
      
      try {
        this.loading = true;
        
        await this.redFlushInvoice({
          applicationNo: record.applicationNo,
          reason
        });
        
        showSuccess("红冲操作成功");
        
        // 刷新数据
        await this.loadData();
      } catch (error) {
        handleApiError(error, {
          customMessage: "红冲操作失败"
        });
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async handleReissue(payload) {
      const { record, newTitle } = payload;
      
      try {
        this.loading = true;
        
        await this.reissueInvoice({
          applicationNo: record.applicationNo,
          newTitle
        });
        
        showSuccess("换开操作成功");
        
        // 刷新数据
        await this.loadData();
      } catch (error) {
        handleApiError(error, {
          customMessage: "换开操作失败"
        });
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.invoice-summary-content {
  .invoice-amounts {
    display: flex;
    justify-content: space-around;
    margin-bottom: @spacing-xl;
    padding: @spacing-lg;
    background: @bg-light;
    border-radius: @border-radius-base;

    .amount-item {
      text-align: center;
      flex: 1;

      &.highlighted {
        background: linear-gradient(135deg, @primary-color 0%, #66b1ff 100%);
        color: @text-white;
        border-radius: @border-radius-base;
        padding: @spacing-md;
      }

      .amount-label {
        font-size: @font-size-base;
        color: @text-secondary;
        margin-bottom: @spacing-sm;
      }

      &.highlighted .amount-label {
        color: @text-white;
        opacity: 0.9;
      }

      .amount-value {
        font-size: 28px;
        font-weight: 600;
        color: @primary-color;
      }

      &.highlighted .amount-value {
        color: @text-white;
      }
    }
  }

  .section-title {
    font-size: @font-size-lg;
    font-weight: 600;
    color: @text-primary;
    margin-bottom: @spacing-md;
    padding-bottom: @spacing-sm;
    border-bottom: 2px solid @border-base;
  }

  .invoice-details,
  .invoice-titles,
  .invoice-applications,
  .invoice-list {
    margin-bottom: @spacing-xl;
  }

  .title-header,
  .application-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: @spacing-md;

    .section-title {
      margin-bottom: 0;
      border-bottom: none;
    }

    .title-actions,
    .application-actions {
      display: flex;
      gap: @spacing-sm;
    }
  }

  .title-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: @spacing-md;

    .title-card {
      position: relative;
      background: @bg-white;
      border: 2px solid @border-base;
      border-radius: @border-radius-base;
      padding: @spacing-md;
      transition: all 0.3s;

      &:hover {
        border-color: @primary-color;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
      }

      &.is-default {
        border-color: @success-color;
        background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
      }

      .title-badge {
        position: absolute;
        top: @spacing-sm;
        right: @spacing-sm;
      }

      .title-main {
        .title-name {
          font-size: @font-size-lg;
          font-weight: 600;
          color: @text-primary;
          margin-bottom: @spacing-sm;
        }

        .title-info {
          .info-row {
            display: flex;
            margin-bottom: @spacing-xs;
            font-size: @font-size-sm;

            &:last-child {
              margin-bottom: 0;
            }

            .label {
              color: @text-secondary;
              min-width: 70px;
            }

            .value {
              flex: 1;
              color: @text-primary;
              word-break: break-all;
            }
          }
        }
      }
    }
  }
}
</style>

