'user strict'

const store = (function() {
  return {
    user: [],
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