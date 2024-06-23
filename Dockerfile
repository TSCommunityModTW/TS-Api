FROM node:21 AS BUILD

# Mkdir app
RUN mkdir -p /app

# Add package file
COPY package.json /app
COPY yarn.lock /app

WORKDIR /app

# Install dependencies
RUN yarn --frozen-lockfile

# Copy source
COPY src /app/src
COPY tsconfig.json /app/tsconfig.json
COPY types.d.ts /app/types.d.ts

# Build tsc
RUN npm install typescript@5.5.2 -g
RUN tsc

# remove development dependencies
RUN npm prune --production

# Start production image build
FROM node:21-alpine

# Mkdir app
RUN mkdir -p /app

# copy from build image
COPY --from=BUILD /app/release /app/src
COPY --from=BUILD /app/node_modules /app/node_modules

# Copy static files
# COPY src/public dist/public
# COPY src/views dist/views

# Add env
ENV NODE_ENV=production

CMD ["node", "/app/src/index.js"]
