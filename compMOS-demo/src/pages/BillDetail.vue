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
          <el-step title="确认账单">
            <template v-if="currentBill && currentBill.confirmTime">
              <div slot="description" class="step-description">
                确认日期: {{ formatDate(currentBill.confirmTime, 'YYYY-MM-DD') }}
              </div>
            </template>
          </el-step>
          <el-step title="开票">
            <template v-if="currentBill && currentBill.billStatus === BILL_STATUS.INVOICING">
              <div slot="description" class="step-description">
                {{ invoicingSubStatus }}
              </div>
            </template>
          </el-step>
          <el-step title="付款"></el-step>
          <el-step title="已结清"></el-step>
        </el-steps>
    </el-card>

      <!-- 拆分配置提示条：未配置时提示用户配置拆分维度 -->
      <div v-if="!splitConfigured" class="split-config-banner">
        <span>建议配置拆分汇总维度以更准确地生成开票信息</span>
        <el-button type="primary" size="mini" @click="openSplitConfig">立即配置</el-button>
      </div>

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
            <template v-else-if="showInvoiceForm">
              <el-button @click="handleCancelConfirm">撤销确认</el-button>
              <el-button icon="el-icon-download" @click="handleExportInvoiceInfo">导出开票信息</el-button>
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
      <!-- 开票表单模式 -->
      <el-card v-if="showInvoiceForm" class="tabs-card">
        <div class="invoice-apply-header">
          <h3 class="section-title">开票信息表</h3>
        </div>
        
        <div v-loading="invoiceFormLoading" class="invoice-apply-content">
          <!-- 开票信息表单 -->
          <invoice-form
            ref="invoiceForm"
            :bill-no="billNo"
            :invoice-rows="invoiceRows"
            :titles="invoiceTitles"
            :split-config="splitConfig"
            @update="handleInvoiceFormUpdate"
            @cancel="handleCancelConfirmFromInvoice"
            @submit="handleSubmitInvoice"
          ></invoice-form>
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
                <bill-orders-tab :bill-no="billNo" :bill-status="currentBill.billStatus"></bill-orders-tab>
              </el-tab-pane>
        </el-tabs>
      </el-card>
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
import { formatAmount, formatBillCycle, formatDate } from "@/utils/format";
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
    // 是否已经配置拆分汇总（独立判断，不依赖明细设置）
    splitConfigured() {
      const splitConfig = this.$store.state.config.splitConfig;
      return splitConfig && splitConfig.dimensions && splitConfig.dimensions.length > 0;
    },
    
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
     * 开票阶段的子状态描述
     */
    invoicingSubStatus() {
      if (this.showInvoiceForm) {
        return '填写开票信息';
      } else if (this.activeTab === 'invoice') {
        return '开票汇总';
      }
      return '';
    },
    
    /**
     * 是否可以提交开票申请
     */
    canSubmitInvoice() {
      if (this.invoiceRowCount === 0 || this.invoiceTotalAmount === 0) {
        return false;
      }
      
      // 检查所有开票行是否都有效（必填字段都已填写）
      const validRows = this.invoiceRows.filter(row => {
        // 跳过分组行
        if (row.isGroup) return true;
        
        // 检查必填字段
        const hasInvoiceType = !!(row.invoiceType || row.invoiceTypeName);
        const hasTitle = !!(row.titleId && row.titleName);
        const hasReceiver = !!(row.receiverId && row.receiverName && row.receiverPhone && row.receiverEmail && row.receiverAddress);
        const hasValidQuantity = row.quantity >= 1 && row.quantity <= 99999;
        
        return hasInvoiceType && hasTitle && hasReceiver && hasValidQuantity;
      });
      
      return validRows.length === this.invoiceRowCount;
      }
    },
    async created() {
      await this.loadBillDetail();
      await this.checkAndRestoreInvoicingState();
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
     * 检查并恢复开票状态（重新进入页面时）
     */
    async checkAndRestoreInvoicingState() {
      // 如果账单处于开票中状态
      if (this.currentBill && this.currentBill.billStatus === BILL_STATUS.INVOICING) {
        try {
          // 获取开票申请记录
          const mockApi = require("@/mock/index").default;
          const response = await mockApi.getInvoiceApplications(this.billNo);
          const hasApplications = response && response.data && response.data.list && response.data.list.length > 0;
          
          console.log("检查开票状态 - billStatus:", this.currentBill.billStatus);
          console.log("检查开票状态 - hasApplications:", hasApplications);
          
          // 如果还未提交过开票申请，说明处于子状态1（填写开票信息）
          if (!hasApplications) {
            console.log("检测到开票中状态且无开票记录，恢复开票信息表");
            await this.proceedToInvoiceForm();
          } else {
            // 如果已有开票申请记录，说明处于子状态2（开票汇总）
            console.log("检测到开票中状态且有开票记录，显示开票汇总");
            this.activeTab = "invoice";
          }
        } catch (error) {
          console.warn('检查开票状态失败:', error);
        }
      }
    },
  
    /**
     * 初始化拆分汇总配置（独立配置，不依赖明细设置）
     */
    initSplitConfig() {
      // 只从 Vuex store 的 splitConfig 加载（不再使用 detailSettings）
      const storeConfig = this.$store.state.config.splitConfig;
      
      if (storeConfig && storeConfig.dimensions && Array.isArray(storeConfig.dimensions) && storeConfig.dimensions.length > 0) {
        // 如果有有效配置，直接使用
        this.splitConfig = { 
          dimension1: storeConfig.dimension1,
          dimension2: storeConfig.dimension2,
          dimensions: [...storeConfig.dimensions] 
        };
      } else if (storeConfig && (storeConfig.dimension1 || storeConfig.dimension2)) {
        // 兼容旧格式：从 dimension1 和 dimension2 构建 dimensions 数组
        const dimensions = [];
        if (storeConfig.dimension1) dimensions.push(storeConfig.dimension1);
        if (storeConfig.dimension2) dimensions.push(storeConfig.dimension2);
        this.splitConfig = { 
          dimension1: storeConfig.dimension1,
          dimension2: storeConfig.dimension2,
          dimensions 
        };
      } else {
        // 如果没有配置，设置默认值（业务线）
        const { SPLIT_DIMENSION } = require("@/utils/constants");
        this.splitConfig = { 
          dimension1: SPLIT_DIMENSION.BUSINESS_LINE,
          dimension2: null,
          dimensions: [SPLIT_DIMENSION.BUSINESS_LINE] 
        };
      }
      
      console.log("初始化拆分汇总配置:", this.splitConfig);
    },
    
    /**
     * 初始化激活的Tab
     */
    initActiveTab() {
      if (!this.currentBill) {
        return;
      }
      
      // 如果正在显示开票表单，不切换tab
      if (this.showInvoiceForm) {
        this.activeTab = "summary"; // 保持在账单汇总，但不显示（因为显示的是开票表单）
        return;
      }
      
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
        // 如果当前在开票信息表，需要先退出
        if (this.showInvoiceForm) {
          this.exitInvoiceForm();
        }
        
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
      // 确保 splitConfig 有 dimensions 数组
      if (!this.splitConfig) {
        this.splitConfig = { dimensions: [] };
      }
      if (!this.splitConfig.dimensions || !Array.isArray(this.splitConfig.dimensions)) {
        this.splitConfig.dimensions = [];
      }
      
      // 检查是否有拆分汇总配置
      if (this.splitConfig.dimensions.length === 0) {
        // 如果没有配置，默认设置字段一为业务线
        const { SPLIT_DIMENSION } = require("@/utils/constants");
        this.splitConfig = {
          dimensions: [SPLIT_DIMENSION.BUSINESS_LINE]
        };
        
        // 保存默认配置到 Vuex
        await this.$store.dispatch("config/saveSplitConfig", {
          dimension1: SPLIT_DIMENSION.BUSINESS_LINE,
          dimension2: null,
          dimensions: [SPLIT_DIMENSION.BUSINESS_LINE]
        });
      }

      console.log("handleApplyInvoice - splitConfig:", this.splitConfig);

      // 如果当前状态是待开票，需要先将状态改为开票中
      if (this.currentBill.billStatus === BILL_STATUS.PENDING_INVOICE) {
        try {
          const mockApi = require("@/mock/index").default;
          await mockApi.startInvoicing(this.billNo);
          
          // 重新加载账单详情以更新状态
          await this.loadBillDetail();
        } catch (error) {
          console.error("开始开票失败:", error);
        }
      }

      // 进入开票表单
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
     * 从开票信息页撤销确认
     */
    handleCancelConfirmFromInvoice() {
      // 退出开票表单
      this.exitInvoiceForm();
      // 显示撤销确认对话框
      this.handleCancelConfirm();
    },
    
    /**
     * 加载开票数据
     */
    async loadInvoiceData() {
      try {
        const mockApi = require("@/mock/index").default;

        // 加载发票抬头
        const titleRes = await mockApi.getInvoiceTitles();
        if (!titleRes || !titleRes.data) {
          throw new Error("获取发票抬头失败");
        }
        this.invoiceTitles = titleRes.data.list || [];
        console.log("loadInvoiceData - invoiceTitles:", this.invoiceTitles);

        // 先获取开票汇总数据（确保数据一致性）
        const summaryRes = await mockApi.getInvoiceSummary(this.billNo);
        if (!summaryRes || !summaryRes.data) {
          throw new Error("获取开票汇总失败");
        }
        const invoiceSummary = summaryRes.data;

        // 确保 splitConfig 格式正确
        let splitConfigForApi = this.splitConfig;
        if (!splitConfigForApi) {
          splitConfigForApi = { dimensions: [] };
        }
        
        // 确保 dimensions 数组存在
        if (!splitConfigForApi.dimensions || !Array.isArray(splitConfigForApi.dimensions)) {
          // 尝试从 dimension1 和 dimension2 构建
          if (splitConfigForApi.dimension1 || splitConfigForApi.dimension2) {
            const dimensions = [];
            if (splitConfigForApi.dimension1) dimensions.push(splitConfigForApi.dimension1);
            if (splitConfigForApi.dimension2) dimensions.push(splitConfigForApi.dimension2);
            splitConfigForApi = { ...splitConfigForApi, dimensions };
          } else {
            // 如果没有配置，使用默认配置
            const { SPLIT_DIMENSION } = require("@/utils/constants");
            splitConfigForApi = {
              dimensions: [SPLIT_DIMENSION.BUSINESS_LINE]
            };
          }
        }

        // 根据拆分汇总字段和发票明细生成开票行
        const rowRes = await mockApi.generateInvoiceRows(this.billNo, splitConfigForApi);
        if (!rowRes || !rowRes.data) {
          throw new Error("生成开票行失败");
        }
        let invoiceRows = rowRes.data || [];

        // 确保 invoiceRows 是数组
        if (!Array.isArray(invoiceRows)) {
          console.warn("开票行数据格式不正确，使用空数组");
          invoiceRows = [];
        }

        console.log("loadInvoiceData - 原始 invoiceRows:", invoiceRows.slice(0, 2));

        // 数据格式转换：确保所有字段格式统一
        invoiceRows = invoiceRows.map((row, index) => {
          // 处理抬头信息：兼容 invoiceTitle 对象格式
          let titleId = row.titleId || "";
          let titleName = row.titleName || "";
          let taxNumber = row.taxNumber || "";
          
          if (row.invoiceTitle && typeof row.invoiceTitle === 'object') {
            titleId = row.invoiceTitle.titleId || titleId;
            titleName = row.invoiceTitle.titleName || titleName;
            taxNumber = row.invoiceTitle.taxNumber || taxNumber;
          }

          // 处理接收人信息：兼容 recipient 对象格式
          let receiverId = row.receiverId || "";
          let receiverName = row.receiverName || "";
          let receiverPhone = row.receiverPhone || "";
          let receiverEmail = row.receiverEmail || "";
          let receiverAddress = row.receiverAddress || "";
          
          if (row.recipient && typeof row.recipient === 'object') {
            receiverId = row.recipient.id || receiverId;
            receiverName = row.recipient.name || receiverName;
            receiverPhone = row.recipient.phone || receiverPhone;
            receiverEmail = row.recipient.email || receiverEmail;
            receiverAddress = row.recipient.address || receiverAddress;
          }

          // 确保必需字段存在
          const normalizedRow = {
            id: row.id || `invoice_row_${index}`,
            invoiceType: row.invoiceType || row.invoiceTypeName || "",
            invoiceTypeName: row.invoiceTypeName || row.invoiceType || "",
            summary: row.summary || row.invoiceSummary || "",
            invoiceSummary: row.invoiceSummary || row.summary || "",
            amount: row.amount || 0,
            orderCount: row.orderCount || 0,
            quantity: row.quantity || 1,
            unit: row.unit || "元",
            // 抬头信息（扁平化）
            titleId: titleId,
            titleName: titleName,
            taxNumber: taxNumber,
            // 接收人信息（扁平化）
            receiverId: receiverId,
            receiverName: receiverName,
            receiverPhone: receiverPhone,
            receiverEmail: receiverEmail,
            receiverAddress: receiverAddress,
            // 拆分维度信息（确保正确设置）
            splitDimension1: row.splitDimension1 || row.businessLine || "",
            splitDimension2: row.splitDimension2 || row.legalEntity || "",
            businessLine: row.businessLine || row.splitDimension1 || "",
            legalEntity: row.legalEntity || row.splitDimension2 || "",
            paymentAccount: row.paymentAccount || row.splitDimension1 || "",
            department: row.department || row.splitDimension2 || "",
            // 验证状态
            isValid: row.isValid !== undefined ? row.isValid : false
          };

          return normalizedRow;
        });

        // 如果有发票明细，确保开票行的金额与明细一致
        if (invoiceSummary && invoiceSummary.invoiceDetails && invoiceSummary.invoiceDetails.length > 0) {
          // 按发票种类和摘要匹配，更新金额为还可提交金额
          invoiceRows = invoiceRows.map(row => {
            const rowType = row.invoiceType || row.invoiceTypeName || "";
            const rowSummary = row.invoiceSummary || row.summary || "";
            
            // 找到匹配的明细
            const matchingDetail = invoiceSummary.invoiceDetails.find(detail => {
              // 类型匹配（支持部分匹配）
              const typeMatch = rowType === detail.type || 
                               String(rowType).includes(detail.type) || 
                               detail.type.includes(String(rowType)) ||
                               row.invoiceTypeName === detail.type;
              
              // 摘要匹配（支持部分匹配）
              const summaryMatch = rowSummary === detail.summary || 
                                  rowSummary.includes(detail.summary) || 
                                  detail.summary.includes(rowSummary);
              
              return typeMatch && summaryMatch;
            });
            
            if (matchingDetail && matchingDetail.remainingAmount > 0) {
              // 如果找到匹配的明细，使用明细的还可提交金额和订单数
              return {
                ...row,
                amount: matchingDetail.remainingAmount,
                orderCount: matchingDetail.orderCount || row.orderCount
              };
            }
            return row;
          });
        }

        this.invoiceRows = invoiceRows;
        console.log("loadInvoiceData - 最终 invoiceRows:", this.invoiceRows.slice(0, 2));

        // 更新统计信息
        this.updateInvoiceStats();
        console.log("loadInvoiceData - 统计信息:", {
          rowCount: this.invoiceRowCount,
          totalAmount: this.invoiceTotalAmount
        });
      } catch (error) {
        console.error("加载开票数据错误:", error);
        throw error;
      }
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
      // 处理更新事件，支持多种数据格式
      if (data && data.invoiceRows) {
        // 新格式：{ invoiceRows: [...] }
        this.invoiceRows = data.invoiceRows;
      } else if (Array.isArray(data)) {
        // 旧格式：直接是数组
        this.invoiceRows = data;
      }
      
      // 更新统计信息
      this.updateInvoiceStats();
    },
    
    /**
     * 提交开票申请
     */
    async handleSubmitInvoice(invoiceRows) {
      // 确认提示
      try {
        await this.$confirm('请确认当期开票信息无误', '确认提交', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
      } catch (error) {
        // 用户取消
        return;
      }
      
      this.submitting = true;
      
      try {
        const mockApi = require("@/mock/index").default;
        await mockApi.applyInvoice({
          billNo: this.billNo,
          invoiceRows: invoiceRows || this.invoiceRows
        });
        
        showSuccess("开票申请提交成功");

        // 退出开票表单
        this.exitInvoiceForm();

        // 延迟刷新，确保 mock 数据已更新
        await new Promise(resolve => setTimeout(resolve, 100));

        // 刷新账单数据和开票汇总数据
        await Promise.all([
          this.loadBillDetail(),
          this.$store.dispatch("invoice/fetchInvoiceSummary", this.billNo),
          this.$store.dispatch("invoice/fetchInvoiceApplications", this.billNo)
        ]);

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
     * 打开拆分汇总配置对话框（快速入口）
     */
    openSplitConfig() {
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

        // 保存配置到 Vuex（独立保存到 splitConfig，不影响 detailSettings）
        await this.$store.dispatch("config/saveSplitConfig", config);

        // 更新本地配置
        this.splitConfig = { ...config, dimensions };
        this.splitConfigVisible = false;

        showSuccess("拆分汇总配置已保存");

        // 如果是从确认账单进入的（开票中状态），保存配置后自动进入开票表单
        if (this.currentBill && this.currentBill.billStatus === BILL_STATUS.INVOICING) {
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
     * 导出开票信息
     */
    handleExportInvoiceInfo() {
      // TODO: 实现导出开票信息功能
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
    },
    
    /**
     * 格式化日期
     */
    formatDate(date, format = 'YYYY-MM-DD') {
      return formatDate(date, format);
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

      .step-description {
        color: @warning-color;
        font-size: @font-size-sm;
        margin-top: @spacing-xs;
      }
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

    // 拆分配置提示条
    .split-config-banner {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      background: #fff8e1;
      border: 1px solid #ffe0a3;
      color: #8a6d1b;
      padding: 8px 12px;
      border-radius: 4px;
      margin: 8px 0 12px 0;
    }
  }
  
</style>
