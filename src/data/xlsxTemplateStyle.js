// ==================== 软件导入模板 · 样式补丁（无第三方依赖） ====================
// 背景：SheetJS 社区版不会写出单元格样式（字体/填充/对齐）与冻结窗格。
// 做法：先用 SheetJS 生成 xlsx 字节，再对包内 XML 打补丁（表头样式、冻结窗格、列宽、行高），
// 最后以 stored（不压缩）方式重新打包。样式取值与官方「软件导入模板.xlsx」保持一致。

/** 表头填充色（官方模板：深蓝 #1F4E79 + 白色加粗字） */
const HEADER_FILL_RGB = 'FF1F4E79'
const HEADER_FONT_RGB = 'FFFFFFFF'
/** 正文字体（官方模板用宋体 11） */
const BODY_FONT = '宋体'

/** 列宽：与「软件导入模板.xlsx」最终版逐列一致，另为「集成风险」列补一档宽度（23 列，顺序同 TEMPLATE_COLUMNS） */
export const TEMPLATE_COL_WIDTHS = [
  18, 18, 38.2596, 38.2596, 31.0769,
  12, 14.3846, 14.3846, 14.3846, 14.3846, 14.3846,
  43.2404, 18.7596,
  14.5577, 14.5577, 14.5577,
  30, 60, 41.2596,
  49.0673, 49.0673,
  70, 44.3173,
]

/** 需要写成超链接的列（最终版模板中这 4 列为可点击链接） */
export const HYPERLINK_COLUMNS = ['托管地址', '国内托管地址', '源码包地址', '来源地址']

// ==================== CRC32（zip 需要） ====================
const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(u8) {
  let c = 0xFFFFFFFF
  for (let i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xFF] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}

// ==================== zip 读写（stored 方式，无需第三方依赖） ====================
/** 解析 SheetJS 生成的 xlsx（各条目均为 stored） */
function parseZip(input) {
  const u8 = input instanceof Uint8Array ? input : new Uint8Array(input)
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength)
  const entries = []
  let i = 0
  while (i + 30 <= u8.length && dv.getUint32(i, true) === 0x04034b50) {
    const compSize = dv.getUint32(i + 18, true)
    const nameLen = dv.getUint16(i + 26, true)
    const extraLen = dv.getUint16(i + 28, true)
    const name = new TextDecoder().decode(u8.subarray(i + 30, i + 30 + nameLen))
    const start = i + 30 + nameLen + extraLen
    entries.push({ name, data: u8.subarray(start, start + compSize) })
    i = start + compSize
  }
  return entries
}

/** 以 stored 方式重新打包为 zip */
function buildZip(entries) {
  const enc = new TextEncoder()
  const parts = []
  const central = []
  let offset = 0

  entries.forEach((e) => {
    const nameBytes = enc.encode(e.name)
    const data = e.data
    const crc = crc32(data)
    const local = new Uint8Array(30 + nameBytes.length)
    const lv = new DataView(local.buffer)
    lv.setUint32(0, 0x04034b50, true)
    lv.setUint16(4, 20, true)
    lv.setUint16(6, 0x0800, true) // UTF-8 文件名
    lv.setUint16(8, 0, true) // stored
    lv.setUint16(10, 0, true)
    lv.setUint16(12, 0x21, true) // 1980-01-01
    lv.setUint32(14, crc, true)
    lv.setUint32(18, data.length, true)
    lv.setUint32(22, data.length, true)
    lv.setUint16(26, nameBytes.length, true)
    lv.setUint16(28, 0, true)
    local.set(nameBytes, 30)
    parts.push(local, data)
    central.push({ nameBytes, crc, size: data.length, offset })
    offset += local.length + data.length
  })

  const centralStart = offset
  central.forEach((c) => {
    const rec = new Uint8Array(46 + c.nameBytes.length)
    const cv = new DataView(rec.buffer)
    cv.setUint32(0, 0x02014b50, true)
    cv.setUint16(4, 20, true)
    cv.setUint16(6, 20, true)
    cv.setUint16(8, 0x0800, true)
    cv.setUint16(10, 0, true)
    cv.setUint16(12, 0, true)
    cv.setUint16(14, 0x21, true)
    cv.setUint32(16, c.crc, true)
    cv.setUint32(20, c.size, true)
    cv.setUint32(24, c.size, true)
    cv.setUint16(28, c.nameBytes.length, true)
    cv.setUint32(42, c.offset, true)
    rec.set(c.nameBytes, 46)
    parts.push(rec)
    offset += rec.length
  })

  const eocd = new Uint8Array(22)
  const ev = new DataView(eocd.buffer)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(8, central.length, true)
  ev.setUint16(10, central.length, true)
  ev.setUint32(12, offset - centralStart, true)
  ev.setUint32(16, centralStart, true)
  parts.push(eocd)

  const total = parts.reduce((n, p) => n + p.length, 0)
  const out = new Uint8Array(total)
  let pos = 0
  parts.forEach((p) => { out.set(p, pos); pos += p.length })
  return out
}

// ==================== XML 补丁 ====================
/** 样式表：0 = 正文（左对齐/垂直居中/自动换行），1 = 表头（深蓝底白字加粗/居中/自动换行） */
const STYLES_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
  + '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
  + `<fonts count="2">`
  + `<font><sz val="11"/><color theme="1"/><name val="${BODY_FONT}"/><charset val="134"/><scheme val="minor"/></font>`
  + `<font><b/><sz val="11"/><color rgb="${HEADER_FONT_RGB}"/><name val="${BODY_FONT}"/><charset val="134"/><scheme val="minor"/></font>`
  + `</fonts>`
  + `<fills count="3">`
  + '<fill><patternFill patternType="none"/></fill>'
  + '<fill><patternFill patternType="gray125"/></fill>'
  + `<fill><patternFill patternType="solid"><fgColor rgb="${HEADER_FILL_RGB}"/><bgColor indexed="64"/></patternFill></fill>`
  + `</fills>`
  + '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
  + '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
  + '<cellXfs count="2">'
  + '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>'
  + '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>'
  + '</cellXfs>'
  + '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
  + '<dxfs count="0"/>'
  + '<tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4"/>'
  + '</styleSheet>'

/** 列宽定义（与官方模板一致，正文样式 wrap） */
function buildColsXml(widths) {
  return '<cols>'
    + widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" style="0" customWidth="1"/>`).join('')
    + '</cols>'
}

/** XML 属性值转义 */
function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * 给工作表 XML 追加超链接，并返回对应的 rels 文件内容。
 * @param {string} xml sheet1.xml
 * @param {Array<{ref: string, url: string}>} hyperlinks 单元格引用 → 目标地址
 * @param {number} startId rels 中 rId 起始编号（避免与已有关系冲突）
 * @returns {{ xml: string, relsXml: string, relsName: string }}
 */
function addHyperlinks(xml, hyperlinks, startId = 1) {
  if (!hyperlinks.length) return { xml, relsXml: '', relsName: '' }
  const items = hyperlinks.map((h, i) => ({ ...h, rid: `rId${startId + i}` }))
  const linksXml = '<hyperlinks>'
    + items.map((h) => {
      const url = escapeXml(h.url)
      return `<hyperlink ref="${h.ref}" r:id="${h.rid}" display="${url}" tooltip="${url}"/>`
    }).join('')
    + '</hyperlinks>'
  const out = xml.replace('</worksheet>', `${linksXml}</worksheet>`)
  const relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    + items.map((h) =>
      `<Relationship Id="${h.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink"`
      + ` Target="${escapeXml(h.url)}" TargetMode="External"/>`).join('')
    + '</Relationships>'
  return { xml: out, relsXml, relsName: 'xl/worksheets/_rels/sheet1.xml.rels' }
}

/**
 * 给工作表 XML 打补丁：冻结首行首列、列宽、行高、表头/正文单元格样式。
 * @param {string} xml sheet1.xml 内容
 * @param {{ headerRow?: number, freezeCell?: string, widths?: number[], hintRow?: number, headerHeight?: number, hintHeight?: number, dataRowHeight?: number }} opts
 */
function styleSheetXml(xml, opts = {}) {
  const {
    headerRow = 1,
    freezeCell = 'B2',
    widths = TEMPLATE_COL_WIDTHS,
    hintRow = 0,
    headerHeight = 17,
    hintHeight = 0,
    dataRowHeight = 0,
  } = opts

  let out = xml

  // 1) 冻结窗格（首行 + 首列），与官方模板一致
  out = out.replace(
    /(<sheetView\b[^>]*?)\s*\/>/,
    `$1><pane xSplit="1" ySplit="1" topLeftCell="${freezeCell}" activePane="bottomRight" state="frozen"/>`
    + `<selection pane="bottomRight" activeCell="${freezeCell}" sqref="${freezeCell}"/></sheetView>`,
  )

  // 2) 列宽（按官方模板精确宽度覆盖 SheetJS 的近似值）
  out = out.replace(/<cols>[\s\S]*?<\/cols>/, buildColsXml(widths))

  // 3) 行高 + 单元格样式（表头 1 / 正文 0）
  out = out.replace(/<row r="(\d+)"([^>]*)>/g, (m, r, attrs) => {
    const row = Number(r)
    let height = 0
    if (row === headerRow) height = headerHeight
    else if (hintRow && row === hintRow) height = hintHeight
    else if (dataRowHeight) height = dataRowHeight
    const ht = height ? ` ht="${height}" customHeight="1"` : ''
    return `<row r="${r}"${ht}${attrs}>`
  })

  out = out.replace(/<c r="([A-Z]+)(\d+)"/g, (m, col, r) =>
    `<c r="${col}${r}" s="${Number(r) === headerRow ? 1 : 0}"`)

  return out
}

/**
 * 生成带样式的模板字节。
 * @param {ArrayBuffer|Uint8Array} input SheetJS 写出的 xlsx 字节
 * @param {{ headerRow?: number, hintRow?: number, headerHeight?: number, hintHeight?: number, dataRowHeight?: number,
 *           hyperlinks?: Array<{ref: string, url: string}> }} opts
 * @returns {Uint8Array}
 */
export function patchTemplateXlsx(input, opts = {}) {
  const { hyperlinks = [], ...styleOpts } = opts
  let pendingRels = null
  const entries = parseZip(input).map((e) => {
    if (e.name === 'xl/styles.xml') {
      return { name: e.name, data: new TextEncoder().encode(STYLES_XML) }
    }
    if (/^xl\/worksheets\/sheet\d+\.xml$/.test(e.name)) {
      let xml = styleSheetXml(new TextDecoder().decode(e.data), styleOpts)
      const link = addHyperlinks(xml, hyperlinks)
      xml = link.xml
      // 超链接的 rels 作为独立条目，稍后追加到 entries 末尾
      if (link.relsXml) pendingRels = { name: link.relsName, data: new TextEncoder().encode(link.relsXml) }
      return { name: e.name, data: new TextEncoder().encode(xml) }
    }
    return e
  })
  if (pendingRels) entries.push(pendingRels)
  return buildZip(entries)
}
