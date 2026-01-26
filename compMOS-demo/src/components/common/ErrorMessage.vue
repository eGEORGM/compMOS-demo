<template>
  <div class="error-message-container">
    <div class="error-content">
      <i class="el-icon-warning error-icon"></i>
      <div class="error-details">
        <p class="error-title">{{ title }}</p>
        <p v-if="message" class="error-message">{{ message }}</p>
      </div>
      <div v-if="showRetry" class="error-actions">
        <el-button size="small" type="primary" @click="handleRetry">
          <i class="el-icon-refresh"></i>
          重试
        </el-button>
        <el-button v-if="showContact" size="small" @click="handleContact">
          <i class="el-icon-service"></i>
          联系管理员
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ErrorMessage",
  props: {
    title: {
      type: String,
      default: "操作失败"
    },
    message: {
      type: String,
      default: ""
    },
    showRetry: {
      type: Boolean,
      default: true
    },
    showContact: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleRetry() {
      this.$emit("retry");
    },
    handleContact() {
      this.$message.info("请联系系统管理员：support@example.com");
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.error-message-container {
  padding: @spacing-xl;
  background-color: lighten(@danger-color, 45%);
  border: 1px solid lighten(@danger-color, 30%);
  border-radius: @radius-md;
  margin: @spacing-md 0;

  .error-content {
    display: flex;
    align-items: flex-start;
    gap: @spacing-md;

    .error-icon {
      font-size: 24px;
      color: @danger-color;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .error-details {
      flex: 1;

      .error-title {
        font-size: @font-size-lg;
        font-weight: 600;
        color: @danger-color;
        margin: 0 0 @spacing-xs;
      }

      .error-message {
        font-size: @font-size-base;
        color: @text-regular;
        margin: 0;
        line-height: 1.6;
      }
    }

    .error-actions {
      display: flex;
      gap: @spacing-sm;
      flex-shrink: 0;
    }
  }
}
</style>

