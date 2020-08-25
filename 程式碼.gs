// moment.js required
var moment = Moment.moment;
Logger = BetterLog.useSpreadsheet('1LQJT0RzVdqS9bqSulrA_PIkPERZw1CH4hVNZwknLd6k');
var sheet_setting		= '1UJ6XNl7dnEbX0L2XU9Ybpwp3UeezIbfCpEl_WUDdBhY';
var notify_client_id	= 'W9OXlaOdhSNKz85jcqU6Ib';
var url_donate			= 'https://p.ecpay.com.tw/57C3587';
// dont use directly
var url_gas_npb			= 'https://script.google.com/macros/s/AKfycbwjoQW3htDOFlyQNji9f3YpY8h5rOIQOk6kOHwFvnmJM3-7GLA/exec';

var url_gas_npb_robot	= url_gas_npb + '?act=robot';
var url_gas_npb_sub		= url_gas_npb + '?act=subscribe';

var url_gas_npb_notify	= 'https://script.google.com/macros/s/AKfycbx3dFPPqrhppQ508EFDQPUo67UrnNZNL9rdCtJWyi5pJPaE0vw/exec';

var url_bot_reply		= 'https://api.line.me/v2/bot/message/reply';

var url_notify 			= 'https://notify-bot.line.me/oauth/authorize?response_type=code&scope=notify&client_id=' + notify_client_id + '&redirect_uri=' + url_gas_npb_notify;
var url_notify_revoke	= 'https://notify-api.line.me/api/revoke';

var url_pic_live		= 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/restaurant_large_32.png';
var str_sep = '[-S-]';
var newline = "\n";
var emoji_ball	= '⚾';
var emoji_shock	= '😱';
var emoji_star	= '⭐';
var emoji_ok 	= '👍';
var emoji_shiny	= '✨';
var emoji_heart	= '💕';
var obj_channel = new Object();
var CHANNEL_ACCESS_TOKEN = getSetting(1, 1);
var msg_donate = emoji_shiny + emoji_ok + '小額贊助開發者' + emoji_shiny + emoji_ok + newline
	+ repeat(emoji_star, 3, false, false) + '10 元起' + repeat(emoji_star, 3, false, false) + newline
	+ url_donate + newline
	+ emoji_ok + emoji_heart + emoji_ok + emoji_heart + emoji_ok + emoji_heart + emoji_ok + emoji_heart + emoji_ok;
obj_channel['FOX'] = 'ETW1';
obj_channel['FOX2'] = 'STW1';
obj_channel['FOX3'] = 'ETWA';

function doPost(e) {
	var msg = JSON.parse(e.postData.contents);
	var events = msg.events[0];
	if (events) {
		var replyToken =	events.replyToken;

		try {		
			var act = (e.parameter.act != 'undefined') ? e.parameter.act : '';
			switch(act) {
				case 'robot': 
					msg = Robot.process(events);		
					break;
				case 'subscribe': 
					msg = Subscribe.process(events);		
					break;
				default:
					msg = '';
			}
			reply(replyToken, msg);
		} catch (ex) {
			Logger.log('doPost catch:::[' + ex.stack);
		}
	}
}

function askfox(team) {
	var today = moment(moment().valueOf()).format('YYYYMMDD');
	//var today = moment(moment().add(1, 'd').valueOf()).format('YYYYMMDD');
	var ary_ret = [];

	for(var i in obj_channel) {
		var url = 'https://tv.foxsports.com.tw/getEPG.php?lang=zh-tw&channelCode=' + obj_channel[i] + '&date=' + today + '&tz=480';
		var response = UrlFetchApp.fetch(url);
		var obj = JSON.parse(response.getContentText());
		var tmp = parser(obj, team);
		if(tmp.length > 0) {
			ary_ret.push(tmp);
		}
	}
	
	return ary_ret;
}

function parser(obj, team) {
	var ret = '';
	Object.keys(obj).forEach(function(key) {
		Object.keys(obj[key]).forEach(function(k) {
			if(obj[key][k].sub_genre == '棒球' 
				&& obj[key][k].live == 'L'
				&& obj[key][k].programme.indexOf('日本') > 0
				&& obj[key][k].programme.indexOf(team) > 0) {

				ret = obj[key][k].programme + str_sep + Object.keys(obj_channel).find(kk => obj_channel[kk] === obj[key][k].channel_code) + str_sep + moment(new Date(obj[key][k].date + ' ' + obj[key][k].start_time)).format('HH:mm');
			}
		});
	});
	
	return ret;
}

// ary_data.length = 0 =>本日無
function templater(ary_data, team) {
	var ary_contents = [];
	var obj_ret = {
		"type": "flex",
		"altText": "NPB 直播君",
		"contents": {
			"type": "bubble",
			"header": {
				"type": "box",
				"layout": "vertical",
				"flex": 0,
				"contents": [
					{
						"type": "text",
						"text": "NPB 直播君",
						"size": "sm",
						"weight": "bold",
						"color": "#AAAAAA"
					}
				]
			},
			"body": {
				"type": "box",
				"layout": "vertical",
				"spacing": "md",
				"action": {
					"type": "uri",
					"label": "Action",
					"uri": url_donate
				},
				"contents": [
					{
						"type": "text",
						"text": moment(moment().valueOf()).format('MM/DD'),
						"size": "xl",
						"weight": "bold"
					},
					{
						"type": "box",
						"layout": "vertical",
						"spacing": "sm",
						"contents": ''
					}
				]
			},
			"footer": {
				"type": "box",
				"layout": "vertical",
				"contents": [
					{
						"type": "spacer",
						"size": "xxl"
					},
					{
						"type": "text",
						"text": "小額贊助開發者貓糧",
						"size": "xxs",
						"align": "center",
						"color": "#AAAAAA",
						"action": {
							"type": "uri",
							"uri": url_donate
						}
					}				
				]
			}
		}
	};


	if(ary_data.length == 0) {
		ary_contents[0] = {
			"type": "box",
			"layout": "baseline",
			"contents": [
				{
					"type": "text",
					"text": team + '本日無直播',
					"flex": 0,
					"margin": "sm",
					"weight": "bold"
				}
			]
		};
	} else {
		for(var i=0; i < ary_data.length; i++) {
			var ary_text = ary_data[i].split(str_sep);
			ary_text[0] = ary_text[0].split(':');
			var obj = {
				"type": "box",
				"layout": "baseline",
				"contents": [
					{
						"type": "icon",
						"url": url_pic_live
					},
					{
						"type": "text",
						"text": ary_text[0][1],//"火腿vs.樂天",
						"flex": 0,
						"margin": "sm",
						"weight": "bold"
					},
					{
						"type": "text",
						"text": ary_text[1],//"FOX3",
						"align": "center"
					},
					{
						"type": "text",
						"text": ary_text[2],//"17:00",
						"size": "sm",
						"align": "end",
						"color": "#AAAAAA"
					}
				]
			};
			if(i != 0) ary_contents.push({"type": "separator"});
			ary_contents.push(obj);
		}
		var obj_push = 	
			{
				"type": "button",
				"action": {
					"type": "postback",
					"label": "通知",
					"data": "h.remind" + ary_text[2]
				},
				"color": "#000000",
				"style": "primary"
			};
		obj_ret.contents.footer.contents.push(obj_push);
	}
	obj_ret.contents.body.contents[1].contents = ary_contents;

	return obj_ret;
}

function bubble_status_subs(userId) {
	var obj = 
	{
		"type": "flex",
		"altText": "NPB 直播君",
		"contents": {
			"type": "bubble",
			"direction": "ltr",
			"header": {
				"type": "box",
				"layout": "vertical",
				"contents": [
					{
						"type": "text",
						"text": "NPB 直播君",
						"size": "sm",
						"align": "start",
						"weight": "bold",
						"color": "#AAAAAA"
					}
				]
			},
			"body": {
				"type": "box",
				"layout": "vertical",
				"contents": [
					{
						"type": "text",
						"text": "未連動",
						"size": "xl",
						"align": "start",
						"gravity": "center",
						"weight": "bold"
					}
				]
			},			
			"footer": {
				"type": "box",
				"layout": "horizontal",
				"contents": [
					{
						"type": "button",
						"action": {
							"type": "uri",
							"label": "進行連動",
							"uri": url_notify + '&state=' + userId
						},
						"color": "#000000",
						"style": "primary"
					}	
				]
			}
		}
	}

	if(is_subscribed(userId)) {
		obj.contents.body.contents[0].text = '已連動';
		obj.contents.footer = null;
	}
	Logger.log('bubble_status_subs:::url_notify='+url_notify + '&state=' + userId);
	return obj;
}

function bubble_remind(time) {
	var obj = 
	{
		"type": "flex",
		"altText": "NPB 直播君",
		"contents": {
			"type": "bubble",
			"direction": "ltr",
			"header": {
				"type": "box",
				"layout": "vertical",
				"contents": [
					{
						"type": "text",
						"text": "NPB 直播君",
						"size": "sm",
						"align": "start",
						"weight": "bold",
						"color": "#AAAAAA"
					}
				]
			},
			"body": {
				"type": "box",
				"layout": "vertical",
				"contents": [
					{
						"type": "text",
						"text": "今天",
						"size": "xl",
						"align": "start",
						"gravity": "center",
						"weight": "bold"
					},
					{
						"type": "text",
						"text": time,
						"size": "4xl",
						"align": "center",
						"weight": "bold"
					}
				]
			},
			"footer": {
				"type": "box",
				"layout": "horizontal",
				"contents": [
					{
						"type": "button",
						"action": {
							"type": "datetimepicker",
							"label": "設定提醒",
							"data": "h.settime" + time,
							"mode": "time",
							"initial": time,
							"max": time,
							"min": "10:00"
						},
						"color": "#000000",
						"style": "primary"
					}
				]
			}
		}
	}
	return obj;
}

function is_subscribed(userId) {
	var spreadsheet = SpreadsheetApp.openById(sheet_setting);
	var sheet = spreadsheet.getSheets()[1];
	var range = sheet.getDataRange();
	var textFinder = range.createTextFinder(userId);
	var locations = [];

	var occurrences = textFinder.findAll().map(x => x.getA1Notation());

	if (occurrences == '') {
		return false;
	} else {
		return true;
	}  
}

// B4 x=2, y=4
function getSetting(x, y) {
	var spreadsheet = SpreadsheetApp.openById(sheet_setting);
	var sheet = spreadsheet.getSheets()[0];
	var ret = sheet.getSheetValues(y,x,1,1);

	return ret;
}

// return false if msg is invalid
function commandParser(msg) {
	var ret = '';
	var is_team = true;
	var msg_ori = msg;

	if(msg.indexOf('h.remind') >= 0) {
		msg = 'h.remind';
	}
	if(msg.indexOf('h.settime') >= 0) {
		msg = 'h.settime';
	}	
	
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
		case 'h.remind':
		case 'h.settime':
		case 'h.status_subs':
		case 'h.do_subs':
			is_team = false;
			ret = msg_ori;
			break;
		default:
			is_team = false;
			return [false, false];
	}

	return [ret, is_team];
}

function reply(replyToken, msg) {
	var payload = {
		replyToken: replyToken,
		messages: [msg]
	};	
	var option = {
		'headers': {
			'Content-Type': 'application/json; charset=UTF-8',
			'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
		},
		'method': 'post',
		'payload': JSON.stringify(payload)
	};
			
	UrlFetchApp.fetch(url_bot_reply, option);
}

// not tested
function revoke(token) {
	var option = {
		'headers': {
			'Content-Type': 'application/json; charset=UTF-8',
			'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
		},
		'method': 'post',
		'payload': JSON.stringify(payload)
	};
			
	UrlFetchApp.fetch(url_notify_revoke, option);
}

// no use
function push(userId, msg) {
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
			
	UrlFetchApp.fetch(url_bot_reply, option);
}

function repeat(str, count, is_newline_before, is_newline_after) {
	var ret = '';
	for(var i=0; i < count; i++) {
		ret += str;
	}
	return (is_newline_before ? newline : '') + ret + (is_newline_after ? newline : '');
}

function updateDb(userId, notifyTime) {
	var spreadsheet = SpreadsheetApp.openById(sheet_setting);
	var sheet = spreadsheet.getSheets()[1];
	var range = sheet.getDataRange();
	var textFinder = range.createTextFinder(userId);
	var locations = [];

	var occurrences = textFinder.findAll().map(x => x.getA1Notation());

	if (occurrences != '') {
		var row_to_write = occurrences[0].replace('A','');
		sheet.getRange("c"+row_to_write).setValue(notifyTime);
	} else {
		Logger.log('updateDb error: cant find userId:' + userId);
	}
}

// shared func
// userId | accToken | notifyTime(option)
function writeDb(userId, accToken) {
	var spreadsheet = SpreadsheetApp.openById(sheet_setting);
	var sheet = spreadsheet.getSheets()[1];
	var row_to_write = getFirstEmptyRowWholeRow();
	sheet.getRange("a"+row_to_write).setValue(userId);
	sheet.getRange("b"+row_to_write).setValue(accToken);
}

function getFirstEmptyRowWholeRow() {
	var spreadsheet = SpreadsheetApp.openById(sheet_setting);
	var sheet = spreadsheet.getSheets()[1];
	var range = sheet.getDataRange();
	var values = range.getValues();
	var row = 0;
	for (var row=0; row<values.length; row++) {
	  if (!values[row].join("")) break;
	}
	return (row+1);
}