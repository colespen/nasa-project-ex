# delete node_modules first with .dockerignore for fresh install  - fresh install

FROM node:lts-alpine

WORKDIR /app

# only update when root package or client package have changed
# otherwise cached layer is used
# * wild card to include pack-lock as well
COPY package*.json ./

COPY client/package*.json client/
RUN npm run install-client --omit=dev

COPY server/package*.json server/
RUN npm run install-server --omit=dev

COPY client/ client/
# build will only run if client folder or preceeding layers changed
RUN npm run build --prefix client

COPY server/ server/

USER node

CMD ["npm", "start", "--prefix", "server"]

EXPOSE 8001