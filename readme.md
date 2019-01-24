# DEPLOY NOW!
##### A fast and easy tool to deploy your app via ssh in minutes (no git required)

### *How it works*
 - Bundle your project directory
 - Ignore specified files
 - Upload file
 - Run deploy commands
 
```
npm install -g deploy-now
```
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

# Quick and Easy huh?