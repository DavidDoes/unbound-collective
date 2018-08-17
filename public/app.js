var MOCK_CHALLENGES = {
  "challenges": [
    {
      "id": "11111111",
      "title": "Patterns",
      "description": "Find patterns. Try to think outside the box to redefine your idea of what a pattern is.",
      "entries": 42
    },
    {
      "id": "22222222",
      "title": "Reflections",
      "description": "A 'reflection' could be that of a mirror, a body of water, a self-portrait, what-have-you.",
      "entries": 76
    },
    {
      "id": "3333333",
      "title": "Get Closer",
      "description": "Instead of shooting from a distance, pop on that 50mm or lower lens and get closer to your subject.",
      "entries": 50
    }
  ]
}
//replace when seeding real data
function getChallenges(callback){
    setTimeout(function(){
      callback(MOCK_CHALLENGES)
    }, 100
  )
}
//display title and desc:
function displayChallenges(data){
  for (index in data.challenges){ 
    $('#challenges').append(
      '<h2>' + data.challenges[index].title + '</h2>',
      '<p>' + data.challenges[index].description + '</p>'
    )
  }
}
//run fns above
function getAndDisplayChallenges(){
  getChallenges(displayChallenges)
}

$(function(){
  getAndDisplayChallenges()
})