var Subscribe = ((ss) => {
	ss.process = (events) => {
		//return HtmlService.createHtmlOutput(
		//	"<script>window.top.location.href='"+ url_notify + '&state=' + events.source.userId() +"';</script>"
		//);
	};
	return ss;
})(Subscribe || {});