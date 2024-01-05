FROM node:20-alpine AS build

WORKDIR /app

COPY ./lovely-lumens-app/package.json ./
COPY ./lovely-lumens-app/package-lock.json ./
RUN npm install
COPY ./lovely-lumens-app/ .
RUN npm run build

FROM node:20-alpine AS prod

COPY --from=build /app/build/ /build
COPY --from=build /app/package.json .
CMD [ "node", "build" ]