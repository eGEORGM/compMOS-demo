<template>
  <div class="order-check-summary">
    <el-alert :title="summaryText" :type="alertType" :closable="false" show-icon>
      <template slot>
        <div class="summary-detail">
          <span>已核对：<strong>{{ checkedCount }}</strong> 笔</span>
          <span class="divider">|</span>
          <span>未核对：<strong>{{ uncheckedCount }}</strong> 笔</span>
          <span class="divider">|</span>
          <span>总计：<strong>{{ totalCount }}</strong> 笔</span>
        </div>
      </template>
    </el-alert>

    <div v-if="showProgress" class="check-progress">
      <el-progress :percentage="progressPercent" :status="progressStatus" :stroke-width="12"></el-progress>
    </div>
  </div>
</template>

<script>
export default {
  name: "OrderCheckSummary",
  props: {
    checkedCount: {
      type: Number,
      required: true
    },
    totalCount: {
      type: Number,
      required: true
    },
    showProgress: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    uncheckedCount() {
      return this.totalCount - this.checkedCount;
    },
    progressPercent() {
      if (this.totalCount === 0) return 0;
      return Math.round((this.checkedCount / this.totalCount) * 100);
    },
    progressStatus() {
      if (this.progressPercent === 100) return "success";
      if (this.progressPercent >= 50) return "";
      return "exception";
    },
    alertType() {
      if (this.progressPercent === 100) return "success";
      if (this.progressPercent > 0) return "warning";
      return "info";
    },
    summaryText() {
      if (this.progressPercent === 100) {
        return "✅ 所有订单已核对完成，可以进行账单确认";
      }
      if (this.progressPercent > 0) {
        return `⚠️ 核对进度 ${this.progressPercent}%，请继续核对剩余订单`;
      }
      return "ℹ️ 请开始核对订单明细";
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.order-check-summary {
  margin-bottom: @spacing-lg;

  /deep/ .el-alert {
    padding: @spacing-md @spacing-lg;

    .el-alert__title {
      font-size: @font-size-base;
      font-weight: 600;
      margin-bottom: @spacing-sm;
    }

    .summary-detail {
      display: flex;
      align-items: center;
      gap: @spacing-md;
      font-size: @font-size-sm;
      color: @text-regular;

      strong {
        font-size: @font-size-md;
        font-weight: 600;
        color: @text-primary;
      }

      .divider {
        color: @border-base;
      }
    }
  }

  .check-progress {
    margin-top: @spacing-md;
  }
}
</style>

