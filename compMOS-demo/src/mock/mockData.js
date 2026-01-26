/**
 * Mock数据主入口
 * 整合所有Mock数据并提供全局访问接口
 */

// 导入所有Mock数据模块
import { mockBills, getBills, getBillByNo, updateBillStatus } from "./bills";
import {
  mockOrders,
  getOrdersByBillNo,
  updateOrderCheckStatus,
  batchUpdateOrderCheckStatus,
  getCheckedOrderCount,
  batchUpdateOrderFields
} from "./orders";
import {
  mockInvoiceBatches,
  mockInvoices,
  getInvoiceBatches,
  getBatchesByBillNo,
  getBatchByNo,
  getInvoicesByBatchNo,
  createInvoiceBatch,
  INVOICE_TYPES,
  INVOICE_TYPE_NAMES
} from "./invoices";
import {
  mockUsers,
  getCurrentUser,
  switchUser,
  getUserById,
  getUserInvoiceInfo,
  getUserAddresses,
  getDefaultAddress
} from "./users";

// 将所有Mock数据挂载到window对象，方便调试和访问
if (typeof window !== "undefined") {
  window.__MOCK_DATA__ = {
    bills: mockBills,
    orders: mockOrders,
    invoices: mockInvoices,
    invoiceBatches: mockInvoiceBatches,
    users: mockUsers,
    // API方法
    api: {
      // 账单相关
      getBills,
      getBillByNo,
      updateBillStatus,
      // 订单相关
      getOrdersByBillNo,
      updateOrderCheckStatus,
      batchUpdateOrderCheckStatus,
      getCheckedOrderCount,
      batchUpdateOrderFields,
      // 发票相关
      getInvoiceBatches,
      getBatchesByBillNo,
      getBatchByNo,
      getInvoicesByBatchNo,
      createInvoiceBatch,
      // 用户相关
      getCurrentUser,
      switchUser,
      getUserById,
      getUserInvoiceInfo,
      getUserAddresses,
      getDefaultAddress
    }
  };

  console.log("[Mock] Mock数据已初始化 ✅");
  console.log("[Mock] 可通过 window.__MOCK_DATA__ 访问所有数据");
  console.log("[Mock] 数据统计：");
  console.log(`  - 账单包: ${mockBills.length}个`);
  console.log(`  - 订单: ${Object.keys(mockOrders).reduce((sum, key) => sum + mockOrders[key].length, 0)}条`);
  console.log(`  - 发票批次: ${mockInvoiceBatches.length}个`);
  console.log(`  - 发票: ${Object.keys(mockInvoices).reduce((sum, key) => sum + mockInvoices[key].length, 0)}张`);
  console.log(`  - 用户: ${mockUsers.length}个`);
}

// 导出所有API
export default {
  // 数据
  bills: mockBills,
  orders: mockOrders,
  invoices: mockInvoices,
  invoiceBatches: mockInvoiceBatches,
  users: mockUsers,
  // 常量
  INVOICE_TYPES,
  INVOICE_TYPE_NAMES,
  // API方法
  getBills,
  getBillByNo,
  updateBillStatus,
  getOrdersByBillNo,
  updateOrderCheckStatus,
  batchUpdateOrderCheckStatus,
  getCheckedOrderCount,
  batchUpdateOrderFields,
  getInvoiceBatches,
  getBatchesByBillNo,
  getBatchByNo,
  getInvoicesByBatchNo,
  createInvoiceBatch,
  getCurrentUser,
  switchUser,
  getUserById,
  getUserInvoiceInfo,
  getUserAddresses,
  getDefaultAddress
};

