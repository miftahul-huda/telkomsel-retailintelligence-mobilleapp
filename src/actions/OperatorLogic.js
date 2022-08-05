import HttpClient from '../util/HttpClient';
import GlobalSession from '../GlobalSession';

export default class OperatorLogic{
    static async getAll(){
        var url = GlobalSession.Config.API_HOST + "/operator";
        let myPromise = new Promise(function(resolve, reject){
            HttpClient.get(url, function (result){
                resolve(result);
            }, function(err){
                reject(err);
            });
        });

        return myPromise;
    }
}