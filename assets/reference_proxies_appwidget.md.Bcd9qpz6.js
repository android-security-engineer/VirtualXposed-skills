import{_ as p,C as t,o as e,c as i,a2 as d,b as l,w as s,a as o,E as r,a3 as c}from"./chunks/framework.DZUUNQ77.js";const b=JSON.parse('{"title":"appwidget · 桌面小部件代理","description":"","frontmatter":{},"headers":[],"relativePath":"reference/proxies/appwidget.md","filePath":"reference/proxies/appwidget.md","lastUpdated":1784494692000}'),E={name:"reference/proxies/appwidget.md"};function A(g,a,h,B,u,m){const n=t("Mermaid");return e(),i("div",null,[a[1]||(a[1]=d(`<h1 id="appwidget-·-桌面小部件代理" tabindex="-1">appwidget · 桌面小部件代理 <a class="header-anchor" href="#appwidget-·-桌面小部件代理" aria-label="Permalink to &quot;appwidget · 桌面小部件代理&quot;">​</a></h1><div class="tip custom-block"><p class="custom-block-title">源码路径</p><p><a href="https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp/VirtualApp/lib/src/main/java/com/lody/virtual/client/hook/proxies/appwidget/AppWidgetManagerStub.java" target="_blank" rel="noreferrer"><code>src/main/java/com/lody/virtual/client/hook/proxies/appwidget/AppWidgetManagerStub.java</code></a></p></div><p>拦截 <code>AppWidgetManager</code>（桌面小部件）。把目标 App 注册小部件时的 callingUid/包名替换为虚拟身份，避免小部件注册到真实系统桌面时身份错乱。</p><h2 id="拦截的服务" tabindex="-1">拦截的服务 <a class="header-anchor" href="#拦截的服务" aria-label="Permalink to &quot;拦截的服务&quot;">​</a></h2><p><code>Context.APPWIDGET_SERVICE</code>，继承 <code>BinderInvocationProxy</code>。</p><h2 id="关键行为" tabindex="-1">关键行为 <a class="header-anchor" href="#关键行为" aria-label="Permalink to &quot;关键行为&quot;">​</a></h2><p>主要做 callingUid / packageName 的参数改写，使小部件 ID 分配与虚拟 App 对应。VirtualXposed 不重实现 widget 服务，靠身份隔离。</p><h2 id="拦截方法清单" tabindex="-1">拦截方法清单 <a class="header-anchor" href="#拦截方法清单" aria-label="Permalink to &quot;拦截方法清单&quot;">​</a></h2><p>从源码 <code>onBindMethods</code> / <code>@Inject</code> 内部类提取的 MethodProxy 拦截点：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>- allocateAppWidgetId</span></span>
<span class="line"><span>- bindAppWidgetId</span></span>
<span class="line"><span>- bindRemoteViewsService</span></span>
<span class="line"><span>- createAppWidgetConfigIntentSender</span></span>
<span class="line"><span>- deleteAllHosts</span></span>
<span class="line"><span>- deleteAppWidgetId</span></span>
<span class="line"><span>- deleteHost</span></span>
<span class="line"><span>- getAppWidgetIds</span></span>
<span class="line"><span>- getAppWidgetIdsForHost</span></span>
<span class="line"><span>- getAppWidgetInfo</span></span>
<span class="line"><span>- getAppWidgetOptions</span></span>
<span class="line"><span>- getAppWidgetViews</span></span>
<span class="line"><span>- getInstalledProvidersForProfile</span></span>
<span class="line"><span>- hasBindAppWidgetPermission</span></span>
<span class="line"><span>- isBoundWidgetPackage</span></span>
<span class="line"><span>- notifyAppWidgetViewDataChanged</span></span>
<span class="line"><span>- partiallyUpdateAppWidgetIds</span></span>
<span class="line"><span>- setBindAppWidgetPermission</span></span>
<span class="line"><span>- startListening</span></span>
<span class="line"><span>- stopListening</span></span>
<span class="line"><span>- unbindRemoteViewsService</span></span>
<span class="line"><span>- updateAppWidgetIds</span></span>
<span class="line"><span>- updateAppWidgetOptions</span></span>
<span class="line"><span>- updateAppWidgetProvider</span></span></code></pre></div><h2 id="拦截与转发流程" tabindex="-1">拦截与转发流程 <a class="header-anchor" href="#拦截与转发流程" aria-label="Permalink to &quot;拦截与转发流程&quot;">​</a></h2>`,11)),(e(),l(c,null,{default:s(()=>[r(n,{id:"mermaid-33",class:"mermaid",graph:"flowchart%20LR%0A%20%20APP%5B%22%E7%9B%AE%E6%A0%87%20App%22%5D%20--%3E%7C%22%E8%B0%83%E7%94%A8%E7%B3%BB%E7%BB%9F%E6%9C%8D%E5%8A%A1%22%7C%20HOOK%5B%22MethodProxy%20%E6%8B%A6%E6%88%AA%3Cbr%2F%3E(appwidget%20%C2%B7%20%E6%A1%8C%E9%9D%A2%E5%B0%8F%E9%83%A8%E4%BB%B6%E4%BB%A3%E7%90%86)%22%5D%0A%20%20HOOK%20--%3E%7C%22%E6%94%B9%E5%8C%85%E5%90%8D%2F%E5%8F%82%E6%95%B0%20%E6%88%96%20%E7%9B%B4%E6%8E%A5%E8%BF%94%E5%9B%9E%22%7C%20DECIDE%7B%22%E9%9C%80%E8%A6%81%E8%99%9A%E6%8B%9F%E6%9C%8D%E5%8A%A1%3F%22%7D%0A%20%20DECIDE%20--%3E%7C%22%E6%98%AF%22%7C%20VSVC%5B%22server%20%E8%99%9A%E6%8B%9F%E6%9C%8D%E5%8A%A1%22%5D%0A%20%20DECIDE%20--%3E%7C%22%E5%90%A6%22%7C%20REAL%5B%22%E8%BD%AC%E5%8F%91%E7%9C%9F%E5%AE%9E%E7%B3%BB%E7%BB%9F%E6%9C%8D%E5%8A%A1%22%5D%0A%20%20VSVC%20--%3E%20APP%0A%20%20REAL%20--%3E%20APP%0A"})]),fallback:s(()=>[...a[0]||(a[0]=[o(" Loading... ",-1)])]),_:1}))])}const P=p(E,[["render",A]]);export{b as __pageData,P as default};
