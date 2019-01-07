'use strict'

function setActiveRouter(router_str) {
    $('#accordion').find('a[href="#' + router_str + '"] i').css('color', '#26a2ff');
}

var tableOperateModule = angular.module('tableOperateModule', ['ngTable', 'checklist-model'])

tableOperateModule.controller('tableOperateListController',
    ['$scope', '$location', '$interval', 'tableOperateService', '$timeout', 'PrinterService', 'lotteryService', 'Dining_tableService', 'CategoryService', 'ProductService', 'syncService', 'shopInformationService', 'memberInformationService', 'DataUtilService', '$routeParams',
        function ($scope, $location, $interval, tableOperateService, $timeout, PrinterService, lotteryService, Dining_tableService, CategoryService,
                  ProductService, syncService, shopInformationService, memberInformationService, DataUtilService, $routeParams
        ) {
            $scope.programBar = function () {
                $('#myModal_programBar').modal('show');
            }
            $scope.initRouterActive = function () {
                setActiveRouter($location.$$path);
            }

            $scope.nowKey = localStorage.getItem('now_keys');
            $scope.callServiceList = [];
            $scope.isAdd = 0;

            $scope.getSearchTabParam = function (isTurn) {
                if (isTurn) {
                    return {
                        regionId: $scope.turnCurrentActiveRegion ? $scope.turnCurrentActiveRegion.id : '',
                        seatingNumber: $scope.turnTbActiveSeat ? $scope.turnTbActiveSeat.value : ''
                    }
                } else {
                    return {
                        regionId: $scope.currentActiveRegion ? $scope.currentActiveRegion.id : '',
                        seatingNumber: $scope.activeSeat ? $scope.activeSeat.value : ''
                    }
                }
            }

            //list页面获取桌位列表
            tableOperateService.tableList($scope.getSearchTabParam(),
                function (response) {
                    if (response.code == 500) {
                        alert('获取桌位列表失败')
                        return;
                    }
                    $scope.diningTableList = response.msg;
                    $scope.turnDiningTableList = response.msg;
                    // var _regions=[];
                    // _regions.push({id:-1,name:'全部',shopId:null});
                    // _regions=_regions.concat(response.msg.regionList);
                    // $scope.regionList=_regions;

                },
                function (error) {
                }
            );

            $scope.regionList = [];
            $scope.seatList = [{
                name: '全部',
                value: ''
            }];
            tableOperateService.getTableBaseData({},
                function (response) {
                    if (response.code == 500) {
                        alert('获取基础数据异常')
                        return;
                    }
                    var _regions = [];
                    _regions.push({
                        id: '',
                        name: '全部',
                        shopId: null
                    });
                    $scope.currentActiveRegion = _regions[0];
                    $scope.turnCurrentActiveRegion = _regions[0];
                    _regions = _regions.concat(response.msg.regionList);
                    $scope.regionList = _regions;
                    if (response.msg.seatingNumbers) {
                        $(response.msg.seatingNumbers).each(function (idx, n) {
                            $scope.seatList.push({
                                name: n + '人桌',
                                value: n
                            });
                        })

                        $scope.activeSeat = $scope.seatList[0];
                        $scope.turnTbActiveSeat = $scope.seatList[0];
                    }
                },
                function (error) {
                }
            );

            tableOperateService.resetOrderPno({},
                function (response) {
                    if (response.code == 500) {
                        alert('桌位订单合并桌台失败')
                    }
                    ;
                }
            )

            tableOperateService.callServiceList({},
                function (response) {
                    if (response.code == 500) {
                        //alert('获取呼叫服务列表失败')
                        return
                    }
                    $scope.callServiceList = response.msg
                },
                function (error) {
                }
            );
            //loop
            var tableInitialization = function () {
                tableOperateService.tableList({},
                    function (response) {
                        if (response.code == 500) {
                            alert('获取桌位列表失败')
                            return
                        }
                        $scope.diningTableList = response.msg
                    },
                    function (error) {
                    }
                );

                tableOperateService.callServiceList({},
                    function (response) {
                        if (response.code == 500) {
                            alert('获取呼叫服务列表失败')
                            return
                        }
                        $scope.callServiceList = response.msg
                    },
                    function (error) {
                    }
                );
            }
            // var timeout_upd = $interval(tableInitialization, 2000);
            // $scope.$on('$destroy',function(){
            // 	$interval.cancel(timeout_upd);
            // })
            $scope.isSubmit = 0;
            $scope.selectTable = {};

            //开台
            $scope.openStage = function () {
                if (!$scope.selectTable.id || $scope.selectTable.status != 0) {
                    showMessage('请选择空闲桌位');
                    return;
                }
                $('#openMyTable').modal('show');
            }

            //选中桌位
            $scope.showSelectedTable = function (event, table) {
                $scope.selectTable = table;
                if (!table.orderId) return;
                tableOperateService.orderDetailById({
                    id: table.orderId
                }, function (response) {
                    $scope.orderDetail = response.msg;
                    $scope.mergerTableOrderList = [response.msg];
                })
            }

            //就餐人数
            $scope.mealNumber = 0;
            //开台备注
            $scope.remark = '';
            //确认开台
            $scope.confirmOpenTable = function (isMeal) {
                $scope.mealNumber = parseFloat($('#txt_mealNumber').val());
                if (isNaN($scope.mealNumber) || $scope.mealNumber == 0 || $scope.mealNumber > $scope.selectTable.seating_number) {
                    showMessage('请输入有效范围座位数');
                    return;
                }
                var data = {
                    diningTableName: $scope.selectTable.name,
                    dining_table_id: $scope.selectTable.id,
                    mealNumber: $scope.mealNumber,
                    openTableRemark: $scope.remark,
                    serial_id: $scope.selectTable.name,
                    shopId: localStorage.getItem('shop_id'),
                    table_runner: localStorage.getItem('name')
                };
                tableOperateService.openTable({}, data,
                    function (response) {
                        if (response.code != 200) {
                            alert(response.msg);
                            return;
                        }
                        $('#openMyTable').modal('hide');
                        if (isMeal) {
                            window.location.href = "#addOrder/" + response.msg.id + '/0';
                        } else {
                            $scope.selectTable = {};
                            showMessage('开桌成功', 2000, true, 'bounceIn-hastrans', 'bounceOut-hastrans');
                            tableInitialization();
                        }
                    }
                )
            }

            //桌位双击
            $scope.showModal = function (event, table) {
                //就餐人数
                $scope.mealNumber = 0;
                //开台备注
                $scope.remark = '';
                var offset = $(event.target).parent().offset();
                $scope.selectTable = table;
                $scope.isAdd = 0;
                for (var i = 0; i < $scope.callServiceList.length; i++) {
                    if ($scope.callServiceList[i].dining_table_id == $scope.selectTable.id &&
                        $scope.callServiceList[i].service_type == 0) {
                        $scope.isAdd = 1;
                    }
                }
                if (table.status == 0) {
                    //$scope.openTable($scope.selectTable.id);
                    $('#openMyTable').modal('show');
                } else if (table.status == 1 || table.status == 2 || table.status == 4) {
                    window.location.href = '#addOrder/' + table.orderId + '/0';
                }
            }

            $scope.activeWinMenu = function (event, table) {

                $scope.selectTable = table;
                $scope.isAdd = 0;
                for (var i = 0; i < $scope.callServiceList.length; i++) {
                    if ($scope.callServiceList[i].dining_table_id == $scope.selectTable.id &&
                        $scope.callServiceList[i].service_type == 0) {
                        $scope.isAdd = 1;
                    }
                }
                var offset = $(event.target).parent().offset();
                var chaju = $(window).height() - offset.top;

                var _top = offset.top + 73;
                var _left = offset.left + 101;
                if (chaju < 420) {
                    _top = offset.top - 250;
                }
                $('#table_win_menu').css({
                    'left': _left,
                    'top': _top
                }).show();
                window.event.stopPropagation();
                window.event.preventDefault();
            }

            $scope.changeSelectTable = null;

            //选择要转桌的目标桌位
            $scope.changeTurnTableItem = function (item) {
                $scope.changeSelectTable = item;
            }

            //选择要合并结账的桌位
            $scope.changeMergerItem = function (item) {
                if (item.isMergerSettle) {
                    item.isMergerSettle = !item.isMergerSettle;
                } else {
                    item.isMergerSettle = true;
                }
                //$scope.mergerSelectTable = item;
            }

            //清除使用会员优惠
            $scope.clearUseMember = function () {
                $('#txt_memberno').val('');
                $('#txt_member_discount').val('');
                $('#txt_balance').val('');
                $('#txt_member_integer').val('');
                $scope.member = null;
                $('#sp_sf_money').text($('#sp_discountedMoney').text());
                $('#pay_item_area p:first span').text($('#sp_discountedMoney').text());
                $scope.calcuIsUseMember(false);
            }

            //获取菜品金额、应付金额------------
            $scope.getCpTotal = function (type) {
                let total = 0;
                if (!$scope.mergerTableOrderList) {
                    return total;
                }
                if (type == 1) {
                    $scope.mergerTableOrderList.forEach(_parent => {
                        if (_parent.is_out == true) return;
                        _parent.loi.forEach(function (item, idx) {
                            total += (item.isUseMemberMlMoney ? item.isUseMemberMlMoney : (item.quantity * item.p.unit_price));
                        })

                    })
                } else {
                    $scope.mergerTableOrderList.forEach(_parent => {
                        _parent.loi.forEach(function (item, idx) {
                            total += (item.quantity * (item.p.is_promotion ? item.p.promotion_price : item.p.unit_price));
                        })

                    })
                }
                return total;
            }

            //根据是否使用会员优惠------------
            $scope.calcuIsUseMember = function (isUseMember) {
                if (!$scope.mergerTableOrderList) {
                    return total;
                }
                if (isUseMember) {
                    $scope.mergerTableOrderList.forEach(_parent => {
                        _parent.loi.forEach(function (item, idx) {
                            if (item.p.isUseMemberPrice) {
                                item.isUseMemberMlMoney = item.quantity * item.p.memberPrice;
                            } else if (item.p.isMemberDiscount) {
                                item.isUseMemberMlMoney = item.quantity * item.p.unit_price * $scope.member.memberCardDiscount;
                            }
                        })
                    })
                } else {
                    $scope.mergerTableOrderList.forEach(_parent => {
                        _parent.loi.forEach(function (item, idx) {
                            item.isUseMemberMlMoney = (item.quantity * (item.p.is_promotion ? item.p.promotion_price : item.p.unit_price));
                        })
                    })
                }
                var total = $scope.getCpTotal(1);
                $('#sp_discountedMoney').text(total);
                $('#sp_sf_money').text(total);
            }

            //统计每桌合计
            $scope.getSubCpTotal = function (datas) {
                let total = 0;
                if (!datas) {
                    return total;
                }
                datas.forEach(function (item, idx) {
                    total += (item.isUseMemberMlMoney ? item.isUseMemberMlMoney : (item.quantity * item.p.unit_price));
                })
                return total;
            }

            //收起、展开
            $scope.collapseFun = function (item) {
                if (item.isCollapse) {
                    item.isCollapse = !item.isCollapse;
                } else {
                    item.isCollapse = true;
                }
            }

            //确认合并结账
            $scope.confirmMergerSettleAcc = function () {
                var mergerTables = $scope.turnDiningTableList;
                var _subTableIds = [];
                mergerTables.forEach(_tab => {
                    if (_tab.status == 2 && _tab.isMergerSettle && _tab.orderId != $scope.selectTable.orderId && _tab.is_out == 0) {
                        _subTableIds.push(_tab.orderId);
                    }
                })
                if (_subTableIds.length == 0) {
                    showMessage('至少选择一个合并子桌位');
                    return;
                }
                var data = {
                    shopId: localStorage.getItem('shop_id'),
                    orderPid: $scope.selectTable.orderId,
                    orderIdList: _subTableIds
                };
                tableOperateService.mergeOrder(data,
                    function (response) {
                        if (response.code == 500) {
                            showMessage('合并失败')
                            return
                        }

                        $('#table_win_menu').hide();
                        $('#mergerSettleAcc').modal('hide');
                        tableOperateService.orderlist({
                            id: data.orderPid
                        }, function (response) {
                            if (response.code != '200') {
                                showMessage('获取合并后的订单列表失败');
                                return;
                            }

                            $scope.mergerTableOrderList = response.msg;

                            $scope.settleAccounts();
                        })
                    },
                    function (error) {
                    }
                );

            }

            //菜单操作
            $scope.execCommonMenuFun = function (event) {
                var $this = $(event.target).parent();
                if (!$this.hasClass('win-menu-enable')) return;
                var key = $this.attr('key');
                var router = $this.attr('router');
                switch (key) {
                    case 'opentable':
                        $('#openMyTable').modal('show');
                        break;
                    case 'addorder':
                        window.location.href = router + $scope.selectTable.orderId + '/0';
                        break;
                    case 'payorder':
                        showMessage('请稍候．．．');
                        tableOperateService.orderDetailById({
                            id: $scope.selectTable.orderId
                        }, function (response) {
                            $scope.mergerTableOrderList = [response.msg];
                            $('#table_win_menu').hide();
                            $scope.orderDetail = response.msg;
                            $scope.settleAccounts();
                            $('#manual_settle_wrap tr td:first').click();
                        })
                        return;
                        break;
                    case 'servinglist':
                    case 'orderdetail':
                    case 'printerorder':
                        window.location.href = router + $scope.selectTable.orderId;
                        break;
                    case 'mergetable':
                        $scope.mergerTableOrderList = [];
                        $('#table_win_menu').hide();
                        $('#mergerSettleAcc').modal('show');
                        return;
                        break;
                    case 'changetable':
                        $('#trunTable').modal('show');
                        break;
                    case 'ordertake':
                        $scope.orderTake();
                        break;
                    case 'cleartable':
                        $scope.clearTable();
                        break;
                    default:
                        break;
                }
                $('#table_win_menu').hide();
            }


            var getOrderDetail = function (id) {
                tableOperateService.orderDetail({
                        id: id
                    },
                    function (response) {
                        if (response.code == 500) {
                            alert('获取订单详情失败')
                            return
                        }
                        var orderDetail = response.msg;
                        var totalQuantity = 0;
                        var totalPrice = 0;

                        for (var i = 0; i < orderDetail.loi.length; i++) {

                            if (orderDetail.loi[i].is_lottery == 1) {
                                continue;
                            }
                            if (orderDetail.loi[i].status_id == 6) {
                                continue;
                            }
                            if (orderDetail.loi[i].status_id == 7) {
                                continue;
                            }
                            totalQuantity += orderDetail.loi[i].quantity;
                            if (orderDetail.loi[i].p.is_promotion == 1) {
                                totalPrice += orderDetail.loi[i].p.promotion_price * orderDetail.loi[i].quantity;
                            } else {
                                totalPrice += orderDetail.loi[i].p.unit_price * orderDetail.loi[i].quantity;
                            }
                        }
                        $scope.orderDetail = orderDetail;
                        $scope.totalQuantity = totalQuantity;
                        $scope.totalPrice = totalPrice;
                    },
                    function (error) {
                    }
                )
            }

            $scope.tableInf = {};

            //转桌
            $scope.changeTable = function (table) {
                if (!confirm("您确定要转至" + table.name + "吗？"))
                    return;

                tableOperateService.tableView({
                        id: table.id
                    },
                    function (response) {
                        if (response.code == 500) {
                            alert('获取桌位信息失败')
                            return
                        }
                        $scope.tableInf = response.msg;

                        tableOperateService.zhuanZhuo({
                            fromDiningTableId: $scope.selectTable.id,
                            toDiningTableId: $scope.tableInf.id
                        }, function (res) {
                            if (res.code == 500) {
                                alert('提交失败')
                                return
                            }
                            tableInitialization();
                            $('#trunTable').modal('hide');
                            showMessage('转桌成功', 2000, true, 'bounceIn-hastrans', 'bounceOut-hastrans');
                        })
                    })

                return;
                tableOperateService.tableView({
                        id: table.id
                    },
                    function (response) {
                        if (response.code == 500) {
                            alert('获取桌位信息失败')
                            return
                        }
                        $scope.tableInf = response.msg;
                        //getOrderDetail(table.id);
                        //$scope.selectTable = $scope.changeSelectTable;
                        var sum = 3;
                        var count = 0;

                        for (var i = 0; i < $scope.callServiceList.length; i++) {
                            if ($scope.callServiceList[i].dining_table_id == $scope.tableInf.id) {
                                $scope.callServiceList[i].dining_table_id = $scope.selectTable.id;
                                $scope.callServiceList[i].serial_id = $scope.selectTable.name;
                                tableOperateService.callServiceUpdate($scope.callServiceList[i],
                                    function (response) {
                                        if (response.code == 500) {
                                            alert('失败')
                                            return
                                        }
                                    },
                                    function (error) {
                                    }
                                );
                            }
                        }

                        $scope.tableInf.status = $scope.selectTable.status;
                        $scope.selectTable.status = 0;
                        tableOperateService.tableUpdate($scope.selectTable,
                            function (response) {
                                if (response.code == 500) {
                                    alert('提交失败')
                                    return
                                }
                                count++;
                                if (count == sum)
                                    window.location.href = "#tableOperate/list";
                            },
                            function (error) {
                            }
                        );
                        tableOperateService.tableUpdate($scope.tableInf,
                            function (response) {
                                if (response.code == 500) {
                                    alert('提交失败')
                                    return
                                }
                                tableInitialization();
                                $('#trunTable').modal('hide');
                                showMessage('转桌成功', 2000, true, 'bounceIn-hastrans', 'bounceOut-hastrans');
                                count++;
                                if (count == sum)
                                    window.location.href = "#tableOperate/list";
                            },
                            function (error) {
                            }
                        );
                        var data = {
                            id: $scope.orderDetail.id,
                            shop_id: $scope.orderDetail.shop_id,
                            serial_id: $scope.selectTable.name,
                            dining_table_id: $scope.selectTable.id,
                            loi: null,
                            status_id: 0
                        };
                        tableOperateService.orderUpdate(data,
                            function (response) {
                                if (response.code == 500) {
                                    alert('提交失败')
                                    return
                                }
                                count++;
                                if (count == sum)
                                    window.location.href = "#tableOperate/list";
                            },
                            function (error) {
                            }
                        );
                    },
                    function (error) {
                    }
                );
            }

            $scope.remind = function () {
                localStorage.setItem("is_remind", '0');
                $('#myModal_memberBirth').modal('hide');
            }

            function remindMemberBirth() {
                var is_remind = localStorage.getItem("is_remind");
                if (is_remind == 1) {
                    memberInformationService.birth({},
                        function (response) {
                            if (response.code == 200) {
                                $scope.memberBirthList = response.msg;
                                if ($scope.memberBirthList.length > 0 && $scope.nowKey == 4) {
                                    $('#myModal_memberBirth').modal('show')
                                }
                            }
                        })
                }
            }

            remindMemberBirth();


            $scope.test33 = function () {
                $('#myModal_memberBirth').modal('show')
            }

            //开桌
            $scope.openTable = function (tableId) {
                var data = {
                    diningTableName: $scope.selectTable.name,
                    dining_table_id: $scope.selectTable.id,
                    mealNumber: $scope.selectTable.seating_number,
                    openTableRemark: '',
                    serial_id: $scope.selectTable.name,
                    shopId: localStorage.getItem('shop_id'),
                    table_runner: localStorage.getItem('name')
                };
                var isResponse = 0;
                tableOperateService.openTable({
                        diningTableId: $scope.selectTable.id
                    },
                    data,
                    function (response) {
                        if (response.code != 200) {
                            alert(response.msg);
                            return;
                        }
                        showMessage('开桌成功', 2000, true, 'bounceIn-hastrans', 'bounceOut-hastrans');
                        isResponse = 1;
                        tableInitialization();
                    }
                )
                $('#openTable').attr('disabled', true);
                var loop = 0;
                // var interval= $interval(function() {
                // 	console.log("循环"+loop+"秒")
                // 	if(loop==5||isResponse==1){
                // 		if(loop==5&&isResponse!=1){
                // 			alert("5秒内未收到开桌响应,请检查网络状况")
                // 		}
                // 		$scope.isSubmit = 0;
                // 		$('#openTable').attr('disabled',false);
                // 		tableInitialization();
                // 		$('#myModal').modal('hide');
                // 		$interval.cancel(interval);
                // 	}
                // 	loop++;
                // }, 1000);
            }

            $scope.hideRightMenu = function () {
                $('#table_win_menu').hide();
            }

            //清台
            $scope.clearTable = function () {
                $('#openTable').attr('disabled', false);

                $scope.isSubmit = 0;
                //  if (!confirm("确定对" + $scope.selectTable.name + "进行清台吗？")) {
                //    return;
                //  }

                tableOperateService.clearDiningTable({
                        id: $scope.selectTable.id
                    },
                    function (response) {
                        if (response.code != 200) {
                            showMessage("清桌失败");
                            return;
                        }
                        $('#confirmDialog').modal('hide');
                        showMessage('清桌成功', 2000, true, 'bounceIn-hastrans', 'bounceOut-hastrans');
                        tableInitialization();
                    }
                )

                $('#myModal').modal('hide')
            }

            //点餐
            $scope.addOrder = function () {
                if (!$scope.selectTable || !$scope.selectTable.id) {
                    showMessage('请选择开桌桌位');
                    return;
                }
                window.location.href = '#addOrder/' + $scope.selectTable.orderId + '/0';
            }
            var shop = {};
            shopInformationService.view({
                    id: localStorage.getItem("shop_id")
                },
                function (response) {
                    if (response.code == 200) {
                        shop = response.msg;
                        //console.log(shop);
                    } else {
                        alert("printerOrderController_shopInformationService.view");
                    }
                },
                function (error) {
                }
            );

            //打印订单
            $scope.printerOrder = function () {
                if (!$scope.selectTable.id || !$scope.orderDetail || $scope.orderDetail.loi.length == 0) {
                    showMessage("请选择已就餐桌位");
                    return;
                }
                var service_charge = shop.service_charge;
                PrinterService.getPrinterByPrinter_type({
                        printer_type: 999
                    },
                    function (response) {
                        if (response.code == 200) {

                            var nowTime = DataUtilService.getNowTime();
                            var printer = response.msg;

                            var LODOP = getCLodop();
                            LODOP.SET_LICENSES("", "3E893A594C00D5D9C1DBE7CD18C9E8DB", "C94CEE276DB2187AE6B65D56B3FC2848", "");
                            LODOP.PRINT_INITA(1, 1, 700, 600, '商铺' + localStorage.getItem('shop_id') + '_对账单');

                            var printer_name = printer.name;

                            var pageWidth = printer.page_width;
                            if (pageWidth == null || pageWidth == 0) {
                                alert("纸张宽度不能为空或零");
                                return;
                            }
                            LODOP.SET_PRINT_PAGESIZE(3, pageWidth + "mm", "", "");


                            //var flag = LODOP.SET_PRINTER_INDEXA('XP-80C');
                            var flag = LODOP.SET_PRINTER_INDEXA(printer_name);
                            if (flag) {
                                var top = 1;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "4mm", pageWidth + "mm", "8mm", "预打单");
                                LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                                LODOP.SET_PRINT_STYLEA(0, "Horient", 2);
                                LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                                LODOP.SET_PRINT_STYLEA(0, "FontSize", 15);

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "订单编号:" + $scope.orderDetail.order_no);

                                /*top+=5;
                 LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","4mm", "桌位:"+$scope.orderDetail.serial_id);	*/

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "收款员:" + localStorage.getItem("name"));

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "结账时间:" + nowTime);

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - -- - - - - - - - -- - -- - ");

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "品名");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "42%", "100%", "6mm", "单价");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "62%", "100%", "6mm", "数量");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "81%", "100%", "6mm", "金额");

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - -- - - - - - - - -- - -- - ");

                                var totalMemberMoney = 0.00;

                                var totalMoney = 0.00;
                                var payableMoney = 0.00;
                                var totalServiceMoney = 0.00;

                                var printerList = [];
                                $scope.orderList = [$scope.orderDetail];
                                for (var l = 0; l < $scope.orderList.length; l++) {
                                    printerList = $scope.orderList[l].loi;
                                    top += 2;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", " ");
                                    top += 5;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", "桌位:" + $scope.orderList[l].serial_id + ($scope.orderList[l].length > 1 && k == 0 ? "[主订单]" : ""));

                                    //分类


                                    var orderItemList = printerList;

                                    //排序
                                    function compare(property) {
                                        return function (a, b) {
                                            var value1 = a[property];
                                            var value2 = b[property];
                                            return value1 - value2;
                                        }
                                    }

                                    orderItemList.sort(compare('category_id'));

                                    var total = 0.00;
                                    var payable = 0.00;
                                    var totalMemberPrice = 0.00;
                                    //category分组
                                    var category_orderItemList = []
                                    var orderItemList_category = [];

                                    for (var i = 0; i < orderItemList.length; i++) {

                                        if (i == 0 || orderItemList[i].category_id == orderItemList[i - 1].category_id) {


                                            category_orderItemList.push(orderItemList[i]);

                                            if (i == orderItemList.length - 1) {
                                                category_orderItemList.sort(compare('product_id'));
                                                orderItemList_category.push(category_orderItemList);
                                            }


                                            total += orderItemList[i].p.is_promotion == 1 ? orderItemList[i].quantity * orderItemList[i].p.promotion_price : orderItemList[i].quantity * orderItemList[i].p.unit_price
                                            if (orderItemList[i].is_lottery != 1 && orderItemList[i].status_id != 6 && orderItemList[i].status_id != 7) {
                                                payable += orderItemList[i].p.is_promotion == 1 ? orderItemList[i].quantity * orderItemList[i].p.promotion_price : orderItemList[i].quantity * orderItemList[i].p.unit_price
                                                //会员价
                                                if (orderItemList[i].p.is_promotion == 1) {

                                                    totalMemberPrice += orderItemList[i].p.promotion_price * orderItemList[i].quantity;

                                                } else if (orderItemList[i].p.isUseMemberPrice == 1) {

                                                    totalMemberPrice += orderItemList[i].p.memberPrice * orderItemList[i].quantity;

                                                } else {
                                                    totalMemberPrice += orderItemList[i].p.unit_price * orderItemList[i].quantity;
                                                }
                                            }

                                        } else {

                                            total += orderItemList[i].p.is_promotion == 1 ? orderItemList[i].quantity * orderItemList[i].p.promotion_price : orderItemList[i].quantity * orderItemList[i].p.unit_price
                                            if (orderItemList[i].is_lottery != 1 && orderItemList[i].status_id != 6 && orderItemList[i].status_id != 7) {
                                                payable += orderItemList[i].p.is_promotion == 1 ? orderItemList[i].quantity * orderItemList[i].p.promotion_price : orderItemList[i].quantity * orderItemList[i].p.unit_price
                                                //会员价
                                                if (orderItemList[i].p.is_promotion == 1) {

                                                    totalMemberPrice += orderItemList[i].p.promotion_price * orderItemList[i].quantity;

                                                } else if (orderItemList[i].p.isUseMemberPrice == 1) {

                                                    totalMemberPrice += orderItemList[i].p.memberPrice * orderItemList[i].quantity;

                                                } else {
                                                    totalMemberPrice += orderItemList[i].p.unit_price * orderItemList[i].quantity;
                                                }
                                            }

                                            category_orderItemList.sort(compare('product_id'));
                                            orderItemList_category.push(category_orderItemList);
                                            category_orderItemList = [];

                                            category_orderItemList.push(orderItemList[i]);

                                            if (i == orderItemList.length - 1) orderItemList_category.push(category_orderItemList);


                                        }
                                    }

                                    var orderItemList_category_productId = [];
                                    for (var i = 0; i < orderItemList_category.length; i++) {

                                        var productId_orderItemList = [];
                                        var orderItemList_categoryProductId = [];

                                        var orderItemList_category_productIdNormal = []
                                        //商品ID分组
                                        for (var j = 0; j < orderItemList_category[i].length; j++) {

                                            if (j == 0 || orderItemList_category[i][j].product_id == orderItemList_category[i][j - 1].product_id) {

                                                if (orderItemList_category[i][j].is_lottery != 1 && orderItemList_category[i][j].status_id != 6 && orderItemList_category[i][j].status_id != 7) {

                                                    orderItemList_category_productIdNormal.push(orderItemList_category[i][j])

                                                } else {

                                                    productId_orderItemList.push(orderItemList_category[i][j]);
                                                }

                                                if (j == orderItemList_category[i].length - 1) {

                                                    if (orderItemList_category_productIdNormal.length > 0) {

                                                        if (orderItemList_category_productIdNormal.length == 1) {

                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                        }
                                                        if (orderItemList_category_productIdNormal.length > 1) {

                                                            for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {

                                                                orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;

                                                            }
                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                        }
                                                    }
                                                    orderItemList_categoryProductId.push(productId_orderItemList);

                                                    orderItemList_category_productIdNormal = []
                                                }
                                            } else {

                                                if (orderItemList_category_productIdNormal.length > 0) {

                                                    if (orderItemList_category_productIdNormal.length == 1) {

                                                        productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                    }
                                                    if (orderItemList_category_productIdNormal.length > 1) {
                                                        for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {
                                                            orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;
                                                        }
                                                        productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                    }
                                                }

                                                orderItemList_categoryProductId.push(productId_orderItemList);

                                                productId_orderItemList = []
                                                orderItemList_category_productIdNormal = []

                                                if (orderItemList_category[i][j].is_lottery != 1 && orderItemList_category[i][j].status_id != 6 && orderItemList_category[i][j].status_id != 7) {

                                                    orderItemList_category_productIdNormal.push(orderItemList_category[i][j])

                                                } else {
                                                    productId_orderItemList.push(orderItemList_category[i][j]);
                                                }
                                                if (j == orderItemList_category[i].length - 1) {

                                                    if (orderItemList_category_productIdNormal.length > 0) {
                                                        if (orderItemList_category_productIdNormal.length == 1) {
                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])
                                                        }
                                                        if (orderItemList_category_productIdNormal.length > 1) {
                                                            for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {

                                                                orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;
                                                            }
                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                        }
                                                    }
                                                    orderItemList_categoryProductId.push(productId_orderItemList);
                                                    orderItemList_category_productIdNormal = []
                                                }
                                            }
                                        }

                                        orderItemList_category_productId.push(orderItemList_categoryProductId);
                                        orderItemList_categoryProductId = []
                                    }

                                    var service_charge = shop.service_charge;
                                    //TODO
                                    if (service_charge == null) {
                                        service_charge = 0;
                                    }

                                    /*$scope.tableInf.is_out&&$scope.orderCashed==1?payable:payable+=service_charge;
                   $scope.tableInf.is_out&&$scope.orderCashed==1?total:total+=service_charge;
                   $scope.tableInf.is_out&&$scope.orderCashed==1?totalMemberMoney:totalMemberMoney+=service_charge;*/


                                    totalMoney += total;
                                    payableMoney += payable;
                                    totalMemberMoney += totalMemberPrice;
                                    //
                                    for (var i = 0; i < orderItemList_category_productId.length; i++) {
                                        top += 6;
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "5%", "100%", "4mm", orderItemList_category[i][0].category_name);
                                        LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                                        for (var j = 0; j < orderItemList_category_productId[i].length; j++) {
                                            for (var k = 0; k < orderItemList_category_productId[i][j].length; k++) {
                                                top += 6;
                                                var orderItem = orderItemList_category_productId[i][j][k];
                                                var product = orderItemList_category_productId[i][j][k].p;

                                                var price = orderItemList_category_productId[i][j][k].p.is_promotion == 1 ? orderItemList_category_productId[i][j][k].p.promotion_price :
                                                    orderItemList_category_productId[i][j][k].p.unit_price
                                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "3mm", orderItemList_category_productId[i][j][k].p.name);
                                                LODOP.ADD_PRINT_TEXT(top + "mm", "55%", "100%", "4mm", price);
                                                LODOP.ADD_PRINT_TEXT(top + "mm", "67%", "100%", "4mm", orderItemList_category_productId[i][j][k].quantity);
                                                LODOP.ADD_PRINT_TEXT(top + "mm", "79%", "100%", "4mm",
                                                    orderItemList_category_productId[i][j][k].is_lottery == 1 ? "赠送" :
                                                        orderItemList_category_productId[i][j][k].status_id == 6 ? '退菜' :
                                                            orderItemList_category_productId[i][j][k].status_id == 7 ? '断货' :
                                                                orderItemList_category_productId[i][j][k].p.is_promotion == 1 ? (orderItemList_category_productId[i][j][k].p.promotion_price * orderItemList_category_productId[i][j][k].quantity).toFixed(2) :
                                                                    (orderItemList_category_productId[i][j][k].p.unit_price * orderItemList_category_productId[i][j][k].quantity).toFixed(2)
                                                );
                                                /*if(product.is_promotion){

                           totalMemberPrice+=product.promotion_price*orderItem.quantity;

                         }else if(product.isUseMemberPrice){

                           totalMemberPrice+=product.memberPrice*orderItem.quantity;

                         }else{
                           totalMemberPrice+=product.unit_price*orderItem.quantity;
                         }*/

                                            }

                                        }
                                    }
                                    if ($scope.tableInf.is_out == 0 && shop.service_charge != null && shop.service_charge != 0 && $scope.orderCashed == 1) {
                                        totalMemberPrice += service_charge
                                        top += 6;
                                        LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "3mm", "一元乐购");
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "55%", "100%", "4mm", service_charge);
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "67%", "100%", "4mm", "1");
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "79%", "100%", "4mm", service_charge);
                                    }
                                }


                                if (shop.shop_code_id != null) {
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "6mm", "商铺二维码: ");
                                    top += 6;
                                    var imgUrl = apiHost + '/image/' + shop.shop_code_id;
                                    //alert(imgUrl)
                                    //LODOP.ADD_PRINT_BARCODE(top+"mm","15%","22%","22%","QRCode","<div><img src="+imgUrl+"/></div>");
                                    //http://test-admin.lbcy.com.cn/www/#/table/
                                    //LODOP.ADD_PRINT_BARCODE(top+"mm","15%","22%","22%","QRCode","http://test-admin.lbcy.com.cn/www/#/table/10036");
                                    LODOP.ADD_PRINT_IMAGE(top + "mm", "5%", "100%", "100%", "<img src=" + imgUrl + "/>");
                                    //LODOP. ADD_PRINT_HTML (top+"mm","5%","100%","100%","<div><img src="+imgUrl+"/></div>");
                                    //LODOP.SET_PRINT_STYLEA(0,"HtmWaitMilSecs",1000);
                                    top += 25;
                                }
                                top += 4;

                                top += 6;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - -");


                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", "合计: " + payableMoney.toFixed(2));

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", "会员合计: " + totalMemberMoney.toFixed(2));

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - -");

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "4mm", "商铺名称:" + shop.shop_name);

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "4mm", "联系方式:" + shop.phone);
                                //dev-pre
                                LODOP.PREVIEW();
                                //LODOP.PRINT();
                                //TODO:
                                window.location.reload()

                            } else {
                                alert("对应名称打印设备不存在");
                            }
                        } else {
                            alert("获取对应打印机名称失败");
                        }
                    }
                )
            }

            //进入结账窗口
            $scope.settleAccounts = function () {
                if (!$scope.selectTable.id || $scope.selectTable.status != 2) {
                    showMessage("请选择已就餐桌位");
                    return;
                }
                var totalMoney = $scope.getCpTotal(2);
                $('#sp_discountedMoney').text(totalMoney);
                $('#sp_sf_money').text(totalMoney);
                $('#sp_xj_money').text(totalMoney);
                $('#txt_xj_money').val(totalMoney);
                $('#settleAccount').on('show.bs.modal', function () {
                    setTimeout(function () {
                        $('#txt_xj_money').select()
                    }, 800);
                })
                $('#settleAccount').modal('show');
            }

            //优惠金额
            $scope.discountmoney = 0;
            //优惠金额后
            $scope.discountedMoney = 0;
            //找零
            $scope.zlMoney = 0;

            $scope.payType = 111;
            $scope.settle_status = 1;
            $scope.zfbPay = 0;
            $scope.cashPay = 0;
            $scope.cardPay = 0;
            $scope.integralPay = 0;
            $scope.balancePay = 0;
            $scope.wxPay = 0;

            $scope.memberno = '';

            $scope.ifCLodp = 0;
            var getIfCLodop = function () {
                if (typeof (getCLodop) == 'undefined') {
                    $scope.ifCLodp = 0;
                } else {
                    $scope.ifCLodp = 1;
                }
            }
            getIfCLodop();

            $scope.showMemberInput = function () {
                $('#manual_discount_wrap').hide();
                $('#tb_member_input_table').toggle();
            }

            var printer_999 = {};
            PrinterService.getPrinterByPrinter_type({
                    printer_type: 999
                },
                function (response) {
                    if (response.code == 200) {
                        printer_999 = response.msg;
                    }
                },
                function (error) {
                }
            )

            $scope.settlePayType = '';
            //挂单
            $scope.guaDanFun = function () {
                if ($('#settle_rmk_mutiple').is(':hidden')) {
                    $scope.settlePayType = 130;
                    $('#settle_rmk_mutiple').attr('placeholder', '填写挂单原因').show();
                } else {
                    $('#settle_rmk_mutiple').hide();
                    $scope.settlePayType = '';
                }
            }

            //免单
            $scope.mianDanFun = function () {
                if ($('#settle_rmk_mutiple').is(':hidden')) {
                    $scope.settlePayType = 120;
                    $('#settle_rmk_mutiple').attr('placeholder', '填写免单原因').show();
                } else {
                    $('#settle_rmk_mutiple').hide();
                    $scope.settlePayType = '';
                }
            }


            $scope.totalPrice = 0;
            $scope.discount = '';
            $scope.residue = '';
            $scope.payable = '';

            tableOperateService.memberIntegral({},
                function (response) {
                    if (response.code == 500) {
                        alert('获取会员信息失败')
                        return
                    }
                    var integerMember = response.msg;
                    //alert("test")
                    //if(member.convertMoney!=null&&isNaN(member.convertMoney)){
                    if (integerMember != null)
                        $scope.memberIntegarDiscount = parseFloat(integerMember.convertMoney / integerMember.convertIntegral).toFixed(2);
                    // }

                },
                function (error) {
                }
            );

            //执行结账
            var confirmSettleAccount = function () {
                if ($scope.settlePayType != '') {
                    var _data = {
                        description: $('#settle_rmk_mutiple').val().trim(),
                        id: $scope.orderDetail.id,
                        pay_type: $scope.settlePayType,
                        status_id: 1
                    };
                    tableOperateService.orderPay(_data, function (res) {
                        if (res.code == '500') {
                            showMessage('结账失败');
                            return;
                        }
                        $('#settle_rmk_mutiple').val('');
                        $('#settleAccount').modal('hide');
                        $scope.settlePayType = '';
                        showMessage('结账成功');
                    })
                    return;
                }

                var pay_sf_total = 0;
                var pay_item_len = $('.pay_m_item').length;
                $('.pay_m_item').each(function (idx, item) {
                    var parentKey = $(item).parent().attr('key');
                    if (parentKey == 'jf') {
                        pay_sf_total += parseFloat($(item).next().text());
                    } else {
                        pay_sf_total += parseFloat($(item).text());
                    }
                })
                if (pay_sf_total < parseFloat($('#sp_discountedMoney').text())) {
                    showMessage('实付金额不够');
                    return;
                }
                //结账参数
                var data = {
                    id: $scope.orderDetail.id, //订单id
                    memberId: null, //会员id
                    pay_type: $('.pay-type-checked').attr('kval'), //支付类型
                    status_id: $scope.settle_status, //状态
                    total_free: $scope.getCpTotal(1), //总金额
                    tradeAlipay: $scope.zfbPay, //支付宝金额
                    tradeCash: $scope.cashPay, //现金金额
                    tradeCreditCard: $scope.cardPay, //银行卡支付金额
                    tradeMemberIntegral: $scope.integralPay, //积分支付数目
                    tradeMemberMoney: $scope.balancePay, //余额支付数目
                    tradeechat: $scope.wxPay, //微信支付金额
                    typeHypotaxis: null
                };
                if (pay_item_len == 2) {
                    if ($scope.member != null && (data.pay_type == '115' || data.pay_type == 'jf')) {
                        data.isUseMember = 1;
                        data.memberId = $scope.member.id;
                        var _member_pay_item_len = $('#pay_item_area p').length;
                        if (_member_pay_item_len == 2) {
                            data.tradeMemberMoney = parseFloat($('#pay_item_area p[key=115] span').text());
                            data.tradeMemberIntegral = parseFloat($('#pay_item_area p[key=jf] span').text());
                        } else {
                            if (data.pay_type == '115') {
                                data.tradeMemberMoney = parseFloat($('#pay_item_area p[key=115] span').text());
                            } else {
                                data.tradeMemberIntegral = parseFloat($('#pay_item_area p[key=jf] span').text());
                            }
                        }
                        data.pay_type = 115;
                    } else {
                        if (data.pay_type == 'jf' || data.pay_type == '115') {
                            showMessage('会员信息空');
                            return;
                        } else {
                            data.pay_type = 116; //组合付款
                            data.tradeCash = parseFloat($('#pay_item_area p[key=111] span').text());
                            data.tradeechat = parseFloat($('#pay_item_area p[key=113] span').text());
                        }
                    }
                } else {
                    switch (data.pay_type) {
                        case '111':
                            data.tradeCash = pay_sf_total;
                            break;
                        case '112':
                            data.tradeCreditCard = pay_sf_total;
                            break;
                        case '113':
                            data.tradeechat = pay_sf_total;
                            break;
                        case '114':
                            data.tradeAlipay = pay_sf_total;
                            break;
                        case '115':
                            data.memberId = $scope.member.id;
                            data.isUseMember = 1;
                            var _member_pay_item_len = $('#pay_item_area p').length;
                            data.tradeMemberMoney = parseFloat($('#pay_item_area p[key=115] span').text());
                            data.pay_type = 115;

                            data.tradeMemberMoney = pay_sf_total;
                            if ($scope.member.balance < pay_sf_total) {
                                showMessage('余额不足');
                                return;
                            }
                            break;
                    }
                }

                data.income = pay_sf_total; //实收
                data.manualPreference = $scope.discountmoney; //手动优惠
                data.odd = $scope.zlMoney; //找零

                console.log(data);
                tableOperateService.orderPay(
                    data,
                    function (response) {
                        if (response.code != 200) {

                            alert(response.msg);
                            return;
                        }
                        $scope.selectTable.status = 0;
                        $('#settleAccount').modal('hide');
                        showMessage('结账操作成功');


                        // $scope.cashPay=$('#pay_item_area p[key==111] span').text();
                        // $scope.wxPay=$('#pay_item_area p[key==113] span').text();
                        // $scope.zfbPay=$('#pay_item_area p[key==114] span').text();
                        // $scope.cardPay=$('#pay_item_area p[key==112] span').text();
                        // $scope.balancePay=$('#pay_item_area p[key==112] span').text();
                        // $scope.totalPrice=$('#sp_sf_money').text();
                        // $scope.discount=$('#txt_member_discount').text();
                        // $scope.payable=$('#sp_sf_money').text();

                        $scope.orderList = [$scope.orderDetail];
                        //结账单打印
                        if ($scope.ifCLodp == 1) {

                            var nowTime = DataUtilService.getNowTime();
                            var LODOP = getCLodop();
                            LODOP.SET_LICENSES("", "3E893A594C00D5D9C1DBE7CD18C9E8DB", "C94CEE276DB2187AE6B65D56B3FC2848", "");
                            LODOP.PRINT_INITA(1, 1, 700, 600, '商铺' + localStorage.getItem("shop_id") + '_结账单' + nowTime);
                            //printer_999.name = 'XP-80C';
                            var printer_name = 'XP-80C';

                            var pageWidth = printer_999.page_width;
                            if (pageWidth == null || pageWidth == 0) {
                                alert("纸张宽度不能为空或零,请在打印设置中设置");
                            }
                            LODOP.SET_PRINT_PAGESIZE(3, pageWidth + "mm", "5mm", "");

                            var flag = LODOP.SET_PRINTER_INDEX(printer_name);
                            if (flag) {
                                var top = 1;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "45%", pageWidth + "mm", "6mm", "结账单");
                                LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                                LODOP.SET_PRINT_STYLEA(0, "Horient", 2);
                                LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                                LODOP.SET_PRINT_STYLEA(0, "FontSize", 15);

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "订单编号:" + $scope.orderList[0].order_no);

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "收款员:" + localStorage.getItem("name"));

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "结账时间:" + nowTime);

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - -- - - - - - - - -- - -- - ");

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "品名");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "42%", "100%", "6mm", "单价");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "62%", "100%", "6mm", "数量");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "81%", "100%", "6mm", "金额");


                                var orderList = $scope.orderList;
                                for (var l = 0; l < orderList.length; l++) {

                                    //以category_id分组
                                    var orderItemList = orderList[l].loi;

                                    function compare(property) {
                                        return function (a, b) {
                                            var value1 = a[property];
                                            var value2 = b[property];
                                            return value1 - value2;
                                        }
                                    }

                                    orderItemList.sort(compare('category_id'));

                                    var orderItemListCategoryId = []
                                    var orderItemList_category = [];
                                    for (var i = 0; i < orderItemList.length; i++) {
                                        if (i == 0 || orderItemList[i].category_id == orderItemList[i - 1].category_id) {

                                            orderItemListCategoryId.push(orderItemList[i]);

                                        } else {
                                            orderItemListCategoryId.sort(compare('product_id'));
                                            orderItemList_category.push(orderItemListCategoryId);

                                            orderItemListCategoryId = [];

                                            orderItemListCategoryId.push(orderItemList[i]);

                                        }
                                        if (i == orderItemList.length - 1) {

                                            orderItemListCategoryId.sort(compare('product_id'));

                                            orderItemList_category.push(orderItemListCategoryId)
                                        }
                                    }

                                    var orderItemList_category_productId = [];

                                    for (var i = 0; i < orderItemList_category.length; i++) {

                                        var productId_orderItemList = [];

                                        var orderItemList_categoryProductId = [];

                                        var orderItemList_category_productIdNormal = []
                                        //商品ID分组
                                        for (var j = 0; j < orderItemList_category[i].length; j++) {

                                            if (j == 0 || orderItemList_category[i][j].product_id == orderItemList_category[i][j - 1].product_id) {

                                                if (orderItemList_category[i][j].is_lottery != 1 && orderItemList_category[i][j].status_id != 6 && orderItemList_category[i][j].status_id != 7) {

                                                    orderItemList_category_productIdNormal.push(orderItemList_category[i][j])

                                                } else {

                                                    productId_orderItemList.push(orderItemList_category[i][j]);
                                                }

                                                if (j == orderItemList_category[i].length - 1) {

                                                    if (orderItemList_category_productIdNormal.length > 0) {

                                                        if (orderItemList_category_productIdNormal.length == 1) {

                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                        }
                                                        if (orderItemList_category_productIdNormal.length > 1) {

                                                            for (var f = 1; f < orderItemList_category_productIdNormal.length; f++) {

                                                                orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[f].quantity;

                                                            }
                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                        }
                                                    }
                                                    orderItemList_categoryProductId.push(productId_orderItemList);

                                                    orderItemList_category_productIdNormal = []
                                                }

                                            } else {

                                                if (orderItemList_category_productIdNormal.length > 0) {

                                                    if (orderItemList_category_productIdNormal.length == 1) {

                                                        productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                    }
                                                    if (orderItemList_category_productIdNormal.length > 1) {
                                                        for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {
                                                            orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;
                                                        }
                                                        productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                    }
                                                }

                                                orderItemList_categoryProductId.push(productId_orderItemList);

                                                productId_orderItemList = []
                                                orderItemList_category_productIdNormal = []

                                                if (orderItemList_category[i][j].is_lottery != 1 && orderItemList_category[i][j].status_id != 6 && orderItemList_category[i][j].status_id != 7) {

                                                    orderItemList_category_productIdNormal.push(orderItemList_category[i][j])

                                                } else {
                                                    productId_orderItemList.push(orderItemList_category[i][j]);
                                                }
                                                if (j == orderItemList_category[i].length - 1) {

                                                    if (orderItemList_category_productIdNormal.length > 0) {
                                                        if (orderItemList_category_productIdNormal.length == 1) {
                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])
                                                        }
                                                        if (orderItemList_category_productIdNormal.length > 1) {
                                                            for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {

                                                                orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;
                                                            }
                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                        }
                                                    }
                                                    orderItemList_categoryProductId.push(productId_orderItemList);
                                                    orderItemList_category_productIdNormal = []
                                                }
                                            }
                                        }

                                        orderItemList_category_productId.push(orderItemList_categoryProductId);

                                        orderItemList_categoryProductId = []
                                    }

                                    top += 5;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");
                                    top += 5;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", "桌位:" + orderList[l].serial_id + (orderList[l].length > 1 && k == 0 ? "[主订单]" : ""));
                                    for (var p = 0; p < orderItemList_category_productId.length; p++) {
                                        top += 6;
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "5%", "100%", "4mm", orderItemList_category_productId[p][0][0].category_name);
                                        LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                                        for (var t = 0; t < orderItemList_category_productId[p].length; t++) {

                                            for (var y = 0; y < orderItemList_category_productId[p][t].length; y++) {
                                                top += 6;
                                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "3mm", orderItemList_category_productId[p][t][y].p.name);
                                                LODOP.ADD_PRINT_TEXT(top + "mm", "55%", "100%", "4mm", orderItemList_category_productId[p][t][y].p.is_promotion == 1 ? orderItemList_category_productId[p][t][y].p.promotion_price : orderItemList_category_productId[p][t][y].p.unit_price);
                                                LODOP.ADD_PRINT_TEXT(top + "mm", "67%", "100%", "4mm", orderItemList_category_productId[p][t][y].quantity)
                                                LODOP.ADD_PRINT_TEXT(top + "mm", "79%", "100%", "4mm", orderItemList_category_productId[p][t][y].is_lottery == 1 ? "赠送" : orderItemList_category_productId[p][t][y].status_id == 6 ? '退菜' : orderItemList_category_productId[p][t][y].status_id == 7 ? '断货' : orderItemList_category_productId[p][t][y].p.is_promotion == 1 ? (orderItemList_category_productId[p][t][y].p.promotion_price * orderItemList_category_productId[p][t][y].quantity).toFixed(2) : (orderItemList_category_productId[p][t][y].p.unit_price * orderItemList_category_productId[p][t][y].quantity).toFixed(2));
                                            }
                                        }
                                    }


                                    if ($scope.tableInf.is_out == 0 && shop.service_charge != null && shop.service_charge != 0 && $scope.orderCashed == 1) {
                                        top += 6;
                                        LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "3mm", "一元乐购");
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "55%", "100%", "4mm", shop.service_charge);
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "67%", "100%", "4mm", "1");
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "79%", "100%", "4mm", shop.service_charge);
                                    }
                                }
                                top += 6
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - -");

                                if (data.tradeCash) {
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "现金支付: " + data.tradeCash);
                                }


                                if (data.tradeechat) {
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "微信支付: " + data.tradeechat);
                                }

                                if (data.tradeAlipay) {
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "支付宝支付: " + data.tradeAlipay);
                                }

                                if (data.tradeCreditCard) {
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "银行卡支付: " + data.tradeCreditCard);
                                }

                                if (data.tradeMemberMoney) {
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "余额支付: " + data.tradeMemberMoney);
                                }

                                if (data.tradeMemberIntegral) {
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "积分支付: " + data.tradeMemberIntegral);
                                }

                                top += 6;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "合计应收: " + pay_sf_total);

                                //  if (data.discount != "" && data.discount != 0) {
                                //    top += 6;
                                //    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "折扣: " + data.discount);
                                //  }

                                //  if (data.residue != "" && data.residue != 0) {
                                //    top += 6;
                                //    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "抹零: " + data.residue);
                                //  }


                                top += 6;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "实收: " + pay_sf_total);

                                if (data.isUseMember == 1) {
                                    top += 4;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");

                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "会员余额: " + ($scope.member.balance - data.tradeMemberMoney));

                                    top += 4;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");
                                }

                                var isFreeSingleOrIsBill = $scope.payType == 120 ? "免单支付" : $scope.payType == 130 ? "挂账支付" : false;


                                if (isFreeSingleOrIsBill) {
                                    top += 4;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", isFreeSingleOrIsBill);
                                    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                                    top += 4;
                                }

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");

                                /*top+=4;
                 LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","商铺名称:"+shop.shop_name);

                 top+=4;
                 LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","联系方式:"+shop.phone);*/

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "6mm", "技术支持：河北玄宇通网络科技有限公司");

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "6mm", "服务热线：400－0217－123");
                                //dev
                                LODOP.PREVIEW();

                                //LODOP.PRINT();

                            } else {
                                alert("打印机名称对应打印设备不存在");
                            }

                        }
                    },
                    function (error) {
                        alert('结账失败');
                    }
                );
            }

            $scope.changeBigInput = function (event, parentid) {
                $scope.jisuanshoudongyouhui(parentid, event.target.value, $('.pay-type-checked').attr('kval'));
            }

            $scope.jisuanshoudongyouhui = function (parentId, _tmpVal, key) {
                if (_tmpVal == '') {
                    _tmpVal = '0';
                }
                if (parentId == 'manual_discount_wrap') {
                    if (parseFloat(_tmpVal) > parseFloat($('#sp_discountedMoney').text())) {
                        showMessage('优惠超出');
                        return false;
                    }
                    $('#txt_discountedMoney').val(parseFloat($('#sp_discountedMoney').text()) - parseFloat(_tmpVal));
                    $('#sp_discountedMoney').text($('#txt_discountedMoney').val());
                    $('#sp_sf_money').text($('#txt_discountedMoney').val());
                    $('#txt_xj_money').val($('#txt_discountedMoney').val());
                    $('#pay_item_area p[key=' + key + '] span').text($('#txt_discountedMoney').val());
                } else if (parentId == 'manual_settle_wrap') {
                    if (key) {
                        var _key_txt = $('.pay-type-checked').text();
                        if (key == 'jf') {
                            $('#pay_item_area p[key=' + key + '] #i_jf_money').text(($scope.memberIntegarDiscount * parseFloat(_tmpVal)));
                        } else {
                            if ($('#pay_item_area p[key=' + key + ']').length == 0) {
                                $('#pay_item_area').append('<p key="' + key + '" style="text-align:right;"><i id="sp_pay_type">' + _key_txt + '</i><span id="sp_xj_money" class="pay_m_item">' + _tmpVal + '</span></p>');
                            } else {
                                $('#pay_item_area p[key=' + key + '] span').text(_tmpVal);
                            }
                        }
                    }

                    var _sf_money = parseFloat($('#sp_sf_money').text());

                    var pay_sf_total = 0;
                    $('.pay_m_item').each(function (idx, item) {
                        var parentKey = $(item).parent().attr('key');
                        if (parentKey == 'jf') {
                            pay_sf_total += parseFloat($(item).next().text());
                        } else {
                            pay_sf_total += parseFloat($(item).text());
                        }
                    })
                }
                var _zl_money = pay_sf_total - parseFloat($('#sp_sf_money').text());

                if (_tmpVal == '0' || _sf_money > pay_sf_total || isNaN(_zl_money)) {
                    _zl_money = 0;
                }
                $('#sp_zl_money').text(_zl_money.toFixed(2));
                return true;
            }

            $scope.bindSelectAll = function (event) {
                $(event.target).attr('selectall', 'selectall').select();
            }

            //开桌-键盘
            $('.cal-table tr td').click(function () {
                var parentId = $(this).parents('.cal-wrap').attr('id');

                var inputBox = $('#txt_discountmoney');
                if (parentId == 'open_table_wrap') {
                    inputBox = $('#txt_mealNumber');


                    if (inputBox.val().trim().length == 3) {
                        showMessage('座位数限制3位数');
                        return;
                    }
                }
                var key = $(this).attr('key');
                var txt = $(this).text();
                if (parentId == 'member_input_table') {
                    inputBox = $('#txt_memberno');
                    switch (key) {
                        case 'backspace':
                            inputBox.val(inputBox.val().substring(0, inputBox.val().length - 1));
                            if (inputBox.val().length == 0) {
                                inputBox.val('');
                                return;
                            }
                            break;
                        case 'clear':
                            inputBox.val('');
                            $('#txt_member_discount').val('');
                            $('#txt_balance').val('');
                            $('#txt_member_integer').val('');
                            $scope.member = null;
                            $('#sp_sf_money').text($('#sp_discountedMoney').text());
                            $('#pay_item_area p:first span').text($('#sp_discountedMoney').text());
                            break;
                        case 'confirm':
                            memberInformationService.getMember({
                                id: localStorage.getItem('shop_id'),
                                cardNumber: inputBox.val()
                            }, function (res) {
                                if (res.code != '200') {
                                    $scope.member = null;
                                    $scope.calcuIsUseMember(false);
                                    showMessage('未查询到会员信息');
                                    return;
                                }
                                $scope.member = res.msg;
                                $scope.calcuIsUseMember(true);
                                $('#manual_settle_wrap td[kval=115]').click();
                                $('#txt_member_discount').val(res.msg.memberCardDiscount);
                                $('#txt_balance').val(res.msg.balance);
                                $('#txt_member_integer').val(res.msg.integral);
                                $('#tb_member_input_table').hide();
                            })
                            //$(this).parents('.member-input-table').hide();
                            break;
                        default:
                            if (inputBox.val().indexOf('.') > 0 && txt == '.') {
                                return;
                            }
                            inputBox.val(inputBox.val() + txt);
                            break;
                    }
                    return;
                }
                if (parentId == 'manual_settle_wrap') {
                    inputBox = $('#txt_xj_money');
                }
                if (parentId == 'open_table_wrap') {
                    inputBox = $('#txt_mealNumber');
                }
                if (inputBox.val().length == 5 && !key) {
                    showMessage('超出输入范围');
                    return;
                }
                if (inputBox.val().indexOf('0') == 0 && !key) inputBox.val('');
                switch (key) {
                    case 'backspace': //退格删除
                        inputBox.val(inputBox.val().substring(0, inputBox.val().length - 1));
                        //手动优惠
                        if (!$scope.jisuanshoudongyouhui(parentId, inputBox.val(), $('.pay-type-checked').attr('kval'))) {
                            return;
                        }
                        if (inputBox.val().length == 0) {
                            inputBox.val('0');
                            return;
                        }
                        break;
                    case 'clear': //清除
                        $('#txt_discountmoney').val('0');
                        $scope.jisuanshoudongyouhui(parentId, '0')
                        inputBox.val('0');
                        $('#sp_sf_money').text($('#sp_discountedMoney').text());
                        $('#sp_xj_money').text($('#sp_discountedMoney').text());
                        $('#pay_item_area p').remove();
                        $('#manual_settle_wrap table tr td[kval]').removeClass('pay-type-checked');
                        $('#manual_settle_wrap table tr td[kval]:first').addClass('pay-type-checked');
                        $('#txt_xj_money').val('0');
                        break;
                    case 'confirm': //确认
                        $(this).parents('.manual-discount-wrap').hide();
                        break;
                    case 'startSettle': //结账
                        confirmSettleAccount();
                        return;
                        break;
                    case 'paytype': //选择支付类型
                        inputBox.val('');

                        var kval = $(this).attr('kval');
                        if (kval != '115') {
                            $scope.calcuIsUseMember(false);
                        }
                        if ((kval == '115' || kval == 'jf' || kval == 'zk') && ($scope.member == null || !$scope.member.id)) {
                            showMessage('会员信息空');
                            return;
                        }

                        $('.pay-type-checked').removeClass('pay-type-checked');
                        $(this).addClass('pay-type-checked');

                        if ($('#pay_item_area p[key=' + kval + ']').length == 1) {
                            inputBox.val($('#pay_item_area p[key=' + kval + '] span').text());

                            inputBox.attr('selectall', 'selectall');
                            inputBox.select();
                            return;
                        } else {
                            $('#pay_item_area p:first').attr('key', kval);
                            $('#pay_item_area p:first #sp_pay_type').text(txt);
                        }
                        if (kval != 'jf' && kval != 'zk') {
                            var pay_sf_total = 0;
                            $('.pay_m_item').each(function (idx, item) {
                                var parentKey = $(item).parent().attr('key');
                                if (parentKey == 'jf') {
                                    pay_sf_total += parseFloat($(item).next().text());
                                } else {
                                    pay_sf_total += parseFloat($(item).text());
                                }
                            })
                            if (pay_sf_total < parseFloat($('#sp_sf_money').text())) {
                                var result_total = parseFloat($('#sp_sf_money').text()) - pay_sf_total;
                                inputBox.val(result_total);
                                $('#pay_item_area').append('<p key="' + kval + '" style="text-align:right;"><i id="sp_pay_type">' + $(this).text() + '</i><span id="sp_xj_money" class="pay_m_item">' + result_total + '</span></p>');
                            }
                        } else {
                            if (kval == 'jf') {
                                inputBox.val($scope.member.integral);
                                $('#pay_item_area').append('<p key="' + kval + '" style="text-align:right;"><i id="sp_pay_type">' + $(this).text() + '</i><span style="float:inherit;margin-left:0px;margin-right:40px;" id="sp_xj_money" class="pay_m_item">' + inputBox.val() + '</span><i id="i_jf_money" style="margin-right:30px;">' + ($scope.memberIntegarDiscount * parseFloat(inputBox.val())).toFixed(2) + '</i></p>');
                            }
                        }
                        inputBox.select();
                        inputBox.attr('selectall', 'selectall');
                        return;
                        break;
                    default: //默认输入值
                        if (inputBox.attr('selectall')) {
                            inputBox.val('');
                            inputBox.removeAttr('selectall');
                        }
                        var td_selected = $('#manual_settle_wrap table tr .pay-type-checked');
                        var kval = td_selected.attr('kval');
                        if (inputBox.val().indexOf('.') > 0 && txt == '.') {
                            return;
                        }

                        var _oldVal = inputBox.val();
                        var _tmpVal = inputBox.val() + txt;
                        var isMember = false;
                        if (kval == 'jf') {
                            if ($scope.member == null) {
                                showMessage('会员信息空');
                                return;
                            }
                            isMember = true;
                        } else if (kval == '115') {
                            if (parseFloat(_tmpVal) > $scope.member.balance) {
                                showMessage('余额不足');
                                return;
                            }
                        }


                        //手动优惠
                        if (!$scope.jisuanshoudongyouhui(parentId, _tmpVal, kval)) {
                            return;
                        }
                        inputBox.val(_tmpVal);
                        break;
                }
            })

            //清台
            $scope.clearStage = function () {
                if (!$scope.selectTable.id || $scope.selectTable.status != 1) {
                    showMessage('请选择已开桌的桌位');
                    return;
                }
                $('#confirmDialog').modal('show');
            }
            //确认清台
            $scope.confirmClearStage = function () {
                $scope.clearTable();
            }

            $scope.goto = function (url) {
                $('#myModal').modal('hide').on('hidden.bs.modal', function () {
                    window.location.href = url;
                })
            }

            $scope.orderTake = function () {
                $('#myModal').modal('hide').on('hidden.bs.modal', function () {
                    window.location.href = '#takingOrder/' + $scope.selectTable.id;
                })
            }

            $scope.currentActiveRegion = {};

            //选择区域
            $scope.changeRegion = function (_region, _isTurn) {
                if (!_isTurn) {
                    $scope.currentActiveRegion = _region;
                }

                tableOperateService.tableList($scope.getSearchTabParam(_isTurn),
                    function (response) {
                        if (response.code == 500) {
                            alert('获取桌位列表失败')
                            return;
                        }
                        if (_isTurn) {
                            $scope.turnCurrentActiveRegion = _region;
                            $scope.turnDiningTableList = response.msg;
                        } else {
                            $scope.diningTableList = response.msg;
                        }
                        // var _regions=[];
                        // _regions.push({id:-1,name:'全部',shopId:null});
                        // _regions=_regions.concat(response.msg.regionList);
                        // $scope.regionList=_regions;

                    },
                    function (error) {
                    }
                );
            }

            $scope.activeSeat = {};

            //选择桌位人数
            $scope.changeSeat = function (_seat, _isTurn) {
                if (!_isTurn) {
                    $scope.activeSeat = _seat;
                }

                tableOperateService.tableList($scope.getSearchTabParam(_isTurn),
                    function (response) {
                        if (response.code == 500) {
                            alert('获取桌位列表失败')
                            return;
                        }
                        if (_isTurn) {
                            $scope.turnTbActiveSeat = _seat;
                            $scope.turnDiningTableList = response.msg;
                        } else {

                            $scope.diningTableList = response.msg;
                        }
                        // var _regions=[];
                        // _regions.push({id:-1,name:'全部',shopId:null});
                        // _regions=_regions.concat(response.msg.regionList);
                        // $scope.regionList=_regions;

                    },
                    function (error) {
                    }
                );
            }
            $('.tabCntArea a').click(function () {
                $(this).siblings().find('i').removeClass('icon-tab_m_selected').addClass('icon-tab_m_unselected');
                $(this).find('i').addClass('icon-tab_m_selected');
            })

            //手动优惠键盘弹出与收起
            $('#js_btn_mdac').click(function () {
                $('#tb_member_input_table').hide();
                $('#manual_discount_wrap').toggle();
                $('#txt_discountmoney').select().attr('selectall', 'selectall');
            })
        }
    ])


tableOperateModule.controller('callServiceListController', ['$scope', '$location', '$routeParams', 'tableOperateService',
    function ($scope, $location, $routeParams, tableOperateService) {
        $scope.callServiceList = [];
        $scope.initRouterActive = function () {
            setActiveRouter($location.$$path);
        }
        var getCallServiceList = function () {
            tableOperateService.callServiceList({},
                function (response) {
                    if (response.code == 500) {
                        alert('获取呼叫服务列表失败')
                        return
                    }
                    $scope.callServiceList = response.msg
                },
                function (error) {
                }
            );
        }
        getCallServiceList();
        $scope.initRouterActive = function () {
            setActiveRouter($location.$$path);
        }
        $scope.orderService = function (callService) {
            window.location.href = "#/takingOrder/" + callService.dining_table_id;
        }

        $scope.orderDetailService = function (callService) {
            tableOperateService.callServiceDelete({
                    id: callService.id
                },
                function (response) {
                    if (response.code == 500) {
                        alert('失败')
                        return
                    }
                    window.location.href = "#/orderDetail/" + callService.dining_table_id;
                },
                function (error) {
                }
            );
        }

        $scope.otherService = function (callService) {
            tableOperateService.callServiceDelete({
                    id: callService.id
                },
                function (response) {
                    if (response.code == 500) {
                        alert('失败')
                        return
                    }
                    getCallServiceList();
                },
                function (error) {
                }
            );
        };

    }
])

tableOperateModule.controller('addOrderController', ['$scope', '$location', '$routeParams', "$interval", 'tableOperateService',

    function ($scope, $location, $routeParams, $interval, tableOperateService) {
        $scope.totalQuantity = 0;
        $scope.totalPrice = 0;
        $scope.tableInf = {};
        $scope.productList = [];

        $scope.ordereds = [];

        $scope.productSubmitList = [];
        $scope.dataUrlForepart = apiHost + '/image/';

        $scope.searchByKeyStr = '';
        //获取菜品金额、应付金额
        $scope.getCpTotal = function (type) {
            let total = 0;
            if (!$scope.orderDetail) {
                return total;
            }
            if (type == 1) {
                $scope.orderDetail.loi.forEach(function (item, idx) {
                    total += (item.quantity * item.p.unit_price);
                })
            } else {
                $scope.orderDetail.loi.forEach(function (item, idx) {
                    total += (item.quantity * (item.p.is_promotion ? item.p.promotion_price : item.p.unit_price));
                })
            }
            return total;
        }

        //搜索菜品
        $scope.searchByKey = function () {
            if (!$scope.searchByKeyStr || $scope.searchByKeyStr.trim().length == 0) return;
            $scope.getProductList($scope.selectedCategory);
        }

        // tableOperateService.tableView(
        // 	{id:$routeParams.tableId},
        // 	function (response) {
        // 		if (response.code == 500) {
        // 			alert('获取桌位信息失败')
        // 			return
        // 		}
        // 		$scope.tableInf  = response.msg;
        // 		getOrderDetail();
        // 	},
        // 	function (error) {}
        // );

        tableOperateService.categoryList({},
            function (response) {
                if (response.code == 500) {
                    alert('获取菜品类别列表失败')
                    return
                }

                var data = response.msg;
                var categoryList = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].is_enable != 1)
                        continue
                    categoryList.push(data[i]);
                }
                $scope.categoryList = categoryList;
                if ($scope.categoryList)
                    $scope.getProductList($scope.categoryList[0]);
            },
            function (error) {
            }
        );

        // tableOperateService.callServiceList({},
        // 	function (response) {
        // 		if (response.code == 500) {
        // 			alert('获取呼叫服务列表失败')
        // 			return
        // 		}
        // 		$scope.callServiceList  = response.msg
        // 	},
        // 	function (error) {}
        // );

        //选好了，提交
        $scope.addOrderSubmit = function () {
            if ($scope.totalQuantity == 0)
                return;

            tableOperateService.orderDetail({
                    id: $routeParams.tableId
                },
                function (response) {
                    if (response.code == 500) {
                        alert('获取订单详情失败')
                        return
                    }
                    var orderDetail = response.msg
                    $scope.productSubmitList = [];
                    for (var i = 0; i < orderDetail.loi.length; i++) {
                        if (orderDetail.loi[i].status_id == 0) {
                            $scope.productSubmitList.push(orderDetail.loi[i]);
                        }
                    }

                    var sum = $scope.productSubmitList.length;
                    var count = 0;
                    for (var i = 0; i < $scope.productSubmitList.length; i++) {
                        $scope.productSubmitList[i].status_id = 8;
                        tableOperateService.orderProductUpdate($scope.productSubmitList[i],
                            function (response) {
                                if (response.code == 500) {
                                    alert('修改失败')
                                    return
                                }
                                count++;
                                if (count == sum)
                                    window.location.href = "#takingOrder/" + $routeParams.tableId;
                            },
                            function (error) {
                            }
                        );
                    }
                },
                function (error) {
                }
            )
        }

        $scope.showCart = function () {
            if ($scope.totalQuantity == 0) return;
            window.location.href = "#cartList/" + $routeParams.tableId;
        }

        $scope.searchProductList = function () {
            window.location.href = "#searchList/" + $routeParams.tableId;
        }

        //等叫
        $scope.dengJiaoFun = function (j_type) {
            var printList = [];
            printList.diningTableName = $scope.orderDetail.diningTableName;
            printList.status_name = '等叫';


            $('#editorderedstate').hide();
            var data = {
                operateType: 1,
                diningTableId: $scope.orderDetail.dining_table_id
            };
            if (j_type == 'single') {
                if (!$scope.curSelOrderedItem) {
                    showMessage('请选择要菜品');
                    return;
                }
                data.orderItemId = $scope.curSelOrderedItem.id;

                var _tmp = $scope.orderDetail.loi[$scope.orderedSelectIndex];
                var print = {
                    id: _tmp.id,
                    status_id: 4,
                    quantity: _tmp.quantity,
                    category_id: _tmp.category_id,
                    p: {
                        name: _tmp.p.name,
                        unit: _tmp.p.unit
                    },
                    description: _tmp.p.description
                }
                printList.push(print);
            } else {
                data.orderId = $scope.orderDetail.id;

                $scope.orderDetail.loi.forEach(item => {
                    printList.push({
                        id: item.id,
                        status_id: 4,
                        quantity: item.quantity,
                        category_id: item.category_id,
                        p: {
                            name: item.p.name,
                            unit: item.p.unit
                        },
                        description: item.description
                    });
                })
            }
            $('#editorderedstate').hide();
            tableOperateService.denjiao(data, function (res) {
                if (res.code == '500') {
                    showMessage('操作失败');
                    return;
                }
                showMessage('操作成功');

                var sayHell = function () {
                    $scope.$emit('$fromSubControllerClick', printList);
                };
                sayHell();

            })
        }

        //叫起
        $scope.jiaoqiFun = function (j_type) {
            var data = {
                operateType: 2,
                diningTableId: $scope.orderDetail.dining_table_id
            };
            if (j_type == 'single') {
                data.orderItemId = $scope.curSelOrderedItem.id;
            } else {
                data.orderId = $scope.orderDetail.id;
            }
            $('#editorderedshout').hide();
            tableOperateService.denjiao(data, function (res) {
                if (res.code == '500') {
                    showMessage('操作失败');
                    return;
                }
                showMessage('操作成功');
            })
        }

        var getOrderDetail = function () {
            tableOperateService.orderDetail({
                    id: $routeParams.tableId
                },
                function (response) {
                    if (response.code == 500) {
                        showMessage('获取订单详情失败')
                        return
                    }

                    var orderDetail = response.msg;
                    if (orderDetail.isOut > 0) {
                        $('#out_addr_area').show();
                        $('#txt_detail_contact').val(orderDetail.linkMan);
                        $('#txt_detail_mobile').val(orderDetail.linkPhone);
                        $('#txt_detail_time').val(orderDetail.deliveryTime);
                        $('#txt_detail_addr').val(orderDetail.deliveryAddress);
                        $('#meal_area').text(orderDetail.isOut == 1 ? '外卖-店内打包' : '外卖-店外配送');
                    } else {
                        if ($routeParams.isTakeOut == 1) {
                            $('#meal_area').text('外卖');
                        }
                    }

                    $scope.orderDetail = orderDetail;
                    //console.log("orderDetail", orderDetail)

                    var totalQuantity = 0;
                    var totalPrice = 0;
                    $scope.productSubmitList = [];
                    //console.log("orderDetail=!null ------ ", orderDetail != null);
                    if (orderDetail.loi.length > 0) {
                        for (var i = 0; i < orderDetail.loi.length; i++) {
                            if (orderDetail.loi[i].status_id == 0) {
                                $scope.productSubmitList.push(orderDetail.loi[i]);
                                totalQuantity += orderDetail.loi[i].quantity;
                                if (orderDetail.loi[i].p.is_promotion == 1) {
                                    totalPrice += orderDetail.loi[i].p.promotion_price * orderDetail.loi[i].quantity;
                                } else {
                                    totalPrice += orderDetail.loi[i].p.unit_price * orderDetail.loi[i].quantity;
                                }

                                for (var j = 0; j < $scope.productList.length; j++) {
                                    if (orderDetail.loi[i].product_id == $scope.productList[j].id) {
                                        $scope.productList[j].quantity = 0;
                                        $scope.productList[j].quantity = orderDetail.loi[i].quantity;
                                    }
                                }
                            }
                        }
                    }
                    $scope.totalQuantity = totalQuantity;
                    $scope.totalPrice = totalPrice;
                },
                function (error) {
                }
            )
        }
        getOrderDetail();
        // var timeout_upd = $interval(getOrderDetail, 1000);
        // $scope.$on('$destroy',function(){
        // 	$interval.cancel(timeout_upd);
        // })
        $scope.getProductList = function (category) {
            $scope.selectedCategory = category;
            tableOperateService.productListById({
                    id: localStorage.getItem("shop_id"),
                    categoryId: $scope.selectedCategory.id,
                    name: $scope.searchByKeyStr
                },
                function (response) {
                    if (response.code == 500) {
                        alert('获取菜品列表失败')
                        return
                    }
                    var productList = response.msg
                    for (var i = 0; i < productList.length; i++) {
                        productList[i].quantity = 0;
                    }
                    $scope.productList = productList;
                },
                function (error) {
                }
            );
        };
        $scope.increaseCount = function (id) {
            //console.log("=====")
            //console.log(localStorage.getItem("shop_id"))
            //console.log($scope.orderDetail)
            for (var i = $scope.productList.length - 1; i >= 0; i--) {
                if ($scope.productList[i].id == id) {
                    $scope.productList[i].quantity++;
                    var data = {
                        order_id: $scope.orderDetail.id,
                        product_id: $scope.productList[i].id,
                        category_id: $scope.productList[i].category_id,
                        quantity: 1,
                        status_id: 0,
                        is_lottery: 0,
                        description: '',
                        shopId: localStorage.getItem("shop_id")
                    };
                    tableOperateService.orderProductCreate(
                        data,
                        function (response) {
                            if (response.code != 200) {
                                //console.log(response);
                                alert('添加失败');
                                return
                            }
                        },
                        function (error) {
                        }
                    );

                    $scope.totalQuantity++;
                    if ($scope.productList[i].is_promotion == 1) {
                        $scope.totalPrice += parseFloat($scope.productList[i].promotion_price);
                    } else {
                        $scope.totalPrice += parseFloat($scope.productList[i].unit_price);
                    }
                    break;
                }
            }
        };
        $scope.decreaseCount = function (id) {
            for (var i = $scope.productList.length - 1; i >= 0; i--) {
                if ($scope.productList[i].id == id) {
                    for (var j = 0; j < $scope.orderDetail.loi.length; j++) {
                        if ($scope.orderDetail.loi[j].product_id == $scope.productList[i].id && $scope.orderDetail.loi[j].status_id == 0) {
                            if ($scope.productList[i].quantity > 1) {
                                $scope.productList[i].quantity--;
                                $scope.orderDetail.loi[j].quantity--;
                                tableOperateService.orderProductUpdate($scope.orderDetail.loi[j],
                                    function (response) {
                                        if (response.code == 500) {
                                            alert('修改失败')
                                            return
                                        }
                                    },
                                    function (error) {
                                    }
                                );
                                $scope.totalQuantity--;
                                if ($scope.productList[i].is_promotion == 1) {
                                    $scope.totalPrice -= parseFloat($scope.productList[i].promotion_price);
                                } else {
                                    $scope.totalPrice -= parseFloat($scope.productList[i].unit_price);
                                }
                                break;
                            } else {
                                if ($scope.productList[i].quantity == 1) {
                                    $scope.productList[i].quantity--;
                                }
                                tableOperateService.orderProductDelete({
                                        id: $scope.orderDetail.loi[j].id
                                    },
                                    function (response) {
                                        if (response.code == 500) {
                                            alert('修改失败')
                                            return
                                        }
                                    },
                                    function (error) {
                                    }
                                );
                            }
                        }
                    }
                }
            }
        };

        $scope.currentPageList = [];
        $scope.orderedPageIndex = 1;
        $scope.orderedPageSize = 12;
        $scope.orderedTotalPage = 1;

        //点菜
        $scope.addToOrdered = function (model) {
            if ($scope.orderedPageIndex != $scope.orderedTotalPage) {
                $scope.orderedPageIndex = $scope.orderedTotalPage;
                $scope.currentPageList = $scope.ordereds.slice(($scope.orderedPageIndex - 1) * $scope.orderedPageSize, $scope.ordereds.length);
            }
            model.count = 1;
            $scope.ordereds.push(model);

            $scope.orderDetail.loi.push({
                category_id: model.category_id,
                category_name: model.category_name,
                p: model,
                quantity: 1,
                status_id: 0,
                unit: model.unit,
                name: model.name,
                description: model.description
            });
            if ($scope.currentPageList.length == 12) {
                $scope.orderedPageIndex++;
                $scope.orderedTotalPage++;
                $scope.currentPageList = [];
            }
            $scope.currentPageList.push(model);
            $scope.curSelOrderedItem = model;

            var data = {
                order_id: $routeParams.tableId,
                product_id: model.id,
                category_id: model.category_id,
                quantity: 1,
                status_id: 0,
                is_lottery: 0,
                description: '',
                shopId: model.shop_id
            };
            tableOperateService.orderProductCreate(data,
                function (response) {
                    if (response.code == 500) {
                        showMessage('添加失败')
                        return;
                    }
                    getOrderDetail();
                },
                function (error) {
                }
            );
        }

        $scope.orderedSelectIndex = -1;

        //选择菜
        $scope.selectOrderedItem = function (model, idx) {
            $scope.orderedSelectIndex = idx;
            $scope.curSelOrderedItem = model;
            $scope.allowGiveNum = model.quantity;
        }

        //删除已点菜品
        $scope.removeOrderedItem = function () {
            $('.calter-table-wrap').hide();
            if (!$scope.curSelOrderedItem) {
                showMessage('请选择要删除的项');
                return;
            }
            tableOperateService.orderProductDelete({
                    id: $scope.curSelOrderedItem.id
                },
                function (response) {
                    if (response.code == 500) {
                        alert('修改失败')
                        return;
                    }
                    showMessage('操作成功');
                    $scope.orderDetail.loi.splice($scope.orderedSelectIndex, 1);
                },
                function (error) {
                }
            );
        }

        //下单
        $scope.placeanorder = function () {
            $('.calter-table-wrap').hide();
            var a = 1;
            var orderDetail = $scope.orderDetail;
            var sum = $scope.ordereds.length;
            var status_name = '';
            if (orderDetail.status == 10) {
                status_name = '等叫';
            }
            var productList = orderDetail.loi;

            var count = 0;


            var printList = [];
            printList.diningTableName = orderDetail.diningTableName;
            printList.status_name = status_name;
            for (var i = 0; i < productList.length; i++) {
                if (productList[i].status_id == 2)
                    continue;
                var print = {
                    id: productList[i].id,
                    status_id: 1,
                    quantity: productList[i].quantity,
                    category_id: productList[i].category_id,
                    p: {
                        name: productList[i].p.name,
                        unit: productList[i].p.unit
                    },
                    description: productList[i].p.description

                }
                printList.push(print)
                productList[i].status_id = 2;
            }

            if (printList.length == 0) {
                showMessage('当前无可下单的菜品');
                return;
            }
            tableOperateService.submitOrder({
                diningTableId: $scope.orderDetail.dining_table_id
            }, function (response) {
                if (response.code == '200') {
                    showMessage('下单成功');
                    var sayHell = function () {
                        $scope.$emit('$fromSubControllerClick', printList);
                    };
                    sayHell()
                }
            })
        }

        $scope.emptyOrdered = function (model) {
            $scope.ordereds = [];
            $scope.orderedPageIndex = 1;
            $scope.orderedTotalPage = 1;
            $scope.currentPageList = [];
        }
        $scope.curSelOrderedItem = null;

        $scope.allowGiveNum = 0;

        //点餐关闭辅助弹窗
        $('.calter-give-fbar-closebtn').click(function () {
            $(this).parents('.calter-table-wrap').hide();
        })

        //点餐-弹出辅助
        $('.ordered-op-item').click(function () {
            var offset = $(this).offset();
            var el = $('#' + $(this).attr('key'));

            if (el.is(':hidden')) {
                $('.calter-table-wrap').hide();
                el.show().css('top', offset.top - 136);
            } else {
                el.hide();
            }
        })

        //选择原因
        $('.give-reason-items span').click(function () {
            $(this).addClass('active').siblings().removeClass('active');
        })

        //减数量
        $('.cal-reduce-btn').click(function () {
            var parentId = $(this).parents('.calter-table-wrap').attr('id');
            var inputBox = null;
            if (parentId == 'editordered') {
                inputBox = $('#' + parentId).find('.cal-inpu-box');
            } else if (parentId == 'editorderedgiveeat') {
                inputBox = $('#' + parentId).find('.give-eat-count');
            }
            if (!inputBox.val() || inputBox.val() == '0') {
                return;
            }
            inputBox.val(parseFloat(inputBox.val()) - 1);
        })

        //加数量
        $('.cal-plus-btn').click(function () {
            var parentId = $(this).parents('.calter-table-wrap').attr('id');
            var inputBox = null;
            if (parentId == 'editordered') {
                inputBox = $('#' + parentId).find('.cal-inpu-box');
            } else if (parentId == 'editorderedgiveeat') {
                inputBox = $('#' + parentId).find('.give-eat-count');
            }
            if (!inputBox.val()) {
                return;
            }
            inputBox.val(parseFloat(inputBox.val()) + 1);
        })

        //键盘-修改数量
        $('.cal-table tr td').click(function () {
            var parentId = $(this).parents('.calter-table-wrap').attr('id');
            if (!parentId) return;
            var inputBox = null;
            if (parentId == 'editordered') {
                inputBox = $('#' + parentId).find('#edit_meal_count');
            } else if (parentId == 'editorderedgiveeat') {
                inputBox = $('#' + parentId).find('#txt_give_count');
            } else if (parentId == 'editorderedtuicai') {
                inputBox = $('#' + parentId).find('#txt_tuicai_count');
            }
            var key = $(this).attr('key');
            var txt = $(this).text();
            switch (key) {
                case 'backspace':
                    inputBox.val(inputBox.val().substring(0, inputBox.val().length - 1));
                    break;
                case 'clear':
                    inputBox.val('');
                    break;
                case 'confirm':
                    if (!$scope.curSelOrderedItem) {
                        showMessage('请选择要修改的菜');
                        return;
                    }
                    if (inputBox.val().trim() == '' || parseFloat(inputBox.val()) <= 0) {
                        showMessage('数量填写不正确');
                        return;
                    }
                    tableOperateService.orderProductUpdate({
                        id: $scope.curSelOrderedItem.id,
                        quantity: parseInt(inputBox.val())
                    }, function (res) {
                        if (res.code == '500') {
                            showMessage('修改失败');
                            return;
                        }
                        $scope.orderDetail.loi[$scope.orderedSelectIndex].quantity = inputBox.val();
                        showMessage('操作成功');
                        $('#editordered').hide();
                    })
                    break;
                default:
                    if (inputBox.val().indexOf('.') > 0 && txt == '.' || inputBox.val().trim().length == 3) {
                        return;
                    }
                    inputBox.val(inputBox.val() + txt);
                    break;
            }
        })

        //赋值原因
        $scope.setRmk = function (val) {
            $('#txt_o_rmk').val(val);
        }

        //修改菜的备注
        $scope.editrRmk = function () {
            if (!$scope.curSelOrderedItem) {
                showMessage('请选择要备注的菜');
                return;
            }
            if ($('#txt_o_rmk').val().trim() == '') {
                showMessage('备注不能为空');
                return;
            }
            tableOperateService.orderProductUpdate({
                id: $scope.curSelOrderedItem.id,
                description: $('#txt_o_rmk').val().trim()
            }, function (res) {
                if (res.code == '500') {
                    showMessage('修改失败');
                    return;
                }
                showMessage('操作成功');
                $('#editorderedrmk').hide();
            })
        }

        //退菜
        $scope.tuicaiFun = function () {
            if (!$scope.curSelOrderedItem) {
                showMessage('请选择要退的菜');
                return;
            }

            var _inputCount = parseFloat($('#txt_tuicai_count').val());
            if (isNaN(_inputCount) || _inputCount <= 0 || _inputCount > $scope.curSelOrderedItem.quantity) {
                showMessage('退菜数量输入不正确');
                return;
            }
            var _tuicai_count = parseFloat($('#txt_tuicai_count').val());
            var _give_rmk = $('.tuicai-rmk-items .active a').text();
            var _rmk_all = '';
            if (_give_rmk) {
                _rmk_all += _give_rmk;
            }
            if ($('#txt_tuicai_remark').val()) {
                _rmk_all += '(' + $('#txt_tuicai_remark').val() + ')';
            }
            if (!_rmk_all) {
                showMessage('请填写退菜理由');
                return;
            }
            tableOperateService.giveReturnDish({
                operateType: 2,
                orderItemId: $scope.curSelOrderedItem.id,
                quantity: _tuicai_count,
                statusRemark: _rmk_all
            }, function (res) {
                if (res.code == '500') {
                    showMessage('退菜失败');
                    return;
                }
                $('.calter-table-wrap').hide();
                $('#txt_tuicai_count').val('');
                $('#txt_tuicai_remark').val('');
                showMessage('操作成功');

                var _tmp = $scope.orderDetail.loi[$scope.orderedSelectIndex];
                var printList = [];
                var print = {
                    id: _tmp.id,
                    status_id: 6,
                    quantity: _tmp.quantity,
                    category_id: _tmp.category_id,
                    p: {
                        name: _tmp.p.name,
                        unit: _tmp.p.unit
                    },
                    description: _tmp.p.description
                }
                printList.push(print);
                printList.diningTableName = $scope.orderDetail.diningTableName;
                printList.status_name = '退菜';
                showMessage('操作成功');
                var sayHell = function () {
                    $scope.$emit('$fromSubControllerClick', printList);
                };
                sayHell();
                $scope.orderDetail.loi.splice($scope.orderedSelectIndex, 1);
            })
        }

        //赠送
        $scope.giveFun = function () {
            if (!$scope.curSelOrderedItem) {
                showMessage('请选择要赠送的菜');
                return;
            }
            var _inputCount = parseFloat($('#txt_give_count').val());
            if (isNaN(_inputCount) || _inputCount <= 0 || _inputCount > $scope.curSelOrderedItem.quantity) {
                showMessage('赠送数量不正确');
                return;
            }
            var _give_count = parseFloat($('#txt_give_count').val());
            var _give_rmk = $('.give-reason-items .active a').text();
            var _rmk_all = '';
            if (_give_rmk) {
                _rmk_all += _give_rmk;
            }
            if ($('#txt_give_remark').val()) {
                _rmk_all += '(' + $('#txt_give_remark').val() + ')';
            }
            if (!_rmk_all) {
                showMessage('请填写赠送理由');
                return;
            }
            tableOperateService.giveReturnDish({
                operateType: 1,
                orderItemId: $scope.curSelOrderedItem.id,
                quantity: _give_count,
                statusRemark: _rmk_all
            }, function (res) {
                if (res.code == '500') {
                    showMessage('赠菜失败');
                    return;
                }
                showMessage('操作成功');
                $('.calter-table-wrap').hide();
                $('#txt_give_count').val('');
                $('#txt_give_remark').val('');
            })
        }
    }
])

tableOperateModule.controller('searchListController', ['$scope', '$location', '$routeParams', "$interval", 'tableOperateService',
    function ($scope, $location, $routeParams, $interval, tableOperateService) {
        $scope.totalQuantity = 0;
        $scope.totalPrice = 0;
        $scope.tableInf = {};
        $scope.productList = [];
        $scope.productSubmitList = [];
        $scope.keyWord = "";
        $scope.dataUrlForepart = apiHost + '/image/';

        tableOperateService.tableView({
                id: $routeParams.tableId
            },
            function (response) {
                if (response.code == 500) {
                    alert('获取桌位信息失败')
                    return
                }
                $scope.tableInf = response.msg;
                getOrderDetail();
            },
            function (error) {
            }
        );

        $scope.getAllProductList = function () {
            tableOperateService.productAllList({},
                function (response) {
                    if (response.code == 500) {
                        alert('获取菜品列表失败')
                        return
                    }
                    var allProductList = [];
                    var productList = [];
                    allProductList = response.msg;
                    for (var i = 0; i < allProductList.length; i++) {
                        allProductList[i].quantity = 0;
                        if (JSON.stringify(allProductList[i].name).indexOf($scope.keyWord) == -1) {
                            continue;
                        }
                        productList.push(allProductList[i]);
                    }
                    $scope.allProductList = allProductList;
                    $scope.productList = productList;
                    getOrderDetail();
                },
                function (error) {
                }
            );
        };
        $scope.getAllProductList();

        $scope.getFilterProductList = function () {
            var allProductList = $scope.allProductList;
            var productList = [];
            for (var i = 0; i < allProductList.length; i++) {
                if (JSON.stringify(allProductList[i].name).indexOf($scope.keyWord) == -1 || allProductList[i].is_in_use == 0) {
                    continue;
                }
                productList.push(allProductList[i]);
            }
            $scope.productList = productList;
        }

        tableOperateService.callServiceList({},
            function (response) {
                if (response.code == 500) {
                    alert('获取呼叫服务列表失败')
                    return
                }
                $scope.callServiceList = response.msg
            },
            function (error) {
            }
        );

        $scope.addOrderSubmit = function () {
            if ($scope.totalQuantity == 0)
                return;

            tableOperateService.orderDetail({
                    id: $routeParams.tableId
                },
                function (response) {
                    if (response.code == 500) {
                        alert('获取订单详情失败')
                        return
                    }
                    var orderDetail = response.msg
                    $scope.productSubmitList = [];
                    for (var i = 0; i < orderDetail.loi.length; i++) {
                        if (orderDetail.loi[i].status_id == 0) {
                            $scope.productSubmitList.push(orderDetail.loi[i]);
                        }
                    }

                    var sum = $scope.productSubmitList.length;
                    var count = 0;
                    for (var i = 0; i < $scope.productSubmitList.length; i++) {
                        $scope.productSubmitList[i].status_id = 8;
                        tableOperateService.orderProductUpdate($scope.productSubmitList[i],
                            function (response) {
                                if (response.code == 500) {
                                    alert('修改失败')
                                    return
                                }
                                count++;
                                if (count == sum)
                                    window.location.href = "#takingOrder/" + $routeParams.tableId;
                            },
                            function (error) {
                            }
                        );
                    }
                },
                function (error) {
                }
            )
        }

        $scope.returnOrderAdd = function () {
            window.location.href = "#addOrder/" + $routeParams.tableId;
        }

        $scope.showCart = function () {
            if ($scope.totalQuantity == 0)
                return;
            window.location.href = "#cartList/" + $routeParams.tableId;
        }

        var getOrderDetail = function () {
            tableOperateService.orderDetail({
                    id: $routeParams.tableId
                },
                function (response) {
                    if (response.code == 500) {
                        alert('获取订单详情失败')
                        return
                    }
                    var orderDetail = response.msg
                    var totalQuantity = 0;
                    var totalPrice = 0;
                    $scope.productSubmitList = [];
                    for (var i = 0; i < orderDetail.loi.length; i++) {
                        if (orderDetail.loi[i].status_id == 0) {
                            $scope.productSubmitList.push(orderDetail.loi[i]);
                            totalQuantity += orderDetail.loi[i].quantity;
                            if (orderDetail.loi[i].p.is_promotion == 1) {
                                totalPrice += orderDetail.loi[i].p.promotion_price * orderDetail.loi[i].quantity;
                            } else {
                                totalPrice += orderDetail.loi[i].p.unit_price * orderDetail.loi[i].quantity;
                            }

                            for (var j = 0; j < $scope.productList.length; j++) {
                                if (orderDetail.loi[i].product_id == $scope.productList[j].id) {
                                    $scope.productList[j].quantity = 0;
                                    $scope.productList[j].quantity = orderDetail.loi[i].quantity;
                                }
                            }
                        }
                    }
                    $scope.orderDetail = orderDetail;
                    $scope.totalQuantity = totalQuantity;
                    $scope.totalPrice = totalPrice;
                },
                function (error) {
                }
            )
        }

        // var timeout_upd = $interval(getOrderDetail, 2000);
        // $scope.$on('$destroy',function(){
        // 	$interval.cancel(timeout_upd);
        // })

        $scope.increaseCount = function (id) {
            for (var i = $scope.productList.length - 1; i >= 0; i--) {
                if ($scope.productList[i].id == id) {
                    $scope.productList[i].quantity++;
                    var data = {
                        order_id: $scope.orderDetail.id,
                        product_id: $scope.productList[i].id,
                        category_id: $scope.productList[i].category_id,
                        quantity: 1,
                        status_id: 0,
                        is_lottery: 0,
                        description: '',
                        shopId: localStorage.getItem("shop_id")
                    };
                    tableOperateService.orderProductCreate(data,
                        function (response) {
                            if (response.code == 500) {
                                alert('添加失败')
                                return
                            }
                        },
                        function (error) {
                        }
                    );

                    $scope.totalQuantity++;
                    if ($scope.productList[i].is_promotion == 1) {
                        $scope.totalPrice += parseFloat($scope.productList[i].promotion_price);
                    } else {
                        $scope.totalPrice += parseFloat($scope.productList[i].unit_price);
                    }
                    break;
                }
            }
        };
        $scope.decreaseCount = function (id) {
            for (var i = $scope.productList.length - 1; i >= 0; i--) {
                if ($scope.productList[i].id == id) {
                    for (var j = 0; j < $scope.orderDetail.loi.length; j++) {
                        if ($scope.orderDetail.loi[j].product_id == $scope.productList[i].id && $scope.orderDetail.loi[j].status_id == 0) {
                            if ($scope.productList[i].quantity > 1) {
                                $scope.productList[i].quantity--;
                                $scope.orderDetail.loi[j].quantity--;
                                tableOperateService.orderProductUpdate($scope.orderDetail.loi[j],
                                    function (response) {
                                        if (response.code == 500) {
                                            alert('修改失败')
                                            return
                                        }
                                    },
                                    function (error) {
                                    }
                                );
                                $scope.totalQuantity--;
                                if ($scope.productList[i].is_promotion == 1) {
                                    $scope.totalPrice -= parseFloat($scope.productList[i].promotion_price);
                                } else {
                                    $scope.totalPrice -= parseFloat($scope.productList[i].unit_price);
                                }
                                break;
                            } else {
                                if ($scope.productList[i].quantity == 1) {
                                    $scope.productList[i].quantity--;
                                }
                                tableOperateService.orderProductDelete({
                                        id: $scope.orderDetail.loi[j].id
                                    },
                                    function (response) {
                                        if (response.code == 500) {
                                            alert('修改失败')
                                            return
                                        }
                                    },
                                    function (error) {
                                    }
                                );
                            }
                        }
                    }
                }
            }
        };
    }
])

tableOperateModule.controller('cartListController', ['$scope', '$location', '$routeParams', '$interval', 'tableOperateService', 'shopInformationService', 'PrinterService', 'DataUtilService',
    function ($scope, $location, $routeParams, $interval, tableOperateService, shopInformationService, PrinterService, DataUtilService) {
        $scope.totalQuantity = 0;
        $scope.totalPrice = 0;
        $scope.tableInf = {};
        $scope.productList = [];
        $scope.productSubmitList = [];
        $scope.dataUrlForepart = apiHost + '/image/';
        $scope.callServiceList = [];

        $scope.nowKey = localStorage.getItem('now_keys');
        $scope.ifCLodp = 0;
        var getIfCLodop = function () {
            if (typeof (getCLodop) == 'undefined') {
                $scope.ifCLodp = 0;
            } else {
                $scope.ifCLodp = 1;
            }
        }
        getIfCLodop();
        $scope.downloadLodop32 = function () {
            window.location.href = (apiHost + '/downloadLodop');
        }

        var getCallServiceList = function () {
            tableOperateService.callServiceList({},
                function (response) {
                    if (response.code == 500) {
                        alert('获取呼叫服务列表失败')
                        return
                    }
                    $scope.callServiceList = response.msg
                },
                function (error) {
                }
            );
        }
        getCallServiceList();

        $scope.addOrderSubmit = function () {
            $scope.productSubmitList = $scope.productList;
            if ($scope.totalQuantity == 0)
                return;
            var sum = $scope.productSubmitList.length;
            var count = 0;
            for (var i = 0; i < $scope.productSubmitList.length; i++) {
                $scope.productSubmitList[i].status_id = 8;
                tableOperateService.orderProductUpdate($scope.productSubmitList[i],
                    function (response) {
                        if (response.code == 500) {
                            alert('修改失败')
                            return
                        }
                        count++;
                        if (count == sum)
                            window.location.href = "#takingOrder/" + $routeParams.tableId;
                    },
                    function (error) {
                    }
                );
            }
        }

        tableOperateService.tableView({
                id: $routeParams.tableId
            },
            function (response) {
                if (response.code == 500) {
                    alert('获取桌位信息失败')
                    return
                }
                $scope.tableInf = response.msg;
                getOrderDetail();
            },
            function (error) {
            }
        );

        var getOrderDetail = function () {
            tableOperateService.orderDetail({
                    id: $routeParams.tableId
                },
                function (response) {
                    if (response.code == 500) {
                        alert('获取订单详情失败')
                        return;
                    }
                    var orderDetail = response.msg
                    var totalQuantity = 0;
                    var totalPrice = 0;
                    $scope.productSubmitList = [];
                    for (var i = 0; i < orderDetail.loi.length; i++) {
                        if (orderDetail.loi[i].status_id == 0) {
                            $scope.productSubmitList.push(orderDetail.loi[i]);
                            totalQuantity += orderDetail.loi[i].quantity;
                            if (orderDetail.loi[i].p.is_promotion == 1) {
                                totalPrice += orderDetail.loi[i].p.promotion_price * orderDetail.loi[i].quantity;
                            } else {
                                totalPrice += orderDetail.loi[i].p.unit_price * orderDetail.loi[i].quantity;
                            }
                        }
                    }
                    $scope.productList = $scope.productSubmitList;
                    $scope.orderDetail = orderDetail;
                    $scope.totalQuantity = totalQuantity;
                    $scope.totalPrice = totalPrice;
                },
                function (error) {
                }
            )
        }

        // var timeout_upd = $interval(getOrderDetail, 2000);
        // $scope.$on('$destroy',function(){
        // 	$interval.cancel(timeout_upd);
        // })
        $scope.increaseCount = function (id) {
            for (var i = $scope.productList.length - 1; i >= 0; i--) {
                if ($scope.productList[i].id == id) {
                    $scope.productList[i].quantity++;
                    var data = {
                        order_id: $scope.orderDetail.id,
                        product_id: $scope.productList[i].id,
                        category_id: $scope.productList[i].category_id,
                        quantity: 1,
                        status_id: 0,
                        is_lottery: 0,
                        description: ''
                    };
                    tableOperateService.orderProductUpdate($scope.productList[i],
                        function (response) {
                            if (response.code == 500) {
                                alert('添加失败')
                                return
                            }
                        },
                        function (error) {
                        }
                    );

                    $scope.totalQuantity++;
                    if ($scope.productList[i].p.is_promotion == 1) {
                        $scope.totalPrice += parseFloat($scope.productList[i].p.promotion_price);
                    } else {
                        $scope.totalPrice += parseFloat($scope.productList[i].p.unit_price);
                    }
                    break;
                }
            }
        };
        $scope.decreaseCount = function (id) {
            for (var i = $scope.productList.length - 1; i >= 0; i--) {
                if ($scope.productList[i].id == id) {
                    if ($scope.productList[i].quantity > 1) {
                        $scope.productList[i].quantity--;
                        tableOperateService.orderProductUpdate($scope.productList[i],
                            function (response) {
                                if (response.code == 500) {
                                    alert('修改失败')
                                    return
                                }
                            },
                            function (error) {
                            }
                        );
                        $scope.totalQuantity--;
                        if ($scope.productList[i].p.is_promotion == 1) {
                            $scope.totalPrice -= parseFloat($scope.productList[i].p.promotion_price);
                        } else {
                            $scope.totalPrice -= parseFloat($scope.productList[i].p.unit_price);
                        }
                        break;
                    } else {
                        if (confirm("是否确认删除菜品？")) {
                            tableOperateService.orderProductDelete({
                                    id: $scope.productList[i].id
                                },
                                function (response) {
                                    if (response.code == 500) {
                                        alert('修改失败')
                                        return
                                    }
                                },
                                function (error) {
                                }
                            );
                            delete $scope.productList[i];
                            if ($scope.productList.length == 1) {
                                window.location.href = "#addOrder/" + $routeParams.tableId;
                            }
                        }
                        //window.location.href="#addOrder/"+$routeParams.tableId;
                    }
                }
            }
        };

        $scope.selectedProduct = {};

    }
])

tableOperateModule.controller('takingOrderListController',
    ['$scope', '$location', '$routeParams', '$interval', 'tableOperateService', 'shopInformationService', 'PrinterService', 'DataUtilService',
        function ($scope, $location, $routeParams, $interval, tableOperateService, shopInformationService, PrinterService, DataUtilService) {
            $scope.totalQuantity = 0;
            $scope.totalPrice = 0;
            $scope.tableInf = {};
            $scope.productList = [];
            $scope.dataUrlForepart = apiHost + '/image/';
            $scope.callServiceList = [];
            var tableId = $routeParams.tableId;

            $scope.nowKey = localStorage.getItem('now_keys');
            $scope.ifCLodp = 0;
            var getIfCLodop = function () {
                if (typeof (getCLodop) == 'undefined') {
                    $scope.ifCLodp = 0;
                } else {
                    $scope.ifCLodp = 1;
                }
            }
            getIfCLodop();

            $scope.downloadLodop32 = function () {
                window.location.href = (apiHost + '/downloadLodop');
            }

            var getCallServiceList = function () {
                tableOperateService.callServiceList({},
                    function (response) {
                        if (response.code == 500) {
                            alert('获取呼叫服务列表失败')
                            return
                        }
                        $scope.callServiceList = response.msg
                    },
                    function (error) {
                    }
                );
            }
            getCallServiceList();

            $scope.isSubmit = false;

            $scope.cartOrderSubmit = function (status) {
                if (!$scope.isSubmit) {
                    $scope.isSubmit = true;
                } else {
                    return false;
                }
                var status_name = '';
                if (status == 10) {
                    status_name = '等叫';
                }
                tableOperateService.orderDetail({
                        id: $routeParams.tableId
                    },
                    function (response) {
                        if (response.code == 500) {
                            alert('获取订单详情失败')
                            return
                        }
                        var orderDetail = response.msg

                        var totalQuantity = 0;
                        var totalPrice = 0;

                        $scope.productList = [];

                        for (var i = 0; i < orderDetail.loi.length; i++) {
                            if (orderDetail.loi[i].status_id == 8) {
                                $scope.productList.push(orderDetail.loi[i]);

                                totalQuantity += orderDetail.loi[i].quantity;
                                if (orderDetail.loi[i].p.is_promotion == 1) {
                                    totalPrice += orderDetail.loi[i].p.promotion_price * orderDetail.loi[i].quantity;
                                } else {
                                    totalPrice += orderDetail.loi[i].p.unit_price * orderDetail.loi[i].quantity;
                                }
                            }
                        }
                        $scope.orderDetail = orderDetail;
                        $scope.totalQuantity = totalQuantity;
                        $scope.totalPrice = totalPrice;


                        for (var j = 0; j < $scope.callServiceList.length; j++) {
                            if ($scope.callServiceList[j].dining_table_id == $scope.tableInf.id &&
                                $scope.callServiceList[j].order_id == $scope.orderDetail.id) {
                                tableOperateService.callServiceDelete({
                                        id: $scope.callServiceList[j].id
                                    },
                                    function (response) {
                                        if (response.code == 500) {
                                            alert('失败')
                                            return
                                        }
                                    },
                                    function (error) {
                                    }
                                );
                            }
                        }
                        $scope.tableInf.status = 2;
                        tableOperateService.tableUpdate(
                            $scope.tableInf,
                            function (response) {
                                if (response.code == 500) {
                                    alert('提交失败')
                                    return
                                }
                            },
                            function (error) {
                            }
                        );

                        var data = {
                            id: $scope.orderDetail.id,
                            shop_id: $scope.orderDetail.shop_id,
                            serial_id: $scope.orderDetail.serial_id,
                            dining_table_id: $scope.orderDetail.dining_table_id,
                            loi: null,
                            pay_person: localStorage.getItem('name'),
                            status_id: 0,
                            total_free: '',
                            real_pay: '',
                            description: $scope.orderDescription
                        };

                        tableOperateService.orderUpdate(data,
                            function (response) {
                                if (response.code == 500) {
                                    alert('提交失败')
                                    return
                                }
                            },
                            function (error) {
                            }
                        );


                        var sum = $scope.productList.length;

                        var count = 0;


                        var printList = [];
                        printList.diningTableName = orderDetail.diningTableName;
                        printList.status_name = status_name;
                        for (var i = 0; i < $scope.productList.length; i++) {

                            var print = {
                                id: $scope.productList[i].id,
                                status_id: 1,
                                quantity: $scope.productList[i].quantity,
                                category_id: $scope.productList[i].category_id,
                                p: {
                                    name: $scope.productList[i].p.name,
                                    unit: $scope.productList[i].p.unit
                                },
                                description: $scope.productList[i].description

                            }
                            printList.push(print)
                            $scope.productList[i].status_id = 2;
                            tableOperateService.orderProductUpdate(
                                $scope.productList[i],
                                function (response) {
                                    if (response.code == 500) {
                                        alert('添加失败')
                                        return;
                                    }
                                    count++;
                                    if (count == sum) {
                                        window.location.href = "#orderDetail/" + $routeParams.tableId;
                                        var sayHell = function () {
                                            $scope.$emit('$fromSubControllerClick', printList);
                                        };
                                        sayHell()
                                    }
                                },
                                function (error) {
                                }
                            );
                        }
                    },
                    function (error) {
                    }
                )
            }

            tableOperateService.tableView({
                    id: $routeParams.tableId
                },
                function (response) {
                    if (response.code == 500) {
                        alert('获取桌位信息失败')
                        return
                    }
                    $scope.tableInf = response.msg;
                    getOrderDetail();
                },
                function (error) {
                }
            );

            var getOrderDetail = function () {
                tableOperateService.orderDetail({
                        id: $scope.tableInf.orderId
                    },
                    function (response) {
                        if (response.code == 500) {
                            alert('获取订单详情失败')
                            return
                        }
                        var orderDetail = response.msg
                        var totalQuantity = 0;
                        var totalPrice = 0;
                        $scope.productList = [];
                        for (var i = 0; i < orderDetail.loi.length; i++) {
                            if (orderDetail.loi[i].status_id == 8) {
                                $scope.productList.push(orderDetail.loi[i]);
                                totalQuantity += orderDetail.loi[i].quantity;
                                if (orderDetail.loi[i].p.is_promotion == 1) {
                                    totalPrice += orderDetail.loi[i].p.promotion_price * orderDetail.loi[i].quantity;
                                } else {
                                    totalPrice += orderDetail.loi[i].p.unit_price * orderDetail.loi[i].quantity;
                                }
                            }
                        }
                        $scope.orderDetail = orderDetail;
                        $scope.totalQuantity = totalQuantity;
                        $scope.totalPrice = totalPrice;
                    },
                    function (error) {
                    }
                )
            }

            // var timeout_upd = $interval(getOrderDetail, 2000);
            // $scope.$on('$destroy',function(){
            // 	$interval.cancel(timeout_upd);
            // })

            $scope.increaseCount = function (id) {

                for (var i = $scope.productList.length - 1; i >= 0; i--) {
                    if ($scope.productList[i].id == id) {
                        $scope.productList[i].quantity++;
                        var data = {
                            order_id: $scope.orderDetail.id,
                            product_id: $scope.productList[i].id,
                            category_id: $scope.productList[i].category_id,
                            quantity: 1,
                            status_id: 0,
                            is_lottery: 0,
                            description: ''
                        };
                        tableOperateService.orderProductUpdate($scope.productList[i],
                            function (response) {
                                if (response.code == 500) {
                                    alert('添加失败')
                                    return
                                }
                            },
                            function (error) {
                            }
                        );

                        $scope.totalQuantity++;
                        if ($scope.productList[i].p.is_promotion == 1) {
                            $scope.totalPrice += parseFloat($scope.productList[i].p.promotion_price);
                        } else {
                            $scope.totalPrice += parseFloat($scope.productList[i].p.unit_price);
                        }
                        break;
                    }
                }
            };
            $scope.decreaseCount = function (id) {
                for (var i = $scope.productList.length - 1; i >= 0; i--) {
                    if ($scope.productList[i].id == id) {
                        if ($scope.productList[i].quantity > 1) {
                            $scope.productList[i].quantity--;
                            tableOperateService.orderProductUpdate(
                                $scope.productList[i],
                                function (response) {
                                    if (response.code == 500) {
                                        alert('修改失败')
                                        return
                                    }
                                },
                                function (error) {
                                }
                            );
                            $scope.totalQuantity--;
                            if ($scope.productList[i].p.is_promotion == 1) {
                                $scope.totalPrice -= parseFloat($scope.productList[i].p.promotion_price);
                            } else {
                                $scope.totalPrice -= parseFloat($scope.productList[i].p.unit_price);
                            }
                            break;
                        } else {
                            if (confirm("是否确认删除菜品？")) {
                                tableOperateService.orderProductDelete({
                                        id: $scope.productList[i].id
                                    },
                                    function (response) {
                                        if (response.code == 500) {
                                            alert('修改失败')
                                            return
                                        }
                                    },
                                    function (error) {
                                    }
                                );
                                delete $scope.productList[i];
                                if ($scope.productList.length == 1) {
                                    window.location.href = "#addOrder/" + $routeParams.tableId;
                                }
                            }
                            //window.location.href="#addOrder/"+$routeParams.tableId;
                        }
                    }
                }
            };

            $scope.selectedProduct = {};
            $scope.selectStandard = function (product) {
                $scope.selectedProduct = product;
                $('#standardModal').modal('show');
            };
            $scope.selectTaste = function (product) {
                $scope.selectedProduct = product;
                $('#tastedModal').modal('show');
            };
            $scope.addDescription = function (value) {
                $scope.selectedProduct.description += ' ' + value;
            }
            $scope.submitSelectStandard = function () {
                var reg = /^\d+(\.\d+)?$/;
                if (!reg.test($scope.selectedProduct.quantity)) {
                    alert("规格格式不正确")
                    return;
                }
                tableOperateService.orderProductUpdate($scope.selectedProduct,
                    function (response) {
                        if (response.code == 500) {
                            alert('修改失败')
                            return
                        }
                        $('#standardModal').modal('hide')
                    },
                    function (error) {
                    }
                );
                for (var i = 0; i < $scope.productList.length; i++) {
                    if ($scope.productList[i].id == $scope.selectedProduct.id)
                        $scope.productList[i] = $scope.selectedProduct
                }
            }

            //确认提交
            $scope.submitSelectTaste = function () {
                tableOperateService.orderProductUpdate($scope.selectedProduct,
                    function (response) {
                        if (response.code == 500) {
                            alert('修改失败')
                            return
                        }
                        $('#tastedModal').modal('hide')
                    },
                    function (error) {
                    }
                );
                for (var i = 0; i < $scope.productList.length; i++) {
                    if ($scope.productList[i].id == $scope.selectedProduct.id)
                        $scope.productList[i] = $scope.selectedProduct
                }
            }
        }
    ])

tableOperateModule.controller('orderDetailController', ['$scope', '$location', '$routeParams', '$interval', 'tableOperateService',
    function ($scope, $location, $routeParams, $interval, tableOperateService) {
        $scope.totalQuantity = 0;
        $scope.totalPrice = 0;
        $scope.tableInf = {};
        $scope.nowKey = localStorage.getItem('now_keys');
        $scope.callServiceList = [];

        $scope.isShowGive = function () {

            if (localStorage.getItem('now_keys') == '5') {
                return false
            }
            return true;
        }

        var getCallServiceList = function () {
            tableOperateService.callServiceList({},
                function (response) {
                    if (response.code == 500) {
                        alert('获取呼叫服务列表失败')
                        return
                    }
                    $scope.callServiceList = response.msg
                },
                function (error) {
                }
            );
        }
        getCallServiceList();

        tableOperateService.tableView({
                id: $routeParams.tableId
            },
            function (response) {
                if (response.code == 500) {
                    alert('获取桌位信息失败')
                    return
                }
                $scope.tableInf = response.msg;
                getOrderDetail();
            },
            function (error) {
            }
        );

        var getOrderDetail = function () {
            tableOperateService.orderDetail({
                    id: $routeParams.tableId
                },
                function (response) {
                    if (response.code == 500) {
                        alert('获取订单详情失败')
                        return
                    }
                    var orderDetail = response.msg;
                    //console.log("orderDetail ------ ",orderDetail);
                    var totalQuantity = 0;
                    var totalPrice = 0;

                    for (var i = 0; i < orderDetail.loi.length; i++) {

                        if (orderDetail.loi[i].is_lottery == 1) {
                            continue;
                        }
                        if (orderDetail.loi[i].status_id == 6) {
                            continue;
                        }
                        if (orderDetail.loi[i].status_id == 7) {
                            continue;
                        }
                        totalQuantity += orderDetail.loi[i].quantity;
                        if (orderDetail.loi[i].p.is_promotion == 1) {
                            totalPrice += orderDetail.loi[i].p.promotion_price * orderDetail.loi[i].quantity;
                        } else {
                            totalPrice += orderDetail.loi[i].p.unit_price * orderDetail.loi[i].quantity;
                        }
                    }
                    $scope.orderDetail = orderDetail;
                    $scope.totalQuantity = totalQuantity;
                    $scope.totalPrice = totalPrice;
                },
                function (error) {
                }
            )
        }
        //loop
        // var timeout_upd = $interval(getOrderDetail, 2000);
        // $scope.$on('$destroy',function(){
        // 	$interval.cancel(timeout_upd);
        // })

        //dev2
        $scope.decreaseCount = function (product) {

            if (product.quantity > 1) {
                if (confirm('是否确认减少一份该菜品数量？')) {
                    var printList = [];
                    var print = {
                        id: product.id,
                        status_id: 1,
                        quantity: 1,
                        category_id: product.category_id,
                        p: {
                            name: product.p.name,
                            unit: product.p.unit
                        },
                        description: product.description

                    }
                    printList.diningTableName = $scope.orderDetail.diningTableName;
                    printList.status_name = '';
                    printList.push(print)
                    var sayHell = function () {
                        $scope.$emit('$fromSubControllerClick', printList);
                    };
                    sayHell();
                    product.quantity--;
                    tableOperateService.orderProductUpdate(
                        product,
                        function (response) {
                            if (response.code == 500) {
                                alert('修改失败')
                                return
                            }
                            getOrderDetail();
                        },
                        function (error) {
                        }
                    );
                }
            }
        }

        $scope.addLottery = function (product) {
            product.is_lottery = 1;

            if (product.p.is_promotion == 1) {
                $scope.totalPrice -= product.p.promotion_price * product.quantity;
            } else {
                $scope.totalPrice -= product.p.unit_price * product.quantity;
            }
            tableOperateService.orderProductUpdate(product,
                function (response) {
                    if (response.code == 500) {
                        alert('修改失败')
                        return
                    }
                    getOrderDetail();
                },
                function (error) {
                }
            );
        }

        $scope.backProduct = function (product) {
            if (confirm('是否确认退菜？?')) {
                $scope.selectedProduct = product;
                $scope.selectedProduct.description = "";
                $('#tastedModal').modal('show');
            }
        }

        $scope.backProductSubmit = function () {
            if ($scope.selectedProduct.description == "") {
                alert("请填写退菜备注");
                return;
            }

            $scope.selectedProduct.status_id = 6;

            tableOperateService.orderProductUpdate(
                $scope.selectedProduct,
                function (response) {
                    if (response.code == 500) {
                        alert('修改失败')
                        return
                    }
                    //$scope.selectedProduct.diningTableName = $scope.orderDetail.diningTableName;
                    var printList = [];
                    printList.diningTableName = $scope.orderDetail.diningTableName;
                    printList.status_name = "";
                    var print = {
                        id: $scope.selectedProduct.id,
                        status_id: 6,
                        quantity: $scope.selectedProduct.quantity,
                        category_id: $scope.selectedProduct.category_id,
                        p: {
                            name: $scope.selectedProduct.p.name,
                            unit: $scope.selectedProduct.p.unit
                        },
                        description: $scope.selectedProduct.description
                    }
                    printList.push(print)
                    var sayHell = function () {
                        $scope.$emit('$fromSubControllerClick', printList);
                    };
                    sayHell();
                    /*var data = {
           	shop_id: $scope.orderDetail.shop_id,
           	order_no: $scope.orderDetail.order_no,
           	ding_table_name: $scope.orderDetail.serial_id,
           	product_name: $scope.selectedProduct.p.name,
           	category_id: $scope.selectedProduct.p.category_id,
           	category_name: $scope.selectedProduct.p.category_name,
           	quantity: $scope.selectedProduct.quantity,
           	unit: $scope.selectedProduct.p.unit,
           	description: $scope.selectedProduct.description,
           	orderItem_id: $scope.selectedProduct.id,
           	table_runner: localStorage.getItem('name')
           }
           tableOperateService.printerProductCreate(
               data,
           	function (response) {
           		if (response.code == 500) {
           			alert('添加失败')
           			return
           		}
           		count++;
           		if(count==sum)window.location.href="#orderDetail/"+$routeParams.tableId;
           	},
           	function (error) {}
           );*/

                    getOrderDetail();
                    $('#tastedModal').modal('hide')
                },
                function (error) {
                }
            );
        }

        $scope.addOrder = function () {
            window.location.href = "#addOrder/" + $scope.orderDetail.id + '/' + ($scope.orderDetail.isOut ? 1 : 0);
        }

        $scope.pay = function () {
            window.location.href = "#payOrder/" + $routeParams.tableId;
        }

        $scope.cancelOrder = function () {
            if (confirm('确认删除订单？')) {
                var sum = 3;
                var count = 0;
                for (var j = 0; j < $scope.callServiceList.length; j++) {
                    if ($scope.callServiceList[j].dining_table_id == $scope.tableInf.id) {
                        tableOperateService.callServiceDelete({
                                id: $scope.callServiceList[j].id
                            },
                            function (response) {
                                if (response.code == 500) {
                                    alert('失败')
                                    return
                                }
                            },
                            function (error) {
                            }
                        );
                    }
                }
                tableOperateService.lotteryOrder({
                        id: $scope.orderDetail.id
                    },
                    function (response) {
                        if (response.code == 500) {
                            alert('获取获奖信息失败')
                            return
                        }
                        var lotteryOrder = response.msg;
                        if (lotteryOrder) {
                            tableOperateService.lotteryDelete({
                                    id: lotteryOrder.id
                                },
                                function (response) {
                                    if (response.code == 500) {
                                        alert('删除失败')
                                        return
                                    }
                                    count++
                                    if (count == sum)
                                        window.location.href = "#tableOperate/list";
                                },
                                function (error) {
                                }
                            );
                        } else {
                            count++
                            if (count == sum)
                                window.location.href = "#tableOperate/list";
                        }
                    },
                    function (error) {
                    }
                );

                var data = {
                    id: $scope.orderDetail.id,
                    shop_id: $scope.orderDetail.shop_id,
                    serial_id: $scope.orderDetail.serial_id,
                    dining_table_id: $scope.orderDetail.dining_table_id,
                    loi: null,
                    pay_person: localStorage.getItem('name'),
                    status_id: 2,
                    pay_type: 6,
                    total_free: $scope.totalPrice,
                    real_pay: 0,
                    description: $scope.orderDetail.description
                };
                tableOperateService.orderUpdate(data,
                    function (response) {
                        if (response.code == 500) {
                            alert('提交失败')
                            return
                        }
                        count++;
                        if (count == sum)
                            window.location.href = "#tableOperate/list";
                    },
                    function (error) {
                    }
                );

                $scope.tableInf.status = 0;
                tableOperateService.tableUpdate($scope.tableInf,
                    function (response) {
                        if (response.code == 500) {
                            alert('修改失败')
                            return
                        }
                        count++
                        if (count == sum)
                            window.location.href = "#tableOperate/list";
                    },
                    function (error) {
                    }
                );
            }
        }

        $scope.printer = function () {
            window.location.href = '#printerOrder/' + $routeParams.tableId;
        }

    }
])

tableOperateModule.controller('servingListController', ['$scope', '$location', '$routeParams', '$interval', 'tableOperateService',
    function ($scope, $location, $routeParams, $interval, tableOperateService) {
        $scope.totalQuantity = 0;
        $scope.totalPrice = 0;
        $scope.tableInf = {};

        $scope.addorder = function () {
            window.location.href = "#addOrder/" + $routeParams.tableId;
        }


        var getOrderDetail = function () {
            tableOperateService.orderDetail({
                    id: $routeParams.tableId
                },
                function (response) {
                    if (response.code == 500) {
                        alert('获取订单详情失败')
                        return
                    }

                    tableOperateService.tableView({
                            id: response.msg.dining_table_id
                        },
                        function (response) {
                            if (response.code == 500) {
                                alert('获取桌位信息失败')
                                return
                            }
                            $scope.tableInf = response.msg;
                            //getOrderDetail();
                        },
                        function (error) {
                        }
                    );

                    var orderDetail = response.msg
                    var totalQuantity = 0;
                    var totalPrice = 0;

                    for (var i = 0; i < orderDetail.loi.length; i++) {
                        totalQuantity += orderDetail.loi[i].quantity;
                        if (orderDetail.loi[i].p.is_promotion == 1) {
                            totalPrice += orderDetail.loi[i].p.promotion_price * orderDetail.loi[i].quantity;
                        } else {
                            totalPrice += orderDetail.loi[i].p.unit_price * orderDetail.loi[i].quantity;
                        }
                    }
                    $scope.orderDetail = orderDetail;
                    $scope.totalQuantity = totalQuantity;
                    $scope.totalPrice = totalPrice;
                },
                function (error) {
                }
            )
        }
        // var timeout_upd = $interval(getOrderDetail, 2000);
        // $scope.$on('$destroy',function(){
        // 	$interval.cancel(timeout_upd);
        // })
        getOrderDetail();
        $scope.upProduct = function (product) {
            if (product.status_id != 2) {
                if (!confirm("该菜品未开做，是否确认上菜？"))
                    return;
            }

            product.status_id = 3;
            tableOperateService.orderProductUpdate(product,
                function (response) {
                    if (response.code == 500) {
                        alert('上菜失败')
                        return
                    }
                    getOrderDetail();
                },
                function (error) {
                }
            );

        }
        $scope.deleteProduct = function (product) {
            tableOperateService.orderProductDelete(product,
                function (response) {
                    if (response.code == 500) {
                        alert('删除失败')
                        return
                    }
                    getOrderDetail();
                },
                function (error) {
                }
            );
        }
    }
])

tableOperateModule.controller('changeTableController', ['$scope', '$location', '$routeParams', 'tableOperateService',
    function ($scope, $location, $routeParams, tableOperateService) {
        $scope.callServiceList = [];

        var getCallServiceList = function () {
            tableOperateService.callServiceList({},
                function (response) {
                    if (response.code == 500) {
                        alert('获取呼叫服务列表失败')
                        return
                    }
                    $scope.callServiceList = response.msg
                },
                function (error) {
                }
            );
        }
        getCallServiceList();

        tableOperateService.tableView({
                id: $routeParams.tableId
            },
            function (response) {
                if (response.code == 500) {
                    alert('获取桌位信息失败')
                    return
                }
                $scope.tableInf = response.msg
            },
            function (error) {
            }
        );

        tableOperateService.tableList({},
            function (response) {
                if (response.code == 500) {
                    alert('获取桌位列表失败')
                    return
                }
                $scope.diningTableList = response.msg
            },
            function (error) {
            }
        )

        tableOperateService.orderDetail({
                id: $routeParams.tableId
            },
            function (response) {
                if (response.code == 500) {
                    alert('获取订单详情失败')
                    return
                }
                $scope.orderDetail = response.msg
            }
        );

        $scope.selectTable = {};
        $scope.changeTable = function (table) {
            if (!confirm("您确定要转至" + table.name + "吗？"))
                return;

            tableOperateService.zhuanZhuo({
                fromDiningTableId: $scope.selectTable.id,
                toDiningTableId: $scope.tableInf.id
            }, function (res) {
                console.log(res);
            })
            return;
            $scope.selectTable = table;
            var sum = 3;
            var count = 0;

            for (var i = 0; i < $scope.callServiceList.length; i++) {
                if ($scope.callServiceList[i].dining_table_id == $scope.tableInf.id) {
                    $scope.callServiceList[i].dining_table_id = $scope.selectTable.id;
                    $scope.callServiceList[i].serial_id = $scope.selectTable.name;
                    tableOperateService.callServiceUpdate($scope.callServiceList[i],
                        function (response) {
                            if (response.code == 500) {
                                alert('失败')
                                return
                            }
                        },
                        function (error) {
                        }
                    );
                }
            }

            $scope.selectTable.status = $scope.tableInf.status;
            tableOperateService.tableUpdate($scope.selectTable,
                function (response) {
                    if (response.code == 500) {
                        alert('提交失败')
                        return
                    }
                    count++;
                    if (count == sum)
                        window.location.href = "#tableOperate/list";
                },
                function (error) {
                }
            );
            $scope.tableInf.status = 0;
            tableOperateService.tableUpdate($scope.tableInf,
                function (response) {
                    if (response.code == 500) {
                        alert('提交失败')
                        return
                    }
                    count++;
                    if (count == sum)
                        window.location.href = "#tableOperate/list";
                },
                function (error) {
                }
            );
            var data = {
                id: $scope.orderDetail.id,
                shop_id: $scope.orderDetail.shop_id,
                serial_id: $scope.selectTable.name,
                dining_table_id: $scope.selectTable.id,
                loi: null,
                status_id: 0
            };
            tableOperateService.orderUpdate(data,
                function (response) {
                    if (response.code == 500) {
                        alert('提交失败')
                        return
                    }
                    count++;
                    if (count == sum)
                        window.location.href = "#tableOperate/list";
                },
                function (error) {
                }
            );
        }

    }
])

tableOperateModule.controller('mergeTableController',
    ['$scope', '$location', '$routeParams', 'tableOperateService',
        function ($scope, $location, $routeParams, tableOperateService) {
            $scope.mainTableId = $routeParams.tableId;
            $scope.diningTableList = [];
            $scope.selectTableList = [];


            tableOperateService.tableList({},
                function (response) {
                    if (response.code == 500) {
                        alert('获取桌位列表失败')
                        return
                    }
                    $scope.diningTableList = response.msg
                },
                function (error) {
                }
            )

            tableOperateService.orderDetail({
                    id: $routeParams.tableId
                },
                function (response) {
                    if (response.code == 500) {
                        alert('获取订单详情失败')
                        return
                    }
                    $scope.orderDetail = response.msg

                    tableOperateService.tableView({
                            id: $scope.orderDetail.dining_table_id
                        },
                        function (response) {
                            if (response.code == 500) {
                                alert('获取桌位信息失败')
                                return
                            }
                            $scope.mainOrderId = response.msg.orderId;
                            $scope.tableInf = response.msg
                            $scope.selectTableList.push($scope.tableInf);
                        },
                        function (error) {
                        }
                    );
                }
            );

            $scope.mergeTable = function () {
                $scope.selectTableList = [];
                $scope.selectTableList.push($scope.tableInf);
                $("input[name='table']").each(function () {
                    if ($(this).prop('checked') == true) {
                        /*
             if($scope.diningTableList[$(this).val()].id==$scope.mainTableId){
             	continue;
             }
             */
                        $scope.selectTableList.push($scope.diningTableList[$(this).val()])
                    }
                });

                console.log($scope.selectTableList);
                $('#standardModal').modal('show');
            }

            $scope.submitMergeTable = function () {
                var data = {
                    shopId: localStorage.getItem('shop_id'),
                    diningTablePid: $scope.selectTableList[0].orderId,
                    diningTableIdList: []
                };
                for (var i = 0; i < $scope.selectTableList.length; i++) {
                    if (i == 0)
                        continue;
                    data.diningTableIdList.push($scope.selectTableList[i].orderId);
                }

                tableOperateService.mergeOrder(data,
                    function (response) {
                        if (response.code == 500) {
                            alert('添加失败')
                            return
                        }
                        $('#standardModal').modal('hide').on('hidden.bs.modal', function () {
                            window.location.href = '#payOrder/' + $scope.mainOrderId + "?isMerge=1";
                        })
                    },
                    function (error) {
                    }
                );

            }

        }
    ])


tableOperateModule.controller('payOrderController',
    ['$scope', '$location', '$routeParams', '$interval', 'tableOperateService', 'md5', 'DataUtilService', 'PrinterService', 'shopInformationService', 'lotteryLogService',
        function ($scope, $location, $routeParams, $interval, tableOperateService, md5, DataUtilService, PrinterService, shopInformationService, lotteryLogService) {

            $scope.totalPrice = 0;
            $scope.tableInf = {};
            $scope.mergeTableList = [];
            $scope.orderList = [];

            $scope.isUseMember = 0;
            $scope.memberPhone = "";
            $scope.member = {};


            $scope.memberId = null;
            $scope.memberIdentifier = null;
            $scope.memberCardName = null;
            $scope.memberCardDiscount = null;

            $scope.ifCLodp = 0;
            var getIfCLodop = function () {
                if (typeof (getCLodop) == 'undefined') {
                    $scope.ifCLodp = 0;
                } else {
                    $scope.ifCLodp = 1;
                }
            }

            getIfCLodop();
            $scope.downloadLodop32 = function () {
                window.location.href = (apiHost + '/downloadLodop');
            }

            //  tableOperateService.memberList({},
            //    function (response) {
            //      if (response.code == 500) {
            //        alert('获取会员信息失败')
            //        return
            //      }
            //      $scope.memberList = response.msg;
            //    },
            //    function (error) {}
            //  );

            var reg = /^\d+(\.\d+)?$/;
            $scope.discount = '';
            $scope.residue = '';
            $scope.income = '';
            $scope.payable = '';
            $scope.odd = '';
            $scope.payType = 0;

            $scope.nowKey = localStorage.getItem('now_keys');
            $scope.service_charge = parseFloat(localStorage.getItem('service_charge'));

            $scope.cashPay = 0;
            $scope.wxPay = 0;
            $scope.zfbPay = 0;
            $scope.cardPay = 0;
            $scope.balancePay = 0;
            $scope.integralPay = 0;
            $scope.orderDescription = "";

            $scope.changeUseMember = function () {
                if ($('#selectMemberPay').prop('checked') == true) {
                    $scope.isUseMember = 1;
                    $scope.discount = "";
                    $('#memberPhone').removeAttr("disabled");
                    $('#balancePay').removeAttr("disabled");
                    $('#integralPay').removeAttr("disabled");
                    $('#discount').attr("disabled", "disabled");
                    //$scope.changePrice();
                } else {
                    $scope.isUseMember = 0;
                    $scope.memberPhone = "";
                    $scope.member = {};
                    $scope.balancePay = 0;
                    $scope.integralPay = 0;
                    $('#memberPhone').attr("disabled", "disabled");
                    $('#balancePay').attr("disabled", "disabled");
                    $('#integralPay').attr("disabled", "disabled");
                    $('#discount').removeAttr("disabled");
                    $scope.changePrice();
                }
            }

            $scope.searchMember = function () {
                if ($scope.memberPhone == "") {
                    alert('所填查询依据为空,请确认输入');
                    return;
                }
                var reg = /^1[0-9]{10}$/;
                //if($scope.memberPhone!=""){
                var members = [];
                if (reg.test($scope.memberPhone)) {
                    for (var i = 0; i < $scope.memberList.length; i++) {
                        if ($scope.memberList[i].is_in_use == 0) alert("该会员未激活!")
                        if ($scope.memberList[i].is_in_use == 1 && $scope.memberPhone == $scope.memberList[i].phone) {
                            $scope.member = $scope.memberList[i];
                            members.push($scope.memberList[i])
                            //$scope.changePrice();
                            //return;
                        }
                    }
                } else {

                    for (var i = 0; i < $scope.memberList.length; i++) {
                        //if($scope.memberList[i].is_in_use==0)alert("该会员未激活!")
                        if ($scope.memberList[i].is_in_use == 1 && $scope.memberPhone == $scope.memberList[i].name) {
                            members.push($scope.memberList[i])
                            //$scope.member = $scope.memberList[i];
                            //$scope.changePrice();
                            //continue;
                        }
                    }
                }
                var memberLength = members.length;
                if (memberLength < 1) {
                    alert("查无此会员");
                } else if (memberLength == 1) {
                    $scope.memberPhone = members[0].phone;
                    $scope.member = members[0];
                    $scope.changePrice();
                } else {
                    alert('查询多个结果,请点击选择');
                    $scope.memberPhone = ''
                    $scope.members = members;
                }
                console.log("$scope.memberPhone ------ ", $scope.memberPhone);
                //$scope.member = {};
                //$scope.changePrice();
                //}
            }

            $scope.memberIntegarDiscount = '';

            tableOperateService.memberIntegralList({},
                function (response) {
                    if (response.code == 500) {
                        alert('获取会员信息失败')
                        return
                    }
                    var member = response.msg;
                    //alert("test")
                    console.log(member)
                    //if(member.convertMoney!=null&&isNaN(member.convertMoney)){
                    if (member != null) $scope.memberIntegarDiscount = parseFloat(member.convertMoney / member.convertIntegral).toFixed(2);
                    // }
                },
                function (error) {
                }
            );

            $scope.getIntegraCash = function (value) {

                var integraCash = $scope.memberIntegarDiscount * value;
                console.log("integraCash---");
                console.log(integraCash);
                var isNan = isNaN(integraCash)
                return parseInt($scope.memberIntegarDiscount * value == null ? 0 : $scope.memberIntegarDiscount * value);
            }

            var shop = {};
            shopInformationService.view({
                    id: localStorage.getItem("shop_id")
                },
                function (response) {
                    if (response.code == 200) {
                        shop = response.msg;
                        //console.log(shop);
                    } else {
                        alert("printerOrderController_shopInformationService.view");
                    }
                },
                function (error) {
                }
            );

            var printer_999 = {};
            PrinterService.getPrinterByPrinter_type({
                    printer_type: 999
                },
                function (response) {
                    if (response.code == 200) {
                        printer_999 = response.msg;
                    }
                },
                function (error) {
                }
            )
            //console.log("$routeParams ------ ",$routeParams);
            var getOrderDetail = function () {
                tableOperateService.orderlist({
                        id: $routeParams.tableId
                    },
                    function (response) {
                        console.log("response ------ ", response);
                        if (response.code == 500) {
                            alert('获取订单详情失败')
                            return
                        }

                        tableOperateService.orderDetail({
                            id: $routeParams.tableId
                        }, function (order) {
                            tableOperateService.tableView({
                                    id: order.msg.dining_table_id
                                },
                                function (response) {
                                    if (response.code == 500) {
                                        alert('获取桌位信息失败')
                                        return
                                    }
                                    $scope.tableInf = response.msg;
                                    //getOrderDetail();
                                },
                                function (error) {
                                }
                            );
                            //console.log("$location ------ ",$location);
                            if ($location.search().isMerge && $location.search().isMerge == 1) {

                                var detail = response.msg;
                                tableOperateService.orderDetailById({
                                        id: detail.id
                                    },
                                    function (response2) {
                                        //console.log("response2 ------ ",response2);
                                        $scope.orderList = response.msg;
                                        $scope.setOrderList();
                                        $scope.defautResidue();
                                    }
                                );
                            } else {
                                $scope.orderList.push(response.msg);
                                $scope.setOrderList();
                                $scope.defautResidue();
                            }
                        })
                    },
                    function (error) {
                    }
                )
            }

            getOrderDetail();
            $scope.setOrderList = function () {

                var totalPrice = 0;
                var payable = 0;
                //折扣优惠金额
                var discountPreferentialMoney = 0.00;
                for (var i = 0; i < $scope.orderList.length; i++) {
                    for (var j = 0; j < $scope.orderList[i].loi.length; j++) {
                        var product = $scope.orderList[i].loi[j]; //商品
                        var price = 0; //总价
                        //是否赠送
                        if (product.is_lottery == 1) {
                            $scope.orderList[i].loi[j].total_price = parseFloat(0).toFixed(2);
                            ;
                            continue;
                        }
                        //是否断货/取消
                        if (product.status_id == 6 || product.status_id == 7) {
                            $scope.orderList[i].loi[j].total_price = parseFloat(0).toFixed(2);
                            ;
                            continue;
                        }
                        //菜品实际价格price
                        var moneyPreferentialDiscount = 0.00;
                        if (product.p.is_promotion == 1) {

                            price = product.p.promotion_price;

                        } else {
                            var isUseMemberPrice = product.p.isUseMemberPrice;

                            if ($scope.isUseMember == 1 && isUseMemberPrice == 1) {

                                price = product.p.memberPrice;

                            } else if ($scope.isUseMember == 1 && product.p.isMemberDiscount == 1) {

                                price = product.p.unit_price * $scope.member.memberCardDiscount;

                                moneyPreferentialDiscount = product.p.unit_price * (1 - $scope.member.memberCardDiscount);

                            } else if ($scope.isUseMember == 0 && product.p.is_discount == 1 && $scope.discount != '') {

                                if (!reg.test($scope.discount)) {
                                    alert("所填普通折扣格式异常!");
                                    return;
                                }
                                price = product.p.unit_price * $scope.discount;
                                moneyPreferentialDiscount = product.p.unit_price * (1 - $scope.discount);

                            } else {

                                price = product.p.unit_price;

                            }
                        }

                        var totalPrice_orderItem = price * product.quantity;

                        discountPreferentialMoney += parseFloat(moneyPreferentialDiscount);
                        totalPrice += parseFloat(totalPrice_orderItem);
                        payable += parseFloat(totalPrice_orderItem);
                        price = parseFloat(totalPrice_orderItem).toFixed(2);

                        $scope.orderList[i].loi[j].total_price = price;

                    }
                    var service_charge = localStorage.getItem("service_charge");
                    //console.log("$scope.orderList[i] ------ ",$scope.orderList[i]);
                    if ($scope.tableInf.is_out == 0 &&
                        service_charge != null &&
                        service_charge != 0 &&
                        $scope.orderList[i].isLotteryCash != null) {
                        totalPrice += $scope.service_charge;
                        payable += $scope.service_charge;
                    }
                }


                $scope.discountPreferentialMoney = parseFloat(discountPreferentialMoney).toFixed(2);
                $scope.payable = parseFloat(payable).toFixed(2);
                $scope.totalPrice = parseFloat(totalPrice).toFixed(2);

            }

            $scope.defautResidue = function () {
                $scope.residue = parseFloat('0.' + $scope.payable.split(".")[1]).toFixed(2);
                $scope.payable = parseFloat($scope.payable.split(".")[0]).toFixed(2);

            }

            $scope.changePrice = function () {
                $scope.setOrderList();
                $scope.defautResidue();
                if (reg.test($scope.income)) {
                    $scope.odd = parseFloat($scope.income - $scope.payable).toFixed(2);
                    $scope.income = parseFloat($scope.income).toFixed(2)
                }
            }

            $scope.changeResidue = function () {
                $scope.setOrderList();
                if (reg.test($scope.residue)) {
                    $scope.payable = parseFloat($scope.payable - $scope.residue).toFixed(2);
                }
                $scope.changeIncome();
            }

            $scope.changeIncome = function () {
                if (reg.test($scope.income)) {
                    $scope.odd = parseFloat($scope.income - $scope.payable).toFixed(2);
                    $scope.income = parseFloat($scope.income).toFixed(2)
                }
            }

            $scope.orderPay = function () {
                var code = 0;
                for (var i = 0; i < $scope.orderList.length; i++) {
                    for (var j = 0; j < $scope.orderList[i].loi.length; j++) {
                        if ($scope.orderList[i].loi[j].status_id != 3) {
                            code++;
                            break;
                        }
                    }
                }
                if (code > 0) {
                    if (!confirm("有菜品未上菜，是否继续结账？"))
                        return
                }

                if ($scope.ifCLodp == 0) {
                    if (!confirm("您未安装打印驱动，将无法打印小票，是否确认结账？")) {
                        return;
                    }
                }

                var sum = 0;
                if ($scope.isUseMember == 1) {
                    sum = parseFloat($scope.cashPay) +
                        parseFloat($scope.wxPay) +
                        parseFloat($scope.zfbPay) +
                        parseFloat($scope.cardPay) +
                        parseInt($scope.integralPay * $scope.memberIntegarDiscount) +
                        parseFloat($scope.balancePay);
                } else {
                    sum = parseFloat($scope.cashPay) +
                        parseFloat($scope.wxPay) +
                        parseFloat($scope.zfbPay) +
                        parseFloat($scope.cardPay);
                }

                if (sum != $scope.payable) {
                    alert("支付总额错误,请重新确认!");
                    return;
                }
                //alert("cancel")
                if ($scope.isUseMember == 1) {
                    if (!$scope.member.id) {
                        alert("查无此会员");
                        return;
                    }
                    $scope.memberId = $scope.member.id;
                    $scope.memberIdentifier = $scope.member.phone;
                    $scope.memberCardName = $scope.member.memberCardName;
                    $scope.memberCardDiscount = $scope.member.memberCardDiscount;
                    $('#myModal').modal('show').on('shown.bs.modal', function () {
                        $("#memberPassword").focus();
                    })
                } else {
                    $scope.memberId = null;
                    $scope.memberIdentifier = null;
                    $scope.memberCardName = null;
                    $scope.memberCardDiscount = null;
                    $scope.integralPay = 0;
                    $scope.balancePay = 0;
                    orderSubmit();
                }
                //orderSubmit();

            }

            $scope.memberPay = function () {
                if (md5.createHash($scope.memberPassword) == $scope.member.pay_password) {
                    if ($scope.member.balance < $scope.balancePay) {
                        alert("您的余额不足");
                        return;
                    }
                    if ($scope.member.integral < $scope.integralPay) {
                        alert("您的积分不足");
                        return;
                    }
                    $('#myModal').modal('hide').on('hidden.bs.modal', function () {
                        orderSubmit();
                    })
                } else {
                    alert("支付密码错误");
                    return;
                }
            }

            $scope.freePay = function () {
                if ($scope.orderList[0].description == null || $scope.orderList[0].description == "") {
                    alert("请在订单/主订单的备注信息处填写免单原因");
                    return;
                }
                $scope.payType = 120;
                orderSubmit();
            }
            $scope.chargeUp = function () {
                if ($scope.orderList[0].description == null || $scope.orderList[0].description == "") {
                    alert("请在订单/主订单的备注信息处填写挂账原因");
                    return;
                }
                $scope.payType = 130;
                orderSubmit();
            }

            $scope.getIntegraCash = function (value) {
                var integraCash = $scope.memberIntegarDiscount * value;

                var isNan = isNaN(integraCash)
                return parseInt($scope.memberIntegarDiscount * value == null ? 0 : $scope.memberIntegarDiscount * value);
            }

            var orderSubmit = function () {

                //结账单打印
                if ($scope.ifCLodp == 1) {

                    var nowTime = DataUtilService.getNowTime();
                    var LODOP = getCLodop();
                    LODOP.SET_LICENSES("", "3E893A594C00D5D9C1DBE7CD18C9E8DB", "C94CEE276DB2187AE6B65D56B3FC2848", "");
                    LODOP.PRINT_INITA(1, 1, 700, 600, '商铺' + localStorage.getItem("shop_id") + '_结账单' + nowTime);

                    var printer_name = printer_999.name;

                    var pageWidth = printer_999.page_width;
                    if (pageWidth == null || pageWidth == 0) {
                        alert("纸张宽度不能为空或零,请在打印设置中设置");
                    }
                    LODOP.SET_PRINT_PAGESIZE(3, pageWidth + "mm", "5mm", "");

                    var flag = LODOP.SET_PRINTER_INDEX(printer_name);
                    if (flag) {
                        var top = 1;
                        LODOP.ADD_PRINT_TEXT(top + "mm", "45%", pageWidth + "mm", "6mm", "结账单");
                        LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                        LODOP.SET_PRINT_STYLEA(0, "Horient", 2);
                        LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                        LODOP.SET_PRINT_STYLEA(0, "FontSize", 15);

                        top += 5;
                        LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "订单编号:" + $scope.orderList[0].order_no);

                        top += 5;
                        LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "收款员:" + localStorage.getItem("name"));

                        top += 5;
                        LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "结账时间:" + nowTime);

                        top += 5;
                        LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - -- - - - - - - - -- - -- - ");

                        top += 5;
                        LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "品名");
                        LODOP.ADD_PRINT_TEXT(top + "mm", "42%", "100%", "6mm", "单价");
                        LODOP.ADD_PRINT_TEXT(top + "mm", "62%", "100%", "6mm", "数量");
                        LODOP.ADD_PRINT_TEXT(top + "mm", "81%", "100%", "6mm", "金额");


                        var orderList = $scope.orderList;
                        for (var l = 0; l < orderList.length; l++) {

                            //以category_id分组
                            var orderItemList = orderList[l].loi;

                            function compare(property) {
                                return function (a, b) {
                                    var value1 = a[property];
                                    var value2 = b[property];
                                    return value1 - value2;
                                }
                            }

                            orderItemList.sort(compare('category_id'));

                            var orderItemListCategoryId = []
                            var orderItemList_category = [];
                            for (var i = 0; i < orderItemList.length; i++) {
                                if (i == 0 || orderItemList[i].category_id == orderItemList[i - 1].category_id) {

                                    orderItemListCategoryId.push(orderItemList[i]);

                                } else {
                                    orderItemListCategoryId.sort(compare('product_id'));
                                    orderItemList_category.push(orderItemListCategoryId);

                                    orderItemListCategoryId = [];

                                    orderItemListCategoryId.push(orderItemList[i]);

                                }
                                if (i == orderItemList.length - 1) {

                                    orderItemListCategoryId.sort(compare('product_id'));

                                    orderItemList_category.push(orderItemListCategoryId)
                                }
                            }

                            var orderItemList_category_productId = [];

                            for (var i = 0; i < orderItemList_category.length; i++) {

                                var productId_orderItemList = [];

                                var orderItemList_categoryProductId = [];

                                var orderItemList_category_productIdNormal = []
                                //商品ID分组
                                for (var j = 0; j < orderItemList_category[i].length; j++) {

                                    if (j == 0 || orderItemList_category[i][j].product_id == orderItemList_category[i][j - 1].product_id) {

                                        if (orderItemList_category[i][j].is_lottery != 1 && orderItemList_category[i][j].status_id != 6 && orderItemList_category[i][j].status_id != 7) {

                                            orderItemList_category_productIdNormal.push(orderItemList_category[i][j])

                                        } else {

                                            productId_orderItemList.push(orderItemList_category[i][j]);
                                        }

                                        if (j == orderItemList_category[i].length - 1) {

                                            if (orderItemList_category_productIdNormal.length > 0) {

                                                if (orderItemList_category_productIdNormal.length == 1) {

                                                    productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                }
                                                if (orderItemList_category_productIdNormal.length > 1) {

                                                    for (var f = 1; f < orderItemList_category_productIdNormal.length; f++) {

                                                        orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[f].quantity;

                                                        console.log(orderItemList_category_productIdNormal)

                                                    }
                                                    productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                }
                                            }
                                            orderItemList_categoryProductId.push(productId_orderItemList);

                                            orderItemList_category_productIdNormal = []
                                        }

                                    } else {

                                        if (orderItemList_category_productIdNormal.length > 0) {

                                            if (orderItemList_category_productIdNormal.length == 1) {

                                                productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                            }
                                            if (orderItemList_category_productIdNormal.length > 1) {
                                                for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {
                                                    orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;
                                                }
                                                productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                            }
                                        }

                                        orderItemList_categoryProductId.push(productId_orderItemList);

                                        productId_orderItemList = []
                                        orderItemList_category_productIdNormal = []

                                        if (orderItemList_category[i][j].is_lottery != 1 && orderItemList_category[i][j].status_id != 6 && orderItemList_category[i][j].status_id != 7) {

                                            orderItemList_category_productIdNormal.push(orderItemList_category[i][j])

                                        } else {
                                            productId_orderItemList.push(orderItemList_category[i][j]);
                                        }
                                        if (j == orderItemList_category[i].length - 1) {

                                            if (orderItemList_category_productIdNormal.length > 0) {
                                                if (orderItemList_category_productIdNormal.length == 1) {
                                                    productId_orderItemList.push(orderItemList_category_productIdNormal[0])
                                                }
                                                if (orderItemList_category_productIdNormal.length > 1) {
                                                    for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {

                                                        orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;
                                                    }
                                                    productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                }
                                            }
                                            orderItemList_categoryProductId.push(productId_orderItemList);
                                            orderItemList_category_productIdNormal = []
                                        }
                                    }
                                }

                                orderItemList_category_productId.push(orderItemList_categoryProductId);

                                orderItemList_categoryProductId = []
                            }

                            top += 5;
                            LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");
                            top += 5;
                            LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", "桌位:" + orderList[l].serial_id + (orderList[l].length > 1 && k == 0 ? "[主订单]" : ""));
                            for (var p = 0; p < orderItemList_category_productId.length; p++) {
                                top += 6;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "5%", "100%", "4mm", orderItemList_category_productId[p][0][0].category_name);
                                LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                                for (var t = 0; t < orderItemList_category_productId[p].length; t++) {

                                    for (var y = 0; y < orderItemList_category_productId[p][t].length; y++) {
                                        top += 6;
                                        LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "3mm", orderItemList_category_productId[p][t][y].p.name);
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "55%", "100%", "4mm", orderItemList_category_productId[p][t][y].p.is_promotion == 1 ? orderItemList_category_productId[p][t][y].p.promotion_price : orderItemList_category_productId[p][t][y].p.unit_price);
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "67%", "100%", "4mm", orderItemList_category_productId[p][t][y].quantity)
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "79%", "100%", "4mm", orderItemList_category_productId[p][t][y].is_lottery == 1 ? "赠送" : orderItemList_category_productId[p][t][y].status_id == 6 ? '退菜' : orderItemList_category_productId[p][t][y].status_id == 7 ? '断货' : orderItemList_category_productId[p][t][y].p.is_promotion == 1 ? (orderItemList_category_productId[p][t][y].p.promotion_price * orderItemList_category_productId[p][t][y].quantity).toFixed(2) : (orderItemList_category_productId[p][t][y].p.unit_price * orderItemList_category_productId[p][t][y].quantity).toFixed(2));
                                    }
                                }
                            }


                            if ($scope.tableInf.is_out == 0 && shop.service_charge != null && shop.service_charge != 0 && $scope.orderCashed == 1) {
                                top += 6;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "3mm", "一元乐购");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "55%", "100%", "4mm", shop.service_charge);
                                LODOP.ADD_PRINT_TEXT(top + "mm", "67%", "100%", "4mm", "1");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "79%", "100%", "4mm", shop.service_charge);
                            }
                        }
                        top += 6
                        LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - -");

                        if ($scope.cashPay != "" && $scope.cashPay != 0) {
                            top += 6;
                            LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "现金支付: " + $scope.cashPay);
                        }


                        if ($scope.wxPay != "" && $scope.wxPay != 0) {
                            top += 6;
                            LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "微信支付: " + $scope.wxPay);
                        }


                        if ($scope.zfbPay != "" && $scope.zfbPay != 0) {
                            top += 6;
                            LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "支付宝支付: " + $scope.zfbPay);
                        }


                        if ($scope.cardPay != "" && $scope.cardPay != 0) {
                            top += 6;
                            LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "银行卡支付: " + $scope.cardPay);
                        }


                        if ($scope.balancePay != "" && $scope.balancePay != 0) {
                            top += 6;
                            LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "余额支付: " + $scope.balancePay);
                        }


                        if ($scope.integralPay != "" && $scope.integralPay != 0) {
                            top += 6;
                            LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "积分支付: " + $scope.integralPay);
                        }

                        top += 6;
                        LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "合计应收: " + $scope.totalPrice);

                        if ($scope.discount != "" && $scope.discount != 0) {
                            top += 6;
                            LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "折扣: " + $scope.discount);
                        }

                        if ($scope.residue != "" && $scope.residue != 0) {
                            top += 6;
                            LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "抹零: " + $scope.residue);
                        }


                        top += 6;
                        LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "实收: " + $scope.payable);

                        if ($scope.isUseMember == 1) {
                            top += 4;
                            LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");

                            top += 6;
                            LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "会员余额: " + ($scope.member.balance - $scope.balancePay));

                            top += 4;
                            LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");
                        }

                        var isFreeSingleOrIsBill = $scope.payType == 120 ? "免单支付" : $scope.payType == 130 ? "挂账支付" : false;
                        console.log("orderList[0] ------ ");
                        console.log(orderList[0]);

                        if (isFreeSingleOrIsBill) {
                            top += 4;
                            LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");
                            top += 6;
                            LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", isFreeSingleOrIsBill);
                            LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                            top += 4;
                        }

                        /* if(shop.pay_code_id!=null){
			    	top+=6;
					LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","付款码: ");
					top+=6;
					var imgUrl = apiHost+'/image/'+ shop.pay_code_id;
					LODOP.ADD_PRINT_BARCODE(top+"mm","15%","22%","22%","QRCode","<div><img src="+imgUrl+"/></div>");
					//http://test-admin.lbcy.com.cn/www/#/table/
					//LODOP.ADD_PRINT_BARCODE(to
					p+"mm","15%","22%","22%","QRCode","http://test-admin.lbcy.com.cn/www/#/table/10036");
					//LODOP. ADD_PRINT_IMAGE (1,"5%","100%","100%","<img src="+imgUrl+"/>");
					//LODOP. ADD_PRINT_HTML (top+"mm","5%","100%","100%","<div><img src="+imgUrl+"/></div>");
					//LODOP.SET_PRINT_STYLEA(0,"HtmWaitMilSecs",1000);
					top+=40;
				}*/
                        top += 4;
                        LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");

                        /*top+=4;
             LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","商铺名称:"+shop.shop_name);

             top+=4;
             LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","联系方式:"+shop.phone);*/

                        top += 4;
                        LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");

                        top += 4;
                        LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "6mm", "技术支持：河北玄宇通网络科技有限公司");

                        top += 4;
                        LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "6mm", "服务热线：400－0217－123");
                        //dev
                        LODOP.PREVIEW();

                        //LODOP.PRINT();

                    } else {
                        alert("打印机名称对应打印设备不存在");
                    }

                }
                if ($scope.isUseMember == 1) {
                    if (!$scope.member.id) {
                        alert("查无此会员");
                        return;
                    }
                    $scope.memberId = $scope.member.id;
                    $scope.memberIdentifier = $scope.member.phone;
                    $scope.memberCardName = $scope.member.memberCardName;
                    $scope.memberCardDiscount = $scope.member.memberCardDiscount;
                    $('#myModal').modal('show').on('shown.bs.modal', function () {
                        $("#memberPassword").focus();
                    })
                } else {
                    $scope.memberId = null;
                    $scope.memberIdentifier = null;
                    $scope.memberCardName = null;
                    $scope.memberCardDiscount = null;
                    $scope.integralPay = 0;
                    $scope.balancePay = 0;
                    //orderSubmit();
                }
                var payable = $scope.payable

                if ($scope.payType == 120) payable = 0;

                if ($scope.tableInf.is_out == 1) $scope.service_charge = 0;
                //提交订单修改
                var data = {
                    id: $scope.orderList[0].id,
                    shop_id: $scope.orderList[0].shop_id,
                    serial_id: $scope.orderList[0].serial_id,
                    dining_table_id: $scope.orderList[0].dining_table_id,
                    loi: null,
                    pay_person: localStorage.getItem('name'),
                    status_id: 1,
                    pay_type: $scope.payType,
                    total_free: $scope.totalPrice,
                    real_pay: payable,
                    discount: $scope.discount,
                    residue: $scope.residue,
                    income: $scope.income,
                    odd: $scope.odd,
                    service_charge: $scope.service_charge,
                    isUseMember: $scope.isUseMember,
                    description: $scope.orderList[0].description,

                    memberId: $scope.memberId,
                    memberIdentifier: $scope.memberIdentifier,
                    memberCardName: $scope.memberCardName,
                    memberCardDiscount: $scope.memberCardDiscount,

                    tradeMemberIntegral: $scope.integralPay,
                    tradeMemberMoney: $scope.balancePay,
                    tradeCash: $scope.cashPay,
                    tradeWechat: $scope.wxPay,
                    tradeAlipay: $scope.zfbPay,
                    tradeCreditCard: $scope.cardPay,

                    discountPreferentialMoney: $scope.discountPreferentialMoney
                };

                tableOperateService.orderPay(
                    data,
                    function (response) {
                        if (response.code != 200) {

                            alert(response.msg);
                            return;
                        }
                        window.location.href = "#tableOperate/list";
                    },
                    function (error) {
                        console.log("error ------ ");
                        console.log(error)
                        alert('结账失败');
                    }
                );
            }

            console.log("打印预打单");

            $scope.printPay = function () {
                var service_charge = shop.service_charge;
                console.log("service_charge")
                console.log(shop)
                console.log(" ")
                PrinterService.getPrinterByPrinter_type({
                        printer_type: 999
                    },
                    function (response) {
                        if (response.code == 200) {

                            var nowTime = DataUtilService.getNowTime();
                            var printer = response.msg;

                            var LODOP = getCLodop();
                            LODOP.SET_LICENSES("", "3E893A594C00D5D9C1DBE7CD18C9E8DB", "C94CEE276DB2187AE6B65D56B3FC2848", "");
                            LODOP.PRINT_INITA(1, 1, 700, 600, '商铺' + localStorage.getItem('shop_id') + '_对账单');

                            var printer_name = printer.name;

                            var pageWidth = printer.page_width;
                            if (pageWidth == null || pageWidth == 0) {
                                alert("纸张宽度不能为空或零");
                                return;
                            }
                            LODOP.SET_PRINT_PAGESIZE(3, pageWidth + "mm", "", "");


                            //var flag = LODOP.SET_PRINTER_INDEXA('XP-80C');
                            var flag = LODOP.SET_PRINTER_INDEXA(printer_name);
                            if (flag) {
                                var top = 1;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "4mm", pageWidth + "mm", "8mm", "预打单");
                                LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                                LODOP.SET_PRINT_STYLEA(0, "Horient", 2);
                                LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                                LODOP.SET_PRINT_STYLEA(0, "FontSize", 15);

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "订单编号:" + $scope.orderList[0].order_no);

                                /*top+=5;
                 LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","4mm", "桌位:"+$scope.orderDetail.serial_id);	*/

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "收款员:" + localStorage.getItem("name"));

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "结账时间:" + nowTime);

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - -- - - - - - - - -- - -- - ");

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "品名");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "42%", "100%", "6mm", "单价");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "62%", "100%", "6mm", "数量");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "81%", "100%", "6mm", "金额");

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - -- - - - - - - - -- - -- - ");

                                var totalMemberMoney = 0.00;

                                var totalMoney = 0.00;
                                var payableMoney = 0.00;
                                var totalServiceMoney = 0.00;

                                var printerList = [];
                                for (var l = 0; l < $scope.orderList.length; l++) {
                                    printerList = $scope.orderList[l].loi;
                                    top += 2;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", " ");
                                    top += 5;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", "桌位:" + $scope.orderList[l].serial_id + ($scope.orderList[l].length > 1 && k == 0 ? "[主订单]" : ""));

                                    //分类
                                    console.log("printerList")
                                    console.log(printerList)
                                    console.log(" ")


                                    var orderItemList = printerList;
                                    console.log(orderItemList)

                                    //排序
                                    function compare(property) {
                                        return function (a, b) {
                                            var value1 = a[property];
                                            var value2 = b[property];
                                            return value1 - value2;
                                        }
                                    }

                                    orderItemList.sort(compare('category_id'));

                                    var total = 0.00;
                                    var payable = 0.00;
                                    var totalMemberPrice = 0.00;
                                    //category分组
                                    var category_orderItemList = []
                                    var orderItemList_category = [];

                                    for (var i = 0; i < orderItemList.length; i++) {

                                        if (i == 0 || orderItemList[i].category_id == orderItemList[i - 1].category_id) {


                                            category_orderItemList.push(orderItemList[i]);

                                            if (i == orderItemList.length - 1) {
                                                category_orderItemList.sort(compare('product_id'));
                                                orderItemList_category.push(category_orderItemList);
                                            }


                                            total += orderItemList[i].p.is_promotion == 1 ? orderItemList[i].quantity * orderItemList[i].p.promotion_price : orderItemList[i].quantity * orderItemList[i].p.unit_price
                                            if (orderItemList[i].is_lottery != 1 && orderItemList[i].status_id != 6 && orderItemList[i].status_id != 7) {
                                                payable += orderItemList[i].p.is_promotion == 1 ? orderItemList[i].quantity * orderItemList[i].p.promotion_price : orderItemList[i].quantity * orderItemList[i].p.unit_price
                                                //会员价
                                                if (orderItemList[i].p.is_promotion == 1) {

                                                    totalMemberPrice += orderItemList[i].p.promotion_price * orderItemList[i].quantity;

                                                } else if (orderItemList[i].p.isUseMemberPrice == 1) {

                                                    totalMemberPrice += orderItemList[i].p.memberPrice * orderItemList[i].quantity;

                                                } else {
                                                    totalMemberPrice += orderItemList[i].p.unit_price * orderItemList[i].quantity;
                                                }
                                            }

                                        } else {

                                            total += orderItemList[i].p.is_promotion == 1 ? orderItemList[i].quantity * orderItemList[i].p.promotion_price : orderItemList[i].quantity * orderItemList[i].p.unit_price
                                            if (orderItemList[i].is_lottery != 1 && orderItemList[i].status_id != 6 && orderItemList[i].status_id != 7) {
                                                payable += orderItemList[i].p.is_promotion == 1 ? orderItemList[i].quantity * orderItemList[i].p.promotion_price : orderItemList[i].quantity * orderItemList[i].p.unit_price
                                                //会员价
                                                if (orderItemList[i].p.is_promotion == 1) {

                                                    totalMemberPrice += orderItemList[i].p.promotion_price * orderItemList[i].quantity;

                                                } else if (orderItemList[i].p.isUseMemberPrice == 1) {

                                                    totalMemberPrice += orderItemList[i].p.memberPrice * orderItemList[i].quantity;

                                                } else {
                                                    totalMemberPrice += orderItemList[i].p.unit_price * orderItemList[i].quantity;
                                                }
                                            }

                                            category_orderItemList.sort(compare('product_id'));
                                            orderItemList_category.push(category_orderItemList);
                                            category_orderItemList = [];

                                            category_orderItemList.push(orderItemList[i]);

                                            if (i == orderItemList.length - 1) orderItemList_category.push(category_orderItemList);


                                        }
                                    }
                                    console.log(orderItemList_category)

                                    var orderItemList_category_productId = [];
                                    for (var i = 0; i < orderItemList_category.length; i++) {

                                        var productId_orderItemList = [];
                                        var orderItemList_categoryProductId = [];

                                        var orderItemList_category_productIdNormal = []
                                        //商品ID分组
                                        for (var j = 0; j < orderItemList_category[i].length; j++) {

                                            if (j == 0 || orderItemList_category[i][j].product_id == orderItemList_category[i][j - 1].product_id) {

                                                if (orderItemList_category[i][j].is_lottery != 1 && orderItemList_category[i][j].status_id != 6 && orderItemList_category[i][j].status_id != 7) {

                                                    orderItemList_category_productIdNormal.push(orderItemList_category[i][j])

                                                } else {

                                                    productId_orderItemList.push(orderItemList_category[i][j]);
                                                }

                                                if (j == orderItemList_category[i].length - 1) {

                                                    if (orderItemList_category_productIdNormal.length > 0) {

                                                        if (orderItemList_category_productIdNormal.length == 1) {

                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])
                                                            console.log(orderItemList_category_productIdNormal)

                                                        }
                                                        if (orderItemList_category_productIdNormal.length > 1) {

                                                            for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {

                                                                orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;

                                                            }
                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                        }
                                                    }
                                                    orderItemList_categoryProductId.push(productId_orderItemList);

                                                    orderItemList_category_productIdNormal = []
                                                }
                                            } else {

                                                if (orderItemList_category_productIdNormal.length > 0) {

                                                    if (orderItemList_category_productIdNormal.length == 1) {

                                                        productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                    }
                                                    if (orderItemList_category_productIdNormal.length > 1) {
                                                        for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {
                                                            orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;
                                                        }
                                                        productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                    }
                                                }

                                                orderItemList_categoryProductId.push(productId_orderItemList);

                                                productId_orderItemList = []
                                                orderItemList_category_productIdNormal = []

                                                if (orderItemList_category[i][j].is_lottery != 1 && orderItemList_category[i][j].status_id != 6 && orderItemList_category[i][j].status_id != 7) {

                                                    orderItemList_category_productIdNormal.push(orderItemList_category[i][j])

                                                } else {
                                                    productId_orderItemList.push(orderItemList_category[i][j]);
                                                }
                                                if (j == orderItemList_category[i].length - 1) {

                                                    if (orderItemList_category_productIdNormal.length > 0) {
                                                        if (orderItemList_category_productIdNormal.length == 1) {
                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])
                                                        }
                                                        if (orderItemList_category_productIdNormal.length > 1) {
                                                            for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {

                                                                orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;
                                                            }
                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                        }
                                                    }
                                                    orderItemList_categoryProductId.push(productId_orderItemList);
                                                    orderItemList_category_productIdNormal = []
                                                }
                                            }
                                        }

                                        orderItemList_category_productId.push(orderItemList_categoryProductId);
                                        orderItemList_categoryProductId = []
                                    }

                                    console.log(orderItemList_category_productId)

                                    var service_charge = shop.service_charge;
                                    //TODO
                                    if (service_charge == null) {
                                        service_charge = 0;
                                    }

                                    /*$scope.tableInf.is_out&&$scope.orderCashed==1?payable:payable+=service_charge;
                   $scope.tableInf.is_out&&$scope.orderCashed==1?total:total+=service_charge;
                   $scope.tableInf.is_out&&$scope.orderCashed==1?totalMemberMoney:totalMemberMoney+=service_charge;*/


                                    totalMoney += total;
                                    payableMoney += payable;
                                    totalMemberMoney += totalMemberPrice;
                                    //
                                    for (var i = 0; i < orderItemList_category_productId.length; i++) {
                                        top += 6;
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "5%", "100%", "4mm", orderItemList_category[i][0].category_name);
                                        LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                                        for (var j = 0; j < orderItemList_category_productId[i].length; j++) {
                                            for (var k = 0; k < orderItemList_category_productId[i][j].length; k++) {
                                                top += 6;
                                                var orderItem = orderItemList_category_productId[i][j][k];
                                                var product = orderItemList_category_productId[i][j][k].p;

                                                var price = orderItemList_category_productId[i][j][k].p.is_promotion == 1 ? orderItemList_category_productId[i][j][k].p.promotion_price :
                                                    orderItemList_category_productId[i][j][k].p.unit_price
                                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "3mm", orderItemList_category_productId[i][j][k].p.name);
                                                LODOP.ADD_PRINT_TEXT(top + "mm", "55%", "100%", "4mm", price);
                                                LODOP.ADD_PRINT_TEXT(top + "mm", "67%", "100%", "4mm", orderItemList_category_productId[i][j][k].quantity);
                                                LODOP.ADD_PRINT_TEXT(top + "mm", "79%", "100%", "4mm",
                                                    orderItemList_category_productId[i][j][k].is_lottery == 1 ? "赠送" :
                                                        orderItemList_category_productId[i][j][k].status_id == 6 ? '退菜' :
                                                            orderItemList_category_productId[i][j][k].status_id == 7 ? '断货' :
                                                                orderItemList_category_productId[i][j][k].p.is_promotion == 1 ? (orderItemList_category_productId[i][j][k].p.promotion_price * orderItemList_category_productId[i][j][k].quantity).toFixed(2) :
                                                                    (orderItemList_category_productId[i][j][k].p.unit_price * orderItemList_category_productId[i][j][k].quantity).toFixed(2)
                                                );
                                                /*if(product.is_promotion){

                         	totalMemberPrice+=product.promotion_price*orderItem.quantity;

                         }else if(product.isUseMemberPrice){

                         	totalMemberPrice+=product.memberPrice*orderItem.quantity;

                         }else{
                         	totalMemberPrice+=product.unit_price*orderItem.quantity;
                         }*/

                                            }

                                        }
                                    }
                                    if ($scope.tableInf.is_out == 0 && shop.service_charge != null && shop.service_charge != 0 && $scope.orderCashed == 1) {
                                        totalMemberPrice += service_charge
                                        top += 6;
                                        LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "3mm", "一元乐购");
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "55%", "100%", "4mm", service_charge);
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "67%", "100%", "4mm", "1");
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "79%", "100%", "4mm", service_charge);
                                    }
                                }


                                if (shop.shop_code_id != null) {
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "6mm", "商铺二维码: ");
                                    top += 6;
                                    var imgUrl = apiHost + '/image/' + shop.shop_code_id;
                                    //alert(imgUrl)
                                    //LODOP.ADD_PRINT_BARCODE(top+"mm","15%","22%","22%","QRCode","<div><img src="+imgUrl+"/></div>");
                                    //http://test-admin.lbcy.com.cn/www/#/table/
                                    //LODOP.ADD_PRINT_BARCODE(top+"mm","15%","22%","22%","QRCode","http://test-admin.lbcy.com.cn/www/#/table/10036");
                                    LODOP.ADD_PRINT_IMAGE(top + "mm", "5%", "100%", "100%", "<img src=" + imgUrl + "/>");
                                    //LODOP. ADD_PRINT_HTML (top+"mm","5%","100%","100%","<div><img src="+imgUrl+"/></div>");
                                    //LODOP.SET_PRINT_STYLEA(0,"HtmWaitMilSecs",1000);
                                    top += 25;
                                }
                                top += 4;

                                top += 6;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - -");


                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", "合计: " + payableMoney.toFixed(2));

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", "会员合计: " + totalMemberMoney.toFixed(2));

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - -");

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "4mm", "商铺名称:" + shop.shop_name);

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "4mm", "联系方式:" + shop.phone);
                                //dev-pre
                                LODOP.PREVIEW();
                                //LODOP.PRINT();
                                //TODO:
                                window.location.reload()

                            } else {
                                alert("对应名称打印设备不存在");
                            }
                        } else {
                            alert("获取对应打印机名称失败");
                        }
                    }
                )
            }
        }
    ])

tableOperateModule.controller('kitchenOperateController', ['$scope', '$location', '$routeParams', '$interval', 'tableOperateService',
    function ($scope, $location, $routeParams, $interval, tableOperateService) {

        $scope.productStatus = $routeParams.status;

        var getTableList = function () {
            tableOperateService.tableList({},
                function (response) {
                    if (response.code == 500) {
                        alert('获取桌位列表失败')
                        return
                    }
                    $scope.diningTableList = response.msg
                    getOrderListBuyTable();
                },
                function (error) {
                }
            )
        }
        getTableList();

        var getOrderListBuyTable = function () {
            $scope.orderList = [];
            $scope.kitchenProductList = [];
            var j = 0;
            for (var i = 0; i < $scope.diningTableList.length; i++) {
                if ($scope.diningTableList[i].status != 0) {
                    $scope.orderList[j] = {};
                    tableOperateService.orderDetail({
                            id: $scope.diningTableList[i].id
                        },
                        function (response) {
                            if (response.code == 500) {
                                alert('获取订单详情失败')
                                return
                            }
                            if (response.msg && response.msg.loi.length > 0) {
                                var orderList = response.msg;
                                var list = [];
                                for (var k = 0; k < orderList.loi.length; k++) {
                                    if (orderList.loi[k].status_id == $scope.productStatus ||
                                        ($scope.productStatus == 2 && orderList.loi[k].status_id == 3)) {
                                        list.push(orderList.loi[k]);
                                    }
                                }
                                orderList.loi = list;
                                $scope.orderList[j] = orderList;
                                j++;
                            }
                        },
                        function (error) {
                        }
                    )
                }

            }
            console.log($scope.orderList);
        }
        // var timeout_upd = $interval(getTableList, 10000);
        // $scope.$on('$destroy',function(){
        // 	$interval.cancel(timeout_upd);
        // })
        $scope.startDoing = function (product) {
            product.status_id = 2;
            tableOperateService.orderProductUpdate(product,
                function (response) {
                    if (response.code == 500) {
                        alert('开做失败')
                        return
                    }
                    getTableList();
                },
                function (error) {
                }
            );
        }

        $scope.noProduct = function (order, product) {
            var description = product.p.name + "已断货";
            var data = {
                order_id: order.id,
                dining_table_id: order.dining_table_id,
                serial_id: order.serial_id,
                shop_id: parseInt(localStorage.getItem('shop_id')),
                service_type: 4,
                description: description,
            };

            product.status_id = 7;
            tableOperateService.orderProductUpdate(product,
                function (response) {
                    if (response.code == 500) {
                        alert('断货失败')
                        return
                    }
                    tableOperateService.callServiceCreate(data,
                        function (response) {
                            if (response.code == 500) {
                                alert('断货失败')
                                return
                            }
                            getTableList();
                        },
                        function (error) {
                        }
                    );
                },
                function (error) {
                }
            );
        }

        $scope.upProduct = function (product) {
            /*
       product.status_id = 3;
       tableOperateService.orderProductUpdate(product,
       	function (response) {
       		if (response.code == 500) {
       			alert('上菜失败')
       			return
       		}
       		getOrderListBuyTable();
       	},
       	function (error) {}
       );
       */
        }

    }
])

tableOperateModule.controller('printerOrderController',
    ['$scope', '$location', '$routeParams', '$interval', 'tableOperateService', 'DataUtilService', 'PrinterService', 'shopInformationService', 'lotteryLogService',
        function ($scope, $location, $routeParams, $interval, tableOperateService, DataUtilService, PrinterService, shopInformationService, lotteryLogService) {
            $scope.totalPrice = 0;
            $scope.tableInf = {};
            $scope.discount = '';
            $scope.residue = '';
            $scope.income = '';
            $scope.payable = '';
            $scope.odd = '';
            $scope.payType = 0;

            $scope.productCategory = '';
            $scope.productStatus = '';

            $scope.nowKey = localStorage.getItem('now_keys');

            var shop = {};
            shopInformationService.view({
                    id: localStorage.getItem("shop_id")
                },
                function (response) {
                    if (response.code == 200) {
                        shop = response.msg;
                    } else {
                        alert("printerOrderController_shopInformationService.view");
                    }
                },
                function (error) {
                }
            );

            /*ysq-0724*/

            $scope.ifCLodp = 0;
            var getIfCLodop = function () {
                if (typeof (getCLodop) == 'undefined') {
                    $scope.ifCLodp = 0;
                } else {
                    $scope.ifCLodp = 1;
                }
            }
            getIfCLodop();
            $scope.downloadLodop32 = function () {
                window.location.href = (apiHost + '/downloadLodop');
            }

            tableOperateService.tableView({
                    id: $routeParams.tableId
                },
                function (response) {
                    if (response.code == 500) {
                        alert('获取桌位信息失败')
                        return
                    }
                    $scope.tableInf = response.msg;
                    $scope.getOrderDetail();
                },
                function (error) {
                }
            );

            tableOperateService.categoryList({},
                function (response) {
                    if (response.code == 500) {
                        alert('获取菜品类别列表失败')
                        return
                    }
                    $scope.categoryList = response.msg
                },
                function (error) {
                }
            );

            $scope.getOrderDetail = function () {
                tableOperateService.orderDetail({
                        id: $routeParams.tableId
                    },
                    function (response) {
                        if (response.code == 500) {
                            alert('获取订单详情失败')
                            return
                        }
                        var orderId = response.msg.id
                        lotteryLogService.queryByOrderId({
                                id: orderId
                            },
                            function (response2) {
                                console.log(" lotteryLogService.queryByOrderId ------ ");
                                console.log(response2);
                                if (response2.code == 200 && response2.msg != null) {
                                    $scope.orderCashed = 1;
                                    //alert($scope.orderCashed)
                                }
                            }
                        )
                        var orderDetail = response.msg;
                        var productList = [];
                        for (var i = 0; i < orderDetail.loi.length; i++) {
                            if (orderDetail.loi[i].status_id != 1 && orderDetail.loi[i].status_id != 2 && orderDetail.loi[i].status_id != 3 && orderDetail.loi[i].status_id != 6 && orderDetail.loi[i].status_id != 7) {
                                continue;
                            }
                            if ($scope.productCategory != '' && $scope.productCategory != orderDetail.loi[i].category_id) {
                                continue;
                            }
                            if ($scope.productStatus != '' && $scope.productStatus != orderDetail.loi[i].status_id) {
                                continue;
                            }
                            productList.push(orderDetail.loi[i]);
                        }

                        $scope.orderDetail = orderDetail;
                        $scope.productList = productList;
                    },
                    function (error) {
                    }
                )
            }

            $scope.selectAll = function () {
                if ($('#selectAll').prop('checked')) {
                    $("input[name='isPrinter']").each(function () {
                        $(this).prop('checked', true);
                    });
                } else {
                    $("input[name='isPrinter']").each(function () {
                        $(this).prop('checked', false);
                    });
                }
            }
            //打印对账单
            $scope.orderPrinter = function () {
                var printerList = [];
                var orderItemList = [];
                $("input[name='isPrinter']").each(function () {
                    if ($(this).prop('checked') == true) {
                        printerList.push($scope.productList[$(this).val()]);

                    }
                });

                var orderItemList = printerList;
                console.log(orderItemList)

                //排序
                function compare(property) {
                    return function (a, b) {
                        var value1 = a[property];
                        var value2 = b[property];
                        return value1 - value2;
                    }
                }

                orderItemList.sort(compare('category_id'));

                var total = 0.00;
                var payable = 0.00;
                var totalMemberPrice = 0.00;
                //category分组
                var category_orderItemList = []
                var orderItemList_category = [];
                console.log("orderItemList")
                console.log(orderItemList)
                for (var i = 0; i < orderItemList.length; i++) {

                    if (i == 0 || orderItemList[i].category_id == orderItemList[i - 1].category_id) {


                        category_orderItemList.push(orderItemList[i]);

                        if (i == orderItemList.length - 1) {
                            category_orderItemList.sort(compare('product_id'));
                            orderItemList_category.push(category_orderItemList);
                        }


                        total += orderItemList[i].p.is_promotion == 1 ? orderItemList[i].quantity * orderItemList[i].p.promotion_price : orderItemList[i].quantity * orderItemList[i].p.unit_price
                        if (orderItemList[i].is_lottery != 1 && orderItemList[i].status_id != 6 && orderItemList[i].status_id != 7) {
                            payable += orderItemList[i].p.is_promotion == 1 ? orderItemList[i].quantity * orderItemList[i].p.promotion_price : orderItemList[i].quantity * orderItemList[i].p.unit_price

                            if (orderItemList[i].p.is_promotion == 1) {

                                totalMemberPrice += orderItemList[i].p.promotion_price * orderItemList[i].quantity;


                            } else if (orderItemList[i].p.isUseMemberPrice == 1) {

                                totalMemberPrice += orderItemList[i].p.memberPrice * orderItemList[i].quantity;

                            } else {

                                totalMemberPrice += orderItemList[i].p.unit_price * orderItemList[i].quantity;
                            }

                        }

                    } else {

                        total += orderItemList[i].p.is_promotion == 1 ? orderItemList[i].quantity * orderItemList[i].p.promotion_price : orderItemList[i].quantity * orderItemList[i].p.unit_price
                        if (orderItemList[i].is_lottery != 1 && orderItemList[i].status_id != 6 && orderItemList[i].status_id != 7) {
                            payable += orderItemList[i].p.is_promotion == 1 ? orderItemList[i].quantity * orderItemList[i].p.promotion_price : orderItemList[i].quantity * orderItemList[i].p.unit_price

                            if (orderItemList[i].p.is_promotion == 1) {

                                totalMemberPrice += orderItemList[i].p.promotion_price * orderItemList[i].quantity;

                            } else if (orderItemList[i].p.isUseMemberPrice == 1) {

                                totalMemberPrice += orderItemList[i].p.memberPrice * orderItemList[i].quantity;

                            } else {
                                totalMemberPrice += orderItemList[i].p.unit_price * orderItemList[i].quantity;
                            }

                        }

                        category_orderItemList.sort(compare('product_id'));
                        orderItemList_category.push(category_orderItemList);
                        category_orderItemList = [];

                        category_orderItemList.push(orderItemList[i]);

                        if (i == orderItemList.length - 1) orderItemList_category.push(category_orderItemList);


                    }
                }
                console.log(orderItemList_category)

                var orderItemList_category_productId = [];
                for (var i = 0; i < orderItemList_category.length; i++) {

                    var productId_orderItemList = [];
                    var orderItemList_categoryProductId = [];

                    var orderItemList_category_productIdNormal = []
                    //商品ID分组
                    for (var j = 0; j < orderItemList_category[i].length; j++) {

                        if (j == 0 || orderItemList_category[i][j].product_id == orderItemList_category[i][j - 1].product_id) {

                            if (orderItemList_category[i][j].is_lottery != 1 && orderItemList_category[i][j].status_id != 6 && orderItemList_category[i][j].status_id != 7) {

                                orderItemList_category_productIdNormal.push(orderItemList_category[i][j])

                            } else {

                                productId_orderItemList.push(orderItemList_category[i][j]);
                            }

                            if (j == orderItemList_category[i].length - 1) {

                                if (orderItemList_category_productIdNormal.length > 0) {

                                    if (orderItemList_category_productIdNormal.length == 1) {

                                        productId_orderItemList.push(orderItemList_category_productIdNormal[0])
                                        console.log(orderItemList_category_productIdNormal)

                                    }
                                    if (orderItemList_category_productIdNormal.length > 1) {

                                        for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {

                                            orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;

                                        }
                                        productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                    }
                                }
                                orderItemList_categoryProductId.push(productId_orderItemList);

                                orderItemList_category_productIdNormal = []
                            }
                        } else {

                            if (orderItemList_category_productIdNormal.length > 0) {

                                if (orderItemList_category_productIdNormal.length == 1) {

                                    productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                }
                                if (orderItemList_category_productIdNormal.length > 1) {
                                    for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {
                                        orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;
                                    }
                                    productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                }
                            }

                            orderItemList_categoryProductId.push(productId_orderItemList);

                            productId_orderItemList = []
                            orderItemList_category_productIdNormal = []

                            if (orderItemList_category[i][j].is_lottery != 1 && orderItemList_category[i][j].status_id != 6 && orderItemList_category[i][j].status_id != 7) {

                                orderItemList_category_productIdNormal.push(orderItemList_category[i][j])

                            } else {
                                productId_orderItemList.push(orderItemList_category[i][j]);
                            }
                            if (j == orderItemList_category[i].length - 1) {

                                if (orderItemList_category_productIdNormal.length > 0) {
                                    if (orderItemList_category_productIdNormal.length == 1) {
                                        productId_orderItemList.push(orderItemList_category_productIdNormal[0])
                                    }
                                    if (orderItemList_category_productIdNormal.length > 1) {
                                        for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {

                                            orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;
                                        }
                                        productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                    }
                                }
                                orderItemList_categoryProductId.push(productId_orderItemList);
                                orderItemList_category_productIdNormal = []
                            }
                        }
                    }

                    orderItemList_category_productId.push(orderItemList_categoryProductId);
                    orderItemList_categoryProductId = []
                }

                console.log(orderItemList_category_productId)

                var service_charge = shop.service_charge;
                if (service_charge == null) {
                    service_charge = 0;
                }

                $scope.tableInf.is_out && $scope.orderCashed == 1 ? payable : payable += service_charge;
                $scope.tableInf.is_out && $scope.orderCashed == 1 ? total : total += service_charge;

                $scope.tableInf.is_out && $scope.orderCashed == 1 ? totalMemberPrice : totalMemberPrice += service_charge;


                total = total.toFixed(2);
                payable = payable.toFixed(2);
                totalMemberPrice = totalMemberPrice.toFixed(2);
                PrinterService.getPrinterByPrinter_type({
                        printer_type: 999
                    },
                    function (response) {
                        if (response.code == 200) {

                            var nowTime = DataUtilService.getNowTime();
                            var printer = response.msg;

                            var LODOP = getCLodop();
                            LODOP.SET_LICENSES("", "3E893A594C00D5D9C1DBE7CD18C9E8DB", "C94CEE276DB2187AE6B65D56B3FC2848", "");
                            LODOP.PRINT_INITA(1, 1, 700, 600, '商铺' + localStorage.getItem('shop_id') + '_对账单');

                            var printer_name = printer.name;

                            var pageWidth = printer.page_width;
                            if (pageWidth == null || pageWidth == 0) {
                                alert("纸张宽度不能为空或零");
                                return;
                            }
                            LODOP.SET_PRINT_PAGESIZE(3, pageWidth + "mm", "", "");


                            var flag = LODOP.SET_PRINTER_INDEXA(printer_name);
                            if (flag) {
                                var top = 1;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "4mm", pageWidth + "mm", "8mm", "预打单");
                                LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                                LODOP.SET_PRINT_STYLEA(0, "Horient", 2);
                                LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                                LODOP.SET_PRINT_STYLEA(0, "FontSize", 15);

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "订单编号:" + $scope.orderDetail.order_no);

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", "桌位:" + $scope.orderDetail.serial_id);

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "收款员:" + localStorage.getItem("name"));

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "结账时间:" + nowTime);

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - -- - - - - - - - -- - -- - ");

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "品名");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "42%", "100%", "6mm", "单价");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "62%", "100%", "6mm", "数量");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "81%", "100%", "6mm", "金额");

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - -- - - - - - - - -- - -- - ");


                                for (var i = 0; i < orderItemList_category_productId.length; i++) {
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "5%", "100%", "4mm", orderItemList_category[i][0].category_name);
                                    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                                    for (var j = 0; j < orderItemList_category_productId[i].length; j++) {
                                        for (var k = 0; k < orderItemList_category_productId[i][j].length; k++) {
                                            top += 6;
                                            var orderItem = orderItemList_category_productId[i][j][k];
                                            var product = orderItemList_category_productId[i][j][k].p;

                                            var price = orderItemList_category_productId[i][j][k].p.is_promotion == 1 ? orderItemList_category_productId[i][j][k].p.promotion_price :
                                                orderItemList_category_productId[i][j][k].p.unit_price
                                            LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "3mm", orderItemList_category_productId[i][j][k].p.name);
                                            LODOP.ADD_PRINT_TEXT(top + "mm", "55%", "100%", "4mm", price);
                                            LODOP.ADD_PRINT_TEXT(top + "mm", "67%", "100%", "4mm", orderItemList_category_productId[i][j][k].quantity);
                                            LODOP.ADD_PRINT_TEXT(top + "mm", "79%", "100%", "4mm",
                                                orderItemList_category_productId[i][j][k].is_lottery == 1 ? "赠送" :
                                                    orderItemList_category_productId[i][j][k].status_id == 6 ? '退菜' :
                                                        orderItemList_category_productId[i][j][k].status_id == 7 ? '断货' :
                                                            orderItemList_category_productId[i][j][k].p.is_promotion == 1 ? (orderItemList_category_productId[i][j][k].p.promotion_price * orderItemList_category_productId[i][j][k].quantity).toFixed(2) :
                                                                (orderItemList_category_productId[i][j][k].p.unit_price * orderItemList_category_productId[i][j][k].quantity).toFixed(2)
                                            );
                                            /*if(product.is_promotion){

                       	totalMemberPrice+=product.promotion_price*orderItem.quantity;

                       }else if(product.isUseMemberPrice){

                       	totalMemberPrice+=product.memberPrice*orderItem.quantity;

                       }else{
                       	totalMemberPrice+=product.unit_price*orderItem.quantity;
                       }*/

                                        }

                                    }
                                }
                                /*alert($scope.tableInf.is_out)
                 alert(service_charge)
                 alert($scope.orderCashed)*/

                                if ($scope.tableInf.is_out == 0 &&
                                    service_charge != null &&
                                    service_charge != 0 &&
                                    $scope.orderCashed == 1) {
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "3mm", "一元换购");
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "55%", "100%", "4mm", service_charge);
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "67%", "100%", "4mm", "1");
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "79%", "100%", "4mm", service_charge);
                                }

                                top += 6;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - -");


                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", "合计: " + payable);

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", "会员合计: " + totalMemberPrice);

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - -");

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "4mm", "商铺名称:" + shop.shop_name);

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "4mm", "联系方式:" + shop.phone);
                                //dev
                                //LODOP.PREVIEW();
                                LODOP.PRINT();
                                window.location.reload()
                            } else {
                                alert("对应名称打印设备不存在");
                            }
                        } else {
                            alert("获取对应打印机名称失败");
                        }
                    }
                )
            }
        }
    ])


//外卖-控制器
tableOperateModule.controller('takeOutController',
    ['$scope', '$location', '$interval', 'tableOperateService', '$timeout', 'PrinterService', 'lotteryService', 'Dining_tableService', 'CategoryService', 'ProductService', 'syncService', 'shopInformationService', 'memberInformationService', 'DataUtilService',
        function ($scope, $location, $interval, tableOperateService, $timeout, PrinterService, lotteryService, Dining_tableService, CategoryService,
                  ProductService, syncService, shopInformationService, memberInformationService, DataUtilService
        ) {
            $scope.programBar = function () {
                $('#myModal_programBar').modal('show');
            }
            $scope.initRouterActive = function () {
                setActiveRouter($location.$$path);
            }
            $('#txt_deliveryTime').datetimepicker({
                format: 'hh:ii',
                autoclose: true,
                minView: 0,
                language: 'zh-CN',
                minuteStep: 1
            });

            //结业
            $scope.test = function () {
                //TODO:
                //修改商鋪

                //
                //dining_table
                syncService.dining_tableSyncList_local({
                        id: 10
                    },
                    function (response1) {
                        console.log("dining_tableSyncList_local --- ")
                        console.log(response1);
                        if (response1.code == 200 && response1.msg.length > 0) {

                            var syncList = response1.msg;

                            for (var i = 0; i < syncList.length; i++) {

                                syncList[i].sync_status = 1;

                                syncService.dining_tableInsertById_remote(
                                    syncList[i],
                                    function (response3) {
                                        console.log(response3)
                                        if (response3.code == 200) {
                                            console.log("dining_tableInsertById_remote---response3---200")
                                        } else {
                                            console.log("dining_tableInsertById_remote---response3---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )

                                syncService.dining_tableUpdateSync_status_local({
                                        id: syncList[i].id
                                    },
                                    syncList[i],
                                    function (response4) {
                                        console.log(response4);
                                        if (response4.code == 200) {
                                            console.log("dining_tableUpdateSync_status_remote---response4---200")
                                        } else {
                                            console.log("dining_tableUpdateSync_status_remote---response4---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )
                            }
                        } else {
                            console.log("dining_table --- fail")
                        }
                    }
                )
                //category
                syncService.categorySyncList_local({
                        id: 10
                    },
                    function (response1) {
                        console.log("categorySyncList_local --- ")
                        console.log(response1);
                        if (response1.code == 200 && response1.msg.length > 0) {

                            var syncList = response1.msg;

                            for (var i = 0; i < syncList.length; i++) {

                                syncList[i].sync_status = 1;

                                syncService.categoryInsertById_remote(
                                    syncList[i],
                                    function (response3) {
                                        console.log("response3 ------ ");
                                        console.log(response3)
                                        if (response3.code == 200) {
                                            console.log("categorySyncList_local---response3---200")
                                        } else {
                                            console.log("categorySyncList_local---response3---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )
                                syncService.categoryUpdateSync_status_local({
                                        id: syncList[i].id
                                    },
                                    syncList[i],
                                    function (response4) {
                                        console.log("response4 ------ ");
                                        console.log(response4);
                                        if (response4.code == 200) {
                                            console.log("categoryUpdateSync_status_remote---response4---200")
                                        } else {
                                            console.log("categoryUpdateSync_status_remote---response4---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )

                            }
                        } else {
                            console.log("category ---- fail")
                        }
                    }
                )
                //product
                syncService.productSyncList_local({
                        id: 10
                    },
                    function (response1) {
                        console.log("productSyncList_local --- ")
                        console.log(response1);
                        if (response1.code == 200 && response1.msg.length > 0) {

                            var syncList = response1.msg;

                            for (var i = 0; i < syncList.length; i++) {

                                syncList[i].sync_status = 1;

                                syncService.productInsertById_remote(
                                    syncList[i],
                                    function (response3) {
                                        console.log(response3)
                                        if (response3.code == 200) {
                                            console.log("response3---200")
                                        } else {
                                            console.log("response3---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )
                                syncService.productUpdateSync_status_local({
                                        id: syncList[i].id
                                    },
                                    syncList[i],
                                    function (response4) {
                                        console.log(response4);
                                        if (response4.code == 200) {
                                            console.log("response4---200")
                                        } else {
                                            console.log("response4---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )

                            }
                        } else {
                            console.log("product ---- fail")
                        }
                    }
                )
                //image
                syncService.imageSyncList_local({
                        shop_id: localStorage.getItem("shop_id"),
                        /*type:3,*/
                        sync_status: 0
                    },
                    function (response1) {

                        if (response1.code == 200 && response1.msg.length > 0) {

                            var syncList = response1.msg;

                            for (var i = 0; i < syncList.length; i++) {

                                syncList[i].sync_status = 1;

                                syncService.imageInsertById_remote(
                                    syncList[i],
                                    function (response3) {
                                        console.log(response3)
                                        if (response3.code == 200) {
                                            console.log("response3---200")
                                        } else {
                                            console.log("response3---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )
                                syncService.imageUpdateSync_status_local(
                                    syncList[i],
                                    function (response4) {
                                        console.log(response4);
                                        if (response4.code == 200) {
                                            console.log("response4---200")
                                        } else {
                                            console.log("response4---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )

                            }
                        } else {
                            console.log("product ---- fail")
                        }
                    }
                )
                //kitchen
                syncService.kitchenSyncList_local({
                        id: 10
                    },
                    function (response1) {
                        console.log("productSyncList_local --- ")
                        console.log(response1);
                        if (response1.code == 200 && response1.msg.length > 0) {

                            var syncList = response1.msg;

                            for (var i = 0; i < syncList.length; i++) {

                                syncList[i].sync_status = 1;

                                syncService.kitchenInsertById_remote(
                                    syncList[i],
                                    function (response3) {
                                        console.log(response3)
                                        if (response3.code == 200) {
                                            console.log("response3---200")
                                        } else {
                                            console.log("response3---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )
                                syncService.kitchenUpdateSync_status_local({
                                        id: syncList[i].id
                                    },
                                    syncList[i],
                                    function (response4) {
                                        console.log(response4);
                                        if (response4.code == 200) {
                                            console.log("response4---200")
                                        } else {
                                            console.log("response4---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )

                            }
                        } else {
                            console.log("product ---- fail")
                        }
                    }
                )
                //lottery
                syncService.lotterySyncList_local({
                        id: 10
                    },
                    function (response1) {
                        console.log("productSyncList_local --- ")
                        console.log(response1);
                        if (response1.code == 200 && response1.msg.length > 0) {

                            var syncList = response1.msg;

                            for (var i = 0; i < syncList.length; i++) {

                                syncList[i].sync_status = 1;

                                syncService.lotteryInsertById_remote(
                                    syncList[i],
                                    function (response3) {
                                        console.log(response3)
                                        if (response3.code == 200) {
                                            console.log("response3---200")
                                        } else {
                                            console.log("response3---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )
                                syncService.lotteryUpdateSync_status_local({
                                        id: syncList[i].id
                                    },
                                    syncList[i],
                                    function (response4) {
                                        console.log(response4);
                                        if (response4.code == 200) {
                                            console.log("response4---200")
                                        } else {
                                            console.log("response4---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )

                            }
                        } else {
                            console.log("product ---- fail")
                        }
                    }
                )
                //printer
                syncService.printerSyncList_local({
                        id: 10
                    },
                    function (response1) {
                        console.log("printerSyncList_local --- respnse1")
                        console.log(response1);
                        if (response1.code == 200 && response1.msg.length > 0) {

                            var syncList = response1.msg;

                            for (var i = 0; i < syncList.length; i++) {

                                syncList[i].sync_status = 1;

                                syncService.printerInsertById_remote(
                                    syncList[i],
                                    function (response3) {
                                        console.log(response3)
                                        if (response3.code == 200) {
                                            console.log("printerInsertById_remote --- response3---200")
                                        } else {
                                            console.log("printerInsertById_remote --- response3---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )
                                syncService.printerUpdateSync_status_local({
                                        id: syncList[i].id
                                    },
                                    syncList[i],
                                    function (response4) {
                                        console.log(response4);
                                        if (response4.code == 200) {
                                            console.log("printerUpdateSync_status_local --- response4---200")
                                        } else {
                                            console.log("printerUpdateSync_status_local --- response4---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )

                            }
                        } else {
                            console.log("product ---- fail")
                        }
                    }
                )
                //staff
                syncService.staffSyncList_local({
                        id: 10
                    },
                    function (response1) {
                        console.log("productSyncList_local --- ")
                        console.log(response1);
                        if (response1.code == 200 && response1.msg.length > 0) {

                            var syncList = response1.msg;

                            for (var i = 0; i < syncList.length; i++) {

                                syncList[i].sync_status = 1;

                                syncService.staffInsertById_remote(
                                    syncList[i],
                                    function (response3) {
                                        console.log(response3)
                                        if (response3.code == 200) {
                                            console.log("response3---200")
                                        } else {
                                            console.log("response3---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )
                                syncService.staffUpdateSync_status_local({
                                        id: syncList[i].id
                                    },
                                    syncList[i],
                                    function (response4) {
                                        console.log(response4);
                                        if (response4.code == 200) {
                                            console.log("response4---200")
                                        } else {
                                            console.log("response4---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )

                            }
                        } else {
                            console.log("product ---- fail")
                        }
                    }
                )
                //user
                syncService.userSyncList_local({
                        id: 10
                    },
                    function (response1) {
                        console.log("userSyncList_local --- ")
                        console.log(response1);
                        if (response1.code == 200 && response1.msg.length > 0) {

                            var syncList = response1.msg;

                            for (var i = 0; i < syncList.length; i++) {

                                syncList[i].sync_status = 1;

                                syncService.userInsertById_remote(
                                    syncList[i],
                                    function (response3) {
                                        console.log(response3)
                                        if (response3.code == 200) {
                                            console.log("userInsertById_remote ---- response3---200")
                                        } else {
                                            console.log("userInsertById_remote --- response3---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )
                                syncService.userUpdateSync_status_local({
                                        id: syncList[i].user_id
                                    },
                                    syncList[i],
                                    function (response4) {
                                        console.log(response4);
                                        if (response4.code == 200) {
                                            console.log("userInsertById_remote --- response4---200")
                                        } else {
                                            console.log("userInsertById_remote ---- response4---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )

                            }
                        } else {
                            console.log("product ---- fail")
                        }
                    }
                )
                //order
                syncService.orderSyncList_local({
                        id: 10
                    },
                    function (response1) {
                        console.log("productSyncList_local --- ")
                        console.log(response1);
                        if (response1.code == 200 && response1.msg.length > 0) {

                            var syncList = response1.msg;

                            for (var i = 0; i < syncList.length; i++) {

                                syncList[i].sync_status = 1;

                                syncService.orderInsertById_remote(
                                    syncList[i],
                                    function (response3) {
                                        console.log(response3)
                                        if (response3.code == 200) {
                                            console.log("response3---200")
                                        } else {
                                            console.log("response3---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )
                                syncService.orderUpdateSync_status_local({
                                        id: syncList[i].id
                                    },
                                    syncList[i],
                                    function (response4) {
                                        console.log(response4);
                                        if (response4.code == 200) {
                                            console.log("response4---200")
                                        } else {
                                            console.log("response4---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )

                            }
                        } else {
                            console.log("product ---- fail")
                        }
                    }
                )
                //orderItem
                syncService.orderItemSyncList_local({
                        id: 10
                    },
                    function (response1) {
                        console.log("productSyncList_local --- ")
                        console.log(response1);
                        if (response1.code == 200 && response1.msg.length > 0) {

                            var syncList = response1.msg;

                            for (var i = 0; i < syncList.length; i++) {

                                syncList[i].sync_status = 1;

                                syncService.orderItemInsertById_remote(
                                    syncList[i],
                                    function (response3) {
                                        console.log(response3)
                                        if (response3.code == 200) {
                                            console.log("response3---200")
                                        } else {
                                            console.log("response3---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )
                                syncService.orderItemUpdateSync_status_local({
                                        id: syncList[i].id
                                    },
                                    syncList[i],
                                    function (response4) {
                                        console.log(response4);
                                        if (response4.code == 200) {
                                            console.log("response4---200")
                                        } else {
                                            console.log("response4---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )

                            }
                        } else {
                            console.log("product ---- fail")
                        }
                    }
                )
                //member
                syncService.memberSyncList_local({
                        id: 10
                    },
                    function (response1) {
                        console.log("productSyncList_local --- ")
                        console.log(response1);
                        if (response1.code == 200 && response1.msg.length > 0) {

                            var syncList = response1.msg;

                            for (var i = 0; i < syncList.length; i++) {

                                syncList[i].sync_status = 1;

                                syncService.memberInsertById_remote(
                                    syncList[i],
                                    function (response3) {
                                        console.log(response3)
                                        if (response3.code == 200) {
                                            console.log("response3---200")
                                        } else {
                                            console.log("response3---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )
                                syncService.memberUpdateSync_status_local({
                                        id: syncList[i].id
                                    },
                                    syncList[i],
                                    function (response4) {
                                        console.log(response4);
                                        if (response4.code == 200) {
                                            console.log("response4---200")
                                        } else {
                                            console.log("response4---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )

                            }
                        } else {
                            console.log("product ---- fail")
                        }
                    }
                )
                //memberCard
                syncService.memberCardSyncList_local({
                        id: 10
                    },
                    function (response1) {
                        console.log("productSyncList_local --- ")
                        console.log(response1);
                        if (response1.code == 200 && response1.msg.length > 0) {

                            var syncList = response1.msg;

                            for (var i = 0; i < syncList.length; i++) {

                                syncList[i].sync_status = 1;

                                syncService.memberCardInsertById_remote(
                                    syncList[i],
                                    function (response3) {
                                        console.log(response3)
                                        if (response3.code == 200) {
                                            console.log("response3---200")
                                        } else {
                                            console.log("response3---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )
                                syncService.memberCardUpdateSync_status_local(
                                    syncList[i],
                                    function (response4) {
                                        console.log(response4);
                                        if (response4.code == 200) {
                                            console.log("response4---200")
                                        } else {
                                            console.log("response4---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )

                            }
                        } else {
                            console.log("product ---- fail")
                        }
                    }
                )
                //memberIntegral
                syncService.memberIntegralSyncList_local({
                        id: 10
                    },
                    function (response1) {
                        console.log("productSyncList_local --- ")
                        console.log(response1);
                        if (response1.code == 200 && response1.msg.length > 0) {

                            var syncList = response1.msg;

                            for (var i = 0; i < syncList.length; i++) {

                                syncList[i].sync_status = 1;

                                syncService.memberIntegralInsertById_remote(
                                    syncList[i],
                                    function (response3) {
                                        console.log(response3)
                                        if (response3.code == 200) {
                                            console.log("response3---200")
                                        } else {
                                            console.log("response3---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )
                                syncService.memberIntegralUpdateSync_status_local(
                                    syncList[i],
                                    function (response4) {
                                        console.log(response4);
                                        if (response4.code == 200) {
                                            console.log("response4---200")
                                        } else {
                                            console.log("response4---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )

                            }
                        } else {
                            console.log("product ---- fail")
                        }
                    }
                )
                //memberLottery
                syncService.memberLotterySyncList_local({
                        id: 10
                    },
                    function (response1) {
                        console.log("productSyncList_local --- ")
                        console.log(response1);
                        if (response1.code == 200 && response1.msg.length > 0) {

                            var syncList = response1.msg;

                            for (var i = 0; i < syncList.length; i++) {

                                syncList[i].sync_status = 1;

                                syncService.memberLotteryInsertById_remote(
                                    syncList[i],
                                    function (response3) {
                                        console.log(response3)
                                        if (response3.code == 200) {
                                            console.log("response3---200")
                                        } else {
                                            console.log("response3---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )
                                syncService.memberLotteryUpdateSync_status_local({
                                        id: syncList[i].id
                                    },
                                    syncList[i],
                                    function (response4) {
                                        console.log(response4);
                                        if (response4.code == 200) {
                                            console.log("response4---200")
                                        } else {
                                            console.log("response4---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )

                            }
                        } else {
                            console.log("product ---- fail")
                        }
                    }
                )
                //memberRechargeLog
                syncService.memberRechargeLogSyncList_local({
                        id: 10
                    },
                    function (response1) {
                        console.log("productSyncList_local --- ")
                        console.log(response1);
                        if (response1.code == 200 && response1.msg.length > 0) {

                            var syncList = response1.msg;

                            for (var i = 0; i < syncList.length; i++) {

                                syncList[i].sync_status = 1;

                                syncService.memberRechargeLogInsertById_remote(
                                    syncList[i],
                                    function (response3) {
                                        console.log(response3)
                                        if (response3.code == 200) {
                                            console.log("response3---200")
                                        } else {
                                            console.log("response3---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )
                                syncService.memberRechargeLogUpdateSync_status_local(
                                    syncList[i],
                                    function (response4) {
                                        console.log(response4);
                                        if (response4.code == 200) {
                                            console.log("response4---200")
                                        } else {
                                            console.log("response4---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )

                            }
                        } else {
                            console.log("product ---- fail")
                        }
                    }
                )
                //shop
                syncService.shopSyncList_local({
                        id: 10
                    },
                    function (response1) {
                        console.log("productSyncList_local --- ")
                        console.log(response1);
                        if (response1.code == 200 && response1.msg.length > 0) {

                            var syncList = response1.msg;

                            for (var i = 0; i < syncList.length; i++) {

                                syncList[i].sync_status = 1;

                                syncService.shopInsertById_remote(
                                    syncList[i],
                                    function (response3) {
                                        console.log(response3)
                                        if (response3.code == 200) {
                                            console.log("shopInsertById_remote ---- response3---200")
                                        } else {
                                            console.log("shopInsertById_remote ----response3---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )
                                syncService.shopUpdateSync_status_local({
                                        id: syncList[i].id
                                    },
                                    syncList[i],
                                    function (response4) {
                                        console.log(response4);
                                        if (response4.code == 200) {
                                            console.log("shopUpdateSync_status_local --- response4---200")
                                        } else {
                                            console.log("shopUpdateSync_status_local ---response4---500")
                                        }
                                    },
                                    function (err) {
                                        console.log(err)
                                    }
                                )

                            }
                        } else {
                            console.log("product ---- fail")
                        }
                    }
                )
                alert("正在上传结业数据");
            }

            $scope.nowKey = localStorage.getItem('now_keys');
            $scope.callServiceList = [];
            $scope.isAdd = 0;

            $scope.getSearchTabParam = function (isTurn) {
                if (isTurn) {
                    return {
                        regionId: $scope.turnCurrentActiveRegion ? $scope.turnCurrentActiveRegion.id : '',
                        seatingNumber: $scope.turnTbActiveSeat ? $scope.turnTbActiveSeat.value : ''
                    }
                } else {
                    return {
                        isOut: 1,
                        regionId: $scope.currentActiveRegion ? $scope.currentActiveRegion.id : '',
                        seatingNumber: $scope.activeSeat ? $scope.activeSeat.value : ''
                    }
                }
            }

            //list页面获取桌位列表
            tableOperateService.tableList($scope.getSearchTabParam(),
                function (response) {
                    if (response.code == 500) {
                        alert('获取桌位列表失败')
                        return;
                    }
                    $scope.diningTableList = response.msg;
                    $scope.turnDiningTableList = response.msg;
                    // var _regions=[];
                    // _regions.push({id:-1,name:'全部',shopId:null});
                    // _regions=_regions.concat(response.msg.regionList);
                    // $scope.regionList=_regions;

                },
                function (error) {
                }
            );

            $scope.regionList = [];
            $scope.seatList = [{
                name: '全部',
                value: ''
            }];
            tableOperateService.getTableBaseData({},
                function (response) {
                    if (response.code == 500) {
                        alert('获取基础数据异常')
                        return;
                    }
                    var _regions = [];
                    _regions.push({
                        id: '',
                        name: '全部',
                        shopId: null
                    });
                    $scope.currentActiveRegion = _regions[0];
                    $scope.turnCurrentActiveRegion = _regions[0];
                    _regions = _regions.concat(response.msg.regionList);
                    $scope.regionList = _regions;
                    if (response.msg.seatingNumbers) {
                        $(response.msg.seatingNumbers).each(function (idx, n) {
                            $scope.seatList.push({
                                name: n + '人桌',
                                value: n
                            });
                        })

                        $scope.activeSeat = $scope.seatList[0];
                        $scope.turnTbActiveSeat = $scope.seatList[0];
                    }
                },
                function (error) {
                }
            );

            tableOperateService.resetOrderPno({},
                function (response) {
                    if (response.code == 500) {
                        alert('桌位订单合并桌台失败')
                    }
                    ;
                }
            )

            tableOperateService.callServiceList({},
                function (response) {
                    if (response.code == 500) {
                        //alert('获取呼叫服务列表失败')
                        return
                    }
                    $scope.callServiceList = response.msg
                },
                function (error) {
                }
            );
            //loop
            var tableInitialization = function () {
                tableOperateService.tableList({
                        isOut: 1
                    },
                    function (response) {
                        if (response.code == 500) {
                            alert('获取桌位列表失败')
                            return
                        }
                        $scope.diningTableList = response.msg
                    },
                    function (error) {
                    }
                );

                tableOperateService.callServiceList({},
                    function (response) {
                        if (response.code == 500) {
                            alert('获取呼叫服务列表失败')
                            return
                        }
                        $scope.callServiceList = response.msg
                    },
                    function (error) {
                    }
                );
            }
            // var timeout_upd = $interval(tableInitialization, 2000);
            // $scope.$on('$destroy',function(){
            // 	$interval.cancel(timeout_upd);
            // })
            $scope.isSubmit = 0;
            $scope.selectTable = {};

            //开台
            $scope.openStage = function () {
                if (!$scope.selectTable.id || $scope.selectTable.status != 0) {
                    showMessage('请选择空闲桌位');
                    return;
                }
                $('#openMyTable').modal('show');
            }

            //选中桌位
            $scope.showSelectedTable = function (event, table) {
                $scope.selectTable = table;
                if (!table.orderId) return;
                tableOperateService.orderDetailById({
                    id: table.orderId
                }, function (response) {
                    $scope.orderDetail = response.msg;
                })
            }

            //就餐人数
            $scope.mealNumber = 0;
            //开台备注
            $scope.remark = '';
            //外卖-确认开台
            $scope.confirmOutOpenTable = function (isMeal) {
                var data = {
                    diningTableName: $scope.selectTable.name,
                    dining_table_id: $scope.selectTable.id,
                    mealNumber: 0,
                    openTableRemark: '',
                    serial_id: $scope.selectTable.name,
                    shopId: localStorage.getItem('shop_id'),
                    table_runner: localStorage.getItem('name'),
                    isOut: $('#takeout_type option:selected').val(),
                    deliveryAddress: $('#txt_deliveryAddress').val().trim(),
                    deliveryTime: $('#txt_deliveryTime').val().trim(),
                    linkMan: $('#txt_contact').val().trim(),
                    linkPhone: $('#txt_mobile').val().trim()
                };
                if (data.linkMan.length == 0) {
                    showMessage('联系人不能为空');
                    return;
                }
                if (data.linkPhone.length == 0) {
                    showMessage('手机号码不能为空');
                    return;
                }
                if (data.deliveryTime.length == 0) {
                    showMessage('配送时间不能为空');
                    return;
                }
                if (data.deliveryAddress.length == 0) {
                    showMessage('配送地址不能为空');
                    return;
                }

                tableOperateService.openTable({}, data,
                    function (response) {
                        if (response.code != 200) {
                            alert(response.msg);
                            return;
                        }
                        $('#openMyTable').modal('hide');
                        if (isMeal) {
                            window.location.href = "#addOrder/" + response.msg.id + '/0';
                        } else {
                            $scope.selectTable = {};
                            showMessage('开桌成功', 2000, true, 'bounceIn-hastrans', 'bounceOut-hastrans');
                            tableInitialization();
                        }
                    }
                )
            }

            //桌位双击
            $scope.showModal = function (event, table) {
                //就餐人数
                $scope.mealNumber = 0;
                //开台备注
                $scope.remark = '';
                var offset = $(event.target).parent().offset();
                $scope.selectTable = table;
                $scope.isAdd = 0;
                for (var i = 0; i < $scope.callServiceList.length; i++) {
                    if ($scope.callServiceList[i].dining_table_id == $scope.selectTable.id &&
                        $scope.callServiceList[i].service_type == 0) {
                        $scope.isAdd = 1;
                    }
                }
                if (table.status == 0) {
                    //$scope.openTable($scope.selectTable.id);
                    $('#openMyTable').modal('show');
                } else if (table.status == 1 || table.status == 2 || table.status == 4) {
                    window.location.href = '#addOrder/' + table.orderId + '/1';
                }
            }

            //弹起菜单
            $scope.activeWinMenu = function (event, table) {
                $scope.selectTable = table;
                $scope.isAdd = 0;
                for (var i = 0; i < $scope.callServiceList.length; i++) {
                    if ($scope.callServiceList[i].dining_table_id == $scope.selectTable.id &&
                        $scope.callServiceList[i].service_type == 0) {
                        $scope.isAdd = 1;
                    }
                }
                var offset = $(event.target).parent().offset();
                var chaju = $(window).height() - offset.top;

                var _top = offset.top + 73;
                var _left = offset.left + 101;
                if (chaju < 335) {
                    _top = offset.top - 200;
                }
                $('#table_win_menu').css({
                    'left': _left,
                    'top': _top
                }).show();
                window.event.stopPropagation();
                window.event.preventDefault();
            }

            $scope.changeSelectTable = null;

            $scope.changeTurnTableItem = function (item) {
                $scope.changeSelectTable = item;
            }

            //菜单操作
            $scope.execCommonMenuFun = function (event) {
                var $this = $(event.target).parent();
                if (!$this.hasClass('win-menu-enable')) return;
                var key = $this.attr('key');
                var router = $this.attr('router');
                switch (key) {
                    case 'opentable':
                        $('#openMyTable').modal('show');
                        //$scope.openTable($scope.selectTable.id);
                        break;
                    case 'addorder':
                        window.location.href = router + $scope.selectTable.orderId + '/1';
                        break;
                    case 'payorder':
                        showMessage('请稍候．．．');
                        tableOperateService.orderDetailById({
                            id: $scope.selectTable.orderId
                        }, function (response) {
                            $scope.orderDetail = response.msg;
                            $('#table_win_menu').hide();

                            $scope.settleAccounts();
                            $('#manual_settle_wrap tr td:first').click();
                        })
                        return;
                        break;
                    case 'servinglist':
                    case 'orderdetail':
                    case 'printerorder':
                    case 'mergetable':
                        showMessage('调试中...');
                        //window.location.href = router + $scope.selectTable.orderId;
                        break;
                    case 'changetable':
                        $('#trunTable').modal('show');
                        break;
                    case 'ordertake':
                        $scope.orderTake();
                        break;
                    case 'cleartable':
                        $('#confirmDialog').modal('show');
                        break;
                    default:
                        break;
                }
                $('#table_win_menu').hide();
            }


            var getOrderDetail = function (id) {
                tableOperateService.orderDetail({
                        id: id
                    },
                    function (response) {
                        if (response.code == 500) {
                            alert('获取订单详情失败')
                            return
                        }
                        var orderDetail = response.msg;
                        //console.log("orderDetail ------ ",orderDetail);
                        var totalQuantity = 0;
                        var totalPrice = 0;

                        for (var i = 0; i < orderDetail.loi.length; i++) {

                            if (orderDetail.loi[i].is_lottery == 1) {
                                continue;
                            }
                            if (orderDetail.loi[i].status_id == 6) {
                                continue;
                            }
                            if (orderDetail.loi[i].status_id == 7) {
                                continue;
                            }
                            totalQuantity += orderDetail.loi[i].quantity;
                            if (orderDetail.loi[i].p.is_promotion == 1) {
                                totalPrice += orderDetail.loi[i].p.promotion_price * orderDetail.loi[i].quantity;
                            } else {
                                totalPrice += orderDetail.loi[i].p.unit_price * orderDetail.loi[i].quantity;
                            }
                        }
                        $scope.orderDetail = orderDetail;
                        $scope.totalQuantity = totalQuantity;
                        $scope.totalPrice = totalPrice;
                    },
                    function (error) {
                    }
                )
            }

            $scope.tableInf = {};

            //转桌
            $scope.changeTable = function (table) {
                if (!confirm("您确定要转至" + table.name + "吗？"))
                    return;

                tableOperateService.tableView({
                        id: table.id
                    },
                    function (response) {
                        if (response.code == 500) {
                            alert('获取桌位信息失败')
                            return
                        }
                        $scope.tableInf = response.msg;

                        tableOperateService.zhuanZhuo({
                            fromDiningTableId: $scope.selectTable.id,
                            toDiningTableId: $scope.tableInf.id
                        }, function (res) {
                            if (res.code == 500) {
                                alert('提交失败')
                                return
                            }
                            tableInitialization();
                            $('#trunTable').modal('hide');
                            showMessage('转桌成功', 2000, true, 'bounceIn-hastrans', 'bounceOut-hastrans');
                        })
                    })

                return;
                tableOperateService.tableView({
                        id: table.id
                    },
                    function (response) {
                        if (response.code == 500) {
                            alert('获取桌位信息失败')
                            return
                        }
                        $scope.tableInf = response.msg;
                        //getOrderDetail(table.id);
                        //$scope.selectTable = $scope.changeSelectTable;
                        var sum = 3;
                        var count = 0;

                        for (var i = 0; i < $scope.callServiceList.length; i++) {
                            if ($scope.callServiceList[i].dining_table_id == $scope.tableInf.id) {
                                $scope.callServiceList[i].dining_table_id = $scope.selectTable.id;
                                $scope.callServiceList[i].serial_id = $scope.selectTable.name;
                                tableOperateService.callServiceUpdate($scope.callServiceList[i],
                                    function (response) {
                                        if (response.code == 500) {
                                            alert('失败')
                                            return
                                        }
                                    },
                                    function (error) {
                                    }
                                );
                            }
                        }

                        $scope.tableInf.status = $scope.selectTable.status;
                        $scope.selectTable.status = 0;
                        tableOperateService.tableUpdate($scope.selectTable,
                            function (response) {
                                if (response.code == 500) {
                                    alert('提交失败')
                                    return
                                }
                                count++;
                                if (count == sum)
                                    window.location.href = "#tableOperate/list";
                            },
                            function (error) {
                            }
                        );
                        tableOperateService.tableUpdate($scope.tableInf,
                            function (response) {
                                if (response.code == 500) {
                                    alert('提交失败')
                                    return
                                }
                                tableInitialization();
                                $('#trunTable').modal('hide');
                                showMessage('转桌成功', 2000, true, 'bounceIn-hastrans', 'bounceOut-hastrans');
                                count++;
                                if (count == sum)
                                    window.location.href = "#tableOperate/list";
                            },
                            function (error) {
                            }
                        );
                        var data = {
                            id: $scope.orderDetail.id,
                            shop_id: $scope.orderDetail.shop_id,
                            serial_id: $scope.selectTable.name,
                            dining_table_id: $scope.selectTable.id,
                            loi: null,
                            status_id: 0
                        };
                        tableOperateService.orderUpdate(data,
                            function (response) {
                                if (response.code == 500) {
                                    alert('提交失败')
                                    return
                                }
                                count++;
                                if (count == sum)
                                    window.location.href = "#tableOperate/list";
                            },
                            function (error) {
                            }
                        );
                    },
                    function (error) {
                    }
                );
            }

            $scope.remind = function () {
                localStorage.setItem("is_remind", '0');
                $('#myModal_memberBirth').modal('hide');
            }

            function remindMemberBirth() {
                //console.log("$scope.nowKey ------ ", $scope.nowKey);
                var is_remind = localStorage.getItem("is_remind");
                if (is_remind == 1) {
                    memberInformationService.birth({},
                        function (response) {
                            if (response.code == 200) {
                                $scope.memberBirthList = response.msg;
                                //console.log("$scope.memberBirthList ------ ");
                                //console.log($scope.memberBirthList)
                                if ($scope.memberBirthList.length > 0 && $scope.nowKey == 4) {
                                    $('#myModal_memberBirth').modal('show')
                                }
                            }
                        })
                }
            }

            remindMemberBirth();


            $scope.test33 = function () {
                $('#myModal_memberBirth').modal('show')
            }

            //开桌
            $scope.openTable = function (tableId) {
                var data = {
                    diningTableName: $scope.selectTable.name,
                    dining_table_id: $scope.selectTable.id,
                    mealNumber: $scope.selectTable.seating_number,
                    openTableRemark: '',
                    serial_id: $scope.selectTable.name,
                    shopId: localStorage.getItem('shop_id'),
                    table_runner: localStorage.getItem('name')
                };
                var isResponse = 0;
                tableOperateService.openTable({
                        diningTableId: $scope.selectTable.id
                    },
                    data,
                    function (response) {
                        if (response.code != 200) {
                            alert(response.msg);
                            return;
                        }
                        showMessage('开桌成功', 2000, true, 'bounceIn-hastrans', 'bounceOut-hastrans');
                        isResponse = 1;
                        tableInitialization();
                    }
                )
                $('#openTable').attr('disabled', true);
                var loop = 0;
                // var interval= $interval(function() {
                // 	console.log("循环"+loop+"秒")
                // 	if(loop==5||isResponse==1){
                // 		if(loop==5&&isResponse!=1){
                // 			alert("5秒内未收到开桌响应,请检查网络状况")
                // 		}
                // 		$scope.isSubmit = 0;
                // 		$('#openTable').attr('disabled',false);
                // 		tableInitialization();
                // 		$('#myModal').modal('hide');
                // 		$interval.cancel(interval);
                // 	}
                // 	loop++;
                // }, 1000);
            }

            $scope.hideRightMenu = function () {
                $('#table_win_menu').hide();
            }

            //清台
            $scope.clearTable = function () {
                $('#openTable').attr('disabled', false);

                $scope.isSubmit = 0;
                //  if (!confirm("确定对" + $scope.selectTable.name + "进行清台吗？")) {
                //    return;
                //  }

                tableOperateService.clearDiningTable({
                        id: $scope.selectTable.id
                    },
                    function (response) {
                        if (response.code != 200) {
                            showMessage("清桌失败");
                            return;
                        }
                        $('#confirmDialog').modal('hide');
                        showMessage('清桌成功', 2000, true, 'bounceIn-hastrans', 'bounceOut-hastrans');
                        tableInitialization();
                    }
                )

                $('#myModal').modal('hide')
            }

            //点餐
            $scope.addOrder = function () {
                if (!$scope.selectTable || !$scope.selectTable.id) {
                    showMessage('请选择开桌桌位');
                    return;
                }
                window.location.href = '#addOrder/' + $scope.selectTable.orderId + '/1';
            }
            var shop = {};
            shopInformationService.view({
                    id: localStorage.getItem("shop_id")
                },
                function (response) {
                    if (response.code == 200) {
                        shop = response.msg;
                        //console.log(shop);
                    } else {
                        alert("printerOrderController_shopInformationService.view");
                    }
                },
                function (error) {
                }
            );

            //打印订单
            $scope.printerOrder = function () {
                if (!$scope.selectTable.id || !$scope.orderDetail || $scope.orderDetail.loi.length == 0) {
                    showMessage("请选择已就餐桌位");
                    return;
                }
                var service_charge = shop.service_charge;
                console.log("service_charge")
                console.log(shop)
                console.log(" ")
                PrinterService.getPrinterByPrinter_type({
                        printer_type: 999
                    },
                    function (response) {
                        if (response.code == 200) {

                            var nowTime = DataUtilService.getNowTime();
                            var printer = response.msg;

                            var LODOP = getCLodop();
                            LODOP.SET_LICENSES("", "3E893A594C00D5D9C1DBE7CD18C9E8DB", "C94CEE276DB2187AE6B65D56B3FC2848", "");
                            LODOP.PRINT_INITA(1, 1, 700, 600, '商铺' + localStorage.getItem('shop_id') + '_对账单');

                            var printer_name = printer.name;

                            var pageWidth = printer.page_width;
                            if (pageWidth == null || pageWidth == 0) {
                                alert("纸张宽度不能为空或零");
                                return;
                            }
                            LODOP.SET_PRINT_PAGESIZE(3, pageWidth + "mm", "", "");


                            //var flag = LODOP.SET_PRINTER_INDEXA('XP-80C');
                            var flag = LODOP.SET_PRINTER_INDEXA(printer_name);
                            if (flag) {
                                var top = 1;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "4mm", pageWidth + "mm", "8mm", "预打单");
                                LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                                LODOP.SET_PRINT_STYLEA(0, "Horient", 2);
                                LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                                LODOP.SET_PRINT_STYLEA(0, "FontSize", 15);

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "订单编号:" + $scope.orderDetail.order_no);

                                /*top+=5;
                 LODOP.ADD_PRINT_TEXT(top+"mm",0,"100%","4mm", "桌位:"+$scope.orderDetail.serial_id);	*/

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "收款员:" + localStorage.getItem("name"));

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "结账时间:" + nowTime);

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - -- - - - - - - - -- - -- - ");

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "品名");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "42%", "100%", "6mm", "单价");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "62%", "100%", "6mm", "数量");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "81%", "100%", "6mm", "金额");

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - -- - - - - - - - -- - -- - ");

                                var totalMemberMoney = 0.00;

                                var totalMoney = 0.00;
                                var payableMoney = 0.00;
                                var totalServiceMoney = 0.00;

                                var printerList = [];
                                $scope.orderList = [$scope.orderDetail];
                                for (var l = 0; l < $scope.orderList.length; l++) {
                                    printerList = $scope.orderList[l].loi;
                                    top += 2;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", " ");
                                    top += 5;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", "桌位:" + $scope.orderList[l].serial_id + ($scope.orderList[l].length > 1 && k == 0 ? "[主订单]" : ""));

                                    //分类
                                    console.log("printerList")
                                    console.log(printerList)
                                    console.log(" ")


                                    var orderItemList = printerList;
                                    console.log(orderItemList)

                                    //排序
                                    function compare(property) {
                                        return function (a, b) {
                                            var value1 = a[property];
                                            var value2 = b[property];
                                            return value1 - value2;
                                        }
                                    }

                                    orderItemList.sort(compare('category_id'));

                                    var total = 0.00;
                                    var payable = 0.00;
                                    var totalMemberPrice = 0.00;
                                    //category分组
                                    var category_orderItemList = []
                                    var orderItemList_category = [];

                                    for (var i = 0; i < orderItemList.length; i++) {

                                        if (i == 0 || orderItemList[i].category_id == orderItemList[i - 1].category_id) {


                                            category_orderItemList.push(orderItemList[i]);

                                            if (i == orderItemList.length - 1) {
                                                category_orderItemList.sort(compare('product_id'));
                                                orderItemList_category.push(category_orderItemList);
                                            }


                                            total += orderItemList[i].p.is_promotion == 1 ? orderItemList[i].quantity * orderItemList[i].p.promotion_price : orderItemList[i].quantity * orderItemList[i].p.unit_price
                                            if (orderItemList[i].is_lottery != 1 && orderItemList[i].status_id != 6 && orderItemList[i].status_id != 7) {
                                                payable += orderItemList[i].p.is_promotion == 1 ? orderItemList[i].quantity * orderItemList[i].p.promotion_price : orderItemList[i].quantity * orderItemList[i].p.unit_price
                                                //会员价
                                                if (orderItemList[i].p.is_promotion == 1) {

                                                    totalMemberPrice += orderItemList[i].p.promotion_price * orderItemList[i].quantity;

                                                } else if (orderItemList[i].p.isUseMemberPrice == 1) {

                                                    totalMemberPrice += orderItemList[i].p.memberPrice * orderItemList[i].quantity;

                                                } else {
                                                    totalMemberPrice += orderItemList[i].p.unit_price * orderItemList[i].quantity;
                                                }
                                            }

                                        } else {

                                            total += orderItemList[i].p.is_promotion == 1 ? orderItemList[i].quantity * orderItemList[i].p.promotion_price : orderItemList[i].quantity * orderItemList[i].p.unit_price
                                            if (orderItemList[i].is_lottery != 1 && orderItemList[i].status_id != 6 && orderItemList[i].status_id != 7) {
                                                payable += orderItemList[i].p.is_promotion == 1 ? orderItemList[i].quantity * orderItemList[i].p.promotion_price : orderItemList[i].quantity * orderItemList[i].p.unit_price
                                                //会员价
                                                if (orderItemList[i].p.is_promotion == 1) {

                                                    totalMemberPrice += orderItemList[i].p.promotion_price * orderItemList[i].quantity;

                                                } else if (orderItemList[i].p.isUseMemberPrice == 1) {

                                                    totalMemberPrice += orderItemList[i].p.memberPrice * orderItemList[i].quantity;

                                                } else {
                                                    totalMemberPrice += orderItemList[i].p.unit_price * orderItemList[i].quantity;
                                                }
                                            }

                                            category_orderItemList.sort(compare('product_id'));
                                            orderItemList_category.push(category_orderItemList);
                                            category_orderItemList = [];

                                            category_orderItemList.push(orderItemList[i]);

                                            if (i == orderItemList.length - 1) orderItemList_category.push(category_orderItemList);


                                        }
                                    }
                                    console.log(orderItemList_category)

                                    var orderItemList_category_productId = [];
                                    for (var i = 0; i < orderItemList_category.length; i++) {

                                        var productId_orderItemList = [];
                                        var orderItemList_categoryProductId = [];

                                        var orderItemList_category_productIdNormal = []
                                        //商品ID分组
                                        for (var j = 0; j < orderItemList_category[i].length; j++) {

                                            if (j == 0 || orderItemList_category[i][j].product_id == orderItemList_category[i][j - 1].product_id) {

                                                if (orderItemList_category[i][j].is_lottery != 1 && orderItemList_category[i][j].status_id != 6 && orderItemList_category[i][j].status_id != 7) {

                                                    orderItemList_category_productIdNormal.push(orderItemList_category[i][j])

                                                } else {

                                                    productId_orderItemList.push(orderItemList_category[i][j]);
                                                }

                                                if (j == orderItemList_category[i].length - 1) {

                                                    if (orderItemList_category_productIdNormal.length > 0) {

                                                        if (orderItemList_category_productIdNormal.length == 1) {

                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])
                                                            console.log(orderItemList_category_productIdNormal)

                                                        }
                                                        if (orderItemList_category_productIdNormal.length > 1) {

                                                            for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {

                                                                orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;

                                                            }
                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                        }
                                                    }
                                                    orderItemList_categoryProductId.push(productId_orderItemList);

                                                    orderItemList_category_productIdNormal = []
                                                }
                                            } else {

                                                if (orderItemList_category_productIdNormal.length > 0) {

                                                    if (orderItemList_category_productIdNormal.length == 1) {

                                                        productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                    }
                                                    if (orderItemList_category_productIdNormal.length > 1) {
                                                        for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {
                                                            orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;
                                                        }
                                                        productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                    }
                                                }

                                                orderItemList_categoryProductId.push(productId_orderItemList);

                                                productId_orderItemList = []
                                                orderItemList_category_productIdNormal = []

                                                if (orderItemList_category[i][j].is_lottery != 1 && orderItemList_category[i][j].status_id != 6 && orderItemList_category[i][j].status_id != 7) {

                                                    orderItemList_category_productIdNormal.push(orderItemList_category[i][j])

                                                } else {
                                                    productId_orderItemList.push(orderItemList_category[i][j]);
                                                }
                                                if (j == orderItemList_category[i].length - 1) {

                                                    if (orderItemList_category_productIdNormal.length > 0) {
                                                        if (orderItemList_category_productIdNormal.length == 1) {
                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])
                                                        }
                                                        if (orderItemList_category_productIdNormal.length > 1) {
                                                            for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {

                                                                orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;
                                                            }
                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                        }
                                                    }
                                                    orderItemList_categoryProductId.push(productId_orderItemList);
                                                    orderItemList_category_productIdNormal = []
                                                }
                                            }
                                        }

                                        orderItemList_category_productId.push(orderItemList_categoryProductId);
                                        orderItemList_categoryProductId = []
                                    }

                                    console.log(orderItemList_category_productId)

                                    var service_charge = shop.service_charge;
                                    //TODO
                                    if (service_charge == null) {
                                        service_charge = 0;
                                    }

                                    /*$scope.tableInf.is_out&&$scope.orderCashed==1?payable:payable+=service_charge;
                   $scope.tableInf.is_out&&$scope.orderCashed==1?total:total+=service_charge;
                   $scope.tableInf.is_out&&$scope.orderCashed==1?totalMemberMoney:totalMemberMoney+=service_charge;*/


                                    totalMoney += total;
                                    payableMoney += payable;
                                    totalMemberMoney += totalMemberPrice;
                                    //
                                    for (var i = 0; i < orderItemList_category_productId.length; i++) {
                                        top += 6;
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "5%", "100%", "4mm", orderItemList_category[i][0].category_name);
                                        LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                                        for (var j = 0; j < orderItemList_category_productId[i].length; j++) {
                                            for (var k = 0; k < orderItemList_category_productId[i][j].length; k++) {
                                                top += 6;
                                                var orderItem = orderItemList_category_productId[i][j][k];
                                                var product = orderItemList_category_productId[i][j][k].p;

                                                var price = orderItemList_category_productId[i][j][k].p.is_promotion == 1 ? orderItemList_category_productId[i][j][k].p.promotion_price :
                                                    orderItemList_category_productId[i][j][k].p.unit_price
                                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "3mm", orderItemList_category_productId[i][j][k].p.name);
                                                LODOP.ADD_PRINT_TEXT(top + "mm", "55%", "100%", "4mm", price);
                                                LODOP.ADD_PRINT_TEXT(top + "mm", "67%", "100%", "4mm", orderItemList_category_productId[i][j][k].quantity);
                                                LODOP.ADD_PRINT_TEXT(top + "mm", "79%", "100%", "4mm",
                                                    orderItemList_category_productId[i][j][k].is_lottery == 1 ? "赠送" :
                                                        orderItemList_category_productId[i][j][k].status_id == 6 ? '退菜' :
                                                            orderItemList_category_productId[i][j][k].status_id == 7 ? '断货' :
                                                                orderItemList_category_productId[i][j][k].p.is_promotion == 1 ? (orderItemList_category_productId[i][j][k].p.promotion_price * orderItemList_category_productId[i][j][k].quantity).toFixed(2) :
                                                                    (orderItemList_category_productId[i][j][k].p.unit_price * orderItemList_category_productId[i][j][k].quantity).toFixed(2)
                                                );
                                                /*if(product.is_promotion){

                           totalMemberPrice+=product.promotion_price*orderItem.quantity;

                         }else if(product.isUseMemberPrice){

                           totalMemberPrice+=product.memberPrice*orderItem.quantity;

                         }else{
                           totalMemberPrice+=product.unit_price*orderItem.quantity;
                         }*/

                                            }

                                        }
                                    }
                                    if ($scope.tableInf.is_out == 0 && shop.service_charge != null && shop.service_charge != 0 && $scope.orderCashed == 1) {
                                        totalMemberPrice += service_charge
                                        top += 6;
                                        LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "3mm", "一元乐购");
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "55%", "100%", "4mm", service_charge);
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "67%", "100%", "4mm", "1");
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "79%", "100%", "4mm", service_charge);
                                    }
                                }


                                if (shop.shop_code_id != null) {
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "6mm", "商铺二维码: ");
                                    top += 6;
                                    var imgUrl = apiHost + '/image/' + shop.shop_code_id;
                                    //alert(imgUrl)
                                    //LODOP.ADD_PRINT_BARCODE(top+"mm","15%","22%","22%","QRCode","<div><img src="+imgUrl+"/></div>");
                                    //http://test-admin.lbcy.com.cn/www/#/table/
                                    //LODOP.ADD_PRINT_BARCODE(top+"mm","15%","22%","22%","QRCode","http://test-admin.lbcy.com.cn/www/#/table/10036");
                                    LODOP.ADD_PRINT_IMAGE(top + "mm", "5%", "100%", "100%", "<img src=" + imgUrl + "/>");
                                    //LODOP. ADD_PRINT_HTML (top+"mm","5%","100%","100%","<div><img src="+imgUrl+"/></div>");
                                    //LODOP.SET_PRINT_STYLEA(0,"HtmWaitMilSecs",1000);
                                    top += 25;
                                }
                                top += 4;

                                top += 6;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - -");


                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", "合计: " + payableMoney.toFixed(2));

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", "会员合计: " + totalMemberMoney.toFixed(2));

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - -");

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "4mm", "商铺名称:" + shop.shop_name);

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "4mm", "联系方式:" + shop.phone);
                                //dev-pre
                                LODOP.PREVIEW();
                                //LODOP.PRINT();
                                //TODO:
                                window.location.reload()

                            } else {
                                alert("对应名称打印设备不存在");
                            }
                        } else {
                            alert("获取对应打印机名称失败");
                        }
                    }
                )
            }

            //进入结账窗口
            $scope.settleAccounts = function () {
                if (!$scope.selectTable.id || $scope.selectTable.status != 2) {
                    showMessage("请选择已就餐桌位");
                    return;
                }
                var totalMoney = $scope.getCpTotal(2);
                $('#sp_discountedMoney').text(totalMoney);
                $('#sp_sf_money').text(totalMoney);
                $('#sp_xj_money').text(totalMoney);
                $('#txt_xj_money').val(totalMoney);
                $('#settleAccount').on('show.bs.modal', function () {
                    setTimeout(function () {
                        $('#txt_xj_money').select()
                    }, 800);
                })
                $('#settleAccount').modal('show');
            }

            //优惠金额
            $scope.discountmoney = 0;
            //优惠金额后
            $scope.discountedMoney = 0;
            //找零
            $scope.zlMoney = 0;

            $scope.payType = 111;
            $scope.settle_status = 1;
            $scope.zfbPay = 0;
            $scope.cashPay = 0;
            $scope.cardPay = 0;
            $scope.integralPay = 0;
            $scope.balancePay = 0;
            $scope.wxPay = 0;

            $scope.memberno = '';

            $scope.ifCLodp = 0;
            var getIfCLodop = function () {
                if (typeof (getCLodop) == 'undefined') {
                    $scope.ifCLodp = 0;
                } else {
                    $scope.ifCLodp = 1;
                }
            }
            getIfCLodop();

            $scope.showMemberInput = function () {
                $('#manual_discount_wrap').hide();
                $('#tb_member_input_table').toggle();
            }

            var printer_999 = {};
            PrinterService.getPrinterByPrinter_type({
                    printer_type: 999
                },
                function (response) {
                    if (response.code == 200) {
                        printer_999 = response.msg;
                    }
                },
                function (error) {
                }
            )

            $scope.settlePayType = '';
            //挂单
            $scope.guaDanFun = function () {
                if ($('#settle_rmk_mutiple').is(':hidden')) {
                    $scope.settlePayType = 130;
                    $('#settle_rmk_mutiple').attr('placeholder', '填写挂单原因').show();
                } else {
                    $('#settle_rmk_mutiple').hide();
                    $scope.settlePayType = '';
                }
            }

            //免单
            $scope.mianDanFun = function () {
                if ($('#settle_rmk_mutiple').is(':hidden')) {
                    $scope.settlePayType = 120;
                    $('#settle_rmk_mutiple').attr('placeholder', '填写免单原因').show();
                } else {
                    $('#settle_rmk_mutiple').hide();
                    $scope.settlePayType = '';
                }
            }


            $scope.totalPrice = 0;
            $scope.discount = '';
            $scope.residue = '';
            $scope.payable = '';

            //执行结账
            var confirmSettleAccount = function () {
                if ($scope.settlePayType != '') {
                    var _data = {
                        description: $('#settle_rmk_mutiple').val().trim(),
                        id: $scope.orderDetail.id,
                        pay_type: $scope.settlePayType,
                        status_id: 1
                    };
                    tableOperateService.orderPay(_data, function (res) {
                        if (res.code == '500') {
                            showMessage('结账失败');
                            return;
                        }
                        $('#settle_rmk_mutiple').val('');
                        $('#settleAccount').modal('hide');
                        $scope.settlePayType = '';
                        showMessage('结账成功');
                    })
                    return;
                }

                var pay_sf_total = 0;
                var pay_item_len = $('.pay_m_item').length;
                $('.pay_m_item').each(function (idx, item) {
                    var parentKey = $(item).parent().attr('key');
                    if (parentKey == 'jf') {
                        pay_sf_total += parseFloat($(item).next().text());
                    } else {
                        pay_sf_total += parseFloat($(item).text());
                    }
                })
                if (pay_sf_total < parseFloat($('#sp_discountedMoney').text())) {
                    showMessage('实付金额不够');
                    return;
                }

                //结账参数
                var data = {
                    id: $scope.orderDetail.id, //订单id
                    memberId: null, //会员id
                    pay_type: $('.pay-type-checked').attr('kval'), //支付类型
                    status_id: $scope.settle_status, //状态
                    total_free: $scope.getCpTotal(1), //总金额
                    tradeAlipay: $scope.zfbPay, //支付宝金额
                    tradeCash: $scope.cashPay, //现金金额
                    tradeCreditCard: $scope.cardPay, //银行卡支付金额
                    tradeMemberIntegral: $scope.integralPay, //积分支付数目
                    tradeMemberMoney: $scope.balancePay, //余额支付数目
                    tradeechat: $scope.wxPay, //微信支付金额
                    typeHypotaxis: null
                };
                if (pay_item_len == 2) {
                    if ($scope.member != null && (data.pay_type == '115' || data.pay_type == 'jf')) {
                        data.isUseMember = 1;
                        data.memberId = $scope.member.id;
                        var _member_pay_item_len = $('#pay_item_area p').length;
                        if (_member_pay_item_len == 2) {
                            data.tradeMemberMoney = parseFloat($('#pay_item_area p[key=115] span').text());
                            data.tradeMemberIntegral = parseFloat($('#pay_item_area p[key=jf] span').text());
                        } else {
                            if (data.pay_type == '115') {
                                data.tradeMemberMoney = parseFloat($('#pay_item_area p[key=115] span').text());
                            } else {
                                data.tradeMemberIntegral = parseFloat($('#pay_item_area p[key=jf] span').text());
                            }
                        }
                        data.pay_type = 115;
                    } else {
                        if (data.pay_type == 'jf' || data.pay_type == '115') {
                            showMessage('会员信息空');
                            return;
                        } else {
                            data.pay_type = 116; //组合付款
                            data.tradeCash = parseFloat($('#pay_item_area p[key=111] span').text());
                            data.tradeechat = parseFloat($('#pay_item_area p[key=113] span').text());
                        }
                    }
                } else {
                    switch (data.pay_type) {
                        case '111':
                            data.tradeCash = pay_sf_total;
                            break;
                        case '112':
                            data.tradeCreditCard = pay_sf_total;
                            break;
                        case '113':
                            data.tradeechat = pay_sf_total;
                            break;
                        case '114':
                            data.tradeAlipay = pay_sf_total;
                            break;
                        case '115':
                            data.tradeMemberMoney = pay_sf_total;
                            if ($scope.member.balance < pay_sf_total) {
                                showMessage('余额不足');
                                return;
                            }
                            break;
                    }
                }

                data.income = pay_sf_total; //实收
                data.manualPreference = $scope.discountmoney; //手动优惠
                data.odd = $scope.zlMoney; //找零
                console.log(data);
                tableOperateService.orderPay(
                    data,
                    function (response) {
                        if (response.code != 200) {

                            alert(response.msg);
                            return;
                        }

                        showMessage('结账操作成功');


                        // $scope.cashPay=$('#pay_item_area p[key==111] span').text();
                        // $scope.wxPay=$('#pay_item_area p[key==113] span').text();
                        // $scope.zfbPay=$('#pay_item_area p[key==114] span').text();
                        // $scope.cardPay=$('#pay_item_area p[key==112] span').text();
                        // $scope.balancePay=$('#pay_item_area p[key==112] span').text();
                        // $scope.totalPrice=$('#sp_sf_money').text();
                        // $scope.discount=$('#txt_member_discount').text();
                        // $scope.payable=$('#sp_sf_money').text();

                        $scope.orderList = [$scope.orderDetail];
                        //结账单打印
                        if ($scope.ifCLodp == 1) {

                            var nowTime = DataUtilService.getNowTime();
                            var LODOP = getCLodop();
                            LODOP.SET_LICENSES("", "3E893A594C00D5D9C1DBE7CD18C9E8DB", "C94CEE276DB2187AE6B65D56B3FC2848", "");
                            LODOP.PRINT_INITA(1, 1, 700, 600, '商铺' + localStorage.getItem("shop_id") + '_结账单' + nowTime);
                            //printer_999.name = 'XP-80C';
                            var printer_name = 'XP-80C';

                            var pageWidth = printer_999.page_width;
                            if (pageWidth == null || pageWidth == 0) {
                                alert("纸张宽度不能为空或零,请在打印设置中设置");
                            }
                            LODOP.SET_PRINT_PAGESIZE(3, pageWidth + "mm", "5mm", "");

                            var flag = LODOP.SET_PRINTER_INDEX(printer_name);
                            if (flag) {
                                var top = 1;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "45%", pageWidth + "mm", "6mm", "结账单");
                                LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                                LODOP.SET_PRINT_STYLEA(0, "Horient", 2);
                                LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
                                LODOP.SET_PRINT_STYLEA(0, "FontSize", 15);

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "订单编号:" + $scope.orderList[0].order_no);

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "收款员:" + localStorage.getItem("name"));

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "结账时间:" + nowTime);

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - -- - - - - - - - -- - -- - ");

                                top += 5;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "6mm", "品名");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "42%", "100%", "6mm", "单价");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "62%", "100%", "6mm", "数量");
                                LODOP.ADD_PRINT_TEXT(top + "mm", "81%", "100%", "6mm", "金额");


                                var orderList = $scope.orderList;
                                for (var l = 0; l < orderList.length; l++) {

                                    //以category_id分组
                                    var orderItemList = orderList[l].loi;

                                    function compare(property) {
                                        return function (a, b) {
                                            var value1 = a[property];
                                            var value2 = b[property];
                                            return value1 - value2;
                                        }
                                    }

                                    orderItemList.sort(compare('category_id'));

                                    var orderItemListCategoryId = []
                                    var orderItemList_category = [];
                                    for (var i = 0; i < orderItemList.length; i++) {
                                        if (i == 0 || orderItemList[i].category_id == orderItemList[i - 1].category_id) {

                                            orderItemListCategoryId.push(orderItemList[i]);

                                        } else {
                                            orderItemListCategoryId.sort(compare('product_id'));
                                            orderItemList_category.push(orderItemListCategoryId);

                                            orderItemListCategoryId = [];

                                            orderItemListCategoryId.push(orderItemList[i]);

                                        }
                                        if (i == orderItemList.length - 1) {

                                            orderItemListCategoryId.sort(compare('product_id'));

                                            orderItemList_category.push(orderItemListCategoryId)
                                        }
                                    }

                                    var orderItemList_category_productId = [];

                                    for (var i = 0; i < orderItemList_category.length; i++) {

                                        var productId_orderItemList = [];

                                        var orderItemList_categoryProductId = [];

                                        var orderItemList_category_productIdNormal = []
                                        //商品ID分组
                                        for (var j = 0; j < orderItemList_category[i].length; j++) {

                                            if (j == 0 || orderItemList_category[i][j].product_id == orderItemList_category[i][j - 1].product_id) {

                                                if (orderItemList_category[i][j].is_lottery != 1 && orderItemList_category[i][j].status_id != 6 && orderItemList_category[i][j].status_id != 7) {

                                                    orderItemList_category_productIdNormal.push(orderItemList_category[i][j])

                                                } else {

                                                    productId_orderItemList.push(orderItemList_category[i][j]);
                                                }

                                                if (j == orderItemList_category[i].length - 1) {

                                                    if (orderItemList_category_productIdNormal.length > 0) {

                                                        if (orderItemList_category_productIdNormal.length == 1) {

                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                        }
                                                        if (orderItemList_category_productIdNormal.length > 1) {

                                                            for (var f = 1; f < orderItemList_category_productIdNormal.length; f++) {

                                                                orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[f].quantity;

                                                                console.log(orderItemList_category_productIdNormal)

                                                            }
                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                        }
                                                    }
                                                    orderItemList_categoryProductId.push(productId_orderItemList);

                                                    orderItemList_category_productIdNormal = []
                                                }

                                            } else {

                                                if (orderItemList_category_productIdNormal.length > 0) {

                                                    if (orderItemList_category_productIdNormal.length == 1) {

                                                        productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                    }
                                                    if (orderItemList_category_productIdNormal.length > 1) {
                                                        for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {
                                                            orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;
                                                        }
                                                        productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                    }
                                                }

                                                orderItemList_categoryProductId.push(productId_orderItemList);

                                                productId_orderItemList = []
                                                orderItemList_category_productIdNormal = []

                                                if (orderItemList_category[i][j].is_lottery != 1 && orderItemList_category[i][j].status_id != 6 && orderItemList_category[i][j].status_id != 7) {

                                                    orderItemList_category_productIdNormal.push(orderItemList_category[i][j])

                                                } else {
                                                    productId_orderItemList.push(orderItemList_category[i][j]);
                                                }
                                                if (j == orderItemList_category[i].length - 1) {

                                                    if (orderItemList_category_productIdNormal.length > 0) {
                                                        if (orderItemList_category_productIdNormal.length == 1) {
                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])
                                                        }
                                                        if (orderItemList_category_productIdNormal.length > 1) {
                                                            for (var k = 1; k < orderItemList_category_productIdNormal.length; k++) {

                                                                orderItemList_category_productIdNormal[0].quantity += orderItemList_category_productIdNormal[k].quantity;
                                                            }
                                                            productId_orderItemList.push(orderItemList_category_productIdNormal[0])

                                                        }
                                                    }
                                                    orderItemList_categoryProductId.push(productId_orderItemList);
                                                    orderItemList_category_productIdNormal = []
                                                }
                                            }
                                        }

                                        orderItemList_category_productId.push(orderItemList_categoryProductId);

                                        orderItemList_categoryProductId = []
                                    }

                                    top += 5;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");
                                    top += 5;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "4mm", "桌位:" + orderList[l].serial_id + (orderList[l].length > 1 && k == 0 ? "[主订单]" : ""));
                                    for (var p = 0; p < orderItemList_category_productId.length; p++) {
                                        top += 6;
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "5%", "100%", "4mm", orderItemList_category_productId[p][0][0].category_name);
                                        LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                                        for (var t = 0; t < orderItemList_category_productId[p].length; t++) {

                                            for (var y = 0; y < orderItemList_category_productId[p][t].length; y++) {
                                                top += 6;
                                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "3mm", orderItemList_category_productId[p][t][y].p.name);
                                                LODOP.ADD_PRINT_TEXT(top + "mm", "55%", "100%", "4mm", orderItemList_category_productId[p][t][y].p.is_promotion == 1 ? orderItemList_category_productId[p][t][y].p.promotion_price : orderItemList_category_productId[p][t][y].p.unit_price);
                                                LODOP.ADD_PRINT_TEXT(top + "mm", "67%", "100%", "4mm", orderItemList_category_productId[p][t][y].quantity)
                                                LODOP.ADD_PRINT_TEXT(top + "mm", "79%", "100%", "4mm", orderItemList_category_productId[p][t][y].is_lottery == 1 ? "赠送" : orderItemList_category_productId[p][t][y].status_id == 6 ? '退菜' : orderItemList_category_productId[p][t][y].status_id == 7 ? '断货' : orderItemList_category_productId[p][t][y].p.is_promotion == 1 ? (orderItemList_category_productId[p][t][y].p.promotion_price * orderItemList_category_productId[p][t][y].quantity).toFixed(2) : (orderItemList_category_productId[p][t][y].p.unit_price * orderItemList_category_productId[p][t][y].quantity).toFixed(2));
                                            }
                                        }
                                    }


                                    if ($scope.tableInf.is_out == 0 && shop.service_charge != null && shop.service_charge != 0 && $scope.orderCashed == 1) {
                                        top += 6;
                                        LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "3mm", "一元乐购");
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "55%", "100%", "4mm", shop.service_charge);
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "67%", "100%", "4mm", "1");
                                        LODOP.ADD_PRINT_TEXT(top + "mm", "79%", "100%", "4mm", shop.service_charge);
                                    }
                                }
                                top += 6
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - -");

                                if (data.tradeCash) {
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "现金支付: " + data.tradeCash);
                                }


                                if (data.tradeechat) {
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "微信支付: " + data.tradeechat);
                                }

                                if (data.tradeAlipay) {
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "支付宝支付: " + data.tradeAlipay);
                                }

                                if (data.tradeCreditCard) {
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "银行卡支付: " + data.tradeCreditCard);
                                }

                                if (data.tradeMemberMoney) {
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "余额支付: " + data.tradeMemberMoney);
                                }

                                if (data.tradeMemberIntegral) {
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "积分支付: " + data.tradeMemberIntegral);
                                }

                                top += 6;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "合计应收: " + pay_sf_total);

                                //  if (data.discount != "" && data.discount != 0) {
                                //    top += 6;
                                //    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "折扣: " + data.discount);
                                //  }

                                //  if (data.residue != "" && data.residue != 0) {
                                //    top += 6;
                                //    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "抹零: " + data.residue);
                                //  }


                                top += 6;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "实收: " + pay_sf_total);

                                if (data.isUseMember == 1) {
                                    top += 4;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");

                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", "会员余额: " + ($scope.member.balance - data.tradeMemberMoney));

                                    top += 4;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");
                                }

                                var isFreeSingleOrIsBill = $scope.payType == 120 ? "免单支付" : $scope.payType == 130 ? "挂账支付" : false;
                                console.log("orderList[0] ------ ");
                                console.log(orderList[0]);

                                if (isFreeSingleOrIsBill) {
                                    top += 4;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");
                                    top += 6;
                                    LODOP.ADD_PRINT_TEXT(top + "mm", "6.6mm", "100%", "6mm", isFreeSingleOrIsBill);
                                    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
                                    top += 4;
                                }

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");

                                /*top+=4;
                 LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","商铺名称:"+shop.shop_name);

                 top+=4;
                 LODOP.ADD_PRINT_TEXT(top+"mm","1mm","100%","6mm","联系方式:"+shop.phone);*/

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", 0, "100%", "2mm", "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ");

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "6mm", "技术支持：河北玄宇通网络科技有限公司");

                                top += 4;
                                LODOP.ADD_PRINT_TEXT(top + "mm", "1mm", "100%", "6mm", "服务热线：400－0217－123");
                                //dev
                                LODOP.PREVIEW();

                                //LODOP.PRINT();

                            } else {
                                alert("打印机名称对应打印设备不存在");
                            }

                        }
                    },
                    function (error) {
                        console.log("error ------ ");
                        console.log(error)
                        alert('结账失败');
                    }
                );
            }

            tableOperateService.memberIntegral({},
                function (response) {
                    if (response.code == 500) {
                        alert('获取会员信息失败')
                        return
                    }
                    var integerMember = response.msg;
                    //alert("test")
                    //if(member.convertMoney!=null&&isNaN(member.convertMoney)){
                    if (integerMember != null)
                        $scope.memberIntegarDiscount = parseFloat(integerMember.convertMoney / integerMember.convertIntegral).toFixed(2);
                    // }

                    console.log($scope.memberIntegarDiscount);
                },
                function (error) {
                }
            );

            $scope.changeBigInput = function (event, parentid) {
                $scope.jisuanshoudongyouhui(parentid, event.target.value, $('.pay-type-checked').attr('kval'));
            }

            $scope.jisuanshoudongyouhui = function (parentId, _tmpVal, key) {
                if (_tmpVal == '') {
                    _tmpVal = '0';
                }
                if (parentId == 'manual_discount_wrap') {
                    if (parseFloat(_tmpVal) > parseFloat($('#sp_discountedMoney').text())) {
                        showMessage('优惠超出');
                        return false;
                    }
                    $('#txt_discountedMoney').val(parseFloat($('#sp_discountedMoney').text()) - parseFloat(_tmpVal));
                    $('#sp_sf_money').text($('#txt_discountedMoney').val());
                } else if (parentId == 'manual_settle_wrap') {
                    if (key) {
                        var _key_txt = $('.pay-type-checked').text();
                        if (key == 'jf') {
                            $('#pay_item_area p[key=' + key + '] #i_jf_money').text(($scope.memberIntegarDiscount * parseFloat(_tmpVal)));
                        } else {
                            if ($('#pay_item_area p[key=' + key + ']').length == 0) {
                                $('#pay_item_area').append('<p key="' + key + '" style="text-align:right;"><i id="sp_pay_type">' + _key_txt + '</i><span id="sp_xj_money" class="pay_m_item">' + _tmpVal + '</span></p>');
                            } else {
                                $('#pay_item_area p[key=' + key + '] span').text(_tmpVal);
                            }
                        }
                    }

                    var _sf_money = parseFloat($('#sp_sf_money').text());

                    var pay_sf_total = 0;
                    $('.pay_m_item').each(function (idx, item) {
                        var parentKey = $(item).parent().attr('key');
                        if (parentKey == 'jf') {
                            pay_sf_total += parseFloat($(item).next().text());
                        } else {
                            pay_sf_total += parseFloat($(item).text());
                        }
                    })
                }
                var _zl_money = pay_sf_total - parseFloat($('#sp_sf_money').text());

                if (_tmpVal == '0' || _sf_money > pay_sf_total || isNaN(_zl_money)) {
                    _zl_money = 0;
                }
                $('#sp_zl_money').text(_zl_money.toFixed(2));
                return true;
            }

            $scope.bindSelectAll = function (event) {
                $(event.target).attr('selectall', 'selectall').select();
            }

            //开桌-键盘
            $('.cal-table tr td').click(function () {
                var parentId = $(this).parents('.cal-wrap').attr('id');

                var inputBox = $('#txt_discountmoney');
                if (parentId == 'open_table_wrap') {
                    inputBox = $('#txt_mealNumber');


                    if (inputBox.val().trim().length == 3) {
                        showMessage('座位数限制3位数');
                        return;
                    }
                }
                var key = $(this).attr('key');
                var txt = $(this).text();
                if (parentId == 'member_input_table') {
                    inputBox = $('#txt_memberno');
                    switch (key) {
                        case 'backspace':
                            inputBox.val(inputBox.val().substring(0, inputBox.val().length - 1));
                            if (inputBox.val().length == 0) {
                                inputBox.val('');
                                return;
                            }
                            break;
                        case 'clear':
                            inputBox.val('');
                            $('#txt_member_discount').val('');
                            $('#txt_balance').val('');
                            $('#txt_member_integer').val('');
                            $scope.member = null;
                            $('#sp_sf_money').text($('#sp_discountedMoney').text());
                            $('#pay_item_area p:first span').text($('#sp_discountedMoney').text());
                            break;
                        case 'confirm':
                            memberInformationService.getMember({
                                id: localStorage.getItem('shop_id'),
                                cardNumber: inputBox.val()
                            }, function (res) {
                                if (res.code != '200') {
                                    $scope.member = null;
                                    showMessage('服务器查询异常');
                                    return;
                                }
                                $scope.member = res.msg;
                                $('#txt_member_discount').val(res.msg.memberCardDiscount);
                                $('#txt_balance').val(res.msg.balance);
                                $('#txt_member_integer').val(res.msg.integral);
                                $('#tb_member_input_table').hide();
                            })
                            //$(this).parents('.member-input-table').hide();
                            break;
                        default:
                            if (inputBox.val().indexOf('.') > 0 && txt == '.') {
                                return;
                            }
                            inputBox.val(inputBox.val() + txt);
                            break;
                    }
                    return;
                }
                if (parentId == 'manual_settle_wrap') {
                    inputBox = $('#txt_xj_money');
                }
                if (parentId == 'open_table_wrap') {
                    inputBox = $('#txt_mealNumber');
                }
                if (inputBox.val().length == 5 && !key) {
                    showMessage('超出输入范围');
                    return;
                }
                if (inputBox.val().indexOf('0') == 0 && !key) inputBox.val('');
                switch (key) {
                    case 'backspace': //退格删除
                        inputBox.val(inputBox.val().substring(0, inputBox.val().length - 1));
                        //手动优惠
                        if (!$scope.jisuanshoudongyouhui(parentId, inputBox.val(), $('.pay-type-checked').attr('kval'))) {
                            return;
                        }
                        if (inputBox.val().length == 0) {
                            inputBox.val('0');
                            return;
                        }
                        break;
                    case 'clear': //清除
                        $('#txt_discountmoney').val('0');
                        $scope.jisuanshoudongyouhui(parentId, '0')
                        inputBox.val('0');
                        $('#sp_sf_money').text($('#sp_discountedMoney').text());
                        $('#sp_xj_money').text($('#sp_discountedMoney').text());
                        $('#pay_item_area p').remove();
                        $('#manual_settle_wrap table tr td[kval]').removeClass('pay-type-checked');
                        $('#manual_settle_wrap table tr td[kval]:first').addClass('pay-type-checked');
                        $('#txt_xj_money').val('0');
                        break;
                    case 'confirm': //确认
                        $(this).parents('.manual-discount-wrap').hide();
                        break;
                    case 'startSettle': //结账
                        confirmSettleAccount();
                        return;
                        break;
                    case 'paytype': //选择支付类型
                        inputBox.val('');
                        var kval = $(this).attr('kval');
                        if ((kval == 'jf' || kval == 'zk') && ($scope.member == null || !$scope.member.id)) {
                            showMessage('会员信息空');
                            return;
                        }

                        $('.pay-type-checked').removeClass('pay-type-checked');
                        $(this).addClass('pay-type-checked');

                        if ($('#pay_item_area p[key=' + kval + ']').length == 1) {
                            inputBox.val($('#pay_item_area p[key=' + kval + '] span').text());

                            inputBox.attr('selectall', 'selectall');
                            inputBox.select();
                            return;
                        }
                        if (kval != 'jf' && kval != 'zk') {
                            var pay_sf_total = 0;
                            $('.pay_m_item').each(function (idx, item) {
                                var parentKey = $(item).parent().attr('key');
                                if (parentKey == 'jf') {
                                    pay_sf_total += parseFloat($(item).next().text());
                                } else {
                                    pay_sf_total += parseFloat($(item).text());
                                }
                            })
                            if (pay_sf_total < parseFloat($('#sp_sf_money').text())) {
                                var result_total = parseFloat($('#sp_sf_money').text()) - pay_sf_total;
                                inputBox.val(result_total);
                                $('#pay_item_area').append('<p key="' + kval + '" style="text-align:right;"><i id="sp_pay_type">' + $(this).text() + '</i><span id="sp_xj_money" class="pay_m_item">' + result_total + '</span></p>');
                            }
                        } else {
                            if (kval == 'jf') {
                                inputBox.val($scope.member.integral);
                                $('#pay_item_area').append('<p key="' + kval + '" style="text-align:right;"><i id="sp_pay_type">' + $(this).text() + '</i><span style="float:inherit;margin-left:0px;margin-right:40px;" id="sp_xj_money" class="pay_m_item">' + inputBox.val() + '</span><i id="i_jf_money" style="margin-right:30px;">' + ($scope.memberIntegarDiscount * parseFloat(inputBox.val())).toFixed(2) + '</i></p>');
                            }
                        }
                        inputBox.select();
                        inputBox.attr('selectall', 'selectall');
                        return;
                        break;
                    default: //默认输入值
                        if (inputBox.attr('selectall')) {
                            inputBox.val('');
                            inputBox.removeAttr('selectall');
                        }
                        var td_selected = $('#manual_settle_wrap table tr .pay-type-checked');
                        var kval = td_selected.attr('kval');
                        if (inputBox.val().indexOf('.') > 0 && txt == '.') {
                            return;
                        }
                        var isMember = false;
                        if (kval == 'jf') {
                            if ($scope.member == null) {
                                showMessage('会员信息空');
                                return;
                            }
                            isMember = true;
                        }

                        var _oldVal = inputBox.val();
                        var _tmpVal = inputBox.val() + txt;

                        //手动优惠
                        if (!$scope.jisuanshoudongyouhui(parentId, _tmpVal, kval)) {
                            return;
                        }
                        inputBox.val(_tmpVal);
                        break;
                }
            })

            //获取菜品金额、应付金额
            $scope.getCpTotal = function (type) {
                let total = 0;
                if (!$scope.orderDetail) {
                    return total;
                }
                if (type == 1) {
                    $scope.orderDetail.loi.forEach(function (item, idx) {
                        total += (item.quantity * item.p.unit_price);
                    })
                } else {
                    $scope.orderDetail.loi.forEach(function (item, idx) {
                        total += (item.quantity * (item.p.is_promotion ? item.p.promotion_price : item.p.unit_price));
                    })
                }
                return total;
            }

            //清台
            $scope.clearStage = function () {
                if (!$scope.selectTable.id || $scope.selectTable.status != 1) {
                    showMessage('请选择已开桌的桌位');
                    return;
                }
                $('#confirmDialog').modal('show');
            }
            //确认清台
            $scope.confirmClearStage = function () {
                $scope.clearTable();
            }

            $scope.goto = function (url) {
                $('#myModal').modal('hide').on('hidden.bs.modal', function () {
                    window.location.href = url;
                })
            }

            $scope.orderTake = function () {
                $('#myModal').modal('hide').on('hidden.bs.modal', function () {
                    window.location.href = '#takingOrder/' + $scope.selectTable.id;
                })
            }

            $scope.currentActiveRegion = {};

            //选择区域
            $scope.changeRegion = function (_region, _isTurn) {
                if (!_isTurn) {
                    $scope.currentActiveRegion = _region;
                }

                tableOperateService.tableList($scope.getSearchTabParam(_isTurn),
                    function (response) {
                        if (response.code == 500) {
                            alert('获取桌位列表失败')
                            return;
                        }
                        if (_isTurn) {
                            $scope.turnCurrentActiveRegion = _region;
                            $scope.turnDiningTableList = response.msg;
                        } else {
                            $scope.diningTableList = response.msg;
                        }
                        // var _regions=[];
                        // _regions.push({id:-1,name:'全部',shopId:null});
                        // _regions=_regions.concat(response.msg.regionList);
                        // $scope.regionList=_regions;

                    },
                    function (error) {
                    }
                );
            }

            $scope.activeSeat = {};

            //选择桌位人数
            $scope.changeSeat = function (_seat, _isTurn) {
                if (!_isTurn) {
                    $scope.activeSeat = _seat;
                }

                tableOperateService.tableList($scope.getSearchTabParam(_isTurn),
                    function (response) {
                        if (response.code == 500) {
                            alert('获取桌位列表失败')
                            return;
                        }
                        if (_isTurn) {
                            $scope.turnTbActiveSeat = _seat;
                            $scope.turnDiningTableList = response.msg;
                        } else {

                            $scope.diningTableList = response.msg;
                        }
                        // var _regions=[];
                        // _regions.push({id:-1,name:'全部',shopId:null});
                        // _regions=_regions.concat(response.msg.regionList);
                        // $scope.regionList=_regions;

                    },
                    function (error) {
                    }
                );
            }
            $('.tabCntArea a').click(function () {
                $(this).siblings().find('i').removeClass('icon-tab_m_selected').addClass('icon-tab_m_unselected');
                $(this).find('i').addClass('icon-tab_m_selected');
            })

            //手动优惠键盘弹出与收起
            $('#js_btn_mdac').click(function () {
                $('#tb_member_input_table').hide();
                $('#manual_discount_wrap').toggle();
                $('#txt_discountmoney').select().attr('selectall', 'selectall');
            })
        }
    ])