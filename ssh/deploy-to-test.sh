#!/bin/bash
TARGET_IP="192.168.0.14"
SSH_KEY_FOR_TARGET="~/.ssh/id_rsa"

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
source "$SCRIPT_DIR/deploy-to-server.sh"
