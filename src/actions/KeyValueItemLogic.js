import HttpClient from '../util/HttpClient';
import GlobalSession from '../GlobalSession';

export default class KeyValueItemLogic{
    static async getAll(tag){
        var url = GlobalSession.Config.API_HOST + "/keyvalueitem/tag/" + tag;
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