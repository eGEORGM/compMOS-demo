<template>
  <el-dialog
    title="明细设置"
    :visible.sync="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="detail-settings-content">
      <div class="settings-description">
        <i class="el-icon-info"></i>
        <span>选择拆分维度后，账单汇总将按照所选维度进行多层级展示</span>
      </div>

      <div class="settings-form">
        <el-form :model="form" label-width="120px">
          <el-form-item label="拆分维度">
            <el-checkbox-group v-model="form.dimensions">
              <el-checkbox label="businessLine">业务线</el-checkbox>
              <el-checkbox label="legalEntity">法人实体</el-checkbox>
              <el-checkbox label="paymentAccount">支付账户</el-checkbox>
              <el-checkbox label="department">部门</el-checkbox>
            </el-checkbox-group>
            <div class="form-hint">
              可选择0-4个维度，将按选择顺序进行多层级拆分（选择0个则不拆分）
            </div>
          </el-form-item>

          <el-form-item label="拆分顺序">
            <div class="dimension-order">
              <el-tag
                v-for="(dim, index) in form.dimensions"
                :key="dim"
                closable
                @close="removeDimension(dim)"
              >
                {{ getDimensionName(dim) }}
                <span class="order-number">{{ index + 1 }}</span>
              </el-tag>
              <div v-if="form.dimensions.length === 0" class="empty-hint">
                请勾选拆分维度
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <div class="settings-preview">
        <div class="preview-title">预览效果</div>
        <div class="preview-content">
          <div v-if="form.dimensions.length > 0" class="preview-tree">
            <div class="tree-node level-0">
              <i class="el-icon-folder"></i>
              <span>总计：¥{{ formatAmount(previewTotal) }}</span>
            </div>
            <div v-for="(dim, index) in form.dimensions" :key="dim" class="tree-node" :class="`level-${index + 1}`">
              <i class="el-icon-folder-opened"></i>
              <span>{{ getDimensionName(dim) }} - 示例值</span>
            </div>
          </div>
          <div v-else class="preview-empty">
            选择拆分维度后将显示预览效果
          </div>
        </div>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { formatAmount } from "@/utils/format";

export default {
  name: "BillDetailSettings",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    currentSettings: {
      type: Object,
      default: () => ({
        dimensions: []
      })
    },
    billTotal: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      dialogVisible: false,
      saving: false,
      form: {
        dimensions: []
      },
      dimensionNames: {
        businessLine: "业务线",
        legalEntity: "法人实体",
        paymentAccount: "支付账户",
        department: "部门"
      }
    };
  },
  computed: {
    previewTotal() {
      return this.billTotal;
    }
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
      this.form.dimensions = [...(this.currentSettings.dimensions || [])];
    },
    
    getDimensionName(key) {
      return this.dimensionNames[key] || key;
    },
    
    removeDimension(dim) {
      const index = this.form.dimensions.indexOf(dim);
      if (index > -1) {
        this.form.dimensions.splice(index, 1);
      }
    },
    
    formatAmount(amount) {
      return formatAmount(amount);
    },
    
    handleClose() {
      this.dialogVisible = false;
      this.$emit("update:visible", false);
    },
    
    async handleSave() {
      if (this.form.dimensions.length > 4) {
        this.$message.warning("最多只能选择4个拆分维度");
        return;
      }
      
      this.saving = true;
      
      try {
        // 触发保存事件
        await this.$emit("save", {
          dimensions: this.form.dimensions
        });
        
        this.$message.success("明细设置保存成功");
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

.detail-settings-content {
  .settings-description {
    background: @bg-light;
    padding: @spacing-md;
    border-radius: @border-radius-base;
    margin-bottom: @spacing-lg;
    display: flex;
    align-items: center;
    gap: @spacing-sm;
    color: @text-secondary;
    font-size: @font-size-sm;

    i {
      color: @primary-color;
      font-size: @font-size-lg;
    }
  }

  .settings-form {
    margin-bottom: @spacing-lg;

    .form-hint {
      color: @text-placeholder;
      font-size: @font-size-sm;
      margin-top: @spacing-xs;
    }

    .dimension-order {
      display: flex;
      flex-wrap: wrap;
      gap: @spacing-sm;
      min-height: 32px;
      align-items: center;

      .el-tag {
        display: flex;
        align-items: center;
        gap: @spacing-xs;

        .order-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          background: @primary-color;
          color: @text-white;
          border-radius: 50%;
          font-size: @font-size-sm;
          margin-left: @spacing-xs;
        }
      }

      .empty-hint {
        color: @text-placeholder;
        font-size: @font-size-sm;
      }
    }
  }

  .settings-preview {
    background: @bg-light;
    padding: @spacing-md;
    border-radius: @border-radius-base;

    .preview-title {
      font-weight: 600;
      color: @text-primary;
      margin-bottom: @spacing-md;
    }

    .preview-content {
      .preview-tree {
        .tree-node {
          padding: @spacing-sm @spacing-md;
          margin-bottom: @spacing-xs;
          background: @bg-white;
          border-radius: @border-radius-base;
          display: flex;
          align-items: center;
          gap: @spacing-sm;

          i {
            color: @primary-color;
          }

          &.level-0 {
            font-weight: 600;
            color: @text-primary;
          }

          &.level-1 {
            margin-left: @spacing-lg;
          }

          &.level-2 {
            margin-left: @spacing-xl;
          }

          &.level-3 {
            margin-left: @spacing-xxl;
          }

          &.level-4 {
            margin-left: calc(@spacing-xxl + @spacing-lg);
          }
        }
      }

      .preview-empty {
        text-align: center;
        padding: @spacing-xl;
        color: @text-placeholder;
      }
    }
  }
}
</style>

