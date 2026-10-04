# 课程招生宣发页 Skill

把课程信息做成简洁、可直接打开的 HTML 长页。

适用于训练营、线下课、工作坊，以及已经有招生页、需要改文案或压缩长度的场景。默认沿用蓝白信息卡视觉，适配电脑和手机。

## 这个 Skill 解决什么

- 参考宣传海报，拆出信息结构，不照搬他人的课程事实。
- 一次收集关键报名信息，区分确认事实与缺失条件。
- 清晰呈现目标学员、当场成果、后续支持和课程安排。
- 删除重复FAQ、同义标签与冗长解释。
- 给出可编辑 HTML，检查窄屏、锚点与加载错误。

不提供公众号正文创作，不默认搭支付系统或公开上线，也不承诺招生效果。

## 使用

把整个目录放入支持 Agent Skills 的工具的技能目录；保持 `SKILL.md`、`references`、`assets`、`scripts` 的相对位置。

Codex 本地用户技能目录可使用 `~/.codex/skills/zhxbai-course-landing-page`，是否需重新加载以当前应用为准。

目标目录尚不存在时，可直接克隆：

```bash
git clone https://github.com/zhixiongbai960-design/zhxbai-course-landing-page.git \
  ~/.codex/skills/zhxbai-course-landing-page
```

调用示例：

```text
使用 $zhxbai-course-landing-page。
请先拆解这张训练营长海报的结构，再告诉我需要补什么课程信息。
```

```text
使用 $zhxbai-course-landing-page。
根据我确认的日期、地点、成果、讲师、价格和服务范围做一版招生HTML。
沿用现有蓝白风格，不添加未经确认的招生承诺。
```

```text
使用 $zhxbai-course-landing-page 检查现有招生页。
删重复、缩长段落，保留必要报名条件；原地修改并同步已有文案。
```

## 文件

| 文件 | 用途 |
|---|---|
| `SKILL.md` | 工作流、适用范围与发布边界 |
| `references/design-guide.md` | 信息结构、蓝白视觉与精简检查 |
| `assets/landing_page.html` | 可本地打开的中性排版示例 |
| `agents/openai.yaml` | Codex界面名称与调用提示 |
| `scripts/check_page.cjs` | 四种屏宽检查及截图 |

直接用浏览器打开HTML示例即可查看。示例不含真实班期、联系人与履历，不是可直接招生的业务文案；制作实际课程时必须换成用户已确认的信息。

## 检查页面

使用已有的 Node.js 和 Playwright：

```bash
node scripts/check_page.cjs ./assets/landing_page.html /tmp/course-page-check
```

若Playwright不在默认模块路径，或需用已安装浏览器：

```bash
node scripts/check_page.cjs ./assets/landing_page.html /tmp/course-page-check \
  --playwright-module /absolute/path/to/playwright \
  --browser-path /absolute/path/to/browser
```

工具覆盖1280、768、390、320px，输出JSON报告和截图；错误退出码为1，参数或依赖不可用为2。缺少依赖时会明确报错，不自行下载安装。自动检查不替代事实核对与视觉审阅。

静态HTML本身不需要 Node.js 或 Playwright；这两者仅用于检查。

## 设计来源与范围

来源于白志雄的FDE训练营招生页制作与多轮精简经验。将真实班期与个人业务资料剥离，保留可复用方法与蓝白视觉。

默认只交付本地HTML；上传GitHub或部署网站需单独授权。预览服务不要暴露工作区或个人档案目录。

Skill结构参考 [OpenAI官方技能文档](https://developers.openai.com/plugins/build/skills)。

作者：白志雄 · AI行动派
