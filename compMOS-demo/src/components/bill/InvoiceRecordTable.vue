<template>
  <div class="invoice-record-table">
    <div class="table-header">
      <h4 class="section-title">发票申请记录</h4>
      <div class="header-actions">
        <el-button 
          v-if="selectedRecords.length > 0"
          size="small" 
          icon="el-icon-download"
          @click="handleBatchDownload"
        >
          批量下载 ({{ selectedRecords.length }})
        </el-button>
      </div>
    </div>

    <el-table
      :data="records"
      v-loading="loading"
      stripe
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      
      <el-table-column prop="applicationNo" label="申请编号" width="170"></el-table-column>
      
      <el-table-column prop="invoiceType" label="发票类型" width="150">
        <template slot-scope="{ row }">
          <el-tag size="small" :type="getInvoiceTypeColor(row.invoiceType)">
            {{ row.invoiceType }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="content" label="发票内容" min-width="180">
        <template slot-scope="{ row }">
          <el-tooltip :content="row.content" placement="top">
            <div class="text-ellipsis">{{ row.content }}</div>
          </el-tooltip>
        </template>
      </el-table-column>
      
      <el-table-column prop="amount" label="开票金额" width="120" align="right">
        <template slot-scope="{ row }">
          {{ formatAmount(row.amount) }}
        </template>
      </el-table-column>
      
      <el-table-column prop="titleName" label="发票抬头" width="180">
        <template slot-scope="{ row }">
          <el-tooltip :content="`税号：${row.taxNumber}`" placement="top">
            <div class="text-ellipsis">{{ row.titleName }}</div>
          </el-tooltip>
        </template>
      </el-table-column>
      
      <el-table-column prop="submitter" label="提交人" width="100"></el-table-column>
      
      <el-table-column prop="applyTime" label="申请时间" width="150">
        <template slot-scope="{ row }">
          {{ formatDate(row.applyTime) }}
        </template>
      </el-table-column>
      
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="{ row }">
          <el-tag size="small" :type="getStatusType(row.status)">
            {{ getStatusName(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="220" fixed="right">
        <template slot-scope="{ row }">
          <el-button
            v-if="row.status === 'completed'"
            size="mini"
            icon="el-icon-download"
            @click="handleDownload(row)"
          >
            下载
          </el-button>
          <el-button
            v-if="row.status === 'completed' && !row.isFlushed"
            size="mini"
            type="warning"
            icon="el-icon-refresh"
            @click="handleRedFlush(row)"
          >
            红冲
          </el-button>
          <el-button
            v-if="row.status === 'completed' && row.isFlushed"
            size="mini"
            type="primary"
            icon="el-icon-document-add"
            @click="handleReissue(row)"
          >
            换开
          </el-button>
          <el-button
            v-if="row.status === 'pending' || row.status === 'processing'"
            size="mini"
            type="info"
            disabled
          >
            处理中
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 红冲确认对话框 -->
    <el-dialog
      title="确认红冲"
      :visible.sync="redFlushDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <p class="warning-message">
          <i class="el-icon-warning"></i>
          确认要对以下发票进行红冲操作吗？
        </p>
        <div v-if="currentRecord" class="record-info">
          <div class="info-row">
            <span class="label">申请编号：</span>
            <span class="value">{{ currentRecord.applicationNo }}</span>
          </div>
          <div class="info-row">
            <span class="label">发票类型：</span>
            <span class="value">{{ currentRecord.invoiceType }}</span>
          </div>
          <div class="info-row">
            <span class="label">开票金额：</span>
            <span class="value">{{ formatAmount(currentRecord.amount) }}</span>
          </div>
        </div>
        <el-form :model="redFlushForm" label-width="80px">
          <el-form-item label="红冲原因">
            <el-input
              v-model="redFlushForm.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入红冲原因"
            ></el-input>
          </el-form-item>
        </el-form>
        <p class="hint-message">红冲后该发票将作废，可以进行换开操作。</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="redFlushDialogVisible = false">取消</el-button>
        <el-button type="warning" :loading="operating" @click="confirmRedFlush">确定红冲</el-button>
      </span>
    </el-dialog>

    <!-- 换开对话框 -->
    <el-dialog
      title="换开发票"
      :visible.sync="reissueDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <p class="info-message">
          <i class="el-icon-info"></i>
          请填写新的发票抬头信息
        </p>
        <el-form :model="reissueForm" :rules="reissueRules" ref="reissueForm" label-width="100px">
          <el-form-item label="发票抬头" prop="titleName">
            <el-input v-model="reissueForm.titleName" placeholder="请输入发票抬头"></el-input>
          </el-form-item>
          <el-form-item label="税号" prop="taxNumber">
            <el-input v-model="reissueForm.taxNumber" placeholder="请输入税号"></el-input>
          </el-form-item>
          <el-form-item label="地址电话">
            <el-input v-model="reissueForm.address" placeholder="请输入地址和电话"></el-input>
          </el-form-item>
          <el-form-item label="开户行">
            <el-input v-model="reissueForm.bankName" placeholder="请输入开户行"></el-input>
          </el-form-item>
          <el-form-item label="银行账号">
            <el-input v-model="reissueForm.bankAccount" placeholder="请输入银行账号"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reissueDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="operating" @click="confirmReissue">确定换开</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { formatAmount, formatDate } from "@/utils/format";
import { validateTaxNumber } from "@/utils/validators";
import { showSuccess, showWarning, handleApiError } from "@/utils/errorHandler";

export default {
  name: "InvoiceRecordTable",
  props: {
    records: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedRecords: [],
      currentRecord: null,
      operating: false,
      
      // 红冲对话框
      redFlushDialogVisible: false,
      redFlushForm: {
        reason: ""
      },
      
      // 换开对话框
      reissueDialogVisible: false,
      reissueForm: {
        titleName: "",
        taxNumber: "",
        address: "",
        bankName: "",
        bankAccount: ""
      },
      reissueRules: {
        titleName: [
          { required: true, message: "请输入发票抬头", trigger: "blur" }
        ],
        taxNumber: [
          { required: true, message: "请输入税号", trigger: "blur" },
          { validator: this.validateTaxNumberRule, trigger: "blur" }
        ]
      },
      
      statusMap: {
        pending: "待处理",
        processing: "处理中",
        completed: "已完成",
        failed: "失败"
      },
      
      statusColorMap: {
        pending: "info",
        processing: "primary",
        completed: "success",
        failed: "danger"
      }
    };
  },
  methods: {
    formatAmount(amount) {
      return formatAmount(amount);
    },
    
    formatDate(date) {
      return formatDate(date, "YYYY-MM-DD HH:mm");
    },
    
    getInvoiceTypeColor(type) {
      if (type.includes("专用")) return "warning";
      if (type.includes("行程单")) return "primary";
      return "";
    },
    
    getStatusName(status) {
      return this.statusMap[status] || status;
    },
    
    getStatusType(status) {
      return this.statusColorMap[status] || "";
    },
    
    handleSelectionChange(selection) {
      this.selectedRecords = selection;
    },
    
    handleBatchDownload() {
      if (this.selectedRecords.length === 0) {
        showWarning("请选择要下载的发票");
        return;
      }
      
      showWarning(`批量下载功能开发中，已选择 ${this.selectedRecords.length} 条记录`);
    },
    
    handleDownload(row) {
      this.$emit("download", row);
    },
    
    handleRedFlush(row) {
      this.currentRecord = row;
      this.redFlushForm.reason = "";
      this.redFlushDialogVisible = true;
    },
    
    async confirmRedFlush() {
      if (!this.redFlushForm.reason || this.redFlushForm.reason.trim() === "") {
        showWarning("请输入红冲原因");
        return;
      }
      
      this.operating = true;
      
      try {
        await this.$emit("red-flush", {
          record: this.currentRecord,
          reason: this.redFlushForm.reason
        });
        
        showSuccess("红冲操作成功");
        this.redFlushDialogVisible = false;
      } catch (error) {
        // 错误已在父组件处理
      } finally {
        this.operating = false;
      }
    },
    
    handleReissue(row) {
      this.currentRecord = row;
      this.reissueForm = {
        titleName: "",
        taxNumber: "",
        address: "",
        bankName: "",
        bankAccount: ""
      };
      this.reissueDialogVisible = true;
    },
    
    async confirmReissue() {
      try {
        await this.$refs.reissueForm.validate();
      } catch (error) {
        return;
      }
      
      this.operating = true;
      
      try {
        await this.$emit("reissue", {
          record: this.currentRecord,
          newTitle: this.reissueForm
        });
        
        showSuccess("换开操作成功");
        this.reissueDialogVisible = false;
      } catch (error) {
        // 错误已在父组件处理
      } finally {
        this.operating = false;
      }
    },
    
    validateTaxNumberRule(rule, value, callback) {
      if (!value) {
        callback(new Error("请输入税号"));
      } else if (!validateTaxNumber(value)) {
        callback(new Error("请输入正确的税号格式"));
      } else {
        callback();
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.invoice-record-table {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: @spacing-md;

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

  .text-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dialog-content {
    .warning-message,
    .info-message {
      display: flex;
      align-items: center;
      gap: @spacing-sm;
      padding: @spacing-md;
      border-radius: @border-radius-base;
      margin-bottom: @spacing-lg;
      font-size: @font-size-base;

      i {
        font-size: @font-size-xl;
      }
    }

    .warning-message {
      background: #fef0f0;
      border: 1px solid #fde2e2;
      color: @danger-color;
    }

    .info-message {
      background: @bg-light;
      border: 1px solid @border-base;
      color: @primary-color;
    }

    .record-info {
      background: @bg-light;
      padding: @spacing-md;
      border-radius: @border-radius-base;
      margin-bottom: @spacing-lg;

      .info-row {
        display: flex;
        padding: @spacing-xs 0;

        .label {
          color: @text-secondary;
          min-width: 90px;
        }

        .value {
          flex: 1;
          color: @text-primary;
          font-weight: 500;
        }
      }
    }

    .hint-message {
      color: @text-placeholder;
      font-size: @font-size-sm;
      margin: @spacing-md 0 0;
      text-align: center;
    }
  }
}
</style>

