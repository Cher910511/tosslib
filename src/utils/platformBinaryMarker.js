/**
 * 平台下发二进制中嵌入的 UTF-8 标记（与打包流水线约定一致）。
 * 实际环境由发布系统在产物头部或尾部追加密文块；此处为前端校验逻辑占位。
 */
export const PLATFORM_DIST_MARKER = 'TOSLIB_DIST_ENC_SIG_v1'

const enc = new TextEncoder()
const NEEDLE = enc.encode(PLATFORM_DIST_MARKER)

function includesSubarray(haystack, needle) {
  if (needle.length === 0) return true
  if (haystack.length < needle.length) return false
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer
    }
    return true
  }
  return false
}

/**
 * 在本地文件中检索平台密文标记（不上传服务器）。
 * @param {File} file
 * @param {{ maxBytes?: number, headBytes?: number, tailBytes?: number }} [opts]
 * @returns {Promise<{ ok: true, found: boolean, sampledHead: number, sampledTail: number, fullScan: boolean } | { ok: false, reason: string, maxBytes?: number, size?: number }>}
 */
export async function scanFileForPlatformMarker(file, opts = {}) {
  const maxBytes = opts.maxBytes ?? 96 * 1024 * 1024
  const headBytes = opts.headBytes ?? 2 * 1024 * 1024
  const tailBytes = opts.tailBytes ?? 4 * 1024 * 1024
  const fullScanThreshold = opts.fullScanThreshold ?? 8 * 1024 * 1024

  if (!file || typeof file.size !== 'number') {
    return { ok: false, reason: 'INVALID_FILE' }
  }
  if (file.size > maxBytes) {
    return { ok: false, reason: 'FILE_TOO_LARGE', maxBytes, size: file.size }
  }

  if (file.size === 0) {
    return { ok: true, found: false, sampledHead: 0, sampledTail: 0, fullScan: true }
  }

  if (file.size <= fullScanThreshold) {
    const buf = new Uint8Array(await file.arrayBuffer())
    return {
      ok: true,
      found: includesSubarray(buf, NEEDLE),
      sampledHead: buf.length,
      sampledTail: 0,
      fullScan: true,
    }
  }

  const headLen = Math.min(file.size, headBytes)
  const head = new Uint8Array(await file.slice(0, headLen).arrayBuffer())
  if (includesSubarray(head, NEEDLE)) {
    return { ok: true, found: true, sampledHead: headLen, sampledTail: 0, fullScan: false }
  }

  const tailLen = Math.min(file.size, tailBytes)
  const tail = new Uint8Array(await file.slice(file.size - tailLen, file.size).arrayBuffer())
  if (includesSubarray(tail, NEEDLE)) {
    return { ok: true, found: true, sampledHead: headLen, sampledTail: tailLen, fullScan: false }
  }

  return { ok: true, found: false, sampledHead: headLen, sampledTail: tailLen, fullScan: false }
}
