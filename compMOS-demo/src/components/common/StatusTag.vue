<template>
  <span :class="['custom-tag', `custom-tag--${size}`, customTagClass]">
    {{ statusText }}
  </span>
</template>

<script>
import {
  BILL_STATUS_NAMES,
  BILL_STATUS_COLORS,
  INVOICE_TYPE_SHORT_NAMES,
  INVOICE_TYPE_COLORS,
  BUSINESS_TYPE_NAMES,
  BUSINESS_TYPE_COLORS,
  INVOICE_RECORD_STATUS_NAMES,
  INVOICE_RECORD_STATUS_COLORS
} from "@/utils/constants";

export default {
  name: "StatusTag",
  props: {
    // 状态类型：bill-账单状态, invoice-发票类型, business-业务类型, invoice-status-开票记录状态
    type: {
      type: String,
      required: true,
      validator: (value) => ["bill", "invoice", "business", "invoice-status"].includes(value)
    },
    // 状态值
    status: {
      type: [String, Number],
      required: true
    },
    // 标签大小
    size: {
      type: String,
      default: "medium",
      validator: (value) => ["medium", "small", "mini"].includes(value)
    }
  },
  computed: {
    statusText() {
      switch (this.type) {
        case "bill":
          return BILL_STATUS_NAMES[this.status] || "未知状态";
        case "invoice":
          return INVOICE_TYPE_SHORT_NAMES[this.status] || "未知类型";
        case "business":
          return BUSINESS_TYPE_NAMES[this.status] || "未知类型";
        case "invoice-status":
          return INVOICE_RECORD_STATUS_NAMES[this.status] || "未知状态";
        default:
          return "";
      }
    },
    customTagClass() {
      switch (this.type) {
        case "bill":
          return this.getBillStatusClass(this.status);
        case "invoice":
          return this.getInvoiceTypeClass(this.status);
        case "business":
          return this.getBusinessTypeClass(this.status);
        case "invoice-status":
          return this.getInvoiceStatusClass(this.status);
        default:
          return "";
      }
    }
  },
  methods: {
    // 获取账单状态样式类
    getBillStatusClass(status) {
      const colorClass = BILL_STATUS_COLORS[status];
      return `custom-tag--${colorClass}`;
    },
    // 获取发票类型样式类
    getInvoiceTypeClass(status) {
      const color = INVOICE_TYPE_COLORS[status];
      const colorMap = {
        "#67c23a": "success",
        "#2555FF": "primary",
        "#9b59b6": "purple",
        "#e6a23c": "warning"
      };
      return `custom-tag--${colorMap[color] || "info"}`;
    },
    // 获取业务类型样式类
    getBusinessTypeClass(status) {
      const color = BUSINESS_TYPE_COLORS[status];
      const colorMap = {
        "#67c23a": "success",
        "#2555FF": "primary",
        "#e6a23c": "warning",
        "#909399": "info"
      };
      return `custom-tag--${colorMap[color] || "info"}`;
    },
    // 获取开票记录状态样式类
    getInvoiceStatusClass(status) {
      const colorClass = INVOICE_RECORD_STATUS_COLORS[status];
      return `custom-tag--${colorClass}`;
    }
  }
};
</script>

<style lang="less" scoped>
.custom-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  line-height: 20px;
  white-space: nowrap;

  // 尺寸
  &--medium {
    font-size: 14px;
    padding: 2px 8px;
  }

  &--small {
    font-size: 12px;
    padding: 1px 6px;
    line-height: 18px;
  }

  &--mini {
    font-size: 12px;
    padding: 0px 4px;
    line-height: 16px;
  }

  // 账单状态样式 - 根据Figma设计
  &--warning {
    // 待处理/待确认 - 橙色
    background-color: #FFE4BA;
    color: #D25F00;
  }

  &--primary {
    // 审批中/开票中 - 蓝色
    background-color: #C3E7FE;
    color: #206CCF;
  }

  &--default {
    // 未开始/待开票 - 灰色
    background-color: rgba(29, 33, 41, 0.1);
    color: #6B7785;
  }

  &--info {
    // 灰色状态 - 待付款等
    background-color: rgba(29, 33, 41, 0.1);
    color: #6B7785;
  }

  &--success {
    // 已完成/已结清 - 绿色
    background-color: #AFF0B5;
    color: #009A29;
  }

  &--danger {
    // 危险状态/调账中 - 红色
    background-color: #FFCCC7;
    color: #CF1322;
  }

  &--purple {
    // 紫色 - 特殊发票类型
    background-color: #E8D8F5;
    color: #9b59b6;
  }
}
</style>
