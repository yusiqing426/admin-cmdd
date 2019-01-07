'use strict'

var dining_tableModule = angular.module('dining_tableModule', ['ngTable', 'checklist-model'])

		dining_tableModule.controller('dining_tableListController',
			['$scope', 'Dining_tableService', 'ngTableParams', '$filter','shopInformationService','BannerService','syncService',
				function ($scope, Dining_tableService, ngTableParams, $filter,shopInformationService,BannerService,syncService
				) {
		
			$scope.listFilter = {};
		
			Dining_tableService.list().$promise.then(
			    function (response) {
                    $scope.tableParams = new ngTableParams(
                        {
                            page: 1,
                            count: 25,
                            sorting: {},
                            filter: $scope.listFilter
                        }, {
                            total: 0,
                            getData: function ($defer, params) {
                                var filteredData = $filter('filter')(response.msg, $scope.listFilter);
                                var sortedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
                                $scope.dining_tableList = sortedData.slice((params.page() - 1) * params.count(), params.page() * params.count())
                                $scope.totalLength = sortedData.length
                                params.total(sortedData.length)
                                $defer.resolve($scope.dining_table)
                                }
                        }

                        )
			    }
			)
			//TODO:sync 3类信息同步
                    BannerService.bannerShopSyncList_remote(
                        {shop_id:localStorage.getItem("shop_id")},
                        function (response1) {
                            var syncList = response1.msg;
                            if (response1.code!=200||syncList.length<1) return;
                            for (var i = 0; i <syncList.length; i++) {

                                BannerService.saveById(
                                    syncList[i],
                                    function (response2) {
                                        //TODO
                                    }

                                )
                            }

                        }
                    )


                   syncService.imageSyncList_remote(
                        {
                            shop_id:localStorage.getItem("shop_id"),
                            type:3
                        },
                        function (response1) {
                            console.log("syncService.imageSyncListRemoteByType ------ response1");
                            console.log(response1);
                            if(response1.code==200&&response1.msg.length>0){
                                var syncs = response1.msg;
                                for (var i = 0; i < syncs.length; i++) {
                                    syncService.imageInsertById_local(
                                        syncs[i],
                                        function (response2) {

                                        }
                                    )
                                }

                            }else{
                                console.log("syncService.imageSyncList_remote --- 请求异常或集合数据为空")
                            }
                        }
                    );
                    shopInformationService.syncList_remote(
                        function (response1) {
                            if(response1.code==200&&response1.msg.length>0){
                                var syncList = response1.msg;
                                for (var i= 0;i<syncList.length;i++){
                                    syncList[i].sync_status=1;
                                    shopInformationService.saveById(
                                        syncList[i],
                                        function (response2) {
                                            //TODO
                                        }
                                    )
                                    shopInformationService.update_remote(
                                        syncList[i],
                                        function (response3) {
                                            //TODO
                                        }
                                    )

                                }

                            }else{
                                console.log("shopInformationService ----同步数据获取异常或空")
                            }
                    });
                    syncService.lotterySyncList_remote(
                        {id:30},
                        function(response1){
                            if(response1.code==200&&response1.msg.length>0){

                                console.log("lotterySyncList_remote --- response1")
                                console.log(response1)

                                var things = response1.msg;

                                for (var i = 0; i < things.length; i++) {
                                    things[i].sync_status = 1;
                                    syncService.lotteryInsertById_local(
                                        things[i],
                                        function (response2) {
                                            //TODO
                                        }
                                    )

                                    syncService.lotteryUpdateSync_status_remote(
                                        {id:things[i].id},
                                        things[i],
                                        function(response3){
                                            //TODO
                                        }
                                    )
                                };
                            }else{
                                console.log("lotterySyncList_remote ---- 请求异常或集合数据为空")
                            }
                        }
                    )

            $scope.sync = function(){
				var isConfirm = confirm("是否同步云端桌位数据");
				if(!isConfirm)return
				Dining_tableService.syncList_remote(
                    {id:30},
                    function(response1){
                        if(response1.code==200&&response1.msg.length>0){
                            var syncs = response1.msg ;
                            $scope.dining_tableList =  syncs;

                            for (var i = 0; i < syncs.length; i++) {
                                syncs[i].sync_status = 1;
                                Dining_tableService.saveById(
                                    syncs[i],
                                    function (response2) {
                                        //TODO
                                    }
                                )
                                if(i==syncs.length-1){
                                    alert("同步成功!")
                                }

                            };
                        }else{
                            console.log("Dining_tableService ---- 请求异常或集合数据为空")
                        }
                    }
                )
            }
		} 
	])

dining_tableModule.controller('dining_tableCreateController', [ '$scope', '$location', 'Dining_tableService','DataUtilService',
	function ($scope, $location, Dining_tableService,DataUtilService) {
		$scope.YesNoModel  = DataUtilService.YesNoModel;
		$scope.create = function () {
			$scope.dt.shop_id=localStorage.getItem("shop_id");
			$scope.dt.status = 0;
		    Dining_tableService.create(
		        $scope.dt,
			    function(response){
			         if(response.code!=200){
			        	 alert(response.msg)
						 return;
			         }else{
						 alert("创建成功")
			        	 $location.path('/dataentry/dining_table')
			         }
		   		}
		   )
		}
	}
])	

dining_tableModule.controller('dining_tableController',['$scope','$location','Dining_tableService','$routeParams','DataUtilService',
	function($scope,$location,Dining_tableService,$routeParams,DataUtilService){
		$scope.YesNoModel  = DataUtilService.YesNoModel;
		
		var dining_tableId=$routeParams.id;
			
		$scope.getDiningTable = function(){
			Dining_tableService.view({id:dining_tableId},function(response){
				$scope.dataUrlForepart=apiHost + '/image/';
				$scope.dining_table=response.msg;			
			})
		}
		$scope.getDiningTable();

		$scope.downloadImage = function(){
			return;
		}

		$scope.update=function(){

			Dining_tableService.update($scope.dining_table,
					function(response){
						if(response.code!=200){
							alert("修改失败");
							return;
						}
						alert("修改成功")
						$location.path("/dataentry/dining_table");
					}
			)
			
		}
	}
])






