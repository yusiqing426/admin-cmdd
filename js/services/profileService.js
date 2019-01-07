'use strict'

var profileService = angular.module('profileService', ['ngResource'])

profileService.factory('ProfileService', function ($resource) {
  return $resource(apiHost + '/user/:id', {}, {
   
    changePassword: {
      url: apiHost + '/user/:id/password',
      method: 'PUT',
      headers: {'X-Auth-Token': localStorage.getItem('token')},
      params: {id: localStorage.getItem('uid')}
    },
    logout: {
      url: apiHost + '/user/logout',
      method: 'POST',
      headers: {'X-Auth-Token': localStorage.getItem('token')}
    }
  })
})
