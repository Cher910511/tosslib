/**
 * mockData 使用英文国家名，@surbowl/world-geo-json-zh 使用中文行政区名，用于 ECharts map 匹配。
 */
export const countryEnToZh = {
  China: '中国',
  'United States': '美国',
  Germany: '德国',
  'United Kingdom': '英国',
  Japan: '日本',
  France: '法国',
  India: '印度',
  Canada: '加拿大',
  Russia: '俄罗斯',
  Brazil: '巴西',
  'South Korea': '韩国',
  Australia: '澳大利亚',
  Netherlands: '荷兰',
  Israel: '以色列',
  Singapore: '新加坡',
  Spain: '西班牙',
  Italy: '意大利',
  Sweden: '瑞典',
  Poland: '波兰',
  Ukraine: '乌克兰',
}

export function toMapRegionName(enName) {
  return countryEnToZh[enName] ?? enName
}
