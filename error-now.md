2025-10-12T13:57:36.545730683Z ==> Cloning from https://github.com/johnlloydcallao01/tap2go
2025-10-12T13:57:39.326922931Z ==> Checking out commit 25576226f94d98fffe88bc404b5ff6a4b43f359b in branch main
2025-10-12T13:57:42.935317887Z #1 [internal] load build definition from Dockerfile
2025-10-12T13:57:43.085667828Z #1 transferring dockerfile: 2.60kB done
2025-10-12T13:57:43.085691099Z #1 DONE 0.0s
2025-10-12T13:57:43.085693708Z 
2025-10-12T13:57:43.085696788Z #2 [internal] load metadata for docker.io/library/node:22.12.0-alpine
2025-10-12T13:57:44.259496898Z #2 ...
2025-10-12T13:57:44.259517278Z 
2025-10-12T13:57:44.259521729Z #3 [auth] library/node:pull render-prod/docker-mirror-repository/library/node:pull token for us-west1-docker.pkg.dev
2025-10-12T13:57:44.259526619Z #3 DONE 0.0s
2025-10-12T13:57:44.409762226Z 
2025-10-12T13:57:44.409786527Z #2 [internal] load metadata for docker.io/library/node:22.12.0-alpine
2025-10-12T13:57:48.570095514Z #2 DONE 5.6s
2025-10-12T13:57:48.751720645Z 
2025-10-12T13:57:48.751745396Z #4 [internal] load .dockerignore
2025-10-12T13:57:48.751767546Z #4 transferring context: 2B done
2025-10-12T13:57:48.751774456Z #4 DONE 0.0s
2025-10-12T13:57:48.751779137Z 
2025-10-12T13:57:48.751784726Z #5 [base 1/1] FROM docker.io/library/node:22.12.0-alpine@sha256:51eff88af6dff26f59316b6e356188ffa2c422bd3c3b76f2556a2e7e89d080bd
2025-10-12T13:57:48.751790507Z #5 resolve docker.io/library/node:22.12.0-alpine@sha256:51eff88af6dff26f59316b6e356188ffa2c422bd3c3b76f2556a2e7e89d080bd 0.0s done
2025-10-12T13:57:48.902505306Z #5 ...
2025-10-12T13:57:48.902527407Z 
2025-10-12T13:57:48.902533827Z #6 [internal] load build context
2025-10-12T13:57:48.902539667Z #6 transferring context: 6.91MB 0.1s done
2025-10-12T13:57:48.902545957Z #6 DONE 0.2s
2025-10-12T13:57:48.902551437Z 
2025-10-12T13:57:48.902556708Z #5 [base 1/1] FROM docker.io/library/node:22.12.0-alpine@sha256:51eff88af6dff26f59316b6e356188ffa2c422bd3c3b76f2556a2e7e89d080bd
2025-10-12T13:57:51.313413135Z #5 extracting sha256:245043d9199c263f869fc0558f43f7cb98bbc92acdd5def1b4f690adc0ac7807
2025-10-12T13:57:51.464186726Z #5 extracting sha256:245043d9199c263f869fc0558f43f7cb98bbc92acdd5def1b4f690adc0ac7807 0.1s done
2025-10-12T13:57:53.573106232Z #5 extracting sha256:b2bed185b63d7454898a27a945425926ea03171b6fec5b454386a206288940ce
2025-10-12T13:57:55.339546112Z #5 extracting sha256:b2bed185b63d7454898a27a945425926ea03171b6fec5b454386a206288940ce 1.9s done
2025-10-12T13:57:55.339567252Z #5 DONE 6.7s
2025-10-12T13:57:55.456823956Z 
2025-10-12T13:57:55.456858397Z #5 [base 1/1] FROM docker.io/library/node:22.12.0-alpine@sha256:51eff88af6dff26f59316b6e356188ffa2c422bd3c3b76f2556a2e7e89d080bd
2025-10-12T13:57:55.456865387Z #5 extracting sha256:4231f288e206fb55a053d833506a0fc1df731995919cf62dbc8dc044bf57434b 0.1s done
2025-10-12T13:57:55.456870737Z #5 extracting sha256:d7c06c1c0e2af8c4149c71aa3ac54e1347a4f9aae4deba83e5e9b3c294cbb35d 0.0s done
2025-10-12T13:57:55.457193275Z #5 DONE 6.8s
2025-10-12T13:57:55.457213036Z 
2025-10-12T13:57:55.457219816Z #7 [builder 1/4] WORKDIR /app
2025-10-12T13:57:55.457224366Z #7 DONE 0.0s
2025-10-12T13:57:55.457228176Z 
2025-10-12T13:57:55.457233156Z #8 [deps 1/7] RUN apk add --no-cache libc6-compat
2025-10-12T13:57:55.457237596Z #8 0.050 fetch https://dl-cdn.alpinelinux.org/alpine/v3.21/main/x86_64/APKINDEX.tar.gz
2025-10-12T13:57:55.566279673Z #8 ...
2025-10-12T13:57:55.566300293Z 
2025-10-12T13:57:55.566304963Z #9 [runner 2/8] RUN addgroup --system --gid 1001 nodejs
2025-10-12T13:57:55.566308853Z #9 DONE 0.1s
2025-10-12T13:57:55.566312344Z 
2025-10-12T13:57:55.566315854Z #10 [runner 3/8] RUN adduser --system --uid 1001 nextjs
2025-10-12T13:57:55.566319354Z #10 DONE 0.1s
2025-10-12T13:57:55.566322694Z 
2025-10-12T13:57:55.566326164Z #8 [deps 1/7] RUN apk add --no-cache libc6-compat
2025-10-12T13:57:55.566341894Z #8 0.125 fetch https://dl-cdn.alpinelinux.org/alpine/v3.21/community/x86_64/APKINDEX.tar.gz
2025-10-12T13:57:55.82176805Z #8 0.410 (1/3) Installing musl-obstack (1.2.3-r2)
2025-10-12T13:57:55.821785211Z #8 0.415 (2/3) Installing libucontext (1.3.2-r0)
2025-10-12T13:57:55.930703204Z #8 0.418 (3/3) Installing gcompat (1.1.0-r4)
2025-10-12T13:57:55.930723835Z #8 0.424 OK: 10 MiB in 20 packages
2025-10-12T13:57:55.930728125Z #8 DONE 0.5s
2025-10-12T13:57:55.930731805Z 
2025-10-12T13:57:55.930736075Z #11 [deps 2/7] WORKDIR /app
2025-10-12T13:57:55.930740135Z #11 DONE 0.0s
2025-10-12T13:57:56.055632942Z 
2025-10-12T13:57:56.055670013Z #12 [deps 3/7] COPY package.json ./
2025-10-12T13:57:56.055678313Z #12 DONE 0.0s
2025-10-12T13:57:56.055683733Z 
2025-10-12T13:57:56.055689223Z #13 [deps 4/7] COPY ../../pnpm-lock.yaml* ./
2025-10-12T13:57:56.055694163Z #13 DONE 0.0s
2025-10-12T13:57:56.055698874Z 
2025-10-12T13:57:56.055704023Z #14 [deps 5/7] COPY ../../yarn.lock* ./
2025-10-12T13:57:56.055709234Z #14 DONE 0.0s
2025-10-12T13:57:56.055713914Z 
2025-10-12T13:57:56.055718484Z #15 [deps 6/7] COPY ../../package-lock.json* ./
2025-10-12T13:57:56.055723074Z #15 DONE 0.0s
2025-10-12T13:57:56.055727374Z 
2025-10-12T13:57:56.055734344Z #16 [deps 7/7] RUN   if [ -f yarn.lock ]; then yarn --frozen-lockfile;   elif [ -f package-lock.json ]; then npm ci;   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile;   else echo "Lockfile not found." && exit 1;   fi
2025-10-12T13:57:56.055741975Z #16 0.045 Lockfile not found.
2025-10-12T13:57:56.109917144Z #16 ERROR: process "/bin/sh -c if [ -f yarn.lock ]; then yarn --frozen-lockfile;   elif [ -f package-lock.json ]; then npm ci;   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile;   else echo \"Lockfile not found.\" && exit 1;   fi" did not complete successfully: exit code: 1
2025-10-12T13:57:56.109935545Z ------
2025-10-12T13:57:56.109940985Z  > [deps 7/7] RUN   if [ -f yarn.lock ]; then yarn --frozen-lockfile;   elif [ -f package-lock.json ]; then npm ci;   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile;   else echo "Lockfile not found." && exit 1;   fi:
2025-10-12T13:57:56.109945525Z 0.045 Lockfile not found.
2025-10-12T13:57:56.109949275Z ------
2025-10-12T13:57:56.1113298Z Dockerfile:18
2025-10-12T13:57:56.11134725Z --------------------
2025-10-12T13:57:56.11135369Z   17 |     COPY ../../package-lock.json* ./
2025-10-12T13:57:56.11135755Z   18 | >>> RUN \
2025-10-12T13:57:56.111363201Z   19 | >>>   if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
2025-10-12T13:57:56.111367341Z   20 | >>>   elif [ -f package-lock.json ]; then npm ci; \
2025-10-12T13:57:56.111372631Z   21 | >>>   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
2025-10-12T13:57:56.111376651Z   22 | >>>   else echo "Lockfile not found." && exit 1; \
2025-10-12T13:57:56.111380601Z   23 | >>>   fi
2025-10-12T13:57:56.111384471Z   24 |     
2025-10-12T13:57:56.111388801Z --------------------
2025-10-12T13:57:56.111396891Z error: failed to solve: process "/bin/sh -c if [ -f yarn.lock ]; then yarn --frozen-lockfile;   elif [ -f package-lock.json ]; then npm ci;   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile;   else echo \"Lockfile not found.\" && exit 1;   fi" did not complete successfully: exit code: 1
2025-10-12T13:57:56.127508929Z error: exit status 1