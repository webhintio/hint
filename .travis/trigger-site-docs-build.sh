#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# If something changed in `docs/` in the last 3 commits, trigger
# an update of the documentation in the repository of the website.

if ! git diff --quiet @~3..@ docs; then

    # Triggering Travis CI builds
    # https://docs.travis-ci.com/user/triggering-builds/

    declare -r SITE_REPO="MicrosoftEdge%2Fsonarwhal.com"

    declare -r BODY='{
        "request": {
            "message": "Rebuild docs (API request)",
            "branch": "master",
            "config": {
                "script": "npm run update-docs"
            }
        }
    }'

    curl -s -X POST \
        -H "Content-Type: application/json; charset=utf-8" \
        -H "Accept: application/json" \
        -H "Travis-API-Version: 3" \
        -H "Authorization: token ${TRAVIS_API_TOKEN}" \
        -d "$BODY" \
        "https://api.travis-ci.com/repo/${SITE_REPO}/requests"

fi
