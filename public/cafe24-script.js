(function() {
  const MOBILE_BREAKPOINT = 768;
  const CACHE_DURATION = 1000 * 60 * 30;
  const EMBLA_CDN = 'https://unpkg.com/embla-carousel/embla-carousel.umd.js';
  const RESIZE_THROTTLE = 250;

  // resize 함수 스로틀링
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  // 캐시 키 생성
  const getCacheKey = (mallId, type) => `instagram_feed_cache_${mallId}_${type}`;

  // CAFE24API 로드 대기
  function waitForCAFE24API() {
    return new Promise((resolve) => {
      if (window.CAFE24API) {
        resolve(window.CAFE24API);
        return;
      }

      const checkAPI = setInterval(() => {
        if (window.CAFE24API) {
          clearInterval(checkAPI);
          resolve(window.CAFE24API);
        }
      }, 100);
    });
  }

  class InstagramFeed {
    constructor(mallId) {
      this.mallId = mallId;
      this.apiEndpoint = 'https://cithmb.vercel.app/api/cafe24-script/get';
      this.container = null;
      this.pcSettings = null;
      this.mobileSettings = null;
      this.mediaItems = [];
      this.feedFilter = 'all';
      this.currentLayout = null;
      this.handleResize = throttle(this.handleResize.bind(this), RESIZE_THROTTLE);
      this.insertType = null; // 'auto' | 'manual'
      this.init();
    }

    createContainer() {
      if (this.insertType === 'manual') return;
      
      const footer = document.querySelector('#footer');
      if (!footer) return;

      this.container = document.createElement('div');
      this.container.id = 'instagram-feed';
      this.container.style.cssText = `
        width: 100%;
        max-width: 1200px;
        margin: 0 auto 40px;
        padding: 0 20px;
      `;

      footer.parentNode.insertBefore(this.container, footer);
    }

    // 초기화
    async init() {
      try {
        console.debug('Init start');
        await this.loadSettings();
        console.debug('Settings loaded:', {
          insertType: this.insertType,
          pcSettings: !!this.pcSettings,
          mobileSettings: !!this.mobileSettings
        });
        
        if (this.insertType === 'manual') {
          this.container = document.getElementById('instagram-feed');
          console.debug('Manual mode container:', !!this.container);
        } else {
          this.createContainer();
        }
        
        if (!this.container) {
          console.debug('Container not found, stopping init');
          return;
        }

        this.container.style.cssText = `
          width: 100%;
          max-width: 1200px;
          margin: 0 auto 40px;
          padding: 0 20px;
        `;

        window.addEventListener('resize', this.handleResize);
        this.handleResize();
        await this.render(); // await 추가
      } catch (error) {
        console.error('Instagram Feed Error:', error);
      }
    }

    handleResize() {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const newLayout = isMobile ? 'mobile' : 'pc';
      
      if (this.currentLayout !== newLayout) {
        this.currentLayout = newLayout;
        this.render();
      }
    }

    validateSettings(settings) {
      if (!settings) return false;
      const required = ['layout', 'columns', 'rows', 'gap', 'borderRadius'];
      return required.every(prop => settings.hasOwnProperty(prop));
    }

    getCache(type) {
      try {
        const cached = localStorage.getItem(getCacheKey(this.mallId, type));
        if (!cached) return null;

        const { timestamp, data } = JSON.parse(cached);
        if (!data || !this.validateSettings(data.settings)) {
          localStorage.removeItem(getCacheKey(this.mallId, type));
          return null;
        }
        if (Date.now() - timestamp > CACHE_DURATION) {
          localStorage.removeItem(getCacheKey(this.mallId, type));
          return null;
        }
        return data;
      } catch (error) {
        console.debug('Cache read error:', error);
        return null;
      }
    }

    setCache(type, data) {
      localStorage.setItem(getCacheKey(this.mallId, type), JSON.stringify({
        timestamp: Date.now(),
        data
      }));
    }

    // PC/모바일 설정 및 미디어 필터 로드
    async loadSettings() {
      const cached = {
        pc: this.getCache('pc'),
        mobile: this.getCache('mobile')
      };

      // 캐시에 PC/모바일 설정 있으면
      if (cached.pc && cached.mobile) {
        this.pcSettings = cached.pc.settings;
        this.mobileSettings = cached.mobile.settings;
        this.mediaItems = cached.pc.mediaItems;
        if (cached.pc.feedFilter) {
          this.feedFilter = cached.pc.feedFilter;
        }
        await this.loadEmblaIfNeeded();
        return;
      }

      // 없으면 새로 요청
      await this.loadFreshData();
    }

    async loadFreshData() {
      try {
        const response = await fetch(`${this.apiEndpoint}?mallId=${this.mallId}`);
        if (!response.ok) throw new Error('API 응답 실패');
        
        const data = await response.json();
        
        // 삽입 타입 설정 추가
        this.insertType = data.insert_type || 'auto';

        // PC/모바일 레이아웃 설정 검증
        if (!this.validateSettings(data.pc_feed_settings) || 
            !this.validateSettings(data.mobile_feed_settings)) {
          throw new Error('설정 포맷 오류');
        }
        this.pcSettings = data.pc_feed_settings;
        this.mobileSettings = data.mobile_feed_settings;

        // feed_filter(예: 'all', 'image', 'video') 받기. 없으면 'all'로 기본값
        if (data.feed_filter) {
          this.feedFilter = data.feed_filter;
        }

        // 인스타그램 미디어
        if (data.instagram_access_token) {
          const mediaResponse = await this.fetchInstagramMedia(data.instagram_access_token);
          this.mediaItems = (mediaResponse.data || []).filter(item => !!item.media_url);
        }

        // 캐시에 저장
        this.setCache('pc', {
          settings: this.pcSettings,
          mediaItems: this.mediaItems,
          feedFilter: this.feedFilter
        });
        this.setCache('mobile', {
          settings: this.mobileSettings,
          mediaItems: this.mediaItems,
          feedFilter: this.feedFilter
        });

        // 캐러셀이 필요한지 확인 후 로드
        await this.loadEmblaIfNeeded();
        this.render();
      } catch (error) {
        console.debug('Data Load Error:', error);

        // 폴백: 캐시 사용
        const cached = {
          pc: this.getCache('pc'),
          mobile: this.getCache('mobile')
        };
        if (cached.pc && cached.mobile) {
          this.pcSettings = cached.pc.settings;
          this.mobileSettings = cached.mobile.settings;
          this.mediaItems = cached.pc.mediaItems;
          this.feedFilter = cached.pc.feedFilter || 'all';
          this.render();
        }
      }
    }

    // Embla 캐러셀 외부 스크립트 로드
    async loadEmblaIfNeeded() {
      if (this.pcSettings?.layout === 'carousel' || 
          this.mobileSettings?.layout === 'carousel') {
        return new Promise((resolve, reject) => {
          if (window.EmblaCarousel) return resolve();
          
          const script = document.createElement('script');
          script.src = EMBLA_CDN;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
    }

    // 인스타그램 미디어 API
    async fetchInstagramMedia(token) {
      const endpoint = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&access_token=${token}`;
      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Instagram API 요청 실패');
        const data = await response.json();
        return {
          ...data,
          data: data.data.map(item => ({
            ...item,
            display_url: item.thumbnail_url || item.media_url
          }))
        };
      } catch (error) {
        console.debug('Instagram API Error:', error);
        return { data: [] };
      }
    }

    // PC/모바일 각각 스타일 삽입
    injectStyles() {
      const styleId = `instagram-feed-styles-${this.mallId}`;
      let styleTag = document.getElementById(styleId);
      
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
      }

      styleTag.textContent = `
        ${this.generateStyles('pc')}
        ${this.generateStyles('mobile')}
        @media (max-width: ${MOBILE_BREAKPOINT - 1}px) {
          #instagram-feed-pc-${this.mallId} { display: none; }
        }
        @media (min-width: ${MOBILE_BREAKPOINT}px) {
          #instagram-feed-mobile-${this.mallId} { display: none; }
        }
      `;
    }

    generateStyles(type) {
      const settings = type === 'mobile' ? this.mobileSettings : this.pcSettings;
      if (!settings) return '';

      return `
        #instagram-feed-${type}-${this.mallId} {
          width: 100%;
          overflow: hidden;
        }
        .feed-grid-${type}-${this.mallId} {
          display: grid;
          grid-template-columns: repeat(${settings.columns}, 1fr);
          gap: ${settings.gap}px;
        }
        .feed-item-${type}-${this.mallId} {
          position: relative;
          aspect-ratio: 1;
          border-radius: ${settings.borderRadius}px;
          overflow: hidden;
        }
        .embla-${type}-${this.mallId} {
          overflow: hidden;
          position: relative;
        }
        .embla-container-${type}-${this.mallId} {
          display: flex;
          gap: ${settings.gap}px;
          user-select: none;
        }
      `;
    }

    // 뷰포트에 따라 PC/모바일 레이아웃 렌더
    async render() {
      console.debug('Render start', {
        container: !!this.container,
        pcSettings: !!this.pcSettings,
        mobileSettings: !!this.mobileSettings,
        mediaItems: this.mediaItems.length
      });

      if (!this.container || !this.pcSettings || !this.mobileSettings) {
        console.debug('Render requirements not met');
        return;
      }

      await this.loadEmblaIfNeeded();
      this.injectStyles();
      
      this.container.innerHTML = `
        <div id="instagram-feed-pc-${this.mallId}">
          ${this.renderLayout('pc')}
        </div>
        <div id="instagram-feed-mobile-${this.mallId}">
          ${this.renderLayout('mobile')}
        </div>
      `;

      this.initCarousels();
    }

    // PC/모바일 레이아웃 분기
    renderLayout(type) {
      const settings = type === 'mobile' ? this.mobileSettings : this.pcSettings;
      return settings.layout === 'carousel' 
        ? this.renderCarousel(type) 
        : this.renderGrid(type);
    }

    // 필터 적용 후 격자 표시
    renderGrid(type) {
      const settings = type === 'mobile' ? this.mobileSettings : this.pcSettings;
      const filtered = this.mediaItems
        .filter(item => this.matchesFilter(item))
        .slice(0, settings.columns * settings.rows);

      const itemsHtml = filtered
        .map(item => this.renderItem(item, type))
        .join('');

      return `<div class="feed-grid-${type}-${this.mallId}">${itemsHtml}</div>`;
    }

    // 필터 적용 후 캐러셀 표시
    renderCarousel(type) {
      const filtered = this.mediaItems
        .filter(item => this.matchesFilter(item));

      const itemsHtml = filtered
        .map(item => this.renderItem(item, type))
        .join('');

      return `
        <div class="embla-${type}-${this.mallId}">
          <div class="embla-container-${type}-${this.mallId}">
            ${itemsHtml}
          </div>
        </div>
      `;
    }

    // 필터 로직
    matchesFilter(item) {
      if (this.feedFilter === 'all') {
        return true;
      } else if (this.feedFilter === 'image') {
        // 이미지(CAROUSEL_ALBUM 포함), 동영상은 제외
        return item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM';
      } else if (this.feedFilter === 'video') {
        // 동영상만 표시
        return item.media_type === 'VIDEO';
      }
      return true;
    }

    // 미디어 단위 렌더링
    renderItem(item, type) {
      return `
        <div class="feed-item-${type}-${this.mallId}">
          <a 
            href="${item.permalink}" 
            target="_blank"
            rel="noopener noreferrer"
            style="display: block; width: 100%; height: 100%;"
          >
            <img 
              src="${item.display_url}" 
              alt="${item.caption || ''}"
              loading="lazy"
              style="width: 100%; height: 100%; object-fit: cover;"
            >
          </a>
        </div>
      `;
    }

    // 캐러셀 초기화
    initCarousels() {
      ['pc', 'mobile'].forEach(type => {
        const settings = type === 'mobile' ? this.mobileSettings : this.pcSettings;
        if (settings.layout !== 'carousel') return;

        const element = this.container.querySelector(`.embla-${type}-${this.mallId}`);
        if (!element || !window.EmblaCarousel) return;

        // 기존 캐러셀이 있으면 재사용
        if (element.embla) return;

        const embla = new window.EmblaCarousel(element, {
          align: 'center',
          containScroll: 'keepSnaps',
          dragFree: false,
          loop: true,
          skipSnaps: true,
          direction: 'ltr',
          inViewThreshold: 0.7
        });

        element.embla = embla;
      });
    }
  }

  // 초기화 함수
  async function initialize() {
    try {
      const CAFE24API = await waitForCAFE24API();
      const mallId = CAFE24API.MALL_ID;
      new InstagramFeed(mallId);
    } catch (error) {
      console.error('초기화 실패:', error);
    }
  }

  // DOM 로드 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();