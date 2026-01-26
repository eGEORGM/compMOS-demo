<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    :show-close="true"
    @close="handleClose"
  >
    <div class="confirm-dialog-content">
      <i v-if="showIcon" :class="iconClass" class="confirm-icon"></i>
      <div class="confirm-message">
        <slot>
          <p>{{ message }}</p>
        </slot>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{ cancelText }}</el-button>
      <el-button :type="confirmType" :loading="loading" @click="handleConfirm">
        {{ confirmText }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: "ConfirmDialog",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "确认提示"
    },
    message: {
      type: String,
      default: "确定要执行此操作吗？"
    },
    confirmText: {
      type: String,
      default: "确定"
    },
    cancelText: {
      type: String,
      default: "取消"
    },
    confirmType: {
      type: String,
      default: "primary"
    },
    width: {
      type: String,
      default: "400px"
    },
    showIcon: {
      type: Boolean,
      default: true
    },
    // 图标类型：warning, success, error, info
    iconType: {
      type: String,
      default: "warning",
      validator: (value) => ["warning", "success", "error", "info"].includes(value)
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      }
    },
    iconClass() {
      const iconMap = {
        warning: "el-icon-warning",
        success: "el-icon-success",
        error: "el-icon-error",
        info: "el-icon-info"
      };
      return iconMap[this.iconType];
    }
  },
  methods: {
    handleConfirm() {
      this.$emit("confirm");
    },
    handleCancel() {
      this.dialogVisible = false;
      this.$emit("cancel");
    },
    handleClose() {
      this.$emit("close");
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.confirm-dialog-content {
  display: flex;
  align-items: flex-start;
  gap: @spacing-md;
  padding: @spacing-md 0;

  .confirm-icon {
    font-size: 24px;
    flex-shrink: 0;

    &.el-icon-warning {
      color: @warning-color;
    }

    &.el-icon-success {
      color: @success-color;
    }

    &.el-icon-error {
      color: @danger-color;
    }

    &.el-icon-info {
      color: @info-color;
    }
  }

  .confirm-message {
    flex: 1;
    color: @text-regular;
    line-height: 1.6;

    p {
      margin: 0;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: @spacing-sm;
}
</style>

