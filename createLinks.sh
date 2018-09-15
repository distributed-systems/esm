#!/usr/bin/env bash

projectDir="$PWD"
dsDir="$(dirname "$projectDir")"
eeDir="$(dirname "$dsDir")/ee"

# remove global executables
if [ -L /usr/local/bin/esm ]; then
    rm /usr/local/bin/esm
fi

if [ -L /usr/local/bin/esm-server ]; then
    rm /usr/local/bin/esm-server
fi

if [ -L /usr/local/lib/esm/esm.mjs ]; then
    rm /usr/local/lib/esm/esm.mjs
fi

if [ -L /usr/local/lib/esm/esm-server.mjs ]; then
    rm /usr/local/lib/esm/esm-server.mjs
fi

# remove user folder symlinks
if [ -d "$HOME/.esm" ]; then
    rm -r "$HOME/.esm"
fi

# install esm in the home dir
mkdir "$HOME/.esm"
ln -s "$dsDir/esm" "$HOME/.esm/esm"
ln -s "$dsDir/esm-server" "$HOME/.esm/esm-server"

# add global executables
mkdir -p /usr/local/lib/esm

ln -s "$dsDir/esm/bin/esm" /usr/local/bin/esm
ln -s "$dsDir/esm-server/bin/esm-server" /usr/local/bin/esm-server

ln -s "$dsDir/esm/bin/esm.mjs" /usr/local/lib/esm/esm.mjs
ln -s "$dsDir/esm-server/bin/esm-server.mjs" /usr/local/lib/esm/esm-server.mjs



# esm server dependencies
rm -r "$dsDir/esm-server/es-modules"
mkdir -p "$dsDir/esm-server/es-modules/distributed-systems"

mkdir "$dsDir/esm-server/es-modules/distributed-systems/http2-client"
ln -s "$dsDir/http2-client" "$dsDir/esm-server/es-modules/distributed-systems/http2-client/x"

mkdir "$dsDir/esm-server/es-modules/distributed-systems/http2-server"
ln -s "$dsDir/http2-server" "$dsDir/esm-server/es-modules/distributed-systems/http2-server/x"

mkdir "$dsDir/esm-server/es-modules/distributed-systems/esm-yaml"
ln -s "$dsDir/esm-yaml" "$dsDir/esm-server/es-modules/distributed-systems/esm-yaml/x"

mkdir "$dsDir/esm-server/es-modules/distributed-systems/section-tests"
ln -s "$dsDir/esm-yaml" "$dsDir/esm-server/es-modules/distributed-systems/section-tests/x"




# esm cli
rm -r "$dsDir/esm/es-modules"
mkdir -p "$dsDir/esm/es-modules/distributed-systems"

mkdir "$dsDir/esm/es-modules/distributed-systems/http2-client"
ln -s "$dsDir/http2-client" "$dsDir/esm/es-modules/distributed-systems/http2-client/x"




# http2-server
rm -r "$dsDir/http2-server/es-modules"
mkdir -p "$dsDir/http2-server/es-modules/distributed-systems"
mkdir "$dsDir/http2-server/es-modules/distributed-systems/http2-lib"

ln -s "$dsDir/http2-lib" "$dsDir/http2-server/es-modules/distributed-systems/http2-lib/x"


# http2-client
rm -r "$dsDir/http2-client/es-modules"
mkdir -p "$dsDir/http2-client/es-modules/distributed-systems"
mkdir "$dsDir/http2-client/es-modules/distributed-systems/http2-lib"

ln -s "$dsDir/http2-lib" "$dsDir/http2-client/es-modules/distributed-systems/http2-lib/x"


# http2-lib
rm -r "$dsDir/http2-lib/es-modules"
mkdir -p "$dsDir/http2-lib/es-modules/ee"
mkdir "$dsDir/http2-lib/es-modules/ee/types"

ln -s "$eeDir/ee-types" "$dsDir/http2-lib/es-modules/ee/types/x"




# bash completion

if [ -f /etc/bash_completion.d/esm ]; then
    rm /etc/bash_completion.d/esm
fi

# the source command works not because the
# command is executed in a sub shell
cp "$dsDir/esm/bin/esm-completion.sh" /etc/bash_completion.d/esm
source "$dsDir/esm/bin/esm-completion.sh"