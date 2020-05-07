#!/bin/bash

npm run build
mv dist /Users/bravf/code/github/bravf.github.io/
cd /Users/bravf/code/github/bravf.github.io/
rm -rf proto
mv dist proto
git add .
git commit -m 'deploy new' *
git push