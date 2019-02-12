# DEPLOY NOW!
##### A fast and easy tool to deploy your app via ssh in minutes (no git required)

### *How it works*
 - Bundle your project directory
 - Ignore specified files
 - Upload files
 - Run deploy commands
 
```
npm install -g deploy-now
```

### Available Commands
| Command         	| Description                                                                               	|
|-----------------	|-------------------------------------------------------------------------------------------	|
| deploy-now      	| Bundle project and upload to server. Runs the `cmd` from `deploy-now.json` in sequence 	|
| deploy-now init 	| Easily create `deploy-now.json` file for the current project.                               	|
| deploy-now sync 	| Synchronize local changes to your server as you are saving it.                             	|


Run command to deploy
`deploy-now` 

Its required that you have `deploy-now.json` in your project root.

```
# deploy-now.json

{
    "name": "sample-app",
    "host": "159.89.xxx.xx",
    "user": "johndoe",
    "password": "password",
    "ignore": [
        "node_modules/**/*",
        "*.log"
    ],
    "cmd": ["node -v","npm -v"],
    "serverProjectRoot": "/var/app/sample-app/",
    "debug": true
}
```

### Options
|       Option      	| Description                                                                                                       	| Required           	|
|:-----------------:	|-------------------------------------------------------------------------------------------------------------------	|--------------------	|
| name              	| Name of your project                                                                                              	| yes                	|
| host              	| Server name or ip address (ssh must be enabled)                                                                   	| yes                	|
| user              	| Authenticating user to login with                                                                                 	| yes                	|
| password          	| Password to your account. Do not worry, your password never leaves your local PC                                  	| if(privateKey) no; 	|
| privateKey        	| Full path to your private key. Usually a `.pem` file                                                              	| if(password) no;   	|
| ignore            	| Array of files/folder to ignore. Only glob pattern supported See: https://github.com/isaacs/node-glob#glob-primer (PS: All `*` will be removed if you are using `sync` mode) 	| no                 	|
| cmd               	| Array of commands to execute after upload is complete                                                             	| no, but important  	|
| serverProjectRoot 	| Path to your app root directory or desired path (it can be created on the fly)                                    	| yes                	|
| debug             	| Wanna see the logs on the console? Set it to true                                                                    	| no                 	|
| runAfter             	| How long should the watcher wait before it deploys your changes while using sync? Default `10000ms`  	| no                 	|
| watchRecursive        | Should the watcher watch more than the root dir? Default `true`   	| no                 	|


# Quick and Easy huh?