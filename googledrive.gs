var GoogleDrive = ((gd) => {
	var driveApp = DriveApp;
    var url_pic_gd_base     = 'https://drive.google.com/uc?export=view&id=';
    var url_pic_gd_base     = 'https://lh3.googleusercontent.com/d/';

	gd.getImageUrl = (name) => {
		try {
			var files = driveApp.getFilesByName(name + ".jpg");
            if(!files.hasNext()) files = driveApp.getFilesByName(name + ".png");

			return (files.hasNext()) ? url_pic_gd_base + files.next().getId() : null;
		} catch (ex) {
			GoogleSheet().logError('GoogleDrive.getImageUrl:::' + ex);
		}
	};

	return gd;
})(GoogleDrive || {});