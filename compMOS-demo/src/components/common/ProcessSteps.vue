<template>
  <div class="process-steps">
    <el-steps :active="activeStep" :process-status="processStatus" :align-center="alignCenter">
      <el-step
        v-for="(step, index) in steps"
        :key="index"
        :title="step.title"
        :description="step.description"
        :icon="step.icon"
      ></el-step>
    </el-steps>
  </div>
</template>

<script>
export default {
  name: "ProcessSteps",
  props: {
    // 当前激活的步骤（从0开始）
    activeStep: {
      type: Number,
      required: true,
      default: 0
    },
    // 步骤配置数组
    steps: {
      type: Array,
      required: true,
      default: () => []
    },
    // 当前步骤的状态：wait / process / finish / error / success
    processStatus: {
      type: String,
      default: "process",
      validator: value => ["wait", "process", "finish", "error", "success"].includes(value)
    },
    // 是否居中对齐
    alignCenter: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.process-steps {
  background: @bg-white;
  padding: @spacing-xl @spacing-xxl;
  border-radius: @border-radius-base;
  margin-bottom: @spacing-lg;

  /deep/ .el-step__title {
    font-size: @font-size-base;
  }

  /deep/ .el-step__description {
    font-size: @font-size-sm;
  }
}
</style>

