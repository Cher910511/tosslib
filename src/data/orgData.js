// ==================== 组织管理 · 模拟数据 ====================

/**
 * @typedef {{ id: string, name: string, description: string, avatar: string, adminIds: string[], memberIds: string[], createdAt: string }} Org
 * @typedef {{ id: string, name: string, avatar: string, role: 'superadmin'|'org-admin'|'member', orgId: string|null }} User
 */

export const ORGS = [
  {
    id: 'org-001',
    name: '中国工商银行',
    description: '大型国有商业银行，全球系统重要性银行，业务涵盖公司金融、个人金融、资产管理等领域。拥有超过40万员工，在全球50多个国家和地区设有分支机构。',
    avatar: '',
    industry: '金融',
    adminIds: ['user-admin-1'],
    memberIds: ['user-mem-1', 'user-mem-2', 'user-mem-3'],
    createdAt: '2026-01-15',
    contactEmail: 'admin@icbc.com.cn',
    contactPhone: '400-000-0001',
  },
  {
    id: 'org-002',
    name: '平安科技',
    description: '平安集团旗下科技公司，专注于金融科技、医疗科技和智慧城市建设。在人工智能、区块链、云计算等领域拥有领先技术能力。',
    avatar: '',
    industry: '科技',
    adminIds: ['user-admin-2'],
    memberIds: ['user-mem-4', 'user-mem-5'],
    createdAt: '2026-02-20',
    contactEmail: 'admin@pingan-tech.com',
    contactPhone: '400-000-0002',
  },
  {
    id: 'org-003',
    name: '华为技术有限公司',
    description: '全球领先的信息与通信技术解决方案提供商，业务覆盖运营商网络、企业解决方案、消费者终端及云计算服务。',
    avatar: '',
    industry: '通信/科技',
    adminIds: ['user-admin-3'],
    memberIds: ['user-mem-6', 'user-mem-7', 'user-mem-8', 'user-mem-9'],
    createdAt: '2026-03-01',
    contactEmail: 'admin@huawei.com',
    contactPhone: '400-000-0003',
  },
  {
    id: 'org-004',
    name: '阿里巴巴集团',
    description: '中国最大的电子商务和云计算公司，业务涵盖电商、云计算、数字媒体与娱乐、创新业务等领域。',
    avatar: '',
    industry: '互联网/科技',
    adminIds: ['user-admin-4'],
    memberIds: ['user-mem-10', 'user-mem-11'],
    createdAt: '2026-03-15',
    contactEmail: 'admin@alibaba-inc.com',
    contactPhone: '400-000-0004',
  },
]

export const USERS = [
  // 超级管理员
  { id: 'user-super-1', name: '平台管理员', avatar: '', role: 'superadmin', orgId: null },
  // 组织管理员
  { id: 'user-admin-1', name: '张建国', avatar: '', role: 'org-admin', orgId: 'org-001' },
  { id: 'user-admin-2', name: '王明远', avatar: '', role: 'org-admin', orgId: 'org-002' },
  { id: 'user-admin-3', name: '李思远', avatar: '', role: 'org-admin', orgId: 'org-003' },
  { id: 'user-admin-4', name: '陈晓峰', avatar: '', role: 'org-admin', orgId: 'org-004' },
  // 组织成员
  { id: 'user-mem-1', name: '赵小明', avatar: '', role: 'member', orgId: 'org-001' },
  { id: 'user-mem-2', name: '钱丽华', avatar: '', role: 'member', orgId: 'org-001' },
  { id: 'user-mem-3', name: '孙一鸣', avatar: '', role: 'member', orgId: 'org-001' },
  { id: 'user-mem-4', name: '周雅琴', avatar: '', role: 'member', orgId: 'org-002' },
  { id: 'user-mem-5', name: '吴浩然', avatar: '', role: 'member', orgId: 'org-002' },
  { id: 'user-mem-6', name: '郑子轩', avatar: '', role: 'member', orgId: 'org-003' },
  { id: 'user-mem-7', name: '冯雨萱', avatar: '', role: 'member', orgId: 'org-003' },
  { id: 'user-mem-8', name: '王逸飞', avatar: '', role: 'member', orgId: 'org-003' },
  { id: 'user-mem-9', name: '李梦涵', avatar: '', role: 'member', orgId: 'org-003' },
  { id: 'user-mem-10', name: '刘子涵', avatar: '', role: 'member', orgId: 'org-004' },
  { id: 'user-mem-11', name: '杨思琪', avatar: '', role: 'member', orgId: 'org-004' },
]

/** 当前模拟登录用户 ID（切换角色时修改此值） */
export const CURRENT_USER_ID = 'user-super-1'

export function getOrgById(orgId) {
  return ORGS.find((o) => o.id === orgId) || null
}

export function getUserById(userId) {
  return USERS.find((u) => u.id === userId) || null
}

export function getUsersByOrgId(orgId) {
  return USERS.filter((u) => u.orgId === orgId)
}

export function getCurrentUser() {
  return getUserById(CURRENT_USER_ID)
}
