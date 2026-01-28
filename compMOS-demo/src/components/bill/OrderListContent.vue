<template>
  <div class="order-list-content">
    <!-- 搜索筛选 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" size="small">
        <el-form-item label="订单号">
          <el-input
            v-model="filterForm.orderNo"
            placeholder="请输入订单号"
            clearable
            style="width: 180px"
          ></el-input>
        </el-form-item>

        <el-form-item label="核对状态">
          <el-select
            v-model="filterForm.checkStatus"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="全部" :value="null"></el-option>
            <el-option label="未核对" :value="0"></el-option>
            <el-option label="已核对" :value="1"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="出行人/入住人">
          <el-input
            v-model="filterForm.travelerName"
            placeholder="请输入姓名"
            clearable
            style="width: 140px"
          ></el-input>
        </el-form-item>

        <el-form-item label="法人实体">
          <el-select
            v-model="filterForm.legalEntity"
            placeholder="全部"
            clearable
            style="width: 160px"
          >
            <el-option label="全部" :value="null"></el-option>
            <el-option
              v-for="entity in legalEntityOptions"
              :key="entity"
              :label="entity"
              :value="entity"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="下单日期">
          <el-date-picker
            v-model="filterForm.bookingDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 240px"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="业务类型">
          <el-select
            v-model="filterForm.businessType"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="全部" :value="null"></el-option>
            <el-option
              v-for="(name, value) in businessTypeOptions"
              :key="value"
              :label="name"
              :value="value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="支付方式">
          <el-select
            v-model="filterForm.paymentAccount"
            placeholder="全部"
            clearable
            style="width: 160px"
          >
            <el-option label="全部" :value="null"></el-option>
            <el-option
              v-for="account in paymentAccountOptions"
              :key="account"
              :label="account"
              :value="account"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="费用归属">
          <el-select
            v-model="filterForm.costCenter"
            placeholder="全部"
            clearable
            style="width: 160px"
          >
            <el-option label="全部" :value="null"></el-option>
            <el-option
              v-for="center in costCenterOptions"
              :key="center"
              :label="center"
              :value="center"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="项目名称">
          <el-select
            v-model="filterForm.project"
            placeholder="全部"
            clearable
            filterable
            style="width: 160px"
          >
            <el-option label="全部" :value="null"></el-option>
            <el-option
              v-for="proj in projectOptions"
              :key="proj"
              :label="proj"
              :value="proj"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            icon="el-icon-search" 
            @click="handleSearch"
          >查询</el-button>
          <el-button 
            icon="el-icon-refresh-left" 
            @click="handleReset"
          >重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作工具栏 -->
    <div class="toolbar-section">
      <div class="toolbar-left">
        <el-button
          size="small"
          type="primary"
          @click="handleSelectAll"
          :disabled="isOperationsDisabled || totalOrderCount === 0"
        >
          选中全部列表 ({{ totalOrderCount }}笔)
        </el-button>
        <span v-if="selectedOrders.length > 0" class="selection-info">
          已选择 {{ selectedOrders.length }} 笔订单
        </span>
      </div>
      <div class="toolbar-actions">
        <el-button
          size="small"
          icon="el-icon-edit"
          @click="handleBatchUpdate"
          :disabled="isOperationsDisabled || selectedOrders.length === 0"
        >
          更新数据
        </el-button>
        <el-button
          size="small"
          icon="el-icon-check"
          type="success"
          @click="handleMarkAsChecked"
          :disabled="isOperationsDisabled || selectedOrders.length === 0"
        >
          标记为已核对
        </el-button>
        <el-button
          size="small"
          icon="el-icon-close"
          @click="handleUnmarkChecked"
          :disabled="isOperationsDisabled || selectedOrders.length === 0"
        >
          取消已核对标记
        </el-button>
        <el-button
          size="small"
          icon="el-icon-upload"
          @click="handleBatchModify"
          :disabled="isOperationsDisabled"
        >
          批量修改数据
        </el-button>
        <el-button 
          size="small" 
          icon="el-icon-setting" 
          @click="handleFieldConfig"
        >
          对账单字段配置
        </el-button>
        <el-button 
          size="small" 
          icon="el-icon-download" 
          @click="handleExportExcel"
        >
          导出Excel
        </el-button>
        <el-button 
          size="small" 
          icon="el-icon-download" 
          @click="handleExportPDF"
        >
          导出PDF
        </el-button>
      </div>
    </div>

    <!-- 订单表格 -->
    <el-table
      ref="orderTable"
      :data="filteredOrders"
      v-loading="loading"
      stripe
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <!-- 复选框列 -->
      <el-table-column 
        type="selection" 
        width="55" 
        fixed="left"
        :selectable="() => !isOperationsDisabled"
      ></el-table-column>
      
      <!-- 核对状态 - 最左边 -->
      <el-table-column
        v-if="isFieldVisible('checkStatus')"
        prop="checkStatus"
        label="核对状态"
        width="100"
        fixed="left"
      >
        <template slot-scope="{ row }">
          <el-tag :type="getCheckStatusType(row.checkStatus)" size="small">
            {{ getCheckStatusName(row.checkStatus) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 通用字段 -->
      <el-table-column
        v-if="isFieldVisible('orderNo')"
        prop="orderNo"
        label="订单号"
        width="170"
        fixed="left"
      ></el-table-column>
      <el-table-column
        v-if="isFieldVisible('bookingTime')"
        prop="bookingTime"
        label="预订日期"
        width="150"
      >
        <template slot-scope="{ row }">
          {{ formatDate(row.bookingTime) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isFieldVisible('departDate')"
        prop="departDate"
        label="出行日期"
        width="110"
      >
        <template slot-scope="{ row }">
          {{ formatDate(row.departDate, 'YYYY-MM-DD') }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isFieldVisible('bookingPerson')"
        prop="bookingPerson"
        label="预订人"
        width="90"
      ></el-table-column>
      <el-table-column
        v-if="isFieldVisible('travelerName')"
        prop="travelerName"
        label="出行人"
        width="90"
      ></el-table-column>

      <!-- 根据业务类型显示不同字段 -->
      <template v-if="businessType === '001'">
        <!-- 机票 -->
        <el-table-column
          v-if="isFieldVisible('flightNo')"
          prop="flightNo"
          label="航班号"
          width="100"
        ></el-table-column>
        <el-table-column
          v-if="isFieldVisible('route')"
          prop="route"
          label="航线"
          width="140"
        ></el-table-column>
        <el-table-column
          v-if="isFieldVisible('cabin')"
          prop="cabin"
          label="舱位"
          width="90"
        ></el-table-column>
      </template>

      <template v-else-if="businessType === '002'">
        <!-- 酒店 -->
        <el-table-column
          v-if="isFieldVisible('hotelName')"
          prop="hotelName"
          label="酒店名称"
          width="180"
        ></el-table-column>
        <el-table-column
          v-if="isFieldVisible('checkInDate')"
          prop="checkInDate"
          label="入住日期"
          width="110"
        >
          <template slot-scope="{ row }">
            {{ formatDate(row.checkInDate, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="isFieldVisible('checkOutDate')"
          prop="checkOutDate"
          label="离店日期"
          width="110"
        >
          <template slot-scope="{ row }">
            {{ formatDate(row.checkOutDate, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="isFieldVisible('nights')"
          prop="nights"
          label="房间数"
          width="80"
        ></el-table-column>
        <el-table-column
          v-if="isFieldVisible('roomType')"
          prop="roomType"
          label="房型"
          width="100"
        ></el-table-column>
      </template>

      <template v-else-if="businessType === '003'">
        <!-- 火车票 -->
        <el-table-column
          v-if="isFieldVisible('trainNo')"
          prop="trainNo"
          label="车次"
          width="90"
        ></el-table-column>
        <el-table-column
          v-if="isFieldVisible('route')"
          prop="route"
          label="线路"
          width="140"
        ></el-table-column>
        <el-table-column
          v-if="isFieldVisible('seatType')"
          prop="seatType"
          label="座位等级"
          width="100"
        ></el-table-column>
      </template>

      <template v-else-if="businessType === '004'">
        <!-- 用车 -->
        <el-table-column
          v-if="isFieldVisible('route')"
          prop="route"
          label="起终点"
          width="160"
        ></el-table-column>
      </template>

      <!-- 财务字段 -->
      <el-table-column
        v-if="isFieldVisible('legalEntity')"
        prop="legalEntity"
        label="法人实体"
        width="160"
      ></el-table-column>
      <el-table-column
        v-if="isFieldVisible('paymentAccount')"
        prop="paymentAccount"
        label="支付账户"
        width="110"
      ></el-table-column>
      <el-table-column
        v-if="isFieldVisible('costCenter')"
        prop="costCenter"
        label="成本中心"
        width="90"
      ></el-table-column>
      <el-table-column
        v-if="isFieldVisible('department')"
        prop="department"
        label="部门"
        width="120"
      ></el-table-column>
      <el-table-column
        v-if="isFieldVisible('project')"
        prop="project"
        label="项目"
        width="120"
      ></el-table-column>

      <!-- 金额 -->
      <el-table-column
        v-if="isFieldVisible('amount')"
        prop="amount"
        label="支付金额"
        width="110"
        align="right"
      >
        <template slot-scope="{ row }">
          {{ formatAmount(row.amount) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 底部汇总 -->
    <div class="summary-footer" v-if="filteredOrders.length > 0">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="summary-item">
            <span class="label">当前查看：</span>
            <span class="value">{{ filteredOrders.length }}笔</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <span class="label">总金额：</span>
            <span class="value primary">{{ formatAmount(totalAmount) }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <span class="label">已核对：</span>
            <span class="value success">{{ checkedCount }}笔</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <span class="label">未核对：</span>
            <span class="value warning">{{ uncheckedCount }}笔</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 字段配置对话框 -->
    <field-config-dialog
      :visible.sync="fieldConfigVisible"
      :current-config="fieldConfig"
      @save="handleSaveFieldConfig"
    ></field-config-dialog>
    
    <!-- 批量更新数据对话框 -->
    <el-dialog
      title="更新数据"
      :visible.sync="batchUpdateVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="batchUpdateForm" label-width="100px">
        <div class="info-banner" style="margin-bottom: 20px">
          <div class="info-icon"></div>
          <div class="info-content">即将更新 {{ selectedOrders.length }} 笔订单的数据，请选择要修改的字段</div>
        </div>
        
        <el-form-item label="法人实体">
          <el-select
            v-model="batchUpdateForm.legalEntity"
            placeholder="请选择法人实体"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="entity in legalEntityOptions"
              :key="entity"
              :label="entity"
              :value="entity"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="部门">
          <el-select
            v-model="batchUpdateForm.department"
            placeholder="请选择部门"
            clearable
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="dept in departmentOptions"
              :key="dept"
              :label="dept"
              :value="dept"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="项目">
          <el-select
            v-model="batchUpdateForm.project"
            placeholder="请选择项目"
            clearable
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="proj in projectOptions"
              :key="proj"
              :label="proj"
              :value="proj"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <div class="info-banner">
          <div class="info-icon"></div>
          <div class="info-content">只会更新您选择的字段，未选择的字段不会被修改</div>
        </div>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="batchUpdateVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchUpdate">确定更新</el-button>
      </span>
    </el-dialog>

    <!-- 批量修改数据对话框 -->
    <el-dialog
      title="批量修改数据"
      :visible.sync="batchModifyVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <p class="info-message">
          <i class="el-icon-info"></i>
          请上传包含修改数据的Excel文件（.xlsx格式），可修改字段：法人实体、部门、项目
        </p>
        <el-form :model="batchModifyForm" label-width="100px">
          <el-form-item label="上传文件" required>
            <el-upload
              ref="batchModifyFileUpload"
              :auto-upload="false"
              :on-change="handleBatchModifyFileChange"
              :on-remove="handleBatchModifyFileRemove"
              :limit="1"
              accept=".xlsx,.xls"
              :file-list="batchModifyFileList"
            >
              <el-button size="small" type="primary" icon="el-icon-upload">选择文件</el-button>
              <div slot="tip" class="el-upload__tip">只能上传xlsx/xls文件，且不超过10MB。文件需包含订单号和要修改的字段列</div>
            </el-upload>
          </el-form-item>
        </el-form>
        <div class="info-banner" style="margin-top: 20px">
          <div class="info-icon"></div>
          <div class="info-content">文件需包含订单号列，以及要修改的字段列（法人实体、部门、项目）。只会更新文件中指定的字段，未指定的字段不会被修改。</div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="batchModifyVisible = false">取消</el-button>
        <el-button type="primary" :loading="batchModifying" @click="confirmBatchModify">确定修改</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { 
  CHECK_STATUS_NAMES, 
  CHECK_STATUS_COLORS, 
  LEGAL_ENTITY_OPTIONS,
  DEPARTMENT_OPTIONS,
  PROJECT_OPTIONS,
  BILL_STATUS,
  BUSINESS_TYPE_NAMES,
  PAYMENT_ACCOUNT_OPTIONS,
  COST_CENTER_OPTIONS
} from "@/utils/constants";
import { formatAmount, formatDate } from "@/utils/format";
import { showSuccess, showWarning, handleApiError, showError } from "@/utils/errorHandler";
import { exportBillOrders } from "@/utils/excel";
import FieldConfigDialog from "./FieldConfigDialog.vue";

export default {
  name: "OrderListContent",
  components: {
    FieldConfigDialog
  },
  props: {
    billNo: {
      type: String,
      required: true
    },
    businessType: {
      type: String,
      required: true
    },
    billStatus: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      filterForm: {
        orderNo: "",
        checkStatus: null,
        travelerName: "",
        legalEntity: null,
        bookingDateRange: null,
        businessType: null,
        paymentAccount: null,
        costCenter: null,
        project: null
      },
      legalEntityOptions: LEGAL_ENTITY_OPTIONS,
      departmentOptions: DEPARTMENT_OPTIONS || [],
      projectOptions: PROJECT_OPTIONS || [],
      businessTypeOptions: BUSINESS_TYPE_NAMES,
      paymentAccountOptions: PAYMENT_ACCOUNT_OPTIONS,
      costCenterOptions: COST_CENTER_OPTIONS,
      fieldConfigVisible: false,
      exporting: false,
      
      // 选择相关
      selectedOrders: [],
      allSelected: false,
      
      // 批量更新
      batchUpdateVisible: false,
      batchUpdateForm: {
        legalEntity: null,
        department: null,
        project: null
      },
      
      // 批量修改数据（通过文件上传）
      batchModifyVisible: false,
      batchModifyForm: {},
      batchModifyFileList: [],
      batchModifying: false
    };
  },
  computed: {
    /**
     * 是否禁用操作（账单确认后禁用）
     */
    isOperationsDisabled() {
      // 账单状态 >= 2（待开票）时禁用操作
      return this.billStatus >= BILL_STATUS.PENDING_INVOICE;
    },
    ...mapState("order", ["orderList", "loading"]),
    ...mapState("config", ["fieldConfig"]),
    
    filteredOrders() {
      let orders = this.orderList.filter(
        order => order.businessType === this.businessType
      );
      
      // 应用筛选
      if (this.filterForm.orderNo) {
        orders = orders.filter(order =>
          order.orderNo.includes(this.filterForm.orderNo)
        );
      }
      
      if (this.filterForm.checkStatus !== null && this.filterForm.checkStatus !== undefined) {
        orders = orders.filter(
          order => order.checkStatus === this.filterForm.checkStatus
        );
      }
      
      if (this.filterForm.travelerName) {
        orders = orders.filter(order =>
          order.travelerName && order.travelerName.includes(this.filterForm.travelerName)
        );
      }
      
      if (this.filterForm.legalEntity) {
        orders = orders.filter(
          order => order.legalEntity === this.filterForm.legalEntity
        );
      }
      
      // 下单日期筛选
      if (this.filterForm.bookingDateRange && this.filterForm.bookingDateRange.length === 2) {
        const [startDate, endDate] = this.filterForm.bookingDateRange;
        orders = orders.filter(order => {
          if (!order.bookingTime) return false;
          const bookingDate = order.bookingTime.split(' ')[0]; // 提取日期部分
          return bookingDate >= startDate && bookingDate <= endDate;
        });
      }
      
      // 业务类型筛选
      if (this.filterForm.businessType) {
        orders = orders.filter(
          order => order.businessType === this.filterForm.businessType
        );
      }
      
      // 支付方式筛选
      if (this.filterForm.paymentAccount) {
        orders = orders.filter(
          order => order.paymentAccount === this.filterForm.paymentAccount
        );
      }
      
      // 费用归属筛选
      if (this.filterForm.costCenter) {
        orders = orders.filter(
          order => order.costCenter === this.filterForm.costCenter
        );
      }
      
      // 项目名称筛选
      if (this.filterForm.project) {
        orders = orders.filter(
          order => order.project === this.filterForm.project
        );
      }
      
      return orders;
    },
    
    totalAmount() {
      return this.filteredOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    },
    
    checkedCount() {
      return this.filteredOrders.filter(order => order.checkStatus === 1).length;
    },
    
    uncheckedCount() {
      return this.filteredOrders.filter(order => order.checkStatus === 0).length;
    },
    
    // 全部订单总数（包括未筛选的）
    totalOrderCount() {
      return this.orderList.filter(
        order => order.businessType === this.businessType
      ).length;
    }
  },
  methods: {
    ...mapActions("config", ["updateFieldConfig"]),
    ...mapActions("order", ["updateOrderCheckStatus", "batchUpdateOrders"]),
    
    formatAmount(amount) {
      return formatAmount(amount);
    },
    
    formatDate(date, format = 'YYYY-MM-DD HH:mm') {
      return formatDate(date, format);
    },
    
    getCheckStatusName(status) {
      return CHECK_STATUS_NAMES[status] || "-";
    },
    
    getCheckStatusType(status) {
      return CHECK_STATUS_COLORS[status] || "";
    },
    
    /**
     * 判断字段是否可见
     */
    isFieldVisible(fieldKey) {
      // 如果没有配置或配置为空，显示所有字段
      if (!this.fieldConfig || !this.fieldConfig.display || this.fieldConfig.display.length === 0) {
        return true;
      }
      // 根据配置判断是否显示
      return this.fieldConfig.display.includes(fieldKey);
    },
    
    /**
     * 表格选择变化
     */
    handleSelectionChange(selection) {
      this.selectedOrders = selection;
    },
    
    /**
     * 选中全部列表
     */
    handleSelectAll() {
      // 选中当前业务类型的所有订单
      const allOrders = this.orderList.filter(
        order => order.businessType === this.businessType
      );
      
      // 通过表格引用选中所有行
      this.$nextTick(() => {
        allOrders.forEach(row => {
          this.$refs.orderTable.toggleRowSelection(row, true);
        });
      });
      
      showSuccess(`已选中全部 ${allOrders.length} 笔订单`);
    },
    
    /**
     * 批量更新数据
     */
    handleBatchUpdate() {
      if (this.selectedOrders.length === 0) {
        showWarning("请先选择要更新的订单");
        return;
      }
      
      this.batchUpdateForm = {
        legalEntity: null,
        department: null,
        project: null
      };
      this.batchUpdateVisible = true;
    },
    
    /**
     * 确认批量更新
     */
    async confirmBatchUpdate() {
      const { legalEntity, department, project } = this.batchUpdateForm;
      
      // 检查至少选择一个字段
      if (!legalEntity && !department && !project) {
        showWarning("请至少选择一个字段进行更新");
        return;
      }
      
      try {
        const updateData = {};
        if (legalEntity) updateData.legalEntity = legalEntity;
        if (department) updateData.department = department;
        if (project) updateData.project = project;
        
        const orderNos = this.selectedOrders.map(o => o.orderNo);
        
        await this.batchUpdateOrders({
          orderNos,
          updateData
        });
        
        showSuccess(`成功更新 ${orderNos.length} 笔订单数据`);
        this.batchUpdateVisible = false;
        
        // 清空选择
        this.$refs.orderTable.clearSelection();
      } catch (error) {
        handleApiError(error, {
          customMessage: "批量更新失败"
        });
      }
    },
    
    /**
     * 批量修改数据（通过文件上传）
     */
    handleBatchModify() {
      this.batchModifyForm = {};
      this.batchModifyFileList = [];
      this.batchModifyVisible = true;
    },
    
    /**
     * 批量修改文件选择变化
     */
    handleBatchModifyFileChange(file, fileList) {
      // 检查文件大小（10MB）
      const isLt10M = file.raw.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        showWarning("上传文件大小不能超过 10MB!");
        this.batchModifyFileList = fileList.filter(item => item.uid !== file.uid);
        return;
      }
      
      // 检查文件类型
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        showWarning("只能上传 xlsx 或 xls 格式的文件!");
        this.batchModifyFileList = fileList.filter(item => item.uid !== file.uid);
        return;
      }
      
      this.batchModifyFileList = fileList;
    },
    
    /**
     * 批量修改文件移除
     */
    handleBatchModifyFileRemove(file, fileList) {
      this.batchModifyFileList = fileList;
    },
    
    /**
     * 确认批量修改
     */
    async confirmBatchModify() {
      // 检查是否上传了文件
      if (!this.batchModifyFileList || this.batchModifyFileList.length === 0) {
        showWarning("请上传Excel文件");
        return;
      }
      
      this.batchModifying = true;
      
      try {
        // TODO: 实现批量修改功能
        // 这里应该调用API上传文件并解析，然后批量更新订单数据
        const file = this.batchModifyFileList[0].raw;
        console.log("批量修改文件:", file);
        console.log("可修改字段: 法人实体、部门、项目");
        
        // 模拟处理
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showSuccess("批量修改数据成功");
        this.batchModifyVisible = false;
        this.batchModifyFileList = [];
        this.batchModifyForm = {};
        
        // 刷新订单列表（通过重新获取数据）
        await this.$store.dispatch("order/fetchOrderList", this.billNo);
      } catch (error) {
        handleApiError(error, {
          customMessage: "批量修改数据失败"
        });
      } finally {
        this.batchModifying = false;
      }
    },
    
    /**
     * 标记为已核对
     */
    async handleMarkAsChecked() {
      if (this.selectedOrders.length === 0) {
        showWarning("请先选择要标记的订单");
        return;
      }
      
      try {
        const orderNos = this.selectedOrders.map(o => o.orderNo);
        
        await this.updateOrderCheckStatus({
          orderNos,
          checkStatus: 1
        });
        
        showSuccess(`成功标记 ${orderNos.length} 笔订单为已核对`);
        
        // 清空选择
        this.$refs.orderTable.clearSelection();
      } catch (error) {
        handleApiError(error, {
          customMessage: "标记已核对失败"
        });
      }
    },
    
    /**
     * 取消已核对标记
     */
    async handleUnmarkChecked() {
      if (this.selectedOrders.length === 0) {
        showWarning("请先选择要取消标记的订单");
        return;
      }
      
      try {
        const orderNos = this.selectedOrders.map(o => o.orderNo);
        
        await this.updateOrderCheckStatus({
          orderNos,
          checkStatus: 0
        });
        
        showSuccess(`成功取消 ${orderNos.length} 笔订单的已核对标记`);
        
        // 清空选择
        this.$refs.orderTable.clearSelection();
      } catch (error) {
        handleApiError(error, {
          customMessage: "取消已核对标记失败"
        });
      }
    },
    
    handleSearch() {
      // 筛选已在computed中处理
    },
    
    handleReset() {
      this.filterForm = {
        orderNo: "",
        checkStatus: null,
        travelerName: "",
        legalEntity: null,
        bookingDateRange: null,
        businessType: null,
        paymentAccount: null,
        costCenter: null,
        project: null
      };
    },
    
    handleFieldConfig() {
      this.fieldConfigVisible = true;
    },
    
    async handleSaveFieldConfig(config) {
      try {
        await this.updateFieldConfig(config);
        showSuccess("字段配置已保存");
      } catch (error) {
        handleApiError(error, {
          customMessage: "保存字段配置失败"
        });
        throw error;
      }
    },
    
    async handleExportExcel() {
      // 检查是否配置了导出字段
      if (!this.fieldConfig.excelExport || this.fieldConfig.excelExport.length === 0) {
        showWarning("请先配置Excel导出字段");
        return;
      }
      
      // 检查是否有数据
      if (this.filteredOrders.length === 0) {
        showWarning("当前没有可导出的订单数据");
        return;
      }
      
      this.exporting = true;
      
      try {
        const result = exportBillOrders({
          orders: this.filteredOrders,
          fields: this.fieldConfig.excelExport,
          businessType: this.businessType,
          billNo: this.billNo
        });
        
        showSuccess(`Excel导出成功！\n文件名：${result.fileName}\n导出数据：${result.rowCount}行`);
      } catch (error) {
        if (error.message.includes("xlsx库")) {
          // xlsx库未安装的错误
          this.$alert(error.message, "提示", {
            confirmButtonText: "知道了",
            type: "warning"
          });
        } else {
          handleApiError(error, {
            customMessage: "Excel导出失败"
          });
        }
      } finally {
        this.exporting = false;
      }
    },
    
    async handleExportPDF() {
      // 检查是否配置了导出字段
      if (!this.fieldConfig.pdfExport || this.fieldConfig.pdfExport.length === 0) {
        showWarning("请先配置PDF导出字段");
        return;
      }
      
      // 检查PDF字段数量
      if (this.fieldConfig.pdfExport.length > 20) {
        this.$message.error("PDF导出字段不能超过20个，请在字段配置中调整");
        return;
      }
      
      // 检查是否有数据
      if (this.filteredOrders.length === 0) {
        showWarning("当前没有可导出的订单数据");
        return;
      }
      
      this.exporting = true;
      
      try {
        // 调用Mock API导出PDF
        const mockApi = require("@/mock/index").default;
        const response = await mockApi.exportBillToPDF({
          billNo: this.billNo,
          businessType: this.businessType,
          fields: this.fieldConfig.pdfExport,
          orderIds: this.filteredOrders.map(o => o.orderId)
        });
        
        // 模拟下载PDF
        if (response.data && response.data.pdfUrl) {
          // 在真实环境中，这里会下载实际的PDF文件
          // 现在只是显示成功消息
          showSuccess(`PDF导出请求已提交！\n文件将在生成后自动下载\n导出数据：${this.filteredOrders.length}行`);
          
          // 在demo环境中，我们只是提示用户
          this.$message.info({
            message: "Demo环境：PDF生成功能需要后端服务支持。在实际环境中，PDF将自动下载到本地。",
            duration: 5000
          });
        }
      } catch (error) {
        handleApiError(error, {
          customMessage: "PDF导出失败"
        });
      } finally {
        this.exporting = false;
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.order-list-content {
  .filter-section {
    background: @bg-light;
    padding: @spacing-md;
    border-radius: @border-radius-base;
    margin-bottom: @spacing-md;

    /deep/ .el-form-item {
      margin-bottom: 0;
    }
  }

  .toolbar-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: @spacing-md;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: @spacing-md;
      
      .selection-info {
        color: @text-secondary;
        font-size: @font-size-sm;
      }
    }

    .toolbar-actions {
      display: flex;
      gap: @spacing-sm;
      
      // 禁用按钮样式优化
      /deep/ .el-button.is-disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  // 表格样式优化 - 移除边框
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
  }

  .summary-footer {
    background: @bg-light;
    padding: @spacing-md;
    border-radius: @border-radius-base;
    margin-top: @spacing-md;

    .summary-item {
      text-align: center;

      .label {
        font-size: @font-size-sm;
        color: @text-secondary;
        margin-right: @spacing-xs;
      }

      .value {
        font-size: @font-size-lg;
        font-weight: 600;
        color: @text-primary;

        &.primary {
          color: @primary-color;
        }

        &.success {
          color: @success-color;
        }

        &.warning {
          color: @warning-color;
        }
      }
    }
  }

  // 批量修改对话框样式
  .dialog-content {
    .info-message {
      display: flex;
      align-items: center;
      gap: @spacing-sm;
      padding: @spacing-md;
      background: @bg-light;
      border: 1px solid @border-base;
      border-radius: @border-radius-base;
      color: @primary-color;
      font-size: @font-size-base;
      margin-bottom: @spacing-lg;

      i {
        font-size: @font-size-xl;
      }
    }

    .el-upload__tip {
      color: @text-placeholder;
      font-size: @font-size-sm;
      margin-top: @spacing-xs;
    }
  }
}
</style>

