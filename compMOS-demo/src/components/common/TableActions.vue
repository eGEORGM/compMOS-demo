<template>
  <div class="table-actions">
    <div class="table-actions-left">
      <slot name="left"></slot>
    </div>
    <div class="table-actions-right">
      <slot name="right"></slot>
      
      <!-- 默认操作按钮 -->
      <el-button
        v-if="showRefresh"
        icon="el-icon-refresh"
        size="small"
        @click="handleRefresh"
      >
        刷新
      </el-button>
      
      <el-button
        v-if="showExport"
        icon="el-icon-download"
        size="small"
        @click="handleExport"
      >
        导出
      </el-button>
      
      <el-dropdown v-if="showMore" trigger="click" @command="handleCommand">
        <el-button icon="el-icon-more" size="small"></el-button>
        <el-dropdown-menu slot="dropdown">
          <slot name="dropdown"></slot>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
export default {
  name: "TableActions",
  props: {
    // 是否显示刷新按钮
    showRefresh: {
      type: Boolean,
      default: false
    },
    // 是否显示导出按钮
    showExport: {
      type: Boolean,
      default: false
    },
    // 是否显示更多按钮
    showMore: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleRefresh() {
      this.$emit("refresh");
    },
    handleExport() {
      this.$emit("export");
    },
    handleCommand(command) {
      this.$emit("command", command);
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.table-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: @spacing-md 0;
  margin-bottom: @spacing-sm;

  .table-actions-left {
    display: flex;
    align-items: center;
    gap: @spacing-sm;
  }

  .table-actions-right {
    display: flex;
    align-items: center;
    gap: @spacing-sm;
  }
}
</style>

