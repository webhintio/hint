#!/bin/bash

declare -r HASH="$(git rev-parse --verify HEAD)"

find packages -type f -path '*/dist/*' | zip "$HASH" -@

node ./scripts/dist-management/upload-dist.js "$HASH.zip"
