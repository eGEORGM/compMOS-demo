<template>
  <el-dialog
    title="对账单字段配置"
    :visible.sync="dialogVisible"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="field-config-content">
      <el-tabs v-model="activeConfigTab" type="card">
        <!-- 显示字段 -->
        <el-tab-pane label="显示字段" name="display">
          <div class="config-section">
            <div class="section-description">
              <i class="el-icon-info"></i>
              <span>配置在订单列表中显示的字段</span>
            </div>
            <el-transfer
              v-model="localConfig.display"
              :data="availableFields"
              :titles="['可选字段', '已选字段']"
              :props="{
                key: 'value',
                label: 'label'
              }"
              filterable
              filter-placeholder="搜索字段"
            ></el-transfer>
          </div>
        </el-tab-pane>

        <!-- Excel导出字段 -->
        <el-tab-pane label="Excel导出字段" name="excel">
          <div class="config-section">
            <div class="section-description">
              <i class="el-icon-info"></i>
              <span>配置导出Excel时包含的字段</span>
            </div>
            <el-transfer
              v-model="localConfig.excelExport"
              :data="availableFields"
              :titles="['可选字段', '已选字段']"
              :props="{
                key: 'value',
                label: 'label'
              }"
              filterable
              filter-placeholder="搜索字段"
            ></el-transfer>
          </div>
        </el-tab-pane>

        <!-- PDF导出字段 -->
        <el-tab-pane label="PDF导出字段" name="pdf">
          <div class="config-section">
            <div class="section-description">
              <i class="el-icon-warning"></i>
              <span>配置导出PDF时包含的字段（最多20个字段，受PDF宽度限制）</span>
            </div>
            <el-transfer
              v-model="localConfig.pdfExport"
              :data="availableFields"
              :titles="['可选字段', `已选字段 (${localConfig.pdfExport.length}/20)`]"
              :props="{
                key: 'value',
                label: 'label'
              }"
              filterable
              filter-placeholder="搜索字段"
              @change="handlePdfFieldChange"
            ></el-transfer>
            <div v-if="localConfig.pdfExport.length > 20" class="error-hint">
              <i class="el-icon-info"></i>
              PDF字段数量超过限制，请调整至20个以内
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saving">保存配置</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: "FieldConfigDialog",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    currentConfig: {
      type: Object,
      default: () => ({
        display: [],
        excelExport: [],
        pdfExport: []
      })
    }
  },
  data() {
    return {
      dialogVisible: false,
      activeConfigTab: "display",
      saving: false,
      localConfig: {
        display: [],
        excelExport: [],
        pdfExport: []
      },
      availableFields: [
        // 通用字段
        { label: "订单号", value: "orderNo" },
        { label: "预订日期", value: "bookingTime" },
        { label: "出行日期", value: "departDate" },
        { label: "预订人", value: "bookingPerson" },
        { label: "出行人/入住人", value: "travelerName" },
        { label: "支付金额", value: "amount" },
        { label: "核对状态", value: "checkStatus" },
        
        // 机票特有字段
        { label: "航班号", value: "flightNo" },
        { label: "航线", value: "route" },
        { label: "起飞时间", value: "departTime" },
        { label: "舱位等级", value: "cabin" },
        { label: "电子客票号", value: "ticketNo" },
        
        // 酒店特有字段
        { label: "酒店名称", value: "hotelName" },
        { label: "入住日期", value: "checkInDate" },
        { label: "离店日期", value: "checkOutDate" },
        { label: "房间数量", value: "nights" },
        { label: "房型", value: "roomType" },
        
        // 火车票特有字段
        { label: "车次", value: "trainNo" },
        { label: "出发时间", value: "departTime" },
        { label: "座位等级", value: "seatType" },
        { label: "身份证后四位", value: "idCardLast4" },
        
        // 用车特有字段
        { label: "用车时间", value: "useTime" },
        { label: "起点", value: "startLocation" },
        { label: "终点", value: "endLocation" },
        { label: "车型", value: "carType" },
        { label: "行驶里程", value: "mileage" },
        
        // 财务字段
        { label: "法人实体", value: "legalEntity" },
        { label: "支付账户", value: "paymentAccount" },
        { label: "成本中心", value: "costCenter" },
        { label: "项目部门", value: "department" },
        { label: "项目名称", value: "projectName" },
        { label: "费用类型", value: "expenseType" }
      ]
    };
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        this.dialogVisible = val;
        if (val) {
          this.initForm();
        }
      }
    }
  },
  methods: {
    initForm() {
      this.localConfig = {
        display: [...(this.currentConfig.display || [])],
        excelExport: [...(this.currentConfig.excelExport || [])],
        pdfExport: [...(this.currentConfig.pdfExport || [])]
      };
      
      // 如果是空配置，设置默认值
      if (this.localConfig.display.length === 0) {
        this.localConfig.display = [
          "orderNo",
          "bookingTime",
          "departDate",
          "bookingPerson",
          "travelerName",
          "amount",
          "checkStatus"
        ];
      }
      
      if (this.localConfig.excelExport.length === 0) {
        this.localConfig.excelExport = [...this.localConfig.display];
      }
      
      if (this.localConfig.pdfExport.length === 0) {
        this.localConfig.pdfExport = [...this.localConfig.display].slice(0, 20);
      }
    },
    
    handlePdfFieldChange() {
      // PDF字段变更时的处理
      if (this.localConfig.pdfExport.length > 20) {
        this.$message.warning("PDF字段数量已达到上限（20个）");
      }
    },
    
    handleClose() {
      this.dialogVisible = false;
      this.$emit("update:visible", false);
    },
    
    async handleSave() {
      // 验证PDF字段数量
      if (this.localConfig.pdfExport.length > 20) {
        this.$message.error("PDF导出字段不能超过20个，请调整后再保存");
        return;
      }
      
      // 至少选择一个字段
      if (this.localConfig.display.length === 0) {
        this.$message.warning("请至少选择一个显示字段");
        return;
      }
      
      this.saving = true;
      
      try {
        await this.$emit("save", this.localConfig);
        this.$message.success("字段配置保存成功");
        this.handleClose();
      } catch (error) {
        this.$message.error("保存失败：" + error.message);
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.field-config-content {
  .config-section {
    padding: @spacing-md 0;

    .section-description {
      display: flex;
      align-items: center;
      gap: @spacing-sm;
      padding: @spacing-md;
      background: @bg-light;
      border-radius: @border-radius-base;
      margin-bottom: @spacing-lg;
      color: @text-secondary;
      font-size: @font-size-sm;

      i {
        font-size: @font-size-lg;

        &.el-icon-info {
          color: @primary-color;
        }

        &.el-icon-warning {
          color: @warning-color;
        }
      }
    }

    /deep/ .el-transfer {
      display: flex;
      justify-content: center;

      .el-transfer-panel {
        width: 300px;
      }
    }

    .error-hint {
      display: flex;
      align-items: center;
      gap: @spacing-sm;
      margin-top: @spacing-md;
      padding: @spacing-md;
      background: @bg-light;
      border-radius: @border-radius-base;
      color: @text-secondary;
      font-size: @font-size-base;
      margin-bottom: @spacing-lg;

      i {
        color: @primary-color;
        font-size: @font-size-xl;
      }
    }
  }
}
</style>

