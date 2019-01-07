'use strict'

var bannerService = angular.module('bannerService', ['ngResource'])

bannerService.factory('BannerService', function ($resource) {
  return $resource(apiHost + '/banner/:id', {}, {
    list: {
      method: 'GET',
      url: apiHost + '/agent/'+localStorage.getItem('id')+'/banner/list',
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
    },
	bannerShopList: {
      method: 'GET',
      url: apiHost + '/banner/:id/banner_shop/list',
      params: {id: '@id'},
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    bannerShopSyncList_remote: {
        method: 'GET',
        url: remoteApiHost + '/banner_shop/syncList',
        params: {shop_id: '@shop_id'},
        headers: {
            'X-Auth-Token': localStorage.getItem('token')
        }
    },

	bannerShopCreate: {
      method: 'POST',
      url: apiHost + '/banner_shop',
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
	bannerShopUpdate: {
      method: 'PUT',
      url: apiHost + '/banner_shop/:id',
      params: {id: '@id'},
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    bannerShopDelete: {
      method: 'DELETE',
	  url: apiHost + '/banner_shop/:id',
      isArray: false,
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
      saveById: {
          method: 'POST',
          url: apiHost + '/banner_shop/id',
          headers: {
              'X-Auth-Token': localStorage.getItem('token')
          }
      },
  })
})
