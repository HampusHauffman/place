#!/bin/bash
#define MAX_ARG_PAGES 32
curl https://place-run-qsjhjkmw7a-ew.a.run.app/board/raw -o values.txt
redis-cli -x -h localhost -p 6379 set place < values.txt