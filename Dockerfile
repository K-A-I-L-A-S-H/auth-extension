FROM node:19-slim as base
RUN apt-get update  \
  && apt-get upgrade -y

FROM base as install
WORKDIR /app/
COPY package.json pnpm-lock.yaml tsconfig.json tsconfig.build.json nest-cli.json .npmrc ./
RUN npm i -g pnpm
RUN pnpm install --frozen-lockfile
COPY lib lib
COPY src src
COPY prisma prisma
RUN pnpm run prisma:generate

FROM install as build
WORKDIR /app/
RUN pnpm run build

FROM base as app
WORKDIR /app/
ARG PORT=8000
EXPOSE ${PORT}
ENV PORT=${PORT}
ENV NODE_ENV=production
COPY --from=build /app/dist dist
COPY --from=build /app/prisma prisma
COPY --from=build /app/node_modules node_modules
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 app
RUN chown -R app:nodejs ./dist
USER app
CMD ["dist/main.js"]
