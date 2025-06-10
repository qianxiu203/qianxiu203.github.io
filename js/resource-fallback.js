/**
 * 资源加载失败回退处理
 * 用于处理背景图片、字体等静态资源加载失败的情况
 */

(function() {
  'use strict';

  // 背景图片加载检测和回退
  function checkBackgroundImages() {
    const container = document.querySelector('.container');
    const header = document.querySelector('.header');
    
    if (container) {
      // 检测主背景图片
      const bgImage = new Image();
      bgImage.onload = function() {
        console.log('背景图片加载成功');
      };
      bgImage.onerror = function() {
        console.warn('主背景图片加载失败，启用回退样式');
        container.classList.add('bg-fallback');
      };
      bgImage.src = '/imgs/bg-cover.jpeg';
    }
    
    if (header) {
      // 检测头部背景图片
      const topImage = new Image();
      topImage.onload = function() {
        console.log('头部背景图片加载成功');
      };
      topImage.onerror = function() {
        console.warn('头部背景图片加载失败，启用回退样式');
        header.classList.add('header-bg-fallback');
      };
      topImage.src = '/imgs/top-cover.jpeg';
    }
  }

  // 字体加载检测
  function checkFontLoading() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function() {
        console.log('字体加载完成');
      }).catch(function() {
        console.warn('字体加载失败，使用系统字体');
        document.body.classList.add('font-fallback');
      });
    }
  }

  // 图片懒加载错误处理增强
  function enhanceImageErrorHandling() {
    // 监听所有图片加载错误
    document.addEventListener('error', function(e) {
      if (e.target.tagName === 'IMG') {
        const img = e.target;
        
        // 如果是封面图片，尝试使用默认封面
        if (img.classList.contains('index-article--cover') || 
            img.classList.contains('article-cover')) {
          
          // 尝试使用SVG默认封面
          if (!img.src.includes('default-cover.svg')) {
            img.src = '/imgs/covers/default-cover.svg';
            return;
          }
          
          // 如果SVG也失败，使用纯CSS样式
          img.style.display = 'none';
          const parent = img.closest('.index-article--box') || img.parentElement;
          if (parent) {
            parent.classList.add('img-error');
          }
        }
      }
    }, true);
  }

  // 网络状态检测
  function checkNetworkStatus() {
    if ('navigator' in window && 'onLine' in navigator) {
      function updateNetworkStatus() {
        if (!navigator.onLine) {
          console.warn('网络连接断开，启用离线模式');
          document.body.classList.add('offline-mode');
        } else {
          console.log('网络连接正常');
          document.body.classList.remove('offline-mode');
        }
      }
      
      window.addEventListener('online', updateNetworkStatus);
      window.addEventListener('offline', updateNetworkStatus);
      updateNetworkStatus();
    }
  }

  // 资源重试机制
  function retryFailedResources() {
    const retryCount = 3;
    const retryDelay = 2000;
    
    function retryResource(url, type, attempt = 1) {
      return new Promise((resolve, reject) => {
        if (attempt > retryCount) {
          reject(new Error(`资源重试失败: ${url}`));
          return;
        }
        
        const element = type === 'image' ? new Image() : document.createElement('link');
        
        element.onload = () => resolve(element);
        element.onerror = () => {
          console.warn(`资源加载失败，第${attempt}次重试: ${url}`);
          setTimeout(() => {
            retryResource(url, type, attempt + 1).then(resolve).catch(reject);
          }, retryDelay * attempt);
        };
        
        if (type === 'image') {
          element.src = url;
        } else {
          element.rel = 'stylesheet';
          element.href = url;
          document.head.appendChild(element);
        }
      });
    }
    
    // 暴露重试函数到全局
    window.retryResource = retryResource;
  }

  // 性能监控
  function monitorPerformance() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', function() {
        setTimeout(function() {
          const resources = performance.getEntriesByType('resource');
          const failedResources = resources.filter(resource => 
            resource.transferSize === 0 && resource.decodedBodySize === 0
          );
          
          if (failedResources.length > 0) {
            console.warn('检测到资源加载失败:', failedResources.map(r => r.name));
          }
        }, 1000);
      });
    }
  }

  // 初始化所有功能
  function init() {
    // DOM加载完成后执行
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        checkBackgroundImages();
        checkFontLoading();
        enhanceImageErrorHandling();
        checkNetworkStatus();
        retryFailedResources();
        monitorPerformance();
      });
    } else {
      checkBackgroundImages();
      checkFontLoading();
      enhanceImageErrorHandling();
      checkNetworkStatus();
      retryFailedResources();
      monitorPerformance();
    }
  }

  // 启动
  init();

})();
