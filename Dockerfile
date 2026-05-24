FROM node:20-alpine

WORKDIR /app

# Install dependencies first to leverage caching.
COPY package.json package-lock.json ./
RUN npm ci --production=false

COPY . .

RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]
