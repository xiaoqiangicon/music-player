
window.onload=function(){

	function init(){					//项目初始化
		musicList.init();
		musicDetails.init();
		musicAudio.init();
	}

	var musicList=(function(){			//音乐列表页操作
		var oListContent=document.getElementById('musicList');
		var oMusicContent=getByClass(oListContent,'musicContent')[0];
		var oListAudio=document.getElementById('list_audio');
		var olistTitle=document.getElementById('list_title');
		var oListAudioBtn=document.querySelector('.list_audioBtn');
		var oPlay=document.querySelector('.play');

		var onoff=true;
		var onoff2=false;
		var id=0;
		var index=0;
		var moveY=0;
		var startY=0
		var downT
		var lastTime
		var dis=0;
		var oHtml=document.getElementsByTagName('html')[0];
		var htmlHeight=oHtml.getBoundingClientRect().height;

		function init(){				//初始
			data();
			bind();
			moveScroll();
		}

		function data(){				//获取数据	
			ajax('./data/music.json','GET','',function(data){
				var data=JSON.parse(data);
				for(key in data){
					var oLi=document.createElement('li');
					oLi.innerHTML='<h3 class="title">'+(data[key].musicName)+'</h3><p class="name">'+(data[key].name)+'</p>';
					oLi.className='musicSingle';
					oLi.setAttribute('musicId',data[key].id);
					oMusicContent.appendChild(oLi);
				}
			})
		};

		function bind(){				//绑定事件
			var listTip=getByClass(oListContent,'list_tip')[0];
			listTip.addEventListener('touchstart',function(){
				alert(1);
			});

			oMusicContent.addEventListener('touchend',function(ev){
				var touch = ev.changedTouches[0];
				var target = touch.target;
				var aLiList=this.getElementsByTagName('li');
				var oldClass='musicSingle';

				if(onoff){
					for(var i=0;i<aLiList.length;i++){
						aLiList[i].index=i;
						aLiList[i].className=oldClass;
					}
					if(target.nodeName.toLowerCase()=='li'){
						oldClass=target.className;
						target.className=oldClass+' active';
						id=target.getAttribute('musicId');
						
						if(index!=target.index){
							musicAudio.loadMusic(id);
							musicAudio.play();
						}
						index=target.index;
					}
					else if(target.parentNode.nodeName.toLowerCase()=='li')
					{
						oldClass=target.parentNode.className;
						target.parentNode.className=oldClass+' active';
						id=target.parentNode.getAttribute('musicId');
						if(index!=target.parentNode.index){
							musicAudio.loadMusic(id);
							musicAudio.play();
						}			
						index=target.parentNode.index;
					}
				}
			},false);

			oListAudio.addEventListener('touchend',function(){
				if(id){
					musicDetails.slideUp();
				}
			});

			oListAudioBtn.addEventListener('touchend',palyMusic);
			oPlay.addEventListener('touchend',palyMusic);
			function palyMusic(ev){
				if(onoff2){
					onoff2=false;
					musicAudio.play();
				}else{
					onoff2=true;
					musicAudio.pause();
				}
				ev.stopPropagation();
			}
		}

		function next(){				//下一曲
			id++;
			if(id>12){
				id=1;
			}
			musicAudio.loadMusic(id);
			addBorder();
		}

		function prev(){				//上一曲
			id--;
			if(id<1){
				id=12;
			}
			musicAudio.loadMusic(id);
			addBorder();
		}

		function addBorder(){			//当前播放歌曲加样式
			var aLiList=oMusicContent.getElementsByTagName('li');
			for(var i=0;i<aLiList.length;i++){
				aLiList[i].className='musicSingle';
				if(aLiList[i].getAttribute('musicId')==id){
					aLiList[i].className='musicSingle active';
				}
			}
		}

		function scrollStart(ev){
			var touch = ev.changedTouches[0];
			startY=touch.pageY;
			downT=cssTransform(this,'translateY');	//上一次滑动的y坐标
			lastTime=new Date().getTime();
			onoff=true;

			document.addEventListener('touchmove',scrollMove);
			document.addEventListener('touchend',scrollEnd,false);
			return false;
		}

		function scrollMove(ev){
			onoff=false;
			var touch=ev.changedTouches[0];
			moveY=touch.pageY;			//滑动后的y坐标
			dis=moveY-startY+downT;		//滑动的距离
			var bottomY=oMusicContent.offsetHeight-htmlHeight+oListAudio.offsetHeight+olistTitle.offsetHeight;
			var nowTime=new Date().getTime();

			if(dis>0){
				step = 1-dis / oMusicContent.clientHeight;
				dis=parseInt(dis*step)
			}
			if(dis < -bottomY) {
				var over = -bottomY - dis; // 计算下超出值
				step = 1-over / oMusicContent.clientWidth; //根据超出值计算系数
				over = parseInt(over*step);
				dis = -bottomY - over;
			}
			
			timeDis=nowTime-lastTime;
			lastTime=nowTime;
			cssTransform(oMusicContent,'translateY',dis);
		}

		function scrollEnd(ev){
			var touch=ev.changedTouches[0];
			var endY=touch.pageY;
			changeY=cssTransform(oMusicContent,'translateY');
			var bottomY=oMusicContent.offsetHeight-htmlHeight+oListAudio.offsetHeight+olistTitle.offsetHeight;
			var speed=Math.abs(dis/timeDis);
			var target=changeY+speed;
			var type = "cubic-bezier(.22,.64,0,.96)";
			var time = Math.abs(speed*.9);
			time = time<300?300:time;

			if(target>=0){
				target=0;
			}else if(target<=-bottomY){
				target=-bottomY;
			}

			oMusicContent.style.transition = time+"ms " + type;
			cssTransform(oMusicContent,"translateY",target);
			document.removeEventListener('touchend',scrollEnd,false);
			document.removeEventListener('touchmove',scrollMove,false);
		}

		function moveScroll(){			//滑屏操作
			document.addEventListener('touchmove',function(ev){
				ev.preventDefault();
			});
			oMusicContent.addEventListener('touchstart',scrollStart,false);
		}

		function show(sName,sMusicName,sImg){	//显示数据
			var oListAudioImg=document.querySelector('.list_audioImg');
			var oListAudioText=document.querySelector('.list_audioText');
			var oListAudioBtn=document.querySelector('.list_audioBtn');
			var oTitle=oListAudioText.querySelector('.title');
			var oName=oListAudioText.querySelector('.name');

			oListAudioImg.setAttribute('src','img/'+sImg);
			oTitle.innerHTML=sMusicName;
			oName.innerHTML=sName;
			oListAudioBtn.style.display='block';
		}

		return{
			init:init,
			show:show,
			next:next,
			prev:prev
		};
	})();

	var musicDetails=(function(){		//音乐详情页
		var oMusicList=document.querySelector('#musicList');
		var oMusicDetails=document.getElementById('musicDetails');
		var oHtml=document.getElementsByTagName('html')[0];
		var htmlHeight=oHtml.getBoundingClientRect().height;
		var htmlWidth=oHtml.getBoundingClientRect().width;
		var oDetails_title=document.querySelector('.details_title');
		var oDetails_Name=oDetails_title.querySelector('.details_name');

		var oDetailsLyric=document.querySelector('.details_lyric');
		var oAudio=document.querySelector('.details_audio');
		var oDetails_lyricUl=document.querySelector('.details_lyricUl');
		var aLyricLi=oDetails_lyricUl.getElementsByTagName('li');
		var oDetailsMessage=document.querySelector('.details_message');

		var re=/\[[^[]+/g;
		var arr=[];

		var liH=0;
		var liMargin=0;

		var downX=0;
		var range=20;

		var oDetails_message=document.querySelector('.details_message');

		var oInfo=document.querySelector('.info');
		var oSend=document.querySelector('.send');
		var oMessage=document.querySelector('.message');

		function init(){
			cssTransform(oMusicDetails,'translateY',htmlHeight);
			cssTransform(oDetails_message,'translateX',htmlWidth);
			bind();
		};

		function slideUp(){
			oMusicDetails.style.transition='0.5s';
			oMusicList.style.transition='0.5s transform'
			cssTransform(oMusicDetails,'translateY',0);
			cssTransform(oMusicList,'translateY',-htmlHeight);
		}

		function slideDown(){
			cssTransform(oMusicDetails,'translateY',htmlHeight);
			cssTransform(oMusicList,'translateY',0);
		}

		function show(sName,sMusicName,sLyric){
			oDetails_Name.innerHTML=sMusicName+'<span class="details_singer">'+sName+'</span>';
			oDetails_lyricUl.innerHTML='';
			cssTransform(oDetails_lyricUl,'translateY',0)

			arr=sLyric.match(re);
			
			for(var i=0;i<arr.length;i++){
				arr[i]=[format(arr[i].substring(0,10)),arr[i].substring(10).trim()];
			}

			for(var i=0;i<arr.length;i++){
				var oLi=document.createElement('li');
				oLi.innerHTML=arr[i][1];

				oDetails_lyricUl.appendChild(oLi);
			}

			aLyricLi[0].className='active';
			liH=aLyricLi[0].offsetHeight;
			liMargin=parseInt(getStyle(aLyricLi[0],'marginTop'));
		}

		function bind(){		//详情页事件绑定
			oDetails_title.addEventListener('touchend',function(){
				slideDown();
			});

			oDetailsLyric.addEventListener('touchstart',function(ev){
				var touch = ev.changedTouches[0];
				downX=touch.pageX;

				document.addEventListener('touchend',changeMessage);
			});

			oDetailsMessage.addEventListener('touchstart',function(ev){
				var touch = ev.changedTouches[0];
				downX=touch.pageX;

				document.addEventListener('touchend',changeMessage);
			});

			oSend.addEventListener('touchend',function(){
				leaveMessage(musicList.id)
			});
		}

		function leaveMessage(index){
			if(oInfo.value!=''){
				var oLi=document.createElement('li');
				
				oLi.innerHTML=oInfo.value;
				oMessage.appendChild(oLi);
				save(index,oInfo.value);
				oInfo.value='';
			}
		}

		function save(key,value){
			localStorage.setItem(key,value);
		}
		function fetch(key){
			return localStorage.getItem(key) || [];
		}

		function changeMessage(ev){
			var touch = ev.changedTouches[0];
			var oDetailsBtn=document.querySelector('.details_btn');
			var aDetailsLi=oDetailsBtn.getElementsByTagName('li');

			if(touch.pageX-downX<-range){	//left
				cssTransform(oDetailsLyric,'translateX',htmlWidth);
				cssTransform(oAudio,'translateX',-htmlWidth);
				cssTransform(oDetails_message,'translateX',0);

				for(var i=0;i<aDetailsLi.length;i++){
					aDetailsLi[i].className="dot";
				}
				aDetailsLi[1].className+=' active';
			}else if(touch.pageX-downX>range){	//right
				cssTransform(oDetailsLyric,'translateX',0);
				cssTransform(oAudio,'translateX',0);
				cssTransform(oDetails_message,'translateX',htmlWidth);

				for(var i=0;i<aDetailsLi.length;i++){
					aDetailsLi[i].className="dot";
				}
				aDetailsLi[0].className+=' active';
			}

			document.removeEventListener('touchend',changeMessage,false);
		}

		function format(num){
			num=num.substring(1,num.length-1);
			var arr=num.split(':');
			
			return (parseFloat(arr[0]*60)+parseFloat(arr[1])).toFixed(2);
		}

		function scrollLyric(ct){

			for(var i=0;i<arr.length;i++){
				aLyricLi[i].className='';

				if(i!=arr.length-1 && ct>arr[i][0] && ct<arr[i+1][0]){
					aLyricLi[i].className='active';
					if(i>7){
						cssTransform(oDetails_lyricUl,'translateY',-(liH+liMargin)*(i-7));
					}else{
						cssTransform(oDetails_lyricUl,0);
					}
					
				}else if(i==arr.length-1 && ct>arr[i][0]){
					aLyricLi[i].className='active';
				}
			}
		}
		return{
			init:init,
			slideUp:slideUp,
			show:show,
			scrollLyric:scrollLyric
		}
	})();

	var musicAudio=(function(){			//音乐播放器操作
		var oAudio=document.getElementById('audio');
		var oListAudioImg=document.querySelector('.list_audioImg');
		var oldClassName=oListAudioImg.className;
		var oListAudioBtn=document.querySelector('.list_audioBtn');

		var oPlay=document.querySelector('.play');
		var oPrev=document.querySelector('.prev');
		var oNext=document.querySelector('.next');
		var oDetailsNowTime=document.querySelector('.details_nowTime');
		var oDetailsAllTime=document.querySelector('.details_allTime');
		var timer=null;

		var scale=0;
		var oDetailsAudioPro=document.querySelector('.details_audioPro');
		var oDetailsAudioProUp=document.querySelector('.details_audioProUp');
		var oDetailsAudioBar=oDetailsAudioPro.querySelector('.details_audioBar');

		var oMusicContent=document.querySelector('.musicContent');

		var disX=0;
		var index=0;

		function init(){
			bind();
		};

		function loadMusic(id){
			//alert(id);
			ajax('./data/musicAudio.json','GET','',function(data){
				var data=JSON.parse(data);
				var message=data[id-1];
				
				show(message);
			})
		}

		function show(obj){
			var sName=obj.name;
			var sMusicName=obj.musicName;
			var sLyric=obj.lyric;
			var sImg=obj.img;
			var sAudio=obj.audio;
			var index=0;
			
			musicList.show(sName,sMusicName,sImg);
			musicDetails.show(sName,sMusicName,sLyric);
			oAudio.src='img/'+sAudio;
			oAudio.addEventListener('canplaythrough',function(){
				play();
				oDetailsAllTime.innerHTML=formatTime(oAudio.duration);
			});
		}

		function play(){
			oListAudioImg.className=oldClassName+' move';
			oListAudioBtn.style.background='url(./img/list_audioPause.png) no-repeat';
			oListAudioBtn.style.backgroundSize='cover';
			oPlay.style.background='url(./img/details_pause.png) no-repeat';
			oPlay.style.backgroundSize='cover';

			
			oAudio.play();
			playing();
			clearInterval(timer);
			timer=setInterval(playing,1000);
		}
		function pause(){

			oListAudioImg.className=oldClassName;
			oListAudioBtn.style.background='url(./img/list_audioPlay.png) no-repeat';
			oListAudioBtn.style.backgroundSize='cover';
			oPlay.style.background='url(./img/details_play.png) no-repeat';
			oPlay.style.backgroundSize='cover';
			oAudio.pause();
			clearInterval(timer);
		}
		function formatTime(num){
			num=parseInt(num);
			var iM=Math.floor(num%3600/60);
			var iS=Math.floor(num%60);
			return toZero(iM)+':'+toZero(iS);
		}
		function toZero(num){
			if(num<10){
				return '0'+num;
			}else{
				return ''+num;
			}
		}
		function playing(){
			scale=oAudio.currentTime/oAudio.duration;

			oDetailsNowTime.innerHTML=formatTime(oAudio.currentTime);
			oDetailsAudioProUp.style.width=scale*100+'%';
			oDetailsAudioBar.style.left=scale*100+'%';
			musicDetails.scrollLyric(oAudio.currentTime);
		}
		function bind(){
			oDetailsAudioBar.addEventListener('touchstart',function(ev){
				clearInterval(timer);
				console.log(1);
				var touch = ev.changedTouches[0];
				disX=touch.pageX-this.offsetLeft;

				document.addEventListener('touchmove',moveBar);
				document.addEventListener('touchend',endBar);
				return false;
			});

			oAudio.addEventListener('ended',musicList.next);
			oNext.addEventListener('touchend',musicList.next);
			oPrev.addEventListener('touchend',musicList.prev);

			function endBar(ev){
				oAudio.currentTime=scale*oAudio.duration;
				clearInterval(timer);
				timer=setInterval(playing,1000);
				musicDetails.scrollLyric(oAudio.currentTime);
				document.removeEventListener('touchmove',moveBar,false);
				document.removeEventListener('touchend',endBar,false);
			};

			function moveBar(ev){
				var touch = ev.changedTouches[0];
				var L=touch.pageX-disX;
				if(L<0){
					L=0;
				}else if(L>oDetailsAudioPro.offsetWidth){
					L=oDetailsAudioPro.offsetWidth
				}
				scale=L/oDetailsAudioPro.offsetWidth;
				oDetailsAudioBar.style.left=L+'px';
			}
		};


		return {
			init:init,
			loadMusic:loadMusic,
			play:play,
			pause:pause
		}
	})();

	init();
}
function getByClass(oParent,cclass){
	var aEle=oParent.getElementsByTagName('*');
	var reg=new RegExp('\\b'+cclass+'\\b',i);
	var aResult=[];
	for(var i=0;i<aEle.length;i++){
		if(reg.test(aEle[i].className)){
			aResult.push(aEle[i]);
		}
	}
	return aResult;
}
function cssTransform(obj,attr,val){
	if(!obj.transform){
		obj.transform={};
	};

	if(arguments.length>2){
		obj.transform[attr]=val;
		var sVal='';

		for(var s in obj.transform){
			switch(s){
				case "rotate":
				case "skewX":
				case "skewY":
					sVal+=s+"("+obj.transform[s]+"deg)";
					break;
				case "translateX":
				case "translateY":
					sVal+=s+"("+obj.transform[s]+"px)";
					break;
				case "scaleX":
				case "scaleY":
				case "scale" :
					sVal+=s+"("+obj.transform[s]+")";
					break;
			}

			obj.style.webkitTransform=obj.style.transform=sVal;
		}
	}
	else{
		val=obj.transform[attr];
		if(typeof val=='undefined'){
			if(attr=='scale'||attr=='scaleX'||attr=='scaleY'){
				val = 1;
			}
			else{
				val=0;
			}
		}
		return val;		
	}	
}
function getStyle(obj,attr){
	if(obj.currentStyle)
		return obj.currentStyle(attr,false);
	else
		return getComputedStyle(obj,false)[attr];
}