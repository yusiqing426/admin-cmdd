'use strict'

var categoryService = angular.module('categoryService', ['ngResource'])

categoryService.factory('CategoryService', function ($resource) {
	return $resource(apiHost + '/category/:id', {}, {
		list: {
			method: 'GET',
			url: apiHost + '/shop/'+localStorage.getItem('shop_id')+'/category/list',
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
		view: {
			method: 'GET',
			params: {id: '@id'},
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
			url: remoteApiHost + '/category/:id',
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
		
		syncList: {
			method: 'GET',
			url: remoteApiHost + '/category/shop/'+localStorage.getItem('id')+'/isUpload/:id',
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
        localSyncList: {
            method: 'GET',
            url: apiHost + '/category/shop/'+localStorage.getItem('id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },

        saveById: {
            method: 'POST',
            url: apiHost + '/category/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        remoteCreate: {
            method: 'POST',
            url: remoteApiHost + '/category/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        remoteUpdate: {
            method: 'PUT',
            url: remoteApiHost + '/category/:id',
            params: {id: '@id'},
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        }
	})
})