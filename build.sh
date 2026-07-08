#!/bin/sh
cd ../
mkdir output
rsync -a --exclude='.git' --exclude='output' ./basic-project-apppang-18th-team3-frontend/ ./output/
cp -R ./output ./basic-project-apppang-18th-team3-frontend/
