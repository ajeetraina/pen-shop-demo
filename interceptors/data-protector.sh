#!/bin/sh
# data-protector.sh - Simple sh-compatible version

RESPONSE=$(cat)
echo "[DATA-PROTECTOR] Processing response" >&2

# Mask credit cards
MASKED=$(echo "$RESPONSE" | sed 's/[0-9]\{4\}[-]*[0-9]\{4\}[-]*[0-9]\{4\}[-]*[0-9]\{4\}/****-****-****-****/g')

# Mask emails
MASKED=$(echo "$MASKED" | sed 's/[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]*\.[a-zA-Z]\{2,\}/***@***.com/g')

echo "$MASKED"
