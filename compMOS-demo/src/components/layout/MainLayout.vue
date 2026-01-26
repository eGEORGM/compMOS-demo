<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <div class="main-layout-header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-text">企业结算平台</span>
        </div>
      </div>
      <div class="header-right">
        <!-- 用户信息区域 -->
        <el-dropdown trigger="click">
          <div class="user-info">
            <i class="el-icon-user-solid"></i>
            <span class="username">{{ companyName }}</span>
            <i class="el-icon-arrow-down"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>企业信息</el-dropdown-item>
            <el-dropdown-item divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <div class="main-content-header">
        <Breadcrumb />
      </div>
      <div class="main-content-body">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumb from "./Breadcrumb.vue";

export default {
  name: "MainLayout",
  components: {
    Breadcrumb
  },
  computed: {
    companyName() {
      // TODO: 从Vuex获取实际的企业名称
      return "示例科技有限公司";
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: @bg-light;

  // 顶部导航栏
  .main-layout-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    background: @primary-color;
    padding: 0 @spacing-xl;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;

    .header-left {
      display: flex;
      align-items: center;

      .logo {
        display: flex;
        align-items: center;

        .logo-text {
          font-size: 20px;
          font-weight: 600;
          color: @text-white;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;

      .user-info {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        cursor: pointer;
        color: @text-white;
        border-radius: 4px;
        transition: background-color 0.2s;

        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        i {
          margin-right: 8px;
          font-size: 16px;

          &.el-icon-arrow-down {
            margin-right: 0;
            margin-left: 4px;
            font-size: 12px;
          }
        }

        .username {
          font-size: 14px;
        }
      }
    }
  }

  // 主内容区域
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 60px);

    .main-content-header {
      background: @bg-white;
      padding: 0 @spacing-lg;
      border-bottom: 1px solid @border-base;
    }

    .main-content-body {
      flex: 1;
      padding: @spacing-lg;
      overflow-y: auto;
    }
  }
}
</style>

