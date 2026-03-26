/**
 * 组件详情页「组件版本」列表；点击条目跳转 `?v=&tab=version` 查看该版本信息。
 * 条目可覆盖 base mock 的 version、packageDownloads、parentSoftwares、licenses、描述等。
 */

import { COMPONENT_MOCKS } from './componentDetailMocks.js'

/** @typedef {{ version: string, score: string, released: string, vulnCount: number, vendor: string, packageDownloads?: { href: string, label: string }[], parentSoftwares?: object[], licenses?: object[], descriptionZh?: string, descriptionEn?: string }} CompVersionRow */

/** @type {Record<string, CompVersionRow[]>} */
export const VERSION_HISTORY_BY_ID = {
  'vertx-web-sstore-cookie': [
    {
      version: '4.5.21',
      score: '6.8',
      released: '2024-11-12',
      vulnCount: 1,
      vendor: 'Eclipse Vert.x',
      packageDownloads: [
        {
          href: 'https://test.tosslib.com/repo/io/vertx/vertx-web-sstore-cookie/4.5.21/vertx-web-sstore-cookie-4.5.21.jar',
          label: '.jar',
        },
        {
          href: 'https://test.tosslib.com/repo/io/vertx/vertx-web-sstore-cookie/4.5.21/vertx-web-sstore-cookie-4.5.21.zip',
          label: '.zip',
        },
      ],
    },
    {
      version: '4.5.20',
      score: '6.7',
      released: '2024-09-03',
      vulnCount: 2,
      vendor: 'Eclipse Vert.x',
      packageDownloads: [
        {
          href: 'https://test.tosslib.com/repo/io/vertx/vertx-web-sstore-cookie/4.5.20/vertx-web-sstore-cookie-4.5.20.jar',
          label: '.jar',
        },
      ],
    },
    { version: '4.5.19', score: '6.6', released: '2024-07-18', vulnCount: 2, vendor: 'Eclipse Vert.x' },
    { version: '4.5.18', score: '6.5', released: '2024-05-22', vulnCount: 3, vendor: 'Eclipse Vert.x' },
    { version: '4.5.17', score: '6.4', released: '2024-03-10', vulnCount: 4, vendor: 'Eclipse Vert.x' },
  ],
  requests: [
    { version: '2.31.0', score: '7.2', released: '2024-05-19', vulnCount: 0, vendor: 'PSF' },
    { version: '2.30.0', score: '7.1', released: '2023-12-10', vulnCount: 1, vendor: 'PSF' },
    { version: '2.29.0', score: '7.0', released: '2023-08-21', vulnCount: 1, vendor: 'PSF' },
    { version: '2.28.0', score: '6.9', released: '2023-04-15', vulnCount: 2, vendor: 'PSF' },
  ],
  openssl: [
    { version: '3.2.1', score: '6.0', released: '2024-01-30', vulnCount: 2, vendor: 'OpenSSL' },
    { version: '3.2.0', score: '5.9', released: '2023-11-07', vulnCount: 3, vendor: 'OpenSSL' },
    { version: '3.1.4', score: '5.8', released: '2023-08-01', vulnCount: 4, vendor: 'OpenSSL' },
  ],
  axios: [
    { version: '1.6.7', score: '7.5', released: '2024-02-24', vulnCount: 0, vendor: 'axios' },
    { version: '1.6.5', score: '7.4', released: '2023-12-29', vulnCount: 0, vendor: 'axios' },
    { version: '1.6.0', score: '7.3', released: '2023-10-26', vulnCount: 1, vendor: 'axios' },
  ],
  vue: [
    { version: '3.4.21', score: '8.1', released: '2024-02-27', vulnCount: 0, vendor: 'Vue' },
    { version: '3.4.15', score: '8.0', released: '2024-01-18', vulnCount: 0, vendor: 'Vue' },
    { version: '3.3.13', score: '7.9', released: '2023-11-09', vulnCount: 1, vendor: 'Vue' },
  ],
  gin: [
    { version: '1.9.1', score: '7.0', released: '2023-11-19', vulnCount: 0, vendor: 'gin-gonic' },
    { version: '1.9.0', score: '6.9', released: '2023-05-16', vulnCount: 0, vendor: 'gin-gonic' },
    { version: '1.8.2', score: '6.8', released: '2022-12-12', vulnCount: 1, vendor: 'gin-gonic' },
  ],
  tokio: [
    { version: '1.36.0', score: '7.8', released: '2024-02-05', vulnCount: 0, vendor: 'Tokio' },
    { version: '1.35.0', score: '7.7', released: '2023-12-12', vulnCount: 0, vendor: 'Tokio' },
    { version: '1.34.0', score: '7.6', released: '2023-10-17', vulnCount: 0, vendor: 'Tokio' },
  ],
  'kotlinx-coroutines-core': [
    { version: '1.8.0', score: '7.4', released: '2024-02-15', vulnCount: 0, vendor: 'JetBrains' },
    { version: '1.7.3', score: '7.3', released: '2023-07-25', vulnCount: 0, vendor: 'JetBrains' },
    { version: '1.6.4', score: '7.2', released: '2022-11-23', vulnCount: 1, vendor: 'JetBrains' },
  ],
  'akka-http': [
    { version: '10.6.3', score: '6.9', released: '2024-03-01', vulnCount: 1, vendor: 'Lightbend' },
    { version: '10.6.2', score: '6.8', released: '2023-11-20', vulnCount: 2, vendor: 'Lightbend' },
    { version: '10.6.0', score: '6.7', released: '2023-09-05', vulnCount: 2, vendor: 'Lightbend' },
  ],
}

function defaultHistoryForId(raw) {
  const m = COMPONENT_MOCKS[raw]
  const v = m?.version || '1.0.0'
  return [
    {
      version: v,
      score: '5.0',
      released: '2024-01-01',
      vulnCount: 0,
      vendor: m?.language || '—',
    },
  ]
}

/**
 * @param {string | undefined} componentId 路由 param `id`
 * @returns {CompVersionRow[]}
 */
export function getComponentVersionHistory(componentId) {
  const raw = componentId != null && String(componentId).trim() !== '' ? String(componentId).trim() : ''
  if (raw && VERSION_HISTORY_BY_ID[raw]) return VERSION_HISTORY_BY_ID[raw]
  return defaultHistoryForId(raw)
}
