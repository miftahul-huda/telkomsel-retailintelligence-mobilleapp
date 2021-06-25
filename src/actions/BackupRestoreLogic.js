import UploadedFile from '../model/UploadedFile';
import FilePackageItem from '../model/FilePackageItem';
import FilePackageSubItem from '../model/FilePackageSubItem';
import StoreFrontItem from '../model/StoreFrontItem';
import DropDownPicker from 'react-native-dropdown-picker';

import Config from '../config.json';
import HttpClient from '../util/HttpClient';
GlobalSession = require( '../GlobalSession');

import * as RNFS from 'react-native-fs';

import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;
const Model = Sequelize.Model;

import Logging from '../util/Logging';

const FILE_STORAGE_PATH = RNFS.DownloadDirectoryPath;

export default class BackupRestoreLogic {


    static async checkUpdate(callback, callbackError)
    {
        var url = Config.API_HOST + "/application/check/update/" + Config.VERSION;
        HttpClient.get(url, function(response){
            //response = JSON.parse(response);
            console.log(response);


            if(callback != null)
                callback(response);
        }, function(err){
            if(callbackError != null)
                callbackError(err);
        })
    }

    static async  backup()
    {
        let promise = new Promise(async (resolve, reject) => {
            try {
                let uploadedFiles = await UploadedFile.findAll();
                let filePackageItems = await FilePackageItem.findAll();
                let filePackageSubItems = await FilePackageSubItem.findAll();
                let storeFrontItems = await StoreFrontItem.findAll();
        
                let sJsonuploadedFiles = JSON.stringify(uploadedFiles);
                let sJsonfilePackageItems = JSON.stringify(filePackageItems);
                let sJsonfilePackageSubItems = JSON.stringify(filePackageSubItems);
                let sJsonstoreFrontItems = JSON.stringify(storeFrontItems);
        
                await RNFS.mkdir(FILE_STORAGE_PATH + "/retail-intelligence");

                try
                {
                    await RNFS.unlink(FILE_STORAGE_PATH + "/retail-intelligence/uploadedfile-backup.json");
                }
                catch(e)
                {

                }

                try
                {
                    await RNFS.unlink(FILE_STORAGE_PATH + "/retail-intelligence/packageitems-backup.json");
                }
                catch(e)
                {

                }

                try
                {
                    await RNFS.unlink(FILE_STORAGE_PATH + "/retail-intelligence/packagesubitems-backup.json");
                }
                catch(e)
                {

                }

                try
                {
                    await RNFS.unlink(FILE_STORAGE_PATH + "/retail-intelligence/storefrontitems-backup.json");
                }
                catch(e)
                {

                }
                
                
                //alert(sJsonfilePackageSubItems)

                await RNFS.writeFile(FILE_STORAGE_PATH + "/retail-intelligence/uploadedfile-backup.json", sJsonuploadedFiles);
                await RNFS.writeFile(FILE_STORAGE_PATH + "/retail-intelligence/packageitems-backup.json", sJsonfilePackageItems);
                await RNFS.writeFile(FILE_STORAGE_PATH + "/retail-intelligence/packagesubitems-backup.json", sJsonfilePackageSubItems);
                await RNFS.writeFile(FILE_STORAGE_PATH + "/retail-intelligence/storefrontitems-backup.json", sJsonstoreFrontItems);
        
                resolve(true);
            }
            catch (e)
            {
                console.log("Error BackupRestoreLogic.backup()");
                console.log(e);
                reject(e);
            }
        });

        return promise;

    }

    static async backupExists()
    {
        let result = await RNFS.exists(FILE_STORAGE_PATH + "/retail-intelligence/uploadedfile-backup.json");
        return result;
    }



    static async  restore()
    {

        let promise = new Promise(async (resolve, reject) => {
            try {
                let sUploadedFiles = "[]";
                let sPackageItems = "[]";
                let sPackageSubItems = "[]";
                let sStoreFrontItems = "[]";

                try
                {
                    sUploadedFiles = await RNFS.readFile(FILE_STORAGE_PATH + "/retail-intelligence/uploadedfile-backup.json");
                }
                catch(e){

                }
                
                try
                {
                    sPackageItems = await RNFS.readFile(FILE_STORAGE_PATH + "/retail-intelligence/packageitems-backup.json");
                }
                catch(e){}
                
                try{
                    sPackageSubItems = await RNFS.readFile(FILE_STORAGE_PATH + "/retail-intelligence/packagesubitems-backup.json");
                }catch(e){

                }
                
                try{
                    sStoreFrontItems = await RNFS.readFile(FILE_STORAGE_PATH + "/retail-intelligence/storefrontitems-backup.json");
                }
                catch(e){}
                
                
                let uploadedFiles = JSON.parse(sUploadedFiles);
                let packageItems = JSON.parse(sPackageItems);
                let packageSubItems = JSON.parse(sPackageSubItems);
                let storeItems = JSON.parse(sStoreFrontItems);
        
                await UploadedFile.destroy({ where: { id: {[Op.not] : null} } });
                await FilePackageItem.destroy({ where: { id: {[Op.not] : null} } });
                await FilePackageSubItem.destroy({ where: { id: {[Op.not] : null} } });
                await StoreFrontItem.destroy({ where: { id: {[Op.not] : null} } });

                uploadedFiles.forEach(function (item, index) {
                    if(item.imageCategory == null)
                        item.imageCategory = "poster";
                })

                console.log("Backup ---- uploadedFiles");
                console.log( uploadedFiles);
        
                await UploadedFile.bulkCreate(uploadedFiles);
                await FilePackageItem.bulkCreate(packageItems);
                await FilePackageSubItem.bulkCreate(packageSubItems);
                await StoreFrontItem.bulkCreate(storeItems);

         
                resolve(true);
        
            }
            catch (e)
            {
                console.log("Error BackupRestoreLogic.restore()");
                console.log(e);
                reject(e);
            }
        })

    }

    
}