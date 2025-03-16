#!/bin/bash

# Script to update relative imports to use the ~ alias
# This script will find all TypeScript files in the src directory
# and replace relative imports with imports using the ~ alias

echo "Updating import paths to use the ~ alias..."

# Find all TypeScript files in the src directory
find ./src -type f -name "*.ts" | while read -r file; do
  echo "Processing $file..."
  
  # Replace imports that go up multiple directories (../../)
  sed -i '' -E 's|import \{([^}]*)\} from "\.\.\/\.\.\/([^"]*)"|import {\1} from "~/\2"|g' "$file"
  
  # Replace imports that go up one directory (../)
  # We need to be careful here to preserve imports within the same directory (./)
  # First, get the directory of the current file relative to src
  rel_dir=$(dirname "$file" | sed 's|./src/||')
  
  # If the file is directly in src, we don't need to do anything special
  if [ "$rel_dir" = "." ]; then
    continue
  fi
  
  # Replace imports that go up one directory with the appropriate path
  # This is more complex because we need to determine the correct path
  sed -i '' -E 's|import \{([^}]*)\} from "\.\.\/([^"]*)"|import {\1} from "~/'"$rel_dir"'/../\2"|g' "$file"
  
  # Clean up any unnecessary path segments (e.g., domain/../entities becomes domain/entities)
  sed -i '' -E 's|~/([^/]*)/\.\./([^"]*)"|~/\2"|g' "$file"
done

echo "Import paths updated successfully!" 