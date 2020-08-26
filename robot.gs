var Robot = ((rb) => {
	rb.process = (events) => {
		Logger.log(JSON.stringify(events));
		var msg = '';
		var userMessage = (typeof(events.message) === 'undefined') ? events.postback.data : events.message.text;
		Logger.log('userMessage:' + userMessage);
		var userId = events.source && events.source.userId;
		var ary_ret = commandParser(userMessage);
		var command = ary_ret[0];
		var is_team = ary_ret[1];
		if(is_team) {
			msg = templater(askfox(command), command);
		} else {
			if(command) {
				if(command == 'h') {
					var ary_quickReply_item = [
						{
							'label': '指令表',
							'text' : 'h'
						},
						{
							'label': '提醒連動查詢',
							'text' : 'h.status_subs'
						}
					];
					var str = repeat(emoji_star, 8, false, true) 
						+ '指令表' + newline 
						+ '「h」: 本表' + newline
						+ '「h.status_subs」: 提醒連動查詢' + newline
						+ '「日」: 查火腿本日直播' + newline
						+ '「西」: 查西武本日直播' + newline
						+ '「樂」: 查樂天本日直播' + newline
						+ '「軟」: 查軟銀本日直播' + newline
						+ '「歐」: 查歐力士本日直播' + newline
						+ '「羅」: 查羅德本日直播' + newline + newline
						+ '手機請多利用下方快速按鈕～' + newline
						+ '※央聯無直播'
						+ repeat(emoji_star, 8, true, true)
						+ msg_donate;
					msg = {
						'type' : 'text',
						'text' : str
					};
					msg.quickReply = {};
					msg.quickReply.items = get_quickReply_item(ary_quickReply_item);
				} else {
					if(command.indexOf('h.remind') >= 0) {
						try {
							Logger.log(JSON.stringify(bubble_remind(command.replace('h.remind',''))));
							msg = bubble_remind(command.replace('h.remind',''));
						} catch(ex) {
							Logger.log(ex);
						}
						
					} else if(command.indexOf('h.settime') >= 0) {
						var userId = events.source.userId;
						var notifyTime = events.postback.params.time;
						updateDb(userId, notifyTime);
						msg = {
							'type' : 'text',
							'text' : '設定提醒完成！'
						};						
					} else if(command.indexOf('h.status_subs') >= 0) {
						var userId = events.source.userId;
						msg = bubble_status_subs(userId);						
					}
				}
			} else {
				msg = {
					'type' : 'text',
					'text' : '無效指令'
				};
			}
		}

		return msg;
	};
	return rb;
})(Robot || {});