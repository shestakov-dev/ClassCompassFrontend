FROM node:lts-alpine AS base

ENV PNPM_HOME="/pnpm"

ENV PATH="$PNPM_HOME/bin:$PATH"

RUN corepack enable

WORKDIR /app

FROM base AS build

ARG VITE_BASE_URL
ARG VITE_KRATOS_URL
ARG VITE_API_URL

ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_KRATOS_URL=$VITE_KRATOS_URL
ENV VITE_API_URL=$VITE_API_URL

COPY pnpm-lock.yaml package.json ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build


FROM base AS final

WORKDIR /app

RUN pnpm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 5173

CMD [ "serve", "-s", "dist", "-l", "5173" ]