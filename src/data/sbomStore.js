import { reactive } from 'vue'

/**
 * SBOM 工具演示数据仓库
 * 生成表单提交后写入 records，详情分析页读取同一份数据
 */

let seq = 100

const LICENSES = [
  { name: 'Apache-2.0', type: '宽松', count: 21 },
  { name: 'MIT', type: '宽松', count: 14 },
  { name: 'BSD-3-Clause', type: '宽松', count: 6 },
  { name: 'LGPL-2.1', type: '弱传染', count: 3 },
  { name: 'GPL-3.0', type: '强传染', count: 2 },
  { name: 'MPL-2.0', type: '弱传染', count: 1 },
]

const VULNS = [
  {
    cve: 'CVE-2024-38816',
    component: 'spring-webmvc',
    version: '5.3.30',
    level: 'critical',
    levelLabel: '超危',
    cvss: 9.8,
    title: '路径遍历导致远程代码执行',
    fix: '升级至 5.3.40 及以上',
  },
  {
    cve: 'CVE-2023-44487',
    component: 'netty-codec-http2',
    version: '4.1.94.Final',
    level: 'high',
    levelLabel: '高危',
    cvss: 7.5,
    title: 'HTTP/2 Rapid Reset 拒绝服务',
    fix: '升级至 4.1.100.Final 及以上',
  },
  {
    cve: 'CVE-2024-21634',
    component: 'logback-core',
    version: '1.2.11',
    level: 'medium',
    levelLabel: '中危',
    cvss: 5.3,
    title: '反序列化信息泄露',
    fix: '升级至 1.2.13 及以上',
  },
]

const COMPONENTS = [
  { name: 'vue', version: '3.4.21', license: 'MIT', supplier: 'Evan You', type: 'library', purl: 'pkg:npm/vue@3.4.21' },
  { name: 'vue-router', version: '4.3.0', license: 'MIT', supplier: 'Evan You', type: 'library', purl: 'pkg:npm/vue-router@4.3.0' },
  { name: 'axios', version: '1.6.8', license: 'MIT', supplier: 'Matt Zabriskie', type: 'library', purl: 'pkg:npm/axios@1.6.8' },
  { name: 'element-plus', version: '2.6.2', license: 'MIT', supplier: 'Element Plus', type: 'library', purl: 'pkg:npm/element-plus@2.6.2' },
  { name: 'spring-boot', version: '2.7.18', license: 'Apache-2.0', supplier: 'VMware', type: 'framework', purl: 'pkg:maven/org.springframework.boot/spring-boot@2.7.18' },
  { name: 'spring-webmvc', version: '5.3.30', license: 'Apache-2.0', supplier: 'VMware', type: 'framework', purl: 'pkg:maven/org.springframework/spring-webmvc@5.3.30' },
  { name: 'netty-codec-http2', version: '4.1.94.Final', license: 'Apache-2.0', supplier: 'Netty', type: 'library', purl: 'pkg:maven/io.netty/netty-codec-http2@4.1.94.Final' },
  { name: 'logback-core', version: '1.2.11', license: 'EPL-1.0', supplier: 'QOS.ch', type: 'library', purl: 'pkg:maven/ch.qos.logback/logback-core@1.2.11' },
  { name: 'fastjson2', version: '2.0.47', license: 'Apache-2.0', supplier: 'Alibaba', type: 'library', purl: 'pkg:maven/com.alibaba.fastjson2/fastjson2@2.0.47' },
  { name: 'hutool-core', version: '5.8.26', license: 'MPL-2.0', supplier: 'Hutool', type: 'library', purl: 'pkg:maven/cn.hutool/hutool-core@5.8.26' },
  { name: 'mysql-connector-j', version: '8.3.0', license: 'GPL-2.0', supplier: 'Oracle', type: 'library', purl: 'pkg:maven/com.mysql/mysql-connector-j@8.3.0' },
  { name: 'snakeyaml', version: '2.2', license: 'Apache-2.0', supplier: 'SnakeYAML', type: 'library', purl: 'pkg:maven/org.yaml/snakeyaml@2.2' },
]

/* thin-2.0.1 演示数据：34 个组件，2 种许可证（MIT / Ruby） */
const THIN_DEPS = [
  ['initializer', '0.1.0', 'MIT'],
  ['mongrel', '1.1.5', 'Ruby'],
  ['daemons', '1.1.9', 'MIT'],
  ['eventmachine', '1.0.0', 'Ruby'],
  ['rack', '1.5.2', 'MIT'],
  ['rake', '10.0.4', 'MIT'],
  ['rspec', '2.13.0', 'MIT'],
  ['tilt', '1.4.1', 'MIT'],
  ['sinatra', '1.3.6', 'MIT'],
  ['thor', '0.18.1', 'MIT'],
  ['json', '1.7.7', 'Ruby'],
  ['yajl-ruby', '1.1.0', 'MIT'],
  ['rack-test', '0.6.2', 'MIT'],
  ['diff-lcs', '1.2.4', 'MIT'],
  ['polyglot', '0.3.3', 'MIT'],
  ['treetop', '1.4.14', 'MIT'],
  ['multi_json', '1.7.3', 'MIT'],
  ['rubyzip', '0.9.9', 'MIT'],
  ['mime-types', '1.23', 'MIT'],
  ['rest-client', '1.6.7', 'MIT'],
  ['net-http-persistent', '2.8', 'MIT'],
  ['addressable', '2.3.4', 'MIT'],
  ['http-cookie', '1.0.0', 'MIT'],
  ['simplecov', '0.7.1', 'MIT'],
  ['docile', '1.1.3', 'MIT'],
  ['tins', '0.8.0', 'MIT'],
  ['term-ansicolor', '1.1.3', 'MIT'],
  ['coveralls', '0.6.7', 'MIT'],
  ['ffi', '1.9.0', 'MIT'],
  ['kgio', '2.8.0', 'Ruby'],
  ['raindrops', '0.10.0', 'MIT'],
  ['unicorn', '4.6.2', 'Ruby'],
  ['puma', '1.6.3', 'MIT'],
  ['rspec-core', '2.13.1', 'MIT'],
]

const THIN_COMPONENTS = THIN_DEPS.map(([name, version, license]) => ({
  name,
  version,
  license,
  supplier: 'RubyGems.org',
  type: 'library',
  purl: `pkg:gem/${name}@${version}`,
}))

const THIN_VULNS = [
  {
    cve: 'CVE-2023-27539',
    component: 'rack',
    version: '1.5.2',
    level: 'high',
    levelLabel: '高危',
    cvss: 7.5,
    title: '特制请求头导致拒绝服务',
    fix: '升级至 2.2.6.4 / 3.0.6.1 及以上',
  },
  {
    cve: 'CVE-2024-26141',
    component: 'rack',
    version: '1.5.2',
    level: 'medium',
    levelLabel: '中危',
    cvss: 5.3,
    title: 'Range 请求解析不当导致信息泄露',
    fix: '升级至 2.2.8.1 / 3.0.9.1 及以上',
  },
]

const SEED = [
  {
    id: 'SBOM-20250917-0102',
    name: 'thin',
    version: '2.0.1',
    fileName: 'thin-2.0.1.gem',
    fileSize: '248 KB',
    spec: 'SPDX',
    specVersion: '2.3',
    outputFormat: 'JSON',
    createdAt: '2025-09-17 10:24:36',
    creator: '张三',
    poisoned: 2,
    components: THIN_COMPONENTS,
    vulnerabilities: THIN_VULNS,
  },
  {
    id: 'SBOM-20250915-0087',
    name: 'tosslib-web',
    version: '1.2.0',
    fileName: 'tosslib-web-1.2.0.tar.gz',
    fileSize: '18.4 MB',
    spec: 'SPDX',
    specVersion: '2.3',
    outputFormat: 'JSON',
    createdAt: '2025-09-15 14:32:08',
    creator: '张三',
    components: COMPONENTS,
    vulnerabilities: VULNS,
  },
  {
    id: 'SBOM-20250912-0064',
    name: 'data-pipeline',
    version: '0.9.3',
    fileName: 'data-pipeline-0.9.3.zip',
    fileSize: '7.2 MB',
    spec: 'CycloneDX',
    specVersion: '1.5',
    outputFormat: 'JSON',
    createdAt: '2025-09-12 09:18:44',
    creator: '李四',
    components: COMPONENTS.slice(0, 8),
    vulnerabilities: VULNS.slice(0, 2),
  },
  {
    id: 'SBOM-20250908-0031',
    name: 'gov-console',
    version: '2.4.1',
    fileName: 'gov-console-2.4.1.tar.gz',
    fileSize: '25.1 MB',
    spec: 'SPDX',
    specVersion: '2.3',
    outputFormat: 'XML',
    createdAt: '2025-09-08 17:05:12',
    creator: '王五',
    components: COMPONENTS.slice(2, 11),
    vulnerabilities: [VULNS[1]],
  },
]

export const sbomState = reactive({
  records: SEED.map((r) => ({ ...r })),
})

/** 许可证汇总（按组件反推） */
export function licenseSummary(record) {
  const map = {}
  for (const c of record.components) {
    map[c.license] = (map[c.license] || 0) + 1
  }
  const meta = Object.fromEntries(LICENSES.map((l) => [l.name, l.type]))
  return Object.entries(map)
    .map(([name, count]) => ({ name, count, type: meta[name] || '其他' }))
    .sort((a, b) => b.count - a.count)
}

export function riskSummary(record) {
  const levels = { critical: 0, high: 0, medium: 0, low: 0 }
  for (const v of record.vulnerabilities) {
    if (levels[v.level] !== undefined) levels[v.level] += 1
  }
  return levels
}

/** 新增一条生成记录 */
export function addSbomRecord(payload) {
  seq += 1
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const record = {
    id: `SBOM-${stamp}-${String(seq).padStart(4, '0')}`,
    name: payload.name || '未命名软件',
    version: payload.version || '1.0.0',
    fileName: payload.fileName,
    fileSize: payload.fileSize,
    spec: payload.spec,
    specVersion: payload.spec === 'SPDX' ? '2.3' : '1.5',
    outputFormat: payload.outputFormat,
    createdAt: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    creator: payload.creator || '当前用户',
    components: COMPONENTS,
    vulnerabilities: VULNS,
  }
  sbomState.records.unshift(record)
  return record
}

/** 生成指定格式的 SBOM 文本，用于「文件查看」 */
export function renderSbom(record, format) {
  const now = record.createdAt.replace(' ', 'T')
  if (format === 'cyclonedx-json') {
    const doc = {
      bomFormat: 'CycloneDX',
      specVersion: record.specVersion,
      serialNumber: `urn:uuid:${record.id.toLowerCase()}`,
      version: 1,
      metadata: {
        timestamp: now,
        tools: [{ vendor: '可信开源代码库', name: 'SBOM 生成器', version: '1.0.0' }],
        component: {
          type: 'application',
          name: record.name,
          version: record.version,
        },
      },
      components: record.components.map((c) => ({
        type: c.type,
        name: c.name,
        version: c.version,
        purl: c.purl,
        supplier: { name: c.supplier },
        licenses: [{ license: { id: c.license } }],
      })),
    }
    return JSON.stringify(doc, null, 2)
  }
  if (format === 'spdx-json') {
    const doc = {
      format: 'SPDX',
      spdxVersion: 'SPDX-2.3',
      dataLicense: 'CC0-1.0',
      SPDXID: 'SPDXRef-DOCUMENT',
      name: `${record.name}-${record.version}`,
      documentNamespace: `https://tosslib.com/spdx/${record.id}`,
      creationInfo: {
        created: now,
        creators: ['Tool: SBOM-Generator-1.0.0', `Person: ${record.creator}`],
      },
      packages: record.components.map((c, i) => ({
        SPDXID: `SPDXRef-Package-${i + 1}`,
        name: c.name,
        versionInfo: c.version,
        supplier: `Organization: ${c.supplier}`,
        downloadLocation: `https://repo.tosslib.com/${c.type}/${c.name}/${c.version}`,
        licenseConcluded: c.license,
        licenseDeclared: c.license,
        externalRefs: [{ referenceType: 'purl', referenceLocator: c.purl }],
      })),
    }
    return JSON.stringify(doc, null, 2)
  }
  if (format === 'spdx-tag') {
    const lines = [
      'SPDXVersion: SPDX-2.3',
      'DataLicense: CC0-1.0',
      'SPDXID: SPDXRef-DOCUMENT',
      `DocumentName: ${record.name}-${record.version}`,
      `DocumentNamespace: https://tosslib.com/spdx/${record.id}`,
      `Creator: Tool: SBOM-Generator-1.0.0`,
      `Created: ${now}`,
      '',
    ]
    record.components.forEach((c, i) => {
      lines.push(
        `PackageName: ${c.name}`,
        `SPDXID: SPDXRef-Package-${i + 1}`,
        `PackageVersion: ${c.version}`,
        `PackageSupplier: Organization: ${c.supplier}`,
        `PackageLicenseConcluded: ${c.license}`,
        `PackageLicenseDeclared: ${c.license}`,
        `ExternalRef: PACKAGE-MANAGER purl ${c.purl}`,
        '',
      )
    })
    return lines.join('\n')
  }
  // XML
  const items = record.components
    .map(
      (c) => `    <component type="${c.type}">
      <name>${c.name}</name>
      <version>${c.version}</version>
      <purl>${c.purl}</purl>
      <supplier>${c.supplier}</supplier>
      <license>${c.license}</license>
    </component>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<bom xmlns="http://cyclonedx.org/schema/bom/1.5" serialNumber="urn:uuid:${record.id.toLowerCase()}" version="1">
  <metadata>
    <timestamp>${now}</timestamp>
    <component type="application">
      <name>${record.name}</name>
      <version>${record.version}</version>
    </component>
  </metadata>
  <components>
${items}
  </components>
</bom>`
}
