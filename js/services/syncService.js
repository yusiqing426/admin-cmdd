'use strict'

var syncService = angular.module('syncService', ['ngResource'])

syncService.factory('syncService', function ($resource) {
	return $resource({}, {}, {
		//order
		orderSyncList_local:{
			method: 'GET',
			url: apiHost + '/order/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
			headers: {
				'X-Auth-Token': localStorage.getItem('token')
			}
		},
		orderInsertById_remote:{
			method:'POST',
			url:remoteApiHost + "/order/id",
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
		},
        orderInsertById_local: {
            method: 'PUT',
            url: apiHost + '/orders/id',
            params: {id: '@id'},
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
		//order_item
        orderItemSyncList_local: {
            method: 'GET',
            url: apiHost + '/order_item/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        orderItemInsertById_remote: {
            method: 'POST',
            url: remoteApiHost + '/order_item/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        orderItemInsertById_local: {
            method: 'POST',
            url: apiHost + '/order_item/id',
            params: {id: '@id'},
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //staff
       staffSyncList: {
            method: 'GET',
            url: apiHost + '/staff/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        staffCreateOrUpdate_remote:{
            method: 'POST',
            url: remoteApiHost+'/staff/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        staffCreateOrUpdate:{
            method: 'POST',
            url: apiHost+'/staff/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        }
        ,
        //member
        memberSyncList: {
            method: 'GET',
            url: apiHost + '/member/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberCreateOrUpdate_remote:{
            method: 'POST',
            url: remoteApiHost+'/member/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberCreateOrUpdate:{
            method: 'POST',
            url: apiHost+'/member/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        }
        ,
        //memberIntegral
        memberIntegralSyncList: {
            method: 'GET',
            url: apiHost + '/member_integral/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberIntegralCreateOrUpdate_remote:{
            method: 'POST',
            url: remoteApiHost+'/member_integral/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberIntegralCreateOrUpdate:{
            method: 'POST',
            url: apiHost+'/member_integral/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        }
        ,
        //memberIntegral
        memberLotteryLogSyncList: {
            method: 'GET',
            url: apiHost + '/member_lottery_log/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberLotteryLogCreateOrUpdate_remote:{
            method: 'POST',
            url: remoteApiHost+'/member_lottery_log/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberLotteryLogCreateOrUpdate:{
            method: 'POST',
            url: apiHost+'/member_lottery_log/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //memberCard
        memberCardSyncList: {
            method: 'GET',
            url: apiHost + '/member_card/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberCardCreateOrUpdate_remote:{
            method: 'POST',
            url: remoteApiHost+'/member_card/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberCardCreateOrUpdateLocal:{
            method: 'POST',
            url: apiHost+'/member_card/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //member_recharge_log
        memberRechargeLogSyncList: {
            method: 'GET',
            url: apiHost + '/member_recharge_log/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberRechargeLogCreateOrUpdate_remote:{
            method: 'POST',
            url: remoteApiHost+'/member_recharge_log/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberRechargeLogCreateOrUpdate:{
            method: 'POST',
            url: apiHost+'/member_recharge_log/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //staff
        staffSyncList: {
            method: 'GET',
            url: apiHost + '/staff/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        staffCreateOrUpdate_remote:{
            method: 'POST',
            url: remoteApiHost+'/staff/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        staffCreateOrUpdate:{
            method: 'POST',
            url: apiHost+'/staff/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //user
        userSyncList: {
            method: 'GET',
            url: apiHost + '/user/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        userCreateOrUpdate_remote:{
            method: 'POST',
            url: remoteApiHost+'/user/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        userCreateOrUpdate:{
            method: 'POST',
            url: apiHost+'/user/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },

        //st
        //category
        categorySyncList_local: {
            method: 'GET',
            url: apiHost + '/category/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        categoryInsertById_remote:{
            method: 'POST',
            url: remoteApiHost+'/category/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        categoryUpdateSync_status_local:{
            method: 'PUT',
            param:{id:"@id"},
            url: apiHost+'/category/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //dining_table
        dining_tableSyncList_local: {
            method: 'GET',
            url: apiHost + '/dining_table/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        dining_tableInsertById_remote:{
            method: 'POST',
            url: remoteApiHost+'/dining_table/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },

        dining_tableUpdateSync_status_local:{
            method: 'PUT',
            param:{id:"@id"},
            url: apiHost+'/dining-table/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //product
        productSyncList_local: {
            method: 'GET',
            url: apiHost + '/product/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        productInsertById_remote:{
            method: 'POST',
            url: remoteApiHost+'/product/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },

        productUpdateSync_status_local:{
            method: 'PUT',
            param:{id:"@id"},
            url: apiHost+'/product/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //kitchen
        kitchenSyncList_local: {
            method: 'GET',
            url: apiHost + '/kitchen/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        kitchenInsertById_remote:{
            method: 'POST',
            url: remoteApiHost+'/kitchen/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        kitchenUpdateSync_status_local:{
            method: 'PUT',
            param:{id:"@id"},
            url: apiHost+'/kitchen/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //lottery
        lotterySyncList_local: {
            method: 'GET',
            url: apiHost + '/lottery/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        lotterySyncList_remote: {
            method: 'GET',
            url: remoteApiHost + '/lottery/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        lotteryInsertById_remote:{
            method: 'POST',
            url: remoteApiHost+'/lottery/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        lotteryInsertById_local:{
            method: 'POST',
            url: apiHost+'/lottery/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        lotteryUpdateSync_status_local:{
            method: 'PUT',
            param:{id:"@id"},
            url: apiHost+'/lottery/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        lotteryUpdateSync_status_remote:{
            method: 'PUT',
            param:{id:"@id"},
            url: remoteApiHost+'/lottery/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //printer
        printerSyncList_local: {
            method: 'GET',
            url: apiHost + '/printer/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        printerInsertById_remote:{
            method: 'POST',
            url: remoteApiHost+'/printer/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        printerUpdateSync_status_local:{
            method: 'PUT',
            param:{id:"@id"},
            url: apiHost+'/printer/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //image
        imageSyncList_remote:{
            method:'GET',
            params:{
                shop_id:"shop_id",
                type:"@type",
                sync_status:"@sync_status"
            },
            url:remoteApiHost+'/image/syncList',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        imageSyncList_local:{
            method:'GET',
            params:{
                shop_id:"shop_id",
                type:"@type",
                sync_status:"@sync_status"
            },
            url:apiHost+'/image/syncList',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        imageSync_remote:{
            method:'GET',
            params:{
                id:"@id"
            },
            url:remoteApiHost+'/image/sync',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        imageInsertById_local:{
            method:'POST',
            url:apiHost+'/image/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        imageInsertById_remote:{
            method:'POST',
            url:remoteApiHost+'/image/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },

        imageUpdateSync_status_remote:{
            method:'PUT',
            url:remoteApiHost+'/image/sync',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        imageUpdateSync_status_local:{
            method:'PUT',
            url:apiHost+'/image/sync',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //staff
        staffSyncList_local: {
            method: 'GET',
            url: apiHost + '/staff/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        staffInsertById_remote:{
            method: 'POST',
            url: remoteApiHost+'/staff/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        staffUpdateSync_status_local:{
            method: 'PUT',
            param:{id:"@id"},
            url: apiHost+'/staff/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //user
        userSyncList_local: {
            method: 'GET',
            url: apiHost + '/user/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        userInsertById_remote:{
            method: 'POST',
            url: remoteApiHost+'/user/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        userUpdateSync_status_local:{
            method: 'PUT',
            param:{id:"@id"},
            url: apiHost+'/user/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //order
        orderSyncList_local: {
            method: 'GET',
            url: apiHost + '/order/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        orderInsertById_remote:{
            method: 'POST',
            url: remoteApiHost+'/order/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        orderUpdateSync_status_local:{
            method: 'PUT',
            param:{id:"@id"},
            url: apiHost+'/order/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //orderItem
        orderItemSyncList_local: {
            method: 'GET',
            url: apiHost + '/order_item/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        orderItemInsertById_remote:{
            method: 'POST',
            url: remoteApiHost+'/order_item/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        orderItemUpdateSync_status_local:{
            method: 'PUT',
            param:{id:"@id"},
            url: apiHost+'/order-product/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //member
        memberSyncList_local: {
            method: 'GET',
            url: apiHost + '/member/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberInsertById_remote:{
            method: 'POST',
            url: remoteApiHost+'/member/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberUpdateSync_status_local:{
            method: 'PUT',
            param:{id:"@id"},
            url: apiHost+'/member/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //memberCard
        memberCardSyncList_local: {
            method: 'GET',
            url: apiHost + '/member_card/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberCardInsertById_remote:{
            method: 'POST',
            url: remoteApiHost+'/member_card/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberCardUpdateSync_status_local:{
            method: 'PUT',
            url: apiHost+'/member/member_card',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //memberIntegral
        memberIntegralSyncList_local: {
            method: 'GET',
            url: apiHost + '/member_integral/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberIntegralInsertById_remote:{
            method: 'POST',
            url: remoteApiHost+'/member_integral/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberIntegralUpdateSync_status_local:{
            method: 'POST',
            url: apiHost+'/member_integral/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //memberLottery
        memberLotterySyncList_local: {
            method: 'GET',
            url: apiHost + '/member_lottery_log/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberLotteryInsertById_remote:{
            method: 'POST',
            url: remoteApiHost+'/member_lottery_log/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberLotteryUpdateSync_status_local:{
            method: 'PUT',
            param:{id:"@id"},
            url: apiHost+'/lottery-phone/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //memberRechargeLog
        memberRechargeLogSyncList_local: {
            method: 'GET',
            url: apiHost + '/member_recharge_log/shop/'+localStorage.getItem('shop_id')+'/isUpload/:id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberRechargeLogInsertById_remote:{
            method: 'POST',
            url: remoteApiHost+'/member_recharge_log/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        memberRechargeLogUpdateSync_status_local:{
            method: 'POST',
            url: apiHost+'/member_recharge_log/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        //shop
        shopSyncList_local: {
            method: 'GET',
            url: apiHost+'/shop/'+localStorage.getItem('shop_id')+'/sync',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        shopInsertById_remote:{
            method: 'POST',
            url: remoteApiHost+'/shop/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },
        shopUpdateSync_status_local:{
            method: 'POST',
            url: apiHost+'/shop/id',
            headers: {
                'X-Auth-Token': localStorage.getItem('token')
            }
        },

    })
})