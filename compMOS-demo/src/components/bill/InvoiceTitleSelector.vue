<template>
  <el-select
    :value="value"
    placeholder="请选择发票抬头"
    :size="size"
    @change="handleChange"
  >
    <el-option
      v-for="title in titles"
      :key="title.titleId"
      :label="formatTitleLabel(title)"
      :value="title.titleId"
    >
      <div class="title-option">
        <div class="title-main">
          <span class="title-name">{{ title.titleName }}</span>
          <el-tag v-if="title.isDefault" type="success" size="mini">默认</el-tag>
        </div>
        <div class="title-info">
          税号：{{ title.taxNumber }}
        </div>
      </div>
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: "InvoiceTitleSelector",
  props: {
    value: {
      type: String,
      default: ""
    },
    titles: {
      type: Array,
      default: () => []
    },
    size: {
      type: String,
      default: "medium"
    }
  },
  methods: {
    formatTitleLabel(title) {
      return `${title.titleName} (${title.taxNumber})`;
    },
    
    handleChange(titleId) {
      const selectedTitle = this.titles.find(t => t.titleId === titleId);
      this.$emit("input", titleId);
      this.$emit("change", selectedTitle);
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.title-option {
  .title-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: @spacing-xs;

    .title-name {
      font-weight: 600;
      color: @text-primary;
    }
  }

  .title-info {
    font-size: @font-size-sm;
    color: @text-secondary;
  }
}
</style>

