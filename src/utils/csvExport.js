/** 导出 UTF-8 BOM CSV，便于 Excel 正确识别中文 */
export function downloadCsv(filename, columns, rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const header = columns.map((c) => esc(c.label)).join(',')
  const lines = rows.map((r) => columns.map((c) => esc(r[c.key])).join(','))
  const bom = '\uFEFF'
  const blob = new Blob([bom + [header, ...lines].join('\n')], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  /* 确保 a 元素在 DOM 中再触发 click，兼容部分浏览器 */
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
