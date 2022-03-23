import { Actions } from 'react-native-router-flux';
import UploadedFile from '../model/UploadedFile';
import * as RNFS from 'react-native-fs';
import Exif from 'react-native-exif';
import Logging from '../util/Logging';
import Style from '../style';
import SharedPage from '../SharedPage';

import GetLocation from 'react-native-get-location';
import FilePackageItem from '../model/FilePackageItem';
import StoreFrontItem from '../model/StoreFrontItem';
GlobalSession = require( '../GlobalSession');
import Config from '../config.json';
import HttpClient from '../util/HttpClient';

import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;
const { QueryTypes } = require('rn-sequelize');
import * as SQLite from "expo-sqlite";

import PushNotification from 'react-native-push-notification'


const FILE_STORAGE_PATH = RNFS.DownloadDirectoryPath;

export default class Util
{
    static getDisplayDate(dt) {

        let monthNames =["Jan","Feb","Mar","Apr",
                          "May","Jun","Jul","Aug",
                          "Sep", "Oct","Nov","Dec"];

        let day = dt.getDate();
        
        let monthIndex = dt.getMonth();
        let monthName = monthNames[monthIndex];
        
        let year = dt.getFullYear();
        
        return `${day} ${monthName} ${year}`;  
    }

    static makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    static getCurrentDate(){
        var date = new Date();
        var dateString = date.getFullYear() + "-" + (date.getMonth()  + 1) + "-" + date.getDate();
        dateString += " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        return dateString;
    }

    static assembleUploadFileObject(me, msg, filename, uploadFile)
    {
        let uploadedFile = {};
        uploadedFile.pixel_width = msg.ImageWidth;
        uploadedFile.pixel_height  = msg.ImageHeight;

        uploadedFile.exposure_time = msg.exif.ExposureTime;
        uploadedFile.iso_speed_rating = msg.exif.ISOSpeedRatings;
        uploadedFile.white_balance = msg.exif.WhiteBalance;
        uploadedFile.orientation  = msg.exif.Orientation;
        uploadedFile.make = msg.exif.Make;
        uploadedFile.model = msg.exif.Model;
        uploadedFile.flash = msg.exif.Flash;
        uploadedFile.fnumber = msg.exif.FNumber;

        uploadedFile.filename = filename;
        uploadedFile.isuploaded = 0;
        uploadedFile.picture_taken_date = me.getCurrentDate();

        uploadedFile.picture_taken_by = GlobalSession.currentUser.email;

        if(GlobalSession.currentStore != null)
        {
          uploadedFile.store_name =  GlobalSession.currentStore.store_name;
          uploadedFile.store_id = GlobalSession.currentStore.storeid;
        }
        else
        {
            uploadedFile.store_name =  uploadFile.store_name;
            uploadedFile.store_id = uploadFile.store_id;
        }

        

        uploadedFile.imageCategory = uploadFile.imageCategory;

        return uploadedFile;
    }

    static createNewFileInfo(filename, uploadFile){

        let uploadedFile = {};
        let promise  = new Promise((resolve, reject) => {
          Exif.getExif(FILE_STORAGE_PATH + "/retail-intelligence/pics/temp3.jpg" )
          .then(msg => 
            {
              GetLocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 15000,
              })
              .then(location => {
                  console.log(location);
                  console.log("Exit");
                  console.log(msg);
  
                  uploadedFile  = this.assembleUploadFileObject(this, msg, filename, uploadFile);
  
                  uploadedFile.lon = location.longitude;
                  uploadedFile.lat = location.latitude;
                  uploadedFile.alt = location.altitude;
  
                  resolve(uploadedFile);
              })
              .catch(error => {
                  const { code, message } = error;
                  console.log( message);
                  Logging.log(error, "error", "UploadPage.createNewFileInfo() : GetLocation.getCurrentPosition()")
                  uploadedFile  = this.assembleUploadFileObject(this, msg, filename, uploadFile);
                  resolve(uploadedFile);
              })
  
            }
            
          )
          .catch(msg => {
            reject(msg);
            let ss = JSON.stringify(msg);
            Logging.log(ss, "error", "UploadPage.createNewFileInfo() : Exif.getExif(FILE_STORAGE_PATH + /retail-intelligence/pics/temp3.jpg )")
            alert("Error createNewFileInfo " + ss);
          })
    
        });
  
        return promise;
  
    }

    static async onSaveCropImage(res, uploadFile)
    {
        var me = this;
        me.setState({ loading: true  })
  
        let croppedFilename = res.uri.replace("file://", "");
        croppedFilename = croppedFilename.replace("file:", "");
  
        console.log('croppedFilename');
        console.log(croppedFilename);
  
        let dt = new Date();
        let dtfolder = dt.getFullYear() + "" + dt.getMonth() + "" + dt.getDate();
        let filename = GlobalSession.currentUser.email + "-" + dt.getHours() +  "" + dt.getMinutes() + "" + dt.getSeconds() + "-" + me.makeid(7) + ".jpg";
  
        let folder = FILE_STORAGE_PATH + '/retail-intelligence/pics/' + dtfolder;
        RNFS.mkdir(folder).then(function(){
          let savedFile = folder + "/" + filename;
          RNFS.copyFile(croppedFilename, savedFile ).then(function(){
  
            me.createNewFileInfo(savedFile, uploadFile).then(function(file){

                console.log("create new file info");
                console.log(file);

                UploadedFile.update(file, { where: {id: uploadFile.id } }).then(function(){
                    me.setState({ loading: false  })
                    Alert.alert("File saved");
                    Actions.pop();
                    //Actions.pop();
                    file.id = uploadFile.id;

                    try{
                        RNFS.unlink(uploadFile.filename);
                    }
                    catch(err)
                    {
                        
                    }
                    
                    me.loadFiles(me.props.imageCategory);
                    me.viewImage(file);
  
                    
              })
            }).catch(function(err){
              me.setState({ loading: false  })
              let sjson = JSON.stringify(err);
              Logging.log(err, "error", "UploadPage.onSaveImage() : me.createNewFileInfo()")
              alert(sjson);
            });
  
  
  
          }).catch(function(err){
            me.setState({ loading: false  })
            console.log(err)
            let sjson = JSON.stringify(err);
            Logging.log(err, "error", "UploadPage.onSaveImage() : RNFS.copyFile()")
            alert(json);
          })
        }).catch(function(err){
          me.setState({ loading: false  })
          Logging.log(err, "error", "UploadPage.onSaveImage() : RNFS.mkdir()")
          let sjson = JSON.stringify(err);
          alert(json);
        })
  
    }

    static async getOperators(){
      let promise = new Promise((resolve, reject)=>{
          let url = GlobalSession.Config.API_HOST + "/operator";
          
          HttpClient.get(url, function(res){
              
              resolve(res.payload);
          }, function(e){
              reject(e);
          });
      });

      return promise;
    }

    static async getOperatorCategories()
    {
      let promise = new Promise((resolve, reject)=>{
        let categories = [
          { value: 'voucher', label: 'Voucher'},
          { value: 'kartuperdana', label: 'Kartu Perdana'},
          { value: 'voucherfisik', label: 'Voucher Fisik'},
          { value: 'paket', label: 'Paket'},
          { value: 'isipulsa', label: 'Isi Pulsa'},
        ];
        resolve(categories);
      })
    }

    static async setPosterTotalItems(files, fileids)
    {
      try
      {
        let ids = fileids.join();

        let sequelize = Util.getSequelize();
        const items = await sequelize.query("SELECT upload_file_id as fileid, count(*) as total FROM `filepackageitem` where upload_file_id in (" + ids + ") GROUP BY upload_file_id", { type: QueryTypes.SELECT });
        items.map((item)=>{
          files.map((file)=>{
            if(file.id == item.fileid)
            {
              file.totalItems = item.total;
            }
          })
        })
  
        return files;

      }
      catch(err)
      {
        console.log("ERRRRRROR")
        console.log(err)
        throw err;
      }
    }

    static async setStoreFrontTotalItems(files, fileids)
    {
      try
      {
        let ids = fileids.join();
        let sequelize = Util.getSequelize();
        const items = await sequelize.query("SELECT upload_file_id as fileid, count(*) as total FROM `storefrontitem` where upload_file_id in (" + ids + ") GROUP BY upload_file_id", { type: QueryTypes.SELECT });
        
        items.map((item)=>{
          files.map((file)=>{
            if(file.id == item.fileid)
            {
              file.totalItems = item.total;
            }
          })
        })
  
        return files;

      }
      catch(err)
      {
        console.log("ERRRORRRRR setStoreFrontTotalItems")
        console.log(Err);
        throw err;
      }
    }

    static async setPosterBATotalItems(files, fileids)
    {
      try
      {
        let ids = fileids.join();

        let sequelize = Util.getSequelize();
        const items = await sequelize.query("SELECT upload_file_id as fileid, count(*) as total FROM `filepackageitem` where upload_file_id in (" + ids + ") GROUP BY upload_file_id", { type: QueryTypes.SELECT });
        items.map((item)=>{
          files.map((file)=>{
            if(file.id == item.fileid)
            {
              file.totalItems = item.total;
            }
          })
        })
  
        return files;

      }
      catch(err)
      {
        console.log("ERRRRRROR")
        console.log(err)
        throw err;
      }
    }

    static async setStoreFrontBATotalItems(files, fileids)
    {
      try
      {
        let ids = fileids.join();
        let sequelize = Util.getSequelize();
        const items = await sequelize.query("SELECT upload_file_id as fileid, count(*) as total FROM `storefrontitem` where upload_file_id in (" + ids + ") GROUP BY upload_file_id", { type: QueryTypes.SELECT });
        
        items.map((item)=>{
          files.map((file)=>{
            if(file.id == item.fileid)
            {
              file.totalItems = item.total;
            }
          })
        })
  
        return files;

      }
      catch(err)
      {
        console.log("ERRRORRRRR setStoreFrontTotalItems")
        console.log(Err);
        throw err;
      }
    }

    static async setTotalItems(files)
    {
      let posterids = [];
      let posters = [];
      let storefrontids = [];
      let storefronts = [];
      let posterbaids = [];
      let posterbas = [];
      let storefrontbaids = [];
      let storefrontbas = [];

      files.map((file)=>{

          file.totalItems = 0;
        
      })

      files.map((file)=>{
        if(file.imageCategory == "poster")
        {
          posterids.push(file.id)
          posters.push(file)
        }
        else if(file.imageCategory == "storefront")
        {
          storefrontids.push(file.id);
          storefronts.push(file);
        }
        else if(file.imageCategory == "poster-before-after")
        {
          if(file.beforeAfterType == "before")
          {
            posterbaids.push(file.id);
            posterbas.push(file);
          }

        }
        else if(file.imageCategory == "storefront-before-after")
        {
          if(file.beforeAfterType == "before")
          {
            storefrontbaids.push(file.id);
            storefrontbas.push(file);
          }

        }
      })

      try
      {
        let updatedfiles = await Util.setPosterTotalItems(files, posterids);
        updatedfiles = await Util.setStoreFrontTotalItems(updatedfiles, storefrontids);
        updatedfiles = await Util.setPosterBATotalItems(updatedfiles, posterbaids);
        updatedfiles = await Util.setStoreFrontBATotalItems(updatedfiles, storefrontbaids);

        return updatedfiles;
        //return files;
      }
      catch(err)
      {
        throw err;
      }



    }

    static getSequelize()
    {
      var sequelize = new Sequelize({
        dialectModule: SQLite,
        database: Config.LOCAL_DB,
        storage: Config.LOCAL_DB_STORAGE,
        logging: false,
        dialectOptions: {
          version: "1.0",
          description: "Retail Intelligence"
          //size: 2 * 1024 * 1024
        }
      });

      return sequelize;
    }

    static pushNotification(title, subTitle, content, bigText="")
    {
      /*
      try
      {
        PushNotification.localNotification({
            channelId: "hudabeybi", 
            autoCancel: true,
            bigText: bigText,
            subText: subTitle,
            title: title,
            message: content,
            vibrate: true,
            vibration: 300,
            playSound: true,
            soundName: 'default',
            //actions: '["Yes", "No"]'
        })

      }
      catch(err)
      {
        Logging.log(err, "error", "Util.pushNotification()")
      }*/

      //throw null;

    }

    static getImageStatus(status)
    {
      if(status == "uploaded")
        return "Selesai diproses dan sudah diunggah";
      else if(status == "processed")
        return "Sedang dalam proses";
      else if(status == "rejected")
        return "Ditolak karena data belum lengkap atau unggah gagal";
      else if(status == "draft")
        return "Draft";

    }

    static async getTotalStatus()
    {
      let promise = new Promise(async (resolve, reject)=>{
        let uploadedNo = 0;
        let processedNo = 0;
        let rejectedNo = 0;
        let draftNo = 0;

        let files = await UploadedFile.findAll({
          where: {
            picture_taken_by : GlobalSession.currentUser.email
          }
        });

        files.map((file)=>{
          if(file.imageStatus == "draft")
            draftNo++;
          if(file.imageStatus == "processed")
            processedNo++;
          if(file.imageStatus == "rejected")
            rejectedNo++;
          if(file.imageStatus == "uplpaded")
            uploadedNo++;
        })

        let url = GlobalSession.Config.API_HOST + "/report/uploads/total-by-uploader/" + GlobalSession.currentUser.email;
        console.log("getTotalStatus")
        console.log(url)
        HttpClient.get(url, function(result){
          console.log(result)
          uploadedNo = result.payload[0].total;
          resolve({ draft: draftNo, rejected: rejectedNo, processed: processedNo, uploaded: uploadedNo  });

        }, function(){
          resolve({ draft: draftNo, rejected: rejectedNo, processed: processedNo, uploaded: "-"  });
        })

        

      });
      return promise;
    }

}



