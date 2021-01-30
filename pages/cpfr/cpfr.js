// pages/feedback/feedback.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    timer:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  formSubmit(e) {
    var that = this
    var value = e.detail.value;
    var acount = value.acount
    var password = value.password
    console.log(acount, password)

    wx.request({
      url: 'https://pay.mjktech.com.cn/login',
      data: {
        username: acount,
        password: password
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        console.log(res.data.code)
        if (res.data.code != 1) {
          wx.showToast({
            title: '账号或密码错误',
            duration: 2000,
          })
        }
        var restoke = res.data.data.token
        console.log(restoke)
        wx.request({
          url: 'https://pay.mjktech.com.cn/getUserRole',
          method: 'GET',
          header: {
            'content-type': 'application/json',
            'Authorization': restoke
          },
          success(res) {
            console.log(res.data.data[22].permission)
            if (res.data.data[22].permission == "device:supplement") {
              wx.showToast({
                title: '登录成功',
                duration: 2000,
              })
              that.opendoor();
              that.timer = setTimeout(function(){
                if(app.globalData.backData == '556e6c6f636b696e672073756363657373'){
                  wx.showToast({
                    title: '开锁成功',
                    duration:1000
                  })
                  wx.redirectTo({
                    url: '../quantity/quantity',
                  })
                  clearTimeout(that.timer)
                }else{
                  wx.showToast({
                    title: '开锁失败',
                    duration:1000
                  })
                }     
              },2000)
                     
            } else {
              wx.showToast({
                title: '该账号没有权限',
                duration: 2000,
              })
            }
          }
        })

      },
      fail: function (res) {
        console.log('数据返回失败', res);
      }

    })
  },
  opendoor(){
      // 开锁  Unlocking
      var initword = 'Unlocking'
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
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})