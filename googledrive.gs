var GoogleDrive = ((gd) => {
	var driveApp = DriveApp;

	gd.getImageUrl = (name) => {
		try {
			var files = driveApp.getFilesByName(name + ".jpg");
            if(!files.hasNext()) files = driveApp.getFilesByName(name + ".png");
            
			return (files.hasNext()) ? 'https://lh3.googleusercontent.com/d/' + files.next().getId() : null;
		} catch (ex) {
			GoogleSheet().logError('GoogleDrive.getImageUrl:::' + ex);
		}
	};

	return gd;
})(GoogleDrive || {});