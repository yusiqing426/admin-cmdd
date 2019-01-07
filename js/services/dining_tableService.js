'use strict'

var dining_tableService = angular.module('dining_tableService', ['ngResource'])

dining_tableService.factory('Dining_tableService', function ($resource) {
	return $resource(apiHost + '/dining-table/:id', {}, {
		list: {
			method: 'GET',
			url: apiHost + '/shop/'+localStorage.getItem('shop_id')+'/diningTable/list',
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
		remoteUpdate: {
			method: 'PUT',
			params: {id: '@id'},
			url: remoteApiHost + '/dining-table/:id',
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
		
		syncList_remote: {
			method: 'GET',
			url: remoteApiHost + '/dining_table/shop/'+localStorage.getItem('id')+'/isUpload/:id',
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},

        syncList: {
            method: 'GET',
            url: apiHost + '/dining_table/shop/'+localStorage.getItem('id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },

		remoteCreate: {
			method: 'POST',
			url: remoteApiHost + '/dining-table/:id',
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
		remoteUpdate: {
			method: 'PUT',
			url: remoteApiHost + '/dining-table/:id',
			params: {id: '@id'},			
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
        saveById: {
            method: 'POST',
            url: apiHost + '/dining_table/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        }
	})
})