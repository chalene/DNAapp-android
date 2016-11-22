'use strict';
import React, { Component } from 'react';
import QRCode from 'react-native-qrcode';
import { 
  ActivityIndicatorIOS,
  AsyncStorage,
  Alert,
  NavigatorIOS,
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
  View,
  findNodeHandle
} from 'react-native';

import Util from './utils';
import Icon from 'react-native-vector-icons/FontAwesome';
import ActivityView from 'react-native-activity-view';
import ImagePickerManager from 'react-native-image-picker';
import Form from 'react-native-form';
import CheckProfile from './checkProfile'

// Configuration file
import { url } from '../config';

/**
 * verifyUser
 * - FaceVarification
 *   - IF null THEN uploadface
 *   - ELSE verification
 * - password again
 */

export default class extends Component{
  // static defaultProps = {
  //     isValid: false,
  //     onFaceSignup: false,
  // };

  static propTypes = {
    uid: React.PropTypes.string.isRequired,
    //isValid: React.PropTypes.bool.isRequired,
    //onFaceSignup: React.PropTypes.bool.isRequired,
    showSpiner: React.PropTypes.func.isRequired,
    onFaceSignup: React.PropTypes.bool.isRequired,
    data: React.PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.showSpiner = this._showSpiner.bind(this);

    this.state = {
      isValid: this.props.isValid,
      onFaceSignup: this.props.onFaceSignup,
      showSpiner:false,
      idFrontSource: {uri:'idfront'},
      idFrontSourceData: "",
      // idFront2Source: {uri:'idfront2'},
      // idFront2SourceData: "",
      // idFront3Source: {uri:'idfront3'},
      // idFront3SourceData: "",
      // idFront4Source: {uri:'idfront4'},
      // idFront4SourceData: "",
    };
  }

  componentDidMount() {
    //StatusBarIOS.setStyle(1);
  }

  _showSpiner = (showSpiner) => {
    this.setState({
      showSpiner,
    })
  };

  _submitVerify() {
    if(this._saveChangesVerify()){
      //this.closeModal()
      this._loginSuccess()
    }
  }

  _loginSuccess() {
    this.props.navigator.push({
              title: "DNA档案列表",
              component:CheckProfile,
              navigationBarHidden: false,
              passProps:{ uid: this.props.uid},
            }); 
  }

  _saveChangesVerify() {
    // return true
    // SSH post: this.refs.form.getValues()
    // const info = this.refs.form.getValues();
    let valid = true;
    // for (var key in info) {
    //   if (info[key]==="") {
    //     valid = false;
    //   }
    // }
    if (!this.state.idFrontSourceData) {
      valid = false;
    }

    if (valid) {
      this._showSpiner(true);
      Util.post(`${url}/check_face/`,{
         // images are sent as jpeg base64
         uid:this.props.uid,
         id_face: this.state.idFrontSourceData,
      }, (resData) => {
        this._showSpiner(false);
        if (resData) {
          if (resData.error !== "true") {
            if (resData.valid === "false") {
              Alert.alert('验证失败', "抱歉，您确定是本人吗？");
              return false
            } else {
              Alert.alert('验证成功', "人脸识别通过 欢迎回来");
              //this.props.navigator.pop();
              this._loginSuccess()
              return true
            }
          } else {
            if (resData.valid === "false") {
              Alert.alert('验证失败', "抱歉，未获取完整面部特征，请重试");
              return false
            } else {
              Alert.alert('验证失败', "系统故障，请稍候再试");
              //this.props.navigator.pop();
              this._loginSuccess()
              return true
            }
          }
        } else {
          Alert.alert('服务器无响应', '请稍后再试');
          return false
        }
        
      })
    }else{
      Alert.alert('提交失败', '请拍摄您的正面照');
    }
  }


  _uploadFace() {
    const options = {
      title: '选择正面照', 
      cancelButtonTitle: '取消',
      takePhotoButtonTitle: '拍照', 
      chooseFromLibraryButtonTitle: null,//'从手机相册选取', 
      cameraType: 'front', 
      mediaType: 'photo', 
      allowsEditing: false,
      noData: false, 
      quality:0.2,
      maxWidth:322,
      //maxHeight:,
      storageOptions: { 
        skipBackup: true, 
        path: 'images'
      }
    };
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

  render() {
    let content;
      content = <View style={[styles.orderButtonContainer,{paddingBottom:30}]}>
            <Text style={{color:'#555'}}>请取下眼镜露出完整五官，正面对准镜头，拍摄全脸照片。</Text>
            <TouchableHighlight underlayColor="#eee" style={[styles.btn_if,{backgroundColor:'#ddd'}]} onPress={() => this._uploadFace()}>
              <Text style={{color:'#555'}}>拍摄正面照</Text>
            </TouchableHighlight>
            <View style={{lexDirection:"row"}}>
              <Image source={this.state.idFrontSource} style={[styles.uploadFaceSingle,{margin:30}]} />
            </View>
            <TouchableHighlight underlayColor="#48aeb4" style={[styles.btn_if,{backgroundColor:'#1E868C',marginTop:20}]} onPress={() => this._submitVerify()}>
              <Text style={{color:'#fff'}}>提交</Text>
            </TouchableHighlight>
            {this.state.showSpiner?
                <View style={styles.showSpiner}>
                  <ActivityIndicatorIOS color="#000000" />
                </View>:
                <View></View>
              }
          </View>

    return(
      <ScrollView style={styles.profileListContainer}>
        {content}
      </ScrollView>
    );
  }
}


const styles = StyleSheet.create({
  profileListContainer:{
    position:"relative",
    top: 40,
  },
  icon:{
    position: 'absolute',
    right: 10,
    top:9,
    color: '#999',
    backgroundColor: "transparent"
  },
  inputRow:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent: 'center',
    marginBottom:20,
  },
  input:{
    //marginLeft:10,
    //padding:1,
    width:Util.size.width-80,
    borderWidth:Util.pixel,
    height:40,
    paddingLeft:12,
    borderColor:'#eee',
    borderRadius:1,
    color:"#333",
    backgroundColor:"rgba(255, 255, 255, 0.75)"
  },
  container:{
    flex:1,
  },
  itemWrapper:{
    backgroundColor: '#eaeaea'
  },
  userContainer:{
    position:"relative",
    top: 0,
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
  itemNavMenu:{
    position:"absolute",
    top:12,
    right:10,
    color: "#bbb",
    backgroundColor:"transparent"
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
  orderButtonContainer:{
    marginTop: 0, 
    width: Util.size.width-40,
    marginLeft:20,
    alignItems:"center"
  },
  uploadFace:{
    height:100,
    width:100,
    marginTop:20,
    flex:1,
    borderWidth: 1,
    borderColor: "#aaa"
  },
  uploadFaceSingle:{
    height:0.5*Util.size.width,
    width:0.5*Util.size.width,
    marginTop:20,
    flex:1,
    borderWidth: 1,
    borderColor: "#aaa"
  },
  uploadId:{
    height:100,
    width:100,
    marginTop:20,
    flex:1,
    borderWidth: 1,
    borderColor: "#aaa"
  },
  btnText:{
    color:"#4285f4",
    fontSize:16,
    paddingTop:10,
  },
  btn_pm:{
    marginTop:13,
    width:0.8*Util.size.width,
    height:40,
    borderRadius:2,
    backgroundColor:'#1E868C',
    justifyContent:'center',
    alignItems:'center',
  },
  btn_cm:{
    marginTop:13,
    width:0.8*Util.size.width,
    height:40,
    borderRadius:2,
    backgroundColor:'#BEBEBE',
    justifyContent:'center',
    alignItems:'center',
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
  showSpiner:{
    position:"absolute",
    height: Util.size.height,
    width:Util.size.width+40,
    alignItems:"center",
    justifyContent:"center",
    top:-40,
    left:-40,
    backgroundColor:"rgba(0,0,0,0.2)"
  },
})