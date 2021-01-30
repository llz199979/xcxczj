
App({
  globalData: {
    token: '',
    openid: '',
    numbering: '',
    sessionKey: '',
    avatarUrl: '',
    nickName: '',
    flag: true,
    connect: "false",
    isconnected:"",
    openstatus: "false",
    servicesUUID: "",
    writeId: "",
    characteristicId: "",
    deviceId: "",
    backData: "",
    connectDeviceIndex: "",
    getConnectedTimer: "",
    countsix: "",
    timeout: "",
    count: "",
    sixTime: "",
    sysinfo: ""
  },
  onLaunch: function (options) {
    var that = this;
    let getQueryString = function (url, name) {
      var reg = new RegExp('(^|&|/?)' + name + '=([^&|/?]*)(&|/?|$)', 'i')
      var r = url.substr(1).match(reg)
      if (r != null) {
        return r[2]
      }
      return null;
    }
    if (options.query.q !== undefined) {
      var query = decodeURIComponent(options.query.q);
      var number = getQueryString(query, 'numbering');
      that.globalData.numbering = number
    }
    that.startConnect();
    that.getService();
    wx.login({
      success: res => {
        if (res.code) {
          let code = res.code;
          //2. 访问登录凭证校验接口获取session_key、openid
          //pay.mjktech.com.cn
          var host = "https://pay.mjktech.com.cn";
          wx.request({
            url: host + "/wx/user/wx55952aaa3636e8a4/login?code=code",
            data: {
              appid: "wx55952aaa3636e8a4",
              secret: "c7c0df0e90ef0a58b08abe9b2661020e",
              code: res.code,
              grant_type: "authorization_code"
            },
            method: 'GET',
            header: {
              'content-type': 'application/json'
            }, // 设置请求的 header
            success: (res) => {
              that.globalData.openid = res.data.openid
              console.log(that.globalData.openid)
              that.globalData.sessionKey = res.data.sessionKey
              wx.getSetting({
                success: res => {
                  if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                      success: res => {
                        console.log(res)
                        that.globalData.avatarUrl = res.userInfo.avatarUrl
                        that.globalData.nickName = res.userInfo.nickName
                        var signature = res.signature
                        var rawData = res.rawData
                        var encryptedData = res.encryptedData
                        var iv = res.iv
                        var sessionKey = that.globalData.sessionKey
                        wx.request({
                          url: 'https://pay.mjktech.com.cn/wx/user/wx55952aaa3636e8a4/info',
                          data: {
                            sessionKey: sessionKey,
                            signature: signature,
                            rawData: rawData,
                            encryptedData: encryptedData,
                            iv: iv
                          },
                          method: 'GET',
                          header: {
                            'content-type': 'application/json',
                          },
                          success(res) {
                            console.log(res)
                          }
                        })
                      }
                    })
                  }
                }
              })
            },
            fail: function (err) {

            }
          })
        }
      }
    })
    var numbering = that.globalData.numbering;
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
        that.globalData.token = res.data.data.token;
      }
    })


    wx.onAppShow(() => {
      that.globalData.flag = true
      console.log('onAppShow', that.globalData.flag)
    })

    wx.onAppHide(() => {
      var that = this
      console.log('onAppHide', that.globalData.flag)
      if (that.globalData.flag == true) {
        wx.closeBluetoothAdapter({
          success(res) {
            console.log('断开蓝牙连接', res)
          }
        })
      }
    })
    //获取手机当前微信版本和手机系统版本
    that.globalData.sysinfo = wx.getSystemInfoSync()

  },

  // 初始化蓝牙，检查有无开启蓝牙
  startConnect: function () {
    var that = this;
    // wx.showLoading({
    //   title: '开启蓝牙适配'
    // });
    wx.openBluetoothAdapter({
      success: function (res) {
        that.globalData.openstatus = 'true'
        that.getBluetoothAdapterState();
      },
      fail: function (err) {
        console.log(err);
        that.globalData.openstatus = 'false'
        wx.showToast({
          title: '请打开蓝牙',
          icon: 'success',
          duration: 2000
        })
        // setTimeout(function () {
        //   wx.hideToast()
        // }, 2000)
      }
    });
    wx.onBluetoothAdapterStateChange(function (res) {
      var available = res.available;
      if (available) {
        that.getBluetoothAdapterState();
      }
    })
  },
  // 获取本机蓝牙适配器状态
  getBluetoothAdapterState: function () {
    var that = this;
    wx.getBluetoothAdapterState({
      success: function (res) {
        var available = res.available,
          discovering = res.discovering;
        if (!available) {
          wx.showToast({
            title: '设备无法开启蓝牙连接',
            icon: 'success',
            duration: 2000
          })
          // setTimeout(function () {
          //   wx.hideToast()
          // }, 2000)
        } else {
          if (!discovering) {
            that.startBluetoothDevicesDiscovery();
            that.getConnectedBluetoothDevices();
          }
        }
      }
    })
  },
  // 开始搜索附近的蓝牙设备
  startBluetoothDevicesDiscovery: function () {
    var that = this;
    // wx.showLoading({
    //   title: '蓝牙搜索'
    // });
    wx.startBluetoothDevicesDiscovery({
      services: [],
      allowDuplicatesKey: false,
      success: function (res) {
        if (!res.isDiscovering) {
          that.getBluetoothAdapterState();
        } else {
          that.onBluetoothDeviceFound();
        }
      },
      fail: function (err) {
        console.log(err);
      }
    });
  },
  getConnectedBluetoothDevices: function () {
    var that = this;
    // 根据 uuid 获取处于已连接状态的设备。
    wx.getConnectedBluetoothDevices({
      services: [that.globalData.serviceId],
      success: function (res) {
        console.log("获取处于连接状态的设备", res);
        var devices = res['devices'],
          flag = false,
          index = 0,
          conDevList = [];
        devices.forEach(function (value, index, array) {
          if (value['name'].indexOf('CDKJ') != -1) {
            // 如果存在包含CDKJ字段的设备
            flag = true;
            index += 1;
            conDevList.push(value['deviceId']);
            that.globalData.deviceId = value['deviceId'];
            return;
          }
        });
        if (flag) {
          that.globalData.connectDeviceIndex = 0;
          that.loopConnect(conDevList);
        } else {
          if (!that.globalData.getConnectedTimer) {
            that.getConnectedBluetoothDevices();
            that.globalData.getConnectedTimer = setTimeout(function () {
              that.getConnectedBluetoothDevices();
            }, 5000);
          }
        }
      },
      fail: function (err) {
        if (!that.globalData.getConnectedTimer) {
          that.getConnectedBluetoothDevices();
          that.globalData.getConnectedTimer = setTimeout(function () {
            that.getConnectedBluetoothDevices();
          }, 5000);
        }
      }
    });
  },
  // 监听发现附近的蓝牙设备
  onBluetoothDeviceFound: function () {
    var that = this;
    wx.onBluetoothDeviceFound(function (res) {
      console.log('搜索到附近的蓝牙设备', res);
      if (res.devices[0]) {
        var name = res.devices[0]['name'];
        if (name != '') {
          if (name.indexOf('CDKJ') != -1) {
            var deviceId = res.devices[0]['deviceId'];
            that.globalData.deviceId = deviceId;
            console.log(that.globalData.deviceId);
            that.startConnectDevices();
          }
        }
      }
    })
  },
  // 连接蓝牙
  startConnectDevices: function (ltype, array) {
    var that = this;
    clearTimeout(that.globalData.getConnectedTimer);
    that.globalData.getConnectedTimer = null;
    // clearTimeout(that.discoveryDevicesTimer);
    // this.isConnectting = true;
    wx.createBLEConnection({
      deviceId: that.globalData.deviceId,
      success: function (res) {
        console.log(res)
        that.globalData.isconnected = res
        console.log('连接', that.globalData.isconnected)
        wx.showToast({
          title: '连接成功',
          icon: 'success'
        })
        wx.stopBluetoothDevicesDiscovery({
          success(res) {
            console.log('停止搜索', res)
          }
        })
        if (res.errCode == 0) {
          that.getService(that.globalData.deviceId);
          setTimeout(function () {
            that.getService(that.globalData.deviceId);
          }, 5000)
        }
        
        that.getService()
      },
      fail: function (err) {
        that.globalData.connect = 'false';
        console.log('连接失败：', err);
        if (ltype == 'loop') {
          that.globalData.connectDeviceIndex += 1;
          that.loopConnect(array);
        } else {
          that.startBluetoothDevicesDiscovery();
          that.getConnectedBluetoothDevices();
        }
      },
      complete: function () {
        console.log('complete connect devices');
      }
    });
  },
  getService: function (deviceId) {
    var that = this;
    // 监听蓝牙连接
    wx.onBLEConnectionStateChange(function (res) {
      // that.globalData.blueState = JSON.stringify(res.connected)
      that.globalData.connect = JSON.stringify(res.connected);
      console.log( '监听蓝牙连接',that.globalData.connect)
    });
    // 获取蓝牙设备service值
    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: function (res) {
        var model = res.services[1]
        console.log('蓝牙设备service值', res, model)
        // that.setData({
        //   servicesUUID: model.uuid
        // })
        that.globalData.servicesUUID = model.uuid
        console.log('获取到uuid', that.globalData.servicesUUID)
        that.getCharacteId();
      }
    })
  },
  getCharacteId() {
    var that = this
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: that.globalData.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.globalData.servicesUUID,
      success: function (res) {
        console.log('获取到deviceid', that.globalData.deviceId)
        console.log('获取到特征值', res);
        for (var i = 0; i < res.characteristics.length; i++) {//2个值
          var model = res.characteristics[i]
          console.log('uuid', model)
          // that.startNotice()
          //indicate为true的时候才能 接收蓝牙设备传来的数据
          if (model.properties.indicate == true) {
            // that.setData({
            //   characteristicId: model.uuid//监听的值
            // })
            that.globalData.characteristicId = model.uuid
            console.log('indecate', that.globalData.characteristicId)
            that.startNotice(that.globalData.characteristicId)//7.0
          }
          // write 为true 才能传入数据
          if (model.properties.write == true) {
            that.globalData.writeId = model.uuid
            console.log('传入数据', that.globalData.writeId)
            that.startWrite(that.globalData.writeId)
          }
        }
      }
    })
  },
  startWrite(id) {
    var that = this;
    // 向蓝牙设备发送一个0x00的16进制数据
    var initData = 'ready'
    let buffer = new ArrayBuffer(initData.length)
    let dataView = new DataView(buffer)
    for (var i = 0; i < initData.length; i++) {
      dataView.setUint8(i, initData.charAt(i).charCodeAt())
    }
    console.log('deviceId',that.globalData.deviceId)
    console.log('servicesUUID',that.globalData.servicesUUID)
    console.log('characteristicId',that.globalData.writeId)
    wx.writeBLECharacteristicValue({
      // 这里的 deviceId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: that.globalData.deviceId,
      // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
      serviceId: that.globalData.servicesUUID,
      // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
      characteristicId: id,
      // 这里的value是ArrayBuffer类型
      value: buffer,
      success(res) {
        console.log('writeBLECharacteristicValue success', res.errMsg)
      }
    })
  },
  startNotice(uuid) {
    var that = this;
    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能
      deviceId: that.globalData.deviceId,
      serviceId: that.globalData.servicesUUID,
      characteristicId: uuid,  //第一步 开启监听 notityid  第二步发送指令 write
      success: function (res) {
        // 设备返回的方法
        console.log('开启成功', res, uuid)
        // 监听低功耗蓝牙设备的特征值变化事件。必须先启用 notifyBLECharacteristicValueChange 接口才能接收到设备推送的 notification。
        wx.onBLECharacteristicValueChange(function (res) {
          var nonceId = that.ab2hex(res.value)
          that.globalData.backData = nonceId;
          // 如果设备吐货成功
          console.log('返回', that.globalData.backData)
          if (that.globalData.backData == "73756363657373") {
            console.log('吐货成功')
            // that.clearSixTime()
          } else if (that.globalData.backData == "6661696c") {
            console.log('吐货失败')
            wx.request({
              url: 'https://pay.mjktech.com.cn/wx/shipmentFailed',
              data: {
                openid: that.globalData.openid,
                orderNumber: orderNumber
              },
              method: 'GET',
              header: {
                'content-type': 'application/json',
                'Authorization': that.token
              },
              success(res) {
                console.log('提交吐货失败通知成功', res)
              }
            })
          }

        })
      },
      fail: function (res) {
        console.log('数据返回失败', res);
      }
    })
  },

  /**
      * 将ArrayBuffer转换成字符串 
      */
  ab2hex(buffer) {
    var hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function (bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
    )
    return hexArr.join('');
  },
  loopConnect: function (devicesId) {
    var that = this;
    // var listLen = devicesId.length;
    if (devicesId[that.globalData.connectDeviceIndex]) {
      that.globalData.deviceId = devicesId[that.globalData.connectDeviceIndex];
      that.startConnectDevices('loop', devicesId);
    } else {
      console.log('已配对的设备小程序蓝牙连接失败');
      that.startBluetoothDevicesDiscovery();
      that.getConnectedBluetoothDevices();
    }
  },
  // closeBlue() {
  //   var that = this
  //   wx.closeBluetoothAdapter({
  //     success(res) {
  //       console.log('断开蓝牙连接', res)
  //       wx.showToast({
  //         title: '蓝牙已断开',
  //       })
  //     }
  //   })
  // },
 
  onHide: function () {
    var that = this
    console.log('onHide', that.globalData.flag)
    if (that.globalData.flag == true) {
      wx.closeBluetoothAdapter({
        success(res) {
          console.log('断开蓝牙连接', res)
        }
      })
    }
  },

  getModel: function () { //获取手机型号
    return this.globalData.sysinfo["model"]
  },
  getVersion: function () { //获取微信版本号
    return this.globalData.sysinfo["version"]
  },
  getSystem: function () { //获取操作系统版本
    return this.globalData.sysinfo["system"]
  },
  getPlatform: function () { //获取客户端平台
    return this.globalData.sysinfo["platform"]
  },
  getSDKVersion: function () { //获取客户端基础库版本
    return this.globalData.sysinfo["SDKVersion"]
  },




})