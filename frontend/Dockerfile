FROM node:18-slim

WORKDIR /app

ARG VITE_BACKEND_API_URL

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN echo "VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL" > .env

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host"]

