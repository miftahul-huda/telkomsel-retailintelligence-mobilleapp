import ImgToBase64 from 'react-native-image-base64';

export default class HttpClient
{
    static get(url, callback, callbackError){
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
    }
    
    static post(url, param, callback, callbackError){

        var json = JSON.stringify(param);
        console.log("json to post");
        console.log(json);
        fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: json
        }).then((response) => { 
            //console.log("post response 1")
            
            var s = {};
            
            try{
                s =response.json();
            }
            catch(err){
                console.log("errrr")
                console.log(err);
                console.log("Plain text");
                console.log(response.text());
            }
            

            return s;
        })
        .then((json) => {
            console.log("post response 2")
            console.log(json);
            if(callback != null)
                callback(json);
            return json;
        })
        .catch((error) => {
            console.log("Error post")
            console.log(error.message)
            console.log(error);
            if(callbackError != null)
                callbackError(error);
        });
    }

    static post2(url, param, callback){
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
        filename = "file://" + filename;
        console.log(filename)

        let body = new FormData();
        body.append('file', {uri: filename ,name: shortFilenames, type: 'image/jpg'});
        //body.append('Content-Type', 'image/jpg');

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
              alert("Upload failed!");
              if(callbackError != null)
                callbackError(error);
            });
        
        
    }
}