FROM node:18

WORKDIR /app

# Kopiuj tylko package.json i locka – po to, żeby cache działał
COPY package*.json ./

# Instaluj zależności TYLKO wewnątrz Dockera!
RUN npm install --legacy-peer-deps

# Teraz dopiero kopiuj resztę aplikacji
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
