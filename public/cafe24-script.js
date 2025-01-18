!function(){let e=(e,t)=>`instagram_feed_cache_${e}_${t}`,t={IMAGE:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',VIDEO:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-play"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/></svg>'};class i{constructor(e){var t;this.mallId=e,this.apiEndpoint="https://cithmb.vercel.app/api/cafe24-script/get",this.container=null,this.pcSettings=null,this.mobileSettings=null,this.mediaItems=[],this.feedFilter="all",this.currentLayout=null;let i;this.handleResize=(t=this.handleResize.bind(this),function(...e){i||(t.apply(this,e),i=!0,setTimeout(()=>i=!1,250))}),this.insertType=null,this.apiCache=new Map,["https://cithmb.vercel.app","https://graph.instagram.com"].forEach(e=>{let t=document.createElement("link");t.rel="dns-prefetch",t.href=e,document.head.appendChild(t)}),this.init()}async init(){try{if(console.debug("Init start"),await this.loadSettings(),console.debug("Settings loaded:",{insertType:this.insertType,pcSettings:!!this.pcSettings,mobileSettings:!!this.mobileSettings}),"manual"===this.insertType){if(this.container=document.getElementById("instagram-feed"),!this.container){console.debug("Manual mode: Container not found, stopping init");return}}else if(this.createContainer(),!this.container){console.debug("Auto mode: Container creation failed, stopping init");return}this.container.style.cssText=`
            width: 100%;
            margin: 40px 0 40px 0;
          `,window.addEventListener("resize",this.handleResize),this.handleResize(),await this.render()}catch(e){console.error("Instagram Feed Error:",e)}}createContainer(){let e=document.querySelector("#footer");e&&(this.container=document.createElement("div"),this.container.id="instagram-feed",this.container.style.cssText=`
          width: 100%;
          margin: 40px 0 40px 0;
        `,e.parentNode.insertBefore(this.container,e))}handleResize(){let e=window.innerWidth<768,t=e?"mobile":"pc";if(!this.container.querySelector(`#instagram-feed-${t}-${this.mallId}`)){this.render();return}this.currentLayout!==t&&(this.currentLayout=t)}validateSettings(e){return!!e&&["layout","columns","rows","gap","borderRadius","showMediaType"].every(t=>e.hasOwnProperty(t))}getCache(t){try{let i=localStorage.getItem(e(this.mallId,t));if(!i)return null;let{timestamp:a,data:s}=JSON.parse(i);if(!s||!this.validateSettings(s.settings)||Date.now()-a>6e4)return localStorage.removeItem(e(this.mallId,t)),null;return s}catch(r){return console.debug("Cache read error:",r),null}}setCache(t,i){localStorage.setItem(e(this.mallId,t),JSON.stringify({timestamp:Date.now(),data:{...i,insertType:this.insertType}}))}async loadSettings(){let e={pc:this.getCache("pc"),mobile:this.getCache("mobile")};if(e.pc&&e.mobile){this.pcSettings=e.pc.settings,this.mobileSettings=e.mobile.settings,this.mediaItems=e.pc.mediaItems,this.insertType=e.pc.insertType,e.pc.feedFilter&&(this.feedFilter=e.pc.feedFilter),await this.loadEmblaIfNeeded();return}await this.loadFreshData()}async loadFreshData(){try{let[e,t]=await Promise.all([this.fetchSettings(),this.fetchToken()]),[i,a]=await Promise.all([e,t]);this.insertType=i.insert_type||"auto",this.pcSettings=i.pc_feed_settings,this.mobileSettings=i.mobile_feed_settings,this.feedFilter=i.feed_filter||"all",a&&(this.mediaItems=await this.fetchInstagramMedia(a)),this.updateCache()}catch(s){console.error("Data loading failed:",s),this.loadFromCache()}}async fetchSettings(){let e=`settings_${this.mallId}`;if(this.apiCache.has(e))return this.apiCache.get(e);let t=await fetch(`${this.apiEndpoint}/settings?mallId=${this.mallId}`,{method:"GET",headers:{"Cache-Control":"max-age=300"}}),i=await t.json();return this.apiCache.set(e,i),i}async fetchToken(){let e=await fetch(`${this.apiEndpoint}?mallId=${this.mallId}`);if(!e.ok)throw Error("API 응답 실패");let t=await e.json();return t.instagram_access_token}updateCache(){let t={timestamp:Date.now(),settings:{pc:this.pcSettings,mobile:this.mobileSettings},mediaItems:this.mediaItems,feedFilter:this.feedFilter};localStorage.setItem(e(this.mallId),JSON.stringify(t))}async loadEmblaIfNeeded(){if(this.pcSettings?.layout==="carousel"||this.mobileSettings?.layout==="carousel")return new Promise((e,t)=>{if(window.EmblaCarousel)return e();let i=document.createElement("script");i.src="https://unpkg.com/embla-carousel/embla-carousel.umd.js",i.onload=e,i.onerror=t,document.head.appendChild(i)})}async fetchInstagramMedia(e){let t=`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&access_token=${e}`;try{let i=await fetch(t);if(!i.ok)throw Error("Instagram API 요청 실패");let a=await i.json();return{...a,data:a.data.map(e=>({...e,display_url:e.thumbnail_url||e.media_url}))}}catch(s){return console.debug("Instagram API Error:",s),{data:[]}}}injectStyles(){let e=`instagram-feed-styles-${this.mallId}`,t=document.getElementById(e);t||((t=document.createElement("style")).id=e,document.head.appendChild(t)),t.textContent=`
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
        `,this.initCarousels()}renderLayout(e){let t="mobile"===e?this.mobileSettings:this.pcSettings;return"carousel"===t.layout?this.renderCarousel(e):this.renderGrid(e)}renderGrid(e){let t="mobile"===e?this.mobileSettings:this.pcSettings,i=t.columns*t.rows,a=this.mediaItems.filter(e=>this.matchesFilter(e)).slice(0,i),s=a.map(t=>this.renderItem(t,e)).join("");return`<div class="feed-grid-${e}-${this.mallId}">${s}</div>`}renderCarousel(e){let t="mobile"===e?this.mobileSettings:this.pcSettings,i=3*t.columns,a=this.mediaItems.filter(e=>this.matchesFilter(e)).slice(0,i),s=a.map(t=>this.renderItem(t,e)).join("");return`
          <div class="embla-${e}-${this.mallId}">
            <div class="embla-container-${e}-${this.mallId}">
              ${s}
            </div>
          </div>
        `}matchesFilter(e){if("all"===this.feedFilter);else if("image"===this.feedFilter)return"IMAGE"===e.media_type||"CAROUSEL_ALBUM"===e.media_type;else if("video"===this.feedFilter)return"VIDEO"===e.media_type;return!0}renderItem(e,i){let a="mobile"===i?this.mobileSettings:this.pcSettings,s="VIDEO"===e.media_type?"VIDEO":"IMAGE";return`
          <div class="feed-item-${i}-${this.mallId}">
            <a href="${e.permalink}" target="_blank" rel="noopener noreferrer">
              <img 
                src="${"VIDEO"===s?e.thumbnail_url:e.media_url}" 
                alt="${e.caption||""}"
                loading="lazy"
                style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: 1 / 1;"
              >
              ${a.showMediaType?`
                <div class="media-type-icon-${i}-${this.mallId}">
                  ${t[s]}
                </div>
              `:""}
            </a>
          </div>
        `}initCarousels(){setTimeout(()=>{["pc","mobile"].forEach(e=>{let t="mobile"===e?this.mobileSettings:this.pcSettings;if("carousel"!==t.layout)return;let i=this.container.querySelector(`.embla-${e}-${this.mallId}`);if(!i||!window.EmblaCarousel)return;i.embla&&i.embla.destroy();let a=i.querySelector(`.embla-container-${e}-${this.mallId}`);a&&(a.style.display="flex");let s=new window.EmblaCarousel(i,{align:"center",containScroll:"keepSnaps",dragFree:!1,loop:!0,skipSnaps:!0,direction:"ltr",inViewThreshold:.7});i.embla=s})},100)}}async function a(){try{let e=await function e(t=5e3){return new Promise((e,i)=>{if(window.CAFE24API)return e(window.CAFE24API);let a=setTimeout(()=>{i(Error("CAFE24API 로드 타임아웃"))},t),s=new MutationObserver((t,i)=>{window.CAFE24API&&(clearTimeout(a),i.disconnect(),e(window.CAFE24API))});s.observe(document,{childList:!0,subtree:!0})})}(),t=e.MALL_ID;new i(t)}catch(a){console.error("초기화 실패:",a)}}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",a):a()}();