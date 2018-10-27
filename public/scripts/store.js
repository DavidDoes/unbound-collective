'user strict'

const store = (function() {
  return {
    creator: [],
    challenges: [],
    currentChallenge: null,
    submissions: [],
    photo: [],
    thumbnail: [],

    authToken: localStorage.getItem('authToken') || ''

  };
}());