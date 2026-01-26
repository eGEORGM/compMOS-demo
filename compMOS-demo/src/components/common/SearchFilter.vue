<template>
  <div class="search-filter">
    <el-form :model="filterForm" :inline="true" size="medium">
      <slot name="filters"></slot>
      
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">
          查询
        </el-button>
        <el-button icon="el-icon-refresh-left" @click="handleReset">
          重置
        </el-button>
        <el-button
          v-if="collapsible && hasExtendedFilters"
          type="text"
          @click="toggleExtended"
        >
          {{ isExtended ? "收起" : "展开" }}
          <i :class="isExtended ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 扩展筛选区域 -->
    <el-collapse-transition>
      <div v-if="isExtended && hasExtendedFilters" class="extended-filters">
        <el-form :model="filterForm" :inline="true" size="medium">
          <slot name="extended"></slot>
        </el-form>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script>
export default {
  name: "SearchFilter",
  props: {
    // 表单数据
    filterForm: {
      type: Object,
      required: true
    },
    // 是否可折叠
    collapsible: {
      type: Boolean,
      default: false
    },
    // 是否默认展开
    defaultExpanded: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isExtended: this.defaultExpanded
    };
  },
  computed: {
    hasExtendedFilters() {
      return !!this.$slots.extended;
    }
  },
  methods: {
    handleSearch() {
      this.$emit("search", this.filterForm);
    },
    handleReset() {
      this.$emit("reset");
    },
    toggleExtended() {
      this.isExtended = !this.isExtended;
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.search-filter {
  background: @bg-white;
  padding: @spacing-lg;
  border-radius: @border-radius-base;
  margin-bottom: @spacing-md;

  .extended-filters {
    margin-top: @spacing-md;
    padding-top: @spacing-md;
    border-top: 1px dashed @border-base;
  }

  /deep/ .el-form-item {
    margin-bottom: 0;
  }
}
</style>

