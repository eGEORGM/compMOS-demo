/**
 * Mock数据服务入口（重构版）
 * 模拟API响应，用于本地开发和演示
 */

import billsNew from "./billsNew";
import ordersNew from "./ordersNew";
import invoicesNew from "./invoicesNew";

// 存储订单数据的Map
const ordersByBillNo = new Map();

// 存储开票行数据的Map（从开票信息表生成，用于数据流转）
const invoiceRowsByBillNo = new Map();

// 存储开票申请记录的Map（用于保持数据一致性）
const invoiceApplicationsByBillNo = new Map();

// 存储开票汇总数据的Map（用于保持数据一致性）
const invoiceSummaryByBillNo = new Map();

// 初始化订单数据
billsNew.billPackages.forEach(bill => {
  ordersByBillNo.set(
    bill.billNo,
    ordersNew.generateBillOrders(bill.billNo)
  );
});

/**
 * 根据开票行数据生成开票汇总
 */
function generateInvoiceSummaryFromRows(billNo, invoiceRows, totalAmount) {
  // 按发票种类汇总
  const invoiceTypeMap = {};
  
  invoiceRows.forEach(row => {
    const typeName = row.invoiceType || row.invoiceTypeName || '其他';
    if (!invoiceTypeMap[typeName]) {
      invoiceTypeMap[typeName] = {
        type: typeName,
        summary: row.summary || row.invoiceSummary || typeName,
        shouldAmount: 0,
        invoicedAmount: 0,
        remainingAmount: 0,
        orderCount: 0
      };
    }
    invoiceTypeMap[typeName].shouldAmount += row.amount || 0;
    invoiceTypeMap[typeName].remainingAmount += row.amount || 0;
    invoiceTypeMap[typeName].orderCount += row.orderCount || 0;
  });
  
  const invoiceDetails = Object.values(invoiceTypeMap);
  const shouldInvoiceAmount = invoiceDetails.reduce((sum, item) => sum + item.shouldAmount, 0);
  
  return {
    billNo,
    shouldInvoiceAmount: parseFloat(shouldInvoiceAmount.toFixed(2)),
    invoicedAmount: 0,
    remainingAmount: parseFloat(shouldInvoiceAmount.toFixed(2)),
    invoiceDetails
  };
}

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

    // 返回深拷贝的数据，避免直接引用导致 Vuex 警告
    return mockResponse(JSON.parse(JSON.stringify({
      ...bill,
      summary
    })));
  },

  /**
   * 确认账单
   */
  confirmBill(billNo) {
    const billIndex = billsNew.billPackages.findIndex(b => b.billNo === billNo);
    if (billIndex === -1) {
      return mockError(10001, "账单不存在");
    }
    
    const bill = billsNew.billPackages[billIndex];
    if (bill.billStatus !== 0) {
      return mockError(10002, "账单状态不允许此操作");
    }

    // 创建新对象并更新账单状态
    billsNew.billPackages[billIndex] = {
      ...bill,
      billStatus: 2, // 待开票
      confirmedTime: new Date().toISOString()
    };

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
    const billIndex = billsNew.billPackages.findIndex(b => b.billNo === billNo);
    if (billIndex === -1) {
      return mockError(10001, "账单不存在");
    }
    
    const bill = billsNew.billPackages[billIndex];
    // 允许从待开票(2)或开票中(3)状态撤销
    if (bill.billStatus !== 2 && bill.billStatus !== 3) {
      return mockError(10002, "账单状态不允许撤销");
    }

    // 创建新对象并更新账单状态
    billsNew.billPackages[billIndex] = {
      ...bill,
      billStatus: 0, // 待确认
      confirmedTime: null,
      invoicingStartTime: null
    };

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
   * 开始开票（将状态从待开票改为开票中）
   */
  startInvoicing(billNo) {
    const billIndex = billsNew.billPackages.findIndex(b => b.billNo === billNo);
    if (billIndex === -1) {
      return mockError(10001, "账单不存在");
    }
    
    const bill = billsNew.billPackages[billIndex];
    if (bill.billStatus !== 2) {
      return mockError(10002, "账单状态不是待开票");
    }

    // 创建新对象并更新账单状态为开票中
    billsNew.billPackages[billIndex] = {
      ...bill,
      billStatus: 3, // 开票中
      invoicingStartTime: new Date().toISOString()
    };

    return mockResponse({
      billNo: bill.billNo,
      status: bill.billStatus
    });
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

    // 优先使用已保存的汇总数据（从开票流程中生成的）
    if (invoiceSummaryByBillNo.has(billNo)) {
      const savedSummary = invoiceSummaryByBillNo.get(billNo);
      console.log("getInvoiceSummary - 使用已保存的汇总数据:", savedSummary);
      return mockResponse(savedSummary);
    }

    // 如果没有保存的数据，尝试从开票行数据生成
    const savedInvoiceData = invoiceRowsByBillNo.get(billNo);
    if (savedInvoiceData && savedInvoiceData.rows) {
      console.log("getInvoiceSummary - 从开票行数据生成汇总");
      const summary = generateInvoiceSummaryFromRows(billNo, savedInvoiceData.rows, bill.totalAmount);
      invoiceSummaryByBillNo.set(billNo, summary);
      return mockResponse(summary);
    }

    // 最后的兜底方案：生成新的汇总数据
    console.log("getInvoiceSummary - 生成新的汇总数据");
    const summary = invoicesNew.generateInvoiceSummary(
      billNo,
      bill.totalAmount,
      bill.billStatus
    );
    
    // 保存汇总数据
    invoiceSummaryByBillNo.set(billNo, summary);
    
    return mockResponse(summary);
  },

  /**
   * 提交开票申请
   */
  applyInvoice(data) {
    const { billNo, invoiceRows } = data;
    const bill = billsNew.billPackages.find(b => b.billNo === billNo);
    if (!bill) {
      return mockError(10001, "账单不存在");
    }

    if (bill.billStatus !== 2 && bill.billStatus !== 3) {
      return mockError(10007, "账单状态不正确，无法开票");
    }

    // 计算总开票金额
    const totalInvoiceAmount = invoiceRows.reduce((sum, row) => {
      return sum + (row.amount || 0);
    }, 0);

    // 创建新对象并更新账单状态和金额
    const billIndex = billsNew.billPackages.findIndex(b => b.billNo === billNo);
    if (billIndex !== -1) {
      billsNew.billPackages[billIndex] = {
        ...bill,
        billStatus: 3, // 开票中（不是待付款，因为开票是异步的）
        invoicedAmount: (bill.invoicedAmount || 0) + totalInvoiceAmount,
        pendingInvoiceAmount: Math.max(0, (bill.pendingInvoiceAmount || bill.totalAmount) - totalInvoiceAmount),
        invoicedTime: new Date().toISOString()
      };
    }

    // 生成申请记录（为每个开票行生成一条记录）
    const now = new Date();
    const applications = invoiceRows.map((row, index) => {
      const applicationNo = `APP${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(index + 1).padStart(3, '0')}`;
      
      // 获取发票抬头信息（支持多种格式）
      let titleName = "";
      let taxNumber = "";
      
      // 优先使用扁平化的字段
      if (row.titleName) {
        titleName = row.titleName;
        taxNumber = row.taxNumber || "";
      } else if (row.invoiceTitle && typeof row.invoiceTitle === 'object') {
        // 兼容嵌套对象格式
        titleName = row.invoiceTitle.titleName || "";
        taxNumber = row.invoiceTitle.taxNumber || "";
      } else if (row.titleId) {
        // 如果有 titleId，尝试从发票抬头列表中查找（这里简化处理）
        // 实际应该从发票抬头列表中查找
        titleName = "示例科技有限公司";
        taxNumber = "91110108MA01234567";
      }
      
      // 如果仍然没有抬头信息，使用默认值
      if (!titleName) {
        titleName = "示例科技有限公司";
        taxNumber = "91110108MA01234567";
      }
      
      // 获取收货人信息（支持多种格式）
      let submitter = "system";
      let receiverName = "";
      let receiverEmail = "";
      
      // 优先使用扁平化的字段
      if (row.receiverEmail) {
        receiverEmail = row.receiverEmail;
        receiverName = row.receiverName || "";
        submitter = receiverEmail;
      } else if (row.receiverName) {
        receiverName = row.receiverName;
        submitter = receiverName;
      } else if (row.recipient && typeof row.recipient === 'object') {
        // 兼容嵌套对象格式
        receiverEmail = row.recipient.email || "";
        receiverName = row.recipient.name || "";
        submitter = receiverEmail || receiverName || "system";
      } else if (row.receiverId) {
        // 如果有 receiverId，尝试从收货人列表中查找（这里简化处理）
        // 实际应该从收货人列表中查找
        submitter = "system";
      }
      
      // 构建发票内容描述（包含拆分信息）
      let content = row.invoiceSummary || row.summary || "全部订单";
      if (row.splitDimension1 || row.splitDimension2) {
        const splitParts = [];
        if (row.splitDimension1) splitParts.push(row.splitDimension1);
        if (row.splitDimension2) splitParts.push(row.splitDimension2);
        if (splitParts.length > 0) {
          content = `${content} (${splitParts.join(' - ')})`;
        }
      }
      
      return {
        applicationNo,
        billNo,
        invoiceType: row.invoiceType || row.invoiceTypeName || "增值税普通发票",
        content: content,
        amount: row.amount || 0,
        titleName: titleName,
        taxNumber: taxNumber,
        submitter: submitter,
        applyTime: now.toISOString().slice(0, 19).replace('T', ' '),
        status: "processing", // 初始状态为处理中
        isFlushed: false,
        remark: ""
      };
    });

    // 保存申请记录到存储（用于后续查询）
    if (!invoiceApplicationsByBillNo.has(billNo)) {
      invoiceApplicationsByBillNo.set(billNo, []);
    }
    const existingApplications = invoiceApplicationsByBillNo.get(billNo);
    existingApplications.push(...applications);
    invoiceApplicationsByBillNo.set(billNo, existingApplications);

    // 更新开票汇总数据（基于已保存的开票行数据）
    let currentSummary = invoiceSummaryByBillNo.get(billNo);
    
    if (!currentSummary) {
      // 如果没有汇总数据，尝试从开票行数据生成
      const savedInvoiceData = invoiceRowsByBillNo.get(billNo);
      if (savedInvoiceData && savedInvoiceData.rows) {
        currentSummary = generateInvoiceSummaryFromRows(billNo, savedInvoiceData.rows, bill.totalAmount);
      } else {
        // 最后的兜底方案
        currentSummary = invoicesNew.generateInvoiceSummary(billNo, bill.totalAmount, bill.billStatus);
      }
    }
    
    // 计算已开票金额（累加）
    const newInvoicedAmount = (currentSummary.invoicedAmount || 0) + totalInvoiceAmount;
    const newRemainingAmount = Math.max(0, currentSummary.shouldInvoiceAmount - newInvoicedAmount);
    
    // 按发票种类汇总本次提交的开票行
    const submittedByType = {};
    invoiceRows.forEach(row => {
      const typeName = row.invoiceType || row.invoiceTypeName || '其他';
      if (!submittedByType[typeName]) {
        submittedByType[typeName] = 0;
      }
      submittedByType[typeName] += row.amount || 0;
    });
    
    console.log("applyInvoice - submittedByType:", submittedByType);
    
    // 更新汇总明细（基于发票种类精确匹配）
    const updatedDetails = currentSummary.invoiceDetails.map(detail => {
      const submittedAmount = submittedByType[detail.type] || 0;
      
      if (submittedAmount > 0) {
        const newDetailInvoiced = (detail.invoicedAmount || 0) + submittedAmount;
        return {
          ...detail,
          invoicedAmount: parseFloat(newDetailInvoiced.toFixed(2)),
          remainingAmount: parseFloat(Math.max(0, detail.shouldAmount - newDetailInvoiced).toFixed(2))
        };
      }
      return detail;
    });
    
    // 更新汇总数据
    const updatedSummary = {
      ...currentSummary,
      invoicedAmount: newInvoicedAmount,
      remainingAmount: newRemainingAmount,
      invoiceDetails: updatedDetails
    };
    
    invoiceSummaryByBillNo.set(billNo, updatedSummary);

    return mockResponse({
      applicationId: applications[0].applicationNo,
      billNo,
      status: 1, // 开票中
      applications: applications
    });
  },

  /**
   * 获取开票申请记录
   */
  getInvoiceApplications(billNo) {
    // 优先使用已保存的申请记录（从提交开票时保存的）
    let applications = [];
    if (invoiceApplicationsByBillNo.has(billNo)) {
      applications = invoiceApplicationsByBillNo.get(billNo);
    }
    
    // 如果没有保存的记录，使用默认生成的记录
    if (applications.length === 0) {
      applications = invoicesNew.generateInvoiceApplications(billNo);
      // 保存默认记录
      invoiceApplicationsByBillNo.set(billNo, applications);
    }
    
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
   * 生成开票行（根据拆分汇总配置）
   * @param {String} billNo - 账单号
   * @param {Object} splitConfig - 拆分汇总配置 { dimensions: [] }
   */
  generateInvoiceRows(billNo, splitConfig) {
    try {
      // 从 splitConfig 中提取 dimensions 数组
      // 支持多种格式：{ dimensions: [] } 或 { dimension1: 'xxx', dimension2: 'xxx' }
      let dimensions = [];
      
      if (splitConfig) {
        if (splitConfig.dimensions && Array.isArray(splitConfig.dimensions)) {
          dimensions = splitConfig.dimensions;
        } else if (splitConfig.dimension1 || splitConfig.dimension2) {
          // 兼容旧格式
          if (splitConfig.dimension1) dimensions.push(splitConfig.dimension1);
          if (splitConfig.dimension2) dimensions.push(splitConfig.dimension2);
        }
      }
      
      console.log("generateInvoiceRows - splitConfig:", splitConfig);
      console.log("generateInvoiceRows - dimensions:", dimensions);
      
      // 获取账单的订单数据
      const orders = ordersByBillNo.get(billNo) || [];
      console.log("generateInvoiceRows - orders count:", orders.length);
      
      // 调用 generateInvoiceTable 生成开票信息表，传入订单数据
      const invoiceRows = invoicesNew.generateInvoiceTable(billNo, dimensions, orders);
      
      console.log("generateInvoiceRows - invoiceRows:", invoiceRows);
      
      // 保存开票行数据，供后续步骤使用
      invoiceRowsByBillNo.set(billNo, {
        rows: invoiceRows,
        splitConfig: splitConfig,
        dimensions: dimensions,
        orders: orders,
        timestamp: new Date().toISOString()
      });
      
      // 同时初始化开票汇总数据（基于开票行数据）
      const bill = billsNew.billPackages.find(b => b.billNo === billNo);
      if (bill) {
        const initialSummary = generateInvoiceSummaryFromRows(billNo, invoiceRows, bill.totalAmount);
        invoiceSummaryByBillNo.set(billNo, initialSummary);
        console.log("generateInvoiceRows - 初始化开票汇总:", initialSummary);
      }
      
      return mockResponse(invoiceRows);
    } catch (error) {
      console.error('生成开票行失败:', error);
      return mockError(500, `生成开票行失败: ${error.message}`);
    }
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

