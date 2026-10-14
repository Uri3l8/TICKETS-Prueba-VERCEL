FROM nginx:alpine

COPY . /usr/share/nginx/html

RUN chmod -R a+rX /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80