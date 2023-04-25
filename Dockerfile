FROM node:14-alpine
WORKDIR /app
COPY package.json .
RUN npm run build && NODE_ENV=production node ./public/app.js
COPY . .
EXPOSE 4000
CMD ["node", "app.js"]