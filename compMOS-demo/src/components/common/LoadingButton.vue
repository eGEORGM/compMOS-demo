<template>
  <el-button
    :type="type"
    :size="size"
    :icon="computedIcon"
    :loading="loading"
    :disabled="disabled || loading"
    :plain="plain"
    :round="round"
    :circle="circle"
    @click="handleClick"
  >
    <slot></slot>
  </el-button>
</template>

<script>
export default {
  name: "LoadingButton",
  props: {
    type: {
      type: String,
      default: "primary"
    },
    size: {
      type: String,
      default: "medium"
    },
    icon: {
      type: String,
      default: ""
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    plain: {
      type: Boolean,
      default: false
    },
    round: {
      type: Boolean,
      default: false
    },
    circle: {
      type: Boolean,
      default: false
    },
    // 点击后自动显示loading的持续时间（毫秒），0表示不自动loading
    autoLoadingDuration: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      isAutoLoading: false
    };
  },
  computed: {
    computedIcon() {
      if (this.loading) {
        return "";
      }
      return this.icon;
    }
  },
  methods: {
    handleClick(event) {
      if (this.loading || this.disabled) {
        return;
      }

      this.$emit("click", event);

      // 自动loading
      if (this.autoLoadingDuration > 0 && !this.loading) {
        this.isAutoLoading = true;
        this.$emit("update:loading", true);

        setTimeout(() => {
          this.isAutoLoading = false;
          this.$emit("update:loading", false);
          this.$emit("loading-complete");
        }, this.autoLoadingDuration);
      }
    }
  }
};
</script>

