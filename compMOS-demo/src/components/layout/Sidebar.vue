<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h1 class="logo">企业结算平台</h1>
      <p class="logo-subtitle">Demo演示</p>
    </div>

    <el-menu :default-active="activeMenu" :router="true" class="sidebar-menu">
      <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path" :route="{ path: item.path }">
        <i :class="item.icon"></i>
        <span slot="title">{{ item.title }}</span>
      </el-menu-item>
    </el-menu>

    <div class="sidebar-footer">
      <el-divider></el-divider>
      <div class="user-switch">
        <div class="user-switch-label">演示用户切换</div>
        <el-radio-group v-model="userType" size="small" @change="handleUserTypeChange">
          <el-radio-button :label="1">预存企业</el-radio-button>
          <el-radio-button :label="2">授信企业</el-radio-button>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>

<script>
import { ACCOUNT_TYPE } from "@/utils/constants";
import { saveUserType, getUserType } from "@/utils/storage";
import { switchUser } from "@/mock/users";

export default {
  name: "Sidebar",
  data() {
    return {
      menuItems: [
        {
          path: "/bills",
          title: "账单列表",
          icon: "el-icon-document"
        },
        {
          path: "/invoices/batches",
          title: "开票批次",
          icon: "el-icon-tickets"
        }
      ],
      userType: ACCOUNT_TYPE.PREPAID // 默认预存企业
    };
  },
  computed: {
    activeMenu() {
      // 根据当前路由激活菜单项
      const path = this.$route.path;
      if (path.startsWith("/bills")) {
        return "/bills";
      } else if (path.startsWith("/invoices")) {
        return "/invoices/batches";
      }
      return path;
    }
  },
  mounted() {
    // 从localStorage加载用户类型
    this.userType = getUserType();
    switchUser(this.userType);
  },
  methods: {
    handleUserTypeChange(value) {
      // 保存用户类型
      saveUserType(value);
      switchUser(value);

      // 提示用户
      const typeName = value === ACCOUNT_TYPE.PREPAID ? "预存企业" : "授信企业";
      this.$message.success(`已切换到${typeName}用户`);

      // 刷新当前页面（简化demo，直接刷新）
      this.$router.go(0);
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/styles/variables.less";

.sidebar {
  width: @sidebar-width;
  height: 100vh;
  background: #001529;
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;

  .sidebar-header {
    padding: @spacing-lg;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .logo {
      font-size: @font-size-lg;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .logo-subtitle {
      font-size: @font-size-xs;
      color: rgba(255, 255, 255, 0.65);
      margin: @spacing-xs 0 0 0;
    }
  }

  .sidebar-menu {
    flex: 1;
    border: none;
    background: transparent;

    /deep/ .el-menu-item {
      color: rgba(255, 255, 255, 0.85);

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }

      &.is-active {
        background: @primary-color;
        color: #fff;
      }

      i {
        color: inherit;
      }
    }
  }

  .sidebar-footer {
    padding: @spacing-md;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    .user-switch {
      .user-switch-label {
        font-size: @font-size-xs;
        color: rgba(255, 255, 255, 0.65);
        margin-bottom: @spacing-sm;
      }

      /deep/ .el-radio-group {
        display: flex;
        flex-direction: column;
        gap: @spacing-xs;

        .el-radio-button {
          flex: 1;

          .el-radio-button__inner {
            width: 100%;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: transparent;
            color: rgba(255, 255, 255, 0.85);

            &:hover {
              border-color: @primary-color;
              color: @primary-color;
            }
          }

          &.is-active .el-radio-button__inner {
            background: @primary-color;
            border-color: @primary-color;
            color: #fff;
          }
        }
      }
    }
  }
}
</style>

