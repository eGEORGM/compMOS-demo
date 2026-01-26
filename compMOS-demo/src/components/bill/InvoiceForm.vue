<template>
  <div class="invoice-form">
    <!-- 分组提示 -->
    <div v-if="hasGrouping" class="group-hint">
      <i class="el-icon-info"></i>
      <span>开票信息已按 <strong>{{ groupingDescription }}</strong> 分组展示</span>
    </div>

    <el-table 
      :data="displayData" 
      border 
      style="width: 100%"
      :row-class-name="getRowClassName"
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      default-expand-all
    >
      <el-table-column prop="invoiceType" label="发票种类" width="150" fixed="left">
        <template slot-scope="{ row }">
          <template v-if="row.isGroup">
            <strong class="group-label">
              <i class="el-icon-folder-opened"></i>
              {{ row.groupLabel }}
            </strong>
          </template>
          <template v-else>
            <el-select 
              v-model="row.invoiceType" 
              placeholder="请选择"
              size="small"
              @change="handleRowChange(row)"
            >
              <el-option label="增值税普通发票" value="增值税普通发票"></el-option>
              <el-option label="增值税专用发票" value="增值税专用发票"></el-option>
              <el-option label="机票电子行程单" value="机票电子行程单"></el-option>
              <el-option label="火车票电子行程单" value="火车票电子行程单"></el-option>
            </el-select>
          </template>
        </template>
      </el-table-column>
      
      <el-table-column prop="summary" label="发票摘要" width="120">
        <template slot-scope="{ row }">
          <template v-if="!row.isGroup">
            {{ row.summary }}
          </template>
        </template>
      </el-table-column>
      
      <el-table-column prop="amount" label="开票金额" width="120" align="right">
        <template slot-scope="{ row }">
          <template v-if="row.isGroup">
            <strong class="group-amount">{{ formatAmount(row.totalAmount) }}</strong>
          </template>
          <template v-else>
            {{ formatAmount(row.amount) }}
          </template>
        </template>
      </el-table-column>
      
      <el-table-column label="发票抬头" width="200">
        <template slot-scope="{ row }">
          <template v-if="!row.isGroup">
            <invoice-title-selector
              v-model="row.titleId"
              :titles="invoiceTitles"
              size="small"
              @change="handleTitleChange(row, $event)"
            ></invoice-title-selector>
          </template>
        </template>
      </el-table-column>
      
      <el-table-column label="接收人姓名" width="120">
        <template slot-scope="{ row }">
          <el-input
            v-if="!row.isGroup"
            v-model="row.receiverName"
            placeholder="请输入姓名"
            size="small"
            :class="{ 'is-error': !row.receiverName }"
            @change="handleRowChange(row)"
          ></el-input>
        </template>
      </el-table-column>
      
      <el-table-column label="接收人电话" width="140">
        <template slot-scope="{ row }">
          <el-input
            v-if="!row.isGroup"
            v-model="row.receiverPhone"
            placeholder="请输入电话"
            size="small"
            :class="{ 'is-error': !validatePhone(row.receiverPhone) }"
            @change="handleRowChange(row)"
          ></el-input>
        </template>
      </el-table-column>
      
      <el-table-column label="接收人邮箱" width="180">
        <template slot-scope="{ row }">
          <el-input
            v-if="!row.isGroup"
            v-model="row.receiverEmail"
            placeholder="请输入邮箱"
            size="small"
            :class="{ 'is-error': !validateEmail(row.receiverEmail) }"
            @change="handleRowChange(row)"
          ></el-input>
        </template>
      </el-table-column>
      
      <el-table-column label="接收地址" width="200">
        <template slot-scope="{ row }">
          <el-input
            v-if="!row.isGroup"
            v-model="row.receiverAddress"
            placeholder="请输入地址"
            size="small"
            :class="{ 'is-error': !row.receiverAddress || row.receiverAddress.length < 5 }"
            @change="handleRowChange(row)"
          ></el-input>
        </template>
      </el-table-column>
      
      <el-table-column prop="unit" label="单位" width="80">
        <template slot-scope="{ row }">
          <template v-if="!row.isGroup">
            {{ row.unit }}
          </template>
        </template>
      </el-table-column>
      
      <el-table-column label="数量" width="120">
        <template slot-scope="{ row }">
          <template v-if="!row.isGroup">
            <el-input
              v-model.number="row.quantity"
              type="number"
              placeholder="请输入"
              size="small"
              :min="1"
              :max="99999"
              :class="{ 'is-error': !validateQuantity(row.quantity) }"
              @change="handleRowChange(row)"
            ></el-input>
            <span v-if="!validateQuantity(row.quantity)" class="error-tip">
              最大5位数
            </span>
          </template>
        </template>
      </el-table-column>
      
      <el-table-column prop="orderCount" label="订单数" width="90" align="right">
        <template slot-scope="{ row }">
          <template v-if="row.isGroup">
            <strong class="group-count">{{ row.totalOrderCount }}笔</strong>
          </template>
          <template v-else>
            {{ row.orderCount }}笔
          </template>
        </template>
      </el-table-column>
      
      <el-table-column label="状态" width="80" fixed="right">
        <template slot-scope="{ row }">
          <template v-if="!row.isGroup">
            <el-tag v-if="row.isValid" type="success" size="mini">有效</el-tag>
            <el-tag v-else type="danger" size="mini">待填</el-tag>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { formatAmount } from "@/utils/format";
import { validatePhone, validateEmail } from "@/utils/validators";
import InvoiceTitleSelector from "./InvoiceTitleSelector.vue";

export default {
  name: "InvoiceForm",
  components: {
    InvoiceTitleSelector
  },
  props: {
    billNo: {
      type: String,
      required: true
    },
    invoiceRows: {
      type: Array,
      default: () => []
    },
    invoiceTitles: {
      type: Array,
      default: () => []
    },
    splitConfig: {
      type: Object,
      default: () => ({
        dimension1: "",
        dimension2: ""
      })
    }
  },
  data() {
    return {
      localInvoiceRows: []
    };
  },
  computed: {
    hasGrouping() {
      return this.splitConfig && this.splitConfig.dimension1;
    },
    
    groupingDescription() {
      if (!this.hasGrouping) return "";
      
      const dimensionNames = {
        BUSINESS_LINE: "业务线",
        LEGAL_ENTITY: "法人实体",
        PAYMENT_ACCOUNT: "支付账户",
        DEPARTMENT: "部门"
      };
      
      let desc = dimensionNames[this.splitConfig.dimension1] || this.splitConfig.dimension1;
      if (this.splitConfig.dimension2) {
        desc += " → " + (dimensionNames[this.splitConfig.dimension2] || this.splitConfig.dimension2);
      }
      return desc;
    },
    
    displayData() {
      if (!this.hasGrouping) {
        // 无分组，直接展示
        return this.localInvoiceRows.map((row, index) => ({
          ...row,
          id: `row_${index}`
        }));
      }
      
      // 有分组，构建树形结构
      return this.buildGroupedData();
    }
  },
  watch: {
    invoiceRows: {
      immediate: true,
      handler(val) {
        this.localInvoiceRows = JSON.parse(JSON.stringify(val));
      }
    }
  },
  methods: {
    formatAmount(amount) {
      return formatAmount(amount);
    },
    
    validatePhone(phone) {
      if (!phone) return false;
      return validatePhone(phone);
    },
    
    validateEmail(email) {
      if (!email) return false;
      return validateEmail(email);
    },
    
    validateQuantity(quantity) {
      if (!quantity) return false;
      return quantity >= 1 && quantity <= 99999;
    },
    
    getRowClassName({ row }) {
      return row.isGroup ? 'group-row' : '';
    },
    
    buildGroupedData() {
      // 按splitDimension1分组
      const groups = {};
      
      this.localInvoiceRows.forEach((row, index) => {
        const groupKey = row.splitDimension1 || "其他";
        
        if (!groups[groupKey]) {
          groups[groupKey] = {
            id: `group_${groupKey}`,
            isGroup: true,
            groupLabel: groupKey,
            totalAmount: 0,
            totalOrderCount: 0,
            hasChildren: true,
            children: []
          };
        }
        
        groups[groupKey].totalAmount += row.amount || 0;
        groups[groupKey].totalOrderCount += row.orderCount || 0;
        groups[groupKey].children.push({
          ...row,
          id: `row_${index}`
        });
      });
      
      return Object.values(groups);
    },
    
    handleRowChange(row) {
      if (row.isGroup) return;
      
      // 验证当前行
      row.isValid = this.validateRow(row);
      
      // 触发更新事件
      this.$emit("update", this.localInvoiceRows);
    },
    
    handleTitleChange(row, titleData) {
      if (titleData) {
        row.titleName = titleData.titleName;
        row.taxNumber = titleData.taxNumber;
        row.address = titleData.address;
        row.phone = titleData.phone;
        row.bankName = titleData.bankName;
        row.bankAccount = titleData.bankAccount;
      }
      
      this.handleRowChange(row);
    },
    
    validateRow(row) {
      if (row.isGroup) return true;
      
      return (
        row.invoiceType &&
        row.titleId &&
        row.receiverName &&
        this.validatePhone(row.receiverPhone) &&
        this.validateEmail(row.receiverEmail) &&
        row.receiverAddress &&
        row.receiverAddress.length >= 5 &&
        this.validateQuantity(row.quantity)
      );
    },
    
    validate() {
      return this.localInvoiceRows.every(row => row.isValid);
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.invoice-form {
  .group-hint {
    display: flex;
    align-items: center;
    gap: @spacing-sm;
    padding: @spacing-md;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: @border-radius-base;
    color: @primary-color;
    font-size: @font-size-base;
    margin-bottom: @spacing-md;

    i {
      font-size: @font-size-xl;
    }

    strong {
      font-weight: 600;
      color: @primary-color;
    }
  }

  .group-label {
    display: flex;
    align-items: center;
    gap: @spacing-xs;
    color: @primary-color;
    font-size: @font-size-lg;
    font-weight: 600;

    i {
      font-size: @font-size-xl;
    }
  }

  .group-amount,
  .group-count {
    color: @primary-color;
    font-size: @font-size-lg;
    font-weight: 600;
  }

  /deep/ .el-table {
    .group-row {
      background-color: #f0f9ff !important;
      
      td {
        font-weight: 600;
      }
    }

    .el-input {
      &.is-error {
        .el-input__inner {
          border-color: @danger-color;
        }
      }
    }
  }

  .error-tip {
    color: @danger-color;
    font-size: @font-size-sm;
    margin-top: @spacing-xs;
    display: block;
  }
}
</style>

