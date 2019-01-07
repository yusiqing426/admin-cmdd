'use strict'

var kitchenService = angular.module('kitchenService', ['ngResource'])

kitchenService.factory('kitchenService', function ($resource) {
  return $resource(apiHost + '/kitchen/:id', {}, {
    list: {
      method: 'GET',
      url: apiHost + '/shop/'+localStorage.getItem('shop_id')+'/kitchen/list',
      isArray: false,
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    view: {
      method: 'GET',
      params: {id: '@id'},
      isArray: false,
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    create: {
      method: 'POST',
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    delete: {
      method: 'DELETE',
      isArray: false,
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    update: {
      method: 'PUT',
      params: {id: '@id'},
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    }
  })
})
