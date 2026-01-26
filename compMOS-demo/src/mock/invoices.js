/**
 * 发票模拟数据
 * 20张发票，分布在3个开票批次中
 */
import Mock from "mockjs";

// 发票类型：1-增值税专用发票, 2-增值税普通发票, 3-电子行程单
const INVOICE_TYPES = {
  SPECIAL: 1,
  GENERAL: 2,
  ITINERARY: 3
};

// 发票类型名称映射
const INVOICE_TYPE_NAMES = {
  1: "增值税专用发票",
  2: "增值税普通发票",
  3: "电子行程单"
};

// 生成单张发票
function generateInvoice(batchNo, index, invoiceType) {
  const invoiceNo =
    invoiceType === INVOICE_TYPES.ITINERARY
      ? Mock.mock(/\d{13}/)
      : Mock.mock({
          invoiceCode: /\d{12}/,
          invoiceNo: /\d{8}/
        });

  return {
    invoiceId: `INV${batchNo.replace("BATCH", "")}${String(index).padStart(3, "0")}`,
    batchNo: batchNo,
    invoiceType: invoiceType,
    invoiceTypeName: INVOICE_TYPE_NAMES[invoiceType],
    invoiceCode: invoiceNo.invoiceCode || null,
    invoiceNo: invoiceNo.invoiceNo || invoiceNo,
    invoiceTitle: "示例科技有限公司",
    taxId: "91310000MA1FL5G73X",
    totalAmount: Mock.Random.float(1000, 10000, 2, 2),
    taxAmount: function () {
      return invoiceType === INVOICE_TYPES.SPECIAL
        ? parseFloat((this.totalAmount * 0.06).toFixed(2))
        : 0;
    }.call({ totalAmount: Mock.Random.float(1000, 10000, 2, 2) }),
    issueDate: Mock.mock("@date('yyyy-MM-dd')"),
    status: 1, // 1-已开具, 2-已红冲, 3-已作废
    pdfUrl: `/mock/invoices/${Mock.Random.string("lower", 16)}.pdf`
  };
}

// 开票批次
export const mockInvoiceBatches = [
  {
    batchNo: "BATCH202601001",
    billNo: "BILL202601001",
    createTime: "2026-01-15T10:00:00Z",
    status: 1, // 0-开票中, 1-已完成, 2-部分失败
    totalCount: 10,
    successCount: 10,
    failCount: 0,
    specialCount: 4,
    generalCount: 3,
    itineraryCount: 3,
    specialAmount: 28500.0,
    generalAmount: 15200.0,
    itineraryAmount: 6800.0
  },
  {
    batchNo: "BATCH202512001",
    billNo: "BILL202512001",
    createTime: "2025-12-08T14:30:00Z",
    status: 1,
    totalCount: 8,
    successCount: 8,
    failCount: 0,
    specialCount: 3,
    generalCount: 3,
    itineraryCount: 2,
    specialAmount: 22400.0,
    generalAmount: 12300.0,
    itineraryAmount: 4200.0
  },
  {
    batchNo: "BATCH202511001",
    billNo: "BILL202511001",
    createTime: "2025-11-05T16:45:00Z",
    status: 0, // 开票中（模拟）
    totalCount: 2,
    successCount: 0,
    failCount: 0,
    specialCount: 1,
    generalCount: 1,
    itineraryCount: 0,
    specialAmount: 0,
    generalAmount: 0,
    itineraryAmount: 0
  }
];

// 发票数据
export const mockInvoices = {
  BATCH202601001: [
    // 专用发票 4张
    ...Array.from({ length: 4 }, (_, i) => generateInvoice("BATCH202601001", i + 1, INVOICE_TYPES.SPECIAL)),
    // 普通发票 3张
    ...Array.from({ length: 3 }, (_, i) => generateInvoice("BATCH202601001", i + 5, INVOICE_TYPES.GENERAL)),
    // 行程单 3张
    ...Array.from({ length: 3 }, (_, i) => generateInvoice("BATCH202601001", i + 8, INVOICE_TYPES.ITINERARY))
  ],
  BATCH202512001: [
    // 专用发票 3张
    ...Array.from({ length: 3 }, (_, i) => generateInvoice("BATCH202512001", i + 1, INVOICE_TYPES.SPECIAL)),
    // 普通发票 3张
    ...Array.from({ length: 3 }, (_, i) => generateInvoice("BATCH202512001", i + 4, INVOICE_TYPES.GENERAL)),
    // 行程单 2张
    ...Array.from({ length: 2 }, (_, i) => generateInvoice("BATCH202512001", i + 7, INVOICE_TYPES.ITINERARY))
  ],
  BATCH202511001: [] // 开票中，暂无发票
};

// 获取所有批次
export function getInvoiceBatches() {
  return mockInvoiceBatches;
}

// 根据账单号获取批次
export function getBatchesByBillNo(billNo) {
  return mockInvoiceBatches.filter((batch) => batch.billNo === billNo);
}

// 根据批次号获取批次
export function getBatchByNo(batchNo) {
  return mockInvoiceBatches.find((batch) => batch.batchNo === batchNo);
}

// 获取批次的发票列表
export function getInvoicesByBatchNo(batchNo) {
  return mockInvoices[batchNo] || [];
}

// 创建新批次
export function createInvoiceBatch(billNo, invoiceInfo) {
  const batchNo = `BATCH${billNo.replace("BILL", "")}`;
  const newBatch = {
    batchNo: batchNo,
    billNo: billNo,
    createTime: new Date().toISOString(),
    status: 0, // 开票中
    totalCount: 0,
    successCount: 0,
    failCount: 0,
    specialCount: 0,
    generalCount: 0,
    itineraryCount: 0,
    specialAmount: 0,
    generalAmount: 0,
    itineraryAmount: 0,
    invoiceInfo: invoiceInfo
  };

  mockInvoiceBatches.push(newBatch);
  mockInvoices[batchNo] = [];

  // 模拟开票进度（2-3秒后完成）
  setTimeout(() => {
    completeBatch(batchNo);
  }, 2500);

  return newBatch;
}

// 完成批次（模拟开票完成）
function completeBatch(batchNo) {
  const batch = getBatchByNo(batchNo);
  if (batch) {
    batch.status = 1; // 已完成

    // 生成模拟发票
    const invoices = [
      ...Array.from({ length: 3 }, (_, i) => generateInvoice(batchNo, i + 1, INVOICE_TYPES.SPECIAL)),
      ...Array.from({ length: 2 }, (_, i) => generateInvoice(batchNo, i + 4, INVOICE_TYPES.GENERAL)),
      ...Array.from({ length: 2 }, (_, i) => generateInvoice(batchNo, i + 6, INVOICE_TYPES.ITINERARY))
    ];

    mockInvoices[batchNo] = invoices;

    // 更新批次统计
    batch.totalCount = invoices.length;
    batch.successCount = invoices.length;
    batch.specialCount = 3;
    batch.generalCount = 2;
    batch.itineraryCount = 2;
    batch.specialAmount = invoices
      .filter((inv) => inv.invoiceType === INVOICE_TYPES.SPECIAL)
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    batch.generalAmount = invoices
      .filter((inv) => inv.invoiceType === INVOICE_TYPES.GENERAL)
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    batch.itineraryAmount = invoices
      .filter((inv) => inv.invoiceType === INVOICE_TYPES.ITINERARY)
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
  }
}

// 导出常量
export { INVOICE_TYPES, INVOICE_TYPE_NAMES };

