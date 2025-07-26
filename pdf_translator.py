#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PDF Translation Software
Based on FreeGoogleTranslate project

Features:
- Extract text from PDF files
- Translate text using multiple translation services
- Support for multiple languages
- Generate translated PDF or text output
"""

import os
import sys
import argparse
import json
import time
import logging
from typing import List, Dict, Tuple, Optional
from pathlib import Path

import pdfplumber
import requests
from googletrans import Translator
from fpdf import FPDF


class PDFTranslator:
    """Main PDF translation class"""
    
    def __init__(self, config_file: str = None):
        """Initialize the PDF translator"""
        self.config = self._load_config(config_file)
        self.translator = Translator()
        self.logger = self._setup_logging()
        
        # Supported languages based on strings.xml
        self.supported_languages = {
            'auto': 'auto',
            'zh-cn': '中文',
            'en': 'English', 
            'ja': '日语',
            'fr': '法语',
            'es': '西班牙语',
            'ko': '韩语',
            'pt': '葡萄牙语',
            'it': '意大利语',
            'de': '德语',
            'ru': '俄语',
            'ar': '阿拉伯语',
            'th': '泰语',
            'vi': '越南语',
            'hi': '印地语',
            'tr': '土耳其语'
        }
    
    def _load_config(self, config_file: str) -> Dict:
        """Load configuration from file"""
        default_config = {
            'translation_service': 'google',
            'source_language': 'auto',
            'target_language': 'zh-cn',
            'output_format': 'pdf',
            'max_retries': 3,
            'delay_between_requests': 1.0,
            'chunk_size': 1000
        }
        
        if config_file and os.path.exists(config_file):
            try:
                with open(config_file, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                    default_config.update(user_config)
            except Exception as e:
                print(f"Warning: Could not load config file: {e}")
        
        return default_config
    
    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('pdf_translator.log'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        return logging.getLogger(__name__)
    
    def extract_text_from_pdf(self, pdf_path: str) -> List[Tuple[int, str]]:
        """Extract text from PDF file"""
        self.logger.info(f"Extracting text from PDF: {pdf_path}")
        text_pages = []
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    text = page.extract_text()
                    if text and text.strip():
                        text_pages.append((page_num, text.strip()))
                        self.logger.info(f"Extracted text from page {page_num}")
                    else:
                        self.logger.warning(f"No text found on page {page_num}")
        
        except Exception as e:
            self.logger.error(f"Error extracting text from PDF: {e}")
            raise
        
        return text_pages
    
    def translate_text(self, text: str, src_lang: str = None, dest_lang: str = None) -> str:
        """Translate text using Google Translate"""
        if not text.strip():
            return text
        
        src_lang = src_lang or self.config.get('source_language', 'auto')
        dest_lang = dest_lang or self.config.get('target_language', 'zh')
        
        max_retries = self.config.get('max_retries', 3)
        delay = self.config.get('delay_between_requests', 1.0)
        
        for attempt in range(max_retries):
            try:
                self.logger.info(f"Translating text (attempt {attempt + 1}/{max_retries})")
                result = self.translator.translate(text, src=src_lang, dest=dest_lang)
                time.sleep(delay)  # Rate limiting
                return result.text
            
            except Exception as e:
                self.logger.warning(f"Translation attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    time.sleep(delay * (attempt + 1))  # Exponential backoff
                else:
                    self.logger.error(f"Translation failed after {max_retries} attempts")
                    return f"[Translation Error: {text[:100]}...]"
        
        return text
    
    def chunk_text(self, text: str, chunk_size: int = None) -> List[str]:
        """Split text into chunks for translation"""
        chunk_size = chunk_size or self.config.get('chunk_size', 1000)
        
        # Split by paragraphs first, then by chunks if needed
        paragraphs = text.split('\n\n')
        chunks = []
        current_chunk = ""
        
        for paragraph in paragraphs:
            if len(current_chunk) + len(paragraph) < chunk_size:
                if current_chunk:
                    current_chunk += '\n\n' + paragraph
                else:
                    current_chunk = paragraph
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                
                # If paragraph itself is too long, split it
                if len(paragraph) > chunk_size:
                    words = paragraph.split()
                    temp_chunk = ""
                    for word in words:
                        if len(temp_chunk) + len(word) < chunk_size:
                            temp_chunk += " " + word if temp_chunk else word
                        else:
                            if temp_chunk:
                                chunks.append(temp_chunk)
                            temp_chunk = word
                    if temp_chunk:
                        current_chunk = temp_chunk
                else:
                    current_chunk = paragraph
        
        if current_chunk:
            chunks.append(current_chunk)
        
        return chunks
    
    def translate_pdf(self, input_path: str, output_path: str = None, 
                     src_lang: str = None, dest_lang: str = None) -> str:
        """Translate entire PDF file"""
        self.logger.info(f"Starting PDF translation: {input_path}")
        
        # Extract text from PDF
        text_pages = self.extract_text_from_pdf(input_path)
        
        if not text_pages:
            self.logger.error("No text found in PDF")
            return None
        
        # Translate each page
        translated_pages = []
        for page_num, page_text in text_pages:
            self.logger.info(f"Translating page {page_num}")
            
            # Split into chunks if text is too long
            chunks = self.chunk_text(page_text)
            translated_chunks = []
            
            for i, chunk in enumerate(chunks):
                self.logger.info(f"Translating chunk {i+1}/{len(chunks)} of page {page_num}")
                translated_chunk = self.translate_text(chunk, src_lang, dest_lang)
                translated_chunks.append(translated_chunk)
            
            translated_text = '\n\n'.join(translated_chunks)
            translated_pages.append((page_num, page_text, translated_text))
        
        # Generate output
        if not output_path:
            input_file = Path(input_path)
            output_path = str(input_file.parent / f"{input_file.stem}_translated{input_file.suffix}")
        
        output_format = self.config.get('output_format', 'pdf')
        
        if output_format == 'pdf':
            self._save_to_pdf(translated_pages, output_path)
        else:
            self._save_to_text(translated_pages, output_path.replace('.pdf', '.txt'))
        
        self.logger.info(f"Translation completed. Output saved to: {output_path}")
        return output_path
    
    def _save_to_pdf(self, translated_pages: List[Tuple[int, str, str]], output_path: str):
        """Save translated content to PDF"""
        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        
        for page_num, original_text, translated_text in translated_pages:
            pdf.add_page()
            pdf.set_font("Arial", size=12)
            
            # Add page header
            pdf.set_font("Arial", "B", 14)
            pdf.cell(0, 10, f"Page {page_num} - Translation", ln=True, align='C')
            pdf.ln(5)
            
            # Add original text
            pdf.set_font("Arial", "B", 12)
            pdf.cell(0, 8, "Original:", ln=True)
            pdf.set_font("Arial", size=10)
            
            # Handle text encoding for PDF
            try:
                original_safe = original_text.encode('latin1', 'ignore').decode('latin1')
            except:
                original_safe = "Original text contains unsupported characters"
            
            pdf.multi_cell(0, 6, original_safe)
            pdf.ln(5)
            
            # Add translated text
            pdf.set_font("Arial", "B", 12)
            pdf.cell(0, 8, "Translation:", ln=True)
            pdf.set_font("Arial", size=10)
            
            try:
                translated_safe = translated_text.encode('latin1', 'ignore').decode('latin1')
            except:
                translated_safe = "Translation contains unsupported characters"
            
            pdf.multi_cell(0, 6, translated_safe)
            pdf.ln(10)
        
        pdf.output(output_path)
    
    def _save_to_text(self, translated_pages: List[Tuple[int, str, str]], output_path: str):
        """Save translated content to text file"""
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("PDF Translation Results\n")
            f.write("=" * 50 + "\n\n")
            
            for page_num, original_text, translated_text in translated_pages:
                f.write(f"Page {page_num}\n")
                f.write("-" * 20 + "\n\n")
                f.write("Original:\n")
                f.write(original_text)
                f.write("\n\nTranslation:\n")
                f.write(translated_text)
                f.write("\n\n" + "=" * 50 + "\n\n")


def main():
    """Main function for command-line interface"""
    parser = argparse.ArgumentParser(description="PDF Translation Software")
    parser.add_argument("input_pdf", nargs='?', help="Path to input PDF file")
    parser.add_argument("-o", "--output", help="Path to output file")
    parser.add_argument("-s", "--source", default="auto", help="Source language code")
    parser.add_argument("-t", "--target", default="zh-cn", help="Target language code")
    parser.add_argument("-f", "--format", choices=["pdf", "txt"], default="pdf", 
                       help="Output format")
    parser.add_argument("-c", "--config", help="Path to configuration file")
    parser.add_argument("--list-languages", action="store_true", 
                       help="List supported languages")
    
    args = parser.parse_args()
    
    # Initialize translator
    translator = PDFTranslator(args.config)
    
    if args.list_languages:
        print("Supported languages:")
        for code, name in translator.supported_languages.items():
            print(f"  {code}: {name}")
        return
    
    if not args.input_pdf:
        print("Error: input_pdf argument is required unless using --list-languages")
        parser.print_help()
        return
    
    if not os.path.exists(args.input_pdf):
        print(f"Error: Input file '{args.input_pdf}' not found")
        return
    
    # Update configuration from command line arguments
    translator.config['target_language'] = args.target
    translator.config['source_language'] = args.source
    translator.config['output_format'] = args.format
    
    try:
        output_path = translator.translate_pdf(
            args.input_pdf, 
            args.output, 
            args.source, 
            args.target
        )
        print(f"Translation completed successfully!")
        print(f"Output saved to: {output_path}")
        
    except Exception as e:
        print(f"Translation failed: {e}")
        logging.getLogger(__name__).error(f"Translation failed: {e}")


if __name__ == "__main__":
    main()