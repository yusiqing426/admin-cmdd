'use strict'

var platformAccountService = angular.module('platformAccountService', ['ngResource'])

platformAccountService.factory('PlatformAccountService', function ($resource) {
  return $resource(apiHost + '/platform/:id', {}, {
    changePassword: {
      url: apiHost + '/platform/'+localStorage.getItem('id')+'/password',
      method: 'PUT',
      headers: {'X-Auth-Token': localStorage.getItem('token')},
      params: {id: localStorage.getItem('id')}
    }
  })
})
