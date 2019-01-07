'use strict'


var memberInformationService = angular.module('memberInformationService', ['ngResource'])

memberInformationService.factory('memberInformationService', function ($resource) {
  
  return $resource(apiHost + '/member/:id', {}, {
    
    list:{
        method:'GET',
          url:apiHost+'/shop/:id/member/list',
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
    },
	changePassword: {
		method: 'PUT',
		url: apiHost+'/member/:id/password',
		params: {id: '@id'},
		headers: {
			'X-Auth-Token': localStorage.getItem('token')
		}
	},
	recharge: {
      method: 'POST',
	  url:apiHost+'/member-recharge',
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    payList:{
        method:'GET',
          url:apiHost+'/shop/:id/recharge/list',
		  params: {id: '@id'},
          isArray: false,
          headers: {
            'X-Auth-Token': localStorage.getItem('token')
          }
    },
    memberPayList:{
        method:'GET',
          url:apiHost+'/member/:id/recharge/list',
		      params: {id: '@id'},
          isArray: false,
          headers: {
            'X-Auth-Token': localStorage.getItem('token')
          }
      },
    memberCardList: {
      method: 'GET',
      url: apiHost+'/member/member_card/shop_id/:id',
      params: {id: '@id'},
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    memberCardCreate: {
      method: 'POST',
      url: apiHost+'/member/member_card',
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    memberCardView:{
      method:'GET',
      url:apiHost+'/member/member_card/:id',
      params: {id: '@id'},
      isArray: false,
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    memberCardUpdate: {
      method: 'PUT',
      url:apiHost+'/member/member_card',
      params: {id: '@id'},        
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    memberIntegralList : {
      method: 'GET',
      url:apiHost+'/member/member_integral/shop_id/:id',
      params: {id: '@id'},        
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    memberIntegralUpdate: {
      method: 'POST',
      url: apiHost+'/member_integral/id',
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
      birth:{
          method:"GET",
          url:apiHost+'/member/shop/'+localStorage.getItem('shop_id')+'/birth',
          headers: {
              'X-Auth-Token': localStorage.getItem('token')
          }
      }



  })
})
