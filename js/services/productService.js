'use strict'

var productService = angular.module('productService', ['ngResource'])

productService.factory('ProductService', function ($resource) {
	return $resource(apiHost + '/product/:id', {}, {
		list: {
			method: 'GET',
			url: apiHost + '/shop/'+localStorage.getItem('shop_id')+'/product/list',
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
		categoryProductList: {
			method: 'GET',
			url: apiHost + '/category/:id/product/list',
			params: {id: '@id'},
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
		remoteUpdate: {
			method: 'PUT',
			params: {id: '@id'},
			url: remoteApiHost + '/product/:id',
			headers: {
			'X-Auth-Token': localStorage.getItem('token')
			}
		},
		
		syncList: {
			method: 'GET',
			url: remoteApiHost + '/product/shop/'+localStorage.getItem('id')+'/isUpload/:id',
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
        localSyncList: {
            method: 'GET',
            url: apiHost + '/product/shop/'+localStorage.getItem('id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },

        remoteCreate: {
            method: 'POST',
            url: remoteApiHost + '/product/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        remoteUpdate: {
            method: 'PUT',
            url: remoteApiHost + '/product/:id',
            params: {id: '@id'},
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        saveById: {
            method: 'POST',
            url: apiHost + '/product/id',
            params: {id: '@id'},
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        }
	})
})