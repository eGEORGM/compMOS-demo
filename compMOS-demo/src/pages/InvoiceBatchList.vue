<template>
  <div class="invoice-batch-list-page">
    <PageHeader title="开票批次" />
    <div class="page-content">
      <p>开票批次列表页面 - Phase 4 将实现完整功能</p>
    </div>
  </div>
</template>

<script>
import PageHeader from "@/components/common/PageHeader.vue";

export default {
  name: "InvoiceBatchList",
  components: {
    PageHeader
  }
};
</script>

<style lang="less" scoped>
.invoice-batch-list-page {
  .page-content {
    background: white;
    padding: 24px;
    border-radius: 8px;
  }
}
</style>

