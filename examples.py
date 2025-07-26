#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Example usage and demonstration of PDF Translator
"""

import os
import sys
import tempfile
from pathlib import Path

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pdf_translator import PDFTranslator
from fpdf import FPDF


def create_sample_pdfs():
    """Create sample PDF files for demonstration"""
    samples = {
        'english_sample.pdf': {
            'title': 'English Sample Document',
            'content': """
This is a sample English document for PDF translation testing.

Introduction
This document demonstrates the capabilities of the PDF Translation Software.
The software can extract text from PDF files and translate it into multiple
languages using various translation services.

Features
- Supports 100+ languages
- Multiple translation services (Google, Baidu, Microsoft)
- Configurable translation parameters
- PDF and text output formats
- Intelligent text chunking
- Detailed logging and error handling

Usage
The software provides a simple command-line interface for translating
PDF documents. Users can specify source and target languages, output
formats, and configuration options.

Conclusion
This PDF translation tool makes it easy to translate documents
across language barriers, supporting global communication and
understanding.
"""
        },
        'chinese_sample.pdf': {
            'title': '中文示例文档',
            'content': """
这是一个PDF翻译软件的中文示例文档。

简介
本文档展示了PDF翻译软件的功能。该软件可以从PDF文件中提取文本，
并使用各种翻译服务将其翻译成多种语言。

功能特点
- 支持100多种语言
- 多种翻译服务（谷歌、百度、微软）
- 可配置的翻译参数
- PDF和文本输出格式
- 智能文本分块
- 详细的日志记录和错误处理

使用方法
该软件为翻译PDF文档提供了简单的命令行界面。用户可以指定
源语言和目标语言、输出格式和配置选项。

结论
这个PDF翻译工具使跨语言障碍翻译文档变得容易，支持全球
交流和理解。
"""
        }
    }
    
    created_files = []
    
    for filename, content in samples.items():
        if not os.path.exists(filename):
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Arial", "B", 16)
            
            # Title (handle encoding for PDF)
            try:
                title_safe = content['title'].encode('latin1', 'ignore').decode('latin1')
            except:
                title_safe = content['title']
            
            pdf.cell(0, 10, title_safe, ln=True, align='C')
            pdf.ln(10)
            
            pdf.set_font("Arial", size=12)
            
            # Content (handle encoding for PDF)
            try:
                content_safe = content['content'].encode('latin1', 'ignore').decode('latin1')
            except:
                content_safe = "Content contains unsupported characters for PDF"
            
            pdf.multi_cell(0, 6, content_safe)
            
            pdf.output(filename)
            created_files.append(filename)
            print(f"Created sample file: {filename}")
        else:
            print(f"Sample file already exists: {filename}")
    
    return created_files


def demonstrate_basic_usage():
    """Demonstrate basic usage of the translator"""
    print("\n" + "="*60)
    print("PDF Translator Basic Usage Demonstration")
    print("="*60)
    
    # Create sample files
    print("\n1. Creating sample PDF files...")
    sample_files = create_sample_pdfs()
    
    # Initialize translator
    print("\n2. Initializing PDF translator...")
    translator = PDFTranslator()
    
    # Demonstrate text extraction
    print("\n3. Demonstrating text extraction...")
    if os.path.exists('english_sample.pdf'):
        try:
            text_pages = translator.extract_text_from_pdf('english_sample.pdf')
            print(f"   Extracted text from {len(text_pages)} pages")
            
            if text_pages:
                page_num, text = text_pages[0]
                preview = text[:200] + "..." if len(text) > 200 else text
                print(f"   Preview of page {page_num}:")
                print(f"   {preview}")
        except Exception as e:
            print(f"   Error during text extraction: {e}")
    
    # Demonstrate configuration
    print("\n4. Configuration options...")
    print(f"   Default source language: {translator.config['source_language']}")
    print(f"   Default target language: {translator.config['target_language']}")
    print(f"   Default output format: {translator.config['output_format']}")
    print(f"   Chunk size: {translator.config['chunk_size']}")
    
    # Show supported languages
    print("\n5. Supported languages (sample)...")
    languages = list(translator.supported_languages.items())
    for code, name in languages[:10]:
        print(f"   {code}: {name}")
    print(f"   ... and {len(languages) - 10} more languages")


def show_command_examples():
    """Show command-line usage examples"""
    print("\n" + "="*60)
    print("Command-Line Usage Examples")
    print("="*60)
    
    examples = [
        {
            'description': 'Basic translation (English to Chinese)',
            'command': 'python pdf_translator.py english_sample.pdf'
        },
        {
            'description': 'Specify output file',
            'command': 'python pdf_translator.py english_sample.pdf -o translated_output.pdf'
        },
        {
            'description': 'Translate Chinese to English',
            'command': 'python pdf_translator.py chinese_sample.pdf -s zh-cn -t en'
        },
        {
            'description': 'Output as text file',
            'command': 'python pdf_translator.py english_sample.pdf -f txt'
        },
        {
            'description': 'Use custom configuration',
            'command': 'python pdf_translator.py english_sample.pdf -c config.json'
        },
        {
            'description': 'List all supported languages',
            'command': 'python pdf_translator.py --list-languages'
        }
    ]
    
    for i, example in enumerate(examples, 1):
        print(f"\n{i}. {example['description']}:")
        print(f"   {example['command']}")


def show_configuration_examples():
    """Show configuration file examples"""
    print("\n" + "="*60)
    print("Configuration Examples")
    print("="*60)
    
    configs = {
        'basic_config.json': {
            'description': 'Basic configuration for Chinese translation',
            'config': {
                'translation_service': 'google',
                'source_language': 'auto',
                'target_language': 'zh-cn',
                'output_format': 'pdf'
            }
        },
        'advanced_config.json': {
            'description': 'Advanced configuration with custom settings',
            'config': {
                'translation_service': 'google',
                'source_language': 'en',
                'target_language': 'zh-cn',
                'output_format': 'pdf',
                'max_retries': 5,
                'delay_between_requests': 2.0,
                'chunk_size': 500
            }
        }
    }
    
    for filename, info in configs.items():
        print(f"\n{info['description']} ({filename}):")
        print("   Content:")
        import json
        config_str = json.dumps(info['config'], indent=4, ensure_ascii=False)
        for line in config_str.split('\n'):
            print(f"   {line}")


def show_troubleshooting():
    """Show common troubleshooting tips"""
    print("\n" + "="*60)
    print("Troubleshooting Guide")
    print("="*60)
    
    issues = [
        {
            'problem': 'Translation fails with network error',
            'solution': [
                'Check internet connection',
                'Verify firewall settings',
                'Try increasing delay_between_requests in config',
                'Use VPN if Google services are blocked'
            ]
        },
        {
            'problem': 'PDF text extraction returns empty results',
            'solution': [
                'Ensure PDF contains selectable text (not scanned images)',
                'Try different PDF processing tools',
                'Check if PDF is password protected',
                'Verify PDF file is not corrupted'
            ]
        },
        {
            'problem': 'Translation quality is poor',
            'solution': [
                'Try different translation services',
                'Reduce chunk_size for better context',
                'Specify source language instead of auto-detection',
                'Post-edit translations manually if needed'
            ]
        },
        {
            'problem': 'Output PDF has formatting issues',
            'solution': [
                'Use text output format instead',
                'Check for special characters in source text',
                'Try different PDF generation libraries',
                'Manual formatting adjustment may be needed'
            ]
        }
    ]
    
    for i, issue in enumerate(issues, 1):
        print(f"\n{i}. {issue['problem']}:")
        for solution in issue['solution']:
            print(f"   • {solution}")


def main():
    """Main demonstration function"""
    print("PDF Translation Software - Usage Examples and Demonstration")
    print("=" * 70)
    
    try:
        demonstrate_basic_usage()
        show_command_examples()
        show_configuration_examples()
        show_troubleshooting()
        
        print("\n" + "="*70)
        print("For more information, see README.md")
        print("To run actual translation tests: python test_translator.py")
        print("To setup the environment: python setup.py")
        print("="*70)
        
    except Exception as e:
        print(f"Error during demonstration: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()