#!/bin/bash
#define MAX_ARG_PAGES 32
FILENAME=values
TIME=$(date "+%Y.%m.%d-%H.%M.%S")
NAME=redisBk/$FILENAME.$TIME.txt
touch $NAME

FILENAME=$FILENAME.$TIME
curl https://place-run-qsjhjkmw7a-ew.a.run.app/board/raw -o $NAME
redis-cli -x -h localhost -p 6379 set place < $NAME