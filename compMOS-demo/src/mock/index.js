/**
 * Mock数据服务入口（重构版）
 * 模拟API响应，用于本地开发和演示
 */

import billsNew from "./billsNew";
import ordersNew from "./ordersNew";
import invoicesNew from "./invoicesNew";

// 存储订单数据的Map
const ordersByBillNo = new Map();

// 初始化订单数据
billsNew.billPackages.forEach(bill => {
  ordersByBillNo.set(
    bill.billNo,
    ordersNew.generateBillOrders(bill.billNo)
  );
});

/**
 * 模拟API响应包装
 */
function mockResponse(data, delay = 300) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        success: true,
        data,
        message: "success"
      });
    }, delay);
  });
}

/**
 * 模拟API错误响应
 */
function mockError(code, message, delay = 300) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject({
        code,
        success: false,
        message,
        data: null
      });
    }, delay);
  });
}

/**
 * Mock API服务
 */
const mockApi = {
  // ==================== 账单相关 ====================

  /**
   * 获取账单列表
   */
  getBillList(params) {
    let bills = [...billsNew.billPackages];

    // 按状态筛选
    if (params.status !== undefined && params.status !== null) {
      bills = bills.filter(b => b.billStatus === params.status);
    }

    // 按日期范围筛选
    if (params.startDate && params.endDate) {
      bills = bills.filter(b => {
        const cycleDate = new Date(b.settlementCycle + "-01");
        const start = new Date(params.startDate);
        const end = new Date(params.endDate);
        return cycleDate >= start && cycleDate <= end;
      });
    }

    // 分页
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return mockResponse({
      list: bills.slice(start, end),
      total: bills.length,
      page,
      pageSize
    });
  },

  /**
   * 获取账单详情
   */
  getBillDetail(billNo) {
    const bill = billsNew.billPackages.find(b => b.billNo === billNo);
    if (!bill) {
      return mockError(10001, "账单不存在");
    }
    
    // 确保订单数据已缓存
    const orders = ordersByBillNo.get(billNo);
    if (orders && typeof window !== 'undefined') {
      if (!window.__ordersCache) {
        window.__ordersCache = new Map();
      }
      window.__ordersCache.set(billNo, orders);
    }

    // 获取账单汇总
    const summary = billsNew.generateBillSummary(billNo);

    return mockResponse({
      ...bill,
      summary
    });
  },

  /**
   * 确认账单
   */
  confirmBill(billNo) {
    const bill = billsNew.billPackages.find(b => b.billNo === billNo);
    if (!bill) {
      return mockError(10001, "账单不存在");
    }

    if (bill.billStatus !== 0) {
      return mockError(10002, "账单状态不允许此操作");
    }

    // 更新账单状态
    bill.billStatus = 2; // 待开票
    bill.confirmedTime = new Date().toISOString();

    // 更新所有订单为已核对
    const orders = ordersByBillNo.get(billNo);
    if (orders) {
      ordersNew.updateOrderCheckStatus(
        orders,
        orders.map(o => o.orderNo),
        1 // 已核对
      );
      
      // 更新缓存
      if (typeof window !== 'undefined') {
        if (!window.__ordersCache) {
          window.__ordersCache = new Map();
        }
        window.__ordersCache.set(billNo, orders);
      }
    }

    return mockResponse({ 
      billNo, 
      status: bill.billStatus,
      confirmTime: bill.confirmedTime
    });
  },

  /**
   * 撤销账单确认
   */
  cancelBillConfirm(billNo) {
    const bill = billsNew.billPackages.find(b => b.billNo === billNo);
    if (!bill) {
      return mockError(10001, "账单不存在");
    }

    if (bill.billStatus !== 2) {
      return mockError(10002, "账单状态不允许撤销");
    }

    // 更新账单状态
    bill.billStatus = 0; // 待确认
    bill.confirmedTime = null;

    // 更新所有订单为未核对
    const orders = ordersByBillNo.get(billNo);
    if (orders) {
      ordersNew.updateOrderCheckStatus(
        orders,
        orders.map(o => o.orderNo),
        0 // 未核对
      );
      
      // 更新缓存
      if (typeof window !== 'undefined') {
        if (!window.__ordersCache) {
          window.__ordersCache = new Map();
        }
        window.__ordersCache.set(billNo, orders);
      }
    }

    return mockResponse({ billNo, status: bill.billStatus });
  },

  /**
   * 获取账单订单列表
   */
  getBillOrders(billNo, params) {
    let orders = ordersByBillNo.get(billNo);
    if (!orders) {
      return mockResponse({ list: [], total: 0 });
    }
    
    // 缓存到全局，供 generateBillSummary 使用
    if (typeof window !== 'undefined') {
      if (!window.__ordersCache) {
        window.__ordersCache = new Map();
      }
      window.__ordersCache.set(billNo, orders);
    }

    // 应用筛选条件
    orders = ordersNew.filterOrders(orders, params);

    // 分页
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return mockResponse({
      list: orders.slice(start, end),
      total: orders.length,
      page,
      pageSize
    });
  },
  
  /**
   * 批量更新订单数据
   */
  batchUpdateOrders({ orderNos, updateData }) {
    // 遍历所有账单的订单
    ordersByBillNo.forEach((orders, billNo) => {
      orders.forEach(order => {
        if (orderNos.includes(order.orderNo)) {
          Object.assign(order, updateData);
        }
      });
      
      // 更新缓存
      if (typeof window !== 'undefined' && window.__ordersCache) {
        window.__ordersCache.set(billNo, orders);
      }
    });
    
    return mockResponse({ 
      success: true, 
      updatedCount: orderNos.length 
    });
  },
  
  /**
   * 更新订单核对状态
   */
  updateOrderCheckStatus({ orderNos, checkStatus }) {
    // 遍历所有账单的订单
    ordersByBillNo.forEach((orders, billNo) => {
      orders.forEach(order => {
        if (orderNos.includes(order.orderNo)) {
          order.checkStatus = checkStatus;
        }
      });
      
      // 更新缓存
      if (typeof window !== 'undefined' && window.__ordersCache) {
        window.__ordersCache.set(billNo, orders);
      }
    });
    
    return mockResponse({ 
      success: true, 
      updatedCount: orderNos.length 
    });
  },

  /**
   * 导出账单Excel
   */
  exportBillExcel(billNo, fields, filters) {
    return mockResponse({
      downloadUrl: `/mock/export/excel/${billNo}`,
      filename: `账单_${billNo}_${Date.now()}.xlsx`
    });
  },

  /**
   * 导出账单PDF
   */
  exportBillPDF(billNo, fields, filters) {
    return mockResponse({
      downloadUrl: `/mock/export/pdf/${billNo}`,
      filename: `账单_${billNo}_${Date.now()}.pdf`
    });
  },

  // ==================== 开票相关 ====================

  /**
   * 获取开票汇总
   */
  getInvoiceSummary(billNo) {
    const bill = billsNew.billPackages.find(b => b.billNo === billNo);
    if (!bill) {
      return mockError(10001, "账单不存在");
    }

    const summary = invoicesNew.generateInvoiceSummary(billNo, bill.totalAmount, bill.billStatus);
    return mockResponse(summary);
  },

  /**
   * 提交开票申请
   */
  applyInvoice(data) {
    const { billNo } = data;
    const bill = billsNew.billPackages.find(b => b.billNo === billNo);
    if (!bill) {
      return mockError(10001, "账单不存在");
    }

    if (bill.billStatus !== 2) {
      return mockError(10007, "账单尚未确认，无法开票");
    }

    // 更新账单状态
    bill.billStatus = 3; // 待付款
    bill.invoicedAmount = bill.totalAmount;
    bill.pendingInvoiceAmount = 0;
    bill.invoicedTime = new Date().toISOString();

    return mockResponse({
      applicationId: "APP" + Date.now(),
      billNo,
      status: 1 // 开票中
    });
  },

  /**
   * 获取开票申请记录
   */
  getInvoiceApplications(billNo) {
    const applications = invoicesNew.generateInvoiceApplications(billNo);
    return mockResponse({
      list: applications,
      total: applications.length
    });
  },

  /**
   * 获取发票列表
   */
  getInvoiceList(billNo) {
    const invoices = invoicesNew.generateInvoiceList(billNo);
    return mockResponse({
      list: invoices,
      total: invoices.length
    });
  },

  /**
   * 获取发票抬头列表
   */
  getInvoiceTitles() {
    const titles = invoicesNew.generateInvoiceTitles();
    return mockResponse({
      list: titles,
      total: titles.length
    });
  },

  /**
   * 生成开票信息行（根据拆分配置）
   */
  generateInvoiceRows(billNo, splitConfig) {
    const bill = billsNew.billPackages.find(b => b.billNo === billNo);
    if (!bill) {
      return mockError(10001, "账单不存在");
    }

    // 获取拆分维度
    const dimensions = [];
    if (splitConfig && splitConfig.dimensions) {
      dimensions.push(...splitConfig.dimensions);
    } else if (splitConfig && splitConfig.dimension1) {
      dimensions.push(splitConfig.dimension1);
      if (splitConfig.dimension2) {
        dimensions.push(splitConfig.dimension2);
      }
    }

    // 使用invoicesNew中的方法生成开票行
    const invoiceRows = invoicesNew.generateInvoiceTable(billNo, dimensions);
    return mockResponse(invoiceRows);
  },

  /**
   * 下载发票
   */
  downloadInvoice(invoiceId) {
    return mockResponse({
      downloadUrl: `/mock/download/invoice/${invoiceId}`,
      filename: `发票_${invoiceId}.pdf`
    });
  },

  // ==================== 配置相关 ====================

  /**
   * 获取明细设置
   */
  getDetailSettings() {
    return mockResponse({
      enabled: false,
      dimensions: [],
      hierarchyOrder: []
    });
  },

  /**
   * 更新明细设置
   */
  updateDetailSettings(data) {
    return mockResponse(data);
  },

  /**
   * 获取字段配置
   */
  getFieldConfig() {
    const config = billsNew.generateFieldConfig();
    return mockResponse(config);
  },

  /**
   * 更新字段配置
   */
  updateFieldConfig(data) {
    return mockResponse(data);
  },

  /**
   * 获取可用字段选项
   */
  getAvailableFields() {
    const fields = billsNew.generateAvailableFields();
    return mockResponse(fields);
  },

  /**
   * 导出账单PDF
   * @param {Object} params 导出参数
   * @param {String} params.billNo 账单号
   * @param {String} params.businessType 业务类型
   * @param {Array} params.fields PDF导出字段
   * @param {Array} params.orderIds 订单ID列表
   */
  exportBillToPDF(params) {
    const { billNo, businessType, fields, orderIds } = params;
    
    // 验证字段数量
    if (fields && fields.length > 20) {
      return mockError(400, "PDF导出字段不能超过20个");
    }
    
    // 模拟PDF生成
    const timestamp = new Date().getTime();
    const pdfUrl = `/mock/pdf/bill_${billNo}_${businessType}_${timestamp}.pdf`;
    
    return mockResponse({
      pdfUrl,
      fileName: `账单${billNo}_明细.pdf`,
      fileSize: 1024 * 512, // 512KB
      generatedAt: new Date().toISOString(),
      orderCount: orderIds ? orderIds.length : 0,
      fieldCount: fields ? fields.length : 0
    }, 1000); // PDF生成需要更长时间
  }
};

export default mockApi;

