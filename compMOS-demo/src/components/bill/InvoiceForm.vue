<template>
  <div class="invoice-form">
    <!-- 分组提示 -->
    <div v-if="hasGrouping" class="info-banner">
      <div class="info-icon"></div>
      <div class="info-content">开票信息已按 <strong>{{ groupingDescription }}</strong> 拆分展示</div>
    </div>

    <el-table
      :data="localInvoiceRows"
      border
      style="width: 100%"
      class="invoice-table"
      :span-method="handleSpanMethod"
    >
      <el-table-column prop="invoiceType" label="发票种类" width="150" align="center">
        <template slot-scope="{ row }">
          {{ row.invoiceType || row.invoiceTypeName || '-' }}
        </template>
      </el-table-column>
      
      <!-- 动态拆分维度列 -->
      <el-table-column
        v-for="(dimension, index) in splitConfig.dimensions || []"
        :key="`split_dim_${index}`"
        :label="getDimensionLabel(dimension)"
        width="120"
      >
        <template slot-scope="{ row }">
          <span v-if="index === 0">
            {{ row.splitDimension1 || row.businessLine || '-' }}
          </span>
          <span v-else-if="index === 1">
            {{ row.splitDimension2 || row.legalEntity || '-' }}
          </span>
        </template>
      </el-table-column>
      
      <el-table-column prop="summary" label="发票摘要" width="180">
        <template slot-scope="{ row }">
          {{ row.summary || row.invoiceSummary || '-' }}
        </template>
      </el-table-column>
      
      <el-table-column prop="amount" label="开票金额(CNY)" width="150" align="right">
        <template slot-scope="{ row }">
          <div class="amount-cell">
            <span>{{ formatAmount(row.amount) }}</span>
            <el-link type="primary" :underline="false" @click="handleSplit(row)" class="split-link">
              拆分
            </el-link>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column label="发票抬头" width="250">
        <template slot-scope="{ row }">
          <div class="title-cell">
            <invoice-title-selector
              v-model="row.titleId"
              :titles="titles"
              size="small"
              @change="handleTitleChange(row, $event)"
            ></invoice-title-selector>
            <div class="title-actions">
              <el-link type="primary" :underline="false" @click="handleAddTitle" class="action-link">
                新增发票抬头>
              </el-link>
              <el-link type="primary" :underline="false" @click="handleTitleDetail(row)" class="action-link">
                抬头详情
              </el-link>
            </div>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column label="收货人信息" width="200">
        <template slot-scope="{ row }">
          <el-select
            v-model="row.receiverId"
            placeholder="请选择收货人"
            size="small"
            @change="handleReceiverChange(row)"
          >
            <el-option
              v-for="receiver in receivers"
              :key="receiver.id"
              :label="formatReceiverLabel(receiver)"
              :value="receiver.id"
            >
              <div class="receiver-option">
                <div>{{ receiver.name }} {{ receiver.phone }}</div>
                <div class="receiver-email">{{ receiver.email }}</div>
              </div>
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      
      <el-table-column label="单位" width="100">
        <template slot-scope="{ row }">
          <el-select
            v-model="row.unit"
            placeholder="请选择"
            size="small"
          >
            <el-option label="/" value="/"></el-option>
            <el-option label="次" value="次"></el-option>
            <el-option label="天" value="天"></el-option>
            <el-option label="个" value="个"></el-option>
            <el-option label="人" value="人"></el-option>
            <el-option label="间夜" value="间夜"></el-option>
            <el-option label="间" value="间"></el-option>
            <el-option label="批" value="批"></el-option>
          </el-select>
        </template>
      </el-table-column>
      
      <el-table-column label="数量" width="100">
        <template slot-scope="{ row }">
          <el-input
            v-model="row.quantity"
            type="number"
            placeholder="请输入数量"
            size="small"
            :min="1"
            :max="99999"
            @change="handleQuantityChange(row)"
          ></el-input>
        </template>
      </el-table-column>
      
      <el-table-column label="收件邮箱" width="200">
        <template slot-scope="{ row }">
          <el-input
            v-model="row.receiverEmail"
            placeholder="请输入收件邮箱"
            size="small"
          ></el-input>
        </template>
      </el-table-column>
      
      <el-table-column label="发票备注" width="200">
        <template slot-scope="{ row }">
          <el-input
            v-model="row.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
            size="small"
          ></el-input>
        </template>
      </el-table-column>
    </el-table>

    <!-- 提交按钮 -->
    <div class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">提交开票</el-button>
    </div>
  </div>
</template>

<script>
import InvoiceTitleSelector from "./InvoiceTitleSelector.vue";
import { formatAmount } from "@/utils/format";
import { validatePhone, validateEmail } from "@/utils/validators";

export default {
  name: "InvoiceForm",
  components: {
    InvoiceTitleSelector
  },
  props: {
    invoiceRows: {
      type: Array,
      required: true
    },
    splitConfig: {
      type: Object,
      default: () => ({ dimensions: [] })
    },
    titles: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    titles: {
      immediate: true,
      handler(newVal) {
        console.log("InvoiceForm - titles 变化:", newVal);
      }
    }
  },
  data() {
    return {
      localInvoiceRows: [],
      submitting: false,
      receivers: [
        {
          id: "1",
          name: "张三",
          phone: "13800138000",
          email: "zhangsan@example.com",
          address: "北京市海淀区中关村大街1号"
        },
        {
          id: "2",
          name: "李四",
          phone: "13900139000",
          email: "lisi@example.com",
          address: "北京市朝阳区建国路88号"
        },
        {
          id: "3",
          name: "王五",
          phone: "13700137000",
          email: "wangwu@example.com",
          address: "上海市浦东新区世纪大道1号"
        }
      ]
    };
  },
  computed: {
    hasGrouping() {
      return this.splitConfig && this.splitConfig.dimensions && this.splitConfig.dimensions.length > 0;
    },
    groupingDescription() {
      if (!this.hasGrouping) return "";
      const { SPLIT_DIMENSION_NAMES } = require("@/utils/constants");
      return this.splitConfig.dimensions
        .map(d => SPLIT_DIMENSION_NAMES[d] || d)
        .join(" 和 ");
    },
    // 计算每个发票种类的行数，用于合并单元格
    invoiceTypeSpanMap() {
      const spanMap = new Map();
      const typeIndexMap = new Map();
      
      this.localInvoiceRows.forEach((row, index) => {
        const invoiceType = row.invoiceType || row.invoiceTypeName || '其他';
        
        if (!typeIndexMap.has(invoiceType)) {
          // 记录该发票种类首次出现的索引
          typeIndexMap.set(invoiceType, index);
          spanMap.set(index, { rowspan: 1, colspan: 1 });
        } else {
          // 该发票种类已出现过，增加首行的 rowspan
          const firstIndex = typeIndexMap.get(invoiceType);
          spanMap.get(firstIndex).rowspan += 1;
          // 当前行设置为不显示
          spanMap.set(index, { rowspan: 0, colspan: 0 });
        }
      });
      
      return spanMap;
    },
    
    // 计算第一个拆分维度的合并范围（在每个发票种类内部）
    firstDimensionSpanMap() {
      const spanMap = new Map();
      const dimensions = (this.splitConfig && this.splitConfig.dimensions) ? this.splitConfig.dimensions : [];
      
      if (dimensions.length === 0) {
        return spanMap;
      }
      
      // 按发票种类分组
      const typeGroups = {};
      this.localInvoiceRows.forEach((row, index) => {
        const invoiceType = row.invoiceType || row.invoiceTypeName || '其他';
        if (!typeGroups[invoiceType]) {
          typeGroups[invoiceType] = [];
        }
        typeGroups[invoiceType].push({ row, index });
      });
      
      // 在每个发票种类内部，按第一个拆分维度分组
      Object.keys(typeGroups).forEach(invoiceType => {
        const rows = typeGroups[invoiceType];
        const dimensionValueMap = new Map();
        
        rows.forEach(({ row, index }) => {
          const dimensionValue = row.splitDimension1 || row.businessLine || row.legalEntity || '其他';
          
          if (!dimensionValueMap.has(dimensionValue)) {
            // 记录该维度值首次出现的索引（相对于该发票种类组）
            dimensionValueMap.set(dimensionValue, index);
            spanMap.set(index, { rowspan: 1, colspan: 1 });
          } else {
            // 该维度值已出现过，增加首行的 rowspan
            const firstIndex = dimensionValueMap.get(dimensionValue);
            spanMap.get(firstIndex).rowspan += 1;
            // 当前行设置为不显示
            spanMap.set(index, { rowspan: 0, colspan: 0 });
          }
        });
      });
      
      return spanMap;
    }
  },
  watch: {
    invoiceRows: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          console.log("InvoiceForm - invoiceRows 变化:", newVal);
          // 深拷贝数据，创建新对象而不是修改原对象
          this.localInvoiceRows = newVal.map((row, index) => {
            // 创建新对象，避免修改原始数据
            const newRow = { ...row };
            
            // 确保发票类型字段正确
            if (!newRow.invoiceType && newRow.invoiceTypeName) {
              newRow.invoiceType = newRow.invoiceTypeName;
            }
            if (!newRow.invoiceTypeName && newRow.invoiceType) {
              newRow.invoiceTypeName = newRow.invoiceType;
            }
            if (!newRow.invoiceType && !newRow.invoiceTypeName) {
              newRow.invoiceType = "增值税普通发票";
              newRow.invoiceTypeName = "增值税普通发票";
            }
            
            // 确保摘要字段
            if (!newRow.summary && newRow.invoiceSummary) {
              newRow.summary = newRow.invoiceSummary;
            }
            if (!newRow.invoiceSummary && newRow.summary) {
              newRow.invoiceSummary = newRow.summary;
            }
            if (!newRow.summary && !newRow.invoiceSummary) {
              newRow.summary = "全部订单";
              newRow.invoiceSummary = "全部订单";
            }
            
            // 确保拆分维度字段
            if (!newRow.splitDimension1 && newRow.businessLine) {
              newRow.splitDimension1 = newRow.businessLine;
            }
            if (!newRow.splitDimension2 && newRow.legalEntity) {
              newRow.splitDimension2 = newRow.legalEntity;
            }
            if (!newRow.businessLine && newRow.splitDimension1) {
              newRow.businessLine = newRow.splitDimension1;
            }
            if (!newRow.legalEntity && newRow.splitDimension2) {
              newRow.legalEntity = newRow.splitDimension2;
            }
            
            // 处理抬头信息
            if (newRow.invoiceTitle && typeof newRow.invoiceTitle === 'object') {
              newRow.titleId = newRow.invoiceTitle.titleId || newRow.titleId || "";
              newRow.titleName = newRow.invoiceTitle.titleName || newRow.titleName || "";
              newRow.taxNumber = newRow.invoiceTitle.taxNumber || newRow.taxNumber || "";
            }
            if (!newRow.titleId && this.titles && this.titles.length > 0) {
              const defaultTitle = this.titles.find(t => t.isDefault) || this.titles[0];
              if (defaultTitle) {
                newRow.titleId = defaultTitle.titleId;
                newRow.titleName = defaultTitle.titleName;
                newRow.taxNumber = defaultTitle.taxNumber;
              }
            }
            
            // 处理接收人信息（默认为空，不设置默认值）
            if (newRow.recipient && typeof newRow.recipient === 'object') {
              newRow.receiverId = newRow.recipient.id || newRow.receiverId || "";
              newRow.receiverName = newRow.recipient.name || newRow.receiverName || "";
              newRow.receiverPhone = newRow.recipient.phone || newRow.receiverPhone || "";
              newRow.receiverEmail = newRow.recipient.email || newRow.receiverEmail || "";
              newRow.receiverAddress = newRow.recipient.address || newRow.receiverAddress || "";
            }
            // 收货人信息默认为空，不设置默认值
            
            // 确保其他字段有默认值
            // 单位默认为「/」，数量、备注、收件邮箱默认为空
            if (newRow.unit === undefined) newRow.unit = "/";
            if (newRow.quantity === undefined) newRow.quantity = "";
            if (newRow.remark === undefined) newRow.remark = "";
            // 收件邮箱字段（独立于收货人信息）
            if (newRow.receiverEmail === undefined) newRow.receiverEmail = "";
            if (!newRow.orderCount) newRow.orderCount = 0;
            if (newRow.isValid === undefined) newRow.isValid = false;
            if (newRow.amount === undefined || newRow.amount === null) newRow.amount = 0;
            if (!newRow.id) newRow.id = `invoice_row_${index}`;
            
            return newRow;
          });
          
          console.log("InvoiceForm - localInvoiceRows 处理后:", this.localInvoiceRows);
        }
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
    
    getDimensionLabel(dimension) {
      const { SPLIT_DIMENSION_NAMES } = require("@/utils/constants");
      return SPLIT_DIMENSION_NAMES[dimension] || dimension;
    },
    
    // 合并单元格方法
    handleSpanMethod({ row, column, rowIndex, columnIndex }) {
      const dimensions = (this.splitConfig && this.splitConfig.dimensions) ? this.splitConfig.dimensions : [];
      const dimensionsCount = dimensions.length;
      
      // 第一列：发票种类（columnIndex === 0）- 合并
      if (columnIndex === 0) {
        const spanInfo = this.invoiceTypeSpanMap.get(rowIndex);
        if (spanInfo) {
          return spanInfo;
        }
      }
      
      // 第一个拆分维度列（columnIndex === 1）- 合并（如果不是末级）
      if (columnIndex === 1 && dimensionsCount > 1) {
        const spanInfo = this.firstDimensionSpanMap.get(rowIndex);
        if (spanInfo) {
          return spanInfo;
        }
      }
      
      // 其他列（包括末级拆分维度）不合并
      return { rowspan: 1, colspan: 1 };
    },
    
    formatReceiverLabel(receiver) {
      return `${receiver.name} - ${receiver.phone}`;
    },
    
    handleQuantityChange(row) {
      // 允许数量为空，如果填写了则进行范围校验
      const quantity = row.quantity === "" || row.quantity === null || row.quantity === undefined 
        ? "" 
        : Number(row.quantity);
      
      if (quantity !== "") {
        if (isNaN(quantity) || quantity < 1) {
          row.quantity = "";
        } else if (quantity > 99999) {
          row.quantity = 99999;
        } else {
          row.quantity = quantity;
        }
      }
      console.log("数量改变:", row);
    },
    
    handleSplit(row) {
      // TODO: 实现拆分逻辑
      console.log("拆分:", row);
      this.$message.info("拆分功能开发中");
    },
    
    handleAddTitle() {
      // TODO: 实现新增发票抬头
      console.log("新增发票抬头");
      this.$message.info("新增发票抬头功能开发中");
    },
    
    handleTitleDetail(row) {
      // TODO: 实现查看抬头详情
      console.log("查看抬头详情:", row);
      this.$message.info("抬头详情功能开发中");
    },
    
    handleTitleChange(row, titleId) {
      const title = this.titles.find(t => t.titleId === titleId);
      if (title) {
        row.titleId = title.titleId;
        row.titleName = title.titleName;
        row.taxNumber = title.taxNumber;
      }
      console.log("发票抬头改变:", row);
    },
    
    handleReceiverChange(row) {
      const receiver = this.receivers.find(r => r.id === row.receiverId);
      if (receiver) {
        row.receiverId = receiver.id;
        row.receiverName = receiver.name;
        row.receiverPhone = receiver.phone;
        row.receiverEmail = receiver.email;
        row.receiverAddress = receiver.address;
      }
      console.log("收货人改变:", row);
    },
    
    validateRow(row) {
      if (!row.invoiceType) {
        this.$message.warning("请选择发票种类");
        return false;
      }
      if (!row.amount || row.amount <= 0) {
        this.$message.warning("开票金额必须大于0");
        return false;
      }
      if (!row.titleId) {
        this.$message.warning("请选择发票抬头");
        return false;
      }
      if (!row.receiverId) {
        this.$message.warning("请选择收货人");
        return false;
      }
      // 数量可以为空，如果填写了则必须大于等于1
      if (row.quantity !== "" && row.quantity !== null && row.quantity !== undefined && row.quantity < 1) {
        this.$message.warning("数量必须大于等于1");
        return false;
      }
      return true;
    },
    
    handleCancel() {
      this.$emit("cancel");
    },
    
    handleSubmit() {
      // 验证所有行
      for (let row of this.localInvoiceRows) {
        if (!this.validateRow(row)) {
          return;
        }
      }
      
      this.$emit("submit", this.localInvoiceRows);
    }
  }
};
</script>

<style lang="less" scoped>
@import "@/assets/styles/variables.less";

.invoice-form {
  .info-banner {
    strong {
      color: @primary-color;
      font-weight: 600;
    }
  }
  
  .invoice-table {
    margin-bottom: @spacing-lg;
    
    .amount-cell {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .split-link {
        font-size: 12px;
      }
    }
    
    .title-cell {
      .title-actions {
        display: flex;
        gap: @spacing-sm;
        margin-top: @spacing-xs;
        
        .action-link {
          font-size: 12px;
        }
      }
    }
    
    .receiver-option {
      .receiver-email {
        font-size: 12px;
        color: @text-secondary;
      }
    }
  }
  
  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: @spacing-md;
    padding-top: @spacing-md;
    border-top: 1px solid @border-base;
  }
}
</style>
