'user strict'

const store = (function() {
  return {
    username: [],
    challenges: [],
    currentChallenge: null,
    ChallengeTitles: [],
    submissions: [],
    userSubmissions: [],
    userChallenges: [],

    authToken: localStorage.getItem('authToken') || '',
  };
}());