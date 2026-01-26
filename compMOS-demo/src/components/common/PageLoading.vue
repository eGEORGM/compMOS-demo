<template>
  <div class="page-loading">
    <div class="loading-content">
      <div class="spinner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </div>
      <p v-if="text" class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "PageLoading",
  props: {
    text: {
      type: String,
      default: "加载中..."
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.page-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  width: 100%;

  .loading-content {
    text-align: center;

    .spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-bottom: @spacing-md;

      > div {
        width: 12px;
        height: 12px;
        background-color: @primary-color;
        border-radius: 100%;
        display: inline-block;
        animation: sk-bouncedelay 1.4s infinite ease-in-out both;
      }

      .bounce1 {
        animation-delay: -0.32s;
      }

      .bounce2 {
        animation-delay: -0.16s;
      }
    }

    .loading-text {
      color: @text-secondary;
      font-size: @font-size-base;
      margin: 0;
    }
  }
}

@keyframes sk-bouncedelay {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.3;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

