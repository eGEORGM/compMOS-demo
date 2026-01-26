/**
 * 路由配置
 * Hash模式，本地demo无需history模式
 */
import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

// 路由配置
const routes = [
  {
    path: "/",
    name: "BillList",
    component: () => import(/* webpackChunkName: "bills" */ "@/pages/BillList.vue"),
    meta: {
      title: "账单列表",
      icon: "el-icon-document"
    }
  },
  {
    path: "/bills/:billNo",
    name: "BillDetail",
    component: () => import(/* webpackChunkName: "bills" */ "@/pages/BillDetail.vue"),
    meta: {
      title: "账单详情",
      parent: "BillList"
    }
  },
  {
    path: "/bills/:billNo/invoice/apply",
    name: "InvoiceApply",
    component: () => import(/* webpackChunkName: "invoice" */ "@/pages/InvoiceApply.vue"),
    meta: {
      title: "填写开票信息",
      parent: "BillDetail"
    }
  },
  {
    path: "*",
    redirect: "/"
  }
];

// 创建路由实例
const router = new VueRouter({
  mode: "hash", // 本地demo使用hash模式
  routes
});

// 路由守卫（简化版，demo不需要复杂的权限控制）
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta && to.meta.title) {
    document.title = `${to.meta.title} - 企业结算平台Demo`;
  } else {
    document.title = "企业结算平台Demo";
  }

  next();
});

// 路由错误处理
router.onError((error) => {
  console.error("[Router] 路由错误:", error);
});

export default router;

