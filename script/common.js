function fnReady() {
    fnReadyOpenWin();
    fnReadyHeader();
    fnReadyNav();
    fnReadySmallNav();
    fnReadyFooter();
};

function closeWin() {
    console.log("公共方法返回");
    api.closeWin({});
}

function closeFrame() {
    api.closeFrame({});
}

//双击退出应用
function exit_app() {
    api.addEventListener({
        name: 'keyback'
    }, function (ret, err) {
        api.toast({
            msg: '再按一次退出应用',
            duration: 2000,
            location: 'bottom'
        });
        api.addEventListener({
            name: 'keyback'
        }, function (ret, err) {
            api.closeWidget({
                id: 'A6015606229558',
                retData: {
                    name: 'closeWidget'
                },
                animation: {
                    type: 'flip',
                    subType: 'from_bottom',
                    duration: 500
                },
                silent: true
            });
        });
        setTimeout(function () {
            exit_app();
        }, 3000);
    });
}

function getBaseRootPath() {
    //正式环境请求地址 切换请谨慎
    // HOST_URL = "https://www.eyunche.com";
    // 测试环境请求地址 切换请谨慎
    HOST_URL = "http://47.108.31.44";
    return (HOST_URL);
}

//封装请求数据  
function getRootPath() {
    HOST_URL = getBaseRootPath() + "/app/";
    return (HOST_URL);
}

function getPicPath() {
    HOST_URL = getBaseRootPath();
    return (HOST_URL);
}
//
function openCarme() {
    //上传图片标识
    var resultList = api.hasPermission({
        list: ['camera']
    });
    if (!resultList[0].granted) {
        api.requestPermission({
            list: ["camera"],
        }, function (res) {
            if (res.list[0].granted) {
            }
        });
    }
}

function outDealData(url, success, fail) {
    //console.log(url);
    api.ajax({
        url: url,
        //headers: headers,
        method: "get",

    }, function (ret, err) {
        if (ret) {
            success(ret);
        }
        else {
            fail(err)
        }
    })
    api.ajax({
        url: url,
        //headers: headers,
        method: "get",
        success: function (data, textStatus, jqxhr) {

            console.log("success:", JSON.stringify(data));
            success(data);
        },
        error: function (jqxhr, textStatus, error) {
            console.log("error:", JSON.stringify(data));
            fail(error);

        }
    })
}
function dealData(url, trantype, data, success, fail, file) {
    var accessToken = $api.getStorage('accessToken');
    // console.log("accessToken:", accessToken);
    var refreshToken = $api.getStorage('refreshToken');
    var rootPath;
    if (url.slice(0, 7) === "/member") {
        rootPath = getPicPath();
    } else {
        rootPath = getRootPath();
    }
    var headers = {
        "Authorization": 'bearer ' + accessToken
    };
    if (!file) {
        headers['Content-Type'] = 'application/json';
    }
    api.ajax({
        url: rootPath + url,
        headers: headers,
        method: trantype,
        data: {
            body: data,
            files: file
        }
    }, function (ret, err) {
        if (ret) {
            // alert("1---"+token)
            if (success != undefined && typeof (success) === "function") {
                success(ret);
                //如果token过期
                if (ret.status == 401) {
                    $api.rmStorage('accessToken');
                    $api.rmStorage('refreshToken');
                    api.openWin({
                        name: 'login',
                        slidBackEnabled: false,
                        url: '../../html/login/hz_login.html'
                    });
                }
                if (ret.status == 402) {
                    api.ajax({
                        url: getRootPath() + 'driver/auth/token/refresh',
                        method: 'POST',
                        data: {
                            values: {
                                "refreshToken": refreshToken
                            }
                        }
                    }, function (ret, err) {
                        if (ret) {
                            //	alert(JSON.stringify(ret));
                            if (ret.status == 0) {
                                $api.setStorage('accessToken', ret.data.accessToken);
                                // console.log('refresh' + ret.data.accessToken);
                                $api.setStorage('refreshToken', ret.data.refreshToken);
                            } else {
                                $api.rmStorage('accessToken');
                                $api.rmStorage('refreshToken');
                                api.openWin({
                                    name: 'login',
                                    slidBackEnabled: false,
                                    url: '../../html/login/hz_login.html'
                                });
                            }
                        }
                    });
                }
                //token失效调用刷新token接口
                if (ret.code === -5) {
                    $api.rmStorage('isautologin');
                    $api.rmStorage('accessToken');
                    $api.rmStorage('refreshToken');

                    api.openWin({
                        name: 'login',
                        slidBackEnabled: false,
                        url: '../html/login/login.html'
                    });
                    api.sendEvent({
                        name: 'isLogin',
                        extra: {
                            key: 1
                        }
                    });
                    api.closeWin();
                }
                if (ret.code === -2) {
                    $api.rmStorage('isautologin');
                    $api.rmStorage('accessToken');
                    $api.rmStorage('refreshToken');

                    api.openWin({
                        name: 'login',
                        slidBackEnabled: false,
                        url: '../html/login/login.html'
                    });
                    api.sendEvent({
                        name: 'isLogin',
                        extra: {
                            key: 1
                        }
                    });
                    api.closeWin();
                }
            }
        } else {
            if (fail != undefined && typeof (fail) === "function") {
                fail(err);
            }
        }
        api.hideProgress();
    });
}

//根据属性开界面，带参数
function fnReadyOpenWin() {
    var buttons = $api.domAll('.open-win');
    for (var i = 0; i < buttons.length; i++) {
        $api.attr(buttons[i], 'tapmode', 'highlight');
        buttons[i].onclick = function () {
            var target = $api.closest(event.target, '.open-win');
            var winName = $api.attr(target, 'win'),
                isNeedLogin = $api.attr(target, 'login'),
                param = $api.attr(target, 'param');

            if (isNeedLogin && !$api.getStorage('accessToken')) {
                winName = 'login';
            }

            if (param) {
                param = JSON.parse(param);
            }
            api.openWin({
                name: winName.replace('html/', ''),
                url: './' + winName + '.html',
                slidBackEnabled: false,
                animation: {
                    type: "movein", //动画类型（详见动画类型常量）
                    subType: "from_right", //动画子类型（详见动画子类型常量）
                    duration: 300 //动画过渡时间，默认300毫秒
                },
                pageParam: param
            });
        };
    }
    api.parseTapmode();
};

//头部navfooter的高度

var header, headerHeight = 0;

function fnReadyHeader() {
    header = $api.byId('header');
    if (header) {
        //		$api.fixIos7Bar(header);
        headerHeight = $api.offset(header).h;
    }
};

var nav, navHeight = 0;

function fnReadyNav() {
    nav = $api.byId('nav');
    if (nav) {
        navHeight = $api.offset(nav).h;
    }
};

var smallnav, smallnavHeight = 0;

function fnReadySmallNav() {
    smallnav = $api.byId('smallnav');
    if (smallnav) {
        smallnavHeight = $api.offset(smallnav).h;
    }
};

var footer, footerHeight = 0;

function fnReadyFooter() {
    footer = $api.byId('footer');
    if (footer) {
        footerHeight = $api.offset(footer).h;
    }
};

//超过显示省略号
function showEllipsis(maxwidth) {
    $(".ecllips").each(function () {
        if ($(this).text().length > maxwidth) {
            $(this).text($(this).text().substring(0, maxwidth));
            $(this).html($(this).html() + '…');
        }
    });
}

//显示隐藏密码
function hideShowPsw() {
    $(".psw_img").click(function () {
        $(this).toggleClass('aui-icon-hide').toggleClass('aui-icon-display');
        var pswInput = $(this).parent().prev().children();
        if (pswInput.attr('type') == "password") {
            pswInput.attr('type', 'text');
        } else {
            pswInput.attr('type', 'password');
        }
    })
}

function myAlert(txt) {
    if (txt != 'AccessToken已过期' && txt != '无效的AccessToken') {
        alert(txt);
    }
}

function myWarning(txt) {
    alert(txt);
}

//电话直连
$(".tocall").click(function () {
    api.call({
        type: 'tel_prompt',
        number: $(this).html()
    });
})

$("body").on("touchstart", ".inpt_tocall", function () {
    api.call({
        type: 'tel_prompt',
        number: $(this).val()
    });
})

//回到商城首页
$(".toshopindex").click(function () {
    api.closeToWin({
        name: 'main',
        animation: {
            type: 'push'
        }
    });
})

function getLocation() {
    var st = $api.getStorage('lastReportLocationTime');

    if (undefined == st) {
        st = '0';
    }

    st = parseInt(st);
    if (new Date().getTime() - st < 60000) {
        return;
    }
    //		var aMap = api.require('aMap');
    //		aMap.getLocation({
    //		    accuracy: '100m',
    //		    autoStop: true,
    //		    filter: 1
    //		}, function(ret, err) {
    //		    if (ret.status) {
    //
    //		        //alert(JSON.stringify(ret));
    //		        var lon=ret.lon;
    //		        var lat=ret.lat;
    //				dealData("driver/usercenter/reportLocation",'POST',
    //					{
    //						"lng" :lon,
    //						"lat" :lat
    //					},
    //					function(ret){
    //						//myAlert(JSON.stringify(ret));
    //						if (ret.status == 0) {
    //							$api.setStorage('lastReportLocationTime', '' + new Date().getTime());
    //						} else {
    //							//myAlert(ret.message);
    //						}
    //					},
    //					function(err){
    //						//myAlert('加载失败');
    //					})
    //
    //		    } else {
    //		       console.log(JSON.stringify(ret));
    //		    }
    //	});
}

/** 
 *	判断APP是否持有该权限
 * @param array   one_per  	- 权限数组['camera','location']
 */
function hasPermission(one_per) {
    var rets = api.hasPermission({
        list: one_per
    });

    //获取需要判断的权限
    var temp = new Array();
    var status = true;
    for (var obj in rets) {
        var granted = rets[obj].granted;
        var names = rets[obj].name;
        if (granted == false) {
            temp.push(names);
            status = false;
        }
    }
    //返回结果，和需要申请的权限
    return {
        "status": status,
        "perms": temp
    };
}

/**
 *	获取权限
 * @param array		one_per  	- 权限数组['camera','location']
 * @param function  callback  	- 回调函数
 */
function reqPermission(one_per, callback) {
    api.requestPermission({
        list: one_per,
        code: 100001
    }, function (ret, err) {
        //获取处理结果
        var list = ret.list;
        for (var i in list) {
            //只有有一项权限不足，就返回
            if (list[i].granted == false) {
                api.toast({
                    msg: '权限不足，无法进行下一步操作',
                    duration: 2000,
                    location: 'bottom'
                });
                return false;
            }
        }

        if (callback) {
            callback();
            return;
        }
    });
}

/**
 * 判断是否持有数组中的权限，无权限获取对应的权限
 * @param array		perm	  	- 权限数组['camera','location']
 * @param function  callback  	- 回调函数
 */
function confirmPer(perm, callback) {
    //权限类型有
    //calendar日历，camera相机，contacts通讯录，location位置信息，microphone麦克风
    //phone电话，sensor身体传感器，sms短信，storage存储空间，photos相册
    console.log(perm);

    //ios系统直接跳过
    if (api.systemType == 'ios') {
        // callback();
        // return false;
    }
    //判断多个权限是，使用 ,（英文逗号隔开）
    if (perm.indexOf(",") != -1) {
        var perms = perm.split(',');
    } else {
        var perms = new Array(perm);
    }

    //判断是否持有该数组中的权限
    var has = hasPermission(perms);
    console.log(JSON.stringify(has));
    if (!has.status) {
        //获取权限
        reqPermission(has.perms, callback);
        return false;
    }

    callback();
    return true;
}

//时间戳转换函数
function timeStampTurnTime(timeStamp) {
    if (timeStamp > 0) {
        var date = new Date();
        date.setTime(timeStamp);
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();
        var second = date.getSeconds();
        minute = minute < 10 ? ('0' + minute) : minute;
        second = second < 10 ? ('0' + second) : second;
        return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
    } else {
        return "";
    }
}

//SDK2.0方法
// 一、启动保活服务 
function startService() {
    var startNotice = api.require('noticemodule');
    startNotice.startKeepLiveService({
        keeptitle: '博宇网络货运司机端',   //通知栏标题
        keepinfo: '定位持续运行'    //通知栏内容
    }, function (ret) {
        // console.log(JSON.stringify(ret));
    });
}
// 二、初始化服务  initSDK()
// 4.初始化sdk 传参：appid appSecurity enterpriseSenderCode environment 1是IOS 2是安卓
function initSdk(type) {
    var typeParams;
    if (type == 1) {
        typeParams = {
            appId: 'com.cmal.eyunche.newdriver',    //ios包名
            appSecurity: 'e51d005b22ff42c0b0f743f7c67a6f7e7820474e84344c48af33bed4bc3c88401cfd7d2404744783ae69943be773bbf8ca9fb2e897ac4e9b966fa559e2e1d024',     //网络货运企业在省平台申请的接入安全码
            enterpriseSenderCode: '4200000012',   //网络货运企业在省平台申请的企业发送代码
            environment: 'debug' //release     //环境:“debug”接入测试环境，“release”接入正式环境。
        }
    } else {
        typeParams = {
            appId: 'com.s823803279.uqv',  //安卓包名
            appSecurity: 'b78d953cb70d42dd9aedea3f847e0a9bf46009c8261c4987b4594b67a821c8dbNONlp90ePpVyEuP8',  //网络货运企业在省平台申请的接入安全码
            enterpriseSenderCode: '12bWmWYiFcEPLdAqWIxa',   //网络货运企业在省平台申请的企业发送代码
            environment: 'debug' //release   //环境:“debug”接入测试环境，“release”接入正式环境。
        }
    }
    var startNotice = api.require('noticemodule');
    startNotice.initSdk(typeParams, function (ret) {
        // console.log('initSdk' + JSON.stringify(ret));
    });
}

// 三、开启定位   startLocation()
function startLocation(data) {
    var startNotice = api.require('noticemodule');
    startNotice.start({
        flag: data.waybillSerial, //必填项   运单号  这个单号只做标记用于多单循环使用
        vehicleNumber: data.truckNumber, //必填项  车牌号
        driverName: data.driverName, //必填项   司机姓名
        remark: "", //选填   备注
        shippingNoteInfos: [{   //运单列表
            shippingNoteNumber: data.waybillSerial, //必填项   运单号
            serialNumber: data.waybillSerial, //必填项   分单号
            startCountrySubdivisionCode: data.startCountrySubdivisionCode, //必填项   起点位置行政区划代码
            endCountrySubdivisionCode: data.endCountrySubdivisionCode, //必填项   到达位置行政区划代码
            startLongitude: data.startLongitude, //必填项      起点位置经度
            startLatitude: data.startLatitude, //必填项   起点位置纬度
            endLongitude: data.endLongitude, //必填项   到达位置经度
            endLatitude: data.endLatitude, //必填项  到达位置纬度
            startLocationText: data.startProvince + data.startCity + data.startDistrict + data.deliveryAddress, //必填项   起点地址文字描述
            endLocationText: data.endProvince + data.endCity + data.endDistrict + data.receiptAddress, // 必填项   到达地址文字描述
            vehicleNumber: data.truckNumber, // 必填项   车牌号
            driverName: data.driverName, // 必填项    司机姓名
            interval: '100000' //必填项     请求时间间隔
        }]
    }, function (ret) {
        console.log("开启定位:" + JSON.stringify(ret));
        sendInfos(data)
    });
}

// 四、发送定位   sendInfos()
function sendInfos(data) {
    // console.log("四、发送定位 :" + JSON.stringify(data));
    var startNotice = api.require('noticemodule');
    startNotice.send({
        flag: data.waybillSerial, //必填项   运单号  这个单号只做标记用于多单循环使用
        vehicleNumber: data.truckNumber, //必填项  车牌号
        driverName: data.driverName, //必填项   司机姓名
        remark: "", //选填   备注
        shippingNoteInfos: [{   //运单列表
            shippingNoteNumber: data.waybillSerial, //必填项   运单号
            serialNumber: data.waybillSerial, //必填项   分单号
            startCountrySubdivisionCode: data.startCountrySubdivisionCode, //必填项   起点位置行政区划代码
            endCountrySubdivisionCode: data.endCountrySubdivisionCode, //必填项   到达位置行政区划代码
            startLongitude: data.startLongitude, //必填项      起点位置经度
            startLatitude: data.startLatitude, //必填项   起点位置纬度
            endLongitude: data.endLongitude, //必填项   到达位置经度
            endLatitude: data.endLatitude, //必填项  到达位置纬度
            startLocationText: data.startProvince + data.startCity + data.startDistrict + data.deliveryAddress, //必填项   起点地址文字描述
            endLocationText: data.endProvince + data.endCity + data.endDistrict + data.receiptAddress, // 必填项   到达地址文字描述
            vehicleNumber: data.truckNumber, // 必填项   车牌号
            driverName: data.driverName, // 必填项    司机姓名
            interval: '100000' //必填项     请求时间间隔
        }]
    }, function (ret) {
        console.log(JSON.stringify(ret));
    });
}
// 五、暂停定位   pauseInfos()
function pauseInfos(data) {
    var startNotice = api.require('noticemodule');
    startNotice.pause({
        flag: data.waybillSerial, //必填项   运单号  这个单号只做标记用于多单循环使用
        vehicleNumber: data.truckNumber, //必填项  车牌号
        driverName: data.driverName, //必填项   司机姓名
        remark: "", //选填   备注
        shippingNoteInfos: [{   //运单列表
            shippingNoteNumber: data.waybillSerial, //必填项   运单号
            serialNumber: data.waybillSerial, //必填项   分单号
            startCountrySubdivisionCode: data.startCountrySubdivisionCode, //必填项   起点位置行政区划代码
            endCountrySubdivisionCode: data.endCountrySubdivisionCode, //必填项   到达位置行政区划代码
            startLongitude: data.startLongitude, //必填项      起点位置经度
            startLatitude: data.startLatitude, //必填项   起点位置纬度
            endLongitude: data.endLongitude, //必填项   到达位置经度
            endLatitude: data.endLatitude, //必填项  到达位置纬度
            startLocationText: data.startProvince + data.startCity + data.startDistrict + data.deliveryAddress, //必填项   起点地址文字描述
            endLocationText: data.endProvince + data.endCity + data.endDistrict + data.receiptAddress, // 必填项   到达地址文字描述
            vehicleNumber: data.truckNumber, // 必填项   车牌号
            driverName: data.driverName, // 必填项    司机姓名
            interval: '100000' //必填项     请求时间间隔
        }]
    }, function (ret) {
        console.log(JSON.stringify(ret));
    });
}
// 六、重启定位  restartInfos()
function restartInfos(data) {
    var startNotice = api.require('noticemodule');
    startNotice.restart({
        flag: data.waybillSerial, //必填项   运单号  这个单号只做标记用于多单循环使用
        vehicleNumber: data.truckNumber, //必填项  车牌号
        driverName: data.driverName, //必填项   司机姓名
        remark: "", //选填   备注
        shippingNoteInfos: [{   //运单列表
            shippingNoteNumber: data.waybillSerial, //必填项   运单号
            serialNumber: data.waybillSerial, //必填项   分单号
            startCountrySubdivisionCode: data.startCountrySubdivisionCode, //必填项   起点位置行政区划代码
            endCountrySubdivisionCode: data.endCountrySubdivisionCode, //必填项   到达位置行政区划代码
            startLongitude: data.startLongitude, //必填项      起点位置经度
            startLatitude: data.startLatitude, //必填项   起点位置纬度
            endLongitude: data.endLongitude, //必填项   到达位置经度
            endLatitude: data.endLatitude, //必填项  到达位置纬度
            startLocationText: data.startProvince + data.startCity + data.startDistrict + data.deliveryAddress, //必填项   起点地址文字描述
            endLocationText: data.endProvince + data.endCity + data.endDistrict + data.receiptAddress, // 必填项   到达地址文字描述
            vehicleNumber: data.truckNumber, // 必填项   车牌号
            driverName: data.driverName, // 必填项    司机姓名
            interval: '100000' //必填项     请求时间间隔
        }]
    }, function (ret) {
        console.log(JSON.stringify(ret));
    });
}
// 七、结束定位 stoploction()
function stoploction(data) {
    var startNotice = api.require('noticemodule');
    startNotice.stop({
        flag: data.waybillSerial, //必填项   运单号  这个单号只做标记用于多单循环使用
        vehicleNumber: data.truckNumber, //必填项  车牌号
        driverName: data.driverName, //必填项   司机姓名
        remark: "", //选填   备注
        shippingNoteInfos: [{   //运单列表
            shippingNoteNumber: data.waybillSerial, //必填项   运单号
            serialNumber: data.waybillSerial, //必填项   分单号
            startCountrySubdivisionCode: data.startCountrySubdivisionCode, //必填项   起点位置行政区划代码
            endCountrySubdivisionCode: data.endCountrySubdivisionCode, //必填项   到达位置行政区划代码
            startLongitude: data.deliveryLon, //必填项      起点位置经度
            startLatitude: data.deliveryLat, //必填项   起点位置纬度
            endLongitude: data.receiptLon, //必填项   到达位置经度
            endLatitude: data.receiptLat, //必填项  到达位置纬度
            startLocationText: data.startProvince + data.startCity + data.startDistrict + data.deliveryAddress, //必填项   起点地址文字描述
            endLocationText: data.endProvince + data.endCity + data.endDistrict + data.receiptAddress, // 必填项   到达地址文字描述
            vehicleNumber: data.truckNumber, // 必填项   车牌号
            driverName: data.driverName, // 必填项    司机姓名
            interval: '100000' //必填项     请求时间间隔
        }]
    }, function (ret) {
        console.log(JSON.stringify(ret));
        if (api.systemType == 'android') {
            stopService();
        }
    });
}

// 八、关闭后台上传服务  stopService()
// 9.关闭后台上传服务：
function stopService() {
    var startNotice = api.require('noticemodule');
    startNotice.stopAllService({
    }, function (ret) {
        console.log(JSON.stringify(ret));
    });
}

//格式化钱
function format(num) {
    return (num + '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 封装一个隐藏用户电话号码的函数 
function geTel(tel) {
    var reg = /^(\d{3})\d{4}(\d{4})$/;
    return tel.replace(reg, "$1****$2");
}

//货车导航功能
function navigatFn(start, wayPoint, end) {
    //高德导航功能
    var obj = api.require('aMapNavi');
    obj.startNavi({
        start: start,
        // wayPoint: [{
        //     ...wayPoint
        // }],
        end: end,
        styles: {
            preference: {       //（可选项）JSON对象；偏好设置
                night: false,   //（可选项）布尔类型；是否显示黑夜模式；默认：false
                compass: false, //（可选项）布尔类型；是否显示指南针；默认：false
                crossImg: true,//（可选项）布尔类型；是否显示路口放大图，只适用于驾车导航；默认：false
                degree: 30,     //（可选项）数字类型；地图倾角大小，范围[0,60]，大于40会显示蓝天；默认：30
                yawReCal: false,//（可选项）数字类型；偏航时是否重新计算路径；默认：true；android不支持。已废弃，默认重算
                alwaysBright: true, //（可选项）数字类型；导航状态下屏幕是否一直开启；默认：false
                allowsBackgroundLocationUpdates: true //（可选项）布尔类型；是否允许后台定位，暂仅支持 iOS 平台且只在iOS 9.0及之后起作用；默认：false，为 true 时必须保证 conifg.xml 文件内把后台定位和后台音频播放打开，否则会异常，具体操作见 config.xml 文件配置文档	    }
            },
        },
        carInfo: {
            carType: 1,
            carNumber: '京DFZ239',
            vehicleSize: 4,
            vehicleWidth: 2.1,
            vehicleHeight: 4,
            vehicleLength: 25,
            vehicleWeight: 99,
            vehicleLoad: 100,
            vehicleAxis: 6,
            vehicleLoadSwitch: false,
            restriction: true
        },
    });
}

//请求定位权限
function resultlocation() {
    var permission = 'location';
    var resultList = api.hasPermission({
        list: [permission]
    });
    if (resultList[0].granted) {

    } else {
        api.confirm({
            msg: '应用需要您的授权才能获取定位',
            buttons: ['取消', '去设置']
        }, function (ret) {
            if (ret.buttonIndex == 2) {
                api.requestPermission({
                    list: [permission],
                }, function (res) {
                    if (res.list[0].granted) {
                    } else {
                        api.alert({
                            msg: '定位获取失败，请前往系统设置—>应用设置中,找到博宇亨通司机版app,设置定位权限为[始终允许]'
                        });
                    }
                });
            }
        });
    }
}
function locationStatueFn() {
    var permission = 'location';
    var resultList = api.hasPermission({
        list: [permission]
    });
    // console.log("判定定位resultList：" + JSON.stringify(resultList));
    if (resultList[0].granted) {
        return true;
    } else {
        return false;
    }
}

function tswaybilllocatorFn(dataInfo) {
    // console.log("定位数据" + JSON.stringify(dataInfo));
    dealData("platform/tswaybilllocator/add", 'POST', JSON.stringify(dataInfo), function (res) {
        if (res) {
            // console.log("定位数据推送成功：" + JSON.stringify(res));
        } else {
            api.toast({
                msg: '定位数据推送失败，请检查网络',
                duration: 5000,
                location: 'middle'
            });
        }
    },
        function (err) {
            console.log("定位数据推送失败原因：" + JSON.stringify(err));
            api.toast({
                msg: '定位数据解析失败，未获取到有效位置',
                duration: 5000,
                location: 'middle'
            });
        }
    )
}
function cutAddress(data = '') {
    // 用正则表达式分割详情地址
    var regex = "(?<province>[^省]+省|[^自治区]+自治区|.+市)(?<city>[^自治州]+自治州|.+区划|[^市]+市|.+区)?(?<county>[^市]+市|[^县]+县|[^旗]+旗|.+区)?(?<town>[^区]+区|.+镇)?(?<village>.*)";
    var address = data;
    var result = address.match(regex);
    console.log('result', result);
    return result
}

(function (window) {
    var obj = {};

    //时间戳转换函数
    obj.timeStampTurnTime = function (timeStamp) {
        if (timeStamp > 0) {
            var date = new Date();
            date.setTime(timeStamp);
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            m = m < 10 ? ('0' + m) : m;
            var d = date.getDate();
            d = d < 10 ? ('0' + d) : d;
            var h = date.getHours();
            h = h < 10 ? ('0' + h) : h;
            var minute = date.getMinutes();
            var second = date.getSeconds();
            minute = minute < 10 ? ('0' + minute) : minute;
            second = second < 10 ? ('0' + second) : second;
            return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
        } else {
            return "";
        }
    }
    window.$app = obj;
})(window)

