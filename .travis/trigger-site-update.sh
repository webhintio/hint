#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")/.." \
    || exit 1

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

./.travis/is-master.sh \
    || exit 0

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# If something that that should be added to the site changed in the
# last 3 commits, trigger an update in the repository of the website.

if ! git diff --quiet @~3..@ \
        docs \
        CHANGELOG.md \
    ; then

    # Triggering Travis CI builds
    # https://docs.travis-ci.com/user/triggering-builds/

    declare -r SITE_REPO="webhintio%2Fwebhint.io"

    declare -r BODY='{
        "request": {
            "message": "Update site (triggered from main repository)",
            "branch": "master"
        }
    }'

    curl -s -X POST \
        -H "Content-Type: application/json; charset=utf-8" \
        -H "Accept: application/json" \
        -H "Travis-API-Version: 3" \
        -H "Authorization: token ${TRAVIS_API_TOKEN}" \
        -d "$BODY" \
        "https://api.travis-ci.org/repo/${SITE_REPO}/requests"

fi
