'use strict'

var profileModule = angular.module('profileModule', ['ui.bootstrap'])


profileModule.controller('changePasswordController', ['$scope', '$window', '$location', 'ProfileService', function ($scope, $window, $location, ProfileService) {
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

    ProfileService.changePassword(
      $scope.password,
      function (response) {
        if (response && response.code == 500) {
          alert(response.msg)
          return
        }

        $location.path('/profile/change-password-success')
      },
      function (error) {
        $scope.errorMessage = JSON.stringify(error)
      }
    )
  }
}])
