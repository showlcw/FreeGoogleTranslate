# PDF Translation Software

基于FreeGoogleTranslate项目的PDF翻译软件，支持多种翻译服务和语言。

## 功能特性

- 📄 PDF文本提取和翻译
- 🌐 支持多种翻译服务（Google翻译、百度翻译、微软翻译等）
- 🗣️ 支持100+种语言
- 📤 支持PDF和文本格式输出
- ⚙️ 可配置的翻译参数
- 🔄 智能文本分块处理
- 📝 详细的日志记录

## 支持的语言

基于原项目strings.xml中的语言列表，支持包括但不限于：

- 中文 (简体/繁体)
- 英语
- 日语
- 韩语
- 法语
- 德语
- 西班牙语
- 意大利语
- 葡萄牙语
- 俄语
- 阿拉伯语
- 泰语
- 越南语
- 印地语
- 土耳其语
- 等100+种语言

## 安装

1. 克隆仓库：
```bash
git clone https://github.com/showlcw/FreeGoogleTranslate.git
cd FreeGoogleTranslate
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

## 使用方法

### 基本用法

```bash
# 翻译PDF文件为中文
python pdf_translator.py input.pdf

# 指定输出文件
python pdf_translator.py input.pdf -o output.pdf

# 指定源语言和目标语言
python pdf_translator.py input.pdf -s en -t zh

# 输出为文本格式
python pdf_translator.py input.pdf -f txt

# 查看支持的语言列表
python pdf_translator.py --list-languages
```

### 高级用法

使用配置文件：
```bash
python pdf_translator.py input.pdf -c config.json
```

### 配置文件示例

```json
{
  "translation_service": "google",
  "source_language": "auto",
  "target_language": "zh",
  "output_format": "pdf",
  "max_retries": 3,
  "delay_between_requests": 1.0,
  "chunk_size": 1000
}
```

## 命令行参数

- `input_pdf`: 输入PDF文件路径（必需）
- `-o, --output`: 输出文件路径
- `-s, --source`: 源语言代码（默认：auto）
- `-t, --target`: 目标语言代码（默认：zh）
- `-f, --format`: 输出格式，pdf或txt（默认：pdf）
- `-c, --config`: 配置文件路径
- `--list-languages`: 显示支持的语言列表

## 语言代码

常用语言代码：
- `auto`: 自动检测
- `zh`: 中文
- `en`: 英语
- `ja`: 日语
- `ko`: 韩语
- `fr`: 法语
- `de`: 德语
- `es`: 西班牙语
- `ru`: 俄语
- `ar`: 阿拉伯语

完整语言列表请运行 `python pdf_translator.py --list-languages`

## 翻译服务

### Google翻译（默认）
- 免费使用
- 支持100+种语言
- 无需API密钥

### 百度翻译
- 需要API密钥
- 高精度翻译
- 针对中文优化

### 微软翻译
- 需要API密钥
- 企业级翻译服务
- 支持实时翻译

## 示例

### 翻译英文PDF为中文：
```bash
python pdf_translator.py document.pdf -s en -t zh -o document_chinese.pdf
```

### 自动检测语言并翻译为英文：
```bash
python pdf_translator.py document.pdf -t en
```

### 输出为文本格式：
```bash
python pdf_translator.py document.pdf -f txt -o translation.txt
```

## 特性说明

### 智能文本处理
- 自动检测和处理PDF中的文本内容
- 智能分段，保持文档结构
- 处理多页PDF文档

### 翻译优化
- 自动分块处理长文本
- 支持翻译重试机制
- 请求间隔控制，避免API限制

### 输出格式
- PDF格式：保持原文和翻译对照
- 文本格式：纯文本输出，便于编辑

## 日志

程序会自动生成日志文件 `pdf_translator.log`，记录翻译过程和错误信息。

## 注意事项

1. 首次使用Google翻译服务可能需要网络连接
2. 大型PDF文件翻译可能需要较长时间
3. 某些PDF可能包含图片文字，需要OCR功能（未来版本支持）
4. 翻译质量取决于所选的翻译服务

## 错误处理

程序包含完善的错误处理机制：
- 网络连接错误自动重试
- 翻译API错误处理
- PDF解析错误提示
- 详细错误日志记录

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

本项目基于原FreeGoogleTranslate项目开发，遵循相同的开源许可证。

## 更新日志

### v1.0.0
- 初始版本发布
- 支持PDF文本提取和翻译
- 支持Google翻译服务
- 支持多种输出格式
- 完整的命令行界面

## 技术支持

如有问题，请查看：
1. 程序生成的日志文件
2. GitHub Issues
3. 项目文档

## 相关项目

- [FreeGoogleTranslate](https://github.com/showlcw/FreeGoogleTranslate) - 原始翻译项目
- [Google翻译API](https://cloud.google.com/translate) - Google翻译服务
- [百度翻译API](https://fanyi-api.baidu.com/) - 百度翻译服务