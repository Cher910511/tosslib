# AI 智能选型助手

集成大语言模型能力，提供开源软件发现与选型、安全风险评估、代码审查、合规核查等智能问答服务。采用 SSE（Server-Sent Events）流式响应，实时推送推理过程和最终回答。

- **方法**：POST
- **路径**：`/v1/ai/assist`
- **等级**：内测
- **Content-Type**：`application/json`

## 请求参数

| 参数 | 位置 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|:---|
| `Authorization` | Header | string | 是 | Bearer Token，格式 `Bearer sk_live_xxxx` |
| `prompt` | Body | string | 是 | 用户输入提示，最长 4000 字符 |
| `context` | Body | object | 否 | 附加上下文：可含 `repo` / `file` / `scan_id` |

## 请求示例

```bash
curl -X POST https://api.tosslib.example/v1/ai/assist \
  -H "Authorization: Bearer sk_live_xxxx" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "有没有比Fastjson更安全替代的Java JSON库？"}'
```

## 响应

AI 助手接口采用 **两步响应** 模式：

### 第一步：同步创建会话

请求提交后，接口立即返回会话信息：

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `code` | int | 状态码，200 表示成功 |
| `error_name` | string | 错误名称，成功时为 `null` |
| `msg` | string | 提示信息 |
| `data.id` | int | 会话 ID |
| `data.name` | string | 会话标题（自动摘要） |
| `trace_id` | string | 请求追踪 ID |

```json
{
  "code": 200,
  "error_name": null,
  "msg": "success",
  "data": {
    "id": 592,
    "name": "有没有比Fastjson更安全替代的Ja..."
  },
  "trace_id": "ee5858114d744661a560018976f15288"
}
```

### 第二步：SSE 流式接收回答

创建会话后，通过 SSE 连接接收流式事件，每个事件为 `data: {...}` 格式，以换行分隔。事件类型如下：

| 事件类型 | 说明 |
|:---|:---|
| `reasoning` | AI 推理过程（思考链），逐字流式推送 |
| `text` | 最终回答文本，逐字流式推送 |
| `tokens` | Token 消耗统计 |
| `tool_batch` | 批量工具调用 |
| `tool_start` | 单个工具开始执行 |
| `tool_result` | 工具执行结果 |
| `tool_output` | 工具输出内容（分块） |
| `done` | 全部完成信号 |

**SSE 事件示例：**

```
data:{"type":"reasoning","content":"用户"}

data:{"type":"reasoning","content":"询问"}

data:{"type":"reasoning","content":"有没有比Fastjson更安全的Java JSON库"}

data:{"type":"tokens","prompt":5025,"completion":225,"total":5250}

data:{"type":"tool_batch","calls":[{"id":"call_xxx","name":"todo","arguments":"{...}"}]}

data:{"type":"tool_start","id":"call_xxx","name":"todo","arguments":"{...}"}

data:{"type":"tool_result","id":"call_xxx","name":"todo","output":"...","success":true,"duration_ms":0}

data:{"type":"text","content":"根据查询结果，我为您推荐"}

data:{"type":"text","content":"以下比Fastjson更安全的Java JSON库"}

data:{"type":"done","tokens":13264,"tool_calls":18,"session_id":"20923a16-5c4f-4738-bdf0-8c19333654c1"}
```

### SSE 事件字段说明

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `type` | string | 事件类型 |
| `content` | string | `reasoning` / `text` 类型的文本内容 |
| `prompt` | int | `tokens` 类型的 prompt token 数 |
| `completion` | int | `tokens` 类型的 completion token 数 |
| `total` | int | `tokens` 类型的总 token 数 |
| `calls` | array | `tool_batch` 类型的工具调用列表 |
| `id` | string | `tool_start` / `tool_result` 类型的工具调用 ID |
| `name` | string | 工具名称 |
| `arguments` | string | 工具调用参数（JSON 字符串） |
| `output` | string | 工具执行输出 |
| `success` | bool | 工具执行是否成功 |
| `duration_ms` | int | 工具执行耗时（毫秒） |
| `tool_calls` | int | `done` 类型的工具调用总数 |
| `session_id` | string | `done` 类型的会话 ID |

## 专属错误码

| code | HTTP | 含义 |
|:---|:---|:---|
| 40005 | 400 | prompt 超过 4000 字符 |