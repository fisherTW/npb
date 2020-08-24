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
					msg = {
						'type' : 'text',
						'text' : command
					};				
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
						var notifyTime = command.replace('h.settime','');
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