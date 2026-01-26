<template>
  <div class="bill-summary-content">
    <!-- 消费金额顶部栏 -->
    <div class="amount-header">
      <div class="amount-info">
        <span class="amount-label">消费金额：</span>
        <span class="amount-value">{{ formatAmount(bill.totalAmount) }}</span>
      </div>
      <el-button size="small" type="text" @click="handleDetailSettings">
        明细设置
      </el-button>
    </div>

    <!-- 明细展示区域 -->
    <div class="detail-section">
      <!-- 树形明细展示 -->
      <div v-if="detailSettings && detailSettings.dimensions.length > 0" class="detail-tree">
        <el-tree
          :data="treeData"
          :props="treeProps"
          node-key="id"
          default-expand-all
          :expand-on-click-node="false"
          class="custom-tree"
        >
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <span class="node-label">
              <span class="node-name">{{ data.name }}</span>
            </span>
            <span class="node-stats">
              <span class="node-amount">{{ formatAmount(data.amount) }}</span>
              <span class="node-count">{{ data.count }}笔</span>
            </span>
          </span>
        </el-tree>
      </div>

      <!-- 默认展示（无配置时） -->
      <div v-else class="business-stats-default">
        <el-row :gutter="16">
          <el-col 
            v-for="item in businessLineSummary" 
            :key="item.businessType"
            :span="6"
          >
            <div class="stat-card">
              <div class="stat-header">
                <span class="stat-name">{{ item.businessTypeName }}</span>
                <el-tag size="small">{{ calculatePercent(item.totalAmount, bill.totalAmount) }}</el-tag>
              </div>
              <div class="stat-amount">{{ formatAmount(item.totalAmount) }}</div>
              <div class="stat-count">{{ item.count }}笔订单</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 订单统计 -->
    <div class="order-stats-section">
      <h4 class="section-title">订单统计</h4>
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-label">总订单数</div>
            <div class="stat-number">{{ billSummary.totalCount }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-label">平均订单金额</div>
            <div class="stat-number">{{ formatAmount(averageOrderAmount) }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-label">已核对订单</div>
            <div class="stat-number">{{ checkedOrderCount }}</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 明细设置弹窗 -->
    <bill-detail-settings
      :visible.sync="settingsVisible"
      :current-settings="detailSettings"
      :bill-total="bill.totalAmount"
      @save="handleSaveSettings"
    ></bill-detail-settings>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { formatAmount, formatBillCycle, formatDateRange } from "@/utils/format";
import { BUSINESS_TYPE_NAMES } from "@/utils/constants";
import BillDetailSettings from "./BillDetailSettings.vue";

export default {
  name: "BillSummaryContent",
  components: {
    BillDetailSettings
  },
  props: {
    bill: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      settingsVisible: false,
      treeProps: {
        children: "children",
        label: "name"
      }
    };
  },
  computed: {
    ...mapState("config", ["detailSettings"]),
    ...mapState("order", ["orderList"]),
    
    billSummary() {
      return this.bill.summary || {};
    },
    
    businessLineSummary() {
      return this.billSummary.businessLineSummary || [];
    },
    
    averageOrderAmount() {
      const total = this.bill.totalAmount || 0;
      const count = this.billSummary.totalCount || 1;
      return total / count;
    },
    
    checkedOrderCount() {
      // 直接从 orderList 计算已核对订单数，确保数据实时更新
      if (!this.orderList || this.orderList.length === 0) {
        return 0;
      }
      return this.orderList.filter(order => order.checkStatus === 1).length;
    },
    
    treeData() {
      if (!this.detailSettings || !this.detailSettings.dimensions || this.detailSettings.dimensions.length === 0) {
        return [];
      }
      
      return this.buildTreeData();
    }
  },
  methods: {
    ...mapActions("config", ["updateDetailSettings"]),
    
    formatAmount(amount) {
      return formatAmount(amount);
    },
    
    formatCycle(cycle) {
      return formatBillCycle(cycle);
    },
    
    formatDateRange(startDate, endDate) {
      return formatDateRange(startDate, endDate);
    },
    
    calculatePercent(part, total) {
      if (!total) return "0%";
      return ((part / total) * 100).toFixed(1) + "%";
    },
    
    handleDetailSettings() {
      this.settingsVisible = true;
    },
    
    async handleSaveSettings(settings) {
      try {
        await this.updateDetailSettings(settings);
        this.$message.success("明细设置已保存");
      } catch (error) {
        this.$message.error("保存失败：" + error.message);
        throw error;
      }
    },
    
    getNodeIcon(data) {
      if (data.level === 0) {
        return "el-icon-folder";
      }
      return "el-icon-folder-opened";
    },
    
    buildTreeData() {
      const dimensions = this.detailSettings.dimensions;
      const orders = this.orderList || [];
      
      // 构建根节点
      const root = {
        id: "root",
        name: "本期结算周期主汇总",
        amount: this.bill.totalAmount || 0,
        count: orders.length,
        level: 0,
        children: []
      };
      
      // 递归构建树形结构
      this.buildTreeLevel(root, orders, dimensions, 0);
      
      return [root];
    },
    
    buildTreeLevel(parentNode, orders, dimensions, level) {
      if (level >= dimensions.length || orders.length === 0) {
        return;
      }
      
      const dimension = dimensions[level];
      const groups = this.groupBy(orders, dimension);
      
      parentNode.children = Object.keys(groups).map((key, index) => {
        const groupOrders = groups[key];
        const isLeafLevel = level === dimensions.length - 1;
        const node = {
          id: `${parentNode.id}-${dimension}-${key}`,
          name: this.getDimensionValueName(dimension, key),
          amount: groupOrders.reduce((sum, order) => sum + (order.amount || 0), 0),
          count: groupOrders.length,
          level: level + 1
        };
        
        // 如果不是叶子节点，添加children数组
        if (!isLeafLevel) {
          node.children = [];
        }
        
        // 如果是叶子节点，添加部门信息（示例）
        if (isLeafLevel && groupOrders.length > 0) {
          const firstOrder = groupOrders[0];
          node.department = firstOrder.department || "首页-机酒住宿部";
        }
        
        // 递归构建下一层
        this.buildTreeLevel(node, groupOrders, dimensions, level + 1);
        
        return node;
      });
    },
    
    groupBy(orders, dimension) {
      const groups = {};
      
      orders.forEach(order => {
        let key;
        switch (dimension) {
          case "businessLine":
            key = order.businessType || "未知";
            break;
          case "legalEntity":
            key = order.legalEntity || "未知";
            break;
          case "paymentAccount":
            key = order.paymentAccount || "未知";
            break;
          case "department":
            key = order.department || "未知";
            break;
          default:
            key = "未知";
        }
        
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(order);
      });
      
      return groups;
    },
    
    getDimensionValueName(dimension, value) {
      if (dimension === "businessLine") {
        return BUSINESS_TYPE_NAMES[value] || value;
      }
      return value;
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.bill-summary-content {
  .amount-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: linear-gradient(135deg, #5b8ff9 0%, #7aa3f7 100%);
    color: #ffffff;
    border-radius: 4px;
    margin-bottom: 24px;

    .amount-info {
      display: flex;
      align-items: baseline;
      gap: 8px;

      .amount-label {
        font-size: 14px;
        opacity: 0.95;
      }

      .amount-value {
        font-size: 20px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
    }

    /deep/ .el-button--text {
      color: #ffffff;
      font-size: 14px;

      &:hover {
        color: #ffffff;
        opacity: 0.9;
      }
    }
  }

  .detail-section,
  .order-stats-section {
    margin-bottom: 24px;

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #333333;
        margin: 0;
      }
    }

    .detail-tree {
      background: #ffffff;
      border: 1px solid #e8e8e8;
      border-radius: 4px;

      /deep/ .custom-tree {
        background: #ffffff;

        .el-tree-node__content {
          height: 48px;
          border-bottom: 1px solid #f0f0f0;
          padding-right: 16px;
          background: #ffffff;

          &:hover {
            background: #fafafa;
          }
        }

        .el-tree-node__expand-icon {
          color: #999999;
          font-size: 12px;

          &.is-leaf {
            visibility: hidden;
          }
        }

        .custom-tree-node {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .node-label {
            display: flex;
            align-items: center;
            gap: 8px;

            .node-name {
              font-weight: 400;
              color: #333333;
              font-size: 14px;
            }
          }

          .node-stats {
            display: flex;
            align-items: center;
            gap: 24px;

            .node-amount {
              font-weight: 500;
              color: #333333;
              font-size: 14px;
              min-width: 120px;
              text-align: right;
            }

            .node-count {
              color: #999999;
              font-size: 12px;
              min-width: 60px;
              text-align: right;
            }
          }
        }

        // 不同层级的缩进
        .el-tree-node {
          &[aria-level="2"] > .el-tree-node__content {
            padding-left: 32px !important;
          }

          &[aria-level="3"] > .el-tree-node__content {
            padding-left: 64px !important;
          }

          &[aria-level="4"] > .el-tree-node__content {
            padding-left: 96px !important;
          }

          &[aria-level="5"] > .el-tree-node__content {
            padding-left: 128px !important;
          }
        }
      }
    }

    .business-stats-default {
      .stat-card {
        background: #ffffff;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        padding: 16px;

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .stat-name {
            font-size: 14px;
            color: #666666;
          }
        }

        .stat-amount {
          font-size: 20px;
          font-weight: 600;
          color: #333333;
          margin-bottom: 4px;
        }

        .stat-count {
          font-size: 12px;
          color: #999999;
        }
      }
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #333333;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e8e8e8;
    }

    .stat-item {
      background: #fafafa;
      padding: 16px;
      border-radius: 4px;
      text-align: center;

      .stat-label {
        font-size: 12px;
        color: #666666;
        margin-bottom: 4px;
      }

      .stat-number {
        font-size: 24px;
        font-weight: 600;
        color: #1890ff;
      }
    }
  }
}
</style>

