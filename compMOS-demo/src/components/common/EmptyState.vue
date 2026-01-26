<template>
  <div class="empty-state">
    <div class="empty-content">
      <i :class="iconClass" class="empty-icon"></i>
      <p class="empty-text">{{ text }}</p>
      <p v-if="description" class="empty-description">{{ description }}</p>
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "EmptyState",
  props: {
    icon: {
      type: String,
      default: "el-icon-document"
    },
    text: {
      type: String,
      default: "暂无数据"
    },
    description: {
      type: String,
      default: ""
    }
  },
  computed: {
    iconClass() {
      return this.icon;
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  width: 100%;
  padding: @spacing-xl;

  .empty-content {
    text-align: center;
    max-width: 400px;

    .empty-icon {
      font-size: 80px;
      color: @text-placeholder;
      margin-bottom: @spacing-lg;
      display: block;
      opacity: 0.6;
    }

    .empty-text {
      font-size: @font-size-lg;
      color: @text-regular;
      font-weight: 500;
      margin: 0 0 @spacing-sm;
    }

    .empty-description {
      font-size: @font-size-base;
      color: @text-secondary;
      margin: 0 0 @spacing-lg;
      line-height: 1.6;
    }
  }
}
</style>
