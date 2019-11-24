#!/bin/bash

cp ../settings.json .
git add .
git commit -am "fix"
caprover deploy
