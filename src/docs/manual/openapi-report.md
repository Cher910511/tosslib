# 报告生成

上传软件包文件，自动生成 PDF 格式的安全检测报告，包含组件清单、漏洞分析、许可证合规等完整信息。

- **方法**：POST
- **路径**：`/v1/report/generate`
- **等级**：免费
- **Content-Type**：`multipart/form-data`

## 请求参数

| 参数 | 位置 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|:---|
| `Authorization` | Header | string | 是 | Bearer Token，格式 `Bearer sk_live_xxxx` |
| `file` | FormData | file | 是 | 待生成报告的软件包文件，支持 `zip` / `jar` / `war` / `tar.gz` 等 |

> 文件大小上限为 **200MB**。

## 请求示例

```bash
curl -X POST https://api.tosslib.example/v1/report/generate \
  -H "Authorization: Bearer sk_live_xxxx" \
  -F "file=@my-app.jar"
```

## 响应参数

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `code` | int | 错误码，0 表示成功 |
| `msg` | string | 提示信息 |
| `data.report_id` | string | 报告 ID |
| `data.download_url` | string | PDF 报告下载链接 |
| `data.expires_at` | string | 下载链接失效时间（ISO 8601） |

## 响应示例

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "report_id": "r_2c1e9b0d",
    "download_url": "https://api.tosslib.example/v1/report/r_2c1e9b0d/download",
    "expires_at": "2026-07-16T09:51:00Z"
  }
}
```

## 专属错误码

| code | HTTP | 含义 |
|:---|:---|:---|
| 40013 | 400 | 文件解析失败 |
| 40014 | 400 | 文件大小超过限制（200MB） |
| 40015 | 400 | 不支持的文件格式 |