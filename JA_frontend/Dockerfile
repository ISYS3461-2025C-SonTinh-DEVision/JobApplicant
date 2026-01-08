
    FROM node:20-alpine AS build
    WORKDIR /app
    
    # So npm binaries (react-scripts etc.) are on PATH
    ENV PATH="/app/node_modules/.bin:${PATH}"
    
    COPY package*.json ./
    RUN npm ci
    
    COPY . .
    RUN npm run build   # creates /app/build
    
    
    FROM node:20-alpine
    WORKDIR /app
    
    # Small static file server for CRA build
    RUN npm install -g serve
    
    # Copy the built static files from the build stage
    COPY --from=build /app/build ./build
    
    EXPOSE 3000
    
    # Serve the CRA build on port 3000
    CMD ["serve", "-s", "build", "-l", "3000"]
    