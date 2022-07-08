FROM mcr.microsoft.com/playwright:v1.22.2

ARG TARGETARCH

ENV TINI_VERSION v0.19.0
ENV GOSU_VERSION 1.12

ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-${TARGETARCH} /usr/local/bin/tini
RUN chmod +x /usr/local/bin/tini

# ADD https://github.com/tianon/gosu/releases/download/${GOSU_VERSION}/gosu-${TARGETARCH} /usr/local/bin/gosu
# RUN chmod +x /usr/local/bin/gosu

WORKDIR /usr/local/app
COPY package.json yarn.lock /usr/local/app/
RUN yarn install --production \
  && yarn cache clean
COPY main.js /usr/local/app/

ENTRYPOINT ["/usr/local/bin/tini", "-g", "--"]

EXPOSE 3000

CMD [ "node", "main.js"]