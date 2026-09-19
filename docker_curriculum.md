Below is a **40-topic Docker curriculum**, sequenced so you can turn each topic into a lesson, exercise, quiz, and lab. It starts with the mental model of containers and ends with advanced build, security, supply-chain, networking, and production practices.

The curriculum emphasizes **Docker Engine + Dockerfile + Docker Compose + BuildKit/Buildx**, rather than spending too much time on Docker Desktop UI. Docker's current documentation recommends concepts such as multi-stage builds for producing leaner production images, while BuildKit provides the modern build system behind advanced Docker builds. ([Docker Documentation][1])

## Level 1 — Docker Foundations

| #     | Topic                                        | Learning scope                                                                           | Official documentation                                                                                                                    |
| ----- | -------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **What is Docker?**                          | Containers vs VMs, Docker architecture, Docker Engine, daemon, client, registry          | [Docker overview](https://docs.docker.com/get-started/docker-overview/?utm_source=chatgpt.com)                                            |
| **2** | **Images vs Containers**                     | Image as immutable template; container as running instance; lifecycle relationship       | [Docker concepts: containers](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/?utm_source=chatgpt.com) |
| **3** | **Installing and Running Docker**            | Docker Desktop/Engine, verify installation, `docker version`, `docker info`, hello-world | [Get Docker](https://docs.docker.com/get-started/get-docker/?utm_source=chatgpt.com)                                                      |
| **4** | **Running Your First Container**             | `docker run`, image pulling, foreground/background operation, `--rm`, container naming   | [Running containers](https://docs.docker.com/get-started/docker-concepts/running-containers/?utm_source=chatgpt.com)                      |
| **5** | **Container Lifecycle**                      | `create`, `start`, `stop`, `restart`, `kill`, `rm`, exit states                          | [docker container CLI reference](https://docs.docker.com/reference/cli/docker/container/?utm_source=chatgpt.com)                          |
| **6** | **Inspecting Containers**                    | `docker ps`, `inspect`, `stats`, `top`, container metadata and state                     | [docker container inspect](https://docs.docker.com/reference/cli/docker/container/inspect/?utm_source=chatgpt.com)                        |
| **7** | **Executing Commands Inside Containers**     | `docker exec`, interactive shells, `-it`, working directories, users                     | [docker container exec](https://docs.docker.com/reference/cli/docker/container/exec/?utm_source=chatgpt.com)                              |
| **8** | **Container Logs and Basic Troubleshooting** | `docker logs`, stdout/stderr, follow, timestamps, debugging failed containers            | [docker container logs](https://docs.docker.com/reference/cli/docker/container/logs/?utm_source=chatgpt.com)                              |

### Foundation milestone

The learner should be able to explain:

> **Registry → Image → Container → Process**

and confidently run something like:

```bash
docker run -d \
  --name web \
  -p 8080:80 \
  nginx
```

---

# Level 2 — Images and Dockerfiles

| #      | Topic                                         | Learning scope                                                                             | Official documentation                                                                                                                                        |
| ------ | --------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **9**  | **Docker Images and Layers**                  | Layered filesystems, image IDs, tags, digests, immutable layers                            | [Understanding image layers](https://docs.docker.com/get-started/docker-concepts/building-images/understanding-image-layers/?utm_source=chatgpt.com)          |
| **10** | **Writing Your First Dockerfile**             | `FROM`, `WORKDIR`, `COPY`, `RUN`, `CMD`                                                    | [Writing a Dockerfile](https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/?utm_source=chatgpt.com)                      |
| **11** | **Dockerfile Instructions**                   | `FROM`, `RUN`, `COPY`, `ADD`, `CMD`, `ENTRYPOINT`, `ENV`, `ARG`, `USER`, `EXPOSE`, `LABEL` | [Dockerfile reference](https://docs.docker.com/reference/dockerfile/?utm_source=chatgpt.com)                                                                  |
| **12** | **Building Images**                           | Build context, `docker build`, `-t`, image naming and tagging                              | [Build, tag and publish an image](https://docs.docker.com/get-started/docker-concepts/building-images/build-tag-and-publish-an-image/?utm_source=chatgpt.com) |
| **13** | **CMD vs ENTRYPOINT**                         | Executable vs shell forms, defaults vs fixed executables, command overrides                | [Dockerfile CMD and ENTRYPOINT reference](https://docs.docker.com/reference/dockerfile/?utm_source=chatgpt.com#understand-how-cmd-and-entrypoint-interact)    |
| **14** | **Environment Variables and Build Arguments** | `ENV`, `ARG`, runtime `-e`, build-time arguments and scope                                 | [Dockerfile variables](https://docs.docker.com/build/building/variables/?utm_source=chatgpt.com)                                                              |
| **15** | **Build Context and .dockerignore**           | What gets sent to the builder, `.dockerignore`, reducing context size                      | [Docker build context](https://docs.docker.com/build/concepts/context/?utm_source=chatgpt.com)                                                                |
| **16** | **Image Tags, Registries and Docker Hub**     | `docker tag`, `login`, `pull`, `push`, namespaces, tags vs digests                         | [Working with registries](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-registry/?utm_source=chatgpt.com)                          |

Docker's image-building documentation specifically covers layers, Dockerfiles, publishing, build caching and multi-stage builds as core concepts. ([Docker Documentation][2])

### Image milestone

Containerize a simple TypeScript application:

```dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "start"]
```

The student should understand **why each instruction exists**, rather than merely copying the Dockerfile.

---

# Level 3 — Storage, Networking and Runtime

| #      | Topic                                     | Learning scope                                                                                     | Official documentation                                                                                        |
| ------ | ----------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **17** | **Container Filesystems and Persistence** | Writable container layer, ephemeral state, why containers shouldn't hold important persistent data | [Docker storage overview](https://docs.docker.com/engine/storage/?utm_source=chatgpt.com)                     |
| **18** | **Docker Volumes**                        | Named/anonymous volumes, create/list/inspect/remove, volume lifecycle                              | [Volumes](https://docs.docker.com/engine/storage/volumes/?utm_source=chatgpt.com)                             |
| **19** | **Bind Mounts**                           | Host directory mounting, read/write vs read-only, development source mounts                        | [Bind mounts](https://docs.docker.com/engine/storage/bind-mounts/?utm_source=chatgpt.com)                     |
| **20** | **tmpfs and Mount Selection**             | Temporary memory-backed mounts; volume vs bind mount vs tmpfs                                      | [tmpfs mounts](https://docs.docker.com/engine/storage/tmpfs/?utm_source=chatgpt.com)                          |
| **21** | **Docker Networking Fundamentals**        | Container network namespaces, IP addresses, DNS, network isolation                                 | [Networking overview](https://docs.docker.com/engine/network/?utm_source=chatgpt.com)                         |
| **22** | **Bridge Networks and Container DNS**     | Default vs user-defined bridge, service names, container-to-container communication                | [Bridge networking](https://docs.docker.com/engine/network/drivers/bridge/?utm_source=chatgpt.com)            |
| **23** | **Port Publishing**                       | `-p`, `-P`, host/container ports, bind addresses, NAT and exposure                                 | [Port publishing and mapping](https://docs.docker.com/engine/network/port-publishing/?utm_source=chatgpt.com) |
| **24** | **Docker Network Drivers**                | `bridge`, `host`, `none`, `overlay`, `macvlan`, `ipvlan`; choosing a network model                 | [Network drivers](https://docs.docker.com/engine/network/drivers/?utm_source=chatgpt.com)                     |

An important distinction for your learning material: **volumes outlive individual containers**, whereas data in the container's writable layer normally disappears with the container. Bind mounts are appropriate when both the host and container need direct access to the files. ([Docker Documentation][3])

User-defined bridge networks are especially important because Docker provides automatic DNS resolution between containers attached to them. ([Docker Documentation][4])

---

# Level 4 — Docker Compose and Multi-Container Applications

| #      | Topic                                          | Learning scope                                                                  | Official documentation                                                                                                 |
| ------ | ---------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **25** | **Introduction to Docker Compose**             | Why Compose exists, `compose.yaml`, multi-container applications                | [Docker Compose overview](https://docs.docker.com/compose/?utm_source=chatgpt.com)                                     |
| **26** | **Compose Services**                           | `services`, `image`, `build`, `command`, `ports`, `volumes`, `networks`         | [Compose services reference](https://docs.docker.com/reference/compose-file/services/?utm_source=chatgpt.com)          |
| **27** | **Compose Lifecycle Commands**                 | `docker compose up`, `down`, `start`, `stop`, `restart`, `ps`, `logs`, `exec`   | [Docker Compose CLI](https://docs.docker.com/reference/cli/docker/compose/?utm_source=chatgpt.com)                     |
| **28** | **Environment Variables in Compose**           | `.env`, `environment`, `env_file`, interpolation, precedence                    | [Compose environment variables](https://docs.docker.com/compose/how-tos/environment-variables/?utm_source=chatgpt.com) |
| **29** | **Compose Networking and Service Discovery**   | Default network, service-name DNS, multiple application networks                | [Compose networking](https://docs.docker.com/compose/how-tos/networking/?utm_source=chatgpt.com)                       |
| **30** | **Dependencies and Health Checks**             | `depends_on`, `healthcheck`, startup ordering, readiness vs running             | [Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/?utm_source=chatgpt.com)                 |
| **31** | **Compose Profiles and Multiple Environments** | Development/debug/production services; selectively enabling services            | [Compose profiles](https://docs.docker.com/compose/how-tos/profiles/?utm_source=chatgpt.com)                           |
| **32** | **Secrets and Configuration**                  | Secrets, credentials, config files, avoiding passwords in environment variables | [Compose secrets](https://docs.docker.com/compose/how-tos/use-secrets/?utm_source=chatgpt.com)                         |

Compose environment variables have several sources and defined precedence rules, so this deserves its own topic instead of treating `.env` files as magic. ([Docker Documentation][5])

Likewise, Docker recommends secrets instead of plain environment variables for sensitive values such as passwords and API keys. ([Docker Documentation][6])

### Compose milestone

Build a realistic:

```text
React
   │
   ▼
Express API
   │
   ▼
PostgreSQL
```

with:

```yaml
services:
  frontend:
    ...

  api:
    ...

  postgres:
    ...

volumes:
  postgres-data:

networks:
  app-network:
```

This would fit particularly well with a **TypeScript + Express + PostgreSQL** learning project.

---

# Level 5 — Advanced Docker and Production Engineering

| #      | Topic                                                  | Learning scope                                                                                | Official documentation                                                                                                 |
| ------ | ------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **33** | **Multi-Stage Builds**                                 | Builder/runtime separation, `COPY --from`, smaller production images                          | [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/?utm_source=chatgpt.com)                       |
| **34** | **Build Cache Optimization**                           | Cache invalidation, instruction ordering, package dependency layers, cache mounts             | [Optimize build cache](https://docs.docker.com/build/cache/optimize/?utm_source=chatgpt.com)                           |
| **35** | **BuildKit and Buildx**                                | Modern Docker build architecture, builders, `docker buildx`, BuildKit capabilities            | [Docker Build architecture](https://docs.docker.com/build/concepts/overview/?utm_source=chatgpt.com)                   |
| **36** | **Multi-Platform Images**                              | `linux/amd64`, `linux/arm64`, manifest lists, cross-platform builds, QEMU and native builders | [Multi-platform builds](https://docs.docker.com/build/building/multi-platform/?utm_source=chatgpt.com)                 |
| **37** | **Container Resource Management**                      | CPU limits, memory limits, OOM behavior, runtime resource constraints                         | [Runtime resource constraints](https://docs.docker.com/engine/containers/resource_constraints/?utm_source=chatgpt.com) |
| **38** | **Container Security and Rootless Docker**             | Least privilege, non-root containers, capabilities, seccomp, rootless daemon                  | [Docker Engine security](https://docs.docker.com/engine/security/?utm_source=chatgpt.com)                              |
| **39** | **Logging, Monitoring and Production Troubleshooting** | Logging drivers, `docker stats`, events, inspect, daemon logs and operational diagnosis       | [Docker logging drivers](https://docs.docker.com/engine/logging/?utm_source=chatgpt.com)                               |
| **40** | **Image Supply-Chain Security: SBOM and Provenance**   | SBOMs, build provenance, attestations, dependency visibility, secure software supply chain    | [Build attestations](https://docs.docker.com/build/metadata/attestations/?utm_source=chatgpt.com)                      |

Multi-stage builds should become the student's default production pattern: Docker notes that separating build dependencies from the final runtime can both shrink the image and reduce its attack surface. ([Docker Documentation][1])

For more advanced BuildKit usage, cache mounts can retain package-manager/compiler caches between builds without putting that cached material into the resulting image. ([Docker Documentation][7])

For supply-chain security, Docker's current build system can attach both **SBOM** and **provenance** attestations to an image. ([Docker Documentation][8])

---

# The complete learning path

I would group the 40 topics into **five modules of eight lessons**:

```text
MODULE 1 — DOCKER FUNDAMENTALS
 1. What is Docker?
 2. Images vs Containers
 3. Installing Docker
 4. Running Containers
 5. Container Lifecycle
 6. Inspecting Containers
 7. docker exec
 8. Logs & Troubleshooting

             ↓

MODULE 2 — BUILDING IMAGES
 9. Images & Layers
10. First Dockerfile
11. Dockerfile Instructions
12. Building Images
13. CMD vs ENTRYPOINT
14. ENV & ARG
15. Build Context & .dockerignore
16. Registries & Tags

             ↓

MODULE 3 — RUNTIME
17. Container Filesystems
18. Volumes
19. Bind Mounts
20. tmpfs
21. Networking Fundamentals
22. Bridge Networking
23. Port Publishing
24. Network Drivers

             ↓

MODULE 4 — MULTI-CONTAINER APPS
25. Docker Compose
26. Compose Services
27. Compose Lifecycle
28. Environment Variables
29. Compose Networking
30. Dependencies & Health Checks
31. Profiles
32. Secrets

             ↓

MODULE 5 — PRODUCTION / ADVANCED
33. Multi-Stage Builds
34. Build Cache
35. BuildKit / Buildx
36. Multi-Platform Builds
37. Resource Constraints
38. Container Security
39. Logging & Monitoring
40. SBOM & Provenance
```

## A useful learning-material format

Since you're going to generate training material from this, I would make **each topic follow the same learning loop**:

```text
1. CONCEPT
   Explain the mental model.

2. WHY
   What problem does this Docker feature solve?

3. SYNTAX
   Introduce only the essential commands.

4. DEMONSTRATION
   Show a minimal working example.

5. INSPECT
   Make the learner inspect what Docker actually did.

6. BREAK IT
   Deliberately introduce a problem.

7. DEBUG IT
   Diagnose using Docker commands.

8. CHALLENGE
   Learner changes the solution without copying.

9. KNOWLEDGE CHECK
   3–5 conceptual questions.

10. MINI PROJECT
    Apply the feature to the running application.
```

That **Inspect → Break → Debug** section is particularly important for Docker. Someone who can write a Dockerfile but cannot figure out **why a container exits, why two containers can't communicate, why a volume isn't mounted, or why a build cache is invalidated** doesn't yet have operational Docker competence.

For your eventual learning material, I'd use **one TypeScript application throughout all 40 topics** rather than 40 disconnected demos. Start with a tiny TypeScript HTTP server, containerize it, add PostgreSQL, migrate to Compose, add volumes/networks/health checks, optimize the production build, secure it, and finally build AMD64 + ARM64 images with SBOM/provenance. That gives the curriculum a continuous **Beginner → Production Docker** storyline.

[1]: https://docs.docker.com/get-started/docker-concepts/building-images/multi-stage-builds/?utm_source=chatgpt.com "Multi-stage builds | Docker Docs"
[2]: https://docs.docker.com/get-started/docker-concepts/building-images/?utm_source=chatgpt.com "Building images | Docker Docs"
[3]: https://docs.docker.com/engine/storage/volumes/?utm_source=chatgpt.com "Volumes | Docker Docs"
[4]: https://docs.docker.com/engine/network/drivers/bridge/?utm_source=chatgpt.com "Bridge network driver | Docker Docs"
[5]: https://docs.docker.com/compose/how-tos/environment-variables/envvars-precedence/?utm_source=chatgpt.com "Environment variables precedence in Docker Compose | Docker Docs"
[6]: https://docs.docker.com/compose/how-tos/use-secrets/?utm_source=chatgpt.com "Manage secrets securely in Docker Compose | Docker Docs"
[7]: https://docs.docker.com/reference/dockerfile?utm_source=chatgpt.com "Dockerfile reference | Docker Docs"
[8]: https://docs.docker.com/build/metadata/attestations/?utm_source=chatgpt.com "Build attestations | Docker Docs"
