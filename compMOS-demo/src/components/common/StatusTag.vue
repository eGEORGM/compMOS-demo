<template>
  <el-tag :type="tagType" :size="size" :effect="effect">
    {{ statusText }}
  </el-tag>
</template>

<script>
import {
  BILL_STATUS_NAMES,
  BILL_STATUS_COLORS,
  INVOICE_TYPE_SHORT_NAMES,
  INVOICE_TYPE_COLORS,
  BUSINESS_TYPE_NAMES,
  BUSINESS_TYPE_COLORS
} from "@/utils/constants";

export default {
  name: "StatusTag",
  props: {
    // 状态类型：bill-账单状态, invoice-发票类型, business-业务类型
    type: {
      type: String,
      required: true,
      validator: (value) => ["bill", "invoice", "business"].includes(value)
    },
    // 状态值
    status: {
      type: [String, Number],
      required: true
    },
    // 标签大小
    size: {
      type: String,
      default: "small",
      validator: (value) => ["medium", "small", "mini"].includes(value)
    },
    // 标签效果
    effect: {
      type: String,
      default: "light",
      validator: (value) => ["dark", "light", "plain"].includes(value)
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
        default:
          return "";
      }
    },
    tagType() {
      switch (this.type) {
        case "bill":
          return BILL_STATUS_COLORS[this.status] || "info";
        case "invoice":
          return this.getColorType(INVOICE_TYPE_COLORS[this.status]);
        case "business":
          return this.getColorType(BUSINESS_TYPE_COLORS[this.status]);
        default:
          return "info";
      }
    }
  },
  methods: {
    // 将颜色值转换为Element UI标签类型
    getColorType(color) {
      if (!color) return "info";
      // Element UI标签类型映射
      const colorMap = {
        "#2555FF": "primary",
        "#409eff": "primary",
        "#67c23a": "success",
        "#e6a23c": "warning",
        "#f56c6c": "danger",
        "#909399": "info",
        "#9b59b6": "" // 紫色使用默认样式
      };
      return colorMap[color] || "info";
    }
  }
};
</script>

