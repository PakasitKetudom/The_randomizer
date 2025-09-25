export default function ThemeScript() {
  const js = `(function(){try{
    var s = localStorage.getItem('theme'); // 'dark'|'light'|null
    var dark = s ? s==='dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  }catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}