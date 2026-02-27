FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --production

# Copy application source
COPY src ./src

EXPOSE 5000

CMD ["node", "src/server.js"]
