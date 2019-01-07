'use strict'

var staffInformationModule = angular.module('staffInformationModule', ['ngTable', 'checklist-model'])

staffInformationModule.controller('staffInformationListController', [ '$scope', '$location', 'staffInformationService', 'ngTableParams', '$filter',
  function ($scope,$location, staffInformationService,ngTableParams, $filter) {

    $scope.listFilter = {};
    
      staffInformationService.list().$promise.then(function (response) {
			var data = response.msg;
			for(var i=0;i<data.length;i++){
				var user_keys = data[i].user_key
				var strs= new Array(); //定义一数组
				strs = user_keys.split(","); //字符分割
				var userKeyName = "";
				for(var j=0;j<strs.length;j++){
					if(strs[j]==3){
						userKeyName += "管理员 "
					}else if(strs[j]==4){
						userKeyName += "商铺前台 "
					}else if(strs[j]==5){
						userKeyName += "服务员 "
					}else if(strs[j]==6){
						userKeyName += "后厨 "
					}
				}
				data[i].userKeyName = userKeyName;
			}

        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 25,
            sorting: {},
            filter: $scope.listFilter
          }, {
          total: 0,
          getData: function ($defer, params) {
            var filteredData = $filter('filter')(data, $scope.listFilter);
            var sortedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;

            $scope.dataList = sortedData.slice((params.page() - 1) * params.count(), params.page() * params.count())
            $scope.totalLength = sortedData.length
            params.total(sortedData.length)
            $defer.resolve($scope.dataList)
          }
        })
      })
      
       $scope.updatePassword=function(staff){
       if (!confirm("您确定要重置员工"+staff.name+"的密码吗？"))
          return false;  
            staff.password = "000000";
           /*if (staff.sync_status != syncStatus + 1) {
               staff.sync_status = syncStatus + 2;
           }*/
            staffInformationService.update(staff,
                function(response){
                  if(!response==200){
                    alert("更新失败");
                  }
                  $location.path("/staffDataentry/staffInformation");
                }
            )}
      
  } ])


staffInformationModule.controller('staffInformationCreateController', [ '$scope', '$location', 'staffInformationService','DataUtilService',
  function ($scope, $location, staffInformationService,DataUtilService) {

  $scope.MaleOrFemale = DataUtilService.MaleOrFemale;
  $scope.OpenOrClose = DataUtilService.OpenOrClose;

  $scope.warnMessage = "";
    $scope.create = function () {
		var reg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
		if(!reg.test($scope.staff.phone)){
			alert("手机号格式不正确");
			return;
		}
		var str = "";
		$("input[name='user_key']").each(function() {
			if ($(this).prop('checked') ==true) {
				if($(this).val()==7){
					str += '3,'+$(this).val()+',';
				}else {
					str += $(this).val()+',';
				}
			}
		});
		if(str==""){
			alert("请选择身份！");
			return;
		}
		str=(str.substring(str.length-1)==',')?str.substring(0,str.length-1):str;
		$scope.staff.user_key = str;
		$scope.staff.shop_id = localStorage.getItem('shop_id');
        //$scope.staff.sync_status = syncStatus + 1;
		staffInformationService.create($scope.staff,
			function(response){
				if(response.code!=200){
					alert(response.msg);
					return;
				}
				alert("创建成功")
				$location.path("/staffDataentry/staffInformation");
			}
		)
    }

  }])

  staffInformationModule.controller('staffInformationController', [ '$scope', '$location', 'staffInformationService', '$routeParams','DataUtilService',
  function ($scope, $location, staffInformationService, $routeParams,DataUtilService) {
    
	$scope.MaleOrFemale = DataUtilService.MaleOrFemale;
    $scope.OpenOrClose = DataUtilService.OpenOrClose;
    
	var staffInformationId = $routeParams.id;
	$scope.role = [];
    staffInformationService.view({id:staffInformationId},function(response){
		$scope.staff = response.msg;
		$("input[name='user_key']").each(function() {
			if (JSON.stringify($scope.staff.user_key).indexOf($(this).val())!=-1) {
				$(this).prop('checked',true);
			}

		});
		
    })
  
    $scope.update=function(){
		var reg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
		if(!reg.test($scope.staff.phone)){
			alert("手机号格式不正确");
			return;
		}
		var str = "";
		$("input[name='user_key']").each(function() {
			if ($(this).prop('checked') ==true) {
				if($(this).val()==7){
					str += '3,'+$(this).val()+',';
				}else {
					str += $(this).val()+',';
				}
			}
		});
		if(str==""){
			alert("请选择身份！");
			return;
		}
		str=(str.substring(str.length-1)==',')?str.substring(0,str.length-1):str;
		$scope.staff.user_key = str;
		staffInformationService.update($scope.staff,
			function(response){
				if(response.code!=200){
					alert(response.msg);
					return;
				}
				alert("修改成功")
				$location.path("/staffDataentry/staffInformation");
			}
		)
    }


}])

  staffInformationModule.controller('staffChangePasswordController', [ '$scope', '$location', 'staffInformationService', '$routeParams','DataUtilService',
  function ($scope, $location, staffInformationService, $routeParams,DataUtilService) {
    
  $scope.password = {
    'old_password':'',
    'new_password':'',
    'confirm_password':'',
	'id': $routeParams.id
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

    staffInformationService.changePassword($scope.password,

      function (response) {
        if (response && response.code == 500) {
          alert(response.msg)
          return
        }
        $location.path('/staffDataentry/staffInformation')

      },
      function (error) {
        $scope.errorMessage = "原密码错误"
      }
    )
  }


}])