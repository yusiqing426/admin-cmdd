'use strict'

var bannerModule = angular.module('bannerModule', ['ngTable', 'ui.bootstrap'])

bannerModule.controller('bannerListController', [ '$scope', 'BannerService', 'ngTableParams', '$filter', 'shopInformationService',
  function ($scope, BannerService, ngTableParams, $filter, shopInformationService) {

    $scope.ImageFiles = [];
	$scope.listFilter = {};

	BannerService.list(
	function (response) {
		if (response.code == 500) {
			alert('获取banner失败')
			return
		}
		//$scope.bannerList = response.msg;
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
		/*
			for(var i=0; i<$scope.bannerList.length;i++){
			var img = {
				'dataUrl': apiHost + '/image/' + $scope.bannerList[i].banner_id,
				'id':$scope.bannerList[i].id
			}
			$scope.ImageFiles.push(img)
		*/
	},
		function (error) {}
	)

	$scope.changeItem = function(banner){
		window.location.href = "#/Bannerdataentry/banner/"+banner.id;
	}

	$scope.deleteItem = function (banner) {
		if(confirm("确认删除"+banner.name+"广告？")){
			BannerService.delete(
			{
			  id: banner.id
			},
			function (response) {
			  if (response && response.code == 500) {
				alert(response.msg)
				return
			  }
			  else{
				  alert("删除成功")
					location.reload();
			  }
			},
			function(err){
				location.reload();
			}
		  )
		}
    }

  } ])

bannerModule.controller('bannerCreateController', [ '$scope', '$location','ImageService', 'BannerService','DataUtilService', 'shopInformationService',
  function ($scope, $location,ImageService, BannerService,DataUtilService, shopInformationService) {

    $scope.warnMessage = "";

    $scope.addImage = function (files) {
      ImageService.generateThumb(files[0])
	  $scope.imageFile = files[0]
    }

    $scope.banner = {};

	var createBanner = function(image_id){

		$scope.banner.banner_id = image_id;
		$scope.banner.agent_id = localStorage.getItem('id');

		$("input[name='shop-list']").each(function() {
			if ($(this).prop('checked') ==true) {
				var data = {
					banner_id: $scope.banner.banner_id,
					serial: $scope.banner.serial,
					shop_id: $(this).val()
				}
				BannerService.bannerShopCreate(data,
					function(response){
					  if(response.code!=200){
						alert(response.msg);
						return;
					  }
					}
				)
			}
		});


      BannerService.create(
      		$scope.banner,
            function (response) {
				  if(response.code != 200){
					$scope.warnMessage = response.msg;
				  }
				  else{
					  alert("创建成功")
					$location.path('/Bannerdataentry/banner')
				  }
            }
          )
    }

    var changed = [];

	shopInformationService.list({},
		function (response) {
			if (response.code == 500) {
				alert('获取商户列表失败')
				return
			}
			$scope.ShopList  = response.msg
		},
		function (error) {}
	)

    $scope.create = function () {
      if($scope.imageFile == null){
        createBanner(0);
      }

		ImageService.uploadShopInfoCode('/image?type=3', $scope.imageFile)
			.then(
			function(ress){
				var banner_id = ress.data.msg.image_id;
				createBanner(banner_id);
				//imageService.uploadImageToServer("/image?type=3")
			}
		)
    }

}])

bannerModule.controller('bannerController', [ '$scope', '$location', 'ImageService', 'BannerService', '$routeParams', 'shopInformationService',
  function ($scope, $location, ImageService, BannerService, $routeParams, shopInformationService) {

    var imageChanged = false;
    var bannerId = $routeParams.id;
    $scope.banner = {};
	$scope.bannerShopList = [];

    BannerService.view({id: bannerId}, function (response) {
      $scope.banner = response.msg
		BannerService.bannerShopList({id: $scope.banner.banner_id}, function (response) {
			$scope.bannerShopList = response.msg;
			$("input[name='shop-list']").each(function() {
				for(var i=0;i<$scope.bannerShopList.length;i++){
					if($scope.bannerShopList[i].shop_id==$(this).val())
						$(this).prop('checked',true);
				}
			});
		});
      var img = {
        'dataUrl': apiHost + '/image/' + $scope.banner.banner_id
      }
      $scope.imageFile = img
    });

    $scope.addImage = function (files) {
      ImageService.generateThumb(files[0]);
      $scope.imageFile = files[0];
      imageChanged = true;
    }



	shopInformationService.list({},
		function (response) {
			if (response.code == 500) {
				alert('获取商户列表失败')
				return
			}
			$scope.ShopList  = response.msg
		},
		function (error) {}
	)

    var updateBanner = function(){
		var isAdd = 0;
		$("input[name='shop-list']").each(function() {
			if ($(this).prop('checked') ==true) {
				for(var i=0;i<$scope.bannerShopList.length;i++){
					if($scope.bannerShopList[i].shop_id==$(this).val()){
						isAdd = 1;
						$scope.bannerShopList[i].banner_id = $scope.banner.banner_id;
						$scope.bannerShopList[i].serial = $scope.banner.serial;
						BannerService.bannerShopUpdate($scope.bannerShopList[i],
							function(response){
							  if(response.code!=200){
								alert(response.msg);
								return;
							  }
							}
						)
					}
				}
				if(isAdd==0){
					var data = {
						banner_id: $scope.banner.banner_id,
						serial: $scope.banner.serial,
						shop_id: $(this).val()
					}
					BannerService.bannerShopCreate(data,
						function(response){
						  if(response.code!=200){
							alert(response.msg);
							return;
						  }
						}
					)
				}
				isAdd = 0
			}else{
				for(var i=0;i<$scope.bannerShopList.length;i++){
					if($scope.bannerShopList[i].shop_id==$(this).val()){
						BannerService.bannerShopDelete({id:$scope.bannerShopList[i].id},
							function(response){
							  if(response.code!=200){
								alert(response.msg);
								return;
							  }
							}
						)
					}
				}
			}
		});

      BannerService.update(
        {
          id: bannerId
        },
        $scope.banner,
        function (response) {
			if(response.code!=200){
				alert(response.msg);
				return;
			}
			alert("修改成功")
          $location.path('/Bannerdataentry/banner')
        },
        function (error) {
          alert(JSON.stringify(error))
        }
      )
    }

    $scope.update = function () {
      if($scope.imageFile == null || imageChanged == false){
        updateBanner();
		return;
      }

      ImageService.uploadImageToServer('/image?id='+$scope.banner.banner_id, $scope.imageFile).then(
        function(ress){
          updateBanner();
				}
      )
    }
    $scope.delete = function () {
		if(confirm("确认删除该广告？")){
			BannerService.delete(
			{
			  id: $routeParams.id
			},
			function (response) {
			  if (response && response.code == 500) {
				alert(response.msg)
				return
			  }
			  else{
				  alert("删除成功")
				$location.path('/Bannerdataentry/banner')
			  }
			},
			function(err){
			  $location.path('/Bannerdataentry/banner')
			}
		  )
		}
    }
}])