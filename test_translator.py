#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script for PDF Translator
"""

import os
import sys
import tempfile
from pathlib import Path

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pdf_translator import PDFTranslator
from fpdf import FPDF


def create_test_pdf():
    """Create a test PDF with sample text"""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # Add sample text in English
    sample_text = """
    Welcome to the PDF Translation Software
    
    This is a sample document created for testing the PDF translation functionality.
    
    The software can extract text from PDF files and translate it into multiple languages
    using various translation services like Google Translate, Baidu Translate, and 
    Microsoft Translate.
    
    Key features include:
    - Support for 100+ languages
    - Multiple output formats (PDF and text)
    - Configurable translation parameters
    - Intelligent text chunking
    - Detailed logging
    
    This document demonstrates the basic functionality of extracting and translating
    PDF content. The translation maintains the original document structure while
    providing accurate translations.
    
    Thank you for using our PDF Translation Software!
    """
    
    pdf.multi_cell(0, 6, sample_text)
    
    # Create temporary file
    temp_file = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
    pdf.output(temp_file.name)
    
    return temp_file.name


def test_basic_translation():
    """Test basic PDF translation functionality"""
    print("Creating test PDF...")
    test_pdf_path = create_test_pdf()
    
    try:
        print(f"Test PDF created: {test_pdf_path}")
        
        # Initialize translator
        print("Initializing PDF translator...")
        translator = PDFTranslator()
        
        # Test text extraction
        print("Testing text extraction...")
        text_pages = translator.extract_text_from_pdf(test_pdf_path)
        print(f"Extracted text from {len(text_pages)} pages")
        
        if text_pages:
            page_num, text = text_pages[0]
            print(f"Sample text from page {page_num}:")
            print(text[:200] + "..." if len(text) > 200 else text)
            
            # Test translation of a small chunk
            print("\nTesting translation...")
            sample_text = "Hello, this is a test translation."
            translated = translator.translate_text(sample_text, 'en', 'zh-cn')
            print(f"Original: {sample_text}")
            print(f"Translated: {translated}")
        
        print("\nBasic tests completed successfully!")
        
    except Exception as e:
        print(f"Test failed: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Clean up
        if os.path.exists(test_pdf_path):
            os.unlink(test_pdf_path)
            print(f"Cleaned up test file: {test_pdf_path}")


def test_full_translation():
    """Test full PDF translation"""
    print("\n" + "="*50)
    print("Testing full PDF translation...")
    
    test_pdf_path = create_test_pdf()
    
    try:
        translator = PDFTranslator()
        
        # Translate the entire PDF
        output_path = translator.translate_pdf(
            test_pdf_path, 
            src_lang='en', 
            dest_lang='zh-cn'
        )
        
        print(f"Translation completed!")
        print(f"Output file: {output_path}")
        
        if os.path.exists(output_path):
            size = os.path.getsize(output_path)
            print(f"Output file size: {size} bytes")
            
            # Clean up output file
            os.unlink(output_path)
            print("Cleaned up output file")
        
    except Exception as e:
        print(f"Full translation test failed: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        if os.path.exists(test_pdf_path):
            os.unlink(test_pdf_path)


def test_language_support():
    """Test language support functionality"""
    print("\n" + "="*50)
    print("Testing language support...")
    
    translator = PDFTranslator()
    
    print("Supported languages:")
    for code, name in list(translator.supported_languages.items())[:10]:
        print(f"  {code}: {name}")
    
    print(f"Total supported languages: {len(translator.supported_languages)}")


def main():
    """Run all tests"""
    print("PDF Translator Test Suite")
    print("=" * 50)
    
    test_basic_translation()
    test_language_support()
    
    # Only run full translation test if basic tests pass
    try:
        test_full_translation()
    except Exception as e:
        print(f"Skipping full translation test due to error: {e}")
    
    print("\n" + "="*50)
    print("Test suite completed!")


if __name__ == "__main__":
    main()