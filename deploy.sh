#!/bin/bash

cp ../settings.json .
cp ../hasura .
git add .
git commit -am "fix"
caprover deploy
