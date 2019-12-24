#!/bin/bash

rm -rf .git
git init .
cp ../settings.json .
git add .
git commit -am "fix"
caprover deploy --default
rm settings.json
