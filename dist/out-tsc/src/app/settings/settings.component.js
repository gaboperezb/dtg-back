import { __decorate } from "tslib";
import { Component } from '@angular/core';
let SettingsComponent = class SettingsComponent {
    constructor(location, router, authService) {
        this.location = location;
        this.router = router;
        this.authService = authService;
        this.action = "";
        this.waiting = false;
        this.profilePicture = "";
        this.count = 150;
        this.max = 150;
        this.username = "";
        this.currentPassword = "";
        this.bio = "";
        this.newPassword = "";
        this.confirmPassword = "";
        this.selection = false;
    }
    ngOnInit() {
        this.initialSettings();
        this.count = this.max - this.bio.length;
    }
    change(action) {
        this.selection = true;
        this.action = action;
    }
    goBack() {
        if (!this.waiting) {
            this.selection = false;
            this.action = "";
        }
    }
    signout() {
        var r = confirm("Do you want to sign out?");
        if (r == true) {
            this.authService.logOut();
            this.router.navigateByUrl('/');
        }
        else {
        }
    }
    goAccess() {
        this.authService.toggleAccess = true;
        this.authService.chooseLeagues = true;
    }
    initialSettings() {
        this.profilePicture = this.authService.currentUser.profilePicture;
        if (this.authService.currentUser.bio)
            this.bio = this.authService.currentUser.bio;
        if (!!this.authService.currentUser.coverPhoto) {
            this.coverPhoto = {
                'background-image': 'url(' + this.authService.currentUser.coverPhoto + ')',
            };
        }
        else {
            this.coverPhoto = {
                'border': '1px dashed #b7b7b7',
                'border-radius': '10px',
            };
        }
    }
    wordCount() {
        this.count = this.max - this.bio.length;
    }
    onChange(event) {
        if (this.action != 'profile') {
            let eventObj = event;
            let target = eventObj.target;
            let files = target.files;
            this.file = files[0];
            this.fileType = this.file.type;
            this.fileName = this.authService.randomString(7) + this.authService.currentUser.username + '.' + this.file.type.split('/')[1];
            if (!this.file.name.match(/.(jpg|jpeg|png)$/i)) {
                this.file = undefined;
                this.authService.errorMessage = "Format not valid";
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
                return;
            }
            if (FileReader && files && files.length) {
                var fr = new FileReader();
                fr.onload = () => {
                    this.coverPhoto = {
                        'background-image': 'url(' + fr.result + ')',
                    };
                };
                fr.readAsDataURL(files[0]);
            }
            let maxWidth = 1000;
            //External library (orientation=true desactiva el exif data)
            loadImage(this.file, (img) => {
                if (img.type === "error") {
                    this.authService.errorMessage = "Error loading image";
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);
                }
                else {
                    img.toBlob((blob) => {
                        this.file = blob;
                    }, this.fileType);
                }
            }, {
                maxWidth: maxWidth,
                orientation: true
            });
            // FileReader support (Para cargar la imagen en el img tag)
            if (this.file == null) {
                this.authService.errorMessage = "No file selected";
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
            }
        }
        else {
            let eventObj = event;
            let target = eventObj.target;
            let files = target.files;
            if (!files[0].name.match(/.(jpg|jpeg|png)$/i)) {
                this.authService.errorMessage = "Format not valid";
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
                return;
            }
            this.file = files[0];
            this.fileThumbnail = files[0];
            this.fileType = this.file.type;
            this.fileTypeThumbnail = this.fileType;
            this.fileName = this.authService.randomString(7) + this.authService.currentUser.username + '.' + this.file.type.split('/')[1];
            this.fileNameThumbnail = this.authService.randomString(7) + "-thumb" + this.authService.currentUser.username + '.' + this.file.type.split('/')[1];
            if (FileReader && files && files.length) {
                var fr = new FileReader();
                fr.onload = () => {
                    this.profilePicture = fr.result;
                };
                fr.readAsDataURL(files[0]);
            }
            //External library (orientation=true desactiva el exif data)
            loadImage(this.file, (img) => {
                if (img.type === "error") {
                    this.authService.errorMessage = "Error loading image";
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);
                }
                else {
                    img.toBlob((blob) => {
                        this.file = blob;
                        //THUMBNAIL
                        loadImage(this.fileThumbnail, (img) => {
                            if (img.type === "error") {
                                this.authService.errorMessage = "Error loading image";
                                setTimeout(() => {
                                    this.authService.errorMessage = null;
                                }, 5000);
                            }
                            else {
                                img.toBlob((blob) => {
                                    this.fileThumbnail = blob;
                                }, this.fileType);
                            }
                        }, {
                            maxWidth: 160,
                            orientation: true
                        });
                    }, this.fileType);
                }
            }, {
                maxWidth: 500,
                orientation: true
            });
            // FileReader support (Para cargar la imagen en el img tag)
            if (this.file == null) {
                this.authService.errorMessage = "No file selected";
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
            }
        }
    }
    getSignedRequestProfile() {
        //NORMAL IMAGE
        this.authService.getSignedRequest(this.fileName, this.fileType)
            .subscribe((response) => {
            let signedRequestAWS = response.signedRequest;
            let urlAWS = response.url;
            //THUMBNAIL IMAGE
            this.authService.getSignedRequest(this.fileNameThumbnail, this.fileTypeThumbnail)
                .subscribe((responseThumb) => {
                let signedRequestThumbnailAWS = responseThumb.signedRequest;
                let urlThumbnailAWS = responseThumb.url;
                this.uploadFileProfile(this.file, signedRequestAWS, urlAWS, this.fileName, this.fileThumbnail, signedRequestThumbnailAWS, urlThumbnailAWS, this.fileNameThumbnail);
            }, (err) => {
                this.authService.errorMessage = err;
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
            });
        }, (err) => {
            this.authService.errorMessage = "No file selected";
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    getSignedRequest() {
        this.authService.getSignedRequest(this.fileName, this.fileType)
            .subscribe((response) => {
            let signedRequest = response.signedRequest;
            let url = response.url;
            this.uploadFile(this.file, signedRequest, url, this.fileName);
        }, (err) => {
            this.authService.errorMessage = "No file selected";
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    uploadFileProfile(file, signedRequest, url, fileName, fileThumbnail, signedRequestThumbnail, urlThumbnail, fileNameThumbnail) {
        let userPicture;
        let userPictureThumbnail;
        //DRY
        if (this.authService.currentUser.profilePicture == "assets/imgs/user.png") {
            userPicture = "user.png";
            userPictureThumbnail = "user.png";
        }
        else {
            userPicture = this.authService.currentUser.profilePictureName ? this.authService.currentUser.profilePictureName : 'user.png';
            userPictureThumbnail = this.authService.currentUser.profilePictureNameThumbnail ? this.authService.currentUser.profilePictureNameThumbnail : 'user.png';
        }
        this.authService.deleteProfilePicture(userPicture, userPictureThumbnail)
            .subscribe((deleted) => {
            this.authService.uploadFile(signedRequest, file)
                .subscribe(() => {
                //submit
                this.authService.uploadFile(signedRequestThumbnail, fileThumbnail)
                    .subscribe(() => {
                    let fileUrlNoSpaces = url.replace(/\s+/g, '+');
                    let fileUrlNoSpacesThumbnail = urlThumbnail.replace(/\s+/g, '+');
                    let data = {
                        profilePicture: fileUrlNoSpaces,
                        profilePictureName: fileName,
                        profilePictureThumbnail: fileUrlNoSpacesThumbnail,
                        profilePictureNameThumbnail: fileNameThumbnail,
                    };
                    //submit
                    this.authService.editUserInfo(data)
                        .subscribe((data) => {
                        if (data.user) {
                            this.authService.currentUser = data.user;
                            this.selection = false;
                            this.action = "";
                            this.waiting = false;
                        }
                        else {
                            this.authService.errorMessage = data.error;
                            setTimeout(() => {
                                this.authService.errorMessage = null;
                            }, 5000);
                        }
                        ;
                    }, (err) => {
                        this.authService.errorMessage = err;
                        setTimeout(() => {
                            this.authService.errorMessage = null;
                        }, 5000);
                        this.waiting = false;
                    }); //no se pudo actualizar info
                }, (err) => {
                    this.authService.errorMessage = err;
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);
                    this.waiting = false;
                }); //no se pudo subir thumbnail
            }, (err) => {
                this.authService.errorMessage = err;
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
            }); //no se pudo subir el archivo a aws
        }, (err) => {
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        }); //no se pudo eliminar el archivo a aws
    }
    levelsInfo() {
        this.authService.levelsInfo = true;
    }
    uploadFile(file, signedRequest, url, fileName) {
        let coverPhoto;
        coverPhoto = this.authService.currentUser.coverPhotoName ? this.authService.currentUser.coverPhotoName : 'no.png';
        this.authService.deleteCoverPhoto(coverPhoto)
            .subscribe((deleted) => {
            this.authService.uploadFile(signedRequest, file)
                .subscribe(() => {
                let fileUrlNoSpaces = url.replace(/\s+/g, '+');
                let data = {
                    profilePicture: fileUrlNoSpaces,
                    profilePictureName: fileName,
                    coverPhoto: fileUrlNoSpaces,
                    coverPhotoName: fileName,
                };
                data.profilePicture = undefined;
                data.profilePictureName = undefined;
                //submit
                this.authService.editUserInfo(data)
                    .subscribe((data) => {
                    if (data.user) {
                        this.authService.currentUser = data.user;
                        this.selection = false;
                        this.action = "";
                        this.waiting = false;
                    }
                    else {
                        this.authService.errorMessage = data.error;
                        setTimeout(() => {
                            this.authService.errorMessage = null;
                        }, 5000);
                        this.waiting = false;
                    }
                    ;
                }, (err) => {
                    this.authService.errorMessage = err;
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);
                    this.waiting = false;
                }); //no se pudo actualizar info
            }, (err) => {
                this.authService.errorMessage = err;
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
                this.waiting = false;
            }); //no se pudo subir el archivo a aws
        }, (err) => {
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
            this.waiting = false;
        }); //no se pudo eliminar el archivo a aws
    }
    changePassword(data) {
        if (data.newPassword != data.confirmPassword) {
            this.authService.errorMessage = "Password don't match";
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
            return false;
        }
        this.authService.changePassword(data)
            .subscribe((data) => {
            if (data.passwordChanged) {
                this.selection = false;
                this.action = "";
                this.waiting = false;
            }
            else {
                this.authService.errorMessage = "The password you entered is incorrect";
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
                this.waiting = false;
            }
        }, (err) => {
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
            this.waiting = false;
        });
    }
    editUser(data) {
        this.authService.editUserInfo(data)
            .subscribe((data) => {
            if (data.user) {
                this.authService.currentUser = data.user;
                this.authService.successMessage = "Your profile has been successfully modified";
                setTimeout(() => {
                    this.authService.successMessage = null;
                }, 5000);
                this.selection = false;
                this.action = "";
                this.waiting = false;
            }
            else {
                this.authService.errorMessage = data.error;
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
                this.waiting = false;
            }
            ;
        }, (err) => {
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
            this.waiting = false;
        });
    }
    submit() {
        this.waiting = true;
        if (this.action == 'bio') {
            this.waiting = false;
            if (this.bio.length > 150) {
                return;
            }
            ;
            let data = {
                bio: this.bio
            };
            this.editUser(data);
        }
        else if (this.action == 'username') {
            if (this.username.length > 20) {
                this.waiting = false;
                this.authService.errorMessage = "Please enter a valid username";
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
                return;
            }
            if (this.username.length == 0) {
                this.waiting = false;
                this.authService.errorMessage = 'Please add a username';
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
                return;
            }
            if (this.username.match(/^[a-zA-Z0-9_]{1,21}$/)) {
            }
            else {
                this.waiting = false;
                let error = `Please enter a valid username. Don't add special symbols or spaces`;
                this.authService.errorMessage = error;
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
                return;
            }
            let text = "Do you want to change your username to " + this.username + "?";
            var r = confirm(text);
            if (r == true) {
                let data = {
                    username: this.username
                };
                this.editUser(data);
            }
            else {
                this.waiting = false;
            }
        }
        else if (this.action != 'password') {
            if (this.authService.isLoggedIn()) {
                if (!!this.file && this.action != 'profile')
                    this.getSignedRequest();
                if (!!this.file && this.action == 'profile')
                    this.getSignedRequestProfile();
            }
        }
        else {
            if (this.currentPassword && this.confirmPassword && this.newPassword) {
                let data = {
                    currentPassword: this.currentPassword,
                    newPassword: this.newPassword,
                    confirmPassword: this.confirmPassword
                };
                this.changePassword(data);
            }
        }
    }
};
SettingsComponent = __decorate([
    Component({
        selector: 'app-settings',
        templateUrl: './settings.component.html',
        styleUrls: ['./settings.component.scss'],
    })
], SettingsComponent);
export { SettingsComponent };
//# sourceMappingURL=settings.component.js.map