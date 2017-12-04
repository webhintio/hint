#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")" \
    || exit 1

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

$(npm bin)/set-up-ssh --key "$encrypted_6fa449eea33c_key" \
                      --iv  "$encrypted_6fa449eea33c_iv" \
                      --path-encrypted-key "github-deploy-key.enc"
