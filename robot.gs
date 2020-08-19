var Robot = ((rb) => {
	rb.process = (events) => {
		var msg = '';
		var userMessage = events.message.text;
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
					if(msg.indexOf('h.remind') > 0) {
						try() {
							msg = bubble_remind(msg.replace('h.remind',''));
						} catch(ex) {
							Logger.log(ex);
						}
						
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