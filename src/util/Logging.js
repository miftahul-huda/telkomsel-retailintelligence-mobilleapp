import HttpClient from './HttpClient';
GlobalSession = require( '../GlobalSession');

import base64 from 'react-native-base64'

export default class Logging
{
    static getCurrentDate()
    {
        var dt = new Date();
        var sdate = dt.getFullYear() + "-" + (dt.getMonth() + 1 ) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
        return sdate;
    }
    
    static encode64(s)
    {
        const Buffer = require("buffer").Buffer;
        let message = new Buffer(s).toString("base64");   
        return message;     
    }

    static log(oLog, type, module=""){

        console.log("LOGGING " + type)
        console.log(oLog);
        let message = "";
        if(typeof oLog === 'string' || oLog instanceof String)
            message = oLog;
        else
            message = JSON.stringify(oLog);

        message = Logging.encode64(message);
        
        //message = base64.encode(message);
        //alert(message);

        module = Logging.encode64(module);
            
        let user = GlobalSession.currentUser;


        if(user == null)
            user = {};
        

        let log  = { logDate: Logging.getCurrentDate(), logApplication: 'Telkomsel-Retail-Intelligence', logModule: module, logType: type,   logContent: message, username: user.email  }

        let url = GlobalSession.Config.API_HOST_LOG  + "/logger/create";
        HttpClient.post(url, log, function(){

        }, function(error){

            console.log("Error logging failed : " + JSON.stringify(error));

        });
    }
}