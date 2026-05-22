import { DEFAULT_THEME, THEME_STORAGE_KEY } from '@/lib/theme';

/** Runs before paint to avoid theme flash. */
export function ThemeScript() {
  const script = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var d=${JSON.stringify(DEFAULT_THEME)};var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark')t=d;document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme',${JSON.stringify(DEFAULT_THEME)});}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
