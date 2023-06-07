FROM node:16-alpine
WORKDIR /aggr-telegram-service

COPY package*.json ./
ENV NODE_ENV=production
RUN npm install
RUN npm install -g typescript@latest

COPY . .
RUN tsc
CMD ["node", "build/server.js"]
EXPOSE 3001
