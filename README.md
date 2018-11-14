# The Unbound Collective
[Live](https://challenge-photos.herokuapp.com/)

## Overview
Challenge.photos is a dynamic web service providing users with the ability to contribute to photography challenges by uploading their own photos as submissions to challenges. 

Each challenge consists of a simple theme, to which users submit their interpretation of that theme in the form of an original photo. 

## Features
This MVP consists only of an `index.html` page and a `dashboard.html` page. This is by design. The intention is to have each challenge have its own page that users can visit by clicking on the challenge’s thumbnail. 

### Homepage
On the homepage, the user can navigate to a login form, their dashboard, and a short description about how to use the service. 

### Dashboard
On the dashboard, users can see all of their submissions, ordered by date submitted. Users can also modify or delete their profile.

## Production Goals
The following are some of the intended features for the first iteration of production:
- Pop-up login/registration form
- Full view-height sections with contrasting colors
- Dedicated page for each challenge (`/:id`)
- Full CRUD capabilities for user’s submissions
- JWT integration
- Max file size limit
- Uploads per day limit

## Stretch Goals
- User suggestions for challenges, to be approved by admin.
- Sorting collections by category/number of contributions/etc.
- EXIF data of photos
