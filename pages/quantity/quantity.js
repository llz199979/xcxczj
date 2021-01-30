// pages/feedback/feedback.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  formSubmit(e) {
    var that = this
    var value = e.detail.value;
    var numbering = value.numbering
    var number = value.number
    var operator = value.operator
    var remarks = value.remarks
    var token = app.globalData.token
    wx.request({
      url: 'https://pay.mjktech.com.cn/wx/updateCommodityNumber',
      data: {
        numbering: numbering,
        number: number,
        operator: operator,
        remarks: remarks,
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': token
      },
      success(res) {     
         console.log("提交成功",res)
         wx.showToast({
           title: '上货成功',
         })
        wx.switchTab({
          url: '../mine/mine',
        })
      },
      fail: function (res) {
        console.log('数据返回失败', res);
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