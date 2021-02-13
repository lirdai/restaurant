# open docker with node version
FROM node:15.5.1-alpine3.10

# cd 
WORKDIR /usr/src/app/

COPY backend/package*.json ./
RUN npm ci --only=production --verbose

# copy app === backend
COPY backend/ ./