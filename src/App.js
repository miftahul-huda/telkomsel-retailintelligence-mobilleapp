import React, { Component } from 'react';
import { Router, Scene } from 'react-native-router-flux';
import LoginPage from './LoginPage';
import MenuPage from './MenuPage';
import CameraPage from './CameraPage';
import InitPage from './InitPage';
import UploadPage from  './UploadPage';
import ViewImagePage from  './ViewImagePage';
import ImageInfoPage from './ImageInfoPage';
import UploadHistoryPage from './UploadHistoryPage';
import TestPage from './TestPage';
import EditPackageItemPage from './EditPackageItemPage';
import EditPackageSubItemPage from './EditPackageSubItemPage';
import ProfilePage from './ProfilePage';
import ImageOrientationInputPage from './ImageOrientationInputPage';
import SelectStorePage from './SelectStorePage';
import PreviewImagePage from './PreviewImagePage';
import BackupPage from './BackupPage';
import ImageInfoStoreFrontPage from './ImageInfoStoreFrontPage';
import PosterStoreFrontSelectPage from './PosterStoreFrontSelectPage';
import EditStoreFrontItemPage from './EditStoreFrontItemPage';
import BackupRestoreLogic from './actions/BackupRestoreLogic';
import AddStorePage from './AddStorePage';
import QuotaAppPage from './QuotaAppPage';

import { Image, View,Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, ImageBackground } from 'react-native';

import { openDatabase } from 'react-native-sqlite-storage';
import ImageCropperPage from './ImageCropperPage';
import { WebView } from 'react-native-webview';

export default class App extends Component {

  constructor(props)
  {
    super(props);
    this.state = {
      updateApp: null,
      message: ""
    }
  }

  componentDidMount()
  {

  }

  render() {


      return (
        <Router hideNavBar="true">
          <Scene key="root">
            <Scene key="testPage" component={TestPage} title="Test" initial={false} hideNavBar={true} />  
            <Scene key="loginPage" component={LoginPage} title="Login" initial={true} hideNavBar={true} />
            <Scene key="menuPage" component={MenuPage} title="Menu" hideNavBar={true} />
            <Scene key="cameraPage" component={CameraPage} title="Camera" hideNavBar={true} />
            <Scene key="imageCropperPage" component={ImageCropperPage} title="Crop Image" hideNavBar={true} />
            <Scene key="uploadPage" component={UploadPage} title="Upload" hideNavBar={true} />
            <Scene key="viewImagePage" component={ViewImagePage} title="Image View" hideNavBar={true} />
            <Scene key="imageInfoPage" component={ImageInfoPage} title="Image Info" hideNavBar={true} />
            <Scene key="uploadHistoryPage" component={UploadHistoryPage} title="Upload History" hideNavBar={true} />
            <Scene key="initialization" component={InitPage} title="Initialization" hideNavBar={true} />
            <Scene key="editPackageItemPage" component={EditPackageItemPage} title="Edit Package Item" hideNavBar={true} />
            <Scene key="editPackageSubItemPage" component={EditPackageSubItemPage} title="Add Sub Item" hideNavBar={true} />
            <Scene key="profilePage" component={ProfilePage} title="Profile" hideNavBar={true} />
            <Scene key="selectOrientationPage" component={ImageOrientationInputPage} title="Profile" hideNavBar={true} />
            <Scene key="previewImagePage" component={PreviewImagePage} title="View Image" hideNavBar={true} />
            <Scene key="selectStorePage" component={SelectStorePage} title="Select Store Image" hideNavBar={true} />
            <Scene key="backupPage" component={BackupPage} title="Backup" hideNavBar={true} />
            <Scene key="imageInfoStoreFrontPage" component={ImageInfoStoreFrontPage} title="ImageInfoStoreFrontPage" hideNavBar={true} />
            <Scene key="posterStoreFrontSelectPage" component={PosterStoreFrontSelectPage} title="ImageInfoStoreFrontPage" hideNavBar={true} />
            <Scene key="editStoreFrontItemPage" component={EditStoreFrontItemPage} title="ImageInfoStoreFrontPage" hideNavBar={true} />
            <Scene key="addStorePage" component={AddStorePage} title="AddStorePage" hideNavBar={true} />
            <Scene key="quotaAppPage" component={QuotaAppPage} title="Add Quota App" hideNavBar={true} />
            
          </Scene>
        </Router>
      )
    

  }
}
