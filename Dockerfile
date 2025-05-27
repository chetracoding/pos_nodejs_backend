FROM node:18.12.0

EXPOSE 5000

RUN mkdir -p /home/app

WORKDIR /home/app

COPY . /home/app

# remove husky install by removing prepare script & install dependencies
RUN npm pkg delete scripts.prepare && npm i

# install globaly required module for migrations
RUN npm i -g sequelize-cli

RUN chmod +x startup.sh

ENTRYPOINT [ "./startup.sh" ]
