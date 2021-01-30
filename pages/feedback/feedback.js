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
  formSubmit(e){
   var value=e.detail.value;
   var contents = value.contentName
   var numbering = value.numbering
   var titles = value.titleName
   var token = app.globalData.token
   wx.request({
     url: 'https://pay.mjktech.com.cn/wx/insertFeedback',
     data: {
      contentName:contents,
       numbering:numbering,
       titleName:titles
    },
    method: 'POST', 
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': token
    }, 
    success(res){
      console.log(res)
      wx.showToast({
        title: '反馈成功',
        duration: 2000,
      })
      wx.switchTab({
        url: '../mine/mine',
      })
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