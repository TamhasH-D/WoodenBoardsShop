#!/usr/bin/env python3
"""
Simple test script to verify the new search endpoint structure.
"""

import sys
from pathlib import Path

# Add the backend directory to Python path
sys.path.insert(0, str(Path(__file__).parent))


def test_imports():
    """Test that all new components can be imported."""
    try:
        from backend.dtos.product_dtos import ProductFilterDTO
        print("✓ ProductFilterDTO imports successfully")

        from backend.daos.product_daos import ProductDAO
        print("✓ ProductDAO imports successfully")

        from backend.routes.product_routes import router
        print("✓ Product routes import successfully")

        # Test ProductFilterDTO fields
        filter_dto = ProductFilterDTO()
        print("✓ ProductFilterDTO can be instantiated")

        # Check that the new method exists in ProductDAO
        if hasattr(ProductDAO, 'get_filtered_results'):
            print("✓ ProductDAO.get_filtered_results method exists")
        else:
            print("✗ ProductDAO.get_filtered_results method missing")
            return False

        return True

    except Exception as e:
        print(f"✗ Import error: {e}")
        return False


def test_filter_dto_fields():
    """Test ProductFilterDTO has expected fields."""
    try:
        from backend.dtos.product_dtos import ProductFilterDTO

        # Create instance with some fields
        filter_dto = ProductFilterDTO(
            search_query="test",
            price_min=100.0,
            price_max=500.0,
            volume_min=0.5,
            delivery_possible=True
        )

        print("✓ ProductFilterDTO accepts expected parameters")
        print(f"  - search_query: {filter_dto.search_query}")
        print(f"  - price_min: {filter_dto.price_min}")
        print(f"  - price_max: {filter_dto.price_max}")
        print(f"  - volume_min: {filter_dto.volume_min}")
        print(f"  - delivery_possible: {filter_dto.delivery_possible}")

        return True

    except Exception as e:
        print(f"✗ ProductFilterDTO field error: {e}")
        return False


def test_route_structure():
    """Test that routes are properly structured."""
    try:
        from backend.routes.product_routes import router

        # Check routes
        routes = [route.path for route in router.routes]
        print(f"✓ Product routes: {routes}")

        # Check if search route exists
        search_routes = [route for route in router.routes if '/search' in route.path]
        if search_routes:
            print("✓ Search route exists")
            search_route = search_routes[0]
            print(f"  - Path: {search_route.path}")
            print(f"  - Methods: {search_route.methods}")
        else:
            print("✗ Search route not found")
            return False

        return True

    except Exception as e:
        print(f"✗ Route structure error: {e}")
        return False


if __name__ == "__main__":
    print("Testing new product search functionality...")
    print("=" * 50)

    tests = [
        ("Import Tests", test_imports),
        ("Filter DTO Tests", test_filter_dto_fields),
        ("Route Structure Tests", test_route_structure),
    ]

    all_passed = True
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        if not test_func():
            all_passed = False

    print("\n" + "=" * 50)
    print(f"Overall result: {'PASSED' if all_passed else 'FAILED'}")
    sys.exit(0 if all_passed else 1)
