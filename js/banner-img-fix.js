/**
 * 横幅背景图片修复脚本
 * 将CSS background-image改为使用img标签实现
 * 解决Cloudflare Pages等部署环境的图片加载问题
 */

class BannerImageFix {
  constructor() {
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) {
      console.log('[横幅图片修复] 已经初始化过了');
      return;
    }

    // 等待页面加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.fixBannerImage());
    } else {
      this.fixBannerImage();
    }
  }

  fixBannerImage() {
    const bannerElement = document.querySelector('#banners');
    if (!bannerElement) {
      console.log('[横幅图片修复] 未找到横幅元素');
      return;
    }

    // 获取当前的背景图片URL
    const computedStyle = window.getComputedStyle(bannerElement);
    const backgroundImage = computedStyle.backgroundImage;
    
    if (backgroundImage && backgroundImage !== 'none') {
      // 提取URL
      const urlMatch = backgroundImage.match(/url\(["']?([^"'\)]+)["']?\)/);
      if (urlMatch && urlMatch[1]) {
        const imageUrl = urlMatch[1];
        console.log('[横幅图片修复] 检测到背景图片:', imageUrl);
        
        // 创建img元素
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.alt = '横幅背景图片';
        imgElement.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          z-index: -1;
        `;
        
        // 移除原有的背景图片
        bannerElement.style.backgroundImage = 'none';
        
        // 确保横幅元素有相对定位
        if (getComputedStyle(bannerElement).position === 'static') {
          bannerElement.style.position = 'relative';
        }
        
        // 将img元素插入到横幅的最前面
        bannerElement.insertBefore(imgElement, bannerElement.firstChild);
        
        console.log('[横幅图片修复] 成功将背景图片改为img标签实现');
        this.isInitialized = true;
      }
    } else {
      console.log('[横幅图片修复] 未检测到背景图片');
    }
  }
}

// 自动初始化
if (typeof window !== 'undefined') {
  const bannerImageFix = new BannerImageFix();
  bannerImageFix.init();
  
  // 将实例暴露到全局，方便调试
  window.bannerImageFix = bannerImageFix;
}