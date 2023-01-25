cd ../siithub-backend
docker build -t siithub-backend .

cd ../siithub-client
docker build -t siithub-client .

cd ../siithub-git-server
docker build -t siithub-git-server .
