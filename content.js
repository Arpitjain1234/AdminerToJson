(function () {
    function getTableName() {
      const params = new URL(location.href).searchParams;
      const fromParam = params.get('table');
      if (fromParam) return fromParam;
  
      const h2 = document.querySelector('#content h2');
      if (!h2) return null;
      const m = h2.textContent.match(/Table:\s*(.+)$/i);
      return m ? m[1].trim() : null;
    }
  
    function getColumnsFromStructure() {
      const rows = document.querySelectorAll('.scrollable table tr');
      const cols = [];
      rows.forEach((tr, idx) => {
        if (idx === 0) return; // header
        const th = tr.querySelector('th');
        const name = th && th.textContent && th.textContent.trim();
        if (name) cols.push(name);
      });
      return cols;
    }
  
    function createPanel() {
      const panel = document.createElement('div');
      panel.style.position = 'fixed';
      panel.style.top = '12px';
      panel.style.right = '12px';
      panel.style.width = '420px';
      panel.style.maxWidth = 'calc(100vw - 24px)';
      panel.style.maxHeight = '70vh';
      panel.style.zIndex = '99999';
      panel.style.background = '#0b1220';
      panel.style.border = '1px solid #1f2937';
      panel.style.borderRadius = '8px';
      panel.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';
      panel.style.padding = '10px';
      panel.style.display = 'grid';
      panel.style.gridTemplateRows = 'auto auto';
      panel.style.gap = '8px';
      return panel;
    }
  
    function createHeader(titleText) {
      const header = document.createElement('div');
      header.textContent = titleText || 'Columns → JSON';
      header.style.color = '#e5e7eb';
      header.style.fontSize = '12px';
      header.style.fontWeight = '600';
      header.style.letterSpacing = '0.2px';
      return header;
    }
  
    function createTextarea(initial) {
      const ta = document.createElement('textarea');
      ta.value = initial;
      ta.style.width = '100%';
      ta.style.height = '180px';
      ta.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
      ta.style.fontSize = '12px';
      ta.style.lineHeight = '1.45';
      ta.style.padding = '10px';
      ta.style.background = '#0f172a';
      ta.style.color = '#e5e7eb';
      ta.style.border = '1px solid #334155';
      ta.style.borderRadius = '6px';
      ta.style.resize = 'vertical';
      ta.style.minHeight = '120px';
      ta.spellcheck = false;
      return ta;
    }
  
    function createControls(onCopy, onMinCopy, onReformat, onClose) {
      const wrap = document.createElement('div');
      wrap.style.display = 'flex';
      wrap.style.gap = '8px';
      wrap.style.alignItems = 'center';
      wrap.style.justifyContent = 'flex-end';
  
      function btn(label) {
        const b = document.createElement('button');
        b.textContent = label;
        b.style.padding = '6px 10px';
        b.style.border = '1px solid #334155';
        b.style.borderRadius = '6px';
        b.style.background = '#111827';
        b.style.color = '#fff';
        b.style.cursor = 'pointer';
        b.style.fontSize = '12px';
        return b;
      }
  
      const fmtBtn = btn('Reformat');
      fmtBtn.title = 'Reformat with 4-space indentation';
      fmtBtn.addEventListener('click', onReformat);
  
      const minBtn = btn('Copy Minified');
      minBtn.title = 'Copy as minified JSON';
      minBtn.addEventListener('click', onMinCopy);
  
      const copyBtn = btn('Copy JSON');
      copyBtn.title = 'Copy as formatted JSON';
      copyBtn.addEventListener('click', onCopy);
  
      const closeBtn = btn('Close');
      closeBtn.style.background = '#27272a';
      closeBtn.addEventListener('click', onClose);
  
      wrap.appendChild(fmtBtn);
      wrap.appendChild(minBtn);
      wrap.appendChild(copyBtn);
      wrap.appendChild(closeBtn);
      return wrap;
    }
  
    function toast(msg, ok = true) {
      const t = document.createElement('div');
      t.textContent = msg;
      t.style.position = 'fixed';
      t.style.right = '16px';
      t.style.top = '12px';
      t.style.padding = '8px 10px';
      t.style.background = ok ? '#10b981' : '#ef4444';
      t.style.color = '#fff';
      t.style.borderRadius = '6px';
      t.style.zIndex = '100000';
      t.style.fontSize = '12px';
      t.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25)';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 1600);
    }
  
    function pretty(obj) {
      return JSON.stringify(obj, null, 4);
    }
    function minified(obj) {
      return JSON.stringify(obj);
    }
  
    function main() {
      const content = document.querySelector('#content');
      if (!content) return;
  
      const tableName = getTableName();
      if (!tableName) return;
  
      const columns = getColumnsFromStructure();
      if (!columns.length) return;
  
      const payload = { [tableName]: columns };
      const initial = pretty(payload);
  
      const panel = createPanel();
      const header = createHeader(`Columns → JSON (${tableName})`);
      const ta = createTextarea(initial);
      const controls = createControls(
        async () => {
          try {
            JSON.parse(ta.value);
            await navigator.clipboard.writeText(ta.value);
            toast('Copied formatted JSON');
          } catch (e) {
            toast('Invalid JSON: not copied', false);
          }
        },
        async () => {
          try {
            const obj = JSON.parse(ta.value);
            await navigator.clipboard.writeText(minified(obj));
            toast('Copied minified JSON');
          } catch (e) {
            toast('Invalid JSON: not copied', false);
          }
        },
        () => {
          try {
            const obj = JSON.parse(ta.value);
            ta.value = pretty(obj);
            toast('Reformatted');
          } catch (e) {
            toast('Invalid JSON: cannot reformat', false);
          }
        },
        () => {
          panel.remove();
        }
      );
  
      panel.appendChild(header);
      panel.appendChild(ta);
      panel.appendChild(controls);
      document.body.appendChild(panel);
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', main);
    } else {
      main();
    }
  })();
