// Vuex Action/Mutation 类型常量
// 使用常量可以避免字符串拼写错误，提高代码可维护性

// ==================== Bill Module ====================
export const BILL = {
  // Getters
  CURRENT_BILL: 'bill/currentBill',
  BILL_LIST: 'bill/billList',
  
  // Mutations
  SET_CURRENT_BILL: 'bill/SET_CURRENT_BILL',
  SET_BILL_LIST: 'bill/SET_BILL_LIST',
  UPDATE_BILL_STATUS: 'bill/UPDATE_BILL_STATUS',
  UPDATE_BILL_AMOUNTS: 'bill/UPDATE_BILL_AMOUNTS',
  SET_FILTERS: 'bill/SET_FILTERS',
  RESET_FILTERS: 'bill/RESET_FILTERS',
  SET_PAGINATION: 'bill/SET_PAGINATION',
  SET_LOADING: 'bill/SET_LOADING',
  SET_ERROR: 'bill/SET_ERROR',
  CLEAR_ERROR: 'bill/CLEAR_ERROR',
  
  // Actions
  FETCH_BILL_LIST: 'bill/fetchBillList',
  FETCH_BILL_DETAIL: 'bill/fetchBillDetail',
  CONFIRM_BILL: 'bill/confirmBill',
  CANCEL_CONFIRM: 'bill/cancelConfirm',
  UPDATE_FILTERS: 'bill/updateFilters',
  RESET_FILTERS_ACTION: 'bill/resetFilters',
  UPDATE_PAGINATION: 'bill/updatePagination'
}

// ==================== Order Module ====================
export const ORDER = {
  // Getters
  ORDER_LIST: 'order/orderList',
  FILTERED_ORDERS: 'order/filteredOrders',
  ORDER_SUMMARY: 'order/orderSummary',
  
  // Mutations
  SET_ORDER_LIST: 'order/SET_ORDER_LIST',
  SET_FILTERED_ORDERS: 'order/SET_FILTERED_ORDERS',
  UPDATE_ORDERS_STATUS: 'order/UPDATE_ORDERS_STATUS',
  SET_SEARCH_FILTERS: 'order/SET_SEARCH_FILTERS',
  RESET_SEARCH_FILTERS: 'order/RESET_SEARCH_FILTERS',
  SET_SELECTED_ORDERS: 'order/SET_SELECTED_ORDERS',
  SET_LOADING: 'order/SET_LOADING',
  SET_ERROR: 'order/SET_ERROR',
  
  // Actions
  FETCH_ORDER_LIST: 'order/fetchOrderList',
  FILTER_ORDERS: 'order/filterOrders',
  BATCH_QUERY_ORDERS: 'order/batchQueryOrders',
  UPDATE_ORDER_STATUS_BY_BILL: 'order/updateOrderStatusByBill',
  UPDATE_SEARCH_FILTERS: 'order/updateSearchFilters',
  RESET_SEARCH_FILTERS_ACTION: 'order/resetSearchFilters',
  UPDATE_SELECTED_ORDERS: 'order/updateSelectedOrders'
}

// ==================== Invoice Module ====================
export const INVOICE = {
  // Getters
  INVOICE_SUMMARY: 'invoice/invoiceSummary',
  INVOICE_TITLES: 'invoice/invoiceTitles',
  INVOICE_APPLICATIONS: 'invoice/invoiceApplications',
  INVOICE_FORM: 'invoice/invoiceForm',
  
  // Mutations
  SET_INVOICE_SUMMARY: 'invoice/SET_INVOICE_SUMMARY',
  UPDATE_INVOICE_AMOUNTS: 'invoice/UPDATE_INVOICE_AMOUNTS',
  SET_INVOICE_TITLES: 'invoice/SET_INVOICE_TITLES',
  ADD_INVOICE_TITLE: 'invoice/ADD_INVOICE_TITLE',
  SET_INVOICE_APPLICATIONS: 'invoice/SET_INVOICE_APPLICATIONS',
  ADD_INVOICE_APPLICATION: 'invoice/ADD_INVOICE_APPLICATION',
  SET_INVOICE_FORM: 'invoice/SET_INVOICE_FORM',
  UPDATE_INVOICE_ROW: 'invoice/UPDATE_INVOICE_ROW',
  SET_SPLIT_CONFIG: 'invoice/SET_SPLIT_CONFIG',
  SET_LOADING: 'invoice/SET_LOADING',
  SET_SUBMITTING: 'invoice/SET_SUBMITTING',
  SET_ERROR: 'invoice/SET_ERROR',
  
  // Actions
  FETCH_INVOICE_SUMMARY: 'invoice/fetchInvoiceSummary',
  FETCH_INVOICE_TITLES: 'invoice/fetchInvoiceTitles',
  CREATE_INVOICE_TITLE: 'invoice/createInvoiceTitle',
  FETCH_INVOICE_APPLICATIONS: 'invoice/fetchInvoiceApplications',
  SUBMIT_INVOICE_APPLICATION: 'invoice/submitInvoiceApplication',
  DOWNLOAD_INVOICE: 'invoice/downloadInvoice',
  RED_FLUSH_INVOICE: 'invoice/redFlushInvoice',
  REISSUE_INVOICE: 'invoice/reissueInvoice',
  INIT_INVOICE_FORM: 'invoice/initInvoiceForm',
  UPDATE_INVOICE_ROW_ACTION: 'invoice/updateInvoiceRow',
  UPDATE_SPLIT_CONFIG: 'invoice/updateSplitConfig'
}

// ==================== Config Module ====================
export const CONFIG = {
  // Getters
  DETAIL_SETTINGS: 'config/detailSettings',
  FIELD_CONFIG: 'config/fieldConfig',
  DISPLAY_FIELDS: 'config/displayFields',
  EXCEL_EXPORT_FIELDS: 'config/excelExportFields',
  PDF_EXPORT_FIELDS: 'config/pdfExportFields',
  SYSTEM_CONFIG: 'config/systemConfig',
  
  // Mutations
  SET_DETAIL_SETTINGS: 'config/SET_DETAIL_SETTINGS',
  SET_FIELD_CONFIG: 'config/SET_FIELD_CONFIG',
  UPDATE_DISPLAY_FIELDS: 'config/UPDATE_DISPLAY_FIELDS',
  UPDATE_EXCEL_EXPORT_FIELDS: 'config/UPDATE_EXCEL_EXPORT_FIELDS',
  UPDATE_PDF_EXPORT_FIELDS: 'config/UPDATE_PDF_EXPORT_FIELDS',
  SET_SYSTEM_CONFIG: 'config/SET_SYSTEM_CONFIG',
  SET_LOADING: 'config/SET_LOADING',
  SET_ERROR: 'config/SET_ERROR',
  
  // Actions
  FETCH_DETAIL_SETTINGS: 'config/fetchDetailSettings',
  UPDATE_DETAIL_SETTINGS: 'config/updateDetailSettings',
  FETCH_FIELD_CONFIG: 'config/fetchFieldConfig',
  UPDATE_FIELD_CONFIG: 'config/updateFieldConfig',
  FETCH_SYSTEM_CONFIG: 'config/fetchSystemConfig',
  UPDATE_USER_PREFERENCES: 'config/updateUserPreferences',
  RESET_CONFIG: 'config/resetConfig'
}

// ==================== User Module ====================
export const USER = {
  // Getters
  USER_INFO: 'user/userInfo',
  USER_NAME: 'user/userName',
  COMPANY_NAME: 'user/companyName',
  ACCOUNT_TYPE: 'user/accountType',
  IS_LOGGED_IN: 'user/isLoggedIn',
  HAS_PERMISSION: 'user/hasPermission',
  
  // Mutations
  SET_USER_INFO: 'user/SET_USER_INFO',
  SET_TOKEN: 'user/SET_TOKEN',
  SET_LOGGED_IN: 'user/SET_LOGGED_IN',
  CLEAR_USER_INFO: 'user/CLEAR_USER_INFO',
  
  // Actions
  LOGIN: 'user/login',
  LOGOUT: 'user/logout',
  FETCH_USER_INFO: 'user/fetchUserInfo',
  UPDATE_USER_INFO: 'user/updateUserInfo'
}

