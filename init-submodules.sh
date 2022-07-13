#!/usr/bin/env bash
git submodule update -i

git -C website config core.sparsecheckout true
echo 'src/interfaces/' > ./.git/modules/website/info/sparse-checkout
git -C website read-tree -mu HEAD