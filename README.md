# The devRant Discord bot

This bot was built for the devRant Discord community. The bot has been built by `epictern` and `vintprox`. Currently uses DJS v13.

<div align="center">
<img src="https://apprecs.org/gp/images/app-icons/300/0f/com.hexicallabs.devrant.jpg">
</div>
<br>

### **Features -**
1. Verification - It uses the devRant API to verify the user by providing a one time token required for verification.
2. devRant posts - Fetches rants, stories and collabs from the devRant API.
3. Summarizes links - Links are summarized using the `smmry` API.
<br>
......and more.

Do check out the [verification wiki](https://github.com/anjannair/Devrant-Discord-Bot/wiki/How-To-Verify-Yourself) page to understand how users can verify themselves.

## Helping In Development
To ease the process of development for everyone without any NodeJs conflicts, Docker has been utilized.

Pre-requisites -
1. To build using Docker ensure you have it [installed](https://docs.docker.com/get-docker/)
2. Finally ensure you have [nodemon](https://nodemon.io/) installed locally in your folder for monitoring realtime changes to your code by running **npm i nodemon**
3. Build a Docker image using `docker build -t devrant .` (yes, even that fullstop). This will build a custom Docker image with the name **devrant**
4. To create containers from the image and see changes in realtime just run `docker run -i -v $(pwd):/app devrant`
5. To stop the Docker container get the ID using `docker ps` (in a new terminal) and then run `docker stop <id>`