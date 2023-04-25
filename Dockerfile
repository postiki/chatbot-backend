FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm run build
ENV NODE_ENV=production
CMD ["node", "./public/app.js"]