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
  { name: 'vue', version: '3.4.21', license: 'MIT', supplier: 'Evan You', type: 'library', language: 'JavaScript', depType: 'direct', purl: 'pkg:npm/vue@3.4.21' },
  { name: 'vue-router', version: '4.3.0', license: 'MIT', supplier: 'Evan You', type: 'library', language: 'JavaScript', depType: 'direct', purl: 'pkg:npm/vue-router@4.3.0' },
  { name: 'axios', version: '1.6.8', license: 'MIT', supplier: 'Matt Zabriskie', type: 'library', language: 'JavaScript', depType: 'direct', purl: 'pkg:npm/axios@1.6.8' },
  { name: 'element-plus', version: '2.6.2', license: 'MIT', supplier: 'Element Plus', type: 'library', language: 'JavaScript', depType: 'direct', purl: 'pkg:npm/element-plus@2.6.2' },
  { name: 'spring-boot', version: '2.7.18', license: 'Apache-2.0', supplier: 'VMware', type: 'framework', language: 'Java', depType: 'direct', purl: 'pkg:maven/org.springframework.boot/spring-boot@2.7.18' },
  { name: 'spring-webmvc', version: '5.3.30', license: 'Apache-2.0', supplier: 'VMware', type: 'framework', language: 'Java', depType: 'direct', purl: 'pkg:maven/org.springframework/spring-webmvc@5.3.30' },
  { name: 'netty-codec-http2', version: '4.1.94.Final', license: 'Apache-2.0', supplier: 'Netty', type: 'library', language: 'Java', depType: 'indirect', purl: 'pkg:maven/io.netty/netty-codec-http2@4.1.94.Final' },
  { name: 'logback-core', version: '1.2.11', license: 'EPL-1.0', supplier: 'QOS.ch', type: 'library', language: 'Java', depType: 'indirect', purl: 'pkg:maven/ch.qos.logback/logback-core@1.2.11' },
  { name: 'fastjson2', version: '2.0.47', license: 'Apache-2.0', supplier: 'Alibaba', type: 'library', language: 'Java', depType: 'direct', purl: 'pkg:maven/com.alibaba.fastjson2/fastjson2@2.0.47' },
  { name: 'hutool-core', version: '5.8.26', license: 'MPL-2.0', supplier: 'Hutool', type: 'library', language: 'Java', depType: 'direct', purl: 'pkg:maven/cn.hutool/hutool-core@5.8.26' },
  { name: 'mysql-connector-j', version: '8.3.0', license: 'GPL-2.0', supplier: 'Oracle', type: 'library', language: 'Java', depType: 'direct', purl: 'pkg:maven/com.mysql/mysql-connector-j@8.3.0' },
  { name: 'snakeyaml', version: '2.2', license: 'Apache-2.0', supplier: 'SnakeYAML', type: 'library', language: 'Java', depType: 'indirect', purl: 'pkg:maven/org.yaml/snakeyaml@2.2' },
]

/* MessagePipe 演示数据：53 个 C# 组件，直接依赖 */
const MESSAGEPIPE_DEPS = [
  ['nerdbank', '1.0.0', ''],
  ['Microsoft.CodeAnalysis.Analyzers', '3.3.4', ''],
  ['xunit', '2.4.1', 'Apache-2.0'],
  ['MessagePack', '2.5.108', ''],
  ['Microsoft.Extensions.DependencyInjection', '8.0.0', ''],
  ['Microsoft.CodeAnalysis.CSharp.Analyzer.Testing.XUnit', '1.1.1', ''],
  ['FluentAssertions', '6.12.0', ''],
  ['Microsoft.CodeAnalysis.CSharp.Workspaces', '4.8.0', ''],
  ['Easy.MessageHub', '1.0.0', ''],
  ['..\\..\\src\\MessagePipe.Redis\\MessagePipe.Redis', 'internal', ''],
  ['System.Text.Json', '8.0.0', ''],
  ['Newtonsoft.Json', '13.0.3', ''],
  ['Microsoft.Extensions.Logging', '8.0.0', ''],
  ['Microsoft.Extensions.Options', '8.0.0', ''],
  ['System.Threading.Channels', '8.0.0', ''],
  ['System.Runtime.CompilerServices.Unsafe', '6.0.0', ''],
  ['System.Buffers', '4.5.1', ''],
  ['System.Memory', '4.5.5', ''],
  ['System.Numerics.Vectors', '4.5.0', ''],
  ['System.Threading.Tasks.Extensions', '4.5.4', ''],
  ['Microsoft.Bcl.AsyncInterfaces', '8.0.0', ''],
  ['StackExchange.Redis', '2.7.33', ''],
  ['Grpc.Net.Client', '2.60.0', ''],
  ['Grpc.AspNetCore', '2.60.0', ''],
  ['Google.Protobuf', '3.25.2', ''],
  ['Microsoft.IO.RecyclableMemoryStream', '3.0.0', ''],
  ['BenchmarkDotNet', '0.13.12', ''],
  ['coverlet.collector', '6.0.1', ''],
  ['Microsoft.NET.Test.Sdk', '17.8.0', ''],
  ['Moq', '4.20.70', ''],
  ['NSubstitute', '5.1.0', ''],
  ['AutoFixture', '4.18.1', ''],
  ['Microsoft.CodeAnalysis.Common', '4.8.0', ''],
  ['Microsoft.CodeAnalysis.CSharp', '4.8.0', ''],
  ['Microsoft.CodeAnalysis.Workspaces.Common', '4.8.0', ''],
  ['System.Collections.Immutable', '8.0.0', ''],
  ['System.Reflection.Metadata', '8.0.0', ''],
  ['Microsoft.Extensions.DependencyModel', '8.0.0', ''],
  ['NuGet.Packaging', '6.8.0', ''],
  ['NuGet.Protocol', '6.8.0', ''],
  ['NuGet.Versioning', '6.8.0', ''],
  ['Roslynator.Analyzers', '4.10.0', ''],
  ['StyleCop.Analyzers', '1.2.0-beta.556', ''],
  ['Microsoft.SourceLink.GitHub', '8.0.0', ''],
  ['GitVersion.MsBuild', '5.12.0', ''],
  ['Microsoft.Extensions.ObjectPool', '8.0.0', ''],
  ['System.IO.Pipelines', '8.0.0', ''],
  ['Microsoft.AspNetCore.Connections.Abstractions', '8.0.0', ''],
  ['Microsoft.AspNetCore.SignalR.Client', '8.0.0', ''],
  ['Microsoft.Extensions.Hosting', '8.0.0', ''],
  ['Polly', '8.2.0', ''],
  ['Serilog', '3.1.1', ''],
  ['System.Linq.Async', '6.0.1', ''],
]

/* 明确许可证的组件：Apache-2.0 3 个、MIT 3 个，其余 47 个许可证未知 */
const MSGPIPE_LICENSE = {
  xunit: 'Apache-2.0',
  'Microsoft.CodeAnalysis.Analyzers': 'Apache-2.0',
  MessagePack: 'Apache-2.0',
  'Newtonsoft.Json': 'MIT',
  FluentAssertions: 'MIT',
  Polly: 'MIT',
}

const MESSAGEPIPE_COMPONENTS = MESSAGEPIPE_DEPS.map(([name, version]) => {
  const license = MSGPIPE_LICENSE[name] || ''
  return {
    name,
    version: name === 'MessagePack' ? '3.1.4' : version,
    license,
    supplier: 'NuGet.org',
    type: 'library',
    language: 'C#',
    depType: 'direct',
    verified: !!license,
    purl: `pkg:nuget/${name.replace(/[\\/]/g, '.')}@${version}`,
  }
})

/* MessagePipe 漏洞：18 条（严重 1、高危 15、中危 2） */
/* 漏洞详情补充字段：CWE、发布日期、可利用性、标题与描述 */
const VULN_DETAIL_MAP = {
  'CVE-2026-48509': {
    cwe: 'CWE-776',
    published: '2026-02-26',
    exploited: '否',
    title: 'Stack Overflow Vulnerability in MessagePack with Deeply Nested Payloads',
    titleZh: 'MessagePack 在处理深层嵌套数据时存在栈溢出漏洞',
    desc: 'MessagePack for C# prior to 3.1.4 does not limit the nesting depth of deserialized objects. A maliciously crafted payload with deeply nested structures can cause a stack overflow, leading to a denial of service.',
    fix: 'Upgrade MessagePack to version 3.1.4 or later.',
    fixZh: '升级 MessagePack 到 3.1.4 或更高版本。',
  },
  'CVE-2026-37291': {
    cwe: 'CWE-776',
    published: '2026-03-11',
    exploited: '否',
    title: 'Denial of Service in xunit.test.runner via Recursive Test Discovery',
    titleZh: 'xunit.test.runner 在递归测试发现时存在拒绝服务漏洞',
    desc: 'xunit.test.runner before 9.9.9 is vulnerable to a denial of service when scanning specially crafted test assemblies with circular type references.',
    fix: 'Upgrade xunit to version 9.9.9 or later.',
    fixZh: '升级 xunit 到 9.9.9 或更高版本。',
  },
  'CVE-2026-30218': {
    cwe: 'CWE-502',
    published: '2026-01-18',
    exploited: '否',
    title: 'Insecure Deserialization in Newtonsoft.Json TypeNameHandling',
    titleZh: 'Newtonsoft.Json TypeNameHandling 存在不安全反序列化漏洞',
    desc: 'Newtonsoft.Json before 13.0.4 may allow untrusted type resolution when TypeNameHandling is enabled, leading to remote code execution in specific configurations.',
    fix: 'Upgrade Newtonsoft.Json to version 13.0.4 or later.',
    fixZh: '升级 Newtonsoft.Json 到 13.0.4 或更高版本。',
  },
  'CVE-2026-28940': {
    cwe: 'CWE-400',
    published: '2026-01-09',
    exploited: '否',
    title: 'Uncontrolled Resource Consumption in System.Text.Json',
    titleZh: 'System.Text.Json 存在资源消耗不受控漏洞',
    desc: 'System.Text.Json before 8.0.5 does not properly limit document depth, allowing denial of service through crafted JSON payloads.',
    fix: 'Upgrade System.Text.Json to version 8.0.5 or later.',
    fixZh: '升级 System.Text.Json 到 8.0.5 或更高版本。',
  },
}

/* fast-xml-parser 演示漏洞（对齐详情弹窗示例） */
const FASTXML_VULN = {
  cve: 'CVE-2026-27942',
  component: 'fast-xml-parser',
  version: '5.3.7',
  level: 'low',
  levelLabel: 'LOW',
  cvss: 7.5,
  exploit: '否',
  fixVersion: '5.3.8',
  cwe: 'CWE-776',
  published: '2026-02-26',
  exploited: '否',
  title:
    'Stack Overflow Vulnerability in fast-xml-parser with preserveOrder Option Enabled',
  titleZh: 'fast-xml-parser 在启用 preserveOrder 选项时存在栈溢出漏洞',
  desc:
    'fast-xml-parser is a JavaScript library that allows users to validate XML, parse XML to a JS object, or build XML from a JS object without C/C++ based libraries and no callbacks. Prior to version 5.3.8, the application crashes with a stack overflow when the user uses the XML builder with the `preserveOrder:true` option. This vulnerability can be triggered by maliciously crafted XML data, leading to a denial of service.',
  fix: 'Upgrade fast-xml-parser to version 5.3.8 or later.',
  fixZh: '升级 fast-xml-parser 到 5.3.8 或更高版本。',
  componentLanguage: 'JavaScript',
}

const MESSAGEPIPE_VULNS = [
  FASTXML_VULN,
  { cve: 'CVE-2026-48509', component: 'MessagePack', version: '3.1.4', level: 'critical', levelLabel: '严重', cvss: 9.1, exploit: 'EPSS 0.3%', fixVersion: '' },
  { cve: 'CVE-2026-47182', component: 'MessagePack', version: '3.1.4', level: 'high', levelLabel: '高危', cvss: 7.5, exploit: 'EPSS 0.3%', fixVersion: '' },
  { cve: 'CVE-2026-45831', component: 'MessagePack', version: '3.1.4', level: 'high', levelLabel: '高危', cvss: 7.5, exploit: 'EPSS 0.4%', fixVersion: '' },
  { cve: 'CVE-2026-44320', component: 'MessagePack', version: '3.1.4', level: 'high', levelLabel: '高危', cvss: 7.5, exploit: 'EPSS 0.3%', fixVersion: '' },
  { cve: 'CVE-2026-43117', component: 'MessagePack', version: '3.1.4', level: 'high', levelLabel: '高危', cvss: 7.5, exploit: 'EPSS 0.4%', fixVersion: '' },
  { cve: 'CVE-2026-41874', component: 'MessagePack', version: '3.1.4', level: 'high', levelLabel: '高危', cvss: 7.5, exploit: 'EPSS 0.3%', fixVersion: '' },
  { cve: 'CVE-2026-40255', component: 'MessagePack', version: '3.1.4', level: 'high', levelLabel: '高危', cvss: 7.5, exploit: 'EPSS 0.4%', fixVersion: '' },
  { cve: 'CVE-2026-39812', component: 'MessagePack', version: '3.1.4', level: 'high', levelLabel: '高危', cvss: 7.5, exploit: 'EPSS 0.3%', fixVersion: '' },
  { cve: 'CVE-2026-38460', component: 'MessagePack', version: '3.1.4', level: 'high', levelLabel: '高危', cvss: 7.5, exploit: 'EPSS 0.4%', fixVersion: '' },
  { cve: 'CVE-2026-37291', component: 'xunit', version: '2.4.1', level: 'high', levelLabel: '高危', cvss: 7.5, exploit: '-', fixVersion: '9.9.9' },
  { cve: 'CVE-2026-36118', component: 'MessagePack', version: '3.1.4', level: 'high', levelLabel: '高危', cvss: 7.5, exploit: 'EPSS 0.4%', fixVersion: '' },
  { cve: 'CVE-2026-35904', component: 'MessagePack', version: '3.1.4', level: 'high', levelLabel: '高危', cvss: 7.5, exploit: 'EPSS 0.3%', fixVersion: '' },
  { cve: 'CVE-2026-34712', component: 'MessagePack', version: '3.1.4', level: 'high', levelLabel: '高危', cvss: 7.5, exploit: 'EPSS 0.3%', fixVersion: '' },
  { cve: 'CVE-2026-33558', component: 'MessagePack', version: '3.1.4', level: 'high', levelLabel: '高危', cvss: 7.5, exploit: 'EPSS 0.4%', fixVersion: '' },
  { cve: 'CVE-2026-32407', component: 'MessagePack', version: '3.1.4', level: 'high', levelLabel: '高危', cvss: 7.5, exploit: 'EPSS 0.3%', fixVersion: '' },
  { cve: 'CVE-2026-31665', component: 'MessagePack', version: '3.1.4', level: 'high', levelLabel: '高危', cvss: 7.5, exploit: 'EPSS 0.3%', fixVersion: '' },
  { cve: 'CVE-2026-30218', component: 'Newtonsoft.Json', version: '13.0.3', level: 'medium', levelLabel: '中危', cvss: 5.3, exploit: 'EPSS 0.1%', fixVersion: '13.0.4' },
  { cve: 'CVE-2026-28940', component: 'System.Text.Json', version: '8.0.0', level: 'medium', levelLabel: '中危', cvss: 5.3, exploit: 'EPSS 0.1%', fixVersion: '8.0.5' },
].map((v) => ({ ...v, ...(VULN_DETAIL_MAP[v.cve] || {}) }))

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

/* 按数量复制出一组组件（用于不同规模项目的演示数据） */
function makeComponents(count, base = COMPONENTS) {
  return Array.from({ length: count }, (_, i) => {
    const src = base[i % base.length]
    return { ...src, name: count > base.length ? `${src.name}` : src.name }
  })
}

const SEED = [
  {
    id: 'SBOM-20261027-0201',
    name: 'spring-framework-7.0.0',
    version: '7.0.0',
    fileName: 'spring-framework-7.0.0.zip',
    fileSize: '12.8 MB',
    sourceType: 'upload',
    status: 'processing',
    spec: 'BOM-SW',
    specVersion: '1.0',
    outputFormat: 'JSON',
    createdAt: '2026-10-27 16:02:11',
    creator: '张三',
    fileCount: 10492,
    fragmentCount: 3700,
    aiComponentCount: 0,
    tags: ['Java', '框架'],
    components: makeComponents(1268),
    vulnerabilities: MESSAGEPIPE_VULNS,
  },
  {
    id: 'SBOM-20261027-0200',
    name: 'MessagePipe-1.8.2',
    version: '1.8.2',
    fileName: 'MessagePipe-1.8.2.zip',
    fileSize: '1.9 MB',
    sourceType: 'upload',
    status: 'success',
    spec: 'BOM-SW',
    specVersion: '1.0',
    outputFormat: 'JSON',
    createdAt: '2026-10-27 15:29:44',
    creator: '张三',
    fileCount: 214,
    fragmentCount: 96,
    aiComponentCount: 0,
    tags: ['C#', '.NET'],
    components: MESSAGEPIPE_COMPONENTS,
    vulnerabilities: MESSAGEPIPE_VULNS,
  },
  {
    id: 'SBOM-20261027-0199',
    name: 'fastjson-master',
    version: 'master',
    fileName: 'fastjson-master.zip',
    fileSize: '8.4 MB',
    sourceType: 'upload',
    status: 'success',
    spec: 'SPDX',
    specVersion: '2.3',
    outputFormat: 'JSON',
    createdAt: '2026-10-27 14:48:02',
    creator: '李四',
    fileCount: 3821,
    fragmentCount: 1245,
    aiComponentCount: 0,
    tags: ['Java'],
    components: makeComponents(412),
    vulnerabilities: VULNS,
  },
  {
    id: 'SBOM-20261027-0198',
    name: 'spring-boot-4.0.4',
    version: '4.0.4',
    fileName: 'spring-boot-4.0.4.zip',
    fileSize: '10.2 MB',
    sourceType: 'upload',
    status: 'success',
    spec: 'BOM-SW',
    specVersion: '1.0',
    outputFormat: 'JSON',
    createdAt: '2026-10-27 11:36:27',
    creator: '李四',
    fileCount: 8763,
    fragmentCount: 2914,
    aiComponentCount: 0,
    tags: ['Java', '框架'],
    components: makeComponents(953),
    vulnerabilities: VULNS,
  },
  {
    id: 'SBOM-20261027-0197',
    name: 'spring-boot',
    version: 'main',
    fileName: 'spring-boot.zip',
    fileSize: '9.7 MB',
    sourceType: 'upload',
    status: 'success',
    spec: 'SPDX',
    specVersion: '2.3',
    outputFormat: 'JSON',
    createdAt: '2026-10-27 10:15:53',
    creator: '王五',
    fileCount: 8104,
    fragmentCount: 2688,
    aiComponentCount: 0,
    tags: ['Java'],
    components: makeComponents(887),
    vulnerabilities: VULNS,
  },
  {
    id: 'SBOM-20261026-0196',
    name: 'json-smart-v2-master',
    version: '2.5.2',
    fileName: 'json-smart-v2-master.zip',
    fileSize: '862 KB',
    sourceType: 'upload',
    status: 'success',
    spec: 'SPDX',
    specVersion: '2.3',
    outputFormat: 'JSON',
    createdAt: '2026-10-26 21:47:18',
    creator: '王五',
    fileCount: 168,
    fragmentCount: 42,
    aiComponentCount: 0,
    tags: ['Java'],
    components: makeComponents(37),
    vulnerabilities: VULNS.slice(0, 2),
  },
  {
    id: 'SBOM-20261026-0195',
    name: 'zing-master',
    version: 'master',
    fileName: 'zing-master.zip',
    fileSize: '524 KB',
    sourceType: 'upload',
    status: 'success',
    spec: 'CycloneDX',
    specVersion: '1.5',
    outputFormat: 'JSON',
    createdAt: '2026-10-26 19:22:05',
    creator: '张三',
    fileCount: 96,
    fragmentCount: 18,
    aiComponentCount: 0,
    tags: ['Java'],
    components: makeComponents(5),
    vulnerabilities: [],
  },
  {
    id: 'SBOM-20261026-0194',
    name: 'fastjson-1.2.83',
    version: '1.2.83',
    fileName: 'fastjson-1.2.83.zip',
    fileSize: '7.1 MB',
    sourceType: 'upload',
    status: 'success',
    spec: 'SPDX',
    specVersion: '2.3',
    outputFormat: 'JSON',
    createdAt: '2026-10-26 17:05:39',
    creator: '李四',
    fileCount: 2947,
    fragmentCount: 1024,
    aiComponentCount: 0,
    tags: ['Java'],
    components: makeComponents(784),
    vulnerabilities: VULNS,
  },
  {
    id: 'SBOM-20261026-0193',
    name: 'spring-framework-7.0.0',
    version: '7.0.0',
    fileName: 'spring-framework-7.0.0.zip',
    fileSize: '12.6 MB',
    sourceType: 'upload',
    status: 'success',
    spec: 'SPDX',
    specVersion: '2.3',
    outputFormat: 'JSON',
    createdAt: '2026-10-26 16:41:12',
    creator: '张三',
    fileCount: 10388,
    fragmentCount: 3692,
    aiComponentCount: 0,
    tags: ['Java', '框架'],
    components: makeComponents(1261),
    vulnerabilities: VULNS,
  },
  {
    id: 'SBOM-20261026-0192',
    name: 'spring-framework-7.0.0',
    version: '7.0.0',
    fileName: 'spring-framework-7.0.0.zip',
    fileSize: '12.6 MB',
    sourceType: 'upload',
    status: 'success',
    spec: 'SPDX',
    specVersion: '2.3',
    outputFormat: 'JSON',
    createdAt: '2026-10-26 15:29:30',
    creator: '王五',
    fileCount: 10376,
    fragmentCount: 3684,
    aiComponentCount: 0,
    tags: ['Java', '框架'],
    components: makeComponents(1259),
    vulnerabilities: VULNS,
  },
]

/* 补齐历史记录至 40 条（每页 10 条，共 4 页） */
const EXTRA_PROJECTS = [
  ['netty-4.1.115', '4.1.115', 328, 2460, 812, ['Java', '网络']],
  ['guava-33.3.1', '33.3.1', 96, 1184, 402, ['Java']],
  ['log4j2-2.24.1', '2.24.1', 74, 962, 318, ['Java', '日志']],
  ['jackson-databind-2.18.0', '2.18.0', 63, 845, 276, ['Java']],
  ['tomcat-11.0.0', '11.0.0', 241, 3180, 1042, ['Java', 'Web']],
  ['jetty-12.0.14', '12.0.14', 198, 2744, 908, ['Java', 'Web']],
  ['hibernate-6.6.2', '6.6.2', 176, 2210, 736, ['Java', 'ORM']],
  ['kafka-clients-3.9.0', '3.9.0', 142, 1863, 592, ['Java', '中间件']],
  ['zookeeper-3.9.3', '3.9.3', 118, 1524, 486, ['Java', '中间件']],
  ['dubbo-3.3.4', '3.3.4', 267, 3402, 1128, ['Java', 'RPC']],
  ['mybatis-3.5.19', '3.5.19', 52, 684, 214, ['Java', 'ORM']],
  ['shiro-2.0.2', '2.0.2', 41, 512, 168, ['Java', '安全']],
  ['nutz-1.r.71', '1.r.71', 89, 1082, 346, ['Java']],
  ['hutool-5.8.33', '5.8.33', 34, 468, 152, ['Java', '工具']],
  ['caffeine-3.1.8', '3.1.8', 22, 302, 96, ['Java']],
  ['junit5-5.11.3', '5.11.3', 47, 596, 188, ['Java', '测试']],
  ['mockito-5.14.2', '5.14.2', 38, 486, 154, ['Java', '测试']],
  ['micrometer-1.13.6', '1.13.6', 56, 712, 228, ['Java', '监控']],
  ['reactor-core-3.7.0', '3.7.0', 61, 786, 252, ['Java', '响应式']],
  ['vertx-core-4.5.11', '4.5.11', 108, 1396, 442, ['Java']],
  ['quarkus-3.16.2', '3.16.2', 412, 5184, 1716, ['Java', '框架']],
  ['micronaut-4.7.1', '4.7.1', 356, 4472, 1486, ['Java', '框架']],
  ['tomcat-embed-10.1.33', '10.1.33', 187, 2394, 792, ['Java', 'Web']],
  ['gson-2.11.0', '2.11.0', 18, 246, 82, ['Java']],
  ['commons-lang3-3.17.0', '3.17.0', 16, 218, 74, ['Java']],
  ['commons-collections4-4.4', '4.4', 14, 192, 64, ['Java']],
  ['okhttp-4.12.0', '4.12.0', 68, 886, 288, ['Java', '网络']],
  ['retrofit-2.11.0', '2.11.0', 44, 572, 186, ['Java', '网络']],
  ['grpc-java-1.68.1', '1.68.1', 132, 1726, 552, ['Java', 'RPC']],
  ['protobuf-java-4.28.3', '4.28.3', 27, 348, 112, ['Java']],
]

const EXTRA_RECORDS = EXTRA_PROJECTS.map(([name, version, comps, files, frags, tags], i) => {
  const day = i < 15 ? '2026-10-25' : '2026-10-24'
  const hh = String(20 - (i % 12)).padStart(2, '0')
  const mm = String((i * 7) % 60).padStart(2, '0')
  return {
    id: `SBOM-${day.replace(/-/g, '')}-${String(180 - i).padStart(4, '0')}`,
    name,
    version,
    fileName: `${name}.zip`,
    fileSize: `${(1 + (i % 20) * 0.7).toFixed(1)} MB`,
    sourceType: 'upload',
    status: 'success',
    spec: i % 2 === 0 ? 'SPDX' : 'BOM-SW',
    specVersion: i % 2 === 0 ? '2.3' : '1.0',
    outputFormat: 'JSON',
    createdAt: `${day} ${hh}:${mm}:${String((i * 13) % 60).padStart(2, '0')}`,
    creator: ['张三', '李四', '王五'][i % 3],
    fileCount: files,
    fragmentCount: frags,
    aiComponentCount: 0,
    tags,
    components: makeComponents(comps),
    vulnerabilities: VULNS,
  }
})

SEED.push(...EXTRA_RECORDS)
SEED.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))

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

/** 许可证元数据 */
export const LICENSE_META = {
  'Apache-2.0': {
    fullName: 'Apache License 2.0',
    type: '宽松型',
    risk: '低',
    riskLabel: '宽松',
    osi: true,
    fsf: true,
    spdx: true,
    gplCompat: true,
    spdxId: 'Apache-2.0',
    category: 'Permissive / 宽松型',
    year: 2004,
    owner: 'Apache Software Foundation (Organization)',
    spdxUrl: 'https://spdx.org/licenses/Apache-2.0.html',
    summaryEn:
      'A permissive license whose main conditions require preservation of copyright and license notices. Contributors provide an express grant of patent rights.',
    summaryZh:
      '一种宽松型许可证，主要条件是保留版权声明与许可声明。贡献者提供明确的专利授权。',
    obligations: [
      { level: 'can', text: 'Commercial Use' },
      { level: 'can', text: 'Distribute' },
      { level: 'can', text: 'Modify' },
      { level: 'can', text: 'Patent Use' },
      { level: 'can', text: 'Private Use' },
      { level: 'cannot', text: 'Hold Liable' },
      { level: 'cannot', text: 'Use Trademark' },
      { level: 'must', text: 'Include Copyright' },
      { level: 'must', text: 'Include License' },
      { level: 'must', text: 'State Changes' },
      { level: 'must', text: 'Include Notice' },
    ],
  },
  MIT: {
    fullName: 'MIT License',
    type: '宽松型',
    risk: '低',
    riskLabel: '宽松',
    osi: true,
    fsf: true,
    spdx: true,
    gplCompat: true,
    spdxId: 'MIT',
    category: 'Permissive / 宽松型',
    year: 1985,
    owner: 'Massachusetts Institute of Technology (Organization)',
    spdxUrl: 'https://spdx.org/licenses/MIT.html',
    summaryEn:
      'A short and simple permissive license with conditions only requiring preservation of copyright and license notices.',
    summaryZh:
      '一份简短宽松的许可证，唯一条件是保留版权声明与许可声明，允许商用、修改、分发与再许可。',
    obligations: [
      { level: 'can', text: 'Commercial Use' },
      { level: 'can', text: 'Distribute' },
      { level: 'can', text: 'Modify' },
      { level: 'can', text: 'Private Use' },
      { level: 'can', text: 'Sublicense' },
      { level: 'cannot', text: 'Hold Liable' },
      { level: 'cannot', text: 'Use Trademark' },
      { level: 'must', text: 'Include Copyright' },
      { level: 'must', text: 'Include License' },
    ],
  },
  'EPL-2.0': {
    fullName: 'Eclipse Public License 2.0',
    type: '弱传染',
    risk: '弱',
    riskLabel: '弱版权',
    osi: true,
    fsf: true,
    spdx: true,
    gplCompat: false,
    spdxId: 'EPL-2.0',
    category: 'Copyleft Limited / 弱著佐权型',
    year: 2017,
    owner: 'Eclipse Foundation (Organization)',
    spdxUrl: 'https://spdx.org/licenses/EPL-2.0.html',
    summaryEn:
      'This license, made and used by the Eclipse Foundation, is similar to GPL but allows you to link code under the license to proprietary applications.',
    summaryZh:
      '该许可证由 Eclipse Foundation 制作和使用，类似于 GPL，但允许您将许可证下的代码链接到专有应用程序。',
    obligations: [
      { level: 'can', text: 'Commercial Use' },
      { level: 'can', text: 'Distribute' },
      { level: 'can', text: 'Modify' },
      { level: 'can', text: 'Private Use' },
      { level: 'can', text: 'Sublicense' },
      { level: 'cannot', text: 'Hold Liable' },
      { level: 'cannot', text: 'Patent – License Termination' },
      { level: 'cannot', text: 'Use Patent Claims' },
      { level: 'cannot', text: 'Use Trademark' },
      { level: 'must', text: 'Compensate for Damages' },
      { level: 'must', text: 'Disclose Source' },
      { level: 'must', text: 'Include Copyright' },
      { level: 'must', text: 'Include Install Instructions' },
      { level: 'must', text: 'Include License' },
      { level: 'must', text: 'Include Original' },
      { level: 'must', text: 'Use Same License (modified version)' },
    ],
  },
  'LGPL-2.1': {
    fullName: 'GNU Lesser General Public License v2.1',
    type: '弱传染',
    risk: '弱',
    riskLabel: '弱版权',
    osi: true,
    fsf: true,
    spdx: true,
    gplCompat: true,
    spdxId: 'LGPL-2.1',
    category: 'Copyleft Limited / 弱著佐权型',
    year: 1999,
    owner: 'Free Software Foundation (Organization)',
    spdxUrl: 'https://spdx.org/licenses/LGPL-2.1.html',
    summaryEn:
      'A weak copyleft license derived from GPL. It allows linking with proprietary code as long as the library itself remains under LGPL and can be replaced.',
    summaryZh:
      '由 GPL 派生的弱著佐权许可证。只要库本身保持 LGPL 且可被替换，允许与专有代码链接。',
    obligations: [
      { level: 'can', text: 'Commercial Use' },
      { level: 'can', text: 'Distribute' },
      { level: 'can', text: 'Modify' },
      { level: 'can', text: 'Private Use' },
      { level: 'can', text: 'Sublicense' },
      { level: 'cannot', text: 'Hold Liable' },
      { level: 'cannot', text: 'Use Trademark' },
      { level: 'must', text: 'Disclose Source' },
      { level: 'must', text: 'Include Copyright' },
      { level: 'must', text: 'Include License' },
      { level: 'must', text: 'State Changes' },
      { level: 'must', text: 'Use Same License (library modifications)' },
    ],
  },
  unknown: {
    fullName: '未知许可证',
    type: '未知型',
    risk: '未知',
    riskLabel: '未知',
    osi: null,
    fsf: null,
    spdx: null,
    gplCompat: null,
    spdxId: 'NOASSERTION',
    category: 'Unknown / 未知型',
    year: null,
    owner: '-',
    spdxUrl: '',
    summaryEn: 'The license of this component could not be identified.',
    summaryZh: '未能识别该组件的许可证，建议联系上游维护者确认授权条款。',
    obligations: [],
  },
}

/** 互操作冲突：弱 Copyleft 与宽松/弱 Copyleft 共存（低危） */
export const LICENSE_CONFLICTS = [
  { pair: ['Apache-2.0', 'EPL-2.0'], level: '低危' },
  { pair: ['Apache-2.0', 'LGPL-2.1'], level: '低危' },
  { pair: ['MIT', 'EPL-2.0'], level: '低危' },
  { pair: ['MIT', 'LGPL-2.1'], level: '低危' },
  { pair: ['EPL-2.0', 'LGPL-2.1'], level: '低危' },
].map((c, i) => {
  /* 取该组合中的弱 Copyleft 许可证，用于生成针对性的解读 */
  const weak = c.pair.includes('EPL-2.0')
    ? 'EPL-2.0'
    : c.pair.includes('LGPL-2.1')
      ? 'LGPL-2.1'
      : ''
  return {
    id: `conflict-${i + 1}`,
    pair: c.pair,
    level: c.level,
    advice: `弱 Copyleft（${weak}）与宽松 / 弱 Copyleft 共存：通常可接受，但需保留版权声明`,
    action: '无强制动作；确保保留弱 Copyleft 组件的版权与许可声明',
  }
})

/* 演示：为 MessagePipe 分析记录挂载互操作冲突示例 */
{
  const mp = sbomState.records.find((r) => r.name === 'MessagePipe-1.8.2')
  if (mp) mp.licenseConflicts = LICENSE_CONFLICTS
}

/** 许可证详情：按组件统计，附认证与风险信息 */
export function licenseDetail(record) {
  const total = record.components.length || 1
  const map = {}
  for (const c of record.components) {
    const key = c.license || 'unknown'
    map[key] = (map[key] || 0) + 1
  }
  return Object.entries(map)
    .map(([name, count]) => {
      const meta = LICENSE_META[name] || LICENSE_META.unknown
      return {
        name,
        count,
        pct: Math.round((count / total) * 100),
        ...meta,
      }
    })
    .sort((a, b) => {
      if (a.name === 'unknown') return 1
      if (b.name === 'unknown') return -1
      return b.count - a.count
    })
}

/** 许可证合规五维评分（0-100） */
export function licenseScore(record) {
  const details = licenseDetail(record)
  const known = details.filter((d) => d.name !== 'unknown')
  const knownCount = known.reduce((s, d) => s + d.count, 0)

  const permissive = known.filter((d) => d.type === '宽松型')
  const weak = known.filter((d) => d.type === '弱传染')
  const strong = known.filter((d) => d.type === '强传染')

  const pct = (n) => (knownCount ? Math.round((n / knownCount) * 100) : 100)

  return [
    { key: 'clarity', label: '明确度', score: knownCount ? 100 : 0 },
    {
      key: 'permissive',
      label: '宽松占比',
      score: pct(permissive.reduce((s, d) => s + d.count, 0)),
    },
    { key: 'conflict', label: '冲突安全度', score: strong.length && weak.length ? 60 : 100 },
    { key: 'proprietary', label: '专有安全度', score: 100 },
    {
      key: 'copyleft',
      label: '传染安全度',
      score: 100 - pct(strong.reduce((s, d) => s + d.count, 0)) / 2,
    },
  ]
}

/** 各标准的版本号 */
const SPEC_VERSIONS = {
  'BOM-SW': '1.0',
  SPDX: '2.3',
  CycloneDX: '1.5',
  'CycloneDX-ML': '1.5',
  SWID: '2015',
  'SPDX-3-AI': '3.0',
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
    specVersion: SPEC_VERSIONS[payload.spec] || '1.0',
    outputFormat: payload.outputFormat,
    createdAt: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    creator: payload.creator || '当前用户',
    sourceType: payload.sourceType || 'upload',
    status: 'success',
    fileCount: payload.fileCount ?? 0,
    fragmentCount: payload.fragmentCount ?? 0,
    aiComponentCount: payload.aiComponentCount ?? 0,
    tags: payload.tags || [],
    components: payload.components || COMPONENTS,
    vulnerabilities: payload.vulnerabilities || VULNS,
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
