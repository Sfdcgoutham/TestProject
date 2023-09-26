function getSessionParameter(paramName){
    console.log('sesionmanager');
    var returnVal = null;
    
    var cookies=document.cookie;
    console.log(cookies);
    var params = cookies.split('; ');
    console.log(params);

   var paramMap = new Map();
   var paramArr = [];
    console.log(params);
    for (var each in params){
        console.log(each);
        paramArr = params[each].split('=');
        paramMap.set(paramArr[0],paramArr[1]);
    }
    if(paramMap.has(paramName)){
        returnVal= paramMap.get(paramName);
    }
    console.log(returnVal);
    return returnVal;

 }

export  { getSessionParameter };