# Test Reporting Tool

## Introduction

This is a custom tool to create and manage tests and workflows for a product. 

Allows you to send a report to the product owner or the team in charge of the product. 
It has been developed using the MERN stack (MongoDB, Express, React, Node.js).

## Table of Contents

- [Pre-requisites](#pre-requisites)
- [Installation and Setup](#installation-and-setup)
- [Deployment](#deployment)
- [Apache mod rewrite configuration](#apache-mod_rewrite-configuration-to-use-with-react-router)
- [API Endpoints](#api-endpoints)

## Pre-requisites

Have the following installed on your machine:

- [Node.js](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.com/)
- [Apache](https://httpd.apache.org/) or [Nginx](https://www.nginx.com/)


### Dependencies
Application dependencies:
- [React](https://reactjs.org/)
- [React Router DOM](https://reactrouter.com/web/guides/quick-start)
- [Axios](https://axios-http.com/docs/intro)
- [Typescript](https://www.typescriptlang.org/)

Api dependencies:
- [CORS](https://www.npmjs.com/package/cors)
- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [Nodemon](https://www.npmjs.com/package/nodemon)
- [Multer](https://www.npmjs.com/package/multer)


## Installation and Setup

- Clone the repository
- Run `npm install` to install all dependencies

- Rename the _.env.sample_ file to _.env.development_ or _.env.production_:

  - **.env.development**: This file is used during the development phase, it reads after running `npm start`

  - **.env.production**: This file is used when deploying to a production environment, such as a live server or a cloud hosting platform, it reads after running `npm run build`

- Change the values in file to match your environment
- Run `npm start` to start the server or `npm run build` to build the project

## Deployment

Compile the project:

- Run `npm run build` to build the project

Copy the contents of the _build_ folder to your server:

- **Apache**: copy the contents to the `/var/www/html` folder
- **Nginx**: copy the contents to the `/usr/share/nginx/html` folder

Copy the folder api to your server and install the dependencies:

- Run `npm install` to install all dependencies

_As a additional step, you can create a service to run the api server in the background, or create a cron job to run the api on boot_

## Apache mod_rewrite configuration to use with React Router

Enable mod_rewrite:

- `sudo a2enmod rewrite`

and restart Apache:

- `sudo systemctl restart apache2`

Edit the default Apache configuration file:

- `sudo vi /etc/apache2/sites-available/000-default.conf`

- Add the following code inside the **<VirtualHost \*:80>** tag:

  ```
  <VirtualHost *:80>
     <Directory /var/www/html>
         Options Indexes FollowSymLinks MultiViews
         AllowOverride All
         Require all granted
     </Directory>
  ```

- If you have https enabled, add the following code inside the **<VirtualHost \*:443>** tag:
  ```
  <VirtualHost *:443>
     <Directory /var/www/html>
         Options Indexes FollowSymLinks MultiViews
         AllowOverride All
         Require all granted
     </Directory>
  ```

Save the file and restart Apache:

- `sudo systemctl restart apache2`

Create or edit the .htaccess file in the root folder of your project:

- `sudo vi /var/www/html/.htaccess`

- Add the following code:
  ```
   Options -MultiViews
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteRule ^ index.html [QSA,L]
  ```

Save the file and restart Apache:

- `sudo systemctl restart apache2`

## API Endpoints

Please note that the parameter placeholders (e.g., `:id`, `:testId`) should be replaced with the actual IDs or values when making API requests.
| Endpoint | HTTP Method | Description |
| --- | --- | --- |
| /tests/advanced-filters/ | GET | Get tests with advanced filters |
| /tests/ | POST | Add a new test |
| /tests/status/completed | GET | Get completed tests |
| /tests/status/pending | GET | Get pending tests |
| /tests/:testId | GET | Get a test by test ID |
| /tests/date/:date | GET | Get a test by date |
| /tests/:testId | PUT | Update a test |
| /tests/archive/:id | PUT | Archive a test |
| /tests/validated-releases/:days | GET | Get latest status of tests |
| /tests/status/archived/ | GET | Get archived tests |
| /tests/archived/restore/ | PUT | Restore an archived test |
| /tests/archived/:id | DELETE | Delete an archived test |
| /tests/archived/empty/ | DELETE | Empty all archived tests |
| /tests/files/:id | GET | Get test files |
| /tests/files/:testId/:fileId | DELETE | Remove a test file |
| /tests/files/:id | PUT | Upload files to a test |
| /templates/template/product/:product | GET | Get templates by product |
| /templates/template | POST | Add a template |
| /templates/template/:id | DELETE | Delete a template |
| /templates/template/duplicate/:id | POST | Duplicate a template |
| /templates/template/:id | PUT | Update a template |
| /workflows/:testId | POST | Add a workflow to a test |
| /workflows/:testId/:workflowId | DELETE | Delete a workflow from a test |
| /workflows/:testId/:workflowId | PUT | Duplicate a workflow in a test |
| /workflows/update/:testId/:workflowId | PUT | Update a workflow in a test |
| /workflows/update-on-cascade/:testId/:workflowId | PUT | Update workflows on cascade in a test |
| /workflows/update-info/:testId/:workflowId | PUT | Update workflow info in a test |
| /presets/ | GET | Get presets |
| /presets/ | POST | Add a preset |
| /presets/:id | DELETE | Delete a preset |
| /presets/ | PUT | Update a preset |
| /presets/duplicate/:id | POST | Duplicate a preset |
| /products/ | GET | Get products |
| /products/ | POST | Add a product |
| /products/:id | DELETE | Delete a product |
| /products/ | PUT | Update a product |
| /branches/ | GET | Get branches |
| /branches/ | POST | Add a branch |
| /branches/:id | DELETE | Delete a branch |
| /branches/ | PUT | Update a branch |
| /users/ | GET | Get users |
| /users/ | POST | Add a user |
| /users/:id | DELETE | Delete a user |
| /users/ | PUT | Update a user |
| /mails/ | GET | Get mails |
| /mails/ | POST | Add a mail |
| /mails/:id | DELETE | Delete a mail |
| /mails/ | PUT | Update a mail |