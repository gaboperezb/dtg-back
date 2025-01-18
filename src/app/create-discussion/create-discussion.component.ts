import { Component, ViewChild, Inject } from '@angular/core';
import { AuthService } from '../../app/core/auth.service';
import { Router } from '@angular/router';
import { ITeam } from '../shared/interfaces';
import { TakeService } from '../core/take.service';
import { ThreadsService } from '../core/thread.service';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import * as _ from 'lodash';
import { Location } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';



declare var loadImage;

/**
 * Generated class for the NewThreadPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'app-create-discussion',
	templateUrl: './create-discussion.component.html',
	styleUrls: ['./create-discussion.component.scss']
})
export class CreateDiscussionComponent {



	posting: boolean = false;
	//video

	videoFile: any;
	progress: number = 0;
	videoFileName: any;
	videoFileType: string;
	videoDuration: number;
	videoHeight: number;
	videoWidth: number;
	videoLoader: any;
	toggleVideo: boolean = false;
	videoThumbnail: any;
	videoTypeThumbnail: string;
	videoNameThumbnail: string;
	video: any;
	signedRequestThumbnailAWS: string
	signedRequestVideoThumbnailAWS: string
	urlVideoThumbnailAWS: string;
	base64VideoThumbnail: any;
	base64Video: any;
	sendingDiscussion: boolean = false;

	teamsMapped: any[];

	pictureHeight: number;
	pictureWidth: number;
	link: boolean = false;
	poll: boolean = false;
	selection: string = "";
	url: string = "";
	league: string = "";
	count: number = 300;
	take: string = "";
	max: number = 300;
	imgSource: string;
	options: string[] = [];
	postTeams: any[] = [""];
	pollValue: string = "";
	postTeamsForm: any;

	editingDiscussion: boolean = false;

	file: any;
	fileThumbnail: any;
	fileName: string;
	testW: string = "asdasd";
	test: string = "";
	fileType: string;
	fileNameThumbnail: string;
	fileTypeThumbnail: string;
	fileUrlNoSpaces: string;
	threadPicture: any;
	countDescription: number = 500;
	signedRequestAWS: string;

	quill: any;
	draft: boolean = false;
	loadingTeams: boolean = false;
	teams: ITeam[] = [];
	teamsAvailable: boolean = true;
	swipeTimeOut: any;

	urlAWS: string;
	urlThumbnailAWS: string;
	postFlag: boolean;
	toggleProgress: boolean = false;
	discussionForm: FormGroup;

	originalTake: any;
	discussion: any;

	canvas: any;
	optionsForm: any;
	get formDataT() { return <FormArray>this.discussionForm.get('postTeams'); }
	get formData() { return <FormArray>this.discussionForm.get('options'); }

	constructor(
		private location: Location,
		public takeService: TakeService,
		private formBuilder: FormBuilder,
		public threadService: ThreadsService,
		@Inject(PLATFORM_ID) private platformId: Object,
		private authService: AuthService,
		private router: Router) {
	}


	ngOnInit() {
		if (this.takeService.takeToEdit) {
			this.buildFormEdit()
			if (this.takeService.takeToEdit.teams.length) { //para mapear los ids hasta que se bajen los equipos (con los nombres)
				this.getTeams(this.takeService.takeToEdit, true)
			}

		} else {
			this.buildForm()
		}
	}

	ngOnDestroy() {
		this.takeService.takeToEdit = undefined;
	}

	buildFormEdit() {

		this.discussionForm = this.formBuilder.group({
			league: [this.takeService.takeToEdit.league, [Validators.required]],
			take: [this.takeService.takeToEdit.take, [Validators.required]],
			url: [this.takeService.takeToEdit.url ? this.takeService.takeToEdit.url : ""],
			postTeams: this.formBuilder.array([this.createItemT()]),
		});

	}

	buildForm() {

		this.discussionForm = this.formBuilder.group({
			league: ["", [Validators.required]],
			take: ["", [Validators.required]],
			url: [""],
			options: this.formBuilder.array([this.createItem(), this.createItem()]),
			postTeams: this.formBuilder.array([this.createItemT()]),
		});
	}

	createItemT(): FormGroup {
		return this.formBuilder.group({
			postTeam: ''
		});
	}

	createItem(): FormGroup {
		return this.formBuilder.group({
			pollOption: ''
		});
	}

	addOptionT() {

		this.postTeamsForm = this.discussionForm.get('postTeams') as FormArray;
		this.postTeamsForm.push(this.createItemT());
	}

	deleteOptionT(i: number) {

		if (i > 0) {
			this.postTeamsForm = this.discussionForm.get('postTeams') as FormArray;
			this.postTeamsForm.removeAt(i)
		} else {
			this.discussionForm.setControl('postTeams', this.formBuilder.array([this.createItemT()]));
		}

	}

	deleteOption(i: number) {
		this.optionsForm = this.discussionForm.get('options') as FormArray;
		this.optionsForm.removeAt(i)
	}

	addOption() {

		this.optionsForm = this.discussionForm.get('options') as FormArray;
		if (this.optionsForm.length < 6) {
			this.optionsForm.push(this.createItem());
		}
		else {

			this.authService.errorMessage = "You have reached the maximum number of options for your poll"
			setTimeout(() => {
				this.authService.errorMessage = null;
			}, 4000);
		}
	}


	onTeamChange(e) {

		let thread = {
			league: e.target.value
		}
		this.postTeamsForm = this.discussionForm.get('postTeams') as FormArray;

		for (let index = 0; index < this.postTeamsForm.length; index++) {
			this.postTeamsForm.removeAt(index)
		}
		this.discussionForm.setControl('postTeams', this.formBuilder.array([this.createItemT()]));
		this.getTeams(thread, false);
	}


	linkTake() {

		this.link = !this.link;
		this.poll = false;
		this.url = "";
		this.deletePicture();
		this.deleteVideo();
	}

	pollTake() {

		this.poll = true;
		this.link = false;
		this.url = "";
		this.deletePicture();
		this.deleteVideo();
	}

	wordCount() {
		this.count = this.max - this.discussionForm.get('take').value.length;
	}

	deleteMedia() {
		this.deletePicture()
		this.deleteVideo()
	}

	deletePicture() {

		this.file = undefined
		this.fileType = undefined
		this.fileName = undefined;
		this.threadPicture = undefined;

	}

	deleteVideo() {

		this.toggleProgress = false;
		this.videoFile = null
		this.videoFileName = null
		this.videoFileType = null
		this.videoDuration = null;
		this.videoHeight = null;
		this.videoWidth = null;

		this.videoThumbnail = null
		this.videoNameThumbnail = null
		this.videoTypeThumbnail = null

		this.base64Video = null

	}

	onChangeVideo(event: EventTarget) {

		let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
		let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
		let files: FileList = target.files;

		this.videoFile = files[0];
		this.videoFileName = this.authService.randomString(7) + this.authService.currentUser.username + '.' + this.videoFile.type.split('/')[1];

		this.videoFileType = this.videoFile.type;

		if (FileReader && files && files.length) {
			var fr = new FileReader();
			fr.onload = () => {
				this.base64Video = fr.result;

			}
			fr.readAsDataURL(files[0]);
		}

		this.link = false;
		this.poll = false;
		//this.deletePicture();
		this.url = "";

	}

	onData(e: any) {

		let video = e.target;
		this.videoDuration = video.duration;
		this.videoHeight = video.videoHeight;
		this.videoWidth = video.videoWidth;

		if (video.duration > 150) {

			this.deleteVideo();
			this.authService.errorMessage = "The video duration must be less than 2 minutes and 30 seconds";
			setTimeout(() => {
				this.authService.errorMessage = null;
			}, 5000);

			return;

		}

		this.getScreenshot()


	}

	imageLoaded(event: any) {

		this.pictureHeight = event.target.height;
		this.pictureWidth = event.target.width;

	}

	unloadVideo(video: any) {

		video.src = ""; // empty source
		video.load();

	}

	getScreenshot() {

		if (isPlatformBrowser(this.platformId)) {
			var canvas = document.createElement('canvas')
			var video = document.createElement('video');
			video.setAttribute('crossorigin', 'anonymous');
			video.setAttribute('controls', '');
			video.setAttribute("style", "width:600px");
			video.setAttribute('class', 'fr-draggable');
			video.src = this.base64Video;
			video.addEventListener('loadeddata', () => {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				video.currentTime = 2;
				video.addEventListener('timeupdate', () => {
					// You are now ready to grab the thumbnail from the <canvas> element
					canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
					canvas.toBlob((blob) => {

						this.videoThumbnail = blob;
						this.videoNameThumbnail = this.authService.randomString(7) + this.authService.currentUser.username + '.jpeg';
						this.videoTypeThumbnail = 'image/jpeg'
						this.unloadVideo(video);
					}, 'image/jpeg');

				});

			})
		}
	}

	onChange(event: EventTarget) {


		let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
		let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
		let files: FileList = target.files;
		if (files[0].name.match(/.(webp)$/i)) {
			this.authService.errorMessage = "Format not supported";
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
				this.threadPicture = fr.result;
			}
			fr.readAsDataURL(files[0]);
		}

		//External library (orientation=true desactiva el exif data)
		loadImage(
			this.file,
			(img: any, data: any) => {
				if (img.type === "error") {
					this.authService.errorMessage = "Error loading Image";
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				} else {

					img.toBlob((blob: any) => {
						this.file = blob;

						//THUMBNAIL
						loadImage(
							this.fileThumbnail,
							(img: any) => {
								if (img.type === "error") {
									this.authService.errorMessage = "Error loading image";
									setTimeout(() => {
										this.authService.errorMessage = null;
									}, 5000);

								} else {

									img.toBlob((blob: any) => {
										this.fileThumbnail = blob;
										this.link = false;
										this.poll = false;
										this.deleteVideo();
										this.url = "";


									}, this.fileType);

								}
							},
							{
								maxWidth: 300,
								orientation: 1
							}
						);

					}, this.fileType);

				}
			},
			{
				maxWidth: 800,
				orientation: 1
			}
		);
		// FileReader support (Para cargar la imagen en el img tag)


		if (this.file == null) {

			this.authService.errorMessage = "No file selected";
			setTimeout(() => {
				this.authService.errorMessage = null;
			}, 5000);

		}

	}



	customTrackByTeams(index: number, obj: any): any {
		return index;
	}


	addPostTeam() {
		this.postTeams.push("");

	}


	deletePostTeam(i: number) {

		if (this.postTeams.length > 1) this.postTeams.splice(i, 1);
		else {
			this.postTeams[i] = "";
		}

	}

	getTeams(take: any, build: boolean) {

		this.authService.getAllTeams(take.league)
			.subscribe((teams: any[]) => {

				if (teams.length == 0) this.teamsAvailable = false;
				else {
					this.teamsAvailable = true;
				}
				teams.sort((a, b) => (a.teamName > b.teamName) ? 1 : -1)
				this.teams = teams;

				if (build && take.teams[0].length) {
					let formTeams;
					formTeams = take.teams.map(t => {
						let t3 = teams.find(t2 => t2._id == t).teamName
						return this.formBuilder.group({
							postTeam: t3
						});
					})

					this.postTeamsForm = this.discussionForm.get('postTeams') as FormArray;
					this.discussionForm.setControl('postTeams', this.formBuilder.array(formTeams));

				}

			},
				(err) => {
					this.sendingDiscussion = false;
					this.loadingTeams = false;
					this.authService.errorMessage = 'Error loading teams, please try again later';

					if (isPlatformBrowser(this.platformId)) {
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 5000);
					}


				})
	}


	getSignedRequestVideo(file: File, data: any, fileThumbnail: File) {

		//VIDEO

		this.threadService.getSignedRequest(this.videoFileName, this.videoFileType)
			.subscribe((response: any) => {

				this.signedRequestAWS = response.signedRequest;
				this.urlAWS = response.url;

				//video thumbnail
				this.threadService.getSignedRequest(this.videoNameThumbnail, this.videoTypeThumbnail)
					.subscribe((responseVideoThumb: any) => {
						this.signedRequestVideoThumbnailAWS = responseVideoThumb.signedRequest;
						this.urlVideoThumbnailAWS = responseVideoThumb.url;

						this.uploadVideoFile(data);

					},
						(err) => {

							this.sendingDiscussion = false;
							this.authService.errorMessage = err;
							setTimeout(() => {
								this.authService.errorMessage = null;
							}, 5000);
						});

			},
				(err) => {

					this.sendingDiscussion = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);
				});


	}



	uploadVideoFile(data: any) {
		this.authService.uploadFile(this.signedRequestAWS, this.videoFile)
			.subscribe(() => {

				let fileUrlNoSpaces = this.urlAWS.replace(/\s+/g, '+');
				data.video = fileUrlNoSpaces;


				//VIDEO THUMBNAIL
				this.authService.uploadFile(this.signedRequestVideoThumbnailAWS, this.videoThumbnail)
					.subscribe(() => {
						let fileUrlNoSpaces = this.urlVideoThumbnailAWS.replace(/\s+/g, '+');
						data.videoThumbnail = fileUrlNoSpaces;
						data.videoDuration = this.videoDuration;
						data.videoHeight = this.videoHeight;
						data.videoWidth = this.videoWidth;

						//submit normal
						this.takeService.newTake(data)
							.subscribe(({ take, error }: any) => {

								if (take) {
									this.sendingDiscussion = false;
									this.router.navigateByUrl('/')
								} else {

									this.authService.errorMessage = error;
									setTimeout(() => {
										this.authService.errorMessage = null;
									}, 5000);
									this.sendingDiscussion = false;
								}


							},
								(err) => {

									this.sendingDiscussion = false;
									this.authService.errorMessage = err;
									setTimeout(() => {
										this.authService.errorMessage = null;
									}, 5000);
								});  //no se pudo actualizar info

					},

						(err) => {

							this.sendingDiscussion = false;
							this.authService.errorMessage = err;
							setTimeout(() => {
								this.authService.errorMessage = null;
							}, 5000);
						});  //no se pudo subir el archivo a aws(thumbnail)



			},
				(err) => {

					this.sendingDiscussion = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);
				});  //no se pudo subir el archivo a aws

	}


	getSignedRequest(file: File, data: any, fileThumbnail: File) {

		//NORMAL IMAGE
		this.threadService.getSignedRequest(this.fileName, this.fileType)
			.subscribe((response: any) => {

				this.signedRequestAWS = response.signedRequest;
				this.urlAWS = response.url;

				//THUMBNAIL IMAGE
				this.threadService.getSignedRequest(this.fileNameThumbnail, this.fileTypeThumbnail)
					.subscribe((responseThumb: any) => {
						this.signedRequestThumbnailAWS = responseThumb.signedRequest;
						this.urlThumbnailAWS = responseThumb.url;

						this.uploadFile(this.file, this.signedRequestAWS, this.urlAWS, data, this.fileThumbnail, this.signedRequestThumbnailAWS, this.urlThumbnailAWS);

					},
						(err) => {
							this.sendingDiscussion = false;
							this.authService.errorMessage = err;
							setTimeout(() => {
								this.authService.errorMessage = null;
							}, 5000);

						});

			},
				(err) => {
					this.sendingDiscussion = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				});


	}

	uploadFile(file: File, signedRequest: string, url: string, data: any, fileThumbnail: File, signedRequestThumbnail: string, urlThumbnail: string) {
		this.authService.uploadFile(signedRequest, file)
			.subscribe(() => {

				//THUMBNAIL
				this.authService.uploadFile(signedRequestThumbnail, fileThumbnail)
					.subscribe(() => {
						let fileUrlNoSpaces = url.replace(/\s+/g, '+');
						data.picture = fileUrlNoSpaces;
						let fileUrlNoSpacesThumbnail = urlThumbnail.replace(/\s+/g, '+');
						data.thumbnail = fileUrlNoSpacesThumbnail;
						data.pictureHeight = this.pictureHeight
						data.pictureWidth = this.pictureWidth;

						//submit normal
						this.takeService.newTake(data)
							.subscribe(({ take, error }: any) => {
								if (take) {
									this.sendingDiscussion = false;
									this.router.navigateByUrl('/')

								} else {
									this.sendingDiscussion = false;
									this.authService.errorMessage = error;
									setTimeout(() => {
										this.authService.errorMessage = null;
									}, 5000);
								}
							},
								(err) => {
									this.sendingDiscussion = false;
									this.authService.errorMessage = err;
									setTimeout(() => {
										this.authService.errorMessage = null;
									}, 5000);

								});  //no se pudo actualizar info

					},

						(err) => {
							this.sendingDiscussion = false;
							this.authService.errorMessage = err;
							setTimeout(() => {
								this.authService.errorMessage = null;
							}, 5000);

						});  //no se pudo subir el archivo a aws(thumbnail)

			},
				(err) => {
					this.sendingDiscussion = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				});  //no se pudo subir el archivo a aws

	}


	submit() {

		this.sendingDiscussion = true;
		this.posting = true;
		this.league = this.discussionForm.get('league').value;
		this.take = this.discussionForm.get('take').value;
		this.url = this.discussionForm.get('url').value;

		let teams = this.discussionForm.get('postTeams').value
		this.teamsMapped = teams.map(a => a.postTeam);
		this.teamsMapped = this.teamsMapped.filter(t => t.length)

		if (this.teamsMapped.length && this.teamsMapped[0].length) {
			this.teamsMapped = this.teamsMapped.map((t) => {
				return this.teams.find(t2 => t2.teamName == t)._id
			})
		} else {
			this.teamsMapped = null
		}

		if (!this.league) {
			this.authService.errorMessage = "Please select a feed";
			setTimeout(() => {
				this.authService.errorMessage = null;
			}, 5000);
			this.sendingDiscussion = false;
			return;
		}

		if (this.take.length > 300) {
			this.authService.errorMessage = 'The discussion must have less than 300 characters.';
			setTimeout(() => {
				this.authService.errorMessage = null;
			}, 5000);
			this.sendingDiscussion = false;
			return;
		}

		if (this.take && this.authService.isLoggedIn() && this.league) {

			let data;
			if (this.link) {
				//llamar a embedly API

				let encoded = encodeURIComponent(this.url)
				this.takeService.embedlyAPI(encoded)
					.subscribe((response) => {



						let thumbnail = response.thumbnail_url ? response.thumbnail_url.replace(/^http:\/\//i, 'https://') : undefined;
						let favIcon = response.favicon_url ? response.favicon_url.replace(/^http:\/\//i, 'https://') : undefined;



						data = {
							urlType: response.type,
							url: response.url || this.url,
							provider_name: response.provider_name,
							provider_url: response.provider_url.replace(/(^\w+:|^)\/\//, ''),
							html: response.html,
							thumbnail_url: thumbnail,
							league: this.league,
							type: 'Link',
							favicon_url: favIcon,
							htmlWidth: response.width,
							htmlHeight: response.height,
							thumbnail_width: response.thumbnail_width,
							thumbnail_height: response.thumbnail_height,
							teams: this.teamsMapped != null ? this.teamsMapped : undefined,
							take: this.take,
							urlTitle: response.title,
							urlDescription: response.description
						}

						this.takeService.newTake(data)
							.subscribe(({ take, error }: any) => {

								if (take) {

									this.sendingDiscussion = false;
									this.router.navigateByUrl('/')
								} else {
									this.sendingDiscussion = false;
									this.authService.errorMessage = error
									setTimeout(() => {
										this.authService.errorMessage = null;
									}, 5000);
								}

							},

								(err) => {
									this.sendingDiscussion = false;
									this.authService.errorMessage = err;
									setTimeout(() => {
										this.authService.errorMessage = null;
									}, 5000);

								});  //no se pudo subir el archivo a mlab

					},
						(err) => {
							this.sendingDiscussion = false;
							this.authService.errorMessage = 'Invalid URL';
							setTimeout(() => {
								this.authService.errorMessage = null;
							}, 5000);

						});  //

			}
			else if (this.poll) {

				let prov = this.discussionForm.get('options').value
				this.options = prov.map(a => a.pollOption);

				if (this.options.length >= 2) {
					for (let index = 0; index < this.options.length; index++) {
						const element = this.options[index];
						if (element.length <= 1) {
							this.sendingDiscussion = false;
							this.authService.errorMessage = 'Poll options must contain at least 2 characters';
							setTimeout(() => {
								this.authService.errorMessage = null;
							}, 5000);

							return;

						} else if (element.length == 0) {
							this.options.splice(index, 1);

						}
					}
					data = {
						league: this.league,
						type: 'Poll',
						teams: this.teamsMapped != null ? this.teamsMapped : undefined,
						take: this.take,
						pollValues: this.options
					}

					this.takeService.newTake(data)
						.subscribe(({ take, error }: any) => {

							if (take) {
								this.sendingDiscussion = false;
								this.router.navigateByUrl('/')

							} else {
								this.sendingDiscussion = false;
								this.authService.errorMessage = error;
								setTimeout(() => {
									this.authService.errorMessage = null;
								}, 5000);
							}

						},

							(err) => {
								this.sendingDiscussion = false;
								this.authService.errorMessage = err;
								setTimeout(() => {
									this.authService.errorMessage = null;
								}, 5000);

							});  //no se pudo subir el archivo a mlab

						}

				

			} else {

					data = {

						league: this.league,
						type: 'Text',
						teams: this.teamsMapped != null ? this.teamsMapped : undefined,
						take: this.take
					}


					if (!!this.videoFile) this.getSignedRequestVideo(this.videoFile, data, this.videoThumbnail);
					else if (!!this.file) this.getSignedRequest(this.file, data, this.fileThumbnail);
					else {
						this.takeService.newTake(data)
							.subscribe(({ take, error }: any) => {

								if (take) {
									this.sendingDiscussion = false;
									this.router.navigateByUrl('/')

								} else {
									this.authService.errorMessage = error;
									setTimeout(() => {
										this.authService.errorMessage = null;
									}, 5000);
								}
							},

								(err) => {
									this.sendingDiscussion = false;
									this.authService.errorMessage = err;
									setTimeout(() => {
										this.authService.errorMessage = null;
									}, 5000);

								});  //no se pudo subir el archivo a mlab

					}

				}



			} else if (!this.take) {
				this.postFlag = false;
				this.authService.errorMessage = 'Please enter a text';
				setTimeout(() => {
					this.authService.errorMessage = null;
				}, 5000);


			}

		}

		saveChanges() {

			this.editingDiscussion = true;
			this.posting = true;
			this.league = this.discussionForm.get('league').value;
			this.take = this.discussionForm.get('take').value;
			this.url = this.discussionForm.get('url').value;

			let teams = this.discussionForm.get('postTeams').value
			this.teamsMapped = teams.map(a => a.postTeam);
			this.teamsMapped = this.teamsMapped.filter(t => t.length)

			if (this.teamsMapped.length && this.teamsMapped[0].length) {
				this.teamsMapped = this.teamsMapped.map((t) => {
					return this.teams.find(t2 => t2.teamName == t)._id
				})
			} else {
				this.teamsMapped = null
			}

			if (!this.league) {
				this.authService.errorMessage = "Please select a feed";
				setTimeout(() => {
					this.authService.errorMessage = null;
				}, 5000);
				this.editingDiscussion = false;
				return;
			}

			if (this.take.length > 300) {
				this.authService.errorMessage = 'The discussion must have less than 300 characters.';
				setTimeout(() => {
					this.authService.errorMessage = null;
				}, 5000);
				this.editingDiscussion = false;
				return;
			}

			if (this.take && this.authService.isLoggedIn() && this.league) {

				let data;
				if (this.link) {
					//llamar a embedly API

					let encoded = encodeURIComponent(this.url)
					this.takeService.embedlyAPI(encoded)
						.subscribe((response) => {


							data = {
								urlType: response.type,
								url: response.url || this.url,
								provider_name: response.provider_name,
								provider_url: response.provider_url.replace(/(^\w+:|^)\/\//, ''),
								html: response.html,
								thumbnail_url: response.thumbnail_url,
								league: this.league,
								type: 'Link',
								htmlWidth: response.width,
								htmlHeight: response.height,
								thumbnail_width: response.thumbnail_width,
								thumbnail_height: response.thumbnail_height,
								teams: this.teamsMapped != null ? this.teamsMapped : undefined,
								take: this.take,
								urlTitle: response.title,
								urlDescription: response.description
							}

							this.takeService.edit(this.discussion, data)
								.subscribe(({ take, error }: any) => {

									if (take) {

										this.editingDiscussion = false;
										this.takeService.takeToEditOriginal.take = this.take;
										this.takeService.takeToEditOriginal.league = this.league;
										this.takeService.takeToEditOriginal.url = this.url;
										this.takeService.takeToEditOriginal.teams = this.teamsMapped != null ? this.teamsMapped : undefined;
										this.router.navigateByUrl('/')
									} else {
										this.editingDiscussion = false;
										this.authService.errorMessage = error
										setTimeout(() => {
											this.authService.errorMessage = null;
										}, 5000);
									}

								},

									(err) => {
										this.editingDiscussion = false;
										this.authService.errorMessage = err;
										setTimeout(() => {
											this.authService.errorMessage = null;
										}, 5000);

									});  //no se pudo subir el archivo a mlab

						},
							(err) => {
								this.editingDiscussion = false;
								this.authService.errorMessage = 'Invalid URL';
								setTimeout(() => {
									this.authService.errorMessage = null;
								}, 5000);

							});  //

				} else {

					data = {

						league: this.league,
						type: 'Text',
						teams: this.teamsMapped != null ? this.teamsMapped : undefined,
						take: this.take
					}

					this.takeService.edit(this.takeService.takeToEdit._id, data)
						.subscribe(({ take, error }: any) => {

							if (take) {
								this.sendingDiscussion = false;
								this.takeService.takeToEdit.take = this.take;
								this.takeService.takeToEdit.league = this.league;
								this.location.back()

							} else {
								this.authService.errorMessage = error;
								setTimeout(() => {
									this.authService.errorMessage = null;
								}, 5000);
							}
						},

							(err) => {
								this.sendingDiscussion = false;
								this.authService.errorMessage = err;
								setTimeout(() => {
									this.authService.errorMessage = null;
								}, 5000);

							});  //no se pudo subir el archivo a mlab
				}

			} else if (!this.take) {
				this.postFlag = false;
				this.authService.errorMessage = 'Please enter a text';
				setTimeout(() => {
					this.authService.errorMessage = null;
				}, 5000);


			}

		}

	}



