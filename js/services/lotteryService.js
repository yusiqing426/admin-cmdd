'use strict'


var lotteryService = angular.module('lotteryService', ['ngResource'])

lotteryService.factory('lotteryService', function ($resource) {
  
  return $resource(apiHost + '/lottery/:id', {}, {
    
    list:{
        method:'GET',
          url:apiHost+'/shop/:id/lottery/list',
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
    },

    
    remoteCreate: {
      method: 'POST',
      url: remoteApiHost + '/lottery/:id',
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    remoteUpdate: {
      method: 'PUT',
      url: remoteApiHost + '/lottery/:id',
      params: {id: '@id'},      
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    syncList: {
      method: 'GET',
      url: apiHost + '/lottery/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    } 
  })
})
