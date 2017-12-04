#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")" \
    || exit 1

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

$(npm bin)/set-up-ssh --key "$encrypted_f50991be9b98_key" \
                      --iv "$encrypted_f50991be9b98_iv" \
                      --path-encrypted-key "github-deploy-key.enc"
