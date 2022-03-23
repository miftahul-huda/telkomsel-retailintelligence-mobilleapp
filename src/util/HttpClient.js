import ImgToBase64 from 'react-native-image-base64';
import axios from 'axios';

export default class HttpClient
{
    static get(url, callback, callbackError){

        /*
        fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => response.json())
        .then((json) => {
            if(callback != null)
                callback(json);
            return json;
        })
        .catch((error) => {
          console.error(error);
          if(callbackError != null)
            callbackError(error);
        });
        */

        axios({
            url: url,
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response)=>{
            console.log("Success get ")
            console.log(response.data);
            if(callback != null)
                callback(response.data);
        }).catch((err)=>{
            console.log("Error get ")
            console.log(err);
            if(callbackError != null)
                callbackError(err);
        })
    }
    
    static post(url, param, callback, callbackError, headers=null){

        let newHeaders = { Accept: 'application/json', 'Content-Type': 'application/json' }

        if(headers != null)
        {
            newHeaders = { ...newHeaders, ...headers }
        }

        axios({
            url: url,
            method: 'POST',
            data: param,
            headers: newHeaders
        }).then((response)=>{
            console.log("Success post ")
            console.log(response.data);
            if(callback != null)
                callback(response.data);
        }).catch((err)=>{
            console.log("Error post ")
            console.log(err);
            if(callbackError != null)
                callbackError(err);
        })
    }

    static post2(url, param, callback, callbackError){

        /*
        console.log("post")
        var json = JSON.stringify(param);
        console.log("json to post");
        //console.log(json);
        fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: param
        }).then((response) => response.json())
        .then((json) => {
            if(callback != null)
                callback(json);
            return json;
        })
        .catch((error) => {
            console.error(error.message)
            console.error(error);
        });
        */

        axios({
            url: url,
            method: 'POST',
            data: param,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response)=>{
            console.log("Success post ")
            console.log(response.data);
            if(callback != null)
                callback(response.data);
        }).catch((err)=>{
            console.log("Error post ")
            console.log(err);
            if(callbackError != null)
                callbackError(err);
        })
    }

    static uploadToServer(url, file, callback)
    {
        //console.log(file);
        //file.content = file.content.trim().replace(/(?:\r\n|\r|\n)/g, '');
        console.log(file);
        HttpClient.post(url, file, callback );
   

    }

    static upload(url, filename, callback, callbackError)
    {
        let shortFilenames = filename.split('/');
        shortFilenames = shortFilenames[shortFilenames.length - 1];

        filename = filename.replace("file://", "");
        filename = "file://" + filename;
        console.log(filename)

        let body = new FormData();
        body.append('file', {uri: filename ,name: shortFilenames, type: 'image/jpg'});
        //body.append('Content-Type', 'image/jpg');

        let postDone =false;

        setTimeout(function(){
            if(postDone == false)
            {
                postDone = true;
                if(callbackError != null)
                    callbackError("error timeout");
            }
        }, 120000)

        axios({
            url: url,
            method: 'POST',
            data: body,
            timeout: 60000,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data'
            }
        }).then((response)=>{
            console.log("Success upload ")
            console.log(response.data);
            postDone = true;
            if(callback != null)
                callback(response.data);
        }).catch((err)=>{
            console.log("Error upload ")
            console.log(err);
            postDone = true;
            if(callbackError != null)
                callbackError(err);
        }).finally((o)=>{
            console.log("Finally upload ")
            console.log(o);
            postDone = true;
        })

        

        /*
        fetch(url,{ method: 'POST',headers:{  
            Accept: 'application/json',
            "Content-Type": "multipart/form-data"
            } , body :body} )
            .then(response => response.json())
            .then(response => {
              console.log("upload succes", response);
              if(callback != null)
                callback(response);
              //alert("Upload success!");
              
            })
            .catch(error => {
              console.log("upload error", error);
              //alert("Upload failed!");
              if(callbackError != null)
                callbackError(error);
            })
            .
            finally(res =>{
                console.log("Finally");
                console.log(res);
            })
        */
        
        
    }
}