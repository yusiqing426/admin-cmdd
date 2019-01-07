'use strict'

var shopPayModule = angular.module('shopPayModule', ['ngTable', 'checklist-model'])

shopPayModule.controller('shopPayListController', [ '$scope','$location','shopPayService', 'ngTableParams', '$filter','shopInformationService',
  function ($scope,$location, shopPayService,ngTableParams, $filter,shopInformationService) {
    
          $scope.listFilter = {};
		  $scope.ShopId1 = "";
          shopInformationService.list({},
            function (response) {
              if (response.code == 500) {
                alert('获取缴费列表失败')
                return
              }
              $scope.ShopPayModule  = response.msg
            },
           function (error) {}
          )

          $scope.selectShop=function(){
			  if($scope.ShopId1==""||$scope.ShopId1==null){
				  $scope.listFilter = {};
			  }else{
				  $scope.listFilter.shop_id = $scope.ShopId1;
			  }
			getShopPayList();
            
          }

	var getShopPayList = function(){
      shopPayService.list().$promise.then(function (response) {
        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 25,
            sorting: {},
            filter: $scope.listFilter
          }, {
          total: 0,
          getData: function ($defer, params) {
            var filteredData = $filter('filter')(response.msg, $scope.listFilter);
            var sortedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;

            $scope.dataList = sortedData.slice((params.page() - 1) * params.count(), params.page() * params.count())
            $scope.totalLength = sortedData.length
            params.total(sortedData.length)
            $defer.resolve($scope.dataList)
          }
        })
		$scope.tableParams.settings().$scope = $scope;
		$scope.tableParams.reload();
      })
	}
	getShopPayList();
  }])    


shopPayModule.controller('shopParametersController', [ '$scope', '$location', 'shopPayService', '$routeParams','DataUtilService','shopInformationService',
  function ($scope, $location, shopPayService, $routeParams,DataUtilService,shopInformationService) {
    $scope.YesNoModel = DataUtilService.YesNoModel;
    $scope.OpenOrClose = DataUtilService.OpenOrClose;
    $scope.YesOrNo = DataUtilService.YesOrNo;
    $scope.selectedShopId = $location.search().id;


	$scope.getUrlId = function(){
		var urlId = $location.search().id;
		if(urlId)
			$scope.selectShop(urlId);
	}

    shopInformationService.list({},
      function (response) {
        if (response.code == 500) {
          alert('获取缴费列表失败')
          return
        }
        $scope.ShopParametersModule  = response.msg;
		$scope.getUrlId();
      },
     function (error) {}
    )

	$scope.isShowDatetimepicker = false;
	$scope.openDatetimepicker = function(){
		$scope.isShowDatetimepicker = true;
	}
	$scope.selectDate = function(value){
		$scope.shop.payable_date = value;
		$scope.payable_date_text = '每月'+$scope.shop.payable_date+'日';
		$scope.isShowDatetimepicker = false;
	}

    $scope.selectShop=function(selectedShopId){
		$scope.selectedShopId = selectedShopId;
		if(!selectedShopId)
			return;

        shopInformationService.view({id:selectedShopId},function(response){
              $scope.shop=response.msg;
			  $scope.payable_date_text = '每月'+$scope.shop.payable_date+'日';
            }) 

            $scope.update=function(){
            shopInformationService.update($scope.shop,
                function(response){
                  if(!response==200){
                    alert("更新失败");
                  }
                  $location.path("/shopDataentry/shopInformation");
                }
            )}

      }
    
  }])



shopPayModule.controller('shopPayHistoryController', [ '$scope','$location','shopPayService','ngTableParams', '$filter','shopInformationService',
  function ($scope,$location, shopPayService,ngTableParams, $filter,shopInformationService) {
    
        $scope.listFilter = {};
        
        shopInformationService.list({},
            function (response) {
              if (response.code == 500) {
                alert('获取缴费列表失败')
                return
              }
              $scope.ShopPayModule  = response.msg
            },
           function (error) {}
          )


		$scope.selectShop = function(){
			if(!$scope.ShopId)
				return;
			shopPayService.ShopPaylist({id: $scope.ShopId}).$promise.then(function (response) {
				$scope.tableParams = new ngTableParams({
					page: 1,
					count: 25,
					sorting: {},
					filter: $scope.listFilter
				}, {
					total: 0,
					getData: function ($defer, params) {
						var filteredData = $filter('filter')(response.msg, $scope.listFilter);
						var sortedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;

						$scope.dataList = sortedData.slice((params.page() - 1) * params.count(), params.page() * params.count())
						$scope.totalLength = sortedData.length
						params.total(sortedData.length)
						$defer.resolve($scope.dataList)

					}
				})
				$scope.tableParams.settings().$scope = $scope;
				$scope.tableParams.reload();

			})
		}



  }])    



shopPayModule.controller('shopPayCreateController', [ '$scope', '$location', 'shopPayService','DataUtilService',
  function ($scope, $location, shopPayService,DataUtilService) {

  $scope.MaleOrFemale = DataUtilService.MaleOrFemale;
  $scope.OpenOrClose = DataUtilService.OpenOrClose;

  $scope.warnMessage = "";
    $scope.create = function () {
      $scope.shop.agent_id = localStorage.getItem('id');
      $scope.shop.user_key = "3";
       shopPayService.create($scope.shop,
         function(response){
               if(!response==200){
                 //alert("创建失败")
                 $scope.warnMessage = response.msg;
               }else{
                $location.path('/shopDataentry/shopPay')
               }
          }
       )
    }
  }])





  shopPayModule.controller('shopPayController', [ '$scope', '$location', 'shopPayService', '$routeParams','DataUtilService',
  function ($scope, $location, shopPayService, $routeParams,DataUtilService) {
    $scope.YesNoModel = DataUtilService.YesNoModel;
    $scope.OpenOrClose = DataUtilService.OpenOrClose;
    $scope.YesOrNo = DataUtilService.YesOrNo;

    var shopPayId = $routeParams.id;
    shopPayService.view({id:shopPayId},function(response){
      $scope.shopPay=response.msg;
    })
  
    $scope.update=function(){
      shopPayService.update($scope.shopPay,
          function(response){
            if(!response==200){
              alert("更新失败");
            }
            $location.path("/shopDataentry/shopPay");
          }
      )
      
    }

}])


