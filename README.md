# Trinsic's API Quickstart
This demo shows how to add Streetcred API calls into a nodejs app with our service client. It also shows a webhook implementation can create automated workflows in your app. 

## Use Case
In this simple use case, you control a (very simple) issuer portal for your organization, which can issue a business card to anyone with a mobile wallet in your organization. Once a business card is issued, that holder can do business card verifications to other peers using the Streetcred mobile app. 

## Prerequisites:
- [npm](https://www.npmjs.com/get-npm)


### Register your organization
 1. Create a new organization and select the Sovrin Staging Network.
 
 2. In the .env file, add your organization's subscription key to the `SUBKEY` field and the access token to the `ACCESSTOK` field.
    
### Create a credential definition with Swaggerhub
 1. Retrieve your organization's Access Token and Subscription Key on the Organization page

   Bart will provide


 
### Running the application
After defining the credential, you are ready to run the application. 

- Run with npm
`npm run start`



## Deploy
### Installing Node.js using NVM(Node Version Management)
`curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh -o install_nvm.sh`\
`bash install_nvm.sh`\
`source ~/.profile`\
Currently installed v12.16.2\
`nvm install 12.16.2`\

### Installing PM2
`sudo npm install -g pm2`\
In project folder(located at /var/www/TrinsicServer)\
`pm2 start server.js --name trinsic`\
Current App name of pm2 is trinsic.\

### Configuring Apache to Reverse Proxy to PM2
Defines a backend service to include in a proxy_Balancer cluster. (at the moment it's running on port 9417)\
```
<VirtualHost *:80>
    <Proxy balancer://microservice-cluster>
        BalancerMember http://127.0.0.1:9417
    </Proxy>

    ProxyPreserveHost On

    ProxyPass / balancer://microservice-cluster/
    ProxyPassReverse / balancer://microservice-cluster/
</VirtualHost>
```

### Restart Server with new or updated source
Inside root of project folder,\
`git pull origin master`\
Then,\
`pm2 reload trinsic`\
`sudo service apache2 restart`\




> Contact <support@trinsic.id> for any questions. 


 
