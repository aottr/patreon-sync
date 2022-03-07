FROM node:alpine AS BUILD_IMAGE

WORKDIR /usr/src/pawtreon

COPY package.json ./

RUN npm install

COPY . .

# remove dev dependencies
RUN npm run build

FROM node:alpine
WORKDIR /usr/src/pawtreon
COPY package.json ./
RUN npm install --production
COPY --from=BUILD_IMAGE /usr/src/pawtreon/dist ./dist

CMD [ "node", "dist/main.js" ]
