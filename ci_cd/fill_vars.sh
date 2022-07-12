#!/bin/bash

DOCKER_VARIABLES=`vault kv get -format=json $VAULT_PATH_SECRET | jq -r '.data.data | to_entries | .[] | "@" + .key + " = \"" + .value + "\""' | base64 | tr -d '\n'`
RUN_TIME=`date +"%b%j%H%M%S"`

HELM_VALUE=(
  "CI_REGISTRY_IMAGE"
  "CI_COMMIT_REF_SLUG"
  "CI_COMMIT_TAG"
  "INSTANCE_CONNECTION_NAME"
  "URL"
  "DOCKER_VARIABLES"
  "RUN_TIME"
  )

for HELM_VALUE in ${HELM_VALUE[@]}; do
  TMP=$HELM_VALUE
  sed -i "s|$HELM_VALUE|${!TMP}|g" server_config/${CI_ENVIRONMENT_NAME}.values.yaml
done
