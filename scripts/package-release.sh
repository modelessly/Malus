#!/bin/sh
set -eu

repository_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repository_root"

version=$(node -p "require('./package.json').version")
archive="release/malus-${version}.zip"

npm run store:verify
npm run build
mkdir -p release
rm -f "$archive"

(
  cd dist
  zip -q -r "../$archive" .
)

unzip -q -t "$archive"
printf '%s\n' "Created $archive"
