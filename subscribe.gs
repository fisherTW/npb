var Subscribe = ((ss) => {
	ss.process = (e) => {

			msg = {
				'type' : 'text',
				'text' : e.parameter.time
			};				

		return msg;
	};
	return ss;
})(Subscribe || {});