2025-10-12T13:01:38.935264886Z ==> Cloning from https://github.com/johnlloydcallao01/tap2go
2025-10-12T13:01:39.888746657Z ==> Checking out commit 573aae22bd294143ef8687a3e6172487c06e291e in branch main
2025-10-12T13:01:49.501981897Z #1 [internal] load build definition from Dockerfile
2025-10-12T13:01:49.502012157Z #1 transferring dockerfile: 2.60kB done
2025-10-12T13:01:49.502016417Z #1 DONE 0.0s
2025-10-12T13:01:49.502020107Z 
2025-10-12T13:01:49.502024098Z #2 [internal] load metadata for docker.io/library/node:22.12.0-alpine
2025-10-12T13:01:49.652670441Z #2 ...
2025-10-12T13:01:49.652682441Z 
2025-10-12T13:01:49.652685141Z #3 [auth] library/node:pull render-prod/docker-mirror-repository/library/node:pull token for us-west1-docker.pkg.dev
2025-10-12T13:01:49.652689141Z #3 DONE 0.0s
2025-10-12T13:01:49.803370085Z 
2025-10-12T13:01:49.803391045Z #2 [internal] load metadata for docker.io/library/node:22.12.0-alpine
2025-10-12T13:01:50.227640319Z #2 DONE 0.7s
2025-10-12T13:01:50.227655639Z 
2025-10-12T13:01:50.22766101Z #4 [internal] load .dockerignore
2025-10-12T13:01:50.227665039Z #4 transferring context: 2B done
2025-10-12T13:01:50.22766951Z #4 DONE 0.0s
2025-10-12T13:01:50.22767368Z 
2025-10-12T13:01:50.2276785Z #5 [base 1/1] FROM docker.io/library/node:22.12.0-alpine@sha256:51eff88af6dff26f59316b6e356188ffa2c422bd3c3b76f2556a2e7e89d080bd
2025-10-12T13:01:50.22768287Z #5 resolve docker.io/library/node:22.12.0-alpine@sha256:51eff88af6dff26f59316b6e356188ffa2c422bd3c3b76f2556a2e7e89d080bd 0.0s done
2025-10-12T13:01:50.333821317Z #5 DONE 0.1s
2025-10-12T13:01:50.333884039Z 
2025-10-12T13:01:50.333892919Z #6 [internal] load build context
2025-10-12T13:01:50.484064532Z #6 transferring context: 6.91MB 0.1s done
2025-10-12T13:01:50.484085052Z #6 DONE 0.2s
2025-10-12T13:01:50.484089203Z 
2025-10-12T13:01:50.484093873Z #5 [base 1/1] FROM docker.io/library/node:22.12.0-alpine@sha256:51eff88af6dff26f59316b6e356188ffa2c422bd3c3b76f2556a2e7e89d080bd
2025-10-12T13:01:50.767444016Z #5 extracting sha256:245043d9199c263f869fc0558f43f7cb98bbc92acdd5def1b4f690adc0ac7807
2025-10-12T13:01:50.918328704Z #5 extracting sha256:245043d9199c263f869fc0558f43f7cb98bbc92acdd5def1b4f690adc0ac7807 0.1s done
2025-10-12T13:01:51.219022148Z #5 extracting sha256:b2bed185b63d7454898a27a945425926ea03171b6fec5b454386a206288940ce
2025-10-12T13:01:54.776882835Z #5 extracting sha256:b2bed185b63d7454898a27a945425926ea03171b6fec5b454386a206288940ce 3.7s done
2025-10-12T13:01:54.776899575Z #5 DONE 4.6s
2025-10-12T13:01:54.887281221Z 
2025-10-12T13:01:54.887302961Z #5 [base 1/1] FROM docker.io/library/node:22.12.0-alpine@sha256:51eff88af6dff26f59316b6e356188ffa2c422bd3c3b76f2556a2e7e89d080bd
2025-10-12T13:01:54.887309411Z #5 extracting sha256:4231f288e206fb55a053d833506a0fc1df731995919cf62dbc8dc044bf57434b 0.1s done
2025-10-12T13:01:54.887314062Z #5 extracting sha256:d7c06c1c0e2af8c4149c71aa3ac54e1347a4f9aae4deba83e5e9b3c294cbb35d 0.0s done
2025-10-12T13:01:55.030434788Z #5 DONE 4.7s
2025-10-12T13:01:55.030451968Z 
2025-10-12T13:01:55.030456539Z #7 [runner 1/8] WORKDIR /app
2025-10-12T13:01:55.030460149Z #7 DONE 0.0s
2025-10-12T13:01:55.030463669Z 
2025-10-12T13:01:55.030467949Z #8 [runner 2/8] RUN addgroup --system --gid 1001 nodejs
2025-10-12T13:01:55.030471499Z #8 DONE 0.1s
2025-10-12T13:01:55.030474809Z 
2025-10-12T13:01:55.030478239Z #9 [deps 1/7] RUN apk add --no-cache libc6-compat
2025-10-12T13:01:55.030482159Z #9 0.078 fetch https://dl-cdn.alpinelinux.org/alpine/v3.21/main/x86_64/APKINDEX.tar.gz
2025-10-12T13:01:55.181438329Z #9 0.197 fetch https://dl-cdn.alpinelinux.org/alpine/v3.21/community/x86_64/APKINDEX.tar.gz
2025-10-12T13:01:55.332137623Z #9 ...
2025-10-12T13:01:55.332160003Z 
2025-10-12T13:01:55.332166154Z #10 [runner 3/8] RUN adduser --system --uid 1001 nextjs
2025-10-12T13:01:55.332171154Z #10 DONE 0.2s
2025-10-12T13:01:55.469200824Z 
2025-10-12T13:01:55.469227134Z #9 [deps 1/7] RUN apk add --no-cache libc6-compat
2025-10-12T13:01:55.469230314Z #9 0.581 (1/3) Installing musl-obstack (1.2.3-r2)
2025-10-12T13:01:55.619623942Z #9 0.593 (2/3) Installing libucontext (1.3.2-r0)
2025-10-12T13:01:55.619659043Z #9 0.601 (3/3) Installing gcompat (1.1.0-r4)
2025-10-12T13:01:55.619666523Z #9 0.614 OK: 10 MiB in 20 packages
2025-10-12T13:01:55.760268237Z #9 DONE 0.9s
2025-10-12T13:01:55.89647128Z 
2025-10-12T13:01:55.89649162Z #11 [deps 2/7] WORKDIR /app
2025-10-12T13:01:55.896496031Z #11 DONE 0.1s
2025-10-12T13:01:56.047144324Z 
2025-10-12T13:01:56.047162414Z #12 [deps 3/7] COPY package.json ./
2025-10-12T13:01:56.198180505Z #12 DONE 0.2s
2025-10-12T13:01:56.198196815Z 
2025-10-12T13:01:56.198200895Z #13 [deps 4/7] COPY ../../pnpm-lock.yaml* ./
2025-10-12T13:01:56.198203926Z #13 DONE 0.1s
2025-10-12T13:01:56.198206586Z 
2025-10-12T13:01:56.198209466Z #14 [deps 5/7] COPY ../../yarn.lock* ./
2025-10-12T13:01:56.343480277Z #14 DONE 0.1s
2025-10-12T13:01:56.343504768Z 
2025-10-12T13:01:56.343510968Z #15 [deps 6/7] COPY ../../package-lock.json* ./
2025-10-12T13:01:56.343515788Z #15 DONE 0.1s
2025-10-12T13:01:56.343520228Z 
2025-10-12T13:01:56.343525398Z #16 [deps 7/7] RUN   if [ -f yarn.lock ]; then yarn --frozen-lockfile;   elif [ -f package-lock.json ]; then npm ci;   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile;   else echo "Lockfile not found." && exit 1;   fi
2025-10-12T13:01:56.343531918Z #16 0.052 Lockfile not found.
2025-10-12T13:01:56.412719277Z #16 ERROR: process "/bin/sh -c if [ -f yarn.lock ]; then yarn --frozen-lockfile;   elif [ -f package-lock.json ]; then npm ci;   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile;   else echo \"Lockfile not found.\" && exit 1;   fi" did not complete successfully: exit code: 1
2025-10-12T13:01:56.412742628Z ------
2025-10-12T13:01:56.412749008Z  > [deps 7/7] RUN   if [ -f yarn.lock ]; then yarn --frozen-lockfile;   elif [ -f package-lock.json ]; then npm ci;   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile;   else echo "Lockfile not found." && exit 1;   fi:
2025-10-12T13:01:56.412753478Z 0.052 Lockfile not found.
2025-10-12T13:01:56.412757348Z ------
2025-10-12T13:01:56.413774799Z Dockerfile:18
2025-10-12T13:01:56.413787089Z --------------------
2025-10-12T13:01:56.413791599Z   17 |     COPY ../../package-lock.json* ./
2025-10-12T13:01:56.41379519Z   18 | >>> RUN \
2025-10-12T13:01:56.413799099Z   19 | >>>   if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
2025-10-12T13:01:56.4138027Z   20 | >>>   elif [ -f package-lock.json ]; then npm ci; \
2025-10-12T13:01:56.41380692Z   21 | >>>   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
2025-10-12T13:01:56.41381049Z   22 | >>>   else echo "Lockfile not found." && exit 1; \
2025-10-12T13:01:56.41381407Z   23 | >>>   fi
2025-10-12T13:01:56.41381789Z   24 |     
2025-10-12T13:01:56.41383248Z --------------------
2025-10-12T13:01:56.41383733Z error: failed to solve: process "/bin/sh -c if [ -f yarn.lock ]; then yarn --frozen-lockfile;   elif [ -f package-lock.json ]; then npm ci;   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile;   else echo \"Lockfile not found.\" && exit 1;   fi" did not complete successfully: exit code: 1
2025-10-12T13:01:56.428382353Z error: exit status 1