<template>
  <div class="bill-list-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">账单列表</h1>
      <div class="company-info">
        <span class="company-name">{{ companyInfo.name }}</span>
        <span class="company-divider">|</span>
        <span class="company-id">企业ID: {{ companyInfo.id }}</span>
      </div>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" size="small" label-width="80px">
        <!-- 日期范围筛选 -->
        <el-form-item label="结算周期">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            format="yyyy-MM"
            value-format="yyyy-MM"
            @change="handleSearch"
          ></el-date-picker>
        </el-form-item>

        <!-- 状态筛选 -->
        <el-form-item label="账单状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="(name, value) in billStatusNames"
              :key="value"
              :label="name"
              :value="parseInt(value)"
            ></el-option>
          </el-select>
        </el-form-item>

        <!-- 账单号搜索 -->
        <el-form-item label="账单号">
          <el-input
            v-model="filterForm.billNo"
            placeholder="请输入账单号"
            clearable
            @keyup.enter.native="handleSearch"
          ></el-input>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">
            查询
          </el-button>
          <el-button icon="el-icon-refresh-left" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="never">
      <!-- 表格头部信息 -->
      <div class="table-header">
        <div class="result-info">
          共 <span class="highlight">{{ pagination.total }}</span> 条账单
        </div>
      </div>
      
      <el-table
        v-loading="loading"
        :data="billList"
        border
        style="width: 100%"
        @row-click="handleRowClick"
        class="bill-table"
        v-if="!loading && billList.length > 0"
      >
        <el-table-column
          prop="billNo"
          label="账单号"
          width="180"
          fixed="left"
        ></el-table-column>
        
        <el-table-column
          prop="settlementCycle"
          label="结算周期"
          :formatter="formatCycle"
        ></el-table-column>

        <el-table-column prop="billStatus" label="账单状态" width="120" align="center">
          <template slot-scope="{ row }">
            <el-tag
              :type="getBillStatusType(row.billStatus)"
              size="small"
            >
              {{ getBillStatusName(row.billStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="totalAmount"
          label="账单总额"
          width="140"
          align="right"
        >
          <template slot-scope="{ row }">
            <span class="amount-text">{{ formatAmountValue(row.totalAmount) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="invoicedAmount"
          label="已开票金额"
          width="140"
          align="right"
        >
          <template slot-scope="{ row }">
            <span class="amount-text">{{ formatAmountValue(row.invoicedAmount || 0) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="pendingInvoiceAmount"
          label="待开票金额"
          width="140"
          align="right"
        >
          <template slot-scope="{ row }">
            <span class="amount-text">{{ formatAmountValue(row.pendingInvoiceAmount || row.totalAmount) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="150">
          <template slot-scope="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template slot-scope="{ row }">
            <el-button
              type="text"
              size="small"
              @click.stop="handleViewDetail(row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <div v-if="!loading && billList.length === 0" class="empty-state">
        <i class="el-icon-document"></i>
        <p>暂无账单数据</p>
        <p class="empty-hint">
          {{ filterForm.dateRange || filterForm.status !== null ? '请尝试调整筛选条件' : '还没有生成账单包' }}
        </p>
      </div>

      <!-- 分页 -->
      <div v-if="!loading && billList.length > 0" class="pagination-wrapper">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { BILL_STATUS, BILL_STATUS_NAMES, BILL_STATUS_COLORS } from "@/utils/constants";
import { formatAmount, formatDate, formatBillCycle } from "@/utils/format";
import { showWarning } from "@/utils/errorHandler";

export default {
  name: "BillList",
  data() {
    return {
      // 筛选表单
      filterForm: {
        dateRange: null,
        status: null,
        billNo: ""
      },
      // 公司信息
      companyInfo: {
        id: "C001",
        name: "示例科技有限公司",
        fullName: "北京示例科技有限公司"
      }
    };
  },
  computed: {
    ...mapState("bill", ["billList", "loading", "pagination"]),
    billStatusNames() {
      return BILL_STATUS_NAMES;
    }
  },
  created() {
    this.initDefaultDateRange();
    this.loadBillList();
  },
  methods: {
    ...mapActions("bill", ["fetchBillList"]),

    /**
     * 初始化默认日期范围（最近三个月）
     */
    initDefaultDateRange() {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      this.filterForm.dateRange = [
        this.formatMonthString(start),
        this.formatMonthString(end)
      ];
    },

    /**
     * 格式化月份为字符串
     */
    formatMonthString(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    },

    /**
     * 加载账单列表
     */
    async loadBillList() {
      const params = {
        page: this.pagination.page,
        pageSize: this.pagination.pageSize
      };

      // 日期范围（月份）
      if (this.filterForm.dateRange && this.filterForm.dateRange.length === 2) {
        params.startCycle = this.filterForm.dateRange[0];
        params.endCycle = this.filterForm.dateRange[1];
      }

      // 状态
      if (this.filterForm.status !== null && this.filterForm.status !== undefined) {
        params.status = this.filterForm.status;
      }

      // 账单号
      if (this.filterForm.billNo && this.filterForm.billNo.trim()) {
        params.billNo = this.filterForm.billNo.trim();
      }

      await this.fetchBillList(params);
    },

    /**
     * 查询按钮点击
     */
    handleSearch() {
      this.$store.commit("bill/SET_PAGINATION", { page: 1 });
      this.loadBillList();
    },

    /**
     * 重置按钮点击
     */
    handleReset() {
      this.filterForm.status = null;
      this.filterForm.billNo = "";
      this.initDefaultDateRange();
      this.handleSearch();
    },

    /**
     * 行点击
     */
    handleRowClick(row) {
      this.handleViewDetail(row);
    },

    /**
     * 查看详情
     */
    handleViewDetail(row) {
      this.$router.push({
        name: "BillDetail",
        params: { billNo: row.billNo }
      });
    },

    /**
     * 分页大小变化
     */
    handleSizeChange(pageSize) {
      this.$store.commit("bill/SET_PAGINATION", { pageSize, page: 1 });
      this.loadBillList();
    },

    /**
     * 当前页变化
     */
    handleCurrentChange(page) {
      this.$store.commit("bill/SET_PAGINATION", { page });
      this.loadBillList();
    },

    /**
     * 格式化账单周期
     */
    formatCycle(row) {
      return formatBillCycle(row.settlementCycle, row);
    },

    /**
     * 格式化金额值
     */
    formatAmountValue(value) {
      return formatAmount(value);
    },

    /**
     * 格式化日期
     */
    formatDate(date) {
      return formatDate(date, "YYYY-MM-DD");
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

.bill-list-page {
  padding: @spacing-lg;
  background: @bg-light;
  min-height: 100vh;

  .page-header {
    background: @bg-white;
    padding: @spacing-lg @spacing-xl;
    border-radius: @border-radius-base;
    margin-bottom: @spacing-md;
    box-shadow: @shadow-light;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: @text-primary;
      margin: 0;
    }

    .company-info {
      display: flex;
      align-items: center;
      gap: @spacing-sm;
      font-size: @font-size-base;

      .company-name {
        color: @text-primary;
        font-weight: 500;
      }

      .company-divider {
        color: @text-placeholder;
      }

      .company-id {
        color: @text-secondary;
      }
    }
  }

  .filter-card {
    margin-bottom: @spacing-md;

    /deep/ .el-card__body {
      padding: @spacing-md @spacing-lg;
    }

    /deep/ .el-form {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
    }

    /deep/ .el-form-item {
      margin-bottom: @spacing-sm;
      margin-right: @spacing-lg + 16px;
      margin-left: 0;
    }

    /deep/ .el-date-editor {
      width: 300px;

      // 确保范围选择器中间的「至」能完整显示
      &.el-range-editor {
        .el-range-separator {
          flex-shrink: 0;
          min-width: 32px;
          padding: 0 6px;
          text-align: center;
        }
      }
    }

    /deep/ .el-select {
      width: 150px;
    }

    /deep/ .el-input {
      width: 200px;
    }
  }

  .table-card {
    /deep/ .el-card__body {
      padding: @spacing-lg;
    }

    .table-header {
      margin-bottom: @spacing-md;
      
      .result-info {
        font-size: @font-size-base;
        color: @text-secondary;
        
        .highlight {
          color: @primary-color;
          font-weight: 600;
          font-size: @font-size-lg;
        }
      }
    }

    .bill-table {
      /deep/ .el-table__row {
        cursor: pointer;

        &:hover {
          background-color: #f5f7fa;
        }
      }
      
      .amount-text {
        font-weight: 500;
        color: @text-primary;
      }

      // 表格内操作按钮样式
      /deep/ .el-button--text {
        font-size: 14px;
        font-weight: normal;
      }
    }

    .empty-state {
      text-align: center;
      padding: @spacing-xxl 0;

      i {
        font-size: 64px;
        color: @text-placeholder;
        margin-bottom: @spacing-lg;
      }

      p {
        font-size: @font-size-lg;
        color: @text-secondary;
        margin: @spacing-sm 0;

        &.empty-hint {
          font-size: @font-size-base;
          color: @text-placeholder;
        }
      }
    }

    .pagination-wrapper {
      margin-top: @spacing-lg;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
