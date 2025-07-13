// 自动主题切换功能
window.autoThemeSwitch = {
  timer: null,
  checkInterval: 60000, // 60秒检查一次
  cachedTime: null,
  cacheExpiry: 300000, // 5分钟缓存过期
  lastCacheTime: 0,

  // 获取中国时间
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
            console.log(`[自动主题切换] 成功获取网络时间: ${chinaTime.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}`);
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

  // 检查并切换主题
  async checkAndSwitchTheme() {
    try {
      const currentTime = await this.getChinaTime();
      const hour = currentTime.getHours();
      const timeString = currentTime.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        hour12: false
      });
      
      // 6:00-18:00 浅色主题，18:00-6:00 深色主题
      const shouldBeLightTheme = hour >= 6 && hour < 18;
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const targetTheme = shouldBeLightTheme ? 'light' : 'dark';
      
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
        
        // 显示切换提示
        if (typeof utils !== 'undefined' && utils.snackbarShow) {
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

  // 启动自动切换
  startAutoSwitch() {
    if (this.timer) {
      console.log('[自动主题切换] 已在运行中');
      return;
    }
    
    console.log(`[自动主题切换] 启动自动切换，检查间隔: ${this.checkInterval / 1000}秒`);
    
    // 立即执行一次检查
    this.checkAndSwitchTheme();
    
    // 设置定时器
    this.timer = setInterval(() => {
      this.checkAndSwitchTheme();
    }, this.checkInterval);
  },

  // 停止自动切换
  stopAutoSwitch() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[自动主题切换] 已停止自动切换');
      
      if (typeof utils !== 'undefined' && utils.snackbarShow) {
        utils.snackbarShow('已停止自动主题切换', false, 2000);
      }
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
    this.cachedTime = null;
    this.lastCacheTime = 0;
    
    try {
      const newTime = await this.getChinaTime();
      const timeString = newTime.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        hour12: false
      });
      
      if (typeof utils !== 'undefined' && utils.snackbarShow) {
        utils.snackbarShow(`网络时间已刷新: ${timeString}`, false, 3000);
      }
      
      return newTime;
    } catch (error) {
      console.error('[自动主题切换] 刷新网络时间失败:', error);
      
      if (typeof utils !== 'undefined' && utils.snackbarShow) {
        utils.snackbarShow('网络时间刷新失败，请检查网络连接', false, 3000);
      }
    }
  },

  // 初始化
  init() {
    console.log('[自动主题切换] 正在初始化...');
    
    // 检查必要的依赖
    if (typeof utils === 'undefined') {
      console.warn('[自动主题切换] utils对象未找到，部分功能可能受限');
    }
    
    this.startAutoSwitch();
    
    if (typeof utils !== 'undefined' && utils.snackbarShow) {
      utils.snackbarShow('已启用网络时间自动切换模式', false, 3000);
    }
  }
};

// 页面加载完成后自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // 延迟1秒初始化，确保其他脚本已加载
    setTimeout(() => {
      if (window.autoThemeSwitch) {
        window.autoThemeSwitch.init();
      }
    }, 1000);
  });
} else {
  // 如果页面已经加载完成
  setTimeout(() => {
    if (window.autoThemeSwitch) {
      window.autoThemeSwitch.init();
    }
  }, 1000);
}

// 导出到全局作用域
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.autoThemeSwitch;
}