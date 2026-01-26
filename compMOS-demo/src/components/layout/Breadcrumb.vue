<template>
  <el-breadcrumb separator="/" class="breadcrumb">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index" :to="item.path">
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
export default {
  name: "Breadcrumb",
  computed: {
    breadcrumbItems() {
      const matched = this.$route.matched.filter((item) => item.meta && item.meta.title);
      const items = [];

      // 添加首页
      items.push({
        path: "/",
        title: "首页"
      });

      // 根据路由meta信息构建面包屑
      matched.forEach((route) => {
        if (route.meta && route.meta.title) {
          items.push({
            path: route.path,
            title: route.meta.title
          });
        }
      });

      // 如果当前页面有父级页面，确保父级在面包屑中
      const currentMeta = this.$route.meta;
      if (currentMeta && currentMeta.parent) {
        const parentRoute = this.$router.options.routes.find((r) => r.name === currentMeta.parent);
        if (parentRoute && parentRoute.meta) {
          const parentExists = items.some((item) => item.path === parentRoute.path);
          if (!parentExists) {
            items.splice(items.length - 1, 0, {
              path: parentRoute.path,
              title: parentRoute.meta.title
            });
          }
        }
      }

      return items;
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.breadcrumb {
  padding: @spacing-sm 0;
  font-size: @font-size-sm;

  /deep/ .el-breadcrumb__item {
    .el-breadcrumb__inner {
      color: @text-secondary;
      font-weight: normal;

      &:hover {
        color: @primary-color;
      }

      &.is-link {
        cursor: pointer;
      }
    }

    &:last-child .el-breadcrumb__inner {
      color: @text-regular;
      font-weight: 500;
    }
  }
}
</style>

