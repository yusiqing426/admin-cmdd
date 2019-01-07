'use strict'

var printerService = angular.module('printerService', ['ngResource'])

printerService.factory('PrinterService', function ($resource) {
	return $resource(apiHost + '/printer/:id', {}, {
		list: {
			method: 'GET',
			url: apiHost + '/shop/'+localStorage.getItem('shop_id')+'/printer/list',
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
		getPrinterByPrinter_type: {
			method: 'GET',
			params: {printer_type: '@printer_type'},
			url: apiHost+'/shop/'+localStorage.getItem("shop_id")+'/printer/printer_type/:printer_type',
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
		deletePay_code: {
			method: 'PUT',
			url: apiHost+'/shop/pay_code_id/'+localStorage.getItem("shop_id"),
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},


		remoteCreate: {
			method: 'POST',
			url: remoteApiHost + '/printer/:id',
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
		remoteUpdate: {
			method: 'PUT',
			url: remoteApiHost + '/printer/:id',
			params: {id: '@id'},			
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
		syncList: {
			method: 'GET',
			url: apiHost + '/printer/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		}	

	})
})