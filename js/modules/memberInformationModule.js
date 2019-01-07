'use strict'
function setActiveRouter(router_str) {
  $('#accordion').find('a[href="#'+router_str+'"] i').css('color','#26a2ff');
}
var memberInformationModule = angular.module('memberInformationModule', ['ngTable', 'checklist-model'])

memberInformationModule.controller('memberInformationListController',
  ['$scope', '$location', 'staffInformationService', 'memberInformationService', 'DataUtilService', 'ngTableParams', '$filter',
    function ($scope, $location, staffInformationService, memberInformationService, DataUtilService, ngTableParams, $filter) {
      $scope.activeMemberStr = '';
      $scope.listFilter = {};
      $scope.phone = '';
      $scope.searchPhone = '';
      var reg = /^1[0-9]{10}$/;
      $scope.search = function () {
        // $scope.listFilter = {};
        if (reg.test($scope.phone)) {
          $scope.listFilter.phone = $scope.phone;
          $scope.listFilter.name = '';
        } else {
          $scope.listFilter.name = $scope.phone;
          $scope.listFilter.phone = '';
        }

        getMemberInformationList();
      }

      var getMemberInformationList = function () {
        memberInformationService.list({
          memberCardId:$scope.activeMemberStr=='all'?'':$scope.activeMemberStr,
          id: localStorage.getItem('shop_id')
        }).$promise.then(function (response) {

          $scope.tableParams = new ngTableParams({
            page: 1,
            count: 10,
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
      }

      getMemberInformationList();

      memberInformationService.memberCardList({
        id: localStorage.getItem('shop_id')
      }, function (response) {
        $scope.memberCardList = response.msg;
      })

      $scope.queryByCarId=function(id){
        $scope.activeMemberStr=id;
       $scope.search();
      }
    }
  ])


memberInformationModule.controller('memberInformationCreateController', ['$scope', '$location', 'memberInformationService', 'DataUtilService',
  function ($scope, $location, memberInformationService, DataUtilService) {

    $scope.MaleOrFemale = DataUtilService.MaleOrFemale;
    $scope.OpenOrClose = DataUtilService.OpenOrClose;

    $scope.warnMessage = "";

    memberInformationService.memberCardList({
      id: localStorage.getItem('shop_id')
    }, function (response) {
      $scope.memberCardList = response.msg;
    })

    $('#datetimepicker1').datetimepicker({
      format: 'yyyy-mm-dd',
      pickerPosition: "bottom-left",
      autoclose: true,
      language: 'zh-CN',
      minView: 2
    });

    $scope.create = function () {
      //$scope.member.sync_status = syncStatus + 1;
      if ($scope.member.pay_password.length < 6) {


        $scope.errorMessage = '密码至少6个字符'
        return
      }

      if ($scope.member.pay_password != $scope.member.confirm_password) {
        $scope.errorMessage = "两次输入的密码不一致"
        return
      }

      $scope.member.balance = 0;
      $scope.member.shop_id = localStorage.getItem('shop_id');
      memberInformationService.create(
        $scope.member,
        function (response) {
          console.log(response)
          if (response.code != 200) {
            alert(response.msg)
            $scope.warnMessage = response.msg;
          } else {
            $location.path('/memberDataentry/memberInformation/recharge/' + response.msg.member_id)
          }
        }
      )
    }

  }
])

memberInformationModule.controller('memberInformationController', ['$scope', '$location', 'memberInformationService', '$routeParams', 'DataUtilService',
  function ($scope, $location, memberInformationService, $routeParams, DataUtilService) {
    $scope.MaleOrFemale = DataUtilService.MaleOrFemale;
    $scope.OpenOrClose = DataUtilService.OpenOrClose;
    var memberInformationId = $routeParams.id;
    $('#datetimepicker1').datetimepicker({
      format: 'yyyy-mm-dd',
      pickerPosition: "bottom-left",
      autoclose: true,
      language: 'zh-CN',
      minView: 2
    });
    memberInformationService.memberCardList({
      id: localStorage.getItem('shop_id')
    }, function (response) {
      $scope.memberCardList = response.msg;
    })
    memberInformationService.view({
      id: memberInformationId
    }, function (response) {
      $scope.member = response.msg;
    })


    $scope.update = function () {

      memberInformationService.update($scope.member,
        function (response) {
          if (response.code != 200) {
            alert("更新失败");
          }
          alert("修改成功");
          $location.path("/memberDataentry/memberInformation");
        }
      )

    }

  }
])

memberInformationModule.controller('memberRechargeController', ['$scope', '$location', 'memberInformationService', '$routeParams', 'DataUtilService', 'PrinterService',
  function ($scope, $location, memberInformationService, $routeParams, DataUtilService, PrinterService) {
    $scope.MaleOrFemale = DataUtilService.MaleOrFemale;
    $scope.OpenOrClose = DataUtilService.OpenOrClose;
    var memberInformationId = $routeParams.id;

    memberInformationService.memberCardList({
      id: localStorage.getItem('shop_id')
    }, function (response) {
      $scope.memberCardList = response.msg;
    })
    memberInformationService.view({
      id: memberInformationId
    }, function (response) {
      $scope.member = response.msg;
    })

    $scope.update = function () {

      if (isNaN($scope.member.amount)) {
        alert('充值金额不合法！');
        return;
      }

      var amount = $scope.member.amount;
      $scope.member.amount = parseFloat($scope.member.giveAmount) + parseFloat($scope.member.amount);
      $scope.member.balance += parseFloat($scope.member.amount);
      console.log($scope.member)
      memberInformationService.update(
        $scope.member,
        function (response) {
          if (response.code != 200) {
            alert("充值失败");
          }
          $location.path("/memberDataentry/memberInformation");
        }
      )
      var rechargeData = {
        member_id: $scope.member.id,
        amount: amount,
        pay_type: $scope.member.pay_type,
        shop_id: localStorage.getItem('shop_id'),
        now_balance: $scope.member.balance,
        giveAmount: $scope.member.giveAmount,
        tradeIntegral: 0,
        integral: $scope.member.integral,
        category: 1,
        type: 11 //,
        //sync_status:syncStatus+1
      };
      memberInformationService.recharge(rechargeData,
        function (response) {
          if (response.code != 200) {
            alert("充值失败");
          }
          alert("充值成功");
          $location.path("/memberDataentry/memberInformation");
          //--------------------------------------
          //if(type=='print'){

          var nowTime = DataUtilService.getNowTime();
          var orderCount = $scope.orderLogList;
          PrinterService.getPrinterByPrinter_type({
              printer_type: 999
            },
            function (response) {

              if (response.code == 200) {
                var printer = response.msg;
                console.log(printer)
                if (printer == null) {
                  alert("未查询到对应打印机");
                  return;
                }

                var LODOP = getCLodop();
                LODOP.SET_LICENSES("", "3E893A594C00D5D9C1DBE7CD18C9E8DB", "C94CEE276DB2187AE6B65D56B3FC2848", "");
                LODOP.PRINT_INITA(1, 1, 700, 600, '商铺_' + localStorage.getItem('shop_id') + "_订单统计报表" + nowTime);

                var printer_name = printer.name;

                var pageWidth = printer.page_width;
                if (pageWidth == null || pageWidth == 0) {
                  alert("打印机名称:" + printer.category_name + "-对应打印机纸张宽度设置不符合要求,请在打印设置中重新设置");
                  return;
                }


                LODOP.SET_PRINT_PAGESIZE(3, pageWidth + 'mm', "", "");

                var flag = LODOP.SET_PRINTER_INDEXA(printer_name);
                if (!flag) {
                  alert("设置打印设备不存在");
                  return;
                }

                LODOP.SET_PRINT_PAGESIZE(3, pageWidth + 'mm', 0, '');

                var top = 1;
                LODOP.ADD_PRINT_TEXT(top + "mm", "10mm", "40mm", "8mm", "     充值凭证");
                LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                LODOP.SET_PRINT_STYLEA(0, "Horient", 2);

                top += 6;
                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "6mm", "操作员:" + localStorage.getItem("name"));

                top += 6;
                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "6mm", "打印时间:" + nowTime);

                top += 6;
                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "6mm", $scope.member.phone + "  充值  " + $scope.member.amount + " 元");


                top += 6;
                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "6mm", "可用余额:" + $scope.member.balance);

                top += 5;
                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - -  - - - -- - - - - -- - - - -");


                //LODOP.PREVIEW();
                LODOP.PRINT();

              } else {
                alert('打印充值凭证失败!');
              }
            }
          )

          //}
          //--------------------------------------
        }
      )

    }

  }
])

memberInformationModule.controller('memberExchangeController', ['$scope', '$location', 'memberInformationService', '$routeParams', 'DataUtilService',
  function ($scope, $location, memberInformationService, $routeParams, DataUtilService) {
    $scope.MaleOrFemale = DataUtilService.MaleOrFemale;
    $scope.OpenOrClose = DataUtilService.OpenOrClose;
    $scope.cutIntegral = "";
    $scope.give = "";

    var memberInformationId = $routeParams.id;

    memberInformationService.memberCardList({
      id: localStorage.getItem('shop_id')
    }, function (response) {
      $scope.memberCardList = response.msg;
    })
    memberInformationService.view({
      id: memberInformationId
    }, function (response) {
      $scope.member = response.msg;
    })

    $scope.update = function () {

      if (isNaN($scope.cutIntegral)) {
        alert('积分格式不正确！');
        return;
      }
      if (parseFloat($scope.member.integral) - parseFloat($scope.cutIntegral) < 0) {
        alert("积分不足！");
        return;
      }
      $scope.member.integral = parseFloat($scope.member.integral) - parseFloat($scope.cutIntegral);
      //  if ($scope.member.sync_status != syncStatus + 1) {
      //      $scope.member.sync_status = syncStatus + 2;
      //  }
      memberInformationService.update($scope.member,
        function (response) {
          if (response.code != 200) {
            alert("兑换失败");
          }
          $location.path("/memberDataentry/memberInformation");
        }
      )
      var rechargeData = {
        member_id: $scope.member.id,
        amount: 0,
        pay_type: 0,
        shop_id: localStorage.getItem('shop_id'),
        now_balance: $scope.member.balance,
        tradeIntegral: $scope.cutIntegral,
        integral: $scope.member.integral,
        category: 2,
        type: 23,
        description: $scope.give //,
        // sync_status:syncStatus+1
      };
      memberInformationService.recharge(rechargeData,
        function (response) {
          if (response.code != 200) {
            alert("兑换失败");
          }
          alert("兑换成功")
          $location.path("/memberDataentry/memberInformation");
        }
      )

    }

  }
])

memberInformationModule.controller('memberChangePasswordController', ['$scope', '$location', 'memberInformationService', '$routeParams', 'DataUtilService',
  function ($scope, $location, memberInformationService, $routeParams, DataUtilService) {
    var memberInformationId = $routeParams.id;

    memberInformationService.view({
      id: memberInformationId
    }, function (response) {
      $scope.member = response.msg;
    })

    $scope.password = {
      'old_password': '',
      'new_password': '',
      'confirm_password': '',
      'id': $routeParams.id
    }

    $scope.updatePassword = function () {

      if ($scope.password.new_password.length < 6) {
        $scope.errorMessage = '密码至少6个字符'
        return
      }
      if (isNaN($scope.password.new_password)) {
        $scope.errorMessage = "密码必须为数字";
        return;
      }
      if ($scope.password.new_password != $scope.password.confirm_password) {
        $scope.errorMessage = "两次输入的密码不一致"
        return
      }
      // if ($scope.password.sync_status != syncStatus + 1) {
      //    $scope.password.sync_status = syncStatus + 2;
      //   }
      memberInformationService.changePassword($scope.password,

        function (response) {
          if (response && response.code == 500) {
            alert(response.msg)
            return
          }
          $location.path('/memberDataentry/memberInformation')

        },
        function (error) {
          $scope.errorMessage = "原密码错误"
        }
      )
    }


  }
])


memberInformationModule.controller('memberPayListController', ['$scope', '$location', 'memberInformationService', 'ngTableParams', '$filter',
  function ($scope, $location, memberInformationService, ngTableParams, $filter) {

    $scope.list = [];
    $scope.category = 1;
    $scope.type = "";
    $scope.type1 = "";
    $scope.type2 = "";
    $scope.phone = "";
    $scope.memberList = [];
    memberInformationService.list({
      id: localStorage.getItem('shop_id')
    }, function (response) {
      $scope.memberList = response.msg;
    })

    $scope.search = function () {
      if ($scope.phone != "" && $scope.phone != null) {
        for (var i = 0; i < $scope.memberList.length; i++) {
          if ($scope.phone == $scope.memberList[i].phone) {
            getMemberPayList($scope.memberList[i].id);
            return;
          }
        }
        alert("查无此会员");
      } else {
        getShopPayList();
      }
    }

    var getShopPayList = function () {
      memberInformationService.payList({
        id: localStorage.getItem('shop_id')
      }).$promise.then(function (response) {
        $scope.list = response.msg;
        $scope.filterShopPayList();
      })
    }
    var getMemberPayList = function (memberId) {
      memberInformationService.memberPayList({
        id: memberId
      }).$promise.then(function (response) {
        $scope.list = response.msg;
        $scope.filterShopPayList();
      })
    }

    $scope.filterShopPayList = function () {

      if ($scope.category == 1) {
        $scope.type = $scope.type1;
      } else {
        $scope.type = $scope.type2;
      }

      var dataList = [];
      if ($scope.type != "") {
        for (var i = 0; i < $scope.list.length; i++) {
          if ($scope.list[i].category != $scope.category || $scope.list[i].type != $scope.type)
            continue;
          dataList.push($scope.list[i]);
        }
      } else {
        for (var i = 0; i < $scope.list.length; i++) {
          if ($scope.list[i].category != $scope.category)
            continue;
          dataList.push($scope.list[i]);
        }
      }

      $scope.tableParams = new ngTableParams({
        page: 1,
        count: 25,
        sorting: {},
        filter: $scope.listFilter
      }, {
        total: 0,
        getData: function ($defer, params) {
          var filteredData = $filter('filter')(dataList, $scope.listFilter);
          var sortedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;

          $scope.dataList = sortedData.slice((params.page() - 1) * params.count(), params.page() * params.count())
          $scope.totalLength = sortedData.length
          params.total(sortedData.length)
          $defer.resolve($scope.dataList)
        }
      })
      $scope.tableParams.settings().$scope = $scope;
      $scope.tableParams.reload();
    }

    getShopPayList();

  }
])


memberInformationModule.controller('cardListController', ['$scope', '$location', 'staffInformationService', 'memberInformationService', 'ngTableParams', '$filter',
  function ($scope, $location, staffInformationService, memberInformationService, ngTableParams, $filter) {

    $scope.listFilter = {};
    $scope.phone = '';
    $scope.searchPhone = '';
    $scope.search = function () {
      $scope.searchPhone = $scope.phone;
    }

    var getMemberInformationList = function () {
      memberInformationService.memberCardList({
        id: localStorage.getItem('shop_id')
      }).$promise.then(function (response) {

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
    }

    getMemberInformationList();

  }
])

memberInformationModule.controller('cardCreateController', ['$scope', '$location', 'memberInformationService', 'DataUtilService',
  function ($scope, $location, memberInformationService, DataUtilService) {

    $scope.warnMessage = "";

    $scope.create = function () {
      $scope.memberCard.shopId = localStorage.getItem('shop_id');
      //$scope.memberCard.sync_status = syncStatus + 1;
      memberInformationService.memberCardCreate($scope.memberCard,
        function (response) {
          if (response.code != 200) {
            alert(response.msg)
            $scope.warnMessage = response.msg;
          } else {
            alert("创建成功")
            $location.path('/memberDataentry/cardList')
          }
        }
      )
    }

  }
])

memberInformationModule.controller('cardViewController', ['$scope', '$location', 'memberInformationService', '$routeParams', 'DataUtilService',
  function ($scope, $location, memberInformationService, $routeParams, DataUtilService) {
    $scope.warnMessage = "";

    var memberCardId = $routeParams.id;

    memberInformationService.memberCardView({
        id: memberCardId
      },
      function (response) {
        $scope.memberCard = response.msg;
        console.log($scope.memberCard)
      }
    )
    //TODO
    $scope.update = function () {
      //   if ($scope.memberCard.sync_status != syncStatus + 1) {
      //        $scope.memberCard.sync_status = syncStatus + 2;
      //   }
      memberInformationService.memberCardUpdate(
        $scope.memberCard,
        function (response) {
          if (response.code != 200) {
            alert("更新失败");
          }
          alert("修改成功")
          $location.path("/memberDataentry/cardList");
        }
      )

    }

  }
])
memberInformationModule.controller('pointsRuleController', ['$scope', '$location', 'memberInformationService', 'DataUtilService',
  function ($scope, $location, memberInformationService, DataUtilService) {

    $scope.warnMessage = "";

    function reflushMemberIntegra() {
      memberInformationService.memberIntegralList({
          id: localStorage.getItem('shop_id')
        },
        function (response) {
          $scope.memberIntegra = response.msg;
          console.log($scope.memberIntegra)
        }
      )
    }
    reflushMemberIntegra();
    //:+\
    $scope.update = function () {
      //	var sync_status;
      //	console.log($scope.memberIntegra.sync_status);
      //	if($scope.memberIntegra.sync_status==undefined){
      //        $scope.memberIntegra.sync_status==11;
      //	}else if ($scope.memberIntegra.sync_status==null||$scope.memberIntegra.sync_status != syncStatus + 1) {
      //       $scope.memberIntegra.sync_status = syncStatus + 2;
      //     }
      $scope.memberIntegra.shopId = localStorage.getItem('shop_id');
      console.log($scope.memberIntegra);
      memberInformationService.memberIntegralUpdate(
        $scope.memberIntegra,
        function (response) {
          if (response.code != 200) {
            alert(response.msg)
            $scope.warnMessage = response.msg;
          } else {
            alert("修改成功")
            reflushMemberIntegra()
          }
        }
      )
    }

  }
])

memberInformationModule.controller('memberIndexController', ['$scope', 'memberInformationService', 'DataUtilService', 'PrinterService','$location',
  function ($scope, memberInformationService, DataUtilService, PrinterService,$location) {

    PrinterService.getPrinterByPrinter_type({
        printer_type: 999
      },
      function (response) {
        if (response.code == 200) {
          console.log(response.msg);
        }
      },
      function (error) {}
    )
    $scope.initRouterActive=function(){
      setActiveRouter($location.$$path);
     }
    $scope.MaleOrFemale = DataUtilService.MaleOrFemale;
    $scope.OpenOrClose = DataUtilService.OpenOrClose;

    memberInformationService.memberCardList({
      id: localStorage.getItem('shop_id')
    }, function (response) {
      $scope.memberCardList = response.msg;
    })

    $scope.searchKeyStr = '';
    $scope.keyboardItmes = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '删除'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '清除'],
      ['Caps', '←', '→', '空格', '输入法', '确定']
    ];

    $('#datetimepicker1').datetimepicker({
      format: 'yyyy-mm-dd',
      pickerPosition: "bottom-left",
      autoclose: true,
      language: 'zh-CN',
      minView: 2
    });

    //键盘键入
    $scope.keyBoardInput = function (str) {
      if (str == '输入法' || str == 'Caps') return;
      var el = document.getElementById('searchKeyInput');
      var pos = $scope.getCursortPosition(el);

      var vx = $scope.searchKeyStr;

      var ary = vx.split('');

      switch (str) {
        case '空格':
          str = ' ';
          ary.splice(pos, 0, str);
          $scope.searchKeyStr = ary.join('');
          break;
        case '删除':
          $scope.searchKeyStr = $scope.searchKeyStr.substring(0, $scope.searchKeyStr.length - 1);
          break;
        case '确定':
          break;
        case '清除':
          $scope.searchKeyStr = '';
          break;
        case '←':
          pos--;
          $scope.setCaretPosition(el, pos);
          break;
        case '→':
          pos++;
          $scope.setCaretPosition(el, pos);
          break;
        default:
          ary.splice(pos, 0, str);
          $scope.searchKeyStr = ary.join('');
          break;
      }
    }
    // 设置光标位置
    $scope.setCaretPosition = function (ctrl, pos) {
      if (ctrl.setSelectionRange) {
        ctrl.focus();
        ctrl.setSelectionRange(pos, pos);
      } else if (ctrl.createTextRange) {
        var range = ctrl.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
      }
    }

    // 获取光标位置
    $scope.getCursortPosition = function (ctrl) {
      var CaretPos = 0; // IE Support
      if (document.selection) {
        ctrl.focus();
        var Sel = document.selection.createRange();
        Sel.moveStart('character', -ctrl.value.length);
        CaretPos = Sel.text.length;
      }
      // Firefox support
      else if (ctrl.selectionStart || ctrl.selectionStart == '0')
        CaretPos = ctrl.selectionStart;
      return (CaretPos);
    }

    //查找会员
    $scope.searchMember = function () {
      console.log($scope.searchKeyStr);
      memberInformationService.getMember({
        id: localStorage.getItem('shop_id'),
        cardNumber: $scope.searchKeyStr
      }, function (res) {
        if (res.code != '200') {
          showMessage('未找到该会员信息');
          return;
        }
        $scope.member = res.msg;
      })
    }


    $scope.isEdit = false;
    //进入新增会员
    $scope.showAddMember = function () {
      $scope.isEdit = false;
      $('#memberFormTitle').text('新建会员');
      $('#addMemberWin').modal('show');
    }

    //执行新增会员
    $scope.create = function () {
      if ($scope.member.pay_password.length < 6) {
        $scope.errorMessage = '密码至少6个字符'
        return
      }

      if ($scope.member.pay_password != $scope.member.confirm_password) {
        $scope.errorMessage = "两次输入的密码不一致"
        return
      }
      if ($scope.isEdit) {
        memberInformationService.update($scope.member,
          function (response) {
            if (response.code != 200) {
              showMessage("更新失败");
            }
            $('#addMemberWin').modal('hide');
            showMessage("修改成功");
          }
        )
      } else {
        $scope.member.balance = 0;
        $scope.member.shop_id = localStorage.getItem('shop_id');
        memberInformationService.create(
          $scope.member,
          function (response) {
            console.log(response)
            if (response.code != 200) {
              alert(response.msg)
              $scope.warnMessage = response.msg;
            } else {
              $('#addMemberWin').modal('hide');
              showMessage('操作成功', 2000, true, 'bounceIn-hastrans', 'bounceOut-hastrans');
            }
          }
        )
      }
    }

    //进入充值消费记录
    $scope.goConsumRecords = function () {
      window.location.href = '#/memberDataentry/memberInformation/payList';
    }

    //进入会员编辑
    $scope.showEditMember = function () {
      if (!$scope.member || !$scope.member.id) {
        showMessage('会员信息不存在');
        return;
      }
      $('#memberFormTitle').text('编辑会员信息');
      $scope.isEdit = true;
      $('#addMemberWin').modal('show');
    }

    //执行会员编辑
    $scope.confirmEditMember = function () {
      if (!$scope.member || !$scope.member.id) {
        showMessage('会员信息不存在');
        return;
      }
      memberInformationService.update($scope.member,
        function (response) {
          if (response.code != 200) {
            showMessage("更新失败");
          }
          showMessage("修改成功");
        }
      )
    }

    //进入会员充值
    $scope.showMemberRecharge = function () {
      if (!$scope.member || !$scope.member.id) {
        showMessage('会员信息不存在');
        return;
      }
      $('#rechargeModal').modal('show');
    }

    //执行会员充值
    $scope.confirmMemberRecharge = function () {
      if (!$scope.member || !$scope.member.id) {
        showMessage('会员信息不存在');
        return;
      }
      if (isNaN($scope.member.amount)) {
        showMessage('充值金额不合法！');
        return;
      }
      var amount = $scope.member.amount;
      $scope.member.amount = parseFloat($scope.member.amount);
      if ($scope.member.giveAmount) {
        $scope.member.amount += parseFloat($scope.member.giveAmount);
      }

      $scope.member.balance += parseFloat($scope.member.amount);
      memberInformationService.update(
        $scope.member,
        function (response) {
          if (response.code != 200) {
            showMessage("充值失败");
          }
        }
      )
      var rechargeData = {
        member_id: $scope.member.id,
        amount: amount,
        pay_type: $scope.member.pay_type,
        shop_id: localStorage.getItem('shop_id'),
        now_balance: $scope.member.balance,
        giveAmount: $scope.member.giveAmount,
        tradeIntegral: 0,
        integral: $scope.member.integral,
        category: 1,
        type: 11 //,
        //sync_status:syncStatus+1
      };
      memberInformationService.recharge(rechargeData,
        function (response) {
          if (response.code != 200) {
            showMessage("充值失败");
          }

          $('#rechargeModal').modal('hide');
          showMessage("充值成功");
          $location.path("/memberDataentry/memberInformation");
          //--------------------------------------
          //if(type=='print'){

          var nowTime = DataUtilService.getNowTime();
          var orderCount = $scope.orderLogList;
          PrinterService.getPrinterByPrinter_type({
              printer_type: 999
            },
            function (response) {

              if (response.code == 200) {
                var printer = response.msg;
                console.log(printer)
                if (printer == null) {
                  showMessage("未查询到对应打印机");
                  return;
                }

                var LODOP = getCLodop();
                LODOP.SET_LICENSES("", "3E893A594C00D5D9C1DBE7CD18C9E8DB", "C94CEE276DB2187AE6B65D56B3FC2848", "");
                LODOP.PRINT_INITA(1, 1, 700, 600, '商铺_' + localStorage.getItem('shop_id') + "_订单统计报表" + nowTime);

                var printer_name = printer.name;

                var pageWidth = printer.page_width;
                if (pageWidth == null || pageWidth == 0) {
                  showMessage("打印机名称:" + printer.category_name + "-对应打印机纸张宽度设置不符合要求,请在打印设置中重新设置");
                  return;
                }


                LODOP.SET_PRINT_PAGESIZE(3, pageWidth + 'mm', "", "");

                var flag = LODOP.SET_PRINTER_INDEXA(printer_name);
                if (!flag) {
                  showMessage("设置打印设备不存在");
                  return;
                }

                LODOP.SET_PRINT_PAGESIZE(3, pageWidth + 'mm', 0, '');

                var top = 1;
                LODOP.ADD_PRINT_TEXT(top + "mm", "10mm", "40mm", "8mm", "     充值凭证");
                LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                LODOP.SET_PRINT_STYLEA(0, "Horient", 2);

                top += 6;
                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "6mm", "操作员:" + localStorage.getItem("name"));

                top += 6;
                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "6mm", "打印时间:" + nowTime);

                top += 6;
                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "6mm", $scope.member.phone + "  充值  " + $scope.member.amount + " 元");


                top += 6;
                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "6mm", "可用余额:" + $scope.member.balance);

                top += 5;
                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - -  - - - -- - - - - -- - - - -");


                //LODOP.PREVIEW();
                LODOP.PRINT();

              } else {
                showMessage('打印充值凭证失败!');
              }
            }
          )

          //}
          //--------------------------------------
        }
      )
    }

    //进入积分兑换
    $scope.showMemberExchange = function () {
      if (!$scope.member || !$scope.member.id) {
        showMessage('会员信息不存在');
        return;
      }
      $('#exchangeModal').modal('show');
    }

    //执行积分兑换
    $scope.confirmMemberExchange = function () {
      if (!$scope.member || !$scope.member.id) {
        showMessage('会员信息不存在');
        return;
      }
      if (isNaN($scope.cutIntegral)) {
        showMessage('积分格式不正确！');
        return;
      }
      if (parseFloat($scope.member.integral) - parseFloat($scope.cutIntegral) < 0) {
        showMessage("积分不足！");
        return;
      }
      $scope.member.integral = parseFloat($scope.member.integral) - parseFloat($scope.cutIntegral);
      //  if ($scope.member.sync_status != syncStatus + 1) {
      //      $scope.member.sync_status = syncStatus + 2;
      //  }
      memberInformationService.update($scope.member,
        function (response) {
          if (response.code != 200) {
            showMessage("兑换失败");
          }
          $location.path("/memberDataentry/memberInformation");
        }
      )
      var rechargeData = {
        member_id: $scope.member.id,
        amount: 0,
        pay_type: 0,
        shop_id: localStorage.getItem('shop_id'),
        now_balance: $scope.member.balance,
        tradeIntegral: $scope.cutIntegral,
        integral: $scope.member.integral,
        category: 2,
        type: 23,
        description: $scope.give //,
        // sync_status:syncStatus+1
      };
      memberInformationService.recharge(rechargeData,
        function (response) {
          if (response.code != 200) {
            showMessage("兑换失败");
          }
          $('#exchangeModal').modal('hide');
          showMessage("兑换成功")
        }
      )
    }

    //停用会员卡
    $scope.discontinueUse = function (event) {
      if (!$scope.member || !$scope.member.id) {
        showMessage('会员信息不存在');
        return;
      }
      var _target = $(event.target);
      var _txt = _target.text();
      var _is_in_use = 0;
      if (_txt == '启用') {
        _is_in_use = 1;
      } else {
        _is_in_use = 0;
      }
      memberInformationService.update_member({
        id: $scope.member.id,
        is_in_use: _is_in_use
      }, function (res) {
        if (res.code == '500') {
          showMessage('停用失败');
          return;
        }
        if (_txt == '启用') {
          _target.text('禁用');
        } else {
          _target.text('启用');
        }
        showMessage('操作成功');
      })
    }

    //退卡
    $scope.withdrawCard = function () {
      memberInformationService.update_member({
        id: $scope.member.id
      }, function (res) {
        if (res.code == '500') {
          showMessage('退卡失败');
          return;
        }

        showMessage('操作成功');
      })
    }

    //删除会员
    $scope.delMember = function () {
      memberInformationService.delete_member({
        id: $scope.member.id
      }, function (res) {
        if (res.code == '500') {
          showMessage('删除失败');
          return;
        }

        showMessage('操作成功');
      })
    }
  }
])
