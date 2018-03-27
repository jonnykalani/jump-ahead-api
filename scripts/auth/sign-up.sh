#!/bin/bash

API="http://localhost:4741"
URL_PATH="/sign-up"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --data '{
    "credentials": {
      "email": "'"${EMAIL}"'",
      "organization": "'"${ORGANIZATION}"'",
      "password": "'"${PASSWORD}"'",
      "password_confirmation": "'"${PASSWORD}"'",
      "address": "'"${ADDRESS}"'",
      "phone_number": "'"${PHONE_NUMBER}"'",
      "company_description":"'"${COMPANY_DESCRIPTION}"'"
    }
  }'

echo
