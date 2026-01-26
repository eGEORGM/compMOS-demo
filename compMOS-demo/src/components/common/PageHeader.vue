<template>
  <div class="page-header">
    <div class="page-header-left">
      <el-button v-if="showBack" icon="el-icon-arrow-left" type="text" @click="handleBack"> 返回 </el-button>
      <h2 class="page-title">{{ title }}</h2>
    </div>
    <div class="page-header-right">
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "PageHeader",
  props: {
    title: {
      type: String,
      required: true
    },
    showBack: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleBack() {
      this.$emit("back");
      // 如果没有监听back事件，则使用浏览器返回
      if (!this.$listeners.back) {
        this.$router.back();
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: @spacing-md 0;
  margin-bottom: @spacing-lg;
  border-bottom: 1px solid @border-base;

  .page-header-left {
    display: flex;
    align-items: center;
    gap: @spacing-sm;
  }

  .page-title {
    font-size: @font-size-xl;
    font-weight: 600;
    color: @text-primary;
    margin: 0;
  }

  .page-header-right {
    display: flex;
    align-items: center;
    gap: @spacing-sm;
  }
}
</style>

