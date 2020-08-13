// moment.js required
var moment = Moment.moment;
Logger = BetterLog.useSpreadsheet('1LQJT0RzVdqS9bqSulrA_PIkPERZw1CH4hVNZwknLd6k');
var newline = "\n";
var emoji_ball = '⚾';
var emoji_shock = '😱';
var emoji_star = '⭐';
var obj_channel = new Object();
obj_channel['FOX'] = 'ETW1';
obj_channel['FOX2'] = 'STW1';
obj_channel['FOX3'] = 'ETWA';

function askfox(team) {
	var today = moment(moment().valueOf()).format('YYYYMMDD');
	var ret = '';

	for(var i in obj_channel) {
		var url = 'https://tv.foxsports.com.tw/getEPG.php?lang=zh-tw&channelCode=' + obj_channel[i] + '&date=' + today + '&tz=480';
		var response = UrlFetchApp.fetch(url);
		var obj = JSON.parse(response.getContentText());
		ret += (ret.length > 0 ? newline : '') + parser(obj, team);
	}
	
	return ret;
}

function parser(obj, team) {
	var ret = '';
	Object.keys(obj).forEach(function(key) {
		Object.keys(obj[key]).forEach(function(k) {
			if(obj[key][k].sub_genre == '棒球' 
				&& obj[key][k].live == 'L'
				&& obj[key][k].programme.indexOf('日本') > 0
				&& obj[key][k].programme.indexOf(team) > 0) {
				ret += emoji_ball + moment(new Date(obj[key][k].date + ' ' + obj[key][k].start_time)).format('YYYY/MM/DD HH:mm');
				ret += newline + '[' + Object.keys(obj_channel).find(kk => obj_channel[kk] === obj[key][k].channel_code) + ']' + obj[key][k].programme;
			}
		});
	});
	
	return ret;
}

function doPost(e) {
	var msg = JSON.parse(e.postData.contents);
	var events = msg.events[0];
	if (events) {
		var replyToken =	events.replyToken;
		var userMessage = events.message.text;
		Logger.log('userMessage:' + userMessage);
		var userId = events.source && events.source.userId;
		var ary_ret = commandParser(userMessage);
		var command = ary_ret[0];
		var is_team = ary_ret[1];
		if(is_team) {
			msg = askfox(command);
			if(msg.length == 0) msg = repeat(emoji_shock, 8, false, true) + command + ' 本日無直播' + repeat(emoji_shock, 8, true, false);
		} else {
			if(command) {
				msg = command;
			} else {
				msg = '無效指令';
			}
		}

		reply(replyToken, msg);
	}
}

// return false if msg is invalid
function commandParser(msg) {
	var ret = '';
	var is_team = true;
	
	switch(msg) {
		case '日':
			ret = '火腿';
			break;
		case '西':
			ret = '西武';
			break;
		case '樂':
			ret = '樂天';
			break;
		case '軟':
			ret = '軟銀';
			break;
		case '歐':
			ret = '歐力士';
			break;
		case '羅':
			ret = '羅德';
			break;
		case 'h':
			is_team = false;
			ret = repeat(emoji_star, 8, false, true) 
				+ '指令表' + newline 
				+ '「h」: 本表' + newline
				+ '「日」: 查火腿本日直播' + newline
				+ '「西」: 查西武本日直播' + newline
				+ '「樂」: 查樂天本日直播' + newline
				+ '「軟」: 查軟銀本日直播' + newline
				+ '「歐」: 查歐力士本日直播' + newline
				+ '「羅」: 查羅德本日直播'
				+ repeat(emoji_star, 8, true, false);
			break;			
		default:
			is_team = false;
			return [false, false];
	}
	
	
	return [ret, is_team];
}

function reply(replyToken, msg) {
	var CHANNEL_ACCESS_TOKEN = '54mJpwyLoWXzvPeZO8QvHpxVZaxWz/Yzce/hVUUFHqVOps+9Mxp5VbuJ1TIBtdMfnjgTg+jgEmNoq2QMLrl9jp6F5079LU5gnJkEZ+qN5+pWFh5qnXOV7FsUnW/DyoyghVuR/oL5S9CFivCDiq9+dAdB04t89/1O/w1cDnyilFU=';
	var payload = {
		replyToken: replyToken,
		messages: [{
			'type': 'text',
			'text': msg
		}]
	};
	var option = {
		'headers': {
			'Content-Type': 'application/json; charset=UTF-8',
			'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
		},
		'method': 'post',
		'payload': JSON.stringify(payload)
	};
			
	UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', option);
}

function push(userId, team, msg) {
	var CHANNEL_ACCESS_TOKEN = '54mJpwyLoWXzvPeZO8QvHpxVZaxWz/Yzce/hVUUFHqVOps+9Mxp5VbuJ1TIBtdMfnjgTg+jgEmNoq2QMLrl9jp6F5079LU5gnJkEZ+qN5+pWFh5qnXOV7FsUnW/DyoyghVuR/oL5S9CFivCDiq9+dAdB04t89/1O/w1cDnyilFU=';
	var payload = {
		to: userId,
		messages: [{
			'type': 'text',
			'text': msg
		}]
	};
	var option = {
		'headers': {
			'Content-Type': 'application/json; charset=UTF-8',
			'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
		},
		'method': 'post',
		'payload': JSON.stringify(payload)
	};
			
	UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', option);
}

function repeat(str, count, is_newline_before, is_newline_after) {
	var ret = '';
	for(var i=0; i < count; i++) {
		ret += str;
	}
	return (is_newline_before ? newline : '') + ret + (is_newline_after ? newline : '');
}