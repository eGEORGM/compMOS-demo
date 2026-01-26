<template>
  <div class="bill-status-filter">
    <el-radio-group v-model="selectedStatus" size="medium" @change="handleChange">
      <el-radio-button :label="null">全部</el-radio-button>
      <el-radio-button v-for="status in statusOptions" :key="status.value" :label="status.value">
        {{ status.label }}
      </el-radio-button>
    </el-radio-group>
  </div>
</template>

<script>
import { BILL_STATUS, BILL_STATUS_NAMES } from "@/utils/constants";

export default {
  name: "BillStatusFilter",
  props: {
    value: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      selectedStatus: this.value,
      statusOptions: [
        { value: BILL_STATUS.PENDING, label: BILL_STATUS_NAMES[BILL_STATUS.PENDING] },
        { value: BILL_STATUS.CONFIRMED, label: BILL_STATUS_NAMES[BILL_STATUS.CONFIRMED] },
        { value: BILL_STATUS.INVOICING, label: BILL_STATUS_NAMES[BILL_STATUS.INVOICING] },
        { value: BILL_STATUS.SETTLED, label: BILL_STATUS_NAMES[BILL_STATUS.SETTLED] }
      ]
    };
  },
  watch: {
    value(newVal) {
      this.selectedStatus = newVal;
    }
  },
  methods: {
    handleChange(value) {
      this.$emit("input", value);
      this.$emit("change", value);
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.bill-status-filter {
  margin-bottom: @spacing-lg;

  /deep/ .el-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: @spacing-sm;

    .el-radio-button {
      .el-radio-button__inner {
        border-radius: @radius-md;
        padding: 8px 20px;
        transition: @transition-fast;

        &:hover {
          color: @primary-color;
          border-color: @primary-color;
        }
      }

      &.is-active .el-radio-button__inner {
        background-color: @primary-color;
        border-color: @primary-color;
        box-shadow: -1px 0 0 0 @primary-color;
      }
    }
  }
}
</style>

