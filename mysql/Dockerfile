FROM mysql:5

ENV MYSQL_DATABASE cercinfo
ENV MYSQL_ALLOW_EMPTY_PASSWORD true

ADD schema.sql /docker-entrypoint-initdb.d
