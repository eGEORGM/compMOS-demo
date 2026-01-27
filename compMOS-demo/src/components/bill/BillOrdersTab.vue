<template>
  <div class="bill-orders-tab">
    <!-- 业务线子Tab -->
    <el-tabs v-model="activeBusinessType" type="card">
      <!-- 各业务线Tab（机票、酒店、火车票、用车） -->
      <el-tab-pane
        v-for="type in availableBusinessTypes"
        :key="type"
        :label="getBusinessTypeName(type)"
        :name="type"
      >
        <order-list-content 
          :bill-no="billNo" 
          :business-type="type"
          :bill-status="billStatus"
        ></order-list-content>
      </el-tab-pane>

      <!-- 无数据时的提示 -->
      <div v-if="availableBusinessTypes.length === 0" class="empty-state">
        <i class="el-icon-document"></i>
        <p>暂无订单数据</p>
      </div>
    </el-tabs>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { BUSINESS_TYPE_NAMES } from "@/utils/constants";
import OrderListContent from "./OrderListContent.vue";

export default {
  name: "BillOrdersTab",
  components: {
    OrderListContent
  },
  props: {
    billNo: {
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
      activeBusinessType: ""
    };
  },
  computed: {
    ...mapState("order", ["orderList"]),
    
    /**
     * 可用的业务线类型（仅显示有数据的）
     */
    availableBusinessTypes() {
      if (!this.orderList || this.orderList.length === 0) return [];
      const types = new Set();
      this.orderList.forEach(order => {
        if (order.businessType) {
          types.add(order.businessType);
        }
      });
      return Array.from(types).sort();
    }
  },
  watch: {
    availableBusinessTypes: {
      immediate: true,
      handler(types) {
        // 自动选择第一个业务线
        if (types.length > 0) {
          // 如果当前选中的tab不在可用列表中，或者没有选中任何tab，则选中第一个
          if (!this.activeBusinessType || !types.includes(this.activeBusinessType)) {
            this.activeBusinessType = types[0];
          }
        } else {
          this.activeBusinessType = "";
        }
      }
    }
  },
  methods: {
    /**
     * 获取业务类型名称
     */
    getBusinessTypeName(type) {
      return BUSINESS_TYPE_NAMES[type] || "未知";
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.bill-orders-tab {
  /deep/ .el-tabs__header {
    margin-bottom: @spacing-lg;
  }

  /deep/ .el-tabs--card > .el-tabs__header {
    border-bottom: 1px solid @border-base;
  }

  /deep/ .el-tabs--card > .el-tabs__header .el-tabs__item {
    border-left: 1px solid @border-base;
    
    &:first-child {
      border-left: none;
    }

    &.is-active {
      color: @primary-color;
      background-color: @bg-white;
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    color: @text-secondary;

    i {
      font-size: 64px;
      margin-bottom: @spacing-md;
      color: @text-placeholder;
    }

    p {
      font-size: @font-size-base;
      margin: 0;
    }
  }
}
</style>

