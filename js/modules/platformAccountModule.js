'use strict'

var platformAccountModule = angular.module('platformAccountModule', ['ui.bootstrap'])

platformAccountModule.controller('plantformChangePasswordController', ['$scope', '$window', '$location', 'PlatformAccountService', function ($scope, $window, $location, PlatformAccountService) {
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

    PlatformAccountService.changePassword( $scope.password,
      function (response) {
        if (response && response.code == 500) {
          alert(response.msg)
          return
        }

        alert("密码修改成功！请重新登录")
        $window.location.href = 'index.html'

      },
      function (error) {
        $scope.errorMessage = JSON.stringify(error)
      }
    )
  }
}])
