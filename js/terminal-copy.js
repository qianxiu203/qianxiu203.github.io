// 终端风格代码块复制功能
(function() {
  'use strict';

  // 复制文本到剪贴板
  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      // 使用现代 Clipboard API
      return navigator.clipboard.writeText(text);
    } else {
      // 降级方案：使用 execCommand
      return new Promise((resolve, reject) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          if (successful) {
            resolve();
          } else {
            reject(new Error('复制失败'));
          }
        } catch (err) {
          document.body.removeChild(textArea);
          reject(err);
        }
      });
    }
  }

  // 处理复制按钮点击事件
  function handleCopyClick(event) {
    const button = event.target;
    const terminalBlock = button.closest('.terminal-block');
    const textElement = terminalBlock.querySelector('.terminal-text');
    
    if (!textElement) {
      console.error('未找到要复制的文本元素');
      return;
    }

    const textToCopy = textElement.textContent.trim();
    
    copyToClipboard(textToCopy)
      .then(() => {
        // 复制成功
        const originalText = button.textContent;
        button.textContent = '已复制!';
        button.classList.add('copied');
        
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('copied');
        }, 2000);
      })
      .catch((err) => {
        console.error('复制失败:', err);
        const originalText = button.textContent;
        button.textContent = '复制失败';
        button.style.background = '#ff5f57';
        
        setTimeout(() => {
          button.textContent = originalText;
          button.style.background = '';
        }, 2000);
      });
  }

  // 初始化复制功能
  function initTerminalCopy() {
    // 为所有复制按钮添加事件监听器
    document.addEventListener('click', function(event) {
      if (event.target.classList.contains('copy-button')) {
        event.preventDefault();
        handleCopyClick(event);
      }
    });
  }

  // 创建终端代码块的辅助函数
  window.createTerminalBlock = function(content, title = 'Terminal') {
    return `
      <div class="terminal-block">
        <div class="terminal-header">
          <div class="terminal-controls">
            <div class="terminal-control close"></div>
            <div class="terminal-control minimize"></div>
            <div class="terminal-control maximize"></div>
          </div>
          <div class="terminal-title">${title}</div>
        </div>
        <div class="terminal-content">
          <span class="terminal-prompt">$</span>
          <span class="terminal-text">${content}</span>
          <button class="copy-button">复制</button>
        </div>
      </div>
    `;
  };

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTerminalCopy);
  } else {
    initTerminalCopy();
  }

  // 支持 PJAX 页面切换
  if (typeof $ !== 'undefined' && $.fn.pjax) {
    $(document).on('pjax:complete', initTerminalCopy);
  }

})();

// 全局函数：复制文本（向后兼容）
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('文本已复制到剪贴板');
    }).catch(err => {
      console.error('复制失败:', err);
    });
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      console.log('文本已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
    }
    
    document.body.removeChild(textArea);
  }
}