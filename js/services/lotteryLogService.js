'use strict'


var lotteryLogService = angular.module('lotteryLogService', ['ngResource'])

lotteryLogService.factory('lotteryLogService', function ($resource) {
  
  return $resource(apiHost + '/shop/'+localStorage.getItem('shop_id')+'/lottery-phone/:id', {}, {
    list:{
        method:'GET',
          url:apiHost+'/shop/'+localStorage.getItem('shop_id')+'/lotterylog-phone/:id/list',
		  params: {id: '@id'},
          isArray: false,
          headers: {
            'X-Auth-Token': localStorage.getItem('token')
          }
      },

    queryByOrderId:{
        method:'GET',
        url:apiHost+'/lottery-order/:id',
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
	  url:apiHost+'/lottery-phone/:id',
      params: {id: '@id'},
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    delete: {
      method: 'DELETE',
	  url:apiHost+'/lottery-phone/:id',
      params: {id: '@id'},
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    }
  })
})
