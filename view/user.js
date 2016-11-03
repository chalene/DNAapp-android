'use strict';
import React, { Component } from 'react';

import { 
  AsyncStorage,
  Alert,
  //AlertIOS,
  //NavigatorIOS,
  Navigator,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ListView,
  WebView,
  ScrollView,
  StatusBarIOS,
  Text,
  Image,
  Clipboard,
  ToastAndroid,
  View,
  findNodeHandle
} from 'react-native';


import Util from './utils';
import Icon from 'react-native-vector-icons/FontAwesome';
//import ActivityView from 'react-native-activity-view';
import ImagePickerManager from 'react-native-image-picker';
//import VibrancyView  from 'react-native-blur';
import Form from 'react-native-form';
import Share, {ShareSheet, Button} from 'react-native-share';

// Configuration file
import { url } from '../config';

/**
 * - User
 *  - UserView
 *    - UserInfo
 *      - UserChangePhoneNum
 *    - UserLink
 *    - UserHelp
 *    - UserSetting
 *    - UserAbout
 *    - UserPurse
 */

export class UserInfo extends Component{
  static propTypes = {
    data: React.PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {
      idFrontSource: {uri:'idfront'},
      idFrontSourceData: "",
      idBackSource: {uri:'idback'},
      idBackSourceData:""
    };
  }

  _saveChanges() {
    // return true
    // SSH post: this.refs.form.getValues()
    const info = this.refs.form.getValues();
    let valid = true;
    for (var key in info) {
      if (info[key]==="") {
        valid = false;
      }
    }
    if (!this.state.idFrontSourceData || !this.state.idBackSourceData) {
      valid = false;
    }

    if (valid) {
      this.props.showSpiner(true);
      Util.post(`${url}/register/`,{
         ...info,
         phone: this.props.phone,
         // images are sent as jpeg base64
         id_card_1: this.state.idFrontSourceData,
         id_card_2: this.state.idBackSourceData,
      }, (resData) => {
          this.props.showSpiner(false);

          if (resData.title !== "true") {
            if (resData.title === "提交失败") {
              Alert.alert(resData.title, resData.message);
              return false
            } else if (resData.title === "提交成功") {
              Alert.alert(resData.title, resData.message);
              this.props.navigator.pop();
              return true
            }
          } else {
            Alert.alert('服务器无响应', '请稍后再试');
            return false
          }
      })
    }else{
      Alert.alert('提交失败', '所有资料均为必填');
    }
  }

  _uploadId() {
    const options = {
      title: '选择身份证正面照', 
      cancelButtonTitle: '取消',
      takePhotoButtonTitle: '拍照', 
      chooseFromLibraryButtonTitle: '从手机相册选取', 
      cameraType: 'back', 
      mediaType: 'photo', 
      allowsEditing: false,
      noData: false, 
      quality:0.2,
      maxWidth:322,
      storageOptions: { 
        skipBackup: true, 
        path: 'images'
      }
    };
    console.log(">>>>>>>>>>>ImagePickerManager");
    console.log(ImagePickerManager.showImagePicker);

    ImagePickerManager.showImagePicker(options, (response) => {
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePickerManager Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        const source = {uri: response.uri.replace('file://', ''), isStatic: true};
        const sourceData = 'data:image/jpeg;base64,' + response.data;
        this.setState({
          idFrontSource: source,
          idFrontSourceData: sourceData
        });
        console.log(this.state.idFrontSource)
      }
    });
  }

  _uploadIdBack() {
    const options = {
      title: '选择身份证背面照', 
      cancelButtonTitle: '取消',
      takePhotoButtonTitle: '拍照', 
      chooseFromLibraryButtonTitle: '从手机相册选取', 
      cameraType: 'back', 
      mediaType: 'photo', 
      allowsEditing: false, 
      noData: false, 
      quality:0.8,
      maxWidth:322,
      storageOptions: { 
        skipBackup: true, 
        path: 'images' 
      }
    };
    ImagePickerManager.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePickerManager Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        const source = {uri: response.uri.replace('file://', ''), isStatic: true};
        const sourceData = 'data:image/jpeg;base64,' + response.data;
        this.setState({
          idBackSource: source,
          idBackSourceData: sourceData
        });
      }
    });
  }

  // _inputFocused(refName) {
  //   setTimeout(() => {
  //     let scrollResponder = this.refs.scrollView.getScrollResponder();
  //     scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
  //       findNodeHandle(this.refs[refName]),
  //       130, //additionalOffset
  //       true
  //     );
  //   }, 50);
  // }

  // _refFocus (nextField) {
  //   this.refs[nextField].focus();
  // }


  render() {
    const data = this.props.data;
    let oldPass = null;
    let idInput = null;
    let idUpload = null;

    if (!data.isNew) {
      oldPass = <View style={styles.orderInputContainer}>
          <Text style={styles.orderInputText}>旧密码：</Text>
          <TextInput type="TextInput"  password={true} name="oldPassword" style={styles.orderInput}/>
        </View>
    }else{
      oldPass = <View></View>
    }

    if (true) {
      idInput = <View style={styles.orderInputContainer}>
          <Text style={styles.orderInputText}>身份证号码</Text>
          <TextInput type="TextInput" name="id_number" style={styles.orderInput} ref="id" returnKeyType = {"next"} placeholder="请输入18位身份证号码" />
        </View>
      idUpload = <View style={[styles.orderButtonContainer,{paddingBottom:30}]}>
          <TouchableHighlight underlayColor="#eee" style={[styles.btn_if,{backgroundColor:'#ddd'}]} onPress={() => this._uploadId(this)}>
            <Text style={{color:'#555'}}>上传身份证正面照</Text>
          </TouchableHighlight>
          <TouchableHighlight underlayColor="#eee" style={[styles.btn_if,{backgroundColor:'#ddd'}]} onPress={() => this._uploadIdBack()}>
            <Text style={{color:'#555'}}>上传身份证背面照</Text>
          </TouchableHighlight>
          <View style={{flex:1,flexDirection:"row"}}>
            <Image source={this.state.idFrontSource} style={[styles.uploadId,{marginRight:30}]} />
            <Image source={this.state.idBackSource} style={styles.uploadId} />
          </View>
        </View>
    }else{
      idInput = <View></View>;
      idUpload = <View></View>;
    }

    return(
        <ScrollView  ref='scrollView' showsVerticalScrollIndicator={false}>
          <Text style={{marginLeft:25,paddingLeft:30,paddingTop:20,color:"#888"}}>需要提交资料审核后完成注册，资料审核成功后将有邮件通知你。审核需要24小时。</Text>
          <Form style={styles.orderContainer} ref="form">
            <View style={styles.orderInputContainer}>
              <Text style={styles.orderInputText}>用户名</Text>
              <TextInput defaultValue={data.username} type="TextInput" name="name" style={styles.orderInput} ref="username" returnKeyType={"next"} autoFocus={true} autoCapitalize="none" autoCorrect={false} placeholder="请输入中文名" clearButtonMode='while-editing' blurOnSubmit={false} />
            </View>
            <View style={styles.orderInputContainer}>
              <Text style={styles.orderInputText}>性别</Text>
              <TextInput defaultValue={data.gender} type="TextInput" name="gender" style={styles.orderInput} ref="gender" returnKeyType = {"next"} placeholder="请填写“男”或者“女”" />
            </View>
            <View style={styles.orderInputContainer}>
              <Text style={styles.orderInputText}>邮箱</Text>
              <TextInput defaultValue={data.email} type="TextInput" name="email" style={styles.orderInput} ref="email" returnKeyType = {"next"} placeholder="请输入可联系到您的常用邮箱" />
            </View>
            <View style={styles.orderInputContainer}>
              <Text style={styles.orderInputText}>新密码</Text>
              <TextInput  type="TextInput"  password={true} name="password1" style={styles.orderInput} ref="password1" returnKeyType = {"next"} placeholder="至少包含一个数字和一个字母" secureTextEntry={true}/>
            </View>
            <View style={styles.orderInputContainer}>
              <Text style={styles.orderInputText}>再次输入密码</Text>
              <TextInput  type="TextInput"  password={true} name="password2" style={styles.orderInput} ref="password2" returnKeyType = {"next"} secureTextEntry={true}/>
            </View>
            {idInput}
            <View style={styles.orderInputContainer}>
              <Text style={styles.orderInputText}>地址</Text>
              <TextInput defaultValue={data.address} type="TextInput" name="address" style={styles.orderInput} ref="address" returnKeyType = {"next"} />
            </View>
            <View style={styles.orderInputContainer}>
              <Text style={styles.orderInputText}>银行卡帐户</Text>
              <TextInput defaultValue={data.postcode} type="TextInput" name="alipay_number" style={styles.orderInput} ref="alipay" returnKeyType = {"next"} placeholder="请填写您的收款银行卡号" />
            </View>
            <View style={styles.orderInputContainer}>
              <Text style={styles.orderInputText}>银行卡开户行：请精确到支行，以确保您能收到转账款</Text>
              <Text style={styles.orderInputText}>如果不清楚，请联系银行查询开户行支行名称</Text>
              <TextInput defaultValue={data.postcode} type="TextInput" name="alipay_branch" style={styles.orderInput} ref="branch" returnKeyType = {"next"} placeholder="例:广东省深圳市xx银行(xx支行)" />
            </View>
          </Form>
          {idUpload}
        </ScrollView>
    );
  }
}

class UserChangePhoneNum extends Component{
  render() {
    return(
      <WebView
        automaticallyAdjustContentInsets={false}
        url={"https://www.dnafw.com"}
        style={{marginTop:60}}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        decelerationRate="normal"
        startInLoadingState={true}
      />
    );
  }
}

class UserRefund extends Component{
  static propTypes = {
    uid: React.PropTypes.string.isRequired,
    balance: React.PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      uid: this.props.uid,
      balance: this.props.balance,
    }
  }

  _onSubmitRefund() {
      let inputMoney = parseInt(this.refs.refundForm.getValues().refundMoney);
      if (inputMoney>this.state.balance) {
        Alert.alert("提现失败","你的钱包里没有足够的钱")
      }else{
        Util.post(`${url}/withdraw_to_alipay/`,{
          uid: this.state.uid,
          money: inputMoney
        },(resData) => {
           if (resData.message=="1") {
              console.log(resData);
              Alert.alert("提现成功","将在月结日转入您的银行卡");
              this.props.updateMoney(resData.balance);
              this.props.navigator.pop();
           }
        })
      }
  }

  render() {
    return(
      <View style={{marginTop:70, alignItems:"center"}}>
        <Form ref="refundForm">
          <View style={styles.orderInputContainer}>
            <Text style={styles.orderInputText}>提现金额：</Text>
            <TextInput keyboardType="number-pad" type="TextInput" name="refundMoney" style={styles.orderInput}/>
          </View>
        </Form>
        <TouchableHighlight underlayColor="#48aeb4" style={[styles.btn_if,{backgroundColor:'#1E868C',marginTop:20}]} onPress={() => this._onSubmitRefund()}>
          <Text style={{color:'#fff'}}>确认提现</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

class UserPurse extends Component{
  static propTypes = {
    data: React.PropTypes.object.isRequired,
    balance: React.PropTypes.number.isRequired,
    updateMoney: React.PropTypes.func.isRequired,
    updateAlipay: React.PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      userData: this.props.data,
      balance: this.props.balance,
    }
  }

  _updatePurseMoney = (amount) => {
    this.setState({
      balance: amount,
    });
    this.props.updateMoney(amount);
  };

  _onPressPurse() {
    this.props.navigator.push({
      title: "收支明细",
      component:UserIncome,
      navigationBarHidden: false,
      passProps:{uid:this.state.userData.uid},
    })
  }

  _onPressRefund() {
    this.props.navigator.push({
      title: "提现到银行卡",
      component:UserRefund,
      navigationBarHidden: false,
      passProps:{balance:this.state.balance,uid:this.state.userData.uid, updateMoney: this._updatePurseMoney},
    })
  }

  _onPressLink() {
    this.props.navigator.push({
      title: "关联银行卡",
      component:UserLink,
      navigationBarHidden: false,
      passProps:{uid:this.state.userData.uid, updateAlipay: this.props.updateAlipay},
    })
  }

  render() {
    return(
      <View style={{marginTop:80}}>
        <TouchableHighlight underlayColor="#f1f1f1" style={styles.userMenuContainer} onPress={() => this._onPressPurse()}>
          <View style={[styles.userMenu,{paddingLeft:15,paddingRight:15}]}>
            <Text>钱包余额</Text>
            <Text style={styles.itemNavText}>{this.state.balance}元 </Text>
            <Icon style={styles.itemNavMenu} name="angle-right" size={20}></Icon>
          </View>
        </TouchableHighlight>
        <TouchableHighlight  underlayColor="#f1f1f1" style={styles.userMenuContainer} onPress={() => this._onPressRefund()}>
          <View style={[styles.userMenu,{paddingLeft:15,paddingRight:15}]}>
            <Text>提现到银行卡</Text>
            <Icon style={styles.itemNavMenu} name="angle-right" size={20}></Icon>
          </View>
        </TouchableHighlight>
        <TouchableHighlight  underlayColor="#f1f1f1" style={styles.userMenuContainer} onPress={() => this._onPressLink()}>
          <View style={[styles.userMenu,{paddingLeft:15,paddingRight:15}]}>
            <Text>关联银行卡</Text>
            <Icon style={styles.itemNavMenu} name="angle-right" size={20}></Icon>
          </View>
        </TouchableHighlight>
      </View>
    );
  }
}

class UserLink extends Component{
  _onSubmitLink() {
    const alipay = this.refs.linkForm.getValues().alipay;
    const branch = this.refs.linkForm.getValues().alipay_branch;
    if (alipay === this.refs.linkForm.getValues().realipay) {
      Util.post(`${url}/bundle_alipay_account/`,{
        uid: this.props.uid,
        alipay_account: alipay,
        alipay_branch: branch,
        password: this.refs.linkForm.getValues().password
      },(resData) => {
        if (resData.error !== "true") {
          switch(resData.message){
            case "0":
              Alert.alert("修改绑定失败");
              break;
            case "1":
              Alert.alert("修改绑定成功");
              this.props.updateAlipay(alipay);
              this.props.navigator.pop();
              break;
            case "2":
              Alert.alert("银行卡帐户已被他人使用");
              break;
            case "3":
              Alert.alert("密码错误");
              break;
          }
        }else{
          Alert.alert("服务器无响应","请稍后再试");
        }
      })
    }else{
      Alert.alert("银行卡帐户不匹配");
    }
  }

  render() {
    return(
      <View style={{marginTop:70, alignItems:"center"}}>
        <Form ref="linkForm">
          <View style={styles.orderInputContainer}>
            <Text style={styles.orderInputText}>银行卡帐户：</Text>
            <TextInput type="TextInput" name="alipay" style={styles.orderInput}/>
          </View>
          <View style={styles.orderInputContainer}>
            <Text style={styles.orderInputText}>确认银行卡帐户：</Text>
            <TextInput type="TextInput" name="realipay" style={styles.orderInput}/>
          </View>
          <View style={styles.orderInputContainer}>
            <Text style={styles.orderInputText}>开户行：</Text>
            <TextInput type="TextInput" name="alipay_branch" style={styles.orderInput}/>
          </View>
          <View style={styles.orderInputContainer}>
            <Text style={styles.orderInputText}>登录密码：</Text>
            <TextInput type="TextInput" password={true} name="password" style={styles.orderInput}/>
          </View>
        </Form>
        <TouchableHighlight underlayColor="#48aeb4" style={[styles.btn_if,{backgroundColor:'#1E868C',marginTop:20}]} onPress={() => this._onSubmitLink()}>
          <Text style={{color:'#fff'}}>确认绑定</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

class UserHelp extends Component{
  render() {
    return(
      <WebView
        automaticallyAdjustContentInsets={false}
        source={{uri: "https://www.dnafw.com/iosapp/help/"}}
        style={{marginTop:60}}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        decelerationRate="normal"
        startInLoadingState={true}
      />
    );
  }
}

class UserSetting extends Component{
  render() {
    return(
      <View>
        <Text style={styles.userSettingContainer}>List of settings...</Text>
      </View>
    );
  }
}

class UserAbout extends Component{
  render() {
    return(
      <View>
        <Text style={styles.userSettingContainer}>华大司法微代理APP由华大司法云团队开发和维护。</Text>
        <Text style={styles.userSettingContainer}>All rights reserved.</Text>
      </View>
    );
  }
}

class UserIncome extends Component{
  static propTypes = {
    uid: React.PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    const uid = this.props.uid;
    let data=[], sectiondata=[];
    // return resData{data:data,sectiondata:sectiondata}
    // const data = [[{
    //     income:"+ ¥50",
    //     day:"02-23",
    //     week:"周二",
    //     icon:'baby',
    //     orderItem:"亲子鉴定",
    //     orderId:"65438023"
    //   },{
    //     income:"- ¥320",
    //     day:"02-22",
    //     week:"周一",
    //     icon:'refund',
    //     orderItem:"提现到支付宝",
    //     orderId:"f7d9437"
    //   },{
    //     income:"+ ¥70",
    //     day:"02-14",
    //     week:"周日",
    //     icon:'file',
    //     orderItem:"DNA档案",
    //     orderId:"749327474"
    //   },{
    //     income:"+ ¥60",
    //     day:"02-10",
    //     week:"周三",
    //     icon:'baby',
    //     orderItem:"亲子鉴定",
    //     orderId:"237957923"
    //   },],[{
    //     income:"+ ¥60",
    //     day:"01-27",
    //     week:"周三",
    //     icon:'family',
    //     orderItem:"DNA家谱",
    //     orderId:"597927595"
    //   },{
    //     income:"+ ¥60",
    //     day:"01-16",
    //     week:"周六",
    //     icon:'file',
    //     orderItem:"DNA档案",
    //     orderId:"598734987"
    //   },{
    //     income:"+ ¥60",
    //     day:"01-15",
    //     week:"周二",
    //     icon:'baby',
    //     orderItem:"亲子鉴定",
    //     orderId:"597927595"
    //   },{
    //     income:"+ ¥60",
    //     day:"01-11",
    //     week:"周一",
    //     icon:'file',
    //     orderItem:"DNA档案",
    //     orderId:"598734987"
    //   },{
    //     income:"+ ¥60",
    //     day:"01-03",
    //     week:"周日",
    //     icon:'family',
    //     orderItem:"DNA家谱",
    //     orderId:"597927595"
    //   },{
    //     income:"+ ¥60",
    //     day:"01-16",
    //     week:"周六",
    //     icon:'file',
    //     orderItem:"DNA档案",
    //     orderId:"598734987"
    //   }],[{
    //     income:"+ ¥60",
    //     day:"12-25",
    //     week:"周五",
    //     icon:'file',
    //     orderItem:"DNA档案",
    //     orderId:"759473957"
    //   },{
    //     income:"+ ¥60",
    //     day:"12-11",
    //     week:"周五",
    //     icon:'family',
    //     orderItem:"DNA家谱",
    //     orderId:"493275429"
    //   },]];
    // const sectiondata = ["本月","2016年1月","2015年12月"]
    const getSectiondata = function(dataIncome, sectionID) {
      return dataIncome[sectionID];
    };

    this.state = {
      dataSection: sectiondata,
      dataSource: new ListView.DataSource({
        getSectiondata: getSectiondata,
        rowHasChanged: (r1, r2) => r1 !== r2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2
      }).cloneWithRowsAndSections(data),
    };
  }

  componentWillMount() {
    const uid = this.props.uid;
    const getSectiondata = function(dataIncome, sectionID) {
      return dataIncome[sectionID];
    };
    Util.post(`${url}/balance_history/`,{uid}, (resData) => {
      if (resData.data){
        // console.log(resData);
        let data = resData.data;
        let sectiondata = resData.sectiondata;

        this.setState({
          dataSection: sectiondata,
          dataSource: new ListView.DataSource({
            getSectiondata: getSectiondata,
            rowHasChanged: (r1, r2) => r1 !== r2,
            sectionHeaderHasChanged: (s1, s2) => s1 !== s2
          }).cloneWithRowsAndSections(data),
        });

      }
    })
  }

  _renderSectionHeader = (sectiondata, sectionID) => {
    return(
      <View style={styles.section}>
        <Text style={styles.sectionText}>{this.state.dataSection[sectionID]}</Text>
      </View>
    )
  };

  _renderRow = (rowData: object, sectionID: number, rowID: number) => {
    console.log(rowData.isFrozen);
    return (
      <View>
        <View>
          <View style={[styles.incomeRow, rowData.isFrozen? styles.incomeRowNotActive:styles.incomeRowActive]}>
            <View style={styles.incomeRowText}>
              <Text style={{color:"#777"}}>{rowData.week}</Text>
              <Text style={{color:"#777"}}>{rowData.day}</Text>
            </View>
            <View style={styles.incomeRowIcon}>
              <Image source={{uri:rowData.icon}} style={{width:30,height:30}}></Image>
            </View>
            <View style={styles.incomeRowOrder}>
              <Text style={{color:"#333",fontSize:17,paddingBottom:3}}>{rowData.income}</Text>
              <Text style={{color:"#555",fontSize:11.5}}>{rowData.orderItem+"："+rowData.orderId}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  render() {
    return(
        <ListView
          contentContainerStyle={styles.list}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderSectionHeader={this._renderSectionHeader}
        />
    );
  }
}

class UserShare extends Component{
  _shareWechat() {
    
  }

  _shareWeibo() {
    
  }

  _shareQQ() {
    
  }

  render() {
    return(
      <View style={{paddingTop:90}}>
       <View style={styles.orderButtonContainer}>
          <TouchableHighlight underlayColor="#55D95D" style={[styles.btn_if,{backgroundColor:'#24bf2f'}]} onPress={() => this._shareWechat()}>
            <Text style={{color:'#fff'}}>
            <Icon size={15} name="weixin"></Icon> 分享到微信
            </Text>
          </TouchableHighlight>
        </View>
        <View style={styles.orderButtonContainer}>
          <TouchableHighlight underlayColor="#db7822" style={[styles.btn_if,{backgroundColor:'#F27405'}]} onPress={() => this._shareWeibo()}>
            <Text style={{color:'#fff'}}>
            <Icon size={15} name="weibo"></Icon> 分享到微博</Text>
          </TouchableHighlight>
        </View>
        <View style={styles.orderButtonContainer}>
          <TouchableHighlight underlayColor="#38b4db" style={[styles.btn_if,{backgroundColor:'#15b3e5'}]} onPress={() => this._shareQQ()}>
            <Text style={{color:'#fff'}}>
              <Icon size={15} name="qq"></Icon> 分享到QQ
            </Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

/**
 * userData
 * @dynamic
 * 
 * Data Flow:
 * userData -> UserView -> userInfo
 *                      -> userLink
 */

//class UserView extends Component{
export default class extends Component{
  static propTypes = {
    uid: React.PropTypes.string.isRequired,
    isFirstTime: React.PropTypes.bool.isRequired,
    callbackLogout: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    let userData, userBalance, frozenBalance;
    // AsyncStorage.getItem('uid').then((value) => {console.log(value)});

    userBalance = 0;
    frozenBalance = 0;
    userData = {
      uid:"",
      isNew: true,
      username: "",
      cellphone: "",
      email:null,
      alipayLinked: false,
      address:"",
      postcode:"",
    };

    this.state = {
      isFirstTime: this.props.isFirstTime,
      userData: userData,
      balance: userBalance,
      frozenBalance: frozenBalance,
      visible: false
    };
  }

  onCancel() {
    console.log("CANCEL")
    this.setState({visible:false});
  }
  onOpen() {
    console.log("OPEN")
    this.setState({visible:true});
  }

  componentWillMount() {
    Util.post(`${url}/my_info/`, {uid: this.props.uid}, (resData) => {
      if (resData.error!=="true"){
        this.setState({
          userData: resData.userData,
          balance: resData.userBalance,
          frozenBalance: resData.frozenBalance
        })
      } 
    });
  }

  _updateMoney = (amount) => {
    this.setState({
      balance:amount
    });
  }

  _updateAlipay = (alipay) => {
    const userData = this.state.userData;
    userData.alipay = alipay.substring(0, alipay.length - 4) + "xxxx";
    this.setState({
      userData: userData
    });
  }

  _logout() {
    AsyncStorage.setItem('loginState',"0");
    AsyncStorage.setItem('uid',"");
    const newState = {
      onSignup: false,
    };
    this.props.callbackLogout(newState);
  }

  _onIncomePress() {
    this.props.navigator.push({
      title: "收支明细",
      component:UserIncome,
      navigationBarHidden: false,
      passProps:{uid:this.props.uid}
    })
  }

  _onInfoPress() {
    this.props.navigator.push({
      title: "编辑资料",
      component:UserInfo,
      navigationBarHidden: false,
      passProps:{data:this.state.userData}
    })
  }

  _onPursePress() {
    this.props.navigator.push({
      title: "我的钱包",
      component:UserPurse,
      navigationBarHidden: false,
      passProps:{data:this.state.userData, balance: this.state.balance,
       updateMoney: this._updateMoney, updateAlipay: this._updateAlipay},
    })
  }

  _onHelpPress() {
    this.props.navigator.push({
      title: "帮助中心",
      component:UserHelp,
      navigationBarHidden: false,
    })
  }

  _onSettingPress() {
    this.props.navigator.push({
      title: "设置",
      component:UserSetting,
      navigationBarHidden: false,
    })
  }

  _onAboutPress() {
    this.props.navigator.push({
      title: "关于微代理",
      component:UserAbout,
      navigationBarHidden: false,
    })
  }

  _onSharePress() {
//    ActivityView.show({
//      url: 'https://www.dnafw.com/iosapp',
//    });
    this.props.navigator.push({
      title: "推荐给朋友",
      component:UserAbout,
      navigationBarHidden: false,
    })
  }

  _renderFirstTimeMsg = () => {
    if (this.state.isFirstTime) {
      return(
        <View style={styles.ftMsg}>
          <Text style={{color:"#fff"}}>
            你的资料尚未填写完整或正在审核中，请点击上面进入编辑资料或查看你的资料审核进度。审核成功后，你便可以使用微代理的完整功能。
          </Text>
        </View>
      )
    };
  };

  render() {
    const data = this.state.userData;
    let shareOptions = {
      title: "React Native",
      message: "Hola mundo",
      url: 'https://www.dnafw.com/iosapp',
      subject: "Share Link", //  for email 
    };
 
    let shareImageBase64 = {
      title: "React Native",
      message: "Hola mundo",
      url: REACT_ICON,
      subject: "Share Link" //  for email 
    };
    return(
      <ScrollView showsVerticalScrollIndicator={false} style={styles.userContainer}>
        <View style={{marginBottom:35}}>
          <View style={styles.userHero}>
            <View style={styles.bgImageWrapper}>
                  <Image source={require("./img/logo.png")} style={styles.icon}>
                  </Image>
                  <Text style={{fontSize:18,color:"#3a3a3a",marginTop:10,top:35,left:130}}>{data.username? data.username:"用户名未设置"}</Text>
                  <Text style={{fontSize:11,color:"#3a3a3a",marginTop:10,top:40,left:130}}>帐号：{data.cellphone}</Text>
                  <Text style={{fontSize:11,color:"#3a3a3a",marginTop:10,top:45,left:130}}>钱包：¥{this.state.balance}（可提现） ¥{this.state.balance}(冻结）</Text>
                  <Text style={{fontSize:11,color:"#3a3a3a",marginTop:10,top:50,left:130}}>银行卡：{data.alipay? data.alipay:"未绑定银行卡"}</Text>              
            </View>
          </View>
        </View>
        {this._renderFirstTimeMsg()}
        <TouchableHighlight  underlayColor="#f1f1f1" style={styles.userMenuContainer} onPress={() => this._onPursePress()}>
          <View style={styles.userMenu}>
            <Icon style={styles.itemNavIcon} name="shopping-bag" size={18}></Icon>
            <Text>我的钱包</Text>
            <Icon style={styles.itemNavMenu} name="angle-right" size={20}></Icon>
          </View>
        </TouchableHighlight>
        <TouchableHighlight  underlayColor="#f1f1f1" style={styles.userMenuContainer} onPress={() => this._onIncomePress()}>
          <View style={styles.userMenu}>
            <Icon style={styles.itemNavIcon} name="list-alt" size={18}></Icon>
            <Text>支出明细</Text>
            <Icon style={styles.itemNavMenu} name="angle-right" size={20}></Icon>
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor="#f1f1f1" style={styles.userMenuContainer} onPress={() => this._onHelpPress()}>
          <View style={styles.userMenu}>
            <Icon style={styles.itemNavIcon} name="question-circle" size={18}></Icon>
            <Text>帮助中心</Text>
            <Icon style={styles.itemNavMenu} name="angle-right" size={20}></Icon>
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor="#f1f1f1" style={styles.userMenuContainer} onPress={() => this._onAboutPress()}>
          <View style={styles.userMenu}>
            <Icon style={styles.itemNavIcon} name="info-circle" size={18}></Icon>
            <Text>关于微代理</Text>
            <Icon style={styles.itemNavMenu} name="angle-right" size={20}></Icon>
          </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor="#f1f1f1" style={styles.userMenuContainer} onPress={this.onOpen.bind(this)}>
          <View style={styles.userMenu}>
            <Icon style={styles.itemNavIcon} name="share-alt-square" size={18}></Icon>
            <Text ref="share">推荐给朋友</Text>
            <Icon style={styles.itemNavMenu} name="angle-right" size={20}></Icon>
          </View>
        </TouchableHighlight> 
        <ShareSheet visible={this.state.visible} onCancel={this.onCancel.bind(this)}>
          <Button iconSrc={{ uri: TWITTER_ICON }}
                  onPress={()=>{
              this.onCancel();
              setTimeout(() => {
                Share.shareSingle(Object.assign(shareOptions, {
                  "social": "twitter"
                }));
              },300);
            }}>Twitter</Button>
          <Button iconSrc={{ uri: FACEBOOK_ICON }}
                  onPress={()=>{
              this.onCancel();
              setTimeout(() => {
                Share.shareSingle(Object.assign(shareOptions, {
                  "social": "facebook"
                }));
              },300);
            }}>Facebook</Button>
          <Button iconSrc={{ uri: WHATSAPP_ICON }}
                  onPress={()=>{
              this.onCancel();
              setTimeout(() => {
                Share.shareSingle(Object.assign(shareOptions, {
                  "social": "whatsapp"
                }));
              },300);
            }}>Whatsapp</Button>
          <Button iconSrc={{ uri: GOOGLE_PLUS_ICON }}
                  onPress={()=>{
              this.onCancel();
              setTimeout(() => {
                Share.shareSingle(Object.assign(shareOptions, {
                  "social": "googleplus"
                }));
              },300);
            }}>Google +</Button>
          <Button iconSrc={{ uri: EMAIL_ICON }}
                  onPress={()=>{
              this.onCancel();
              setTimeout(() => {
                Share.shareSingle(Object.assign(shareOptions, {
                  "social": "email"
                }));
              },300);
            }}>Email</Button>
          <Button
            iconSrc={{ uri: CLIPBOARD_ICON }}
            onPress={()=>{
              this.onCancel();
              setTimeout(() => {
                if(typeof shareOptions["url"] !== undefined) {
                  Clipboard.setString(shareOptions["url"]);
                  ToastAndroid.show('链接已经复制', ToastAndroid.SHORT);
                }
              },300);
            }}>Copy Link</Button>
          <Button iconSrc={{ uri: MORE_ICON }}
            onPress={()=>{
              this.onCancel();
              setTimeout(() => {
                //Share.open(shareOptions)
              },300);
            }}>More</Button>
        </ShareSheet>

        <View style={{alignItems:"center",width:Util.size.width}}>
          <TouchableHighlight underlayColor="#ee6146" style={styles.btn_pm} onPress={() => this._logout()}>
              <Text style={{color:'#fff'}}>注销帐户</Text>
          </TouchableHighlight>
        </View>
      </ScrollView>
    );
  }
}

// export default class extends Component{
//   static propTypes = {
//     uid: React.PropTypes.string.isRequired, 
//     isFirstTime: React.PropTypes.bool.isRequired, 
//     callbackLogout: React.PropTypes.func.isRequired,
//   };

//   constructor(props) {
//     super(props);
//     this.state = {
//       isFirstTime: this.props.isFirstTime,
//       uid: this.props.uid,
//     };
//   }

//   componentDidMount() {
//     //StatusBarIOS.setStyle(0);
//   }

//   render(){
//     const callback = this.props.callbackLogout;
//     const isFirstTime = this.state.isFirstTime;
//     const uid = this.state.uid;

//     return (
//       <Navigator
//         ref='nav'
//         style={styles.container}
//         initialRoute={{
//           title:"我的帐户",
//           component: UserView,
//           passProps: {
//             callbackLogout: callback,
//             isFirstTime: isFirstTime,
//             uid: uid,
//           },
//           shadowHidden: true
//         }}
//         renderScene={ ( route, navigator ) => UserView }
//         itemWrapperStyle={styles.itemWrapper}
//         tintColor="#777"
//       />
//     );
//   }
// }

const styles = StyleSheet.create({
  container:{
    flex:1,
  },
  itemWrapper:{
    backgroundColor: '#eaeaea'
  },
  userContainer:{
    position:"relative",
    top: -50
  },
  userHero:{
    height:150,
    flex:1,
    flexDirection:'row',
  },
  bgImageWrapper: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0
  },
  backgroundImage: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
  },
  blur:{
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    paddingTop: 69,
    paddingLeft: 135,
    backgroundColor:"rgba(255,255,255,0.05)"
  },
  icon:{
    position:"absolute",
    borderWidth:2,
    borderColor: "#fff",
    bottom:10,
    left:20,
    width: 80,
    height: 80
  },
  itemNav:{
    position:"absolute",
    top:77,
    right:10,
    color: "rgba(0,0,0,0.3)",
    backgroundColor:"transparent"
  },
  itemNavMenu:{
    position:"absolute",
    top:12,
    right:10,
    color: "#bbb",
    backgroundColor:"transparent"
  },
  itemNavText:{
    position:"absolute",
    top:13,
    right:30,
    color: "#777",
    backgroundColor:"transparent"
  },
  userMenuContainer:{
    height:45,
    borderTopWidth: Util.pixel,
    borderTopColor:"#bbb",
    borderBottomWidth: Util.pixel,
    borderBottomColor:"#bbb",
    backgroundColor:"#f7f7f7",
    flex:1,
    marginBottom:20,
  },
  userMenu:{
    paddingLeft:50,
    height:45,
    justifyContent:'center',
  },
  itemNavIcon:{
    position:"absolute",
    top:13,
    left:20,
    color: "#454545",
    backgroundColor:"transparent"
  },
  btn_pm:{
    marginTop:15,
    width:280,
    height:40,
    borderRadius:2,
    backgroundColor:'#d73c37',
    justifyContent:'center',
    alignItems:'center',
  },
  ftMsg:{
    backgroundColor:"#d73c37",
    paddingLeft:20,
    paddingRight: 20,
    paddingTop:10,
    paddingBottom: 10,
    marginTop:-35,
    marginBottom: 20,
    flex:1
  },
  orderContainer:{
    alignItems:'center',
    flex:1,
    width: Util.size.width-40,
    marginLeft:20, marginTop: 10
  },
  orderInputContainer:{
    marginTop: 20, 
  },
  orderButtonContainer:{
    marginTop: 20, 
    width: Util.size.width-40,
    marginLeft:20,
    alignItems:"center"
  },
  orderInputText:{
    fontSize:12
  },
  orderInput:{
    marginTop: 10,
    paddingLeft:10,
    paddingRight: 10,
    paddingTop:5,
    paddingBottom:5,
    width:Util.size.width-80,
    borderWidth:Util.pixel,
    height:40,
    borderColor:'#777',
    borderRadius:2,
    color:"#333",
  },
  uploadId:{
    height:100,
    width:100,
    marginTop:20,
    flex:1,
    borderWidth: 1,
    borderColor: "#aaa"
  },
  btn_if:{
    marginTop:10,
    width:Util.size.width-80,
    height:40,
    borderRadius:2,
    justifyContent:'center',
    alignItems:'center',
  },
  section:{
    backgroundColor: "#f3f3f3",
    paddingLeft:15,
    paddingTop:7,
    paddingBottom:7,
    borderBottomColor:"#ddd",
    borderBottomWidth: Util.pixel
  },
  sectionText:{

  },
  incomeRow:{
    backgroundColor: "#fff",
    height:60,
    borderBottomColor:"#ddd",
    borderBottomWidth: Util.pixel,
    flexDirection:"row",
    paddingLeft:15,
    paddingRight: 15,
    justifyContent:"center"
  },
  incomeRowActive: {
    opacity: 1
  },
  incomeRowNotActive: {
    opacity: 0.45
  },
  incomeRowText:{
    flex:1,
    justifyContent:"center"
  },
  incomeRowIcon:{
    flex:1,
    justifyContent:"center"
  },
  incomeRowOrder:{
    flex:3,
    justifyContent:"center"
  },
  userSettingContainer:{
    marginTop: 100, 
    marginLeft:30,
  },
})


//  twitter icon 
const TWITTER_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAMAAAANIilAAAABvFBMVEUAAAAA//8AnuwAnOsAneoAm+oAm+oAm+oAm+oAm+kAnuwAmf8An+0AqtUAku0AnesAm+oAm+oAnesAqv8An+oAnuoAneoAnOkAmOoAm+oAm+oAn98AnOoAm+oAm+oAmuoAm+oAmekAnOsAm+sAmeYAnusAm+oAnOoAme0AnOoAnesAp+0Av/8Am+oAm+sAmuoAn+oAm+oAnOoAgP8Am+sAm+oAmuoAm+oAmusAmucAnOwAm+oAmusAm+oAm+oAm+kAmusAougAnOsAmukAn+wAm+sAnesAmeoAnekAmewAm+oAnOkAl+cAm+oAm+oAmukAn+sAmukAn+0Am+oAmOoAmesAm+oAm+oAm+kAme4AmesAm+oAjuMAmusAmuwAm+kAm+oAmuoAsesAm+0Am+oAneoAm+wAmusAm+oAm+oAm+gAnewAm+oAle0Am+oAm+oAmeYAmeoAmukAoOcAmuoAm+oAm+wAmuoAneoAnOkAgP8Am+oAm+oAn+8An+wAmusAnuwAs+YAmegAm+oAm+oAm+oAmuwAm+oAm+kAnesAmuoAmukAm+sAnukAnusAm+oAmuoAnOsAmukAqv9m+G5fAAAAlHRSTlMAAUSj3/v625IuNwVVBg6Z//J1Axhft5ol9ZEIrP7P8eIjZJcKdOU+RoO0HQTjtblK3VUCM/dg/a8rXesm9vSkTAtnaJ/gom5GKGNdINz4U1hRRdc+gPDm+R5L0wnQnUXzVg04uoVSW6HuIZGFHd7WFDxHK7P8eIbFsQRhrhBQtJAKN0prnKLvjBowjn8igenQfkQGdD8A7wAAAXRJREFUSMdjYBgFo2AUDCXAyMTMwsrGzsEJ5nBx41HKw4smwMfPKgAGgkLCIqJi4nj0SkhKoRotLSMAA7Jy8gIKing0KwkIKKsgC6gKIAM1dREN3Jo1gSq0tBF8HV1kvax6+moG+DULGBoZw/gmAqjA1Ay/s4HA3MISyrdC1WtthC9ebGwhquzsHRxBfCdUzc74Y9UFrtDVzd3D0wtVszd+zT6+KKr9UDX749UbEBgULIAbhODVHCoQFo5bb0QkXs1RAvhAtDFezTGx+DTHEchD8Ql4NCcSyoGJYTj1siQRzL/JKeY4NKcSzvxp6RmSWPVmZhHWnI3L1TlEFDu5edj15hcQU2gVqmHTa1pEXJFXXFKKqbmM2ALTuLC8Ak1vZRXRxa1xtS6q3ppaYrXG1NWjai1taCRCG6dJU3NLqy+ak10DGImx07LNFCOk2js6iXVyVzcLai7s6SWlbnIs6rOIbi8ViOifIDNx0uTRynoUjIIRAgALIFStaR5YjgAAAABJRU5ErkJggg==";
 
//  facebook icon 
const FACEBOOK_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAMAAAANIilAAAAAYFBMVEUAAAAAQIAAWpwAX5kAX5gAX5gAX5gAXJwAXpgAWZ8AX5gAXaIAX5gAXpkAVaoAX5gAXJsAX5gAX5gAYJkAYJkAXpoAX5gAX5gAX5kAXpcAX5kAX5gAX5gAX5YAXpoAYJijtTrqAAAAIHRSTlMABFis4vv/JL0o4QvSegbnQPx8UHWwj4OUgo7Px061qCrcMv8AAAB0SURBVEjH7dK3DoAwDEVRqum9BwL//5dIscQEEjFiCPhubziTbVkc98dsx/V8UGnbIIQjXRvFQMZJCnScAR3nxQNcIqrqRqWHW8Qd6cY94oGER8STMVioZsQLLnEXw1mMr5OqFdGGS378wxgzZvwO5jiz2wFnjxABOufdfQAAAABJRU5ErkJggg==";
 
//  whatsapp icon 
const WHATSAPP_ICON = "data:image/png;base64,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";
 
//  gplus icon 
const GOOGLE_PLUS_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAMAAAANIilAAAACQ1BMVEUAAAD/RDP/STX9Sjb+STT+SjX+SjX+SjX+STT/SzP/Sjb/SzX/VVX/SDb+SDP+SjX9RzT9STT9SjT+STX+SjT9SjT/SST/TTP+SjX+SjX/RDP/RzP+SjX+SjX/STf9SDX/SjX/TU3+Sjb+SjX/Qyz/Szb+SjX/TTP+SjX9STX+SjP/TTX9Szb+Szb/YCD/SzX/SzX+Sjb+STX/TTX/SzX/Szb/TDT+SjX9SzX/STf+TDX/SjT9SzX9Szb+SjX/SjX/SzX/STT9SjT9TDT+SDT/VQD9STX/STX9SjX+SjX9STX+SzT/UDD9Sjb+SjX9RzT/QED+SjT+SjX/XS7+SjX/Ui7/RC3+SjX/TTz/RzP+SjX/TTP/STf+SjX/STT/RjP+Sjb/SzX/Szz/Rjr/RzL+RzP+SjX/Szf/SjX9Sjb+SjX+Sjb+SjX+SjX+SjX/STf/SjT/SjT9SjX9SzT+RzT+STT/STT+SjX/STP/Tjf+SjX/Szb/SjX/STX9SjX/SjT/AAD/SjH/STb+SzX+Sjb+SjT9SDT+Sjb+SjX9STf9STT/SDX/TDf+STb/TjT/TjH+SjX+SDT/Sjb9SzX9RzX+TDT/TUD/STX+SjX+STX/VTn/QjH/SjX+SjX/Ri7+Szb/TTP+SjX/SDX/STT9SjX+SjX/SDL/TjT9Sjb/RjL+SjX9SzX/QED/TDT+SjX+SjX9STX/RjX/VSv/Rzb/STX/ORz/UDD9SzX+Sjb/STT9SzP+SzX+SjX+SjX9Szb/Ti//ZjPPn7DtAAAAwXRSTlMAD1uiy+j5/8FBZHQDY9zvnYSc5dGhBwr+1S0Zqu44mz4KtNkXY7Yo8YLcfp3bCGZ+sLhWaks2z4wO6VOklrtWRFSXos4DoD+D/ZnoEKasjwS7+gvfHC3kHmjtMlTXYjfZXBEWa+/nQRiK5u7c8vVGRWepp6+5eulQF/dfSHSQdQEfdrzguZzm+4KSQyW1JxrAvCaCiLYUc8nGCR9h6gvzFM41MZHhYDGYTMejCEDi3osdBj1+CSCWyGyp1PC3hUEF/yhErwAAAjFJREFUSMft1tdfE0EQB/ADJD+JKAomHoqKxhJLFCnSpdgIxobYgqhYaJKIHVQUsSFiBSuCvWPv3T/N2ZPD3EucvVcyL3sz2W8+l73ZvShKKEIxcCIsPGJQpAV9MThK1KzAEAaNHjosZviI2DgBR9psVrvCx6Ni1fjRNI5JIDx2nF5m4ejxsCRqVxMmknZMksGTVUzpu5zqJD1NAodNB2boyUzCrlnK7CSKOUCyGJOC4BSan6onaWLN5irpCIwgOAMBt5eZRVk2H+fQx7n92TzK8pT8AopCwCbGgiB4Pk1fsFDPFlG2mL9gRTTdnahnxcASDx/nq6SX6tkyYLnEo1qxknBJ2t9kVSlcq2WaZM1a0qXrtOv18Jbp9Q3l5Rv/39ubHKQ3V2xRtm7bXlkluyGra2qJ76jzwb/TxH721O9K3U1fsMfsgbCXcLFZvI+wL8ok3i/6+ECDOdxYJ/TBQ9Kw+nDTkRyHtodKjjbLyGMtx304cTKi8NRpoVutfJp5xgtv21ntxGw/J7T3PNdeuAhcuqxn9o5W0p1Ma78CpF/9lzdfI3ydiStobrjhIL4BRN7k4WRa3i5D5RbQ3cPDMcDtO4ZKGXCXedtuQL1nqNwHHjDxQ/rNGYbKI/gfM/ETwv6ngafSM3RwH3O7eK86Wzz9L582PO9lN9iLl6KpXr2uf9P7tvHde4e75oNEZ3/85NQ2hKUyzg/1c57klur68vXbd9XtdP34+et36C9WKAZo/AEHHmXeIIIUCQAAAABJRU5ErkJggg==";
 
//  email icon 
const EMAIL_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAMAAAANIilAAAABC1BMVEUAAAA/Pz8/Pz9AQEA/Pz8/Pz8+Pj4+Pj4/Pz8/Pz8/Pz8/Pz8+Pj4+Pj4/Pz8/Pz8/Pz9AQEA+Pj5AQEA/Pz87Ozs7Ozs/Pz8+Pj47OztAQEA/Pz89PT01NTVBQUFBQUE/Pz8/Pz8+Pj4/Pz9BQUE+Pj4/Pz8/Pz89PT0+Pj4/Pz9BQUFAQEA9PT09PT0/Pz87Ozs9PT05OTk/Pz8+Pj4/Pz9AQEA/Pz8/Pz8/Pz8/Pz+AgIA+Pj4/Pz8/Pz9AQEA/Pz8/Pz8/Pz8/Pz8+Pj4/Pz8/Pz8/Pz9AQEA+Pj4/Pz8+Pj4/Pz85OTk/Pz8/Pz8/Pz8/Pz88PDw9PT0/Pz88PDw8PDw+Pj45OTlktUJVAAAAWXRSTlMA/7N4w+lCWvSx8etGX/XlnmRO7+1KY/fjOGj44DU7UvndMec/VvLbLj7YKyiJdu9O7jZ6Um1w7DnzWQJz+tpE6uY9t8D9QehAOt7PVRt5q6duEVDwSEysSPRjqHMAAAEfSURBVEjH7ZTXUgIxGEa/TwURUFyKYgMURLCvbe2gYAV7ff8nMRksgEDiKl7lXOxM5p8zO3s2CWAwGAx/CjXontzT25Y+pezxtpv2+xTygJ+BYOvh4BBDwx1lKxxhNNZqNjLK+JjVWUYsykj4+2h8gpNTUMkIBuhPNE+SKU7PQC3D62E60ziYzXIuBx0Z+XRTc9F5fgF6MhKNzWXnRejKWGJdc9GZy8AP3kyurH52Ju01XTkjvnldNN+Qi03RecthfFtPlrXz8rmzi739Ax7mUCjy6FhH/vjPonmqVD6pdT718excLX/tsItLeRAqtc7VLIsFlVy/t6+ub27v7t8XD490niy3p+rZpv3i+jy/Or+5SUrdvcNcywaDwfD/vAF2TBl+G6XvQwAAAABJRU5ErkJggg==";
 
//  clipboard icon 
const CLIPBOARD_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAMAAAANIilAAAAB5lBMVEUAAAA8PDw+Pj4/Pz8/Pz8/Pz8/Pz8+Pj47OzsAAAA5OTk+Pj4/Pz8/Pz8+Pj49PT0/Pz8/Pz85OTlAQEA/Pz87Ozs+Pj4+Pj4/Pz8/Pz8/Pz8zMzNBQUE/Pz8/Pz8/Pz9AQEA7Ozs9PT0/Pz9AQEA+Pj4/Pz8+Pj4AAABAQEA/Pz87OztBQUE/Pz8+Pj4zMzNDQ0M/Pz89PT03Nzc/Pz8/Pz8/Pz8/Pz88PDw8PDwAAABCQkI7Ozs9PT0/Pz9AQEA/Pz8uLi4rKytAQEA/Pz89PT0+Pj4/Pz8/Pz8/Pz9CQkJAQEA/Pz9CQkI/Pz8/Pz8/Pz8+Pj49PT0/Pz8yMjI/Pz88PDw/Pz9BQUE8PDw/Pz9AQEA/Pz8/Pz8/Pz89PT0/Pz9CQkI9PT1EREQ9PT08PDw4ODg+Pj6AgIA/Pz8/Pz82NjZVVVU7Ozs/Pz81NTVAQEA/Pz8+Pj49PT1BQUE/Pz8/Pz8/Pz8vLy8/Pz87OztAQEA3Nzc9PT0+Pj4/Pz89PT0/Pz8/Pz89PT1AQEA9PT04ODgzMzM/Pz8/Pz9AQEA/Pz9AQEA/Pz83Nzc9PT0/Pz9AQEA/Pz8+Pj4+Pj5AQEA/Pz89PT1FRUU5OTk/Pz8/Pz8+Pj47Ozs/Pz89PT08PDw+Pj6z1Mg0AAAAonRSTlMAEXTG8/7pslICKMn//J0u2LcSLNu9Y0523KoKL9b7hggauZsEOuJ/ARS7VifkiwUX0bEq1f1p6KGQAz4NpnpY8AsGtMIyb46NbSOMcRuh+fGTFc0z1yKFKy/dpKff1CqKMoYPp+lAgAKd6kIDhdorJJExNjflktMr3nkQDoXbvaCe2d2EijIUn3JsbjDDF1jjOOdWvIDhmhoJfWrAK7bYnMgx8fGWAAACNUlEQVRIx+2W6V8SURSGBxEVeydMbVER1DCwRNTCEhMNsywqExXcUrNVU9NK2wy1fd9sMyvrP+1cmYH5eK5f5f3APef85hnuvfPeM6MoaaW1dWXKMGdasrJzrJtgc7dhQ+p2kzRry4OuHfmSbEEhUTt37d5TRGNxiRRrLwUczjKKyiuI3uuSYCv3ARa3ZyOu2k/xAT5b7aXra3xaVlsH1LPZg4cAvzM10wbgMBs+QqtsDKTyJroXGz7a7AgandECtPLXfKzFY8hCbcBxFudpP3Gy49RpQ8UXtgBnOOzZc53CU+e7Ism7uYnt5ji0p1e3pDmqzTnmAEr7GGz/AGEDg0MXaBgeERXrKIWFBQz2IvlYHbtEh/EycOUqVQLXVCDPxvGz+MPYdRGWjE/coGFyyg9M32SwM8PkydlQIim7JX6DxHpvM9g7c+SjoLESmqd9vjvDYO9NEzs1aahYY7SK+3Zm31Ddmp8jDx4qysIj2qt4O6dviH4xqvk5soj40vJjqjzh7HOf6BtPtb1SnulG6X3O6bHdqb5BejHbKtDOl+UcQ78iNuwzFKKvwx1v3npYJ+kd0BYynqz3Eu2OZvnB+IyCRVE+TD5qSmWBRuDjJzb8GWhIJq4xv36kWKoH6mr1vlFDnvRW86e9Qtd/qUrs1VeKv1VKbJjrOz3Wih8UrTpF37ArMlotFmfg58raLxrjvyXfifl/ku/TdZsiK9NfNcH+y93Ed4A1JzvLkmnOMClppbV19R+iQFSQ2tNASwAAAABJRU5ErkJggg==";
 
//  more icon 
const MORE_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAMAAAANIilAAAAAQlBMVEUAAABEREQ9PT0/Pz8/Pz9AQEA7OzszMzM/Pz8/Pz9FRUU/Pz8/Pz9VVVUAAAA/Pz8+Pj4/Pz8/Pz9BQUFAQEA/Pz+e9yGtAAAAFnRSTlMAD5bv9KgaFJ/yGv+zAwGltPH9LyD5QNQoVwAAAF5JREFUSMft0EkKwCAQRFHHqEnUON3/qkmDuHMlZlVv95GCRsYAAAD+xYVU+hhprHPWjDy1koJPx+L63L5XiJQx9PQPpZiOEz3n0qs2ylZ7lkyZ9oyXzl76MAAAgD1eJM8FMZg0rF4AAAAASUVORK5CYII=";
 
 
const REACT_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAd4klEQVR42u1dCZgU1bUuN/KyuDwxL2I0UWM0i9uToMaocUmiRn2+p7i9aNxjVNyIaFAUEZco+tQkLggqPlEU1xh35KGoiDgsM91dVT0DIiKCC4yiw0zPVNV95/y3WKbrVvXt7qqambbv99U3Q9NTdesu557lP/8xjHqrt3qrt3qrt3qrt3qrt3qrt3qrt5RaVvQzMoXdDEsMN2zximF58+nnMsP2PqXPPqLf3zMsdzb9nGiYzlDDFL80zLYBhhAb9Lp3scXG9D570s+LqM+PU/9z9D4f089VdHXR5wW6VtC75Q3TfYTe5ffG3PZte+W7pNIWi6/TIOxPg3UPDdByGhyPLhFxdWJQbXEbDfSRdO1gtIiv9fh7zBSbUL92oesUuh7HpJd+F/7/z+jdJxh5sV+veI9UW4P4Bg3WBTRYlsZgqa42uqbS4A2nRbQ37pd2m9u6GT37V0azuJHeYx69j1P2e+SFS3+bpfucZTz/VVkEk0nk5dxR9OKfVDDxxVcH3WcO/byJJmJ33Dv5xbsRJJct7iJRnvfFe7XvsYTuM+SrsQAyzrk0aZ/HMGhrxalFEsEkaWKKK41G8c3E+t4k/pWeRzteLMDii+8dBI3Jp4bZdXhtTz6flab3YeggmFgYU2kiH6KLFCXvVdpln5SxELr8yTkogb4fiZ1qY8d7WtLJdGfSe4ynazRd10plNuL9LdFM+sC3a3PyWdGxxASFyKSJ85bS538OPcszYlcjJ66m782AkpWHRu1F7CZeSH8hRfF7VR0L/LeNYjuavNtJe/+ihFLXTs99n66n6feTjLlis1DLhyUVWzrBd2inRXMtWQbr194C4F3JJlBw8BaRiXe81kRlxbdITB5BfzMeIt/CQgjbTZ2ka7xkZLsONaaJf6lowea6DiNN/WVYIOGLjc282TSpY2hh7knP2rDkvQV9xxTnKvQglmIN9J4/qT17n0Ug28TdJ4nObvcaY+byTcpWxLK8oNwxdB+bBt6JmCBeKMOMBWLTsmx6UwzFvcMXWBctwnn07JEknf697DGZ88W36Rl3KyTiCsNyzqdFsl7tLIC82J520nMBkWeKWfTzZxXfdxpJhJw4mO5xLw1ka8Sx8Bk960Ej27GDxmL9Ho4qE/cL0TXgqPobHU37VG7D0wRb4hCc+93v79KmeNCYU0u6ANvLlrdA4dj5a9X2L+8U1s7z4gS6Z3PkkZAXr8FvEGqhwCs5Bd8NV1RN2qFHQ6JUu0vfFv3png8HFi4fA7YYVBuTz4Nki9N97Xld0byUfv4udjMt5z3jHwlqaWC5OSzI4smzaDfbYnborud7soL3MUmdeKXjUEio7guAjgFxTG0sgDc+2Zhe5gbFoGaMpsIusT9vJGnQ8MeLdwOLbu3im0//P5gWQT8obVD26DxXSw6Hdv1CWjQX4t5xt1zXwXT/BQqr4iLoOjWgAG5J2v8kxQu+mpjTRiqJh9LATqMJ7AiRBIvp5xlG1hkcoex10N9Pp8k/AopsIo6xVdvQcxoCEitPx+PCEFOyT7XG9u1osKcHdxUpZUk23q2NYg84X9i+Vk4wonWLQia/QMrYkzTxgxK1y1kCmd5LCj3gCRqjAX1/ATSJH9FqNoODS2ZhKq5nsQ1iBeX57F34+heKbVOyksYrjqs36NquNty/dsD9yR6vC1PrwwzxdSPrnhd6HBTb9xysSjKmEPQ7XOvjBdbVU7L0c6e+vwDYSRIM/nA49+RU+8GeRtM5g/qyMtJ/nxd/1vLmxbtJ/qQ4phYZLeKntSABBtLLKDyA4vhU+8E6AbuFOYQbbuN/KN3SkzdIeYzODnpJPUZE7dr3FwB7+gKOFe/L1O1cdgBJbbtUWLYFZmGarUWcrnCTLydptFutSID2gATIOcelqIju4rud9ZRA07UA+khvk9TwApA6wMqADmA66egADau+RxP6WqiTJwzYYXkNtAh27rkjQNTMEbArvcyyogFehXBo0o0Bm6b7aEg41wNmwHTOVXoMeXFY4nkyI7+T/PHkXByQkqa3OLUFmLAn8Cf0IgsUHrbhyTqgyIxjJI5F+kZwcguG5Y4zlohvACsg0TptIaie24yGMkLJlUmAqwPYBvadsA+lz7f5YgdFkIV35K0JKlWMPjqVJn9xiHv3cZr076+jIA6giR6nXAQM2siLIYCxJ7cA/hqQUqY3i97jB7UgAegM9qYoXMGPJPbMZuQbZEICO9Po2XsEPYaFHxs5958hoeBmEtO/RQw/mWPy0QCoxXRfos2zTd9fAHyGWu7DgfOXJyIJLDyDKi3vdUU42AM6KC8ODvXt58RetADmKkPJDPtqEVvHr6Q2bET3/z/FMyfSAvi3vr8AWkgRy4ubFbuqgT7/bqzPYg+e5T6hTNJgXcAUJ0R6+eAsEocG4vOr4wM59+XYFy0fP7Z4J2iK0hG5IGHdIx0zDIkUQxUDapOo3jvewXRHRNj2I8owXc8OBZSY4saYJeTP6L5mcME6wxILQafvDHJOpB3YFsiGicsdzDvXFL/1befiSesiqTCpgnP5DqU+gIRP5+jYQsS2OApw8mJFNW60VI82YAKLTEF2DnEuQDxK348BMJFh3OKYv43nZ8Ru8EpKl/Av6PjZF4mZ8toXn/H/8Xf4u0hcVaKEWDK8iShnPGNzkQ9oXbfP71OfDqudBcADKuPb69q5DmDRCzUx+3x2M1x7JimVHCZlZa7JOYkG7xIS788oJIz/HK+FvvOqTCohvcP0mnyRawORK1G5Nj7j/+Pv8HdN/I0d4kFkr92z9J3LjKxzCv1+IH22o9FIShv3UTeayBFKNoeDWIXq0NK90hIwxaOKgXyumz3OjcGanCFki62gleecc+h74+h6libkZQnz8t6Wk8Y4Azh63Fjz9PRT0VbByylzD2ZKbd57iX7/Jy3Ku+jnH4AoamgbAExCsRkpLaQnFFLrH4bZ/v3aWQDyjB4T0M55xzHpQ4PYggZqd5rwy+mz1+l778GJIwf3c99J4vXAJFe+OCTAg6wJTntjt663EAuYkz5m05HFeD8ZKZ2pWFh/rz3OAN4NxalQ0t/e1yY3rsv1j62OImuFdCPnT7Ux6SzO36AzkX3apnupAhqWzO5j4gXpWevypUfBH+h2/1rli++1lwSt+P/vdfh/04l7ROUZxH3JTTKCxmx7eWz0vVmXZziffTlxDon4m3zvWmeM4tUL8daRYokUtLFI3WIFK+fd4oNCr6e+XEe/jyar4Rr6vfvFn/H/me51+C7/Df+tKW7DvSzvHqmHKPMQw/tU2dUOxTWPINGpUHp7vU+Az3n2XcvY9jh4t/IV0KZ0Pws7oQPkOS8fWvwEhHClJPEUkK5piP8nkcDBMDFGGJvilZB8waW0eJg84gFo8Uh5h6lbLYPIKrrvVOgF7DexRP/elTgK/H0759DfBfeuFGFuRRNu0oAhC8d7mqTH+b559XPY5mxmsdacF+cpc+vz4iPY88nrMvso8A0e+mRS32Qff0SbYSD6zpk/eWY4c19EjF+Gp8uXFFLyfICNYNIR8fbK/j0/8RnSZk3vRcl4VY2Id+fAJcq+b44d8BGi4gtglCxn6gSTKBxaMFekcmbyMyz3csVR4KFvKiQv+wUYe8C4AiaOkI6nWVUcgR1IIzdJ0s76cst0J54BFBmgfCZEEjR077ALTL7kzVuhUHyWIFM2qrHDyBKjFLoEp1O/kip4gs9kU0xRSDo6stxRJZ1bvBBs0aiw/xk6t9xXQF09SeEx3dwNSMEXScLZeRXPhyt1REi0LGyl2tIxAj8AA0TPVQdZnP+MtCb4OAhCuj3oAzlxUuoSkJ+p1kVsUtgOjDynpTtaocS618NtjeOUHUpMOaNpJnOKGx9BvDhj1xE4Dm7xmezltc4qyfkzkTp0FZg8Jq+jweJeSrftE6HPX4Adc38IZOteKEbp+zX60/vdqwSVWtTXqFAuB5rUGMS18QXGMzaLYyD1TO8f/qZzNcafORDOoHHfPA47fn264QE08Y/5yF4vQmN3wNtjiysRmYtiuLDdF5QMYWH4gCwNhErq5L0FRqaz53zmrLfkA3hHyUiSDcl7kMyiy5T4iDDrhd3ltjgWLKlQBCMXggdIOZutjHyqWBpwHN8S/02T/24JG943gZj7VvxQi7VTsnmoYu0XKhbhBn6enGq1D0/E5CtHEZY8xyqHTlbJA5wVJ4YcgRdrzMmmfuTzSg2uRcY+ZpANVVHoOu9e4duwUbt+BU3m78umYmNNWBm79+YEd5k7XG3zuwtpBsp/sbG0sBtXbY3EFMnfNxq7i6VPRYQMHOcg01U1Phkaw+BunqpYLB3lwb9oV0vG1Rvofu0l9LBO8BiXYeZs7qNUI+xRzqFzb68Y0rUQUOy7FebcCugMqxtz9FnuSoWkIB2i60B9Jw7pIDkyz3JiZDD2XsQvyBDtxsLOZXne4K9QwM+ZW5C187WTv4fvwyhezI9VzHfMYFZmH5fo5Qi2NDKTOVRdApwwAB6nMJEPJk7vaaOJNfYqNM2RtHNzzlEK8sUCmDF4dXM0zBZ3Ku1tVr50ny/5Ac4pi54WDimyVjK6qFxYKeOV/glLjJVmIVjBrldkAZMS6fyuqoTUbLYf3fs0eELDF0EBrvBQJlILjFXXhZh4HkQ2m4BxZcpwvoB06hSLrHfg9ZPEkgsVDNst2mAJBKGgqbdX5I/nv9X1L8jQbrPSPLPEbxDft8SbwUVCxx6f63E09kCyTyAsBV6ST10BZ1vAxpd898vULlqXnRbHxUqVAo8aieRijRYaLOMCsKMKChTRVVriEn57d3woUkgvMkd/S/fQkQQSxDIiILHYjjfFBJJ4wxR6jwfy6ZKiuSyT/WuQBnmQZKn0tw+CcynTt95RYulN9x3SJA9KhDQBRImoElIUJ8dArVB0Xg8qJY+PC0PSvSqpTXChFkCDz/ggwIMX0mf+OxUtdmQuHZVAGH5DkFszp6FqTiU8b6fVk7AtiJiVYh9p0r9OzIxiDJ0pJmsGRwowf3TsWojCwMKqJkY/H/fUWtTu5ZpHjgd9Kolkk7UL8r/oOWpJkAc590aMqL3AyKvMGNChnmIk3aT7crnGYL0NcKmObc4vFztQg+6p43NoIWlqK8764AR8BmqY5D2WQ5R6HS9qsJAxTk3No3dfKk6WjPiBnxnjRYrhnBilHbOw3DkJoHVmax+DvFisEvTyTDSdBiu4AJr6IWU/cs5JnE2zWLHaW7vZr8lLgRsDCl/3/tiG1b6tttlneZ0JLICCtlk4T3wXTq2oAliMVkoL2GGKH8K0DfZjsgG6lqCP/bGUAys7UgdbI50Y+i97eGJ4PY5x6DuH/hjJXp42+4cpnlIc8wsNJcbNFJem7le3Ya+rFLDWsoAelnNacoBNcaq+c0b0C2Uvt9yJqcO6bPcyxQIosMbcrlgAI3pgAdwRMugfgdRZ/z4nJygB9HmNuM+muzTE0/hC6gUjUaYmMLZthtr5Q4phupO/nV88UoQoK8PKuNdBiS0A9odoD7gzNMKsXIn4QbpjrAKzmgZAhioOnUyKZ5SNiFyEEujmtNky2FVtqwIz1V6k1eu6wYGODglhr8lYFg9o50VWv/v3UMZ3EFPJI0Ch6uRTqXSQHVHSexZRBQyK6pXaZqBk3IhbAkzVNgPZJRy9CNkMzCMjOemGQlviWfVRxHUKc1370VnVFBIRG5p4B5mMoXQVUQ5GvQXCx9Jn73p0z9NjXwB8Tx3FrQl1hN/S8G62I56fdIm4sMXIyTp5scVqOrXzQlzB74EMIbnd358mf5J2IUaYgxqTYKPW31sxuoJnAJugExaWcfcOPVeweBU4heQm/2S/UKUCUCPOWquIMh2ZDY+gq+hkhjp5WCLBILPrVwqgqSurcini9+wObhIDNaTA+uADspQBpXKv5aTQnaC1U7lvMnVdVRu4OZAlJAEop8XucWUfP0f8ZDjdU8Don+u+oFm0ceBAXT3DA1GCJU6MlUVb4vyvUIRPW4HKscV9QQ59hINHaIWDJexsVCQCqLTd3woX9FyN0i1h4WD5DvcCMxmEjvHkPGi8GyMbaeOybyIT2/aWhszlfCPDZ3+xJGVlwRaXhewaPg64ZOvl8tyIKQZgKpQ1BkjkkAH0G+WClDtpoOYzmICBRXJrRZPPCzTz5Xc0j7OBoYAQjqhyRTNzTUWz7vF5TiGLZfILO9P9xtBzVoVmHlvignDHGhM1MGwpPM2rAP8xF2usLkCxHly2QeRKAaVa+LiREmKsYke5gDzrQsK4uCQnnZiKOH24w2cmveNR+Fu9F1oPfQqCWxxagGPXWFOcOBuEwblgMKumQhj/bc45jfo9PRISxqHqktKsZfkm0E6jSqpgVVOnK+WxAz+v+3cFhq4VIJFukUJFEENy/pVH584AVskkNkXNI4jjZSoWZrlgV7Nrfy1Q6GKxORJEgxZXU8WoIMRR6BgpCQp1hhjLyimDk4UnqwQsHKCLQWX7tWWmzxLFJGQCO1umoqm4ABZUvGMY3bOIRHKDGICLs2iqoWRRg088pUtdJncEv1uuVGWl1HYvVQbzuivxBUiziuLIJhI4wgswrsa8sTeRCZ0YYDBSS1s+VjmpOecSpWNHZhypnn9pjyaGCJh9l4QWnVBZTlwEwvIKinF8uOTzOMMYoV1Q3C8vYT53wNZnmH3FYyRpzA6C8lJqpbG4s5hs2TkFykhUsIPvp8LkFzOGrRVzg9WwblQAHdhjC6BZ7E7vMl/5LrZzbITYnq5MjQtLp2MJxcdXDlZNs3+EeRFz8SnyLlBxJI6oI59jeV7p3hIN50YbKnRISpYTjJeKzp33xVZK2DInQIaadK2b+cwbQsGoOb5HkkNZq2cFT/IJFe/+ByOVLUn7okoPO7ObdMl27knjPlwmxsKh06VhvUxHcujr1L+Yfcr9QGzAWUOlySBWpyQtQeiT0S+cEs0iMS/OCun44EhRy5G4oNPITw930k8P5+pipveBYic24zyP0ouYA1GlA3G8Acoqn+3u4z6HQJteejhtTs4vZPBqosci+wvyKAf/hkbHPN80Wk0OkQt58SUwQUs5jmwQOSkIIkS6BBHZjh1AGBU0+7pAMlUKwIKcCO9/1aYaS1myKLSZyVCB7W9Go9gp3WLTLBEkaVGzH2zwqvC4PQFtnE0h1sbD06R37nGKGO6fKS5WiGPJIays9IVkzn7YPJzhy3D4nBhTxXh1wrlluk9Ll25PkkaxC9QSRyOwwbWBKuEKgo8c/v8svdQdWFiS0HlPMIiycsjpTFIpPROxAiVJVNd+KSz8QQoPJZvEK+goOh/BNRbjTPbA/c+Ifeg6AuwfHCcw3Y81g0Vq5Q5EXGAS3droVQ0mStevUWTJZlqzqkAZriRvxKKYD05hy70FbkwOUcuMGoXE8aZFElNU29h/Idk6hFIXYbvfdK9FTSKbjjuEudeI88rp8nJuFqwjnLDKJXh60vTVsI03QtoRR7nkmT1LS3vVJZuSu6crJNuFWUoe8xXV/wEvEfMKStDLaPRHBoiups9GIjcx71+yctcofIeriFniBuTtWSCavM3Pmn44ogSdW8I8K5MjETUE7gZpRk7sh+OxV/ED6jSutCUXwyH08/aYwrM60sPxXdbdaWK7U8O2+b6NNv/3YsrY7nSx2qxdVV+dUBAZxsX2v+jNu708cMI5SnKEr/blKjEYtncPFMaaaay8WeJmRRAmAyYsBGnce4CTk6JviZ+buKqHagHExWncLgNcPmU88vHcR4yMczy0d5TUo38HJIv3Ily+NdNkYcbHFNr/s90KI7C4Yw9bVuyAqJx0fT7us5FORTk4STz9rkQNaRFVJsjsDUq8z/1Fm6FFPIMUYFk0gpXFnHszSKEY38A4CqGw06Wu0RFAQXMpm5ppsoD0DAX37Z1aZdgmky4hI3Zb+2fjkfAocrKD6d5E1wsRKFw22WYCaGJzSRhU92jxI3jv+otpPj6TpWQaZdkY5NBnQiRQAchj1vhZSbOcwdS3nwOL+IHoD4tIV2GzndNhwgaZPI6pnQWQ7ToEANMgHm5Y1fdmqTEPCKKwolHz/XzBQXBHszsblUXFAWD05KtF/BKfse+hWewF/r9s177UZzVOkhcJo6nj0Mq5H5L2prs1w5VFpiVJ/ZpmY77BQHl0lISJZ5UDCt51GN13mTIJw/YmVdDnISG+jFagqONyu3JehCqTmI+PAJdPX2zSdXqZInhhYVfG+6xwYoise5X+kdW5V6i3jsvRT44xr0/yM72mMDEfjhUs2mNtLooj3a4Qo7NipzoXcBVPVlf1QNDkxJJilbVvW7wXwuph4oyP30R+KNhnro5G0qHvn/9iS9o1kxW4gSmx7qS1Lukt6OyeXlHxaI45qJG7AosiLvSu2hIoBBI31xA59e3zf1sARIIEig8k9kw2oWyvKYTlVF0+fj6KPt6qQO0KaXI6Zyfmis2jOkp7UV+XGZnCrrWwAHakHZlRmFF/SVTvyDqn+kGjIIoox76FdeBn2Y+/hXRuxiwEiRwLoLDRSQ6pfAEcr4DcdfQo3C1GJ9DOioloT5whi8OytnuNckdjcN1xsNf5GJJZUcvUx4Z4kiY/2bM4y7GSQD89o6lr/76/ADieX0z6KAMvpyX+bHDzw9XaGQLbvg79kztflQ0112js3DsFKbmPEiepTOHqe0fAQNQLKs73z4njUnk+WMPgJApx5SpLzgu4d9Pqo/SUBlHPzeLovhcCDkqAQQqK1C/p8/9IcRHuUmaVrs8QvUwrFMuMYcpsaDG4BhZA554KxepLw+w6ItV+NKNQ02yNAE8bOInSrNQpjyHVAjim7y8ASaPuBJwyuQRIkqMayrtwTALI5HCwJQpGlJNDF4uivLc6V0LUgA7QwgzaRenKSB4RJ6TeFw7LqvwD65qnWXFp6kEYhtmrrJUWcUDftwKY4NlyP1VYAWen1gcWo5w3YImMFiSLYxeVlnCpTEc5MeAHsGrFD8DVMKyicCecMe7VqTyfcwW4cpaM/esDPbhquC41XfUL4JKAJ5C5fSwNUqxe3ziv0PTeCvLkufelMLD9/XpB70fAtpZHlIx5CApa0oqY6d6t4A+aUxuwMIaDceHJ4MBPTTSTh129gHSDK8cL8QGMowk+NaK4RDsYNpnMqqEhmbQryYQyJdBHhpTNq7AqWy9TAjfx8flBVE1cxZJUdr+EiX0Rkj9QoGePAYfQWBTIPNKPvoUxojQj4zYJSbBWMS0yld1bagMQIgs/n6kwBT8EUiju1ugwl8BHoWhiiUwa3W1wuY8Z0rjNUAvBW4PXv39hvOypILcuYvSCDuKchfJ6NdGY8SuohLG2fXssDheO/i3gqKOYUILSZjGo8MPsfMlyMj2yVK4lZuN93oih0pdMnLmL+uUoahQdbNRMY7Inzu8LnHOaVcDCGkfyWMlkACXvXis0B89DUqXpnFwSy4fUb29SaO291bWSkTZGZlo12MBs1y/oqJqnSAx5pjbQQGtdnVw84doAMFSmZV1T0Vk3p20rmvw/yMTRiKqgMsl0EtC+um0R2D+uKGE6FnxW0MtogZevyywEVG5MEHsIBrSr0s31T8clrGL4kFE3TgfXhYcBYCKG+Ykin0SzjNO9ubp3JanUbKEwvyDzEVhR9GvMjQRe4tFweulk7q4u1ClpX4rvmUNKec01WczxfsX5KlOrM86w0CQRlhCcQmaLiX5SxxeRKWPA1XszwNBZjak5bdqGPg/fvQrpVYwtWAUq2Lx4hHSJY0Nz+3hnsx5iKwEoBVROEbWSDxCcyJ/SmfdhxG7ifPqnkI5turfSoE/0K5p2lMcrIG5Filmclgy7a01Qrerm+q8ycu6bPtvpKMN2R9M10WfvDjuuFhlN7dsbNd1wbpdRyVvXdYsd5b1gZDqTE58oB+fe6TOEFGJ+h1YssppvApU9R2oUidDb8dJn/iQKOsVZhDlKoZVm7X30HgvKkAhRk/8RAlBfmdYAxsuLSMznKyZdsIDTHwcFspGUvLSBE9bK/rQADvepX+0K09glFX/WGZJa/aBe06QT5EDfedOqRTnHWbOmeB5cQQw1S5IPSLetEJsC05cTf0S6u1WSwnX1xH8OzyLH/NNgN+u1bmJmEuUMGFlm7SkwhVlcb89bCsIIU0yBQphlulhOpARXTu/TkmWxqo1l9BMcy3caObJEQODIFDRITVuEyiyWuBxJH+yR7POQr3qrt3qrt3qrt3qrt3qrt3qrt3rrQ+3/ATxSgu3z5tTfAAAAAElFTkSuQmCC';
 

