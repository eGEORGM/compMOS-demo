<template>
  <el-card class="bill-card" :body-style="{ padding: '20px' }" shadow="hover" @click.native="handleClick">
    <div class="bill-card-header">
      <div class="bill-info">
        <h3 class="bill-no">{{ bill.billNo }}</h3>
        <span class="bill-cycle">{{ formatBillCycle(bill.billCycle, bill) }}</span>
      </div>
      <StatusTag type="bill" :status="bill.billStatus" />
    </div>

    <div class="bill-stats">
      <div class="stat-item">
        <span class="stat-label">总金额</span>
        <span class="stat-value amount">{{ formatAmount(bill.totalAmount) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">订单数</span>
        <span class="stat-value">{{ bill.totalOrderCount }}笔</span>
      </div>
    </div>

    <div class="bill-breakdown">
      <div v-if="bill.hotelCount > 0" class="breakdown-item">
        <i class="el-icon-s-home"></i>
        <span>酒店 {{ bill.hotelCount }}笔</span>
        <span class="breakdown-amount">{{ formatAmount(bill.hotelAmount) }}</span>
      </div>
      <div v-if="bill.flightCount > 0" class="breakdown-item">
        <i class="el-icon-s-promotion"></i>
        <span>机票 {{ bill.flightCount }}笔</span>
        <span class="breakdown-amount">{{ formatAmount(bill.flightAmount) }}</span>
      </div>
      <div v-if="bill.trainCount > 0" class="breakdown-item">
        <i class="el-icon-s-platform"></i>
        <span>火车票 {{ bill.trainCount }}笔</span>
        <span class="breakdown-amount">{{ formatAmount(bill.trainAmount) }}</span>
      </div>
    </div>

    <div class="bill-footer">
      <span class="bill-time">生成时间：{{ formatDateTime(bill.createTime) }}</span>
    </div>
  </el-card>
</template>

<script>
import StatusTag from "@/components/common/StatusTag.vue";
import { formatAmount, formatDateTime, formatBillCycle } from "@/utils/format";

export default {
  name: "BillCard",
  components: {
    StatusTag
  },
  props: {
    bill: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatAmount,
    formatDateTime,
    formatBillCycle,
    handleClick() {
      this.$emit("click", this.bill);
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.bill-card {
  cursor: pointer;
  transition: @transition-base;
  margin-bottom: @spacing-md;

  &:hover {
    transform: translateY(-2px);
    box-shadow: @shadow-hover;
  }

  .bill-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: @spacing-md;
    padding-bottom: @spacing-md;
    border-bottom: 1px solid @border-light;

    .bill-info {
      flex: 1;

      .bill-no {
        font-size: @font-size-lg;
        font-weight: 600;
        color: @text-primary;
        margin: 0 0 @spacing-xs 0;
      }

      .bill-cycle {
        font-size: @font-size-sm;
        color: @text-secondary;
      }
    }
  }

  .bill-stats {
    display: flex;
    gap: @spacing-lg;
    margin-bottom: @spacing-md;

    .stat-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: @spacing-xs;

      .stat-label {
        font-size: @font-size-xs;
        color: @text-secondary;
      }

      .stat-value {
        font-size: @font-size-lg;
        font-weight: 600;
        color: @text-primary;

        &.amount {
          color: @danger-color;
        }
      }
    }
  }

  .bill-breakdown {
    display: flex;
    flex-direction: column;
    gap: @spacing-sm;
    margin-bottom: @spacing-md;

    .breakdown-item {
      display: flex;
      align-items: center;
      gap: @spacing-sm;
      font-size: @font-size-sm;
      color: @text-regular;

      i {
        color: @primary-color;
      }

      .breakdown-amount {
        margin-left: auto;
        font-weight: 500;
        color: @text-primary;
      }
    }
  }

  .bill-footer {
    padding-top: @spacing-sm;
    border-top: 1px solid @border-lighter;

    .bill-time {
      font-size: @font-size-xs;
      color: @text-placeholder;
    }
  }
}
</style>

