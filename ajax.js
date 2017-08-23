function ajax(url,method,data,fnsecc,fnfail){
	var xhr=null;

	if(window.XMLHttpRequest){
		xhr=new XMLHttpRequest();
	}else{
		xhr=new ActiveXObject('Microsoft.XMLRequest');
	}

	if(method=='GET'){
		url+='?'+data;
	}

	xhr.open(method,url,true);

	if(method=='GET'){
		xhr.send();
	}else{
		xhr.setHeaderRequest('content-type','application/x-www-form-urlencoded');
		xhr.send(data);
	}

	xhr.onreadystatechange=function(){
		if(xhr.readyState==4){
			if(xhr.status==200){
				fnsecc(xhr.responseText);
			}
		}
	}
}