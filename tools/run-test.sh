#!/bin/bash

file=${1};

if [ -n "$file" ];then
    jest $file --coverage --collectCoverageFrom="$(echo $file | sed 's/tests\///' | sed 's/\.test//')*"
else 
    jest 
fi
if [ -n "$file" ];then
    coverageHtml=$(basename $file | sed 's/tests\///' | sed 's/\.test//').html
    tsx tools/open-coverage.command.ts $coverageHtml
else 
    tsx tools/open-coverage.command.ts index.html
fi
