#!/bin/bash
elm-make Main.elm --output built-elm-app.js && \
node app.js
