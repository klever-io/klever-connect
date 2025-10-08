#!/bin/bash

# Get all package names
PACKAGES=$(find packages -name "package.json" -maxdepth 2 | xargs grep '"name"' | cut -d'"' -f4 | tr '\n' ',' | sed 's/,$//')

echo "Creating changeset for all packages: $PACKAGES"
echo ""
echo "Enter version bump type (major/minor/patch):"
read VERSION

echo "Enter changeset summary:"
read SUMMARY

# Generate changeset file
FILENAME=".changeset/all-packages-$(date +%s).md"

cat > "$FILENAME" << CHANGESET
---
$(find packages -name "package.json" -maxdepth 2 | xargs grep '"name"' | cut -d'"' -f4 | awk -v ver="$VERSION" '{print "\"" $1 "\": " ver}')
---

$SUMMARY
CHANGESET

echo "✅ Changeset created: $FILENAME"
cat "$FILENAME"
