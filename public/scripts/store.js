'user strict'

const store = (function() {
  return {
    username: [],
    challenges: [],
    currentChallenge: null,
    currentChallengeTitle: null,
    currentSubmission: null,
    ChallengeTitles: [],
    submissions: [],
    userSubmissions: [],
    userChallenges: [],

    authToken: localStorage.getItem('authToken') || '',
  };
}());