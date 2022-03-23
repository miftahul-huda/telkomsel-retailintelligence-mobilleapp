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
import ImageInfoEtalasePage from './ImageInfoEtalasePage';
import ImageHomeEtalasePage from './ImageHomeEtalasePage';
import PosterStoreFrontSelectPage from './PosterStoreFrontSelectPage';
import EditStoreFrontItemPage from './EditStoreFrontItemPage';
import BackupRestoreLogic from './actions/BackupRestoreLogic';
import AddStorePage from './AddStorePage';
import QuotaAppPage from './QuotaAppPage';
import FirstPage from './FirstPage';
import HomePage from './HomePage';
import ImageHomePage from './ImageHomePage';
import ImageHomeStoreFrontPage from './ImageHomeStoreFrontPage';
import ImageHomeTotalSalesPage from './ImageHomeTotalSalesPage';
import TakePicturePage from './TakePicturePage';
import PosterInfoPage from './PosterInfoPage';
import StoreFrontInfoPage from './StoreFrontInfoPage';
import EtalaseInfoPage from './EtalaseInfoPage';
import EditEtalaseItemPage from './EditEtalaseItemPage';

import WebPage from './WebPage';
import TakePictureBeforeAfterPage from './TakePictureBeforeAfterPage';
import BeforeAfterPosterHomePage from './BeforeAfterPosterHomePage';
import BeforeAfterStoreFrontHomePage from './BeforeAfterStoreFrontHomePage'
import EditTotalSalesPage from './EditTotalSalesPage';

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

    Text.default
  }

  componentDidMount()
  {
    
  }

  render() {


      return (
        <Router hideNavBar="true">
          <Scene key="root">
            
            <Scene key="homePage" component={HomePage} title="HomePage" initial={false} hideNavBar={true} />
            <Scene key="imageHomePage" component={ImageHomePage} title="ImageHomePage" initial={false} hideNavBar={true} />
            <Scene key="webPage" component={WebPage} title="WebPage" initial={false} hideNavBar={true} />
            <Scene key="beforeAfterPosterHomePage" component={BeforeAfterPosterHomePage} title="BeforeAfterPosterHomePage" initial={false} hideNavBar={true} />
            <Scene key="beforeAfterStoreFrontHomePage" component={BeforeAfterStoreFrontHomePage} title="BeforeAfterStoreFrontHomePage" initial={false} hideNavBar={true} />
            <Scene key="imageHomeStoreFrontPage" component={ImageHomeStoreFrontPage} title="ImageHomeStoreFrontPage" initial={false} hideNavBar={true} />
            <Scene key="imageHomeEtalasePage" component={ImageHomeEtalasePage} title="ImageHomeEtalasePage" initial={false} hideNavBar={true} />
            <Scene key="imageHomeTotalSalesPage" component={ImageHomeTotalSalesPage} title="ImageHomeTotalSalesPage" initial={false} hideNavBar={true} />
            <Scene key="takePicturePage" component={TakePicturePage} title="TakePicturePage" initial={false} hideNavBar={true} />
            <Scene key="takePictureBeforeAfterPage" component={TakePictureBeforeAfterPage} title="TakePictureBeforeAfterPage" initial={false} hideNavBar={true} />
            <Scene key="posterInfoPage" component={PosterInfoPage} title="PosterInfoPage" initial={false} hideNavBar={true} />
            <Scene key="storeFrontInfoPage" component={StoreFrontInfoPage} title="StoreFrontInfoPage" initial={false} hideNavBar={true} />
            <Scene key="etalaseInfoPage" component={EtalaseInfoPage} title="EtalaseInfoPage" initial={false} hideNavBar={true} />
            <Scene key="testPage" component={TestPage} title="Test" initial={false} hideNavBar={true} />  
            <Scene key="loginPage" component={LoginPage} title="Login" initial={false} hideNavBar={true} />
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
            <Scene key="imageInfoEtalasePage" component={ImageHomeEtalasePage} title="ImageHomeEtalasePage" hideNavBar={true} />
            <Scene key="posterStoreFrontSelectPage" component={PosterStoreFrontSelectPage} title="ImageInfoStoreFrontPage" hideNavBar={true} />
            <Scene key="editStoreFrontItemPage" component={EditStoreFrontItemPage} title="ImageInfoStoreFrontPage" hideNavBar={true} />
            <Scene key="editEtalaseItemPage" component={EditEtalaseItemPage} title="EditEtalaseItemPage" hideNavBar={true} />
            <Scene key="addStorePage" component={AddStorePage} title="AddStorePage" hideNavBar={true} />
            <Scene key="quotaAppPage" component={QuotaAppPage} title="Add Quota App" hideNavBar={true} />
            <Scene key="firstPage" component={FirstPage} title="FirstPage" initial={true} hideNavBar={true} />
            <Scene key="editTotalSalesPage" component={EditTotalSalesPage} title="EditTotalSalesPage" initial={false} hideNavBar={true} />
            
          </Scene>
        </Router>
      )
    

  }
}
