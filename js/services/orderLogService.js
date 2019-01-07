'use strict'


var orderLogService = angular.module('orderLogService', ['ngResource'])

orderLogService.factory('orderLogService', function ($resource) {

  return $resource(apiHost + '/shop/:id/order/list', {}, {
    tableList: {
      method: 'GET',
      url: apiHost + '/shop/' + localStorage.getItem('shop_id') + '/diningTable/list?regionId=:regionId&seatingNumber=:seatingNumber',
      params: {
        regionId: '@regionId',
        seatingNumber: '@seatingNumber'
      },
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    tableView: {
      method: 'GET',
      url: apiHost + '/dining-table/:id',
      params: {
        id: '@id'
      },
      isArray: false,
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    orderLogList: {
      method: 'GET',
      url: apiHost + '/shop/' + localStorage.getItem('shop_id') + '/orders/list?:url',
      params: {
        url: '@url'
      },
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    productLogList: {
      method: 'GET',
      url: apiHost + '/shop/' + localStorage.getItem('shop_id') + '/productCount?:url',
      params: {
        url: '@url'
      },
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    },
    orderDetail: {
      method: 'GET',
      url: apiHost + '/orders/:id',
      params: {
        id: '@id'
      },
      headers: {
        'X-Auth-Token': localStorage.getItem('token')
      }
    }


  })
})
