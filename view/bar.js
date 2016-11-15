'use strict';
import React, { Component } from 'react';
import {
  TabBarIOS,
  StatusBarIOS,
  Text,  
  StyleSheet,    
  Image,
  View,
} from 'react-native';

import Util from './utils';
import Icon from 'react-native-vector-icons/Ionicons';
import Store from './store';
import User from './user';
import Order from './order';
import Update from './update';
import Profile from './profile';
import TabNavigator from 'react-native-tab-navigator';


/**
 * isFirstTime:
 *   -true. Only User tab is enabled. User needs to fill
 *   out the info before using other functions.
 *   -false. fully functioned. 
 */
const TabNavigatorItem = TabNavigator.Item;  
  
const TAB_NORMAL_1=require('./image/icon_bottomtag_home_n.png');  
const TAB_NORMAL_2=require('./image/icon_bottomtag_market_n.png');  
const TAB_NORMAL_3=require('./image/icon_bottomtag_cart_n.png');  
const TAB_NORMAL_4=require('./image/icon_bottomtag_me_n.png');  
  
const TAB_PRESS_1=require('./image/icon_bottomtag_home_s.png');  
const TAB_PRESS_2=require('./image/icon_bottomtag_market_s.png');  
const TAB_PRESS_3=require('./image/icon_bottomtag_cart_s.png');  
const TAB_PRESS_4=require('./image/icon_bottomtag_me_s.png');  

class Bar extends Component{
  static defaultProps = {
    isFirstTime: "0"
  };

  static propTypes = {
    uid: React.PropTypes.string.isRequired,
    isFirstTime: React.PropTypes.string.isRequired,
    onFacePress: React.PropTypes.func.isRequired,

  };

  constructor(props) {
    super(props);
    this.onFacePress = this._FaceRequire.bind(this);
    this.state = {
      selectedTab: this.props.isFirstTime==="1"? '我的帐户':'查看DNA档案',
      isFirstTime: this.props.isFirstTime==="1"? true: false,
    };
  }

  componentDidMount() {
    //StatusBarIOS.setStyle(0);
  }

  // _changeTab(tabName) {
  //   if (!this.state.isFirstTime) {
  //     this.setState({
  //       selectedTab: tabName,
  //     });
  //   };
  // }

  // render() {
  //   return (
  //     <TabBarIOS
  //       tintColor="#1E868C">
  //       <Icon.TabBarItem  //newly-added
  //         title="查看DNA档案"
  //         iconName="ios-body-outline"
  //         selectedIconName="ios-body"
  //         onPress={ () => this._changeTab('查看DNA档案') }
  //         selected={ this.state.selectedTab === '查看DNA档案'}>    
  //         <Profile uid={this.props.uid}/>
  //       </Icon.TabBarItem>
  //       <Icon.TabBarItem
  //         title="我的帐户"
  //         iconName="ios-person-outline"
  //         selectedIconName="ios-person"
  //         onPress={ () => this._changeTab('我的帐户') }
  //         selected={ this.state.selectedTab === '我的帐户'} >
  //         <User uid={this.props.uid} isFirstTime={this.state.isFirstTime} callbackLogout={this.props.callbackLogout}/>
  //       </Icon.TabBarItem>



  //     </TabBarIOS>
  //   );
  // }
  //}
  _FaceRequire() {
    Util.post(`${url}/check_face_uploaded/`, {uid:this.props.uid},(resData) => {
      if (resData) {
        if (resData.exist === "true") {
          this.props.navigator.push({
            title: "人脸识别登录",
            component:VerifyFace,
            navigationBarHidden: false,
            passProps:{ 
              uid: this.props.uid,
              //onFaceSignup: this.state.onFaceSignup,
            },
          })
          //this.onFacePress = this._onFacePress.bind(this);
          //AlertIOS.alert('onFaceSignup', onFaceSignup);
        } else {
          this.props.navigator.push({
            title: "人脸识别注册",
            component:SignupFace,
            navigationBarHidden: false,
            passProps:{ 
              uid: this.props.uid,
              //onFaceSignup: this.state.onFaceSignup,
            },
          })
          //this.onFacePress = this._onFaceSignupPress.bind(this);
          // this.setState({
          //   onFaceSignup: true,
          // });
          // AlertIOS.alert('onFaceSignup', onFaceSignup);
        }
      } else {
          Alert.alert('登陆失败', '服务器无响应');
      }
    });
  }
  /** 
  tab点击方法 
  **/  
  onPress(tabName){  
    if(tabName){  
      this.setState(  
        {  
          selectedTab:tabName,  
        }  
      );  
    }  
  }  
   /** 
   渲染每项 
   **/  
   renderTabView(title,tabName,tabContent,isBadge){  
     var tabNomal;  
     var tabPress;  
     var navigatorview;
     switch (tabName) {  
       case '查看DNA档案':  
         tabNomal=TAB_NORMAL_1;  
         tabPress=TAB_PRESS_1; 
         navigatorview=<Profile uid={this.props.uid} navigator={this.props.navigator}/>;
         break;  
       case '我的帐户':  
         tabNomal=TAB_NORMAL_4;  
         tabPress=TAB_PRESS_4;
         navigatorview=<User uid={this.props.uid} isFirstTime={this.state.isFirstTime} callbackLogout={this.props.callbackLogout} navigator={this.props.navigator}/>;
         break;  
         default:  break; 
  
     }  
     return(  
       <TabNavigatorItem  
        title={title}  
        renderIcon={()=><Image style={styles.tabIcon} source={tabNomal}/>}  
        renderSelectedIcon={()=><Image style={styles.tabIcon} source={tabPress}/>}  
        selected={this.state.selectedTab===tabName}  
        selectedTitleStyle={{color:'#048D11'}}  
        onPress={()=>this.onPress(tabName)}  
        renderBadge={()=>isBadge?<View style={styles.badgeView}><Text style={styles.badgeText}>15</Text></View>:null}  
       >  
        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <Text  style={{color:"#555",fontSize:13,marginTop:10,marginBottom:10}}>{tabContent}</Text>
        {navigatorview}
        </View> 
         
       </TabNavigatorItem>  
     );  
   }  
  
   /** 
   自定义tabbar 
   **/  
  tabBarView(){  
    return (  
      <TabNavigator  
       tabBarStyle={styles.tab}  
      >  
      {this.renderTabView('查看DNA档案','查看DNA档案','查看DNA档案',false)}  
      {this.renderTabView('我的帐户','我的帐户','我的帐户',false)}  
      </TabNavigator>  
    );  
  }  
  
  
  render() {  
    var tabBarView=this.tabBarView();  
    return (  
      <View style={styles.container}>  
        {tabBarView}  
      </View>  
    );  
  }  
}  

const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: '#FFFFFF',  //1E868C
  },  
  welcome: {  
    fontSize: 20,  
    textAlign: 'center',  
    margin: 10,  
  },  
  instructions: {  
    textAlign: 'center',  
    color: '#333333',  
    marginBottom: 5,  
  },  
  tab:{  
    height: 52,  
    alignItems:'center',  
    backgroundColor:'#f4f5f6',  
  },  
  tabIcon:{  
    width:25,  
    height:25,  
  },  
  badgeView:{  
    width:22,  
    height:14 ,  
    backgroundColor:'#f85959',  
    borderWidth:1,  
    marginLeft:10,  
    marginTop:3,  
    borderColor:'#FFF',  
    alignItems:'center',  
    justifyContent:'center',  
    borderRadius:8,  
  },  
  badgeText:{  
    color:'#fff',  
    fontSize:8,  
  }  
});  



module.exports = Bar;
