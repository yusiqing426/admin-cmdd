'use strict'

var shopInformationModule = angular.module('shopInformationModule', ['ngTable', 'checklist-model'])

shopInformationModule.controller('shopInformationListController', [ '$scope','$location','shopInformationService', 'ngTableParams', '$filter',
  function ($scope,$location, shopInformationService,ngTableParams, $filter) {
  
    $scope.listFilter = {};
    
      shopInformationService.list().$promise.then(function (response) {
          console.log(response)
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
      })
      
       $scope.updatePassword=function(shop){
       if (!confirm("您确定要重置"+shop.shop_name+"商铺的密码吗？"))
          return false;  
            shop.password = "000000";
            /*TODO:*/
          /* if (shop != syncStatus + 1) {
               shop = syncStatus + 2;
           }*/
           shopInformationService.update(shop,
                function(response){
                  if(response.code!=200){
                    alert(response.msg);
					return;
                  }
				  alert("重置密码成功")
                  $location.path("/shopDataentry/shopInformation");
                }
            )}

} ])


shopInformationModule.controller('shopInformationCreateController', [ '$scope', '$location', 'shopInformationService','DataUtilService','ImageService',
  function ($scope, $location, shopInformationService,DataUtilService,ImageService) {

  $scope.MaleOrFemale = DataUtilService.MaleOrFemale;
  $scope.OpenOrClose = DataUtilService.OpenOrClose;
  $scope.YesNoModel  = DataUtilService.YesNoModel;
  $scope.warnMessage = "";
        var imageChanged = false;
        $scope.addImage = function (files) {
          ImageService.generateThumb(files[0]);
          $scope.imageFile = files[0];
          imageChanged = true;
        }

        $scope.create = function () {
            /*
            var reg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
            if(!reg.test($scope.shop.phone)){
                alert("手机号格式不正确");
                return;
            }
            */
            $scope.shop.agent_id = localStorage.getItem('id');
            $scope.shop.user_key = "3,4,5,6";


            if($scope.imageFile == null || !imageChanged){
                shopInformationService.create(
                    $scope.shop,
                    function (response) {
                        if(response.code!=200){
                            alert(response.msg);
                            return;
                        }
                        alert("创建成功");
                        var url = '#/shopDataentry/shopPay/Parameters?id='+response.msg.shop_id;
                        window.location.href = url;
                    }
                )
            }else{

                ImageService.uploadShopInfoCode('/image?type=3', $scope.imageFile)
                                .then(
                                    function(response){
                                        $scope.shop.shop_code_id = response.data.msg.image_id;
                                        shopInformationService.create(
                                            $scope.shop,
                                            function(response){
                                                if(response.code!=200){
                                                    alert(response.msg);
                                                    return;
                                                }else{
                                                    alert("创建成功");

                                                    var url = '#/shopDataentry/shopPay/Parameters?id='+response.msg.shop_id;
                                                    localStorage.setItem("shop_id",response.msg.shop_id)

                                                    ImageService.uploadImageToServer('/image?id='+$scope.shop.shop_code_id,$scope.imageFile).then(
                                                        function(response){

                                                        }
                                                    )

                                                    window.location.href = url;
                                                }
                                            }
                                        )

                                    }
                                )

            }
        }

}])

shopInformationModule.controller('shopInformationController', [ '$scope', '$location', 'shopInformationService', '$routeParams','DataUtilService','ImageService',
  function ($scope, $location, shopInformationService, $routeParams,DataUtilService,ImageService) {
    $scope.MaleOrFemale = DataUtilService.MaleOrFemale;
    $scope.OpenOrClose = DataUtilService.OpenOrClose;
    $scope.YesNoModel  = DataUtilService.YesNoModel;
    var shopInformationId = $routeParams.id;
    var imageChanged = false;

    shopInformationService.view({id:shopInformationId},function(response){
      $scope.shop=response.msg;
      var img = {
          'dataUrl': apiHost + '/image/' + $scope.shop.shop_code_id
        }
        $scope.imageFile = img
    })
  
    var updateShop = function(){
		/*
		var reg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
		if(!reg.test($scope.shop.phone)){
			alert("手机号格式不正确");
			return;
		}
		*/
      shopInformationService.update($scope.shop,
          function(response){
            if(response.code!=200){
				alert(response.msg);
				return;
            }
			alert("修改成功")
            $location.path("/shopDataentry/shopInformation");
          }
      )
      
    }

  $scope.addImage = function (files) {
      ImageService.generateThumb(files[0]);
      $scope.imageFile = files[0];
      imageChanged= true;
    }   
  $scope.update=function(){
    if($scope.imageFile == null || imageChanged==false){      
      updateShop();
    }else{
      if($scope.shop.shop_code_id==null){
          ImageService.uploadImageToServer('/image?type=3', $scope.imageFile).then(
            function(response){
              $scope.shop.shop_code_id = response.data.msg.image_id;
              updateShop();
            })
      }else{
          ImageService.uploadImageToServer('/image?id='+$scope.shop.shop_code_id,$scope.imageFile).then(
              function(response){
                $scope.shop.shop_code_id = response.data.msg.image_id;
                updateShop();
              }
          )

      }

    }
  }
}])



shopInformationModule.controller('shopChangePasswordController', ['$scope', '$window', '$location', 'shopInformationService', 
  function ($scope, $window, $location, shopInformationService) {

  $scope.password = {
    'old_password':'',
    'new_password':'',
    'confirm_password':''
  }

  $scope.updatePassword = function () {
 
    if ($scope.password.new_password.length < 6) {
      $scope.errorMessage = '密码至少6个字符'
      return
    }

    if ($scope.password.new_password != $scope.password.confirm_password) {
      $scope.errorMessage = "两次输入的密码不一致"
      return
    }

    shopInformationService.changePassword($scope.password,

      function (response) {
        if (response && response.code == 500) {
          alert(response.msg)
          return
        }
        alert("密码修改成功！请重新登录")
        $window.location.href = 'index.html'
      },
      function (error) {
        $scope.errorMessage = "原密码错误"
      }
    )
  }
}])


