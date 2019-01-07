'use strict'

var agentInformationModule = angular.module('agentInformationModule', ['ngTable', 'checklist-model'])

agentInformationModule.controller('agentInformationListController', [ '$scope', '$location', 'agentInformationService', 'ngTableParams', '$filter',
  function ($scope,$location, agentInformationService,ngTableParams, $filter) {

    $scope.listFilter = {};
    
      agentInformationService.list().$promise.then(function (response) {
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
      
       $scope.updatePassword=function(agent){
       if (!confirm("您确定要重置"+agent.company_name+"代理商的密码吗？"))
          return false;  
            agent.password = "000000";    
            agentInformationService.update(agent,
                function(response){
                  if(response.code!=200){
                    alert("更新失败");
					return;
                  }
				  alert("修改成功")
                  $location.path("/agentDataentry/agentInformation");
                }
            )}
      
  } ])


agentInformationModule.controller('agentInformationCreateController', [ '$scope', '$location', 'agentInformationService','DataUtilService',
  function ($scope, $location, agentInformationService,DataUtilService) {

  $scope.MaleOrFemale = DataUtilService.MaleOrFemale;
  $scope.OpenOrClose = DataUtilService.OpenOrClose;
  $scope.agent1={
	  password:""
  }
  $scope.warnMessage = "";

  var reg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;

    $scope.create = function () {

		if(!reg.test($scope.agent1.phone)){
			alert("手机号格式不正确");
			return;
		}
		$scope.agent1.user_key = "2";

		agentInformationService.create($scope.agent1,
			function(response){
				if(response.code!=200){
                 //alert("创建失败")
                 $scope.warnMessage = response.msg;
				 return;
				}else{
					alert("创建成功")
					var url = '#/agentDataentry/agentPay/Parameters?id='+response.msg.agent_id;
					window.location.href = url;
				}
			}
		)
    }

  }])

  agentInformationModule.controller('agentInformationController', [ '$scope', '$location', 'agentInformationService', '$routeParams','DataUtilService',
  function ($scope, $location, agentInformationService, $routeParams,DataUtilService) {
    
	$scope.MaleOrFemale = DataUtilService.MaleOrFemale;
    $scope.OpenOrClose = DataUtilService.OpenOrClose;
    
	var agentInformationId = $routeParams.id;
	var reg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    agentInformationService.view({id:agentInformationId},function(response){
		$scope.agent = response.msg;
    })
  
    $scope.update=function(){
		if(!reg.test($scope.agent.phone)){
			alert("手机号格式不正确");
			return;
		}
		agentInformationService.update($scope.agent,
			function(response){
				if(response.code!=200){
					alert("修改失败");
					return;
				}
				alert("修改成功")
				$location.path("/agentDataentry/agentInformation");
			}
		)
    }


}])

  agentInformationModule.controller('agentChangePasswordController', ['$scope', '$window', '$location', 'agentInformationService', 
	function ($scope, $window, $location, agentInformationService) {

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

    agentInformationService.changePassword($scope.password,

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