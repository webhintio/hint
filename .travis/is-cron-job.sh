#!/bin/bash

# Check if the current job is a cron job.
# https://docs.travis-ci.com/user/cron-jobs/

[ "$TRAVIS_EVENT_TYPE" == "cron" ] \
    || exit 1
