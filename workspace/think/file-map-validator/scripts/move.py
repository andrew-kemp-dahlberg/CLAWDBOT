#!/usr/bin/env python3
"""
Move a file and update all references automatically.
The surgeon. Precise cuts, clean stitches.

Usage: python move.py <old_path> <new_path>

Both paths should be relative to /Users/andrew/clawdbot/
Example: python move.py workspace/old/file.md workspace/new/file.md
"""

import os
import re
import sys
import shutil

# Base path - adjust if running from different location
BASE_PATH = "/Users/andrew/clawdbot"

# Directories to scan for references
SCAN_DIRS = [
    "workspace",
    "CLAUDE.md",
]

# File extensions to update
SCAN_EXTENSIONS = [".md"]


def find_files_to_update():
    """Find all files that might contain references."""
    files = []

    for scan_item in SCAN_DIRS:
        full_path = os.path.join(BASE_PATH, scan_item)

        if os.path.isfile(full_path):
            files.append(full_path)
            continue

        if not os.path.exists(full_path):
            continue

        for root, dirs, filenames in os.walk(full_path):
            # Skip hidden directories
            dirs[:] = [d for d in dirs if not d.startswith('.')]

            for filename in filenames:
                if any(filename.endswith(ext) for ext in SCAN_EXTENSIONS):
                    files.append(os.path.join(root, filename))

    return files


def update_references_in_file(file_path, old_path, new_path):
    """Update all references from old_path to new_path in a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"WARNING: Could not read {file_path}: {e}")
        return []

    original_content = content
    updates = []

    # Build different variations of the paths to search for
    # (people might reference the same file different ways)
    old_variations = [
        old_path,                           # workspace/old/file.md
        f"@{old_path}",                     # @workspace/old/file.md
        f"`{old_path}`",                    # `workspace/old/file.md`
    ]

    new_variations = [
        new_path,
        f"@{new_path}",
        f"`{new_path}`",
    ]

    # Also handle paths without workspace/ prefix if file is within workspace
    if old_path.startswith('workspace/'):
        old_no_prefix = old_path[len('workspace/'):]
        new_no_prefix = new_path[len('workspace/'):] if new_path.startswith('workspace/') else new_path

        # For relative paths in files within workspace
        # This is trickier - we'd need to compute relative paths
        # For now, focus on the common patterns

    # Simple string replacement for exact matches
    for old_var, new_var in zip(old_variations, new_variations):
        if old_var in content:
            # Find line numbers for reporting
            lines = content.split('\n')
            for i, line in enumerate(lines, 1):
                if old_var in line:
                    updates.append({
                        'file': file_path,
                        'line': i,
                        'old': old_var,
                        'new': new_var
                    })

            content = content.replace(old_var, new_var)

    # Write back if changed
    if content != original_content:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
        except Exception as e:
            print(f"ERROR: Could not write {file_path}: {e}")
            return []

    return updates


def move_file(old_path, new_path):
    """Move the actual file."""
    full_old = os.path.join(BASE_PATH, old_path)
    full_new = os.path.join(BASE_PATH, new_path)

    # Check source exists
    if not os.path.exists(full_old):
        print(f"ERROR: Source file does not exist: {full_old}")
        return False

    # Create destination directory if needed
    new_dir = os.path.dirname(full_new)
    if new_dir and not os.path.exists(new_dir):
        os.makedirs(new_dir)
        print(f"Created directory: {new_dir}")

    # Move the file
    try:
        shutil.move(full_old, full_new)
        return True
    except Exception as e:
        print(f"ERROR: Could not move file: {e}")
        return False


def main():
    if len(sys.argv) != 3:
        print("Usage: python move.py <old_path> <new_path>")
        print()
        print("Both paths should be relative to /Users/andrew/clawdbot/")
        print("Example: python move.py workspace/old/file.md workspace/new/file.md")
        sys.exit(1)

    old_path = sys.argv[1]
    new_path = sys.argv[2]

    print("=" * 60)
    print("FILE MOVER")
    print(f"Moving: {old_path}")
    print(f"    To: {new_path}")
    print("=" * 60)
    print()

    # First, update all references (before moving, so we can still find them)
    print("Step 1: Updating references...")
    print()

    files = find_files_to_update()
    all_updates = []

    for file_path in files:
        updates = update_references_in_file(file_path, old_path, new_path)
        all_updates.extend(updates)

    if all_updates:
        print(f"Updated references in {len(set(u['file'] for u in all_updates))} file(s):")
        for update in all_updates:
            rel_file = os.path.relpath(update['file'], BASE_PATH)
            print(f"  - {rel_file} (line {update['line']})")
        print()
    else:
        print("No references found to update.")
        print()

    # Now move the actual file
    print("Step 2: Moving file...")

    if move_file(old_path, new_path):
        print(f"  ✓ Moved successfully")
        print()
    else:
        print()
        print("=" * 60)
        print("RESULT: FAILED - File was not moved.")
        print("        References may have been updated. Check manually.")
        print("=" * 60)
        sys.exit(1)

    # Summary
    print("=" * 60)
    print(f"RESULT: Done. File moved, {len(all_updates)} reference(s) updated.")
    print()
    print("IMPORTANT: Run 'scan.py' to verify no broken references remain.")
    print("           Run 'validate.py' to verify MANIFEST.md is accurate.")
    print("=" * 60)
    sys.exit(0)


if __name__ == "__main__":
    main()
