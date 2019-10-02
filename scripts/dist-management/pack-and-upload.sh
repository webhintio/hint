#!/bin/bash

declare -r HASH="$(git rev-parse --verify HEAD)"

zip -R -y "$HASH" './packages/**/dist/**/*' dist/**/* './packages/**/dist/*' dist/*

node ./scripts/dist-management/upload-dist.js "$HASH.zip"
