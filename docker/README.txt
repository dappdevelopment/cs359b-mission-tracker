Docker server that allows developers to interact with our smart contract via GET requests. 

To build, type:
docker build -t game_server .

To run, type:
docker run -t -i --env private=[DEV PRIVATE KEY] --env public=[DEV PUBLIC KEY] -p 8081:5001 game_server

Where 5001 is specifed as the port in gameserver.js and 8081 is the port specified in Dockerfile

Default IP address for docker server on my machine is 172.17.0.2:5001
