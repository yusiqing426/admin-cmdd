'use strict'


var shopPayService = angular.module('shopPayService', ['ngResource'])

shopPayService.factory('shopPayService', function ($resource) {
  
  return $resource(apiHost + '/shop/:id/pay', {}, {
    
    list:{
        method:'GET',
          url:apiHost+'/agent/'+localStorage.getItem('id')+'/shop/pay/list',
          isArray: false,
          headers: {
            'X-Auth-Token': localStorage.getItem('token')
          }
      },
    ShopPaylist:{
        method:'GET',
          url:apiHost+'/shop/:id/pay/list',
          params: {id: '@id'},
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

    update: {
      method: 'PUT',
      params: {id: '@id'},	  	  
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    }

  })
})
