FROM library/ubuntu:20.04

RUN apt-get update && apt-get install -y locales

RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8

ENV LANG en_US.UTF-8

RUN apt-get update && apt-get upgrade -y && apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_16.x | bash - && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | \
    apt-key add - && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && apt-get install -y nodejs yarn dumb-init wait-for-it

WORKDIR /app

COPY --chown=1000:1000 . /app

RUN chmod +x run.sh

ENTRYPOINT ["/usr/bin/dumb-init", "--", "/app/run.sh"]
