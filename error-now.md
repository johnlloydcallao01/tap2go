2025-10-12T12:30:14.699259026Z ==> Cloning from https://github.com/johnlloydcallao01/tap2go
2025-10-12T12:30:16.12350648Z ==> Checking out commit b121f2caa3e3cda4fb2b7a2e368b9a373615b475 in branch main
2025-10-12T12:30:41.974124292Z #1 [internal] load build definition from Dockerfile
2025-10-12T12:30:41.976754048Z #1 DONE 0.0s
2025-10-12T12:30:42.125130827Z 
2025-10-12T12:30:42.125157597Z #1 [internal] load build definition from Dockerfile
2025-10-12T12:30:42.125163088Z #1 transferring dockerfile: 2.48kB done
2025-10-12T12:30:42.125167468Z #1 DONE 0.1s
2025-10-12T12:30:42.125171198Z 
2025-10-12T12:30:42.125175648Z #2 [internal] load metadata for docker.io/library/node:22.12.0-alpine
2025-10-12T12:30:42.391515227Z #2 ...
2025-10-12T12:30:42.391553788Z 
2025-10-12T12:30:42.391561458Z #3 [auth] library/node:pull render-prod/docker-mirror-repository/library/node:pull token for us-west1-docker.pkg.dev
2025-10-12T12:30:42.391569408Z #3 DONE 0.0s
2025-10-12T12:30:42.542579223Z 
2025-10-12T12:30:42.542602884Z #2 [internal] load metadata for docker.io/library/node:22.12.0-alpine
2025-10-12T12:30:42.838050308Z #2 DONE 0.8s
2025-10-12T12:30:42.988861418Z 
2025-10-12T12:30:42.991823553Z #4 [internal] load .dockerignore
2025-10-12T12:30:42.991831053Z #4 transferring context: 2B done
2025-10-12T12:30:42.991834904Z #4 DONE 0.0s
2025-10-12T12:30:42.991839404Z 
2025-10-12T12:30:42.991844324Z #5 [base 1/1] FROM docker.io/library/node:22.12.0-alpine@sha256:51eff88af6dff26f59316b6e356188ffa2c422bd3c3b76f2556a2e7e89d080bd
2025-10-12T12:30:42.991849294Z #5 resolve docker.io/library/node:22.12.0-alpine@sha256:51eff88af6dff26f59316b6e356188ffa2c422bd3c3b76f2556a2e7e89d080bd 0.0s done
2025-10-12T12:30:43.742068138Z #5 ...
2025-10-12T12:30:43.742088598Z 
2025-10-12T12:30:43.742093388Z #6 [internal] load build context
2025-10-12T12:30:43.742097959Z #6 transferring context: 6.91MB 0.2s done
2025-10-12T12:30:43.742101519Z #6 DONE 0.7s
2025-10-12T12:30:43.892668363Z 
2025-10-12T12:30:43.892693373Z #5 [base 1/1] FROM docker.io/library/node:22.12.0-alpine@sha256:51eff88af6dff26f59316b6e356188ffa2c422bd3c3b76f2556a2e7e89d080bd
2025-10-12T12:30:44.706160005Z #5 extracting sha256:245043d9199c263f869fc0558f43f7cb98bbc92acdd5def1b4f690adc0ac7807
2025-10-12T12:30:44.857125819Z #5 extracting sha256:245043d9199c263f869fc0558f43f7cb98bbc92acdd5def1b4f690adc0ac7807 0.2s done
2025-10-12T12:30:45.884479754Z #5 DONE 3.0s
2025-10-12T12:30:46.157468601Z 
2025-10-12T12:30:46.157493122Z #5 [base 1/1] FROM docker.io/library/node:22.12.0-alpine@sha256:51eff88af6dff26f59316b6e356188ffa2c422bd3c3b76f2556a2e7e89d080bd
2025-10-12T12:30:46.157498172Z #5 extracting sha256:b2bed185b63d7454898a27a945425926ea03171b6fec5b454386a206288940ce
2025-10-12T12:30:51.719130672Z #5 extracting sha256:b2bed185b63d7454898a27a945425926ea03171b6fec5b454386a206288940ce 5.4s done
2025-10-12T12:30:51.719151432Z #5 extracting sha256:4231f288e206fb55a053d833506a0fc1df731995919cf62dbc8dc044bf57434b
2025-10-12T12:30:51.859430576Z #5 extracting sha256:4231f288e206fb55a053d833506a0fc1df731995919cf62dbc8dc044bf57434b 0.2s done
2025-10-12T12:30:51.859450897Z #5 extracting sha256:d7c06c1c0e2af8c4149c71aa3ac54e1347a4f9aae4deba83e5e9b3c294cbb35d 0.1s done
2025-10-12T12:30:51.859455057Z #5 DONE 8.7s
2025-10-12T12:30:52.010254117Z 
2025-10-12T12:30:52.010286437Z #7 [builder 1/4] WORKDIR /app
2025-10-12T12:30:52.010290418Z #7 DONE 0.1s
2025-10-12T12:30:52.010294538Z 
2025-10-12T12:30:52.010300398Z #8 [deps 1/4] RUN apk add --no-cache libc6-compat
2025-10-12T12:30:52.010305558Z #8 0.087 fetch https://dl-cdn.alpinelinux.org/alpine/v3.21/main/x86_64/APKINDEX.tar.gz
2025-10-12T12:30:52.120690457Z #8 ...
2025-10-12T12:30:52.120711858Z 
2025-10-12T12:30:52.120716967Z #9 [runner 2/8] RUN addgroup --system --gid 1001 nodejs
2025-10-12T12:30:52.120720838Z #9 DONE 0.2s
2025-10-12T12:30:52.120724448Z 
2025-10-12T12:30:52.120737138Z #8 [deps 1/4] RUN apk add --no-cache libc6-compat
2025-10-12T12:30:52.120740398Z #8 0.217 fetch https://dl-cdn.alpinelinux.org/alpine/v3.21/community/x86_64/APKINDEX.tar.gz
2025-10-12T12:30:52.421777593Z #8 ...
2025-10-12T12:30:52.421801074Z 
2025-10-12T12:30:52.421807024Z #10 [runner 3/8] RUN adduser --system --uid 1001 nextjs
2025-10-12T12:30:52.421811064Z #10 DONE 0.2s
2025-10-12T12:30:52.57205777Z 
2025-10-12T12:30:52.572088811Z #8 [deps 1/4] RUN apk add --no-cache libc6-compat
2025-10-12T12:30:52.722225874Z #8 0.740 (1/3) Installing musl-obstack (1.2.3-r2)
2025-10-12T12:30:52.722279605Z #8 0.753 (2/3) Installing libucontext (1.3.2-r0)
2025-10-12T12:30:52.722286005Z #8 0.762 (3/3) Installing gcompat (1.1.0-r4)
2025-10-12T12:30:52.722290476Z #8 0.775 OK: 10 MiB in 20 packages
2025-10-12T12:30:52.848782531Z #8 DONE 0.9s
2025-10-12T12:30:52.848802442Z 
2025-10-12T12:30:52.848806822Z #11 [deps 2/4] WORKDIR /app
2025-10-12T12:30:52.848811762Z #11 DONE 0.0s
2025-10-12T12:30:52.848816162Z 
2025-10-12T12:30:52.848821962Z #12 [deps 3/4] COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
2025-10-12T12:30:52.848826502Z #12 DONE 0.0s
2025-10-12T12:30:52.939865913Z 
2025-10-12T12:30:52.939898063Z #13 [deps 4/4] RUN   if [ -f yarn.lock ]; then yarn --frozen-lockfile;   elif [ -f package-lock.json ]; then npm ci;   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile;   else echo "Lockfile not found." && exit 1;   fi
2025-10-12T12:30:52.939907634Z #13 0.051 Lockfile not found.
2025-10-12T12:30:52.939912714Z #13 ERROR: process "/bin/sh -c if [ -f yarn.lock ]; then yarn --frozen-lockfile;   elif [ -f package-lock.json ]; then npm ci;   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile;   else echo \"Lockfile not found.\" && exit 1;   fi" did not complete successfully: exit code: 1
2025-10-12T12:30:52.939916664Z ------
2025-10-12T12:30:52.939920704Z  > [deps 4/4] RUN   if [ -f yarn.lock ]; then yarn --frozen-lockfile;   elif [ -f package-lock.json ]; then npm ci;   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile;   else echo "Lockfile not found." && exit 1;   fi:
2025-10-12T12:30:52.939925264Z 0.051 Lockfile not found.
2025-10-12T12:30:52.939929634Z ------
2025-10-12T12:30:52.941464903Z Dockerfile:14
2025-10-12T12:30:52.941480873Z --------------------
2025-10-12T12:30:52.941486554Z   13 |     COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
2025-10-12T12:30:52.941490794Z   14 | >>> RUN \
2025-10-12T12:30:52.941495724Z   15 | >>>   if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
2025-10-12T12:30:52.941500124Z   16 | >>>   elif [ -f package-lock.json ]; then npm ci; \
2025-10-12T12:30:52.941503674Z   17 | >>>   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
2025-10-12T12:30:52.941506694Z   18 | >>>   else echo "Lockfile not found." && exit 1; \
2025-10-12T12:30:52.941509704Z   19 | >>>   fi
2025-10-12T12:30:52.941512544Z   20 |     
2025-10-12T12:30:52.941515424Z --------------------
2025-10-12T12:30:52.941519044Z error: failed to solve: process "/bin/sh -c if [ -f yarn.lock ]; then yarn --frozen-lockfile;   elif [ -f package-lock.json ]; then npm ci;   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile;   else echo \"Lockfile not found.\" && exit 1;   fi" did not complete successfully: exit code: 1
2025-10-12T12:30:52.956407771Z error: exit status 1