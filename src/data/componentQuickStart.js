/**
 * 组件详情「快速开始」：按语言生成「引入依赖 + 基本使用」两段代码（结构统一，偏占位示例）。
 */

import { buildDependencySnippet, buildJavaDependencySnippet } from './componentDetailLang.js'

/**
 * @param {string} langKey DETAIL_LANG_KEYS 之一
 * @param {{ groupId?: string, artifactId: string, version: string, name?: string, goModule?: string }} comp
 * @returns {{ title: string, code: string, highlight: string }[]}
 */
export function getQuickStartSections(langKey, comp) {
  const g = comp.groupId || 'org.example'
  const a = comp.artifactId || 'package'
  const v = comp.version || '1.0.0'

  switch (langKey) {
    case 'java':
      return [
        // {
        //   title: '引入依赖（Maven）',
        //   code: buildJavaDependencySnippet('maven', comp),
        //   highlight: 'xml',
        // },
        {
          title: '基本使用',
          code: javaUsage(a, v, g),
          highlight: 'java',
        },
      ]
    case 'python':
      return [
        // {
        //   title: '引入依赖',
        //   code: `pip install ${a}==${v}`,
        //   highlight: 'bash',
        // },
        {
          title: '基本使用',
          code: pythonUsage(a),
          highlight: 'python',
        },
      ]
    case 'javascript':
      return [
        // {
        //   title: '引入依赖',
        //   code: `npm install ${a}@${v}`,
        //   highlight: 'bash',
        // },
        {
          // title: '基本使用',
          code: jsUsage(a, v, false),
          highlight: 'javascript',
        },
      ]
    case 'typescript':
      return [
        // {
        //   title: '引入依赖',
        //   code: `npm install ${a}@${v}`,
        //   highlight: 'bash',
        // },
        {
          title: '基本使用',
          code: jsUsage(a, v, true),
          highlight: 'typescript',
        },
      ]
    case 'go':
      return [
        // {
        //   title: '引入依赖',
        //   code: buildDependencySnippet('go', comp, 'maven'),
        //   highlight: 'bash',
        // },
        {
          title: '基本使用',
          code: goUsage(a, v, comp.goModule),
          highlight: 'go',
        },
      ]
    case 'rust':
      return [
        // {
        //   title: '引入依赖（Cargo.toml）',
        //   code: buildDependencySnippet('rust', comp, 'maven'),
        //   highlight: 'toml',
        // },
        {
          title: '基本使用',
          code: rustUsage(a, v),
          highlight: 'rust',
        },
      ]
    case 'cpp':
      return [
        // {
        //   title: '引入依赖',
        //   code: `conan install ${a}/${v}@`,
        //   highlight: 'bash',
        // },
        {
          title: '基本使用',
          code: cppUsage(a, v),
          highlight: 'cpp',
        },
      ]
    case 'kotlin':
      return [
        // {
        //   title: '引入依赖（Gradle Kotlin DSL）',
        //   code: buildDependencySnippet('kotlin', comp, 'maven'),
        //   highlight: 'kotlin',
        // },
        {
          title: '基本使用',
          code: kotlinUsage(a, v),
          highlight: 'kotlin',
        },
      ]
    case 'scala':
      return [
        // {
        //   title: '引入依赖（sbt）',
        //   code: buildDependencySnippet('scala', comp, 'maven'),
        //   highlight: 'scala',
        // },
        {
          title: '基本使用',
          code: scalaUsage(a, v),
          highlight: 'scala',
        },
      ]
    default:
      return [
        { title: '引入依赖', code: '', highlight: 'bash' },
        { title: '基本使用', code: '// 暂不支持该语言示例', highlight: 'bash' },
      ]
  }
}

function javaUsage(a, v, g) {
  return [
    `// 占位示例：请按 ${g}:${a} 官方文档替换为真实客户端类型与 API`,
    'public class QuickStart {',
    '    public static void main(String[] args) {',
    '        StringBuilder builder = new StringBuilder();',
    `        builder.append("init ").append("${a}").append("@").append("${v}");`,
    '        System.out.println(builder.toString());',
    '    }',
    '}',
  ].join('\n')
}

function pyMod(a) {
  return String(a).replace(/-/g, '_')
}

function pythonUsage(a) {
  if (a === 'requests') {
    return [
      'import requests',
      '',
      'resp = requests.get("https://httpbin.org/get", timeout=10)',
      'print(resp.status_code)',
    ].join('\n')
  }
  const m = pyMod(a)
  return [
    `import ${m}`,
    '',
    'if __name__ == "__main__":',
    `    print("quick start:", "${a}", "${m}")`,
  ].join('\n')
}

function jsUsage(a, v, ts) {
  if (a === 'axios') {
    const lines = [
      "import axios from 'axios';",
      '',
      'async function main() {',
      '  const res = await axios.get("https://httpbin.org/get");',
      '  console.log(res.status);',
      '}',
      '',
      'main();',
    ]
    return lines.join('\n')
  }
  const header = ts
    ? `// import type { /* ... */ } from '${a}'\n// import { /* ... */ } from '${a}'\n\n`
    : `// import { /* ... */ } from '${a}'\n\n`
  return (
    header +
    [
      'async function main() {',
      `  console.log('quick start: ${a}@${v}');`,
      '}',
      '',
      'main();',
    ].join('\n')
  )
}

function goUsage(a, v, goModule) {
  const mod = goModule || `example.com/${a}`
  return [
    'package main',
    '',
    'import "fmt"',
    '',
    'func main() {',
    `	fmt.Printf("quick start: %s@%s (module: %s)\\n", "${a}", "${v}", "${mod}")`,
    '}',
  ].join('\n')
}

function rustUsage(a, v) {
  return [
    'fn main() {',
    `    println!("quick start: ${a} ${v} — 请在此调用 crate 公开 API");`,
    '}',
  ].join('\n')
}

function cppUsage(a, v) {
  return [
    '#include <iostream>',
    '',
    'int main() {',
    `    std::cout << "quick start: ${a}@${v} (after conan install)\\n";`,
    '    return 0;',
    '}',
  ].join('\n')
}

function kotlinUsage(a, v) {
  return [
    'fun main() {',
    `    val msg = buildString { append("${a}@").append("${v}") }`,
    '    println(msg)',
    '}',
  ].join('\n')
}

function scalaUsage(a, v) {
  return [
    'object Main extends App {',
    `  println("quick start: ${a}@${v}")`,
    '}',
  ].join('\n')
}
