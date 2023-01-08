FROM bitmeal/nodegit:0.27-18-alpine AS build

WORKDIR /app

COPY package.json ./

RUN npm i

COPY . .

RUN npm run build

FROM bitmeal/nodegit:0.27-18-alpine

# install git
RUN apk update
RUN apk add git

# install bash
RUN apk add --no-cache bash

# install starship
RUN apk add starship
RUN echo 'eval "$(starship init bash)"' >> ~/.bashrc

# install ssh
RUN apk add openssh

# install openrc and enable softlevel
RUN apk add openrc
RUN mkdir /run/openrc
RUN touch /run/openrc/softlevel

WORKDIR /app

COPY --from=build app/package.json ./

RUN npm i --only=production

COPY --from=build app/dist ./

CMD ["node", "src/index.js"]
