'user strict'

const store = (function() {
  return {
    username: [],
    challenges: [],
    currentChallenge: null,
    submissions: [],
    userSubmissions: [],
    userChallenges: [],
    photo: [],
    thumbnail: [],

    authToken: localStorage.getItem('authToken') || '',
  };
}());