// src/utils/deviceHelper.js
export const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};
