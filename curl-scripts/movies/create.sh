#!/bin/bash

API="http://localhost:4741"
URL_PATH="/movies"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "movie": {
      "name": "'"${NAME}"'",
      "thoughts": "'"${THOUGHTS}"'",
      "rewatch": "'"${REWATCH}"'",
      "favorite": "'"${FAVORITE}"'",
      "rating": "'"${RATING}"'"
    }
  }'

echo
