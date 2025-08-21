# 项目配置说明

本项目使用 EditorConfig、Prettier 和 ESLint 来确保代码风格的一致性。

## 📁 配置文件

### `.editorconfig` - 编辑器基础设置
```ini
root=true

[*]
charset=utf-8
end_of_line=lf
indent_size=4
indent_style=space
insert_final_newline=true
max_line_length=80
trim_trailing_whitespace=true
```

### `.prettierrc.json` - 代码格式化
```json
{
    "semi": false,
    "singleQuote": true,
    "printWidth": 80,
    "tabWidth": 4,
    "useTabs": false,
    "endOfLine": "lf",
    "insertFinalNewline": true,
    // ... 其他配置
}
```

## ⚠️ 配置一致性要求

为避免冲突，以下设置必须在两个文件中保持一致：

| 设置项 | EditorConfig | Prettier | 说明 |
|--------|-------------|----------|------|
| 缩进方式 | `indent_style=space` | `"useTabs": false` | 使用空格缩进 |
| 缩进大小 | `indent_size=4` | `"tabWidth": 4` | 4个空格 |
| 行宽 | `max_line_length=80` | `"printWidth": 80` | 最大80字符 |
| 换行符 | `end_of_line=lf` | `"endOfLine": "lf"` | Unix换行符 |
| 最终换行 | `insert_final_newline=true` | `"insertFinalNewline": true` | 文件末尾换行 |

## 🔍 验证配置一致性

运行以下命令检查配置是否一致：

```bash
npm run validate-config
```

### 可能的输出：

✅ **配置一致**
```
✅ EditorConfig 和 Prettier 配置一致！
```

❌ **配置冲突**
```
❌ 发现配置冲突：
  - 缩进大小冲突：EditorConfig=2，Prettier=4
  - 行宽冲突：EditorConfig=100，Prettier=80
```

⚠️ **配置建议**
```
⚠️  配置建议：
  - 建议在 Prettier 中明确设置 insertFinalNewline
```

## 🛠️ 修改配置

当需要修改格式化规则时：

1. **同时修改两个文件**：确保 `.editorconfig` 和 `.prettierrc.json` 中的对应设置保持一致
2. **运行验证**：`npm run validate-config`
3. **测试格式化**：`npm run format:check`

## 🚀 常用命令

```bash
# 验证配置一致性
npm run validate-config

# 格式化所有文件
npm run format

# 检查格式化状态
npm run format:check

# 运行所有检查（推荐在提交前运行）
npm run precommit
```

## 📝 团队协作建议

1. **提交前检查**：运行 `npm run precommit` 确保代码符合规范
2. **配置修改**：任何配置修改都应该通过 PR 讨论
3. **编辑器插件**：确保安装了推荐的 VS Code 插件（见 `.vscode/extensions.json`）
4. **自动化**：考虑在 CI/CD 中集成 `validate-config` 检查
