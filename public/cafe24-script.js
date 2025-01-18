(function() {
  const MOBILE_BREAKPOINT = 768;
  const CACHE_DURATION = 1000 * 60 * 1;
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

  const MEDIA_ICONS = {
    IMAGE: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
    VIDEO: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-play"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/></svg>`
  };

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

        // manual 모드일 때는 div#instagram-feed를 찾아서 없으면 종료
        if (this.insertType === 'manual') {
          this.container = document.getElementById('instagram-feed');
          if (!this.container) {
            console.debug('Manual mode: Container not found, stopping init');
            return;
          }
        } else {
          // auto 모드일 때만 container 생성
          this.createContainer();
          if (!this.container) {
            console.debug('Auto mode: Container creation failed, stopping init');
            return;
          }
        }

        this.container.style.cssText = `
          width: 100%;
          margin: 40px 0 40px 0;
        `;

        window.addEventListener('resize', this.handleResize);
        this.handleResize();
        await this.render(); // await 추가
      } catch (error) {
        console.error('Instagram Feed Error:', error);
      }
    }

    createContainer() {
      // insertType 체크 제거 (이미 init에서 체크함)
      const footer = document.querySelector('#footer');
      if (!footer) return;

      this.container = document.createElement('div');
      this.container.id = 'instagram-feed';
      this.container.style.cssText = `
        width: 100%;
        margin: 40px 0 40px 0;
      `;

      footer.parentNode.insertBefore(this.container, footer);
    }

    handleResize() {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const newLayout = isMobile ? 'mobile' : 'pc';
      
      // 레이아웃이 이미 렌더링되어 있지 않은 경우에만 최초 렌더링
      if (!this.container.querySelector(`#instagram-feed-${newLayout}-${this.mallId}`)) {
        this.render();
        return;
      }

      // 레이아웃 전환은 CSS로만 처리
      if (this.currentLayout !== newLayout) {
        this.currentLayout = newLayout;
      }
    }

    validateSettings(settings) {
      if (!settings) return false;
      const required = ['layout', 'columns', 'rows', 'gap', 'borderRadius', 'showMediaType'];
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
        data: {
          ...data,
          insertType: this.insertType // insertType 추가
        }
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
        this.insertType = cached.pc.insertType; // insertType 불러오기
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
          #instagram-feed-pc-${this.mallId} { 
            display: none !important;
          }
          #instagram-feed-mobile-${this.mallId} {
            display: block !important;
          }
        }
        @media (min-width: ${MOBILE_BREAKPOINT}px) {
          #instagram-feed-pc-${this.mallId} { 
            display: block !important;
          }
          #instagram-feed-mobile-${this.mallId} {
            display: none !important;
          }
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
          border-radius: ${settings.borderRadius}px;
          overflow: hidden;
          width: 100%;
        }
        .embla-${type}-${this.mallId} {
          overflow: hidden;
          position: relative;
          width: 100%;
          will-change: transform;
          -webkit-backface-visibility: hidden;
          -webkit-perspective: 1000;
          -webkit-transform: translate3d(0,0,0);
        }
        .embla-container-${type}-${this.mallId} {
          display: flex;
          gap: ${settings.gap}px;
          padding: 0 ${settings.gap}px;
          transform: translate3d(0,0,0);
          will-change: transform;
          user-select: none;
        }
        .embla-container-${type}-${this.mallId} .feed-item-${type}-${this.mallId} {
          width: ${100 / settings.columns}%;
          flex-shrink: 0;
        }
        .media-type-icon-${type}-${this.mallId} {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 4px;
          z-index: 2;
          color: black;
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
      const maxItems = settings.columns * settings.rows; // 설정된 컬럼 * 로우
      
      const filtered = this.mediaItems
        .filter(item => this.matchesFilter(item))
        .slice(0, maxItems);

      const itemsHtml = filtered
        .map(item => this.renderItem(item, type))
        .join('');

      return `<div class="feed-grid-${type}-${this.mallId}">${itemsHtml}</div>`;
    }

    // 필터 적용 후 캐러셀 표시
    renderCarousel(type) {
      const settings = type === 'mobile' ? this.mobileSettings : this.pcSettings;
      const maxItems = settings.columns * 3; // 설정된 컬럼 수의 3배
      
      const filtered = this.mediaItems
        .filter(item => this.matchesFilter(item))
        .slice(0, maxItems);

      const itemsHtml = filtered.map(item => this.renderItem(item, type)).join('');

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
      const settings = type === 'mobile' ? this.mobileSettings : this.pcSettings;
      const mediaType = item.media_type === 'VIDEO' ? 'VIDEO' : 'IMAGE';
      
      return `
        <div class="feed-item-${type}-${this.mallId}">
          <a href="${item.permalink}" target="_blank" rel="noopener noreferrer">
            <img 
              src="${mediaType === 'VIDEO' ? item.thumbnail_url : item.media_url}" 
              alt="${item.caption || ''}"
              loading="lazy"
              style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: 1 / 1;"
            >
            ${settings.showMediaType ? `
              <div class="media-type-icon-${type}-${this.mallId}">
                ${MEDIA_ICONS[mediaType]}
              </div>
            ` : ''}
          </a>
        </div>
      `;
    }

    // 캐러셀 초기화
    initCarousels() {
      // DOM 업데이트를 위한 지연
      setTimeout(() => {
        ['pc', 'mobile'].forEach(type => {
          const settings = type === 'mobile' ? this.mobileSettings : this.pcSettings;
          if (settings.layout !== 'carousel') return;
    
          const element = this.container.querySelector(`.embla-${type}-${this.mallId}`);
          if (!element || !window.EmblaCarousel) return;
    
          // 기존 캐러셀이 있으면 제거
          if (element.embla) {
            element.embla.destroy();
          }
    
          // 캐러셀 초기화 전 스타일 강제 적용
          const container = element.querySelector(`.embla-container-${type}-${this.mallId}`);
          if (container) {
            container.style.display = 'flex';
          }
    
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
      }, 100); // 100ms 지연
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