/**
 * 轻量 Markdown → HTML（使用手册静态文档，无外部依赖）
 */

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
}

function inlineFormat(text) {
  let s = escapeHtml(text)
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>')
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // 图片 ![alt](src)
  s = s.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width:100%;height:auto" />',
  )
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  return s
}

function parseTable(lines) {
  if (lines.length < 2) return ''
  const splitRow = (line) =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim())
  const header = splitRow(lines[0])
  const bodyLines = lines.slice(2)
  let html = '<table><thead><tr>'
  header.forEach((h) => {
    html += `<th>${inlineFormat(h)}</th>`
  })
  html += '</tr></thead><tbody>'
  bodyLines.forEach((line) => {
    const cells = splitRow(line)
    html += '<tr>'
    cells.forEach((c) => {
      html += `<td>${inlineFormat(c)}</td>`
    })
    html += '</tr>'
  })
  html += '</tbody></table>'
  return html
}

export function renderMarkdown(md) {
  if (!md) return ''
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (/^```/.test(line)) {
      const lang = line.slice(3).trim()
      i++
      const codeLines = []
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(lines[i])
        i++
      }
      i++
      out.push(
        `<pre><code class="language-${escapeHtml(lang)}">${escapeHtml(codeLines.join('\n'))}</code></pre>`,
      )
      continue
    }

    if (/^#{1,3}\s/.test(line)) {
      const level = line.match(/^#+/)[0].length
      const text = line.replace(/^#+\s*/, '')
      const id = slugify(text)
      out.push(`<h${level} id="${id}">${inlineFormat(text)}</h${level}>`)
      i++
      continue
    }

    if (/^>\s?/.test(line)) {
      const q = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        q.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      out.push(`<blockquote><p>${inlineFormat(q.join(' '))}</p></blockquote>`)
      continue
    }

    if (/^\|.+\|/.test(line) && i + 1 < lines.length && /^\|[-:\s|]+\|/.test(lines[i + 1])) {
      const tableLines = [lines[i], lines[i + 1]]
      i += 2
      while (i < lines.length && /^\|.+\|/.test(lines[i])) {
        tableLines.push(lines[i])
        i++
      }
      out.push(parseTable(tableLines))
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      out.push('<ul>')
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        out.push(`<li>${inlineFormat(lines[i].replace(/^[-*]\s+/, ''))}</li>`)
        i++
      }
      out.push('</ul>')
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      out.push('<ol>')
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        out.push(`<li>${inlineFormat(lines[i].replace(/^\d+\.\s+/, ''))}</li>`)
        i++
      }
      out.push('</ol>')
      continue
    }

    if (line.trim() === '') {
      i++
      continue
    }

    const para = []
    while (i < lines.length && lines[i].trim() !== '' && !/^#{1,3}\s/.test(lines[i]) && !/^```/.test(lines[i]) && !/^>\s?/.test(lines[i]) && !/^[-*]\s+/.test(lines[i]) && !/^\d+\.\s+/.test(lines[i]) && !(/^\|.+\|/.test(lines[i]) && i + 1 < lines.length && /^\|[-:\s|]+\|/.test(lines[i + 1]))) {
      para.push(lines[i])
      i++
    }
    if (para.length) out.push(`<p>${inlineFormat(para.join(' '))}</p>`)
  }

  return out.join('\n')
}
