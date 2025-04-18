FROM node:14.20.0-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

# SEGUNDA ETAPA

FROM nginx:alpine
COPY ./config/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /var/www/app/
EXPOSE 83

CMD ["nginx","-g","daemon off;"]


