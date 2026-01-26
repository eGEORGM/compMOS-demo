<template>
  <el-dialog
    title="拆分汇总配置"
    :visible.sync="visible"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="split-config-content">
      <p class="config-description">
        <i class="el-icon-info"></i>
        配置拆分维度后，开票信息表将按照选定的维度进行分组展示
      </p>

      <el-form :model="form" :rules="rules" ref="splitForm" label-width="80px">
        <el-form-item label="字段一" prop="dimension1">
          <el-select
            v-model="form.dimension1"
            placeholder="请选择第一个拆分维度"
            style="width: 100%"
            @change="handleDimensionChange"
          >
            <el-option
              v-for="item in dimensionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.value === form.dimension2"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="字段二" prop="dimension2">
          <el-select
            v-model="form.dimension2"
            placeholder="请选择第二个拆分维度（可选）"
            clearable
            style="width: 100%"
            @change="handleDimensionChange"
          >
            <el-option
              v-for="item in dimensionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.value === form.dimension1"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <div class="config-preview" v-if="form.dimension1">
          <div class="preview-title">预览效果</div>
          <div class="preview-content">
            <div class="preview-item">
              <i class="el-icon-folder-opened"></i>
              <span>{{ getDimensionLabel(form.dimension1) }}</span>
              <template v-if="form.dimension2">
                <i class="el-icon-right"></i>
                <i class="el-icon-folder-opened"></i>
                <span>{{ getDimensionLabel(form.dimension2) }}</span>
              </template>
            </div>
            <p class="preview-hint">
              开票信息将按照 <strong>{{ getDimensionLabel(form.dimension1) }}</strong>
              <template v-if="form.dimension2">
                → <strong>{{ getDimensionLabel(form.dimension2) }}</strong>
              </template>
              进行分组展示
            </p>
          </div>
        </div>
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">保存配置</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { SPLIT_DIMENSION } from "@/utils/constants";

export default {
  name: "InvoiceSplitConfig",
  props: {
    value: {
      type: Boolean,
      default: false
    },
    currentConfig: {
      type: Object,
      default: () => ({
        dimension1: "",
        dimension2: ""
      })
    }
  },
  data() {
    return {
      visible: this.value,
      saving: false,
      form: {
        dimension1: "",
        dimension2: ""
      },
      dimensionOptions: [
        { label: "业务线", value: SPLIT_DIMENSION.BUSINESS_LINE },
        { label: "法人实体", value: SPLIT_DIMENSION.LEGAL_ENTITY },
        { label: "支付账户", value: SPLIT_DIMENSION.PAYMENT_ACCOUNT },
        { label: "部门", value: SPLIT_DIMENSION.DEPARTMENT }
      ],
      rules: {
        dimension1: [
          { required: true, message: "请选择第一个拆分维度", trigger: "change" }
        ],
        dimension2: [
          { validator: this.validateDimension2, trigger: "change" }
        ]
      }
    };
  },
  watch: {
    value(val) {
      this.visible = val;
      if (val) {
        this.initForm();
      }
    },
    visible(val) {
      this.$emit("input", val);
    }
  },
  methods: {
    initForm() {
      this.form = {
        dimension1: this.currentConfig.dimension1 || "",
        dimension2: this.currentConfig.dimension2 || ""
      };
      // 清除验证
      this.$nextTick(() => {
        if (this.$refs.splitForm) {
          this.$refs.splitForm.clearValidate();
        }
      });
    },

    handleDimensionChange() {
      // 触发验证
      this.$nextTick(() => {
        if (this.$refs.splitForm) {
          this.$refs.splitForm.validateField("dimension2");
        }
      });
    },

    validateDimension2(rule, value, callback) {
      if (value && value === this.form.dimension1) {
        callback(new Error("字段不能重复"));
      } else {
        callback();
      }
    },

    getDimensionLabel(value) {
      const option = this.dimensionOptions.find(item => item.value === value);
      return option ? option.label : value;
    },

    handleClose() {
      this.visible = false;
    },

    async handleSave() {
      try {
        await this.$refs.splitForm.validate();
      } catch (error) {
        return;
      }

      this.saving = true;

      try {
        // 构建配置对象
        const config = {
          dimension1: this.form.dimension1,
          dimension2: this.form.dimension2 || ""
        };

        // 发射保存事件
        this.$emit("save", config);

        this.$message.success("拆分汇总配置保存成功");
        this.visible = false;
      } catch (error) {
        this.$message.error(error.message || "保存配置失败");
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.split-config-content {
  .config-description {
    display: flex;
    align-items: center;
    gap: @spacing-sm;
    padding: @spacing-md;
    background: @bg-light;
    border-radius: @border-radius-base;
    color: @primary-color;
    font-size: @font-size-base;
    margin-bottom: @spacing-lg;

    i {
      font-size: @font-size-xl;
    }
  }

  .config-preview {
    margin-top: @spacing-lg;
    padding: @spacing-md;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: @border-radius-base;

    .preview-title {
      font-size: @font-size-sm;
      color: @text-secondary;
      margin-bottom: @spacing-sm;
    }

    .preview-content {
      .preview-item {
        display: flex;
        align-items: center;
        gap: @spacing-xs;
        padding: @spacing-sm 0;
        font-size: @font-size-base;
        color: @text-primary;

        i {
          color: @primary-color;
          font-size: @font-size-lg;
        }

        span {
          font-weight: 500;
        }
      }

      .preview-hint {
        margin: @spacing-sm 0 0;
        padding-top: @spacing-sm;
        border-top: 1px dashed #bae6fd;
        font-size: @font-size-sm;
        color: @text-secondary;
        line-height: 1.6;

        strong {
          color: @primary-color;
          font-weight: 600;
        }
      }
    }
  }
}
</style>

