/**
 * LocalStorage封装
 * 用于用户类型切换、演示状态保存等
 */

import { STORAGE_KEYS } from "./constants";

/**
 * 设置localStorage
 * @param {String} key - 键名
 * @param {Any} value - 值（自动JSON序列化）
 */
export function setStorage(key, value) {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error("[Storage] setStorage error:", error);
    return false;
  }
}

/**
 * 获取localStorage
 * @param {String} key - 键名
 * @param {Any} defaultValue - 默认值
 * @returns {Any} 值（自动JSON反序列化）
 */
export function getStorage(key, defaultValue = null) {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error("[Storage] getStorage error:", error);
    return defaultValue;
  }
}

/**
 * 移除localStorage
 * @param {String} key - 键名
 */
export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("[Storage] removeStorage error:", error);
    return false;
  }
}

/**
 * 清空localStorage
 */
export function clearStorage() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error("[Storage] clearStorage error:", error);
    return false;
  }
}

/**
 * 检查localStorage是否可用
 * @returns {Boolean}
 */
export function isStorageAvailable() {
  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

// ====== 业务相关的Storage方法 ======

/**
 * 保存用户类型
 * @param {Number} accountType - 账户类型 1-预存 2-授信
 */
export function saveUserType(accountType) {
  setStorage(STORAGE_KEYS.USER_TYPE, accountType);
}

/**
 * 获取用户类型
 * @returns {Number} 账户类型，默认1（预存）
 */
export function getUserType() {
  return getStorage(STORAGE_KEYS.USER_TYPE, 1);
}

/**
 * 清除用户类型
 */
export function clearUserType() {
  removeStorage(STORAGE_KEYS.USER_TYPE);
}

/**
 * 保存Mock数据版本
 * @param {String} version - 版本号
 */
export function saveMockDataVersion(version) {
  setStorage(STORAGE_KEYS.MOCK_DATA_VERSION, version);
}

/**
 * 获取Mock数据版本
 * @returns {String} 版本号
 */
export function getMockDataVersion() {
  return getStorage(STORAGE_KEYS.MOCK_DATA_VERSION, "1.0.0");
}

/**
 * 保存demo演示状态（用于保存当前演示进度）
 * @param {Object} state - 演示状态对象
 */
export function saveDemoState(state) {
  setStorage("demo_state", {
    ...state,
    timestamp: Date.now()
  });
}

/**
 * 获取demo演示状态
 * @returns {Object|null} 演示状态对象
 */
export function getDemoState() {
  const state = getStorage("demo_state");
  if (!state) return null;

  // 检查状态是否过期（超过1小时）
  const now = Date.now();
  const elapsed = now - (state.timestamp || 0);
  const ONE_HOUR = 60 * 60 * 1000;

  if (elapsed > ONE_HOUR) {
    removeDemoState();
    return null;
  }

  return state;
}

/**
 * 清除demo演示状态
 */
export function removeDemoState() {
  removeStorage("demo_state");
}

/**
 * 重置所有demo相关的storage
 */
export function resetDemoStorage() {
  clearUserType();
  removeDemoState();
  console.log("[Storage] Demo storage已重置");
}

// ====== 配置相关的Storage方法 ======

/**
 * 保存明细设置（用于列表页订单明细展示）
 * @param {Object} settings - 明细设置对象
 */
export function setDetailSettings(settings) {
  setStorage('detail_settings', settings);
}

/**
 * 获取明细设置
 * @returns {Object|null} 明细设置对象
 */
export function getDetailSettings() {
  return getStorage('detail_settings', null);
}

/**
 * 保存拆分汇总配置（用于开票页数据拆分，独立存储）
 * @param {Object} config - 拆分汇总配置对象
 */
export function setSplitConfig(config) {
  setStorage('split_config', config);
}

/**
 * 获取拆分汇总配置
 * @returns {Object|null} 拆分汇总配置对象
 */
export function getSplitConfig() {
  return getStorage('split_config', null);
}

/**
 * 保存字段配置
 * @param {Object} config - 字段配置对象
 */
export function setFieldConfig(config) {
  setStorage('field_config', config);
}

/**
 * 获取字段配置
 * @returns {Object|null} 字段配置对象
 */
export function getFieldConfig() {
  return getStorage('field_config', null);
}

/**
 * 清空所有配置
 */
export function clearAll() {
  removeStorage('detail_settings');
  removeStorage('split_config');
  removeStorage('field_config');
}

// 导出一个storage对象，包含所有方法（用于Vuex模块）
export const storage = {
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  isStorageAvailable,
  saveUserType,
  getUserType,
  clearUserType,
  saveMockDataVersion,
  getMockDataVersion,
  saveDemoState,
  getDemoState,
  removeDemoState,
  resetDemoStorage,
  setDetailSettings,
  getDetailSettings,
  setSplitConfig,
  getSplitConfig,
  setFieldConfig,
  getFieldConfig,
  clearAll
};

// 默认导出
export default storage;

