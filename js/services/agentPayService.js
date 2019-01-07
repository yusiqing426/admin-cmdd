'use strict'


var agentPayService = angular.module('agentPayService', ['ngResource'])

agentPayService.factory('agentPayService', function ($resource) {
  
  return $resource(apiHost + '/agent/:id/pay', {}, {
    
	agentList:{
        method:'GET',
          url:apiHost+'/agent/list',
          isArray: false,
          headers: {
            'X-Auth-Token': localStorage.getItem('token')
          }
      },
    list:{
        method:'GET',
          url:apiHost+'/agent/pay/list',
          isArray: false,
          headers: {
            'X-Auth-Token': localStorage.getItem('token')
          }
      },
    agentPaylist:{
        method:'GET',
          url:apiHost+'/agent/:id/pay/list',
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

	agentView:{
        method:'GET',
          url:apiHost+'/agent/:id',
          params: {id: '@id'},
          isArray: false,
          headers: {
            'X-Auth-Token': localStorage.getItem('token')
          }
      },
	updateAgent:{
        method:'PUT',
          url:apiHost+'/agent/:id',
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
	getAgent: {
		//没有URL默认是：apiHost + '/agent/:id'
		method: 'GET',
		url:apiHost+'/agent/:id',
		params: {id: '@id'},
		headers: {
			'X-Auth-Token': localStorage.getItem('token')
		}
	},
	createNextMonthAgentPay:{
        method:'POST',
        url:apiHost+'/agent/pay/nextMonth',
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
    },
    agentShopPaylist:{
        method:'GET',
          url:apiHost+'/platform/agent/pay/list?:url',
          params: {url: '@url'},
          headers: {
            'X-Auth-Token': localStorage.getItem('token')
          }
      },
      shopList:{
        method:'GET',
          url:apiHost+'/agent/:id/shop/list',
          isArray: false,
          headers: {
            'X-Auth-Token': localStorage.getItem('token')
          }
      }

  })
})
