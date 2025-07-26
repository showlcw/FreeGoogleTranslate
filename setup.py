#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Setup and installation script for PDF Translator
"""

import os
import sys
import subprocess
import platform


def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 7):
        print("Error: Python 3.7 or higher is required")
        print(f"Current version: {platform.python_version()}")
        return False
    
    print(f"✓ Python version: {platform.python_version()}")
    return True


def install_requirements():
    """Install required packages"""
    print("Installing required packages...")
    
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        print("✓ Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error installing requirements: {e}")
        return False


def test_imports():
    """Test if all required modules can be imported"""
    print("Testing module imports...")
    
    required_modules = [
        'pdfplumber',
        'googletrans', 
        'requests',
        'fpdf'
    ]
    
    failed_imports = []
    
    for module in required_modules:
        try:
            __import__(module)
            print(f"✓ {module}")
        except ImportError:
            print(f"✗ {module}")
            failed_imports.append(module)
    
    if failed_imports:
        print(f"Failed to import: {', '.join(failed_imports)}")
        return False
    
    print("✓ All modules imported successfully")
    return True


def run_basic_test():
    """Run basic functionality test"""
    print("Running basic functionality test...")
    
    try:
        # Import the translator module
        from pdf_translator import PDFTranslator
        
        # Initialize translator
        translator = PDFTranslator()
        
        # Test translation of a simple text
        test_text = "Hello, world!"
        result = translator.translate_text(test_text, 'en', 'zh')
        
        print(f"Test translation: '{test_text}' -> '{result}'")
        print("✓ Basic functionality test passed")
        return True
        
    except Exception as e:
        print(f"✗ Basic functionality test failed: {e}")
        return False


def create_sample_config():
    """Create a sample configuration file"""
    config_content = """{
  "translation_service": "google",
  "source_language": "auto",
  "target_language": "zh",
  "output_format": "pdf",
  "max_retries": 3,
  "delay_between_requests": 1.0,
  "chunk_size": 1000
}"""
    
    config_file = "sample_config.json"
    
    if not os.path.exists(config_file):
        with open(config_file, 'w', encoding='utf-8') as f:
            f.write(config_content)
        print(f"✓ Created sample configuration: {config_file}")
    else:
        print(f"✓ Sample configuration already exists: {config_file}")


def show_usage_examples():
    """Display usage examples"""
    print("\n" + "="*60)
    print("PDF Translation Software Setup Complete!")
    print("="*60)
    
    print("\nUsage Examples:")
    print("-" * 30)
    
    examples = [
        "# Translate a PDF file to Chinese:",
        "python pdf_translator.py document.pdf",
        "",
        "# Specify source and target languages:",
        "python pdf_translator.py document.pdf -s en -t zh",
        "",
        "# Output as text file:",
        "python pdf_translator.py document.pdf -f txt",
        "",
        "# Use custom configuration:",
        "python pdf_translator.py document.pdf -c sample_config.json",
        "",
        "# List supported languages:",
        "python pdf_translator.py --list-languages",
        "",
        "# Run tests:",
        "python test_translator.py"
    ]
    
    for example in examples:
        print(example)
    
    print("\nFor more information, see README.md")


def main():
    """Main setup function"""
    print("PDF Translator Setup")
    print("=" * 30)
    
    success = True
    
    # Check Python version
    if not check_python_version():
        success = False
    
    # Install requirements
    if success and not install_requirements():
        success = False
    
    # Test imports
    if success and not test_imports():
        success = False
    
    # Run basic test
    if success and not run_basic_test():
        print("Warning: Basic test failed, but setup may still work")
    
    # Create sample config
    create_sample_config()
    
    if success:
        show_usage_examples()
        print("\n✓ Setup completed successfully!")
    else:
        print("\n✗ Setup encountered errors. Please check the output above.")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())