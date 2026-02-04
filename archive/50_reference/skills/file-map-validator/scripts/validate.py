#!/usr/bin/env python3
# Run with: python3 validate.py
"""
Validate all paths in MANIFEST.md exist.
Run before every commit.
"""

import os
import re
import sys

# Base path - adjust if running from different location
BASE_PATH = "/Users/andrew/clawdbot"
MANIFEST_PATH = os.path.join(BASE_PATH, "workspace/MANIFEST.md")

def extract_paths_from_manifest(manifest_content):
    """Extract all file/directory paths from MANIFEST.md"""
    paths = []

    # Match paths in table cells: | ... | `path/to/file.md` | ... |
    # Also match: `workspace/path/to/file.md`
    pattern = r'`(workspace/[^`]+)`'
    matches = re.findall(pattern, manifest_content)

    for match in matches:
        # Clean up the path
        path = match.strip()
        if path:
            paths.append(path)

    return list(set(paths))  # Remove duplicates

def validate_paths(paths):
    """Check each path exists, return results"""
    results = {"valid": [], "broken": []}

    for path in sorted(paths):
        full_path = os.path.join(BASE_PATH, path)

        if os.path.exists(full_path):
            results["valid"].append(path)
        else:
            results["broken"].append(path)

    return results

def main():
    print("=" * 60)
    print("FILE MAP VALIDATOR")
    print("Checking MANIFEST.md paths...")
    print("=" * 60)
    print()

    # Read MANIFEST.md
    if not os.path.exists(MANIFEST_PATH):
        print(f"ERROR: MANIFEST.md not found at {MANIFEST_PATH}")
        sys.exit(1)

    with open(MANIFEST_PATH, 'r') as f:
        manifest_content = f.read()

    # Extract and validate paths
    paths = extract_paths_from_manifest(manifest_content)
    results = validate_paths(paths)

    # Report valid paths
    print(f"VALID PATHS ({len(results['valid'])}):")
    for path in results['valid']:
        print(f"  ✓ {path}")

    print()

    # Report broken paths
    if results['broken']:
        print(f"BROKEN PATHS ({len(results['broken'])}):")
        for path in results['broken']:
            print(f"  ✗ {path} — FILE NOT FOUND")
        print()
        print("=" * 60)
        print(f"RESULT: {len(results['valid'])}/{len(paths)} paths valid.")
        print(f"        {len(results['broken'])} broken paths need fixing.")
        print("=" * 60)
        sys.exit(1)
    else:
        print("=" * 60)
        print(f"RESULT: All {len(paths)} paths valid. ✓")
        print("=" * 60)
        sys.exit(0)

if __name__ == "__main__":
    main()
