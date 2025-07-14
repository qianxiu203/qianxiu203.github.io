// 自动主题切换功能
window.autoThemeSwitch = {
  timer: null,
  calibrationTimer: null,
  cachedTime: null,
  cacheExpiry: 300000, // 5分钟缓存过期
  lastCacheTime: 0,
  timeOffset: 0, // 本地时间与网络时间的偏差（毫秒）
  lastCalibrationTime: 0, // 上次校准时间
  calibrationInterval: 24 * 60 * 60 * 1000, // 24小时校准一次
  nextSwitchTime: null, // 下次切换时间

  // 获取校准后的中国时间（基于本地时间+偏差）
  getCalibratedTime() {
    return new Date(Date.now() + this.timeOffset);
  },

  // 获取网络中国时间并校准偏差
  async getChinaTime() {
    const now = Date.now();
    
    // 检查缓存是否有效
    if (this.cachedTime && (now - this.lastCacheTime) < this.cacheExpiry) {
      return this.cachedTime;
    }

    const timeAPIs = [
      'https://worldtimeapi.org/api/timezone/Asia/Shanghai',
      'https://timeapi.io/api/Time/current/zone?timeZone=Asia/Shanghai',
      'http://api.timezonedb.com/v2.1/get-time-zone?key=demo&format=json&by=zone&zone=Asia/Shanghai'
    ];

    for (const api of timeAPIs) {
      try {
        const response = await fetch(api, { 
          timeout: 5000,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          let chinaTime;
          
          if (data.datetime) {
            // WorldTimeAPI format
            chinaTime = new Date(data.datetime);
          } else if (data.dateTime) {
            // TimeAPI.io format
            chinaTime = new Date(data.dateTime);
          } else if (data.formatted) {
            // TimezoneDB format
            chinaTime = new Date(data.formatted);
          }
          
          if (chinaTime && !isNaN(chinaTime.getTime())) {
            this.cachedTime = chinaTime;
            this.lastCacheTime = now;
            
            // 计算时间偏差（网络时间 - 本地时间）
            const localTime = new Date();
            this.timeOffset = chinaTime.getTime() - localTime.getTime();
            this.lastCalibrationTime = now;
            
            console.log(`[自动主题切换] 成功获取网络时间: ${chinaTime.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`);
            console.log(`[自动主题切换] 时间偏差: ${this.timeOffset}ms`);
            return chinaTime;
          }
        }
      } catch (error) {
        console.warn(`[自动主题切换] API ${api} 请求失败:`, error.message);
        continue;
      }
    }
    
    // 所有API都失败，回退到本地时间
    console.warn('[自动主题切换] 所有网络时间API都失败，使用本地时间');
    const localTime = new Date();
    this.cachedTime = localTime;
    this.lastCacheTime = now;
    return localTime;
  },

  // 计算下次主题切换时间
  calculateNextSwitchTime() {
    const now = this.getCalibratedTime();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    let nextSwitchHour;
    let nextSwitchDate = new Date(now);
    
    // 6:00-18:00 浅色主题，18:00-6:00 深色主题
    if (currentHour >= 6 && currentHour < 18) {
      // 当前是白天，下次切换到晚上18:00
      nextSwitchHour = 18;
    } else {
      // 当前是晚上，下次切换到明天早上6:00
      nextSwitchHour = 6;
      if (currentHour >= 18) {
        // 如果现在是18:00之后，切换到明天6:00
        nextSwitchDate.setDate(nextSwitchDate.getDate() + 1);
      }
    }
    
    nextSwitchDate.setHours(nextSwitchHour, 0, 0, 0);
    this.nextSwitchTime = nextSwitchDate;
    
    const timeUntilSwitch = nextSwitchDate.getTime() - now.getTime();
    console.log(`[自动主题切换] 下次切换时间: ${nextSwitchDate.toLocaleString('zh-CN')}, 剩余: ${Math.round(timeUntilSwitch / 1000 / 60)}分钟`);
    
    return nextSwitchDate;
  },

  // 检查并切换主题
  checkAndSwitchTheme(isInitialCheck = false) {
    try {
      const currentTime = this.getCalibratedTime();
      const hour = currentTime.getHours();
      const timeString = currentTime.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        hour12: false
      });
      
      // 6:00-18:00 浅色主题，18:00-6:00 深色主题
      const shouldBeLightTheme = hour >= 6 && hour < 18;
      let currentTheme = document.documentElement.getAttribute('data-theme');
      const targetTheme = shouldBeLightTheme ? 'light' : 'dark';
      
      // 如果是初始检查且当前主题为空或null，则设置为目标主题
      if (isInitialCheck && (!currentTheme || currentTheme === 'null')) {
        currentTheme = null; // 强制设置为null以触发主题设置
      }
      
      if (currentTheme !== targetTheme) {
        document.documentElement.setAttribute('data-theme', targetTheme);
        if (typeof utils !== 'undefined' && utils.saveToLocal) {
          utils.saveToLocal.set('theme', targetTheme, 0.02);
        } else {
          localStorage.setItem('theme', targetTheme);
        }
        
        console.log(`[自动主题切换] ${timeString} - 已切换到${targetTheme === 'light' ? '浅色' : '深色'}主题`);
        
        // 触发主题变化事件
        if (typeof handleThemeChange === 'function') {
          handleThemeChange(targetTheme);
        }
        
        // 显示切换提示（初始检查时不显示提示）
        if (!isInitialCheck && typeof utils !== 'undefined' && utils.snackbarShow) {
          utils.snackbarShow(
            `已自动切换到${targetTheme === 'light' ? '浅色' : '深色'}主题 (${timeString})`,
            false,
            3000
          );
        }
      } else {
        console.log(`[自动主题切换] ${timeString} - 当前主题已是${targetTheme === 'light' ? '浅色' : '深色'}，无需切换`);
      }
    } catch (error) {
      console.error('[自动主题切换] 检查主题时发生错误:', error);
    }
  },

  // 定时器模式：精确在切换时间点触发
  startTimerMode() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    const nextSwitchTime = this.calculateNextSwitchTime();
    const now = this.getCalibratedTime();
    const timeUntilSwitch = nextSwitchTime.getTime() - now.getTime();
    
    if (timeUntilSwitch > 0) {
      this.timer = setTimeout(() => {
        this.checkAndSwitchTheme(false);
        // 切换完成后，计算下次切换时间并设置新的定时器
        this.startTimerMode();
      }, timeUntilSwitch);
      
      console.log(`[自动主题切换] 定时器模式已启动，${Math.round(timeUntilSwitch / 1000 / 60)}分钟后切换主题`);
    } else {
      // 如果计算出的时间已经过去，立即切换并重新计算
      this.checkAndSwitchTheme(false);
      this.startTimerMode();
    }
  },

  // 时间校准方法
  async calibrateTime() {
    console.log('[自动主题切换] 开始时间校准...');
    try {
      // 强制刷新网络时间
      this.cachedTime = null;
      this.lastCacheTime = 0;
      
      await this.getChinaTime();
      
      // 重新计算下次切换时间
      this.startTimerMode();
      
      console.log('[自动主题切换] 时间校准完成');
      
      if (typeof utils !== 'undefined' && utils.snackbarShow) {
        utils.snackbarShow('时间校准完成', false, 2000);
      }
    } catch (error) {
      console.error('[自动主题切换] 时间校准失败:', error);
    }
  },

  // 启动定时校准
  startCalibration() {
    if (this.calibrationTimer) {
      clearInterval(this.calibrationTimer);
    }
    
    // 每24小时校准一次
    this.calibrationTimer = setInterval(() => {
      this.calibrateTime();
    }, this.calibrationInterval);
    
    console.log('[自动主题切换] 定时校准已启动，每24小时校准一次');
  },

  // 启动自动切换
  async startAutoSwitch() {
    if (this.timer) {
      console.log('[自动主题切换] 已在运行中');
      return;
    }
    
    console.log('[自动主题切换] 启动定时器模式');
    
    // 立即执行一次检查（标记为初始检查）
    this.checkAndSwitchTheme(true);
    
    // 首先获取网络时间进行校准
    try {
      await this.getChinaTime();
    } catch (error) {
      console.warn('[自动主题切换] 初始时间校准失败，使用本地时间');
    }
    
    // 启动定时器模式
    this.startTimerMode();
    
    // 启动定时校准
    this.startCalibration();
  },

  // 停止自动切换
  stopAutoSwitch() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    if (this.calibrationTimer) {
      clearInterval(this.calibrationTimer);
      this.calibrationTimer = null;
    }
    
    console.log('[自动主题切换] 已停止自动切换');
    
    if (typeof utils !== 'undefined' && utils.snackbarShow) {
      utils.snackbarShow('已停止自动主题切换', false, 2000);
    }
  },

  // 设置检查间隔
  setCheckInterval(interval) {
    if (interval < 10000) {
      console.warn('[自动主题切换] 检查间隔不能少于10秒');
      return;
    }
    
    this.checkInterval = interval;
    console.log(`[自动主题切换] 检查间隔已设置为: ${interval / 1000}秒`);
    
    // 如果正在运行，重新启动以应用新间隔
    if (this.timer) {
      this.stopAutoSwitch();
      this.startAutoSwitch();
    }
  },

  // 手动刷新网络时间
  async refreshNetworkTime() {
    await this.calibrateTime();
  },

  // 显示定时器时间信息
  showTimerInfo() {
    const now = this.getCalibratedTime();
    const currentTime = now.toLocaleString('zh-CN');
    const nextSwitchTime = this.nextSwitchTime ? this.nextSwitchTime.toLocaleString('zh-CN') : '未设置';
    const lastCalibrationTime = this.lastCalibrationTime ? new Date(this.lastCalibrationTime).toLocaleString('zh-CN') : '未校准';
    
    // 计算剩余时间
    let remainingTime = '未知';
    if (this.nextSwitchTime) {
      const diff = this.nextSwitchTime.getTime() - now.getTime();
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        remainingTime = `${hours}小时${minutes}分钟`;
      } else {
        remainingTime = '即将切换';
      }
    }
    
    const info = `当前时间: ${currentTime}\n下次切换: ${nextSwitchTime}\n剩余时间: ${remainingTime}\n上次校准: ${lastCalibrationTime}\n时间偏差: ${this.timeOffset}毫秒`;
    
    console.log('[自动主题切换] 定时器信息:', info);
    
    if (typeof utils !== 'undefined' && utils.snackbarShow) {
       utils.snackbarShow(`定时器信息:\n当前时间: ${currentTime}\n剩余时间: ${remainingTime}`, false, 5000);
     } else {
       alert(info);
     }
  },

  // 确保主题状态正确初始化
  ensureThemeInitialized() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    // 如果data-theme属性不存在或为空，从localStorage获取或设置默认值
    if (!currentTheme || currentTheme === 'null') {
      let savedTheme = null;
      
      // 尝试从utils.saveToLocal获取
      if (typeof utils !== 'undefined' && utils.saveToLocal && utils.saveToLocal.get) {
        savedTheme = utils.saveToLocal.get('theme');
      }
      
      // 如果utils不可用，从localStorage获取
      if (!savedTheme) {
        savedTheme = localStorage.getItem('theme');
      }
      
      // 如果仍然没有保存的主题，设置默认主题为light
      if (!savedTheme) {
        savedTheme = 'light';
      }
      
      // 设置主题属性
      document.documentElement.setAttribute('data-theme', savedTheme);
      console.log(`[自动主题切换] 初始化主题为: ${savedTheme}`);
    } else {
      console.log(`[自动主题切换] 当前主题: ${currentTheme}`);
    }
  },

  // 初始化
  async init() {
    console.log('[自动主题切换] 正在初始化...');
    
    // 检查必要的依赖
    if (typeof utils === 'undefined') {
      console.warn('[自动主题切换] utils对象未找到，部分功能可能受限');
    }
    
    // 确保主题状态正确初始化
    this.ensureThemeInitialized();
    
    await this.startAutoSwitch();
    
    if (typeof utils !== 'undefined' && utils.snackbarShow) {
      utils.snackbarShow('已启用网络时间自动切换 (定时器模式)', false, 3000);
    }
  }
};

// 页面加载完成后自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // 延迟1秒初始化，确保其他脚本已加载
    setTimeout(async () => {
      if (window.autoThemeSwitch) {
        await window.autoThemeSwitch.init();
      }
    }, 1000);
  });
} else {
  // 如果页面已经加载完成
  setTimeout(async () => {
    if (window.autoThemeSwitch) {
      await window.autoThemeSwitch.init();
    }
  }, 1000);
}

// 导出到全局作用域
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.autoThemeSwitch;
}