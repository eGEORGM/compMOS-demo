<template>
  <div class="invoice-record-table">
    <div class="table-header">
      <div class="header-actions">
        <el-button 
          v-if="selectedRecords.length > 0"
          size="small" 
          icon="el-icon-download"
          @click="handleBatchDownload"
        >
          批量下载
        </el-button>
      </div>
    </div>

    <el-table
      :data="paginatedRecords"
      v-loading="loading"
      stripe
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      
      <el-table-column prop="invoiceType" label="发票类型" width="150">
        <template slot-scope="{ row }">
          {{ row.invoiceType }}
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
      
      <el-table-column prop="titleName" label="发票抬头" width="200">
        <template slot-scope="{ row }">
          <el-tooltip :content="`税号：${row.taxNumber}`" placement="top">
            <div class="text-ellipsis">{{ row.titleName }}</div>
          </el-tooltip>
        </template>
      </el-table-column>
      
      <el-table-column prop="submitter" label="提交人" width="180">
        <template slot-scope="{ row }">
          {{ row.submitter }}
        </template>
      </el-table-column>
      
      <el-table-column prop="applyTime" label="申请时间" width="150">
        <template slot-scope="{ row }">
          {{ formatDate(row.applyTime) }}
        </template>
      </el-table-column>
      
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="{ row }">
          <StatusTag 
            type="invoice-status" 
            :status="row.status || (row.isFlushed ? 'flushed' : 'completed')"
            size="small"
          />
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="{ row }">
          <el-link
            v-if="row.status === 'completed' || row.status === 'flushed'"
            type="primary"
            :underline="false"
            @click="handleDownload(row)"
          >
            下载
          </el-link>
          <el-link
            v-if="row.status === 'completed' && !row.isFlushed"
            type="primary"
            :underline="false"
            @click="handleRedFlush(row)"
            style="margin-left: 8px;"
          >
            红冲
          </el-link>
          <el-link
            v-if="isVATInvoice(row) && row.status === 'completed' && !row.isFlushed"
            type="primary"
            :underline="false"
            @click="handlePartialRedFlush(row)"
            style="margin-left: 8px;"
          >
            部分红冲
          </el-link>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>

    <!-- 红冲确认对话框 -->
    <el-dialog
      title="确认红冲"
      :visible.sync="redFlushDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <p class="warning-message">
          <i class="el-icon-info"></i>
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
        <p class="hint-message">
          <i class="el-icon-info"></i>
          红冲后该发票将作废，可以进行换开操作。
        </p>
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

    <!-- 部分红冲对话框 -->
    <el-dialog
      title="部分红冲"
      :visible.sync="partialRedFlushDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <p class="info-message">
          <i class="el-icon-info"></i>
          请上传包含部分红冲信息的Excel文件（.xlsx格式）
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
        <el-form :model="partialRedFlushForm" label-width="100px">
          <el-form-item label="上传文件" required>
            <el-upload
              ref="fileUpload"
              :auto-upload="false"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :limit="1"
              accept=".xlsx,.xls"
              :file-list="fileList"
            >
              <el-button size="small" type="primary" icon="el-icon-upload">选择文件</el-button>
              <div slot="tip" class="el-upload__tip">只能上传xlsx/xls文件，且不超过10MB</div>
            </el-upload>
          </el-form-item>
          <el-form-item label="红冲原因">
            <el-input
              v-model="partialRedFlushForm.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入部分红冲原因"
            ></el-input>
          </el-form-item>
        </el-form>
        <p class="hint-message">
          <i class="el-icon-info"></i>
          部分红冲后，剩余金额仍可正常使用。
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="partialRedFlushDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="operating" @click="confirmPartialRedFlush">确定部分红冲</el-button>
      </span>
    </el-dialog>

    <!-- 行程单/火车票红冲对话框 -->
    <el-dialog
      :title="getItineraryRedFlushTitle()"
      :visible.sync="itineraryRedFlushDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <p class="info-message">
          <i class="el-icon-info"></i>
          请上传包含需要红冲的票号/订单信息的Excel文件（.xlsx格式）
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
        <el-form :model="itineraryRedFlushForm" label-width="100px">
          <el-form-item label="上传文件" required>
            <el-upload
              ref="itineraryFileUpload"
              :auto-upload="false"
              :on-change="handleItineraryFileChange"
              :on-remove="handleItineraryFileRemove"
              :limit="1"
              accept=".xlsx,.xls"
              :file-list="itineraryFileList"
            >
              <el-button size="small" type="primary" icon="el-icon-upload">选择文件</el-button>
              <div slot="tip" class="el-upload__tip">只能上传xlsx/xls文件，且不超过10MB。文件需包含票号/订单号列</div>
            </el-upload>
          </el-form-item>
          <el-form-item label="红冲原因">
            <el-input
              v-model="itineraryRedFlushForm.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入红冲原因"
            ></el-input>
          </el-form-item>
        </el-form>
        <p class="hint-message">
          <i class="el-icon-info"></i>
          红冲后该发票将作废，可以进行换开操作。
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="itineraryRedFlushDialogVisible = false">取消</el-button>
        <el-button type="warning" :loading="operating" @click="confirmItineraryRedFlush">确定红冲</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { formatAmount, formatDate } from "@/utils/format";
import { validateTaxNumber } from "@/utils/validators";
import { showSuccess, showWarning, handleApiError } from "@/utils/errorHandler";
import StatusTag from "@/components/common/StatusTag.vue";

export default {
  name: "InvoiceRecordTable",
  components: {
    StatusTag
  },
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
      currentPage: 1,
      pageSize: 10,
      
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
      
      // 部分红冲对话框
      partialRedFlushDialogVisible: false,
      partialRedFlushForm: {
        reason: ""
      },
      fileList: [],
      
      // 行程单/火车票红冲对话框
      itineraryRedFlushDialogVisible: false,
      itineraryRedFlushForm: {
        reason: ""
      },
      itineraryFileList: [],
      
      statusMap: {
        pending: "待处理",
        processing: "处理中",
        completed: "已开票",
        failed: "失败",
        flushed: "已红冲"
      },
      
      statusColorMap: {
        pending: "info",
        processing: "primary",
        completed: "success",
        failed: "danger",
        flushed: "warning"
      }
    };
  },
  computed: {
    total() {
      return this.records.length;
    },
    paginatedRecords() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.records.slice(start, end);
    }
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
      
      // 如果是行程单或火车票，打开上传文件对话框
      if (this.isItineraryInvoice(row)) {
        this.itineraryRedFlushForm.reason = "";
        this.itineraryFileList = [];
        this.itineraryRedFlushDialogVisible = true;
      } else {
        // 增值税发票使用普通红冲对话框
        this.redFlushForm.reason = "";
        this.redFlushDialogVisible = true;
      }
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
    },
    
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
    },
    
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    
    /**
     * 判断是否为增值税发票
     */
    isVATInvoice(row) {
      if (!row || !row.invoiceType) return false;
      const invoiceType = String(row.invoiceType);
      // 增值税发票：包含"增值税"且不包含"行程单"
      return invoiceType.includes("增值税") && !invoiceType.includes("行程单");
    },
    
    /**
     * 判断是否为行程单或火车票发票
     */
    isItineraryInvoice(row) {
      if (!row || !row.invoiceType) return false;
      const invoiceType = String(row.invoiceType);
      // 行程单或火车票：包含"行程单"或"火车票"
      return invoiceType.includes("行程单") || invoiceType.includes("火车票");
    },
    
    /**
     * 获取行程单/火车票红冲对话框标题
     */
    getItineraryRedFlushTitle() {
      if (!this.currentRecord) return "红冲";
      const invoiceType = String(this.currentRecord.invoiceType);
      if (invoiceType.includes("机票")) {
        return "机票行程单红冲";
      } else if (invoiceType.includes("火车票")) {
        return "火车票行程单红冲";
      }
      return "行程单红冲";
    },
    
    /**
     * 处理部分红冲
     */
    handlePartialRedFlush(row) {
      this.currentRecord = row;
      this.partialRedFlushForm.reason = "";
      this.fileList = [];
      this.partialRedFlushDialogVisible = true;
    },
    
    /**
     * 文件选择变化
     */
    handleFileChange(file, fileList) {
      // 检查文件大小（10MB）
      const isLt10M = file.raw.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        showWarning("上传文件大小不能超过 10MB!");
        this.fileList = fileList.filter(item => item.uid !== file.uid);
        return;
      }
      
      // 检查文件类型
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        showWarning("只能上传 xlsx 或 xls 格式的文件!");
        this.fileList = fileList.filter(item => item.uid !== file.uid);
        return;
      }
      
      this.fileList = fileList;
    },
    
    /**
     * 文件移除
     */
    handleFileRemove(file, fileList) {
      this.fileList = fileList;
    },
    
    /**
     * 确认部分红冲
     */
    async confirmPartialRedFlush() {
      // 检查是否上传了文件
      if (!this.fileList || this.fileList.length === 0) {
        showWarning("请上传Excel文件");
        return;
      }
      
      // 检查红冲原因
      if (!this.partialRedFlushForm.reason || this.partialRedFlushForm.reason.trim() === "") {
        showWarning("请输入部分红冲原因");
        return;
      }
      
      this.operating = true;
      
      try {
        // TODO: 实现部分红冲功能
        // 这里应该调用API上传文件并处理部分红冲
        const file = this.fileList[0].raw;
        console.log("部分红冲文件:", file);
        console.log("部分红冲原因:", this.partialRedFlushForm.reason);
        console.log("申请编号:", this.currentRecord.applicationNo);
        
        // 模拟处理
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showSuccess("部分红冲操作成功");
        this.partialRedFlushDialogVisible = false;
        this.fileList = [];
        this.partialRedFlushForm.reason = "";
        
        // 刷新数据
        this.$emit("refresh");
      } catch (error) {
        handleApiError(error, {
          customMessage: "部分红冲操作失败"
        });
      } finally {
        this.operating = false;
      }
    },
    
    /**
     * 行程单/火车票文件选择变化
     */
    handleItineraryFileChange(file, fileList) {
      // 检查文件大小（10MB）
      const isLt10M = file.raw.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        showWarning("上传文件大小不能超过 10MB!");
        this.itineraryFileList = fileList.filter(item => item.uid !== file.uid);
        return;
      }
      
      // 检查文件类型
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        showWarning("只能上传 xlsx 或 xls 格式的文件!");
        this.itineraryFileList = fileList.filter(item => item.uid !== file.uid);
        return;
      }
      
      this.itineraryFileList = fileList;
    },
    
    /**
     * 行程单/火车票文件移除
     */
    handleItineraryFileRemove(file, fileList) {
      this.itineraryFileList = fileList;
    },
    
    /**
     * 确认行程单/火车票红冲
     */
    async confirmItineraryRedFlush() {
      // 检查是否上传了文件
      if (!this.itineraryFileList || this.itineraryFileList.length === 0) {
        showWarning("请上传包含票号/订单信息的Excel文件");
        return;
      }
      
      // 检查红冲原因
      if (!this.itineraryRedFlushForm.reason || this.itineraryRedFlushForm.reason.trim() === "") {
        showWarning("请输入红冲原因");
        return;
      }
      
      this.operating = true;
      
      try {
        // TODO: 实现行程单/火车票红冲功能
        // 这里应该调用API上传文件并处理红冲
        const file = this.itineraryFileList[0].raw;
        console.log("行程单/火车票红冲文件:", file);
        console.log("红冲原因:", this.itineraryRedFlushForm.reason);
        console.log("申请编号:", this.currentRecord.applicationNo);
        console.log("发票类型:", this.currentRecord.invoiceType);
        
        // 模拟处理
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showSuccess("红冲操作成功");
        this.itineraryRedFlushDialogVisible = false;
        this.itineraryFileList = [];
        this.itineraryRedFlushForm.reason = "";
        
        // 刷新数据
        this.$emit("refresh");
      } catch (error) {
        handleApiError(error, {
          customMessage: "红冲操作失败"
        });
      } finally {
        this.operating = false;
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
    justify-content: flex-end;
    align-items: center;
    margin-bottom: @spacing-sm;

    .header-actions {
      display: flex;
      gap: @spacing-sm;
    }
  }

  .pagination-container {
    margin-top: @spacing-md;
    display: flex;
    justify-content: flex-end;
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
      display: flex;
      align-items: center;
      gap: @spacing-sm;
      padding: @spacing-md;
      background: @bg-light;
      border-radius: @border-radius-base;
      color: @text-secondary;
      font-size: @font-size-base;
      margin: @spacing-md 0 0;

      i {
        color: @primary-color;
        font-size: @font-size-xl;
      }
    }
  }
}
</style>

