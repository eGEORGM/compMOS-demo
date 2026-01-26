/**
 * 用户模拟数据
 * 2个用户：1个预存企业、1个授信企业
 */

export const mockUsers = [
  {
    userId: "USER001",
    userName: "管理员",
    companyName: "示例科技有限公司",
    accountType: 1, // 预存企业
    phone: "13800138000",
    email: "admin@example.com",
    // 发票信息
    invoiceInfo: {
      invoiceTitle: "示例科技有限公司",
      taxId: "91310000MA1FL5G73X",
      registerAddress: "上海市浦东新区张江高科技园区碧波路888号",
      registerPhone: "021-88888888",
      bankName: "中国工商银行上海分行",
      bankAccount: "1234567890123456789"
    },
    // 收货地址
    addresses: [
      {
        id: "ADDR001",
        receiverName: "张三",
        receiverPhone: "13800138001",
        province: "上海市",
        city: "上海市",
        district: "浦东新区",
        address: "张江高科技园区碧波路888号1号楼",
        isDefault: true
      },
      {
        id: "ADDR002",
        receiverName: "李四",
        receiverPhone: "13800138002",
        province: "北京市",
        city: "北京市",
        district: "朝阳区",
        address: "建国路108号SOHO现代城A座1201",
        isDefault: false
      },
      {
        id: "ADDR003",
        receiverName: "王五",
        receiverPhone: "13800138003",
        province: "广东省",
        city: "深圳市",
        district: "南山区",
        address: "科技园南区深南大道9988号",
        isDefault: false
      }
    ]
  },
  {
    userId: "USER002",
    userName: "授信用户",
    companyName: "示例贸易有限公司",
    accountType: 2, // 授信企业
    phone: "13900139000",
    email: "credit@example.com",
    // 发票信息
    invoiceInfo: {
      invoiceTitle: "示例贸易有限公司",
      taxId: "91310000MA1FL5G74Y",
      registerAddress: "上海市徐汇区漕河泾开发区宜山路1000号",
      registerPhone: "021-66666666",
      bankName: "中国建设银行上海分行",
      bankAccount: "9876543210987654321"
    },
    // 收货地址
    addresses: [
      {
        id: "ADDR004",
        receiverName: "赵六",
        receiverPhone: "13900139001",
        province: "上海市",
        city: "上海市",
        district: "徐汇区",
        address: "漕河泾开发区宜山路1000号2号楼",
        isDefault: true
      }
    ]
  }
];

// 当前登录用户（默认预存企业）
let currentUser = mockUsers[0];

// 获取当前用户
export function getCurrentUser() {
  return currentUser;
}

// 切换用户（用于demo演示）
export function switchUser(accountType) {
  currentUser = mockUsers.find((user) => user.accountType === accountType) || mockUsers[0];
  return currentUser;
}

// 根据用户ID获取用户
export function getUserById(userId) {
  return mockUsers.find((user) => user.userId === userId);
}

// 获取用户发票信息
export function getUserInvoiceInfo() {
  return currentUser.invoiceInfo;
}

// 获取用户地址列表
export function getUserAddresses() {
  return currentUser.addresses;
}

// 获取默认地址
export function getDefaultAddress() {
  return currentUser.addresses.find((addr) => addr.isDefault) || currentUser.addresses[0];
}

