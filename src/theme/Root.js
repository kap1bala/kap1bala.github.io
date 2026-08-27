import React, { useState, useEffect } from 'react';
import { StyleProvider, createCache } from '@ant-design/cssinjs';
import { ConfigProvider, theme as antdTheme } from 'antd';

// 模块级单例缓存：服务端渲染与客户端水合复用同一 hash
const cache = createCache();

/**
 * 通过读取 <html data-theme="dark"> 同步 antd 主题与 Docusaurus 主题。
 * Docusaurus 会在切换暗色模式时给 documentElement 加 data-theme 属性。
 * SSR 时按 'light' 渲染，水合后通过 useEffect 修正，避免主题闪烁。
 */
function useSiteColorMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const update = () => setIsDark(root.getAttribute('data-theme') === 'dark');
    update();
    // 监听 Docusaurus 切换 data-theme 的变化（attribute 是静态的，但保险起见监听一次）
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export default function Root({ children }) {
  const isDark = useSiteColorMode();

  return (
    <StyleProvider cache={cache} hashPriority="high">
      <ConfigProvider
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#2563eb', // 与 --ifm-color-primary 对齐
            colorInfo: '#2563eb',
            borderRadius: 8,
            fontFamily: 'inherit', // 继承 Docusaurus 字体栈
          },
          components: {
            Button: { primaryShadow: 'none' },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
}