//index.js
const app = getApp()

Page({
  data: {
    //轮播图配置
    autoplay: true,
    interval: 3000,
    duration: 1000,
    dataList: [],
    paystatus: "",
    loadingTime: "",
    paysuccess: "",
    password: "",
    commodityNumber: "",
    token: "",
    countsix: "",
    timeout: "",
    count: "",
    sixTime: "",
    setblueState: "",
    timer: "",
    timeconnect: ""
  },
  onLoad: function (options) {
    var that = this;
    var data = {
      "datas": [{
        "id": 1,
        "imgurl": "/utils/img/kouz.jpg"
      },
      {
        "id": 2,
        "imgurl": "/utils/img/kouzao.jpg"
      }

      ]
    };
    that.setData({
      lunboData: data.datas
    })

    that.getToken();
    that.checkPhoneInfo();

  },
  getToken() {
    var that = this
    var numbering = app.globalData.numbering;
    wx.request({
      url: 'https://pay.mjktech.com.cn/wx/getEquipmentInfoLogin',
      data: {
        numbering: numbering
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      }, // 设置请求的 header
      success: (res) => {
        that.setData({
          dataList: [res.data.data.commodity],
          numbering: res.data.data.numbering
        })
        that.token = res.data.data.token
        that.commodityNumber = res.data.data.commodityNumber
      }
    })
  },

  blueTooth() {
    var that = this;
    console.log(app.globalData.connect)
    // if (app.globalData.connect == 'false' && app.globalData.isconnected) {
    app.startConnect();
    app.getService();
    // }
    //如果库存小于0提示
    if (that.commodityNumber < 0) {
      wx.showToast({
        title: '库存不足',
      })
      // 如果蓝牙没准备好提示
    } else if (app.globalData.backData == "6e6f7265616479") {
      wx.showToast({
        title: '蓝牙异常',
      })
    }
    //如果蓝牙连接成功并且设备状态ok才能进入支付
    console.log('openstatus',app.globalData.openstatus)
    if (that.commodityNumber > 0  && app.globalData.connect == 'true' && app.globalData.isconnected && app.globalData.backData != "6e6f7265616479") {
      console.log("蓝牙连接成功", app.globalData.isconnected)
      app.startWrite(app.globalData.writeId)
      var openId = app.globalData.openid
      var numbering = app.globalData.numbering
      wx.request({
        url: 'https://pay.mjktech.com.cn/wx/createWxOrder',
        data: {
          openId: openId,
          numbering: numbering
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': that.token
        }, // 设置请求的 header
        success: (res) => {
          console.log('createWxOrder', res)
          var payargs = res.data.data.wxPayMpOrderResult
          var orderNumber = res.data.data.orderNumber
          console.log(payargs)
          console.log("订单号" + orderNumber)
          app.globalData.flag = false
          console.log('获取到flag', app.globalData.flag)
 
            that.loadingTime = setInterval(function () {
              //循环执行代码  
              //调取订单支付状态吐货
              wx.request({
                url: 'https://pay.mjktech.com.cn/wx/getOrderStatus',
                data: {
                  orderNumber: orderNumber
                },
                method: 'GET',
                header: {
                  'content-type': 'application/json',
                  'Authorization': that.token
                },
                success: (res) => {
                  that.paystatus = res.data.data
                  console.log('获取到支付状态', res.data.data)
                  if (that.paystatus == 1) {
                    clearInterval(that.loadingTime)
                    that.outThing()
                  }
                },
                fail(err) {
                  console.log('未获取到支付状态', err)
                }
              })
            }, 1000)
            wx.requestPayment({
              timeStamp: payargs.timeStamp,
              nonceStr: payargs.nonceStr,
              package: payargs.packageValue,
              signType: payargs.signType,
              paySign: payargs.paySign,
              success(res) {
                app.globalData.flag = true
                console.log('支付成功' + JSON.stringify(res))
                that.paysuccess = res
                that.outThing()
                clearInterval(that.loadingTime)
              },
              fail(err) {
                app.globalData.flag = true
                console.log('支付失败', err)
                clearInterval(that.loadingTime)
              },
              complete(res) {
                that.setData({
                  lock: false
                })
              }
            })

        }
      })


    } else {
      console.log('支付失败')
      wx.showToast({
        title: '请连接蓝牙',
      })
    }

  },
  outThing() {
    var that = this
    console.log('支付状态', that.paystatus)
    //如果已支付并且设备已准备好，发送密码，密码正确，吐货         
    if (that.paystatus == 1 || that.paysuccess && app.globalData.backData != '6e6f7265616479') {
      // 蓝牙返回数据，进行计算
      console.log('第一次返回成功', app.globalData.backData)
      if (app.globalData.backData.length == 4) {
        var string1 = app.globalData.backData.slice(0, 2)
        var string2 = app.globalData.backData.slice(2, 4)

        var a1 = parseInt(string1, 16);
        var a2 = parseInt(string2, 16);
        console.log('成功le', a1, a2)

        var A1 = a1 + a2 + 0x55 + (a1 & 0xf0) + (a2 & 0x0f);
        var A2 = (a1 ^ a2 ^ 0xcc) + (A1 + 0x7e);
        console.log(a1, a2, A1, A2)
        that.password = A1 + A2
        console.log('密码', that.password)
        var password = that.password.toString()
        var initword = password
        let buffer = new ArrayBuffer(initword.length)
        let dataView = new DataView(buffer)
        for (var i = 0; i < initword.length; i++) {
          dataView.setUint8(i, initword.charAt(i).charCodeAt())
        }
        wx.writeBLECharacteristicValue({
          deviceId: app.globalData.deviceId,
          serviceId: app.globalData.servicesUUID,
          characteristicId: app.globalData.writeId,
          value: buffer,
          success(res) {
            console.log('writeBLECharacteristicValue success', res.errMsg)
          }
        })
      }
    }
  },
  onShow() {
    var that = this
    console.log('onShow')
    app.globalData.flag = true;
  },
  // onHide() {
  //   var that = this
  //   clearInterval(that.loadingTime)
  // },
  // 为了对手机微信版本和系统版本做比较，封装有一个版本比较的方法
  versionCompare: function (ver1, ver2) { //版本比较
    var version1pre = parseFloat(ver1)
    var version2pre = parseFloat(ver2)
    var version1next = parseInt(ver1.replace(version1pre + ".", ""))
    var version2next = parseInt(ver2.replace(version2pre + ".", ""))
    if (version1pre > version2pre)
      return true
    else if (version1pre < version2pre)
      return false
    else {
      if (version1next > version2next)
        return true
      else
        return false
    }
  },

  //判断系统版本、微信版本、定位服务等权限和信息
  checkPhoneInfo(obj) {
    //Android 从微信 6.5.7 开始支持，iOS 从微信 6.5.6 开始支持
    //第一项，如果手机是android系统，需要判断版本信息
    var that = this
    if (app.getPlatform() == "android" && that.versionCompare("6.5.7", app.getVersion())) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请更新至最新版本',
        showCancel: false
      });
      obj.setData({
        btnDisabled: false,
      });
      //执行quit机制
      quit(obj);

      return;
    }
    //第二项，如果手机是ios系统，需要判断版本信息
    if (app.getPlatform() == "ios" && that.versionCompare("6.5.6", app.getVersion())) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请更新至最新版本',
        showCancel: false
      });
      obj.setData({
        btnDisabled: false,
      });
      //执行quit机制
      quit(obj);

      return;
    }
    //版本  以及  平台校验完毕后   需要判断蓝牙的相关信息
    //微信小程序 android6.0手机需要开启位置服务，否则扫描不到设备
    console.log("当前系统版本：" + app.getSystem());//Android 8.1.0
    console.log("当前微信版本：" + app.getVersion());
    if (app.getPlatform() == "android") {
      console.log("android手机  当前系统版本号：" + app.getSystem().replace("Android", "").replace(" ", ""));
      //android版本高于6.0.0
      if (!that.versionCompare("6.0.0", app.getSystem().replace("Android", "").replace(" ", ""))) {
        console.log("当前系统版本高于6.0.0");
        //位置服务权限
        wx.showToast({
          title: '请打开位置信息',
        })
      } else if (!that.versionCompare(app.getSystem().replace("Android", "").replace(" ", "")), "4.3.0") {
        //系统版本低于4.3的,使用不了ble蓝牙
        wx.showModal({
          title: '温馨提示',
          content: '您的手机系统版本较低，无法操作BLE蓝牙设备',
          showCancel: false,
        });
        obj.setData({
          btnDisabled: false,
        });
        //执行quit机制
        quit(obj);

      } else {
        console.log("系统版本低于6.0.0但高于4.3.0");
        //除去android系统的手机(由于最开始过滤了能支持蓝牙的最低微信版本   所以此处无需再判断)
        app.startConnect(obj);
      }
    }
    //除android以外的ios或者其他系统
    app.startConnect(obj);
  }

  // scanCode() {
  //   var that = this;
  //   wx.scanCode({
  //     onlyFromCamera: false,
  //     scanType: ['qrCode'],
  //     success(res) {
  //       console.log('扫码结果', res)
  //       var result =  res.path
  //       wx.reLaunch({
  //         url: '../index/index?id='+result,
  //       })
  //       // that.setData({
  //       //   scanResult: res.result
  //       // })
  //     }
  //   })
  // },


})