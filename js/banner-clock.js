// 横幅时间显示小组件
// 在首页横幅区域显示实时时间

class BannerClock {
  constructor() {
    this.clockElement = null;
    this.timer = null;
    this.isInitialized = false;
  }

  // 初始化时钟组件
  init() {
    if (this.isInitialized) {
      console.log('[横幅时钟] 已经初始化过了');
      return;
    }

    // 检查是否在首页
    if (!this.isHomePage()) {
      console.log('[横幅时钟] 不在首页，跳过初始化');
      return;
    }

    // 等待横幅元素加载完成
    this.waitForBanner();
  }

  // 检查是否在首页
  isHomePage() {
    return window.location.pathname === '/' || window.location.pathname === '/index.html';
  }

  // 等待横幅元素加载
  waitForBanner() {
    const checkBanner = () => {
      const bannerContainer = document.querySelector('#banners');
      if (bannerContainer) {
        this.createClockElement(bannerContainer);
        this.isInitialized = true;
      } else {
        // 如果横幅还没加载，继续等待
        setTimeout(checkBanner, 100);
      }
    };
    checkBanner();
  }

  // 创建时钟元素
  createClockElement(container) {
    // 创建时钟容器
    this.clockElement = document.createElement('div');
    this.clockElement.className = 'banner-clock';
    this.clockElement.innerHTML = `
      <div class="clock-time"></div>
      <div class="clock-date"></div>
    `;

    // 添加样式
    this.addStyles();

    // 将时钟添加到横幅容器内
    container.appendChild(this.clockElement);

    // 开始更新时间
    this.updateTime();
    this.startTimer();

    console.log('[横幅时钟] 时钟组件已初始化');
  }

  // 添加CSS样式
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .banner-clock {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 12px 16px;
        color: white;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
        z-index: 10;
        user-select: none;
      }

      .banner-clock:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
      }

      .clock-time {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 4px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }

      .clock-date {
        font-size: 12px;
        opacity: 0.9;
        font-weight: 400;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }

      /* 深色主题适配 */
      [data-theme="dark"] .banner-clock {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      [data-theme="dark"] .banner-clock:hover {
        background: rgba(0, 0, 0, 0.4);
      }

      /* 响应式设计 */
      @media screen and (max-width: 768px) {
        .banner-clock {
          top: 15px;
          right: 15px;
          padding: 10px 12px;
        }

        .clock-time {
          font-size: 16px;
        }

        .clock-date {
          font-size: 11px;
        }
      }

      @media screen and (max-width: 480px) {
        .banner-clock {
          top: 10px;
          right: 10px;
          padding: 8px 10px;
        }

        .clock-time {
          font-size: 14px;
        }

        .clock-date {
          font-size: 10px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 更新时间显示
  updateTime() {
    if (!this.clockElement) return;

    const now = new Date();
    
    // 格式化时间
    const timeString = now.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // 格式化日期
    const dateString = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    });

    // 更新显示
    const timeElement = this.clockElement.querySelector('.clock-time');
    const dateElement = this.clockElement.querySelector('.clock-date');
    
    if (timeElement) timeElement.textContent = timeString;
    if (dateElement) dateElement.textContent = dateString;
  }

  // 开始定时器
  startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    this.timer = setInterval(() => {
      this.updateTime();
    }, 1000);
  }



  // 停止定时器
  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // 销毁组件
  destroy() {
    this.stopTimer();
    if (this.clockElement && this.clockElement.parentNode) {
      this.clockElement.parentNode.removeChild(this.clockElement);
    }
    this.clockElement = null;
    this.isInitialized = false;
    console.log('[横幅时钟] 组件已销毁');
  }
}

// 创建全局实例
window.bannerClock = new BannerClock();

// 页面加载完成后自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (window.bannerClock) {
        window.bannerClock.init();
      }
    }, 1500); // 延迟1.5秒确保横幅已加载
  });
} else {
  setTimeout(() => {
    if (window.bannerClock) {
      window.bannerClock.init();
    }
  }, 1500);
}

// 页面切换时重新初始化（适用于SPA）
window.addEventListener('pjax:complete', () => {
  setTimeout(() => {
    if (window.bannerClock) {
      window.bannerClock.destroy();
      window.bannerClock.init();
    }
  }, 500);
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  if (window.bannerClock) {
    window.bannerClock.destroy();
  }
});