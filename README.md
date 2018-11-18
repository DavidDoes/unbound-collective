# The Unbound Collective
[Live](https://challenge-photos.herokuapp.com/)
![image of splash screen](public/assets/splash.png)

[![Build Status](https://travis-ci.org/DavidDoes/unbound-collective.svg?branch=master)](https://travis-ci.org/DavidDoes/unbound-collective)

[API Documentation](https://documenter.getpostman.com/view/1740901/RzZ9GzYF)

# Overview
**The Unbound Collective** is a dynamic web service which helps to encourage and inspire photographers to step outside of their comfort zone by way of providing challenges, and a way to upload their submissions to those challenges. 

# Features
## Homepage
From the homepage, the user can navigate to a login/signup form, their Submissions and Challenges, view a short description about how to use the service, and browse existing Challenges and Submissions. 

## Challenges
Users may browse existing Challenges in search of inspiration for their next photo outing, or create a Challenge of their own by uploading a photo and giving it a title that will serve to inspire other photographers on that subject. The subject is not a hard rule, but rather a guiding phrase to help expand the photographer's view. 

## Submissions
Users may submit their photo to a Challenge by navigating to that Challenge and clicking `Submit a Photo`.

## Dashboard
Upon clicking `My Submissions`, users can see all of their submissions in one place, and may choose to delete them if necessary. 

Upon clicking `My Challenges`, users can see all of their challenges in one place, and may choose to edit the title of one of their challenges.

# Technologies
- [HTML5](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
- [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference)
- [JavaScript ES6](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [jQuery](https://jquery.com/)
- [Node.js](https://nodejs.org/en/)
- [Express.js](http://expressjs.com)
- [JSON Web Token](https://jwt.io/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com)
- [Multer](https://www.npmjs.com/package/multer)
- [Cloudinary](https://cloudinary.com/documentation)
- [Travis-CI](https://travis-ci.org)
- [Heroku](https://heroku.com)

# Future Implementations
- Dedicated page for each Challenge
- Dedicated page for each Submission
- Dedicated Dashboard page
- Uploads per day per user limit 
- 'Liking' system for Submissions
- Public user profile pages