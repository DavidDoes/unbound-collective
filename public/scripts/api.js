'use strict'

const store = (function() {
  return {
    submissions: [],
    authToken: ""
  }
})

const api = (function(){
  const create = (path, obj) =>{
    return $.ajax({
      type: 'POST',
      url: path,
      contentType: 'application/json',
      dataType: 'json',
      processData: false,
      data: JSON.stringify(obj),
      headers: { 'Authorization': `Bearer ${store.authToken}` }
    })
  }
  const update = (path, obj) =>{
    return $.ajax({
      type: 'PUT',
      url: path,
      contentType: 'application/json',
      data: JSON.stringify(obj),
      headers: { 'Authorization': `Bearer ${store.authToken}` }
    })
  }
  const remove = (path, obj) =>{
    return $.ajax({
      type: "DELETE",
      dataType: "json",
      url: path,
      headers: { "Authorization": `Bearer ${store.authToken}` }
    })
  }
  return {
    create, update, remove
  }
}())