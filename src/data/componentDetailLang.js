/** 组件详情页：按语言的展示配置（路由 path 与 label、高亮语言、依赖片段） */

export const DETAIL_LANG_KEYS = [
  'python',
  'cpp',
  'java',
  'javascript',
  'typescript',
  'go',
  'rust',
  'kotlin',
  'scala',
]

export const DETAIL_LANG_LABELS = {
  python: 'Python',
  cpp: 'C/C++',
  java: 'Java',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  go: 'Go',
  rust: 'Rust',
  kotlin: 'Kotlin',
  scala: 'Scala',
}

/** highlight.js 语言 id（与 register 一致） */
export const DETAIL_LANG_HIGHLIGHT = {
  python: 'bash',
  cpp: 'bash',
  java: 'xml',
  javascript: 'bash',
  typescript: 'bash',
  go: 'bash',
  rust: 'toml',
  kotlin: 'kotlin',
  scala: 'scala',
}

/** 非 Java 时工具栏仅一种引入方式，Tab 上显示的名称（如仅 npm 则显示 npm） */
export const DEP_TOOL_TAB_LABELS = {
  python: 'pip',
  cpp: 'Conan',
  javascript: 'npm',
  typescript: 'npm',
  go: 'go get',
  rust: 'Cargo',
  kotlin: 'Gradle (Kotlin)',
  scala: 'sbt',
}

/** Java / Maven 坐标类组件在「Java」语言下的多种引入方式 */
export const JAVA_DEP_FORMAT_KEYS = ['maven', 'gradle-kotlin', 'gradle-groovy', 'sbt']

export const JAVA_DEP_FORMAT_LABELS = {
  maven: 'Maven',
  'gradle-kotlin': 'Gradle (Kotlin DSL)',
  'gradle-groovy': 'Gradle (Groovy)',
  sbt: 'sbt',
}

/**
 * @param {'maven' | 'gradle-kotlin' | 'gradle-groovy' | 'sbt'} format
 * @param {{ groupId: string, artifactId: string, version: string }} comp
 */
export function buildJavaDependencySnippet(format, comp) {
  const g = comp.groupId || 'org.example'
  const a = comp.artifactId
  const v = comp.version
  switch (format) {
    case 'maven':
      return [
        '<dependency>',
        `    <groupId>${g}</groupId>`,
        `    <artifactId>${a}</artifactId>`,
        `    <version>${v}</version>`,
        '</dependency>',
      ].join('\n')
    case 'gradle-kotlin':
      return [`dependencies {`, `    implementation("${g}:${a}:${v}")`, `}`].join('\n')
    case 'gradle-groovy':
      return [`dependencies {`, `    implementation '${g}:${a}:${v}'`, `}`].join('\n')
    case 'sbt':
      return `libraryDependencies += "${g}" % "${a}" % "${v}"`
    default:
      return buildJavaDependencySnippet('maven', comp)
  }
}

/** Java 子格式对应的 highlight.js 语言 */
export const JAVA_DEP_FORMAT_HIGHLIGHT = {
  maven: 'xml',
  'gradle-kotlin': 'kotlin',
  'gradle-groovy': 'groovy',
  sbt: 'scala',
}

/**
 * @param {string} langKey
 * @param {{ groupId: string, artifactId: string, version: string }} comp
 * @param {'maven' | 'gradle-kotlin' | 'gradle-groovy' | 'sbt'} [javaFormat] 仅当 langKey 为 java 时生效
 */
export function buildDependencySnippet(langKey, comp, javaFormat = 'maven') {
  const g = comp.groupId || 'org.example'
  const a = comp.artifactId
  const v = comp.version
  switch (langKey) {
    case 'python':
      return `pip install ${a}==${v}`
    case 'cpp':
      return `conan install ${a}/${v}@`
    case 'java':
      return buildJavaDependencySnippet(javaFormat, comp)
    case 'javascript':
    case 'typescript':
      return `npm install ${a}@${v}`
    case 'go': {
      const mod = comp.goModule || `example.com/${a}`
      return `go get ${mod}@v${v}`
    }
    case 'rust':
      return `[dependencies]\n${a} = "${v}"`
    case 'kotlin':
      return `implementation("${g}:${a}:${v}")`
    case 'scala':
      return `libraryDependencies += "${g}" %% "${a}" % "${v}"`
    default:
      return ''
  }
}

export function isDetailLangKey(s) {
  return typeof s === 'string' && DETAIL_LANG_KEYS.includes(s)
}
