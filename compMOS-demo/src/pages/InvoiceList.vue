<template>
  <div class="invoice-list-page">
    <PageHeader title="发票列表" :show-back="true" />
    <div class="page-content">
      <p>发票列表页面 - Phase 4 将实现完整功能</p>
    </div>
  </div>
</template>

<script>
import PageHeader from "@/components/common/PageHeader.vue";

export default {
  name: "InvoiceList",
  components: {
    PageHeader
  }
};
</script>

<style lang="less" scoped>
.invoice-list-page {
  .page-content {
    background: white;
    padding: 24px;
    border-radius: 4px;
  }
}
</style>

