<template>
  <div class="bill-list-page">
    <!-- 公司信息区域 -->
    <div class="company-info-card">
      <div class="company-name">{{ companyInfo.name }}</div>
      <div class="company-detail">{{ companyInfo.fullName }} | 企业ID: {{ companyInfo.id }}</div>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" size="medium">
        <!-- 日期范围筛选 -->
        <el-form-item label="结算周期">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            @change="handleDateRangeChange"
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
            <el-option label="全部" :value="null"></el-option>
            <el-option
              v-for="(name, value) in billStatusNames"
              :key="value"
              :label="name"
              :value="parseInt(value)"
            ></el-option>
          </el-select>
        </el-form-item>

        <!-- 订单号搜索 -->
        <el-form-item label="订单号">
          <el-input
            v-model="filterForm.orderNo"
            placeholder="输入订单号跳转详情"
            clearable
            @keyup.enter.native="handleOrderNoSearch"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="handleOrderNoSearch"
            ></el-button>
          </el-input>
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
      <el-table
        v-loading="loading"
        :data="billList"
        stripe
        border
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column
          prop="settlementCycle"
          label="结算周期"
          width="150"
          :formatter="formatCycle"
        ></el-table-column>

        <el-table-column prop="billStatus" label="状态" width="120">
          <template slot-scope="{ row }">
            <el-tag
              :type="getBillStatusType(row.billStatus)"
              size="medium"
            >
              {{ getBillStatusName(row.billStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="totalAmount"
          label="账单总计"
          width="150"
          align="right"
          :formatter="formatAmount"
        ></el-table-column>

        <el-table-column
          prop="pendingInvoiceAmount"
          label="待开票金额"
          width="150"
          align="right"
          :formatter="formatAmount"
        ></el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="180">
          <template slot-scope="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template slot-scope="{ row }">
            <el-button
              type="text"
              size="small"
              @click.stop="handleViewDetail(row)"
            >
              查看详情
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
        orderNo: ""
      },
      // 公司信息
      companyInfo: {
        id: "C001",
        name: "示例科技有限公司",
        fullName: "北京示例科技有限公司"
      },
      // 日期选择器配置
      pickerOptions: {
        disabledDate: (time) => {
          // 禁用未来日期
          if (time.getTime() > Date.now()) {
            return true;
          }
          // 如果已选择开始日期，限制结束日期不超过180天
          if (this.filterForm.dateRange && this.filterForm.dateRange[0]) {
            const startTime = new Date(this.filterForm.dateRange[0]).getTime();
            const diffDays = Math.abs((time.getTime() - startTime) / (1000 * 60 * 60 * 24));
            return diffDays > 180;
          }
          return false;
        },
        shortcuts: [
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setMonth(start.getMonth() - 1);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setMonth(start.getMonth() - 3);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近六个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setMonth(start.getMonth() - 6);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
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
     * 初始化默认日期范围（最近一个月）
     */
    initDefaultDateRange() {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      this.filterForm.dateRange = [
        this.formatDateString(start),
        this.formatDateString(end)
      ];
    },

    /**
     * 格式化日期为字符串
     */
    formatDateString(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    /**
     * 加载账单列表
     */
    async loadBillList() {
      const params = {
        page: this.pagination.page,
        pageSize: this.pagination.pageSize
      };

      // 日期范围
      if (this.filterForm.dateRange && this.filterForm.dateRange.length === 2) {
        params.startDate = this.filterForm.dateRange[0];
        params.endDate = this.filterForm.dateRange[1];
      }

      // 状态
      if (this.filterForm.status !== null && this.filterForm.status !== undefined) {
        params.status = this.filterForm.status;
      }

      await this.fetchBillList(params);
    },

    /**
     * 日期范围变化处理
     */
    handleDateRangeChange(value) {
      if (value && value.length === 2) {
        const start = new Date(value[0]);
        const end = new Date(value[1]);
        const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));

        if (diffDays > 180) {
          showWarning("日期范围不能超过180天");
          this.filterForm.dateRange = null;
          return;
        }
      }
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
      this.filterForm.orderNo = "";
      this.initDefaultDateRange();
      this.handleSearch();
    },

    /**
     * 订单号搜索
     */
    handleOrderNoSearch() {
      const orderNo = this.filterForm.orderNo.trim();
      if (!orderNo) {
        showWarning("请输入订单号");
        return;
      }

      // 查找包含该订单的账单
      // 这里简化处理，实际应调用API搜索
      showWarning("订单号搜索功能将在账单详情页实现");

      // 如果找到账单，跳转到详情页并传递订单号
      // this.$router.push({ name: 'BillDetail', params: { billNo: 'xxx' }, query: { orderNo } });
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
     * 格式化金额
     */
    formatAmount(row, column) {
      const value = row[column.property];
      return formatAmount(value);
    },

    /**
     * 格式化日期
     */
    formatDate(date) {
      return formatDate(date, "YYYY-MM-DD HH:mm");
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

  .company-info-card {
    background: @bg-white;
    padding: @spacing-lg @spacing-xl;
    border-radius: @border-radius-base;
    margin-bottom: @spacing-md;
    box-shadow: @shadow-base;

    .company-name {
      font-size: @font-size-xl;
      font-weight: 600;
      color: @text-primary;
      margin-bottom: @spacing-xs;
    }

    .company-detail {
      font-size: @font-size-base;
      color: @text-secondary;
    }
  }

  .filter-card {
    margin-bottom: @spacing-md;

    /deep/ .el-card__body {
      padding: @spacing-lg;
    }

    /deep/ .el-form-item {
      margin-bottom: 0;
    }

    /deep/ .el-date-editor {
      width: 350px;
    }

    /deep/ .el-select {
      width: 200px;
    }

    /deep/ .el-input-group {
      width: 300px;
    }
  }

  .table-card {
    /deep/ .el-card__body {
      padding: @spacing-lg;
    }

    /deep/ .el-table {
      .el-table__row {
        cursor: pointer;

        &:hover {
          background-color: @bg-light;
        }
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
