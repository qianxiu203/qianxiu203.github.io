/**
 * 背景主题切换器
 * 提供多种美观的背景主题选择
 * 优化移动端适配，避免被状态栏遮挡
 */

(function() {
  'use strict';

  // 可用的主题列表
  const themes = [
    { name: 'default', label: '梦幻紫蓝', class: '' },
    { name: 'tech-blue', label: '科技蓝', class: 'theme-tech-blue' },
    { name: 'warm-orange', label: '温暖橙', class: 'theme-warm-orange' },
    { name: 'forest-green', label: '森林绿', class: 'theme-forest-green' },
    { name: 'sakura-pink', label: '樱花粉', class: 'theme-sakura-pink' },
    { name: 'deep-space', label: '深空紫', class: 'theme-deep-space' },
    { name: 'sunset-yellow', label: '日落黄', class: 'theme-sunset-yellow' }
  ];

  // 当前主题
  let currentTheme = localStorage.getItem('blog-theme') || 'default';

  // 切换模式：'panel' 显示面板选择，'cycle' 直接循环切换
  let switchMode = localStorage.getItem('theme-switch-mode') || 'cycle';

  // 初始化现有的主题切换器UI
  function initExistingSwitcher() {
    const switcher = document.getElementById('theme-switcher');
    if (!switcher) {
      console.warn('主题切换器元素未找到，尝试查找其他选择器');
      // 尝试其他可能的选择器
      const altSwitcher = document.querySelector('.theme-switcher');
      if (altSwitcher) {
        console.log('找到了.theme-switcher元素');
        return altSwitcher;
      }
      return null;
    }

    console.log('找到主题切换器元素:', switcher);

    // 更新主题选项的状态
    const options = switcher.querySelectorAll('.theme-option');
    console.log('找到主题选项:', options.length);

    options.forEach(option => {
      const themeName = option.dataset.theme;
      const theme = themes.find(t => t.name === themeName);
      if (theme) {
        option.dataset.class = theme.class;
        option.classList.toggle('active', themeName === currentTheme);
      }
    });

    return switcher;
  }

  // 应用主题
  function applyTheme(themeName) {
    const theme = themes.find(t => t.name === themeName);
    if (!theme) {
      console.error('未找到主题:', themeName);
      return;
    }

    console.log('开始应用主题:', themeName, theme);
    console.log('应用前body类名:', document.body.className);

    // 移除所有主题类
    themes.forEach(t => {
      if (t.class) {
        document.body.classList.remove(t.class);
        console.log('移除主题类:', t.class);
      }
    });

    // 应用新主题类
    if (theme.class) {
      document.body.classList.add(theme.class);
      console.log('已添加主题类:', theme.class);
    } else {
      console.log('默认主题，不添加类名');
    }

    // 保存到本地存储
    localStorage.setItem('blog-theme', themeName);
    currentTheme = themeName;

    // 更新UI状态
    updateSwitcherUI();

    console.log('应用后body类名:', document.body.className);

    // 验证主题是否生效
    setTimeout(() => {
      const container = document.querySelector('.container');
      if (container) {
        const computedStyle = window.getComputedStyle(container);
        console.log('容器背景样式:', computedStyle.background);
      }
    }, 100);
  }

  // 更新切换器UI状态
  function updateSwitcherUI() {
    const switcher = document.getElementById('theme-switcher');
    if (!switcher) return;

    const options = switcher.querySelectorAll('.theme-option');
    options.forEach(option => {
      const themeName = option.dataset.theme;
      option.classList.toggle('active', themeName === currentTheme);
    });

    // 更新按钮显示的主题名称
    updateToggleButtonText();
  }

  // 更新切换按钮的文本显示
  function updateToggleButtonText() {
    const toggle = document.querySelector('#theme-toggle .theme-text');
    if (!toggle) return;

    const currentThemeObj = themes.find(t => t.name === currentTheme);
    if (currentThemeObj && switchMode === 'cycle') {
      toggle.textContent = currentThemeObj.label;
    } else {
      toggle.textContent = '主题';
    }
  }

  // 循环切换到下一个主题
  function switchToNextTheme() {
    const currentIndex = themes.findIndex(t => t.name === currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];

    applyTheme(nextTheme.name);
    showNotification(`已切换到 ${nextTheme.label} 主题`);
  }

  // 动态调整面板位置，避免被状态栏遮挡
  function adjustPanelPosition(panel) {
    if (!panel) return;

    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    const panelRect = panel.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // 检查面板是否超出屏幕底部
    if (panelRect.bottom > viewportHeight - 20) {
      // 如果超出，调整为向上展开
      panel.style.bottom = 'auto';
      panel.style.top = '100%';
      panel.style.marginTop = '10px';
      panel.style.marginBottom = '0';
    }

    // 检查面板是否超出屏幕右侧
    if (panelRect.right > viewportWidth - 10) {
      panel.style.right = '0';
      panel.style.left = 'auto';
    }

    // 检查面板是否超出屏幕左侧
    if (panelRect.left < 10) {
      panel.style.left = '50%';
      panel.style.right = 'auto';
      panel.style.transform = 'translateX(-50%)';
    }
  }

  // 标记是否已经初始化过
  let isInitialized = false;

  // 初始化
  function init() {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // 应用保存的主题
    applyTheme(currentTheme);

    // 初始化现有的切换器
    const switcher = initExistingSwitcher();
    if (!switcher) return;

    // 初始化按钮文本
    updateToggleButtonText();

    const toggle = switcher.querySelector('#theme-toggle') || switcher.querySelector('.theme-toggle');
    const panel = switcher.querySelector('#theme-panel') || switcher.querySelector('.theme-panel');
    const closeBtn = switcher.querySelector('#theme-close') || switcher.querySelector('.theme-close');

    console.log('主题切换器元素:', { toggle, panel, closeBtn });

    // 避免重复绑定事件
    if (toggle && !toggle.hasAttribute('data-theme-initialized')) {
      toggle.setAttribute('data-theme-initialized', 'true');

      // 根据切换模式绑定不同的事件
      if (switchMode === 'cycle') {
        // 直接循环切换主题
        toggle.addEventListener('click', (e) => {
          console.log('主题切换按钮被点击 - 循环模式');
          e.stopPropagation();
          switchToNextTheme();
        });

        // 右键点击显示面板选择
        toggle.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('右键点击 - 显示主题面板');
          const isShowing = panel.style.display === 'block';

          if (!isShowing) {
            panel.style.display = 'block';
            setTimeout(() => adjustPanelPosition(panel), 50);
          } else {
            panel.style.display = 'none';
          }
        });
      } else {
        // 显示面板选择模式
        toggle.addEventListener('click', (e) => {
          console.log('主题切换按钮被点击 - 面板模式');
          e.stopPropagation();
          const isShowing = panel.style.display === 'block';

          if (!isShowing) {
            panel.style.display = 'block';
            console.log('显示主题面板');
            setTimeout(() => adjustPanelPosition(panel), 50);
          } else {
            panel.style.display = 'none';
            console.log('隐藏主题面板');
          }
        });
      }
    } else if (!toggle) {
      console.error('未找到主题切换按钮元素');
    }

    // 关闭按钮事件
    if (closeBtn && !closeBtn.hasAttribute('data-theme-initialized')) {
      closeBtn.setAttribute('data-theme-initialized', 'true');
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.style.display = 'none';
      });
    }

    // 主题选择事件
    if (panel && !panel.hasAttribute('data-theme-initialized')) {
      panel.setAttribute('data-theme-initialized', 'true');

      panel.addEventListener('click', (e) => {
        const option = e.target.closest('.theme-option');
        if (option) {
          const themeName = option.dataset.theme;
          applyTheme(themeName);
          panel.style.display = 'none';

          // 显示切换成功提示
          const themeName_text = option.querySelector('.theme-name');
          if (themeName_text) {
            showNotification(`已切换到 ${themeName_text.textContent} 主题`);
          }
        }
      });
    }

    // 添加模式切换按钮到面板
    addModeSwitchButton(panel);

    // 点击外部关闭面板（只绑定一次）
    if (!isInitialized) {
      document.addEventListener('click', (e) => {
        const currentSwitcher = document.getElementById('theme-switcher');
        if (currentSwitcher && !currentSwitcher.contains(e.target)) {
          const currentPanel = currentSwitcher.querySelector('#theme-panel');
          if (currentPanel) {
            currentPanel.style.display = 'none';
          }
        }
      });
      isInitialized = true;
    }

    // 监听窗口大小变化，重新调整面板位置
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (panel.style.display === 'block') {
          adjustPanelPosition(panel);
        }
      }, 100);
    });

    // 监听设备方向变化
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        if (panel.style.display === 'block') {
          adjustPanelPosition(panel);
        }
      }, 300); // 等待方向变化完成
    });
  }

  // 添加模式切换按钮
  function addModeSwitchButton(panel) {
    if (!panel || panel.querySelector('.mode-switch-btn')) return;

    const header = panel.querySelector('.theme-panel-header');
    if (!header) return;

    const modeBtn = document.createElement('button');
    modeBtn.className = 'mode-switch-btn';
    modeBtn.innerHTML = switchMode === 'cycle' ? '📋' : '🔄';
    modeBtn.title = switchMode === 'cycle' ? '切换到面板模式' : '切换到循环模式';
    modeBtn.style.cssText = `
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      padding: 4px;
      margin-right: 8px;
      border-radius: 4px;
      transition: background 0.2s ease;
    `;

    modeBtn.addEventListener('mouseenter', () => {
      modeBtn.style.background = 'rgba(0, 0, 0, 0.1)';
    });

    modeBtn.addEventListener('mouseleave', () => {
      modeBtn.style.background = 'none';
    });

    modeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      switchMode = switchMode === 'cycle' ? 'panel' : 'cycle';
      localStorage.setItem('theme-switch-mode', switchMode);

      modeBtn.innerHTML = switchMode === 'cycle' ? '📋' : '🔄';
      modeBtn.title = switchMode === 'cycle' ? '切换到面板模式' : '切换到循环模式';

      updateToggleButtonText();
      showNotification(`已切换到${switchMode === 'cycle' ? '循环' : '面板'}模式`);

      // 关闭面板并重新初始化事件
      panel.style.display = 'none';
      reinitializeToggleEvents();
    });

    header.insertBefore(modeBtn, header.querySelector('.theme-close'));
  }

  // 重新初始化切换按钮事件
  function reinitializeToggleEvents() {
    const toggle = document.querySelector('#theme-toggle');
    if (!toggle) return;

    // 移除旧的事件监听器标记，强制重新绑定
    toggle.removeAttribute('data-theme-initialized');

    // 克隆节点来移除所有事件监听器
    const newToggle = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(newToggle, toggle);

    // 重新初始化
    setTimeout(() => {
      init();
    }, 100);
  }

  // 显示通知
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(102, 126, 234, 0.9);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // 动画显示
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // 3秒后自动消失
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // 启动
  init();

  // 监听pjax事件，确保在页面切换后重新初始化
  if (typeof $ !== 'undefined') {
    $(document).on('pjax:complete', function() {
      console.log('pjax完成，重新初始化主题切换器');
      // 延迟一点时间确保DOM完全加载
      setTimeout(init, 100);
    });
  }

})();
