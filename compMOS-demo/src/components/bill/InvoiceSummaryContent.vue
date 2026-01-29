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
          <el-table :data="summary.details" border style="width: 100%">
            <el-table-column prop="type" label="发票种类" min-width="150"></el-table-column>
            <el-table-column prop="summary" label="发票摘要" min-width="150"></el-table-column>
            <el-table-column prop="shouldAmount" label="应开票金额" min-width="130" align="right">
              <template slot-scope="{ row }">
                {{ formatAmount(row.shouldAmount) }}
              </template>
            </el-table-column>
            <el-table-column prop="invoicedAmount" label="已开票金额" min-width="130" align="right">
              <template slot-scope="{ row }">
                {{ formatAmount(row.invoicedAmount) }}
              </template>
            </el-table-column>
            <el-table-column prop="remainingAmount" label="还可提交金额" min-width="130" align="right">
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
            <el-button icon="el-icon-download" @click="handleBatchDownload">
              批量下载发票
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
          @refresh="loadData"
        ></invoice-record-table>
      </div>
    </div>

    <!-- 批量下载筛选对话框 -->
    <el-dialog
      title="批量下载发票"
      :visible.sync="batchDownloadDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <p class="info-message">
          <i class="el-icon-info"></i>
          请选择筛选条件，系统将下载符合条件的发票
        </p>
        <el-form :model="batchDownloadFilter" label-width="100px">
          <el-form-item label="发票种类">
            <el-select
              v-model="batchDownloadFilter.invoiceType"
              placeholder="全部"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="option in invoiceTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="发票抬头">
            <el-select
              v-model="batchDownloadFilter.titleName"
              placeholder="全部"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="option in titleNameOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="申请人">
            <el-select
              v-model="batchDownloadFilter.submitter"
              placeholder="全部"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="option in submitterOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div class="filter-preview" v-if="hasFilter">
          <div class="preview-title">筛选结果预览</div>
          <div class="preview-content">
            <p>符合条件的发票数量：<strong>{{ getFilteredCount() }}</strong> 条</p>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="batchDownloadDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="confirmBatchDownload">确定下载</el-button>
      </span>
    </el-dialog>
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
      activeTab: "unified",
      
      // 批量下载筛选对话框
      batchDownloadDialogVisible: false,
      batchDownloadFilter: {
        invoiceType: "",
        titleName: "",
        submitter: ""
      }
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
    },
    
    // 发票种类选项（从申请记录中提取）
    invoiceTypeOptions() {
      const types = new Set();
      this.applicationList.forEach(record => {
        if (record.invoiceType) {
          types.add(record.invoiceType);
        }
      });
      return Array.from(types).map(type => ({
        label: type,
        value: type
      }));
    },
    
    // 发票抬头选项（从申请记录中提取）
    titleNameOptions() {
      const titles = new Set();
      this.applicationList.forEach(record => {
        if (record.titleName) {
          titles.add(record.titleName);
        }
      });
      return Array.from(titles).map(title => ({
        label: title,
        value: title
      }));
    },
    
    // 申请人选项（从申请记录中提取）
    submitterOptions() {
      const submitters = new Set();
      this.applicationList.forEach(record => {
        if (record.submitter) {
          submitters.add(record.submitter);
        }
      });
      return Array.from(submitters).map(submitter => ({
        label: submitter,
        value: submitter
      }));
    },
    
    // 是否有筛选条件
    hasFilter() {
      return !!(this.batchDownloadFilter.invoiceType || 
                this.batchDownloadFilter.titleName || 
                this.batchDownloadFilter.submitter);
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
    
    /**
     * 批量下载发票
     */
    handleBatchDownload() {
      // 重置筛选条件
      this.batchDownloadFilter = {
        invoiceType: "",
        titleName: "",
        submitter: ""
      };
      this.batchDownloadDialogVisible = true;
    },
    
    /**
     * 确认批量下载
     */
    async confirmBatchDownload() {
      try {
        // 根据筛选条件过滤申请记录
        const filteredRecords = this.applicationList.filter(record => {
          // 发票种类筛选
          if (this.batchDownloadFilter.invoiceType && 
              record.invoiceType !== this.batchDownloadFilter.invoiceType) {
            return false;
          }
          
          // 发票抬头筛选
          if (this.batchDownloadFilter.titleName && 
              record.titleName !== this.batchDownloadFilter.titleName) {
            return false;
          }
          
          // 申请人筛选
          if (this.batchDownloadFilter.submitter && 
              record.submitter !== this.batchDownloadFilter.submitter) {
            return false;
          }
          
          return true;
        });
        
        if (filteredRecords.length === 0) {
          showWarning("没有符合条件的发票可下载");
          return;
        }
        
        this.loading = true;
        
        // TODO: 实现批量下载功能
        console.log("批量下载筛选条件:", this.batchDownloadFilter);
        console.log("符合条件的记录数:", filteredRecords.length);
        console.log("符合条件的记录:", filteredRecords);
        
        // 模拟下载
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showSuccess(`已选择 ${filteredRecords.length} 条发票，开始批量下载`);
        this.batchDownloadDialogVisible = false;
      } catch (error) {
        handleApiError(error, {
          customMessage: "批量下载失败"
        });
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 获取筛选后的记录数量
     */
    getFilteredCount() {
      return this.applicationList.filter(record => {
        if (this.batchDownloadFilter.invoiceType && 
            record.invoiceType !== this.batchDownloadFilter.invoiceType) {
          return false;
        }
        if (this.batchDownloadFilter.titleName && 
            record.titleName !== this.batchDownloadFilter.titleName) {
          return false;
        }
        if (this.batchDownloadFilter.submitter && 
            record.submitter !== this.batchDownloadFilter.submitter) {
          return false;
        }
        return true;
      }).length;
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
        background: #2555FF; // 蓝色背景
        
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
  
  // 表格样式统一
  /deep/ .el-table {
    border: none;
    
    &::before {
      display: none;
    }
    
    &::after {
      display: none;
    }
    
    th, td {
      border-right: none;
    }
    
    th.el-table__cell {
      background: #fafafa;
      color: @text-primary;
      font-weight: 600;
      border-bottom: 1px solid #e8e8e8;
    }
    
    .el-table__body tr {
      &:hover > td {
        background-color: #f5f7fa;
      }
    }
    
    .el-table__body td {
      border-bottom: 1px solid #f0f0f0;
    }
    
    .el-table__row--striped td {
      background: #fafafa;
    }
    
    .el-link {
      font-size: 14px;
      font-weight: normal;
    }
  }

  .invoice-applications {
    background: @bg-white;
    border-radius: @border-radius-base;
    padding: @spacing-lg;

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

  // 批量下载对话框样式
  .dialog-content {
    .info-message {
      display: flex;
      align-items: center;
      gap: @spacing-sm;
      padding: @spacing-md;
      background: @bg-light;
      border-radius: @border-radius-base;
      color: @text-secondary;
      font-size: @font-size-base;
      margin-bottom: @spacing-lg;

      i {
        color: @primary-color;
        font-size: @font-size-xl;
      }
    }

    .filter-preview {
      margin-top: @spacing-lg;
      padding: @spacing-md;
      background: #E8EEFF;
      border: 1px solid #B3C5FF;
      border-radius: @border-radius-base;

      .preview-title {
        font-size: @font-size-sm;
        color: @text-secondary;
        margin-bottom: @spacing-sm;
      }

      .preview-content {
        p {
          margin: 0;
          color: @text-primary;
          font-size: @font-size-base;

          strong {
            color: @primary-color;
            font-weight: 600;
            font-size: @font-size-lg;
          }
        }
      }
    }
  }
}
</style>

