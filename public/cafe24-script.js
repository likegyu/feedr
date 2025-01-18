!function(){let e=(e,t)=>`instagram_feed_cache_${e}_${t}`,t={IMAGE:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',VIDEO:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-play"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/></svg>'};class i{constructor(e){var t;this.mallId=e,this.apiEndpoint="https://cithmb.vercel.app/api/cafe24-script/get",this.container=null,this.pcSettings=null,this.mobileSettings=null,this.mediaItems=[],this.feedFilter="all",this.currentLayout=null;let i;this.handleResize=(t=this.handleResize.bind(this),function(...e){i||(t.apply(this,e),i=!0,setTimeout(()=>i=!1,250))}),this.insertType=null,this.init()}async init(){try{if(console.debug("Init start"),await this.loadSettings(),console.debug("Settings loaded:",{insertType:this.insertType,pcSettings:!!this.pcSettings,mobileSettings:!!this.mobileSettings}),"manual"===this.insertType){if(this.container=document.getElementById("instagram-feed"),!this.container){console.debug("Manual mode: Container not found, stopping init");return}}else if(this.createContainer(),!this.container){console.debug("Auto mode: Container creation failed, stopping init");return}this.container.style.cssText=`
          width: 100%;
          margin: 40px 0 40px 0;
        `,window.addEventListener("resize",this.handleResize),this.handleResize(),await this.render()}catch(e){console.error("Instagram Feed Error:",e)}}createContainer(){let e=document.querySelector("#footer");e&&(this.container=document.createElement("div"),this.container.id="instagram-feed",this.container.style.cssText=`
        width: 100%;
        margin: 40px 0 40px 0;
      `,e.parentNode.insertBefore(this.container,e))}handleResize(){let e=window.innerWidth<768,t=e?"mobile":"pc";if(!this.container.querySelector(`#instagram-feed-${t}-${this.mallId}`)){this.render();return}this.currentLayout!==t&&(this.currentLayout=t)}validateSettings(e){return!!e&&["layout","columns","rows","gap","borderRadius","showMediaType"].every(t=>e.hasOwnProperty(t))}getCache(t){try{let i=localStorage.getItem(e(this.mallId,t));if(!i)return null;let{timestamp:s,data:a}=JSON.parse(i);if(!a||!this.validateSettings(a.settings)||Date.now()-s>6e4)return localStorage.removeItem(e(this.mallId,t)),null;return a}catch(r){return console.debug("Cache read error:",r),null}}setCache(t,i){localStorage.setItem(e(this.mallId,t),JSON.stringify({timestamp:Date.now(),data:{...i,insertType:this.insertType}}))}async loadSettings(){let e={pc:this.getCache("pc"),mobile:this.getCache("mobile")};if(e.pc&&e.mobile){this.pcSettings=e.pc.settings,this.mobileSettings=e.mobile.settings,this.mediaItems=e.pc.mediaItems,this.insertType=e.pc.insertType,e.pc.feedFilter&&(this.feedFilter=e.pc.feedFilter),await this.loadEmblaIfNeeded();return}await this.loadFreshData()}async loadFreshData(){try{let e=await fetch(`${this.apiEndpoint}?mallId=${this.mallId}`);if(!e.ok)throw Error("API 응답 실패");let t=await e.json();if(this.insertType=t.insert_type||"auto",!this.validateSettings(t.pc_feed_settings)||!this.validateSettings(t.mobile_feed_settings))throw Error("설정 포맷 오류");if(this.pcSettings=t.pc_feed_settings,this.mobileSettings=t.mobile_feed_settings,t.feed_filter&&(this.feedFilter=t.feed_filter),t.instagram_access_token){let i=await this.fetchInstagramMedia(t.instagram_access_token);this.mediaItems=(i.data||[]).filter(e=>!!e.media_url)}this.setCache("pc",{settings:this.pcSettings,mediaItems:this.mediaItems,feedFilter:this.feedFilter}),this.setCache("mobile",{settings:this.mobileSettings,mediaItems:this.mediaItems,feedFilter:this.feedFilter}),await this.loadEmblaIfNeeded(),this.render()}catch(s){console.debug("Data Load Error:",s);let a={pc:this.getCache("pc"),mobile:this.getCache("mobile")};a.pc&&a.mobile&&(this.pcSettings=a.pc.settings,this.mobileSettings=a.mobile.settings,this.mediaItems=a.pc.mediaItems,this.feedFilter=a.pc.feedFilter||"all",this.render())}}async loadEmblaIfNeeded(){if(this.pcSettings?.layout==="carousel"||this.mobileSettings?.layout==="carousel")return new Promise((e,t)=>{if(window.EmblaCarousel)return e();let i=document.createElement("script");i.src="https://unpkg.com/embla-carousel/embla-carousel.umd.js",i.onload=e,i.onerror=t,document.head.appendChild(i)})}async fetchInstagramMedia(e){let t=`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&access_token=${e}`;try{let i=await fetch(t);if(!i.ok)throw Error("Instagram API 요청 실패");let s=await i.json();return{...s,data:s.data.map(e=>({...e,display_url:e.thumbnail_url||e.media_url}))}}catch(a){return console.debug("Instagram API Error:",a),{data:[]}}}injectStyles(){let e=`instagram-feed-styles-${this.mallId}`,t=document.getElementById(e);t||((t=document.createElement("style")).id=e,document.head.appendChild(t)),t.textContent=`
        ${this.generateStyles("pc")}
        ${this.generateStyles("mobile")}
        @media (max-width: 767px) {
          #instagram-feed-pc-${this.mallId} { 
            display: none !important;
          }
          #instagram-feed-mobile-${this.mallId} {
            display: block !important;
          }
        }
        @media (min-width: 768px) {
          #instagram-feed-pc-${this.mallId} { 
            display: block !important;
          }
          #instagram-feed-mobile-${this.mallId} {
            display: none !important;
          }
        }
      `}generateStyles(e){let t="mobile"===e?this.mobileSettings:this.pcSettings;return t?`
        #instagram-feed-${e}-${this.mallId} {
          width: 100%;
          overflow: hidden;
        }
        .feed-grid-${e}-${this.mallId} {
          display: grid;
          grid-template-columns: repeat(${t.columns}, 1fr);
          gap: ${t.gap}px;
        }
        .feed-item-${e}-${this.mallId} {
          position: relative;
          border-radius: ${t.borderRadius}px;
          overflow: hidden;
          width: 100%;
        }
        .embla-${e}-${this.mallId} {
          overflow: hidden;
          position: relative;
          width: 100%;
          will-change: transform;
          -webkit-backface-visibility: hidden;
          -webkit-perspective: 1000;
          -webkit-transform: translate3d(0,0,0);
        }
        .embla-container-${e}-${this.mallId} {
          display: flex;
          gap: ${t.gap}px;
          padding: 0 ${t.gap}px;
          transform: translate3d(0,0,0);
          will-change: transform;
          user-select: none;
        }
        .embla-container-${e}-${this.mallId} .feed-item-${e}-${this.mallId} {
          width: ${100/t.columns}%;
          flex-shrink: 0;
        }
        .media-type-icon-${e}-${this.mallId} {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 4px;
          z-index: 2;
          color: black;
        }
      `:""}async render(){if(console.debug("Render start",{container:!!this.container,pcSettings:!!this.pcSettings,mobileSettings:!!this.mobileSettings,mediaItems:this.mediaItems.length}),!this.container||!this.pcSettings||!this.mobileSettings){console.debug("Render requirements not met");return}await this.loadEmblaIfNeeded(),this.injectStyles(),this.container.innerHTML=`
        <div id="instagram-feed-pc-${this.mallId}">
          ${this.renderLayout("pc")}
        </div>
        <div id="instagram-feed-mobile-${this.mallId}">
          ${this.renderLayout("mobile")}
        </div>
      `,this.initCarousels()}renderLayout(e){let t="mobile"===e?this.mobileSettings:this.pcSettings;return"carousel"===t.layout?this.renderCarousel(e):this.renderGrid(e)}renderGrid(e){let t="mobile"===e?this.mobileSettings:this.pcSettings,i=t.columns*t.rows,s=this.mediaItems.filter(e=>this.matchesFilter(e)).slice(0,i),a=s.map(t=>this.renderItem(t,e)).join("");return`<div class="feed-grid-${e}-${this.mallId}">${a}</div>`}renderCarousel(e){let t="mobile"===e?this.mobileSettings:this.pcSettings,i=3*t.columns,s=this.mediaItems.filter(e=>this.matchesFilter(e)).slice(0,i),a=s.map(t=>this.renderItem(t,e)).join("");return`
        <div class="embla-${e}-${this.mallId}">
          <div class="embla-container-${e}-${this.mallId}">
            ${a}
          </div>
        </div>
      `}matchesFilter(e){if("all"===this.feedFilter);else if("image"===this.feedFilter)return"IMAGE"===e.media_type||"CAROUSEL_ALBUM"===e.media_type;else if("video"===this.feedFilter)return"VIDEO"===e.media_type;return!0}renderItem(e,i){let s="mobile"===i?this.mobileSettings:this.pcSettings,a="VIDEO"===e.media_type?"VIDEO":"IMAGE";return`
        <div class="feed-item-${i}-${this.mallId}">
          <a href="${e.permalink}" target="_blank" rel="noopener noreferrer">
            <img 
              src="${"VIDEO"===a?e.thumbnail_url:e.media_url}" 
              alt="${e.caption||""}"
              loading="lazy"
              style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: 1 / 1;"
            >
            ${s.showMediaType?`
              <div class="media-type-icon-${i}-${this.mallId}">
                ${t[a]}
              </div>
            `:""}
          </a>
        </div>
      `}initCarousels(){setTimeout(()=>{["pc","mobile"].forEach(e=>{let t="mobile"===e?this.mobileSettings:this.pcSettings;if("carousel"!==t.layout)return;let i=this.container.querySelector(`.embla-${e}-${this.mallId}`);if(!i||!window.EmblaCarousel)return;i.embla&&i.embla.destroy();let s=i.querySelector(`.embla-container-${e}-${this.mallId}`);s&&(s.style.display="flex");let a=new window.EmblaCarousel(i,{align:"center",containScroll:"keepSnaps",dragFree:!1,loop:!0,skipSnaps:!0,direction:"ltr",inViewThreshold:.7});i.embla=a})},100)}}async function s(){try{let e=await function e(t=5e3){return new Promise((e,i)=>{if(window.CAFE24API)return e(window.CAFE24API);let s=setTimeout(()=>{i(Error("CAFE24API 로드 타임아웃"))},t),a=new MutationObserver((t,i)=>{window.CAFE24API&&(clearTimeout(s),i.disconnect(),e(window.CAFE24API))});a.observe(document,{childList:!0,subtree:!0})})}(),t=e.MALL_ID;new i(t)}catch(s){console.error("초기화 실패:",s)}}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",s):s()}();