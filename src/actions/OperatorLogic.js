import HttpClient from './util/HttpClient';
import Config from './config.json';

export default class OperatorLogic{
    static async getAll(){
        var url = Config.API_HOST + "/operator";
        let myPromise = new Promise(function(resolve, reject){
            httpClient.get(url, function (result){
                resolve(result);
            }, function(err){
                reject(err);
            });
        });

        return myPromise;
    }
}