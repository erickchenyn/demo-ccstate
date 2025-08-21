#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

/**
 * 验证 EditorConfig 和 Prettier 配置的一致性
 */
function validateConfigs() {
    const errors = []
    const warnings = []

    try {
        // 读取 .editorconfig
        const editorConfigPath = path.join(process.cwd(), '.editorconfig')
        const editorConfigContent = fs.readFileSync(editorConfigPath, 'utf8')
        const editorConfig = parseEditorConfig(editorConfigContent)

        // 读取 .prettierrc.json
        const prettierConfigPath = path.join(process.cwd(), '.prettierrc.json')
        const prettierConfig = JSON.parse(
            fs.readFileSync(prettierConfigPath, 'utf8')
        )

        // 验证一致性
        validateConsistency(editorConfig, prettierConfig, errors, warnings)

        // 输出结果
        if (errors.length === 0 && warnings.length === 0) {
            console.log('✅ EditorConfig 和 Prettier 配置一致！')
            return true
        } else {
            if (errors.length > 0) {
                console.log('❌ 发现配置冲突：')
                errors.forEach(error => console.log(`  - ${error}`))
            }
            if (warnings.length > 0) {
                console.log('⚠️  配置建议：')
                warnings.forEach(warning => console.log(`  - ${warning}`))
            }
            return errors.length === 0
        }
    } catch (error) {
        console.error('❌ 验证配置时出错：', error.message)
        return false
    }
}

/**
 * 解析 EditorConfig 文件
 */
function parseEditorConfig(content) {
    const config = {}
    const lines = content.split('\n')
    let currentSection = null

    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue

        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            currentSection = trimmed.slice(1, -1)
            if (currentSection === '*') {
                // 全局配置
                continue
            }
        } else if (currentSection === '*' || currentSection === null) {
            const [key, value] = trimmed.split('=').map(s => s.trim())
            if (key && value) {
                config[key] = value
            }
        }
    }

    return config
}

/**
 * 验证配置一致性
 */
function validateConsistency(editorConfig, prettierConfig, errors, warnings) {
    // 检查缩进设置
    if (
        editorConfig.indent_style === 'space' &&
        prettierConfig.useTabs === true
    ) {
        errors.push('缩进冲突：EditorConfig 使用空格，Prettier 使用制表符')
    }
    if (
        editorConfig.indent_style === 'tab' &&
        prettierConfig.useTabs === false
    ) {
        errors.push('缩进冲突：EditorConfig 使用制表符，Prettier 使用空格')
    }

    // 检查缩进大小
    const editorIndentSize = parseInt(editorConfig.indent_size)
    const prettierTabWidth = prettierConfig.tabWidth
    if (
        editorIndentSize &&
        prettierTabWidth &&
        editorIndentSize !== prettierTabWidth
    ) {
        errors.push(
            `缩进大小冲突：EditorConfig=${editorIndentSize}，Prettier=${prettierTabWidth}`
        )
    }

    // 检查行宽
    const editorMaxLength = parseInt(editorConfig.max_line_length)
    const prettierPrintWidth = prettierConfig.printWidth
    if (
        editorMaxLength &&
        prettierPrintWidth &&
        editorMaxLength !== prettierPrintWidth
    ) {
        errors.push(
            `行宽冲突：EditorConfig=${editorMaxLength}，Prettier=${prettierPrintWidth}`
        )
    }

    // 检查换行符
    const editorEndOfLine = editorConfig.end_of_line
    const prettierEndOfLine = prettierConfig.endOfLine
    if (editorEndOfLine && prettierEndOfLine) {
        const mapping = { lf: 'lf', crlf: 'crlf', cr: 'cr' }
        if (mapping[editorEndOfLine] !== prettierEndOfLine) {
            errors.push(
                `换行符冲突：EditorConfig=${editorEndOfLine}，Prettier=${prettierEndOfLine}`
            )
        }
    }

    // 检查最终换行符
    const editorInsertFinalNewline =
        editorConfig.insert_final_newline === 'true'
    const prettierInsertFinalNewline = prettierConfig.insertFinalNewline
    if (editorInsertFinalNewline !== prettierInsertFinalNewline) {
        if (prettierInsertFinalNewline === undefined) {
            warnings.push('建议在 Prettier 中明确设置 insertFinalNewline')
        } else {
            errors.push(
                `最终换行符冲突：EditorConfig=${editorInsertFinalNewline}，Prettier=${prettierInsertFinalNewline}`
            )
        }
    }

    // 检查去除行尾空格（Prettier 默认会去除，EditorConfig 应该保持一致）
    const editorTrimTrailing = editorConfig.trim_trailing_whitespace === 'true'
    if (!editorTrimTrailing) {
        warnings.push(
            '建议在 EditorConfig 中启用 trim_trailing_whitespace=true'
        )
    }
}

// 运行验证
if (require.main === module) {
    const success = validateConfigs()
    process.exit(success ? 0 : 1)
}

module.exports = { validateConfigs }
