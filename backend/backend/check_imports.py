#!/usr/bin/env python3
"""
Script to check for import errors in the backend codebase.
"""

import ast
import os
import sys
from pathlib import Path
from typing import List, Tuple

def find_python_files(directory: str) -> List[Path]:
    """Find all Python files in the directory."""
    python_files = []
    for root, dirs, files in os.walk(directory):
        # Skip __pycache__ directories
        dirs[:] = [d for d in dirs if d != '__pycache__']
        
        for file in files:
            if file.endswith('.py'):
                python_files.append(Path(root) / file)
    
    return python_files

def check_imports_in_file(file_path: Path) -> List[Tuple[int, str, str]]:
    """Check imports in a single file and return potential issues."""
    issues = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        tree = ast.parse(content)
        
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    module_name = alias.name
                    if 'backend.core' in module_name or 'core.config' in module_name:
                        issues.append((node.lineno, 'import', module_name))
            
            elif isinstance(node, ast.ImportFrom):
                module_name = node.module or ''
                if 'backend.core' in module_name or 'core.config' in module_name:
                    issues.append((node.lineno, 'from_import', module_name))
                
                # Check for other potential issues
                if module_name.startswith('backend.') and 'core' in module_name:
                    issues.append((node.lineno, 'suspicious_import', module_name))
    
    except SyntaxError as e:
        issues.append((e.lineno or 0, 'syntax_error', str(e)))
    except Exception as e:
        issues.append((0, 'parse_error', str(e)))
    
    return issues

def main():
    """Main function to check all imports."""
    backend_dir = Path(__file__).parent / 'backend'
    
    if not backend_dir.exists():
        print(f"Backend directory not found: {backend_dir}")
        sys.exit(1)
    
    python_files = find_python_files(str(backend_dir))
    total_issues = 0
    
    print(f"Checking {len(python_files)} Python files for import issues...")
    print("=" * 60)
    
    for file_path in python_files:
        issues = check_imports_in_file(file_path)
        
        if issues:
            print(f"\n📁 {file_path.relative_to(Path.cwd())}")
            for line_no, issue_type, detail in issues:
                print(f"  ⚠️  Line {line_no}: {issue_type} - {detail}")
            total_issues += len(issues)
    
    print("\n" + "=" * 60)
    if total_issues == 0:
        print("✅ No import issues found!")
    else:
        print(f"❌ Found {total_issues} import issues that need to be fixed.")
    
    return total_issues

if __name__ == "__main__":
    sys.exit(main())
