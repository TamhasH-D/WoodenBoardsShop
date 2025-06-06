#!/usr/bin/env python3
"""
Test script to verify all imports work correctly.
"""

import sys
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

def test_main_imports():
    """Test main.py imports."""
    try:
        print("Testing main.py imports...")
        from backend.main import get_app
        print("✅ main.py imports successful")
        return True
    except Exception as e:
        print(f"❌ main.py import failed: {e}")
        return False

def test_settings_imports():
    """Test settings imports."""
    try:
        print("Testing settings imports...")
        from backend.settings import settings
        print("✅ settings imports successful")
        return True
    except Exception as e:
        print(f"❌ settings import failed: {e}")
        return False

def test_routes_imports():
    """Test routes imports."""
    try:
        print("Testing routes imports...")
        from backend.routes import base_router
        print("✅ routes imports successful")
        return True
    except Exception as e:
        print(f"❌ routes import failed: {e}")
        return False

def test_services_imports():
    """Test services imports."""
    try:
        print("Testing services imports...")
        from backend.services.file_service import file_service
        from backend.services.product_service import product_service
        from backend.services.wooden_board_analysis_service import WoodenBoardAnalysisService
        print("✅ services imports successful")
        return True
    except Exception as e:
        print(f"❌ services import failed: {e}")
        return False

def test_models_imports():
    """Test models imports."""
    try:
        print("Testing models imports...")
        from backend.models import Buyer, Seller, Product, WoodenBoard
        print("✅ models imports successful")
        return True
    except Exception as e:
        print(f"❌ models import failed: {e}")
        return False

def test_daos_imports():
    """Test DAOs imports."""
    try:
        print("Testing DAOs imports...")
        from backend.daos import AllDAOs
        print("✅ DAOs imports successful")
        return True
    except Exception as e:
        print(f"❌ DAOs import failed: {e}")
        return False

def test_dtos_imports():
    """Test DTOs imports."""
    try:
        print("Testing DTOs imports...")
        from backend.dtos.product_dtos import ProductDTO, ProductInputDTO
        from backend.dtos.wooden_board_dtos import WoodenBoardDTO, WoodenBoardInputDTO
        print("✅ DTOs imports successful")
        return True
    except Exception as e:
        print(f"❌ DTOs import failed: {e}")
        return False

def main():
    """Run all import tests."""
    print("🔍 Testing all backend imports...")
    print("=" * 50)
    
    tests = [
        test_settings_imports,
        test_models_imports,
        test_dtos_imports,
        test_daos_imports,
        test_services_imports,
        test_routes_imports,
        test_main_imports,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All imports working correctly!")
        return 0
    else:
        print("❌ Some imports failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
