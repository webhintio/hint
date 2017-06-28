#!/bin/bash

# Check if the current commit:
#
#   * does not come from a pull request
#   * is made to the `master` branch

if [ "$TRAVIS_PULL_REQUEST" != "false" ] ||
   [ "$TRAVIS_BRANCH" != "master" ]; then
    exit 1
fi
