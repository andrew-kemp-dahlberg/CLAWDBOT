#!/usr/bin/env python3
"""
Scan all markdown files for broken internal references.
The detective. Finds where the bodies are buried.
"""

import os
import re
import sys

# Base path - adjust if running from different location
BASE_PATH = "/Users/andrew/clawdbot"

# Directories to scan
SCAN_DIRS = [
    "workspace",
]

# File extensions to scan
SCAN_EXTENSIONS = [".md"]

# Patterns to match internal references
PATTERNS = [
    # Markdown links: [text](path/to/file.md)
    r'\[([^\]]*)\]\(([^)]+\.md)\)',
    # Backtick paths: `workspace/path/to/file.md`
    r'`(workspace/[^`]+)`',
    # @workspace references: @workspace/path/to/file.md
    r'@(workspace/[^\s\)]+)',
]


def find_markdown_files():
    """Find all markdown files in scan directories."""
    files = []

    for scan_dir in SCAN_DIRS:
        full_dir = os.path.join(BASE_PATH, scan_dir)
        if not os.path.exists(full_dir):
            continue

        for root, dirs, filenames in os.walk(full_dir):
            # Skip hidden directories
            dirs[:] = [d for d in dirs if not d.startswith('.')]

            for filename in filenames:
                if any(filename.endswith(ext) for ext in SCAN_EXTENSIONS):
                    files.append(os.path.join(root, filename))

    return files


def extract_references(file_path, content):
    """Extract all internal references from a file."""
    references = []
    lines = content.split('\n')

    for line_num, line in enumerate(lines, 1):
        for pattern in PATTERNS:
            matches = re.finditer(pattern, line)
            for match in matches:
                # Get the path (might be in different group depending on pattern)
                if pattern.startswith(r'\['):
                    # Markdown link - path is in group 2
                    ref_path = match.group(2)
                else:
                    # Backtick or @ reference - path is in group 1
                    ref_path = match.group(1)

                # Clean up the path
                ref_path = ref_path.strip()

                # Skip external links
                if ref_path.startswith('http://') or ref_path.startswith('https://'):
                    continue

                # Skip anchor-only links
                if ref_path.startswith('#'):
                    continue

                references.append({
                    'file': file_path,
                    'line': line_num,
                    'ref': ref_path,
                    'full_match': match.group(0)
                })

    return references


def resolve_path(source_file, ref_path):
    """Resolve a reference path to an absolute path."""
    # Handle @workspace/ prefix
    if ref_path.startswith('@'):
        ref_path = ref_path[1:]

    # If path starts with workspace/, it's relative to BASE_PATH
    if ref_path.startswith('workspace/'):
        return os.path.join(BASE_PATH, ref_path)

    # If path starts with /, it's absolute
    if ref_path.startswith('/'):
        return ref_path

    # Otherwise, it's relative to the source file's directory
    source_dir = os.path.dirname(source_file)
    return os.path.normpath(os.path.join(source_dir, ref_path))


def validate_reference(source_file, ref_path):
    """Check if a reference points to an existing file."""
    resolved = resolve_path(source_file, ref_path)

    # Strip any anchor from the path
    if '#' in resolved:
        resolved = resolved.split('#')[0]

    return os.path.exists(resolved), resolved


def scan_for_broken_references():
    """Scan all files and find broken references."""
    broken = []
    valid = []

    files = find_markdown_files()

    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"WARNING: Could not read {file_path}: {e}")
            continue

        references = extract_references(file_path, content)

        for ref in references:
            exists, resolved = validate_reference(ref['file'], ref['ref'])

            if exists:
                valid.append({**ref, 'resolved': resolved})
            else:
                broken.append({**ref, 'resolved': resolved})

    return broken, valid


def main():
    print("=" * 60)
    print("FILE REFERENCE SCANNER")
    print("Hunting for broken links across all markdown files...")
    print("=" * 60)
    print()

    broken, valid = scan_for_broken_references()

    # Report results
    if broken:
        print(f"BROKEN REFERENCES ({len(broken)}):")
        print()

        # Group by source file
        by_file = {}
        for ref in broken:
            rel_file = os.path.relpath(ref['file'], BASE_PATH)
            if rel_file not in by_file:
                by_file[rel_file] = []
            by_file[rel_file].append(ref)

        for source_file, refs in sorted(by_file.items()):
            print(f"  {source_file}:")
            for ref in refs:
                print(f"    Line {ref['line']}: {ref['ref']}")
                print(f"      → Would resolve to: {ref['resolved']}")
            print()

        print("=" * 60)
        print(f"RESULT: {len(valid)} valid, {len(broken)} BROKEN references.")
        print(f"        Fix these before they cause confusion.")
        print("=" * 60)
        sys.exit(1)
    else:
        print(f"VALID REFERENCES ({len(valid)}):")
        for ref in valid[:10]:  # Show first 10
            rel_file = os.path.relpath(ref['file'], BASE_PATH)
            print(f"  ✓ {rel_file}:{ref['line']} → {ref['ref']}")

        if len(valid) > 10:
            print(f"  ... and {len(valid) - 10} more")

        print()
        print("=" * 60)
        print(f"RESULT: All {len(valid)} references valid. ✓")
        print("=" * 60)
        sys.exit(0)


if __name__ == "__main__":
    main()
