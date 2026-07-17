/** 首页风险预警 · 时间线数据（6条，按时间倒序） */

export const HOME_RISK_ALERTS = [
  {
    id: 1,
    typeLabel: '漏洞预警',
    componentName: 'CairoSVG',
    componentVersion: '2.7.1',
    level: '高危',
    cveId: 'CVE-2026-42311-1211212',
    affiliation: '组织',
    description:
      'A remote code execution vulnerability exists in CairoSVG due to improper handling of SVG elements. An attacker could craft a malicious SVG file to execute arbitrary code on the target system. This vulnerability affects all versions prior to 2.7.2.',
    publishTime: '2026-07-02 14:13',
  },
  {
    id: 2,
    typeLabel: '漏洞预警',
    componentName: 'pillow',
    componentVersion: '10.3.0',
    level: '高危',
    cveId: 'CVE-2026-42312-2323234',
    affiliation: '组织',
    description:
      'A buffer overflow vulnerability has been discovered in the Pillow image processing library. Processing specially crafted images may lead to memory corruption and potential remote code execution. Users are advised to upgrade to version 10.4.0 immediately.',
    publishTime: '2026-06-28 09:45',
  },
  {
    id: 3,
    typeLabel: '漏洞预警',
    componentName: 'eslint-plugin-vue',
    componentVersion: 'v9.33.0',
    level: '中危',
    cveId: 'CVE-2026-42311-3434345',
    affiliation: '组织',
    description:
      'A prototype pollution vulnerability in eslint-plugin-vue allows attackers to inject arbitrary properties via crafted ESLint configuration files. This could lead to unexpected behavior in the build pipeline.',
    publishTime: '2026-06-25 16:30',
  },
  {
    id: 4,
    typeLabel: '漏洞预警',
    componentName: 'node-forge',
    componentVersion: 'v1.3.2',
    level: '高危',
    cveId: 'CVE-2026-50002-4545456',
    affiliation: '个人',
    description:
      'A cryptographic vulnerability in the forge library allows attackers to perform signature forgery attacks. The vulnerability resides in the RSA signature verification module and affects all versions up to 1.3.2.',
    publishTime: '2026-06-20 11:12',
  },
  {
    id: 5,
    typeLabel: '漏洞预警',
    componentName: 'tmp',
    componentVersion: 'v0.2.5',
    level: '高危',
    cveId: 'CVE-2026-50002-5656567',
    affiliation: '个人',
    description:
      'A symbolic link attack vulnerability in the tmp package allows local attackers to gain elevated privileges by exploiting insecure temporary file creation patterns.',
    publishTime: '2026-06-15 08:30',
  },
  {
    id: 6,
    typeLabel: '漏洞预警',
    componentName: 'egg',
    componentVersion: 'v3.30.1',
    level: '中危',
    cveId: 'CVE-2026-42310-6767678',
    affiliation: '组织',
    description:
      'A path traversal vulnerability exists in the egg.js framework middleware. An attacker could exploit this to access sensitive files outside the intended directory structure.',
    publishTime: '2026-06-10 14:00',
  },
]