<template>
  <div class="invoice-summary-content">
    <div v-loading="loading">
      <!-- 顶部：开票汇总标题 -->
      <div class="summary-header">
        <h2 class="page-title">开票汇总</h2>
      </div>

      <!-- 开票金额汇总 -->
      <div class="invoice-amount-summary">
        <div class="amount-cards">
          <div class="amount-card">
            <div class="amount-label">应开票金额</div>
            <div class="amount-value">{{ formatAmount(summary.totalAmount) }}</div>
          </div>
          <div class="amount-card">
            <div class="amount-label">已开票金额</div>
            <div class="amount-value">{{ formatAmount(summary.invoicedAmount) }}</div>
          </div>
          <div class="amount-card remaining-amount-card">
            <div class="amount-label">还可提交金额</div>
            <div class="amount-value">{{ formatAmount(summary.remainingAmount) }}</div>
          </div>
        </div>

        <!-- 详细金额明细表格 -->
        <div class="amount-details-table">
          <el-table :data="summary.details" border size="small" style="width: 100%">
            <el-table-column prop="type" label="发票种类" width="150"></el-table-column>
            <el-table-column prop="summary" label="发票摘要" width="150"></el-table-column>
            <el-table-column prop="shouldAmount" label="应开票金额" width="130" align="right">
              <template slot-scope="{ row }">
                {{ formatAmount(row.shouldAmount) }}
              </template>
            </el-table-column>
            <el-table-column prop="invoicedAmount" label="已开票金额" width="130" align="right">
              <template slot-scope="{ row }">
                {{ formatAmount(row.invoicedAmount) }}
              </template>
            </el-table-column>
            <el-table-column prop="remainingAmount" label="还可提交金额" width="130" align="right">
              <template slot-scope="{ row }">
                {{ formatAmount(row.remainingAmount) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 开票申请记录 -->
      <div class="invoice-applications">
        <div class="applications-header">
          <h3 class="section-title">开票申请记录</h3>
          <div class="header-actions">
            <el-button icon="el-icon-download" @click="handleDownloadAll">
              下载全量发票
            </el-button>
            <el-button icon="el-icon-info" @click="handleViewInsurance">
              查看保险发票
            </el-button>
          </div>
        </div>


        <!-- 申请记录表格 -->
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
      loading: false,
      activeTab: "unified"
    };
  },
  computed: {
    ...mapState("invoice", ["invoiceSummary", "applicationList", "invoiceTitles"]),
    
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
      "fetchInvoiceSummary",
      "fetchInvoiceApplications",
      "downloadInvoice",
      "redFlushInvoice",
      "reissueInvoice"
    ]),
    
    async loadData() {
      this.loading = true;
      try {
        await Promise.all([
          this.fetchInvoiceSummary(this.billNo),
          this.fetchInvoiceApplications(this.billNo)
        ]);
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
    },
    
    handleViewElectronicTickets() {
      showWarning("查看数电票功能开发中");
    },
    
    handleDownloadAll() {
      showWarning("下载全量发票功能开发中");
    },
    
    handleViewInsurance() {
      showWarning("查看保险发票功能开发中");
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.invoice-summary-content {
  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: @spacing-lg;

    .page-title {
      font-size: @font-size-xl;
      font-weight: 600;
      color: @text-primary;
      margin: 0;
    }
  }

  .invoice-amount-summary {
    background: @bg-white;
    border-radius: @border-radius-base;
    padding: @spacing-lg;
    margin-bottom: @spacing-xl;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .amount-cards {
      display: flex;
      align-items: center;
      gap: @spacing-lg;
      margin-bottom: @spacing-lg;

      .amount-card {
        flex: 1;
        padding: @spacing-lg;
        background: @bg-light;
        border-radius: @border-radius-base;
        text-align: center;

        .amount-label {
          font-size: @font-size-base;
          color: @text-secondary;
          margin-bottom: @spacing-sm;
        }

        .amount-value {
          font-size: 28px;
          font-weight: 600;
          color: @text-primary;
        }
      }

      .remaining-amount-card {
        background: #409eff; // 蓝色背景
        
        .amount-label {
          color: #ffffff; // 白色文字
        }
        
        .amount-value {
          color: #ffffff; // 白色文字
        }
      }

    }

    .amount-details-table {
      margin-top: @spacing-lg;
    }
  }

  .invoice-applications {
    background: @bg-white;
    border-radius: @border-radius-base;
    padding: @spacing-lg;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .applications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: @spacing-sm;

      .section-title {
        font-size: @font-size-lg;
        font-weight: 600;
        color: @text-primary;
        margin: 0;
      }

      .header-actions {
        display: flex;
        gap: @spacing-sm;
      }
    }

  }
}
</style>

