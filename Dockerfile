FROM node:16.14.0
WORKDIR /app
COPY package.json /app
RUN npm install && mv /app/node_modules /node_modules
COPY . /app
CMD ["npm", "start"]