import { Actions } from 'react-native-router-flux';
import * as RNFS from 'react-native-fs';
import Exif from 'react-native-exif';
import Logging from '../util/Logging';
import Style from '../style';
import SharedPage from '../SharedPage';

import GetLocation from 'react-native-get-location';
import UploadedFile from '../model/UploadedFile';
import FilePackageItem from '../model/FilePackageItem';
import FilePackageSubItem from '../model/FilePackageSubItem';
import StoreFrontItem from '../model/StoreFrontItem';
import TotalSales from '../model/TotalSales';

GlobalSession = require( '../GlobalSession');
import HttpClient from '../util/HttpClient';
import Util from './Util';

import Sequelize from "rn-sequelize";
import { enableScreens } from 'react-native-screens';
import EtalaseItem from '../model/EtalaseItem';
const Op = Sequelize.Op;


const FILE_STORAGE_PATH = RNFS.DownloadDirectoryPath;

export default class Uploader 
{

    static UPLOADED_FILES = []
    static FAILED_FILES = []
    static UPLOAD_STATUS = "";
    static FILE_COUNTER = 0;

    static getPackageItemsByFile(file, packageItems)
    {
        let pkgItems = [];
        packageItems.map((item)=>{
            if(item.upload_file_id == file.id)
                pkgItems.push(item)
        })

        return pkgItems;
    }

    static getStoreFrontItemsByFile(file, storeFrontItems)
    {
        let strItems = [];
        storeFrontItems.map((item)=>{
            if(item.upload_file_id == file.id)
                strItems.push(item)
        })

        return strItems;
    }

    static getEtalaseItemsByFile(file, etalaseItems)
    {
        let strItems = [];
        etalaseItems.map((item)=>{
            if(item.upload_file_id == file.id)
                strItems.push(item)
        })

        return strItems;
    }

    static getTotalSalesByFile(file, totalSales)
    {
        let strItems = [];
        totalSales.map((item)=>{
            if(item.upload_file_id == file.id)
                strItems.push(item)
        })

        return strItems;
    }

    static getPackageSubItemsByPackageItems(packageItems, packageSubItems)
    {
        let subItems = [];
        packageItems.map((item)=>{
            packageSubItems.map((subItem)=>{
                if(subItem.packageItemId == item.id)
                    subItems.push(subItem)
            })
        })

        return subItems;
    }
    

    static async getProcessedFiles()
    {
        let promise = new Promise((resolve, reject)=>{
            UploadedFile.findAll({where: { imageStatus: "processed" }}).then((files)=>{
                resolve(files);

            }).catch((err)=>{
                reject(err)
            })
        })

        return promise;
    }

    static async getDraftFiles()
    {
        let promise = new Promise((resolve, reject)=>{
            UploadedFile.findAll({where: { imageStatus: "draft" }}).then((files)=>{
                resolve(files);

            }).catch((err)=>{
                reject(err)
            })
        })

        return promise;
    }

    static getPackageItemIdsFromPackageItems(items)
    {
        let ids = [];
        items.map((item)=>{
            ids.push(item.id)
        })
        return ids;
    }

    static getPackageItemIds(files)
    {
        let ids = [];
        files.map((item)=>{
            if(item.imageCategory == "poster"  || item.imageCategory == "poster-before-after")
                ids.push(item.id)
        })
        return ids;
    }

    static getStoreFrontItemIds(files)
    {
        let ids = [];
        files.map((item)=>{
            if(item.imageCategory == "storefront" || item.imageCategory == "storefront-before-after")
                ids.push(item.id)
        })
        return ids;
    }

    static getEtalaseItemIds(files)
    {
        let ids = [];
        files.map((item)=>{
            if(item.imageCategory == "etalase")
                ids.push(item.id)
        })
        return ids;
    }

    static getTotalSalesIds(files)
    {
        let ids = [];
        files.map((item)=>{
            if(item.imageCategory == "total-sales")
                ids.push(item.id)
        })
        return ids;
    }

    static async getFilePackageItems(files)
    {
        let promise = new Promise((resolve, reject)=>{
        
            let ids = Uploader.getPackageItemIds(files);

            FilePackageItem.findAll({where: { upload_file_id: { [Op.in] : ids }}}).then((items)=>{
                resolve(items);

            }).catch((err)=>{
                reject(err)
            })
        })

        return promise;
    }


    static async getFilePackageSubItems(packageItems)
    {
        let promise = new Promise((resolve, reject)=>{

            let ids = Uploader.getPackageItemIdsFromPackageItems(packageItems);

            FilePackageSubItem.findAll({where: { packageItemId: { [Op.in] : ids }}}).then((items)=>{
                resolve(items);

            }).catch((err)=>{
                reject(err)
            })
        })

        return promise;
    }

    static async getStoreFrontItems(files)
    {
        let promise = new Promise((resolve, reject)=>{

            let ids = Uploader.getStoreFrontItemIds(files);

            StoreFrontItem.findAll({where: { upload_file_id: { [Op.in] : ids }}}).then((items)=>{
                resolve(items);

            }).catch((err)=>{
                reject(err)
            })
        })

        return promise;
    }


    static async getTotalSalesItems(files)
    {
        let promise = new Promise((resolve, reject)=>{

            let ids = Uploader.getTotalSalesIds(files);

            TotalSales.findAll({where: { upload_file_id: { [Op.in] : ids }}}).then((items)=>{
                resolve(items);

            }).catch((err)=>{
                reject(err)
            })
        })

        return promise;
    }

    static async getEtalaseItems(files)
    {
        let promise = new Promise((resolve, reject)=>{

            let ids = Uploader.getEtalaseItemIds(files);

            EtalaseItem.findAll({where: { upload_file_id: { [Op.in] : ids }}}).then((items)=>{
                resolve(items);

            }).catch((err)=>{
                reject(err)
            })
        })

        return promise;
    }



    static async uploadFile(filepath, imageCategory="poster")
    {
        
        let promise = new Promise((resolve, reject)=>{
            var url = GlobalSession.Config.API_HOST_UPLOAD + "/upload/gcs/" + GlobalSession.Config.POSTER_UPLOAD_PATH;
            if(imageCategory.indexOf("storefront") > -1)
                url = GlobalSession.Config.API_HOST_UPLOAD + "/upload/gcs/" + GlobalSession.Config.STOREFRONT_UPLOAD_PATH;
            if(imageCategory.indexOf("etalase") > -1)
                url = GlobalSession.Config.API_HOST_UPLOAD + "/upload/gcs/" + GlobalSession.Config.ETALASE_UPLOAD_PATH;
            if(imageCategory.indexOf("total-sales") > -1)
                url = GlobalSession.Config.API_HOST_UPLOAD + "/upload/gcs/" + GlobalSession.Config.TOTALSALES_UPLOAD_PATH;

            console.log("UploadFile " + url)
            HttpClient.upload(url, filepath, function(response){
                console.log("UploadFile done" + filepath)
                if(response.success)
                    resolve(response.payload)
                else
                    reject(response.error)
            }, function(err){
                reject(err)
            });
        })

        return promise;
    }

    static setFileInfo(file, filename)
    {
        file.upload_date = Util.getCurrentDate();
        file.uploaded_by_email = GlobalSession.currentUser.email;
        file.uploaded_by_fullname = GlobalSession.currentUser.firstname + " " + GlobalSession.currentUser.lastname;
        file.uploaded_filename = filename;
        file.isuploaded = 1;
        file.imageStatus = "uploaded";
        file.tag = GlobalSession.Config.tag + "," + GlobalSession.Config.VERSION;
        return file;
    }

    static copyObject(item)
    {
        let o = JSON.stringify(item);
        console.log("copyObject")
        console.log(o);
        o = JSON.parse(o);

        console.log("copyObject II")
        console.log(o);
        return o;
    }

    static async uploadFileInfo(file)
    {
        let promise = new Promise((resolve, reject)=>{

            try
            {
                let url =  GlobalSession.Config.API_HOST + "/uploadfile/create";
                //let item = Uploader.copyObject(file);
                let item = JSON.stringify(file);
                console.log("uploadFileInfo")
                console.log(url);
                console.log(item)
                item.id = null;
                //item.tag  = GlobalSession.Config.tag;
                
                HttpClient.post(url, item, function(response){
                    
                    if(response.success)
                    {
                        resolve(response.payload);
                    }
                    else
                    {
                        reject(response.error)
                    }
                })
            }
            catch(err)
            {
                reject(err);
            }

        })

        return promise;
    }

    static async uploadFilePackageItemInfo(item)
    {
        let promise = new Promise((resolve, reject)=>{

            try
            {
                let url =  GlobalSession.Config.API_HOST + "/filepackageitem/create";
                let newItem = Uploader.copyObject(item);
    
                HttpClient.post(url, newItem, function(response){
                    if(response.success)
                    {
                        resolve(response.payload);
                    }
                    else
                    {
                        reject(response.error)
                    }
                })
            }
            catch(err)
            {
                reject(err);
            }

        })
        
        return promise;

    }

    static async uploadFilePackageSubItemInfo(item)
    {
        let promise = new Promise((resolve, reject)=>{
            try{
                let url =  GlobalSession.Config.API_HOST + "/filepackagesubitem/create";
                let newItem = Uploader.copyObject(item);
    
                HttpClient.post(url, newItem, function(response){
                    if(response.success)
                    {
                        resolve(response.payload);
                    }
                    else
                    {
                        reject(response.error)
                    }
                })
            }
            catch(err)
            {
                reject(err);
            }

        })

        return promise;
    }

    static async uploadStoreFrontItemInfo(item)
    {
        let promise = new Promise((resolve, reject)=>{

            try
            {
                let url =  GlobalSession.Config.API_HOST + "/storefrontitem/create";
                let newItem = Uploader.copyObject(item);
    
                HttpClient.post(url, newItem, function(response){
                    if(response.success)
                    {
                        resolve(response.payload);
                    }
                    else
                    {
                        reject(response.error)
                    }
                })
            }
            catch(err)
            {
                reject(err);
            }

        })
        return promise;
    }

    static async uploadFiles(files)
    {
        files.map((file)=>{
            let filename = file.filename;
            Uploader.uploadFile(filename).then((url)=>{

                file = Uploader.setFileInfo(file, url);

            })
        })
    }

    static async uploadStoreFrontItemInfos(file, upladedFile, storefrontitems)
    {
        let promise = new Promise((resolve, reject)=>{

            let total = Uploader.getTotalStoreFrontItemFromFile(file, storefrontitems);

            if(total == 0)
                resolve(0);

            let totalStoreFrontItems = 0;


            //Foreach storefrontitem
            storefrontitems.map((storeFrontItem)=>{

                if(storeFrontItem.upload_file_id == file.id)
                {
                    let newStoreFrontItem = Uploader.copyObject(storeFrontItem);
                    newStoreFrontItem.upload_file_id = upladedFile.id;

                    //Upload storefrontitem info
                    Uploader.uploadStoreFrontItemInfo(newStoreFrontItem).then(async (uploadedStoreFrontItem)=>{

                        //Update that the storefrontitem has nbeen updated
                        await StoreFrontItem.update({ isuploaded: 1 }, {where: { id: storeFrontItem.id}})

                        //After all processed storefront items done call resolve
                        totalStoreFrontItems++;
                        if(totalStoreFrontItems >= total)
                        {
                            resolve(totalStoreFrontItems)
                        }

                    }).catch((err)=>{
                        //UploadFile failed to upload
                        Uploader.FAILED_FILES.push({ file: file, storeFrontItem:storeFrontItem, error: err })
                        //After all processed storefront items done call resolve
                        totalStoreFrontItems++;
                        if(totalStoreFrontItems >= total)
                        {
                            resolve(totalStoreFrontItems)
                        }
                    })

                }//end if(storeFrontItem.upload_file_id == file.id)
            })
        })

        return promise;

    }

    static async  uploadFilePackageSubItemInfos(file, item, uploadedPackageItem,  packageSubItems)
    {

        let promise = new Promise((resolve, reject)=>{

            let total = Uploader.getTotalPackageSubItemFromPackageItem(item, packageSubItems);

            if(total == 0)
                resolve(0);

            let totalPackageSubItems = 0;

            //Foreqch package sub item
            packageSubItems.map((subItem)=>{
                if(subItem.packageItemId == item.id)
                {
                    let newSubItem = Uploader.copyObject(subItem);

                    //set subitem's packageItemId with packageitem's id from server
                    newSubItem.packageItemId = uploadedPackageItem.id;

                    //upload sub package item
                    Uploader.uploadFilePackageSubItemInfo(newSubItem).then(async (uploadedSubItem)=>{
                        
                        //Update subitem has been uploaded
                        //await FilePackageSubItem.update({ isuploaded:1 }, { where: { id: subItem.id } })

                        //After all processed package items done call resolve
                        totalPackageSubItems++;
                        
                        if(totalPackageSubItems >= total)
                        {
                            resolve(totalPackageSubItems)
                        }

                    }).catch((err)=>{
                        //Error when subitem cannot be uploaded
                        Uploader.FAILED_FILES.push({ file: file, packageSubItem: subItem, error: err })
                        
                        //After all processed package items done call resolve
                        totalPackageSubItems++;
                        
                        if(totalPackageSubItems >= total)
                        {
                            resolve(totalPackageSubItems)
                        }
                    })
                }//end if
            })//foreach

        })

        return promise;

    }

    static getTotalPackageItemFromFile(file, packageItems)
    {
        let counter = 0;
        packageItems.map((item)=>
        {
            if(item.upload_file_id == file.id)
                counter++;
        })

        return counter;
    }

    static getTotalStoreFrontItemFromFile(file, storeFrontItems)
    {
        let counter = 0;
        storeFrontItems.map((item)=>
        {
            if(item.upload_file_id == file.id)
                counter++;
        })

        return counter;
    }

    static getTotalPackageSubItemFromPackageItem(packageItem, packageSubItems)
    {
        let counter = 0;
        packageSubItems.map((item)=>
        {
            if(item.packageItemId == packageItem.id)
                counter++;
        })

        return counter;
    }

    static async uploadPackageItemInfos(file, uploadedFile, packageItems, packageSubItems)
    {

        let promise = new Promise((resolve, reject)=>{

            let total = Uploader.getTotalPackageItemFromFile(file, packageItems);

            if(total == 0)
                resolve(0);

            let totalPackageItems = 0;

            //foreach packageitems 
            packageItems.map((item)=>{

                if(item.upload_file_id  == file.id)
                {
                    let newPackageItem = Uploader.copyObject(item);

                    //Set packageitem's new upload_file_id with uploadfile's id from server
                    newPackageItem.upload_file_id = uploadedFile.id;

                    //Upload packageitem
                    
                    Uploader.uploadFilePackageItemInfo(newPackageItem).then( (uploadedPackageItem)=>{

                        //console.log("--- done uploadedPackageItem")
                        //console.log(uploadedPackageItem);
                        //Update set filepackageitem has been uploaded
                        //await FilePackageItem.update({ isuploaded: 1}, { where: { id: item.id } } );

                        //Upload filepackagesubitems belongs to this packageitem
                        
                        console.log("------ Upload filepackagesubitems ")
                        Uploader.uploadFilePackageSubItemInfos(file, item, uploadedPackageItem, packageSubItems).then((totalPackageSubItems)=>{
                            
                            console.log("----- Done upload filepackagesubitems info, total: " + totalPackageSubItems)


                            totalPackageItems++;
                            if(totalPackageItems >= total)
                            {
                                resolve(totalPackageItems)
                            }

                        })
                        




                    }).catch((err)=>{
                        //Error when packageitem cannot be uploaded
                        Uploader.FAILED_FILES.push({ file: file, packageItem:item, error: err })
                        //reject()
                        totalPackageItems++;

                        //After all processed package items done call resolve
                        totalPackageItems++;
                        if(totalPackageItems >= total)
                        {
                            resolve(totalPackageItems)
                        }
                    })

                }//end of if

            })//foreach packageitems
        })

        return promise;

    }

    static TOTALFILES = 0;
    static TOTALPACKAGEITEM = 0;
    static TOTALPACKAGESUBITEM = 0;
    static TOTALSTOREFRONT = 0;
    static START_UPLOAD = false;

    static async setProcessedFilesAsDone(callback)
    {
        let counter = 0;
        Uploader.UPLOADED_FILES.map(async (file)=>{

            let fileid = file.file.id;

            let packageItems = await FilePackageItem.findAll({ where: { upload_file_id: fileid } })
            console.log("--------packageItems--- = " + fileid)
            console.log(packageItems);

            let packageItemIds =  Uploader.getPackageItemIdsFromPackageItems(packageItems);

            console.log("========packageItemIds===========");
            console.log(packageItemIds);
            
            await FilePackageSubItem.destroy({where: { packageItemId: {[Op.in]: packageItemIds} }})
            await FilePackageItem.destroy({ where: { upload_file_id: fileid } })
            await StoreFrontItem.destroy({ where: { upload_file_id: fileid } })
            await UploadedFile.destroy({ where: { id: fileid} })

            try{
                RNFS.unlink(file.filename);
            }
            catch
            {}

        })

        if(callback != null)
            callback();
    }

    static async setProcessedFilesAsRejected(callback)
    {
        let counter = 0;
        Uploader.FAILED_FILES.map(async (file)=>{

            await UploadedFile.update({ imageStatus: "rejected", rejectedReason: file.rejectedReason }, { where: { id: file.file.id}})            

            let f = "filepackagageitem";

            if(file.file.serverid != null)
            {
                let url = GlobalSession.Config.API_HOST + "/uploadfile/delete/" + file.file.serverid;
                console.log(url)
                HttpClient.get(url);
            }

        })

        if(callback != null)
            callback();
    }

    static handleUploadFileDone(file, callback)
    {
        Uploader.UPLOADED_FILES.push({file: file})
        Uploader.FILE_COUNTER++;

        console.log("FileCounter = " + Uploader.FILE_COUNTER + ", TotalFiles: " + Uploader.TOTALFILES);
        if(Uploader.FILE_COUNTER >= Uploader.TOTALFILES)
        {
            Uploader.UPLOAD_STATUS = "done";
            Uploader.START_UPLOAD = false;
            Uploader.STATUS = "";

            Uploader.setProcessedFilesAsDone(function(){
                Uploader.setProcessedFilesAsRejected(function(){

                    if(Uploader.callback != null)
                        Uploader.callback();

                    Util.pushNotification("Retina", "Subtitle", "File file telah selesai diupload", 'bigtext')
                })
                
            });
            //alert("Done")
        }
    }

    static validatePoster(file, filePackageItems, filePackageSubItems, storeFrontItems )
    {
        let result = { success: true }
        result = (file.posterType == null || file.posterType.length == 0) ? { success: false, message: "Mohon memilih jenis poster" } : result;
        result = (file.operator == null || file.operator.length == 0) ? { success: false, message: "Mohon memilih operator yang tertera di poster" } : result;
        result = (file.areaPromotion == null || file.areaPromotion.length == 0) ? { success: false, message: "Mohon mengisi area promosi" } : result;
        
        console.log("Validate poster : " + result.success)
        console.log(result)


        if(result.success)
        {
            console.log("==============filePackageItems");
            console.log(filePackageItems);

            console.log("==============filePackageSubItems");
            console.log(filePackageSubItems);

            if(filePackageItems != null && filePackageItems.length > 0)
            {

                
                let pkgItems = Uploader.getPackageItemsByFile(file, filePackageItems);
                let pkgSubItems = Uploader.getPackageSubItemsByPackageItems(filePackageItems, filePackageSubItems);
        
                result = Uploader.validatePackageItems(file, pkgItems);
                console.log("masuk ke sini : " )
                console.log(result)
                if(result.success)
                {
                    result = Uploader.validatePackageSubItems(pkgItems, pkgSubItems);
                    console.log(result)
                }
            }
            else 
                result = { success: false, message: "Mohon isi paket item" }
        }
        return result;
    }

    static validateStoreFront(file, filePackageItems, filePackageSubItems, storeFrontItems)
    {
        let result = { success: true }
        result = (file.operatorDominant == null || file.operatorDominant.length == 0) ? { success: false, message: "Mohon memilih operator yang paling dominan di foto." } : result;
        if(result.success)
        {
            let storeFrontItems2 = Uploader.getStoreFrontItemsByFile(file, storeFrontItems);
            result = Uploader.validateStoreFrontItems(file, storeFrontItems2);
        }
        
        return result;
    }

    static validatePackageSubItems(packageItems, filePackageSubItems)
    {
        let result = { success: true };

        console.log("==============validatePackageSubItems");

        if(filePackageSubItems == null || filePackageSubItems.length == 0)
            return { success: false, message: "Mohon isi sub item" }

        packageItems.map((packageItem)=>{
            let filePackageSubItems2 = Uploader.getPackageSubItemsByPackageItems([packageItem], filePackageSubItems)
            
            let subItemQuotaCounter = 0;
            filePackageSubItems2.map((subItem)=>{

                let quotaCategory = subItem.quotaCategory + "";
                if(subItem.quota == null && quotaCategory.indexOf("unlimited") < 0)
                {
                    subItemQuotaCounter++;
                }
            })

            if(subItemQuotaCounter >= filePackageSubItems2.length)
            {
                result = { success: false, message: "Minimal satu quota sub item atau pilih unlimited untuk paket item " + packageItem.gbmain + " GB diisi." }
            }
        })

        return result;
    }

    static validatePackageItems(file, packageItems)
    {
        let result = { success: true }

        if(packageItems == null || packageItems.length == 0)
            result = { success: false, message: "Mohon isi paket item" }
        else
        {
            packageItems.map((packageItem)=>{
                let tmpResult = Uploader.validatePackageItem(file, packageItem);
                if(tmpResult.success == false)
                    result = tmpResult;
            })
        }


        return result;
    }

    static validatePackageItem(file, item)
    {
        if( item.price == null || item.price == "" || item.price == 0)
            return { success: false, message: 'Mohon isi harga display untuk ' + item.itemCategoryText};

        if(item.transferPrice == null || item.transferPrice == "" || item.transferPrice == 0)
            return { success: false, message: 'Mohon isi harga beli untuk ' + item.itemCategoryText};

        if(item.itemCategory == null || item.itemCategory == "")
        {
            return { success: false, message: 'Mohon pilih jenis paket item'};
        }

        if(item.category == null || item.category == "")
        {
            return { success: false, message: 'Mohon pilih kategori paket (Acquisition/Voucher) untuk  ' + item.itemCategoryText};
        }

        return { success: true}
    }

    static validateStoreFrontItems(file, storeFrontItems)
    {
        let result = { success: true }
        storeFrontItems.map((storeFrontItem)=>{
            let tmpResult = Uploader.validateStoreFrontItem(file, storeFrontItem);
            if(tmpResult.success == false)
                result = tmpResult;
        })

        return result;
    }

    static validateStoreFrontItem(file, item)
    {
        let res = { success: true}
        res = (item.operator == null || item.operator.length == 0) ? { success: false, message: "Mohon pilih operator" } : res;
        res = (item.percentage == null || item.percentage.length == 0) ? { success: false, message: "Mohon isi kira-kira prosentase luas operator tersebut di gambar." } : res;
        return res;
    }

    static validateEtalase(file, etalaseItems)
    {
        let result = { success: true }
        result = (file.operatorDominant == null || file.operatorDominant.length == 0) ? { success: false, message: "Mohon memilih operator yang paling dominan di foto." } : result;
        if(result.success)
        {
            let etalaseItems2 = Uploader.getEtalaseItemsByFile(file, etalaseItems);
            result = Uploader.validateEtalaseItems(file, etalaseItems2);
        }
        
        return result;
    }

    static validateEtalaseItems(file, etalaseItems)
    {
        let result = { success: true }
        etalaseItems.map((etalaseItem)=>{
            let tmpResult = Uploader.validateEtalaseItem(etalaseItem);
            if(tmpResult.success == false)
                result = tmpResult;

        })
        return result;
    }

    static validateEtalaseItem(item)
    {
        let res = { success: true}
        res = (item.operator == null || item.operator.length == 0) ? { success: false, message: "Mohon pilih operator" } : res;
        res = (item.percentage == null || item.percentage.length == 0) ? { success: false, message: "Mohon isi kira-kira prosentase luas operator tersebut di gambar." } : res;
        return res;
    }

    static validateTotalSales(file, totalSales)
    {
        let result = { success: true }
        if(result.success)
        {
            let totalSales2 = Uploader.getTotalSalesByFile(file, totalSales);
            result = Uploader.validateTotalSalesItems(file, totalSales2);
        }
        
        return result;
    }

    static validateTotalSalesItems(file, totalSales)
    {
        let result = { success: true }
        totalSales.map((totalSale)=>{
            let tmpResult = Uploader.validateTotalSaleItem(totalSale);
            if(tmpResult.success == false)
                result = tmpResult;

        })
        return result;
    }

    static validateTotalSaleItem(item)
    {
        let result = { success: true }
        if(item.kartuPerdana == null || item.kartuPerdana.length == 0)
            result = { success: false, message: 'Kartu perdana tidak boleh kosong' }
        if(item.voucherFisik == null || item.voucherFisik.length == 0)
            result = { success: false, message: 'Voucher fisik tidak boleh kosong' }
        if(item.isiUlang == null || item.isiUlang.length == 0)
            result = { success: false, message: 'Isi ulang tidak boleh kosong' }
        if(item.paketPalingBanyakDibeli == null || item.paketPalingBanyakDibeli.length == 0)
            result = { success: false, message: 'Paket paling banyak dibeli tidak boleh kosong' }

        return result;
    }

    static validateFile(file, filePackageItems, filePackageSubItems, storeFrontItems, etalaseItems, totalSales)
    {
        if(file.imageCategory == "poster" || file.imageCategory == "poster-before-after")
            return Uploader.validatePoster(file, filePackageItems, filePackageSubItems, storeFrontItems);
        else if(file.imageCategory == "storefront" || file.imageCategory == "storefront-before-after")
            return Uploader.validateStoreFront(file, filePackageItems, filePackageSubItems, storeFrontItems);
        else if(file.imageCategory == "etalase" )
            return Uploader.validateEtalase(file, etalaseItems);
        else if(file.imageCategory == "total-sales" )
            return Uploader.validateTotalSales(file, totalSales);
        else
            return { success: true }
    }

    static handleUploadFileRejected(file, callback, rejectedReason)
    {
        Uploader.FAILED_FILES.push({file: file, rejectedReason: rejectedReason})
        Uploader.FILE_COUNTER++;

        console.log("Rejected FileCounter = " + Uploader.FILE_COUNTER + ", TotalFiles: " + Uploader.TOTALFILES);
        if(Uploader.FILE_COUNTER >= Uploader.TOTALFILES)
        {
            Uploader.UPLOAD_STATUS = "done";
            Uploader.START_UPLOAD = false;
            Uploader.STATUS = "";

            Uploader.setProcessedFilesAsDone(function(){
                Uploader.setProcessedFilesAsRejected(function(){

                    if(Uploader.callback != null)
                        Uploader.callback();

                    Util.pushNotification("Retina", "Subtitle", "File file telah selesai diupload", 'bigtext')
                })
                
            });
            //alert("Done")
        }
        
    }

    static REFRESH = 0;

    static clone(o)
    {
        let sJson = JSON.stringify(o);
        let o2 = JSON.parse(sJson);
        return o2;
    }
    static assembleUploadFile(file, packageItems, packageSubItems,storefrontitems, etalaseItems, totalSales)
    {
        let f = Uploader.clone(file);
        //f.packageItems = [];
        //f.storeFrontItems  = [];
        console.log("packagesubItems")
        console.log(packageSubItems)

        packageItems.map((packageItem)=>{
            if(packageItem.upload_file_id == file.id)
            {
                if(f.packageItems == null)
                    f.packageItems = [];

                let p = Uploader.clone(packageItem);
                p.packageSubItems = [];
                packageSubItems.map((ps)=>{
                    if(ps.packageItemId == p.id)
                    {
                        p.packageSubItems.push(ps);
                    }
                })
                f.packageItems.push(p);
            }
        })

        storefrontitems.map((storeFrontItem)=>{
            if(storeFrontItem.upload_file_id == file.id)
            {
                if(f.storeFrontItems == null)
                    f.storeFrontItems = [];

                let s = Uploader.clone(storeFrontItem);
                f.storeFrontItems.push(s);
            }
        })

        etalaseItems.map((etalaseItem)=>{
            if(etalaseItem.upload_file_id == file.id)
            {
                if(f.etalaseItems == null)
                    f.etalaseItems = [];

                let s = Uploader.clone(etalaseItem);
                f.etalaseItems.push(s);
            }
        })


        totalSales.map((totalSale)=>{
            if(totalSale.upload_file_id == file.id)
            {
                if(f.totalSales == null)
                    f.totalSales = [];

                let s = Uploader.clone(totalSale);
                f.totalSales.push(s);
            }
        })

        f.appVersion = GlobalSession.Config.VERSION;
        return f;
    }

    static async afterUploadImage(file, url, packageItems, packageSubItems, storefrontitems, etalaseItems, totalSales, callback)
    {
        Uploader.STATUS = "Unggah " + file.filename + " berhasil...";
        console.log("Done upload : " + file.filename + "\n");

        //Set file info
        let newFile = Uploader.setFileInfo(file, url)

        newFile = Uploader.assembleUploadFile(file, packageItems, packageSubItems, storefrontitems, etalaseItems, totalSales);

        //newFile = file;

        console.log("========UploadedFileInfo========")
        console.log(newFile);
        
        console.log("Starting to upload info for : " + file.filename);
        //Upload the file info to server
        

        
        Uploader.uploadFileInfo(newFile).then((uploadedFile)=>{

            console.log("Done upload info for : " + file.filename);
            //console.log(uploadedFile);
            file.serverid = uploadedFile.id;

            try{

                UploadFile.update({ serverid: uploadedFile.id }, { where: { id: file.id }})
            }
            catch(e)
            {

            }
            
            Uploader.handleUploadFileDone(file, callback);
            if(Uploader.processCallback != null)
                Uploader.processCallback({ status: "uploaded", file: file })
            
            

        }).catch((err)=>{
            
            //UploadFile failed to upload
            console.log("Failed upload info for : " + file.filename);
            console.log(err)
            Uploader.handleUploadFileRejected(file, callback, "Gagal upload. Mohon dicoba lagi beberapa menit.");
            if(Uploader.processCallback != null)
                Uploader.processCallback({ status: "rejected", file: file })
        })
        
        
    }

    static async upload()
    {
        let callback = Uploader.callback;
        

        console.log("Starting to upload....")
        let packageItems = null;
        let packageSubItems = null;
        let storefrontitems = null;
        let etalaseItems = null;
        let totalSales = null;

        Uploader.FAILED_FILES = [];
        Uploader.UPLOADED_FILES = [];
        Uploader.UPLOAD_STATUS = "uploading";
        Uploader.REFRESH = 0;
        Uploader.FILE_COUNTER = 0;

        // First get files with status 'processed'
        Uploader.getProcessedFiles().then(async (files)=>{

            console.log("Total files to upload: " + files.length);
            if(files.length == 0)
            {
                Uploader.UPLOAD_STATUS = "done";
                Uploader.START_UPLOAD = false;
                if(Uploader.callback != null)
                    Uploader.callback();
            }
            else
            {
                //Get filepackageitems and storefrontitems from files
                packageItems = await Uploader.getFilePackageItems(files);
                storefrontitems = await Uploader.getStoreFrontItems(files);
                etalaseItems = await Uploader.getEtalaseItems(files);
                totalSales = await Uploader.getTotalSalesItems(files);

                //Get packagesubitems 
                packageSubItems = await Uploader.getFilePackageSubItems(packageItems);

                //Set total data
                Uploader.TOTALFILES = files.length;
                Uploader.FILE_COUNTER = 0;
                
                //For each file
                files.map((file)=>{
                    
                    if(Uploader.processCallback != null)
                        Uploader.processCallback({ status: "processed", file: file })
                    
                    Uploader.STATUS = "" + file.filename + " sedang dalam proses...";

                    let validation = Uploader.validateFile(file, packageItems, packageSubItems, storefrontitems, etalaseItems, totalSales);
                    console.log("Validation")
                    console.log(validation)
                    if(validation.success == false)
                    {
                        if(Uploader.processCallback != null)
                            Uploader.processCallback({ status: "rejected", file: file })
                        Uploader.handleUploadFileRejected(file, callback, validation.message);
                    }
                    else
                    {
                        
                        console.log("Starting to upload : " + file.filename);
                        Uploader.STATUS = "Unggah " + file.filename + "...";

                        //Upload image from the file 
                        let imageCategory = file.imageCategory;
                        Uploader.uploadFile(file.filename, imageCategory).then((url)=>{

                            console.log("afteruploadimage " +  url)
                            Uploader.afterUploadImage(file, url, packageItems, packageSubItems, storefrontitems, etalaseItems, totalSales,  function(fcount){
                                
                            })

                        }).catch((err)=>{
                            //The image file failed to upload
                            //alert("here")
                            if(Uploader.processCallback != null)
                                Uploader.processCallback({ status: "rejected", file: file })
                            if(callback != null)
                                callback();
                            Uploader.STATUS = "Unggah " + file.filename + " gagal...";
                            Uploader.handleUploadFileRejected(file, callback, "Gagal upload. Mohon cek koneksi internet anda. Coba lagi beberapa menit.");
                            //await UploadedFile.update({  imageStatus:  "processed" }, { where: {id: file.id} })
                        })

                    }//End else
                })
            }//End if
        }).catch((err)=>{
            console.log(err)
            Uploader.UPLOAD_STATUS = "done";
            Uploader.START_UPLOAD = false;
            Uploader.STATUS = "";
            if(callback != null)
                callback();
            alert("Proses upload gagal.")
        })
    }

    static runUpload()
    {
        //console.log("Check uplooader")
        //console.log(Uploader.START_UPLOAD)
        //console.log(Uploader.UPLOAD_STATUS)

        if(Uploader.UPLOAD_STATUS != "uploading" && Uploader.START_UPLOAD)
        {
            console.log("Start uploading...............")
            Uploader.upload();
        }
        else
        {
            /*
            if(Uploader.START_UPLOAD == false)
            {
                //console.log("No Upload Schedule")
            }
            if(Uploader.UPLOAD_STATUS == 'uploading')
                console.log("there is uploading process going on")

            Uploader.START_UPLOAD = false;
            //alert("There is uploading in process")
            */
        }
    }
}