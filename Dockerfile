# Inside your Dockerfile
WORKDIR /app
COPY . .
RUN cd client && npm install && npm run build
RUN cd backend && npm install

# Run from the root so that paths like '../client/dist' resolve correctly
CMD ["node", "backend/server.js"]