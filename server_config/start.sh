#!/bin/bash
set -e

# Set and generate DOCKER_CONFIG_FILE
DOCKER_CONFIG_FILE="/server/variables.docker"

CONFIG_FILES=(
    ".env"
    )

# Config file for parse-runner
echo "Processing ERB templates"
for CONFIG_FILE in ${CONFIG_FILES[@]}; do
  erb -r $DOCKER_CONFIG_FILE $CONFIG_FILE.erb > $CONFIG_FILE
done

echo "$(date) - Starting Colorado backend"
echo $ELASTIC_NODE
node dist/index.js

exec "$@"
