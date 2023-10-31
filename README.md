# Application Structure

pages

- api
  - explorer: html page with voyager script
  - story: html page with voyager script
- collections
  - [collection]: every individual collection
  - index: collection page
- components
  - Layout: wrapper component for styling all pages
  - ResetPass: component for login
  - SignIn: component for sign in
  - SignUp: component for sign in

\_app: root file

account:page with account information

index: landing page

login : login page

models: models page

register: register page

reset-password: reset password page

# Setup

## Install

npm install

## Development

npm run dev

## Build before deployment

npm run build

## Deploy

## Firebase

firebase init

firebase deploy -only hosting

## Vercel for Git

Push your code to your git repository (GitHub, GitLab, BitBucket).

[Import your React project into Vercel.](https://vercel.com/new)

Vercel will detect that you are using React and will enable the correct settings for your deployment.

Your application is deployed! (e.g. create-react-template.vercel.app)