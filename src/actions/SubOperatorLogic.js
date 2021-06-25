import HttpClient from './util/HttpClient';
import Config from './config.json';

export default class SubOperatorLogic{
    static async getAll(operator_id){
        var url = Config.API_HOST + "/suboperator/" + operator_id;
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