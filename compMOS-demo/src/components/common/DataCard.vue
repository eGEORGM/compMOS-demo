<template>
  <div class="data-card" :class="cardClass">
    <div v-if="title" class="data-card-header">
      <div class="data-card-title">
        <i v-if="icon" :class="icon" class="title-icon"></i>
        <span>{{ title }}</span>
      </div>
      <div v-if="$slots.extra" class="data-card-extra">
        <slot name="extra"></slot>
      </div>
    </div>
    <div class="data-card-body" :class="bodyClass">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="data-card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "DataCard",
  props: {
    // 标题
    title: {
      type: String,
      default: ""
    },
    // 图标
    icon: {
      type: String,
      default: ""
    },
    // 是否可折叠
    collapsible: {
      type: Boolean,
      default: false
    },
    // 是否默认折叠
    collapsed: {
      type: Boolean,
      default: false
    },
    // 卡片样式类型
    type: {
      type: String,
      default: "default", // default, primary, info, warning, danger
      validator: value => ["default", "primary", "info", "warning", "danger"].includes(value)
    },
    // 无内边距
    noPadding: {
      type: Boolean,
      default: false
    },
    // 无阴影
    noShadow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isCollapsed: this.collapsed
    };
  },
  computed: {
    cardClass() {
      return {
        [`data-card--${this.type}`]: this.type !== "default",
        "data-card--collapsed": this.isCollapsed,
        "data-card--no-shadow": this.noShadow
      };
    },
    bodyClass() {
      return {
        "data-card-body--no-padding": this.noPadding,
        "data-card-body--hidden": this.isCollapsed
      };
    }
  },
  watch: {
    collapsed(val) {
      this.isCollapsed = val;
    }
  },
  methods: {
    toggleCollapse() {
      if (!this.collapsible) return;
      this.isCollapsed = !this.isCollapsed;
      this.$emit("toggle", this.isCollapsed);
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.data-card {
  background: @bg-white;
  border-radius: @border-radius-base;
  box-shadow: @shadow-base;
  transition: all 0.3s;
  margin-bottom: @spacing-md;

  &:hover {
    box-shadow: @shadow-hover;
  }

  &--no-shadow {
    box-shadow: none;
    border: 1px solid @border-base;

    &:hover {
      box-shadow: none;
    }
  }

  &--primary {
    border-left: 3px solid @primary-color;
  }

  &--info {
    border-left: 3px solid @info-color;
  }

  &--warning {
    border-left: 3px solid @warning-color;
  }

  &--danger {
    border-left: 3px solid @danger-color;
  }

  .data-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: @spacing-md @spacing-lg;
    border-bottom: 1px solid @border-light;

    .data-card-title {
      display: flex;
      align-items: center;
      font-size: @font-size-lg;
      font-weight: 600;
      color: @text-primary;

      .title-icon {
        margin-right: @spacing-sm;
        font-size: @font-size-xl;
      }
    }

    .data-card-extra {
      display: flex;
      align-items: center;
    }
  }

  .data-card-body {
    padding: @spacing-lg;

    &--no-padding {
      padding: 0;
    }

    &--hidden {
      display: none;
    }
  }

  .data-card-footer {
    padding: @spacing-md @spacing-lg;
    border-top: 1px solid @border-light;
    background: @bg-light;
  }
}
</style>

