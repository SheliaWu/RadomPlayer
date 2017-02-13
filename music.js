//播放控制
var myAudio=$("audio")[0];
var lyricArr=[];
//播放/暂停控制
$(".btn1").click(function(){
	if(myAudio.paused){
		play();
	} else{
		pause();
	}
});
//频道切换
$('.btn2').click(function(){
	getChannel();
})
//播放下一曲音乐
$('.btn3').click(function(){
	getmusic();
})
function play(){
	myAudio.play();
	$('.btn1').removeClass('glyphicon-play').addClass('glyphicon-pause');
}
function pause(){
	myAudio.pause();
	$('.btn1').removeClass('glyphicon-pause').addClass('glyphicon-play');
}
//获取频道信息
function getChannel(){
	$.ajax({
		url:'http://api.jirengu.com/fm/getChannels.php',
		dataType:'json',
		Method:'get',
		success:function(response){
			var channels=response.channels;
			var num=Math.floor(Math.random()*channels.length);
			var channelname=channels[num].name;
			var channelId=channels[num].channel_id;
			$('.record').text(channelname);
			$('.record').attr('title',channelname);
			$('.record').attr('data-id',channelId);
			getmusic();
		}
	})
}
//通过ajax获取歌曲
function getmusic(){
	$.ajax({
		url:'http://api.jirengu.com/fm/getSong.php',
		dataType:'json',
		Method:'get',
		data:{
			'channel': $('.record').attr('data-id')
		},
		success:function(ret){
			var resourse=ret.song[0],
				url=resourse.url,
				bgPic=resourse.picture,
				sid=resourse.sid,
				ssid=resourse.ssid,
				title=resourse.title,
				author=resourse.artist;
			$('audio').attr('src',url);
			$('audio').attr('sid',sid);
			$('audio').attr('ssid',ssid);
			$('.musicname').text(title)
			$('.musicname').attr('title',title);
			$('.singer').text(author);
			$('.singer').attr('title',author)
			$('.top').css({
				'background':'url('+bgPic+')',
				'background-repeat':'no-repeat',
				'background-attachment':'fixed',
				'background-position':'center',
				'background-size':'cover',
			});
			play();//播放
			if($('.glyphicon-star').hasClass('stared')){
				$('.glyphicon-star').removeClass('stared');
			};
			if($('.glyphicon-heart').hasClass('loved')){
				$('.glyphicon-heart').removeClass('loved');
			}
			$('.glyphicon-star').removeClass('stared');
			getlyric();//获取歌词
		}
	})
};
//获取歌词
function getlyric(){
	var Sid=$('audio').attr('sid');
	var Ssid=$('audio').attr('ssid');
	$.post('http://api.jirengu.com/fm/getLyric.php',{ssid:Ssid,sid:Sid})
	.done(function(lyr){
		//解析歌词
		console.log(lyr); 
		var lyr=JSON.parse(lyr);
		//!!一般用来将后面的表达式强制转换为布尔类型的数据（boolean）
		if(!!lyr.lyric){
			$('.music-lyrics .lyric').empty();
			var line=lyr.lyric.split('\n');
			var timeReg=/\[\d{2}:\d{2}.\d{2}\]/g;//时间正则
			var result=[];
			//result是一个时间（秒）+歌词数组
			if(line!=""){
				for(var i in line){
					var time=line[i].match(timeReg);//每组匹配时间，得到时间数组
					if(!time) continue;
					var value=line[i].replace(timeReg,"");//纯歌词
					for(var j in time){
						var t=time[j].slice(1,-1).split(':');
						var timeArr=parseInt(t[0],10)*60+parseFloat(t[1]);
						result.push([timeArr,value]);
					}
				}
			}
			//时间排序
			result.sort(function(a,b){
				return a[0]-b[0]
			});
			lyricArr=result;
			renderLyric();//渲染歌词
		}
	}).fail(function(){
		$('.music-lyrics .lyric').html("<li>本歌曲展示没有歌词</li>");
	})
}
//渲染分词页
function renderLyric(){
	var lyrLine="";
	for(var i=0;i<lyricArr.length;i++){
		lyrLine += "<li data-time='"+lyricArr[i][0]+"'>"+lyricArr[i][1]+"</li>";
	}
	$('.music-lyrics .lyric').append(lyrLine);
	setInterval(showLyric,100);
}
function showLyric(){
	var liH=$(".lyric li").eq(5).outerHeight()-3;//每行高度
	for(var i=0;i<lyricArr.length;i++){
		var curT=$(".lyric li").eq(i).attr('data-time');
		var nexT=$('.lyric li').eq(i+1).attr("data-time");
		var curTime=myAudio.currentTime;
		if((curTime>curT)&&(curTime<nexT)){
			$('.lyric li').removeClass('active');
			$('.lyric li').eq(i).addClass('active');
			$('.music-lyrics .lyric').css('top',-liH*(i-2))
		}
	}

}

//进度条控制
setInterval(present,500);

$('.basebar').mousedown(function(ev){
	var posX=ev.clientX;
	var targetLeft=$(this).offset().left;
	var percentage=(posX-targetLeft)/400*100;
	myAudio.currentTime=myAudio.duration*percentage/100;
})

function present(){
	var length=myAudio.currentTime/myAudio.duration*100;
	$('.progressbar').width(length+'%');
	if(myAudio.currentTime==myAudio.duration){
		getmusic();
	}
}
//icon
$('.glyphicon-star').on('click',function(){
	$(this).toggleClass('stared')
})
$('.glyphicon-heart').on('click',function(){
	$(this).toggleClass('loved')
})
$('.glyphicon-repeat').on('click',function(){
	$(this).toggleClass('recycled').toggleClass('colored');
	if ($(this).hasClass('recycled')) {
		$('audio').attr('loop','loop');
	}
	if($(this).hasClass('colored')){
		$('audio').removeAttr('loop','no-loop');
	}
})
$('.glyphicon-align-justify').on('click',function(){
	$(this).toggleClass('lyriced');
	if ($(this).hasClass('lyriced')) {
		$('.top .music-lyrics').css({'display':'block'})
	}else{
		$('.top .music-lyrics').css({'display':'none'})
	}
})
$(document).ready(getChannel())