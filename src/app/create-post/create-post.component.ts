import { Component, OnInit, Inject } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ThreadsService } from '../core/thread.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

declare var loadImage;

@Component({
	selector: 'app-create-post',
	templateUrl: './create-post.component.html',
	styleUrls: ['./create-post.component.scss']

})

export class CreatePostComponent implements OnInit {

	fullscreen: boolean = false;
	showTips: boolean = false;
	posting: boolean = false;
	editing: boolean = false;
	stepOneForm: FormGroup;
	errorMessage = null;
	stepOneCompleted: boolean = false;
	type: string = "text";
	loader: any;
	successMessage: string;
	selection: string = "";
	url: string = "";
	league: string = "";
	count: number = 120;
	title: string = "";
	description: string = "";
	max: number = 120;
	imgSource: string;
	pollValue: string = "";
	file: File;
	fileThumbnail: File;
	fileWeb: File;
	fileName: string;
	testW: string = "asdasd";
	test: string = "";
	fileType: string;
	fileTypeWeb: string;
	optionsForm: any;
	postTeamsForm: any;
	fileNameThumbnail: string;
	fileNameWeb: string;
	fileTypeThumbnail: string;
	fileUrlNoSpaces: string;
	threadPicture: any;
	countDescription: number = 300;
	signedRequestAWS: string;
	loadingTeams: boolean = false;
	signedRequestThumbnailAWS: string
	signedRequestWebAWS: string
	quill: any;
	draft: boolean = false;
	initControls: any;
	options: any[] = [];
	teamsMapped: any[];
	teams: any[] = [];
	urlAWS: string;
	urlThumbnailAWS: string;
	urlWebAWS: string;
	public editorContent: string = "";
	draftInitial: any;
	teamsAvailable: boolean = true;
	lowQuality: boolean = false;

	videoPoster: any;
	get formData() { return <FormArray>this.stepOneForm.get('options'); }
	get formDataT() { return <FormArray>this.stepOneForm.get('postTeams'); }

	public optionsFroala: Object = {
		key: "re1H1qA3A2C7B6A5D5hqJ-7dD-17lihhuH-8xalgE4gjkH-8D1B3D3E2E6D1G2B4E4E3==",
		placeholderText: 'Your 🔥 post goes here',
		charCounterCount: true,
		imageEditButtons: ['imageReplace', 'imageCaption', 'imageRemove'],
		imageDefaultDisplay: 'block',
		imageDefaultAlign: 'center',
		linkAlwaysBlank: true,
		pastePlain: true,
		embedlyKey: "116e3e2241ba42e49a5d9091d51206dd",
		imageResize: false,
		attribution: false,
		videoMaxSize: 1024 * 1024 * 32,
		listAdvancedTypes: false,
		fontSizeDefaultSelection: 18,
		videoAllowedTypes: ['mp4', 'ogg', 'mov'],
		imageAllowedTypes: ['jpeg', 'jpg', 'png'],
		videoInsertButtons: ['videoBack', '|', 'videoUpload'],
		imageInsertButtons: ['imageBack', '|', 'imageUpload'],
		linkEditButtons: ['linkOpen', 'linkEdit', 'linkRemove'],
		heightMin: 300,
		toolbarStickyOffset: 55,
		paragraphFormat: {
			N: 'Normal',
			H5: 'Subheading'
		},
		tableEditButtons: ['tableHeader', 'tableRemove', '|', 'tableRows', 'tableColumns', '-', 'tableCells', 'tableCellHorizontalAlign'],
		toolbarButtons: {
			'moreText': {
				'buttons': ['bold', 'italic', 'strikeThrough', 'superscript', 'clearFormatting']
			},
			'moreParagraph': {
				'buttons': ['alignLeft', 'alignCenter', 'formatOLSimple', 'formatOL', 'formatUL', 'quote', 'paragraphFormat', '']
			},
			'moreRich': {
				'buttons': ['insertLink', 'insertImage', 'insertVideo', 'insertTable', 'embedly']
			},
			'moreMisc': {
				'buttons': ['undo', 'redo', 'fullscreen', 'selectAll'],
				'align': 'right',
				'buttonsVisible': 2
			}
		},
		events: {
			'video.codeError': (code) => {
				// Do something here.
				// this is the editor instance.

			},
			'video.loaded': (video) => {
				// Do something here.
				// this is the editor instance.

				this.captureImage(video[0].children[0]) //poster

			},
			'commands.after': (cmd, param1, param2) => {
				// Do something here.
				// this is the editor instance.

				if (cmd == 'fullscreen') this.fullscreen = !this.fullscreen;

			},
			'image.error': (error, response) => {

				if (error.code == 4) {
					this.saveDraftForError()

				}
			},
			'image.removed': (img) => {
				// Do something here.
				// this is the editor instance.

				let fileName = img[0].src.substr(50);

				this.threadService.deleteS3(fileName)
					.subscribe((data) => {

					},
						(err) => {

						})


			}

		}
	}

	constructor(
		private router: Router,
		public authService: AuthService,
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private location: Location,
		@Inject(PLATFORM_ID) private platformId: Object,
		public threadService: ThreadsService) { }


	ngOnDestroy() {
		this.threadService.threadToEdit = undefined;
	}


	captureImage(videoElement: any) {

		if (isPlatformBrowser(this.platformId)) {
			var canvas = document.createElement('canvas')
			var video = document.createElement('video');
			video.setAttribute('crossorigin', 'anonymous');
			video.setAttribute('controls', '');
			video.setAttribute("style", "width:600px");
			video.setAttribute('class', 'fr-draggable');
			video.src = videoElement.src;
			video.addEventListener('loadedmetadata', () => {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				video.currentTime = 2;
				video.addEventListener('timeupdate', () => {
					// You are now ready to grab the thumbnail from the <canvas> element
					var context = canvas.getContext('2d');
					context.drawImage(video, 0, 0, canvas.width, canvas.height);
					var dataURL = canvas.toDataURL();
					fetch(dataURL)
						.then(res => res.blob())
						.then(result => this.getSignedRequestPoster(video, result, videoElement))
				});

			})
		}
	}

	canDeactivate() {

		var r = confirm("Do you want to discard your post");
		if (r == true) {
			this.type = ""
			this.initControls.destroy();
			return true;
		} else {
			return false;
		}
	}

	ngOnInit() {

		if (isPlatformBrowser(this.platformId)) {
			this.threadService.posting = false;
			var tips = localStorage.getItem('tipsnew');
			if (!tips) {
				this.showTips = true;
			}

			var draft = localStorage.getItem('draft')
			if (!!draft) {
				this.threadService.draftInitial = JSON.parse(draft)
				this.draft = true
			}

			if (this.threadService.threadToEdit) {
				let thread = this.threadService.threadToEdit;
				switch (thread.type) {
					case 'Poll':
						this.type = 'poll';
						break;
					case 'General':
						this.type = 'text';
						break;
					case 'Link':
						this.type = 'link';
						break
					default:
						break;
				}

				this.editorContent = thread.description;
				let options;
				let teams;

				if (thread.pollValues) {
					options = thread.pollValues.map(a => {
						return this.formBuilder.group({
							pollOption: a
						});
					})
				}
				this.buildForm(thread.league, thread.title, thread.url, options, teams)
				this.wordCount();

				if (thread.teams.length) { //para mapear los ids hasta que se bajen los equipos (con los nombres)
					this.getTeams(thread, true)
				}


			} else {

				this.buildForm();
				let type = this.route.snapshot.queryParamMap.get('type')
				this.type = type || 'text';


			}
		}



	}

	changeType(type: string, e: any) {
		e.stopPropagation()
		this.type = type;

	}

	selectDraft() {

		this.editorContent = this.threadService.draftInitial.content;
		if (this.threadService.draftInitial.league) this.stepOneForm.controls['league'].setValue(this.threadService.draftInitial.league);
		if (this.threadService.draftInitial.title) this.stepOneForm.controls['title'].setValue(this.threadService.draftInitial.title);
		if (this.threadService.draftInitial.url) this.stepOneForm.controls['url'].setValue(this.threadService.draftInitial.url);
		if (this.threadService.draftInitial.options.length) {
			this.threadService.draftInitial.options = this.threadService.draftInitial.options.map(a => {
				return this.formBuilder.group({
					pollOption: a.pollOption
				});
			})

			this.stepOneForm.setControl('options', this.formBuilder.array(this.threadService.draftInitial.options));
		}

		if (this.threadService.draftInitial.options.length) {
			this.threadService.draftInitial.options = this.threadService.draftInitial.options.map(a => {
				return this.formBuilder.group({
					pollOption: a.pollOption
				});
			})

			this.stepOneForm.setControl('options', this.formBuilder.array(this.threadService.draftInitial.options));
		}

		this.wordCount();
		if (this.threadService.draftInitial.teams.length) {
			this.getTeams(this.threadService.draftInitial, true);
		}

		this.type = this.threadService.draftInitial.type;
		this.draft = false;

	}

	closeTips() {

		if (isPlatformBrowser(this.platformId)) {
			localStorage.setItem('tipsnew', 'viewed');
			this.showTips = false;
		}

	}

	buildForm(league?: string, title?: string, url?: string, options?: any, teams?: any) {
		if (options) {
			options = options.map(a => {
				return this.formBuilder.group({
					pollOption: a.pollOption
				});
			})
		}
		this.stepOneForm = this.formBuilder.group({
			league: [league || "", [Validators.required]],
			title: [title || "", [Validators.required]],
			url: [url || ""],
			options: this.formBuilder.array(options || [this.createItem(), this.createItem()]),
			postTeams: this.formBuilder.array(teams || [this.createItemT()]),

		});
	}


	saveDraftForError() {

		let teams = this.stepOneForm.get('postTeams').value
		teams = teams.filter(t => t.postTeam.length)
		let tMapped;
		if (teams.length) {
			tMapped = teams.map(t => {
				return this.teams.find(t2 => t2.teamName == t.postTeam)._id
			})

		} else {
			tMapped = [];
		}

		let draft = {
			content: this.editorContent || this.initControls.getEditor().html.get(),
			title: this.stepOneForm.get('title').value || "My Draft",
			league: this.stepOneForm.get('league').value,
			url: this.stepOneForm.get('url').value,
			options: this.stepOneForm.get('options').value,
			teams: tMapped,
			type: this.type
		}

		if (isPlatformBrowser(this.platformId)) {
			localStorage.setItem('draft', JSON.stringify(draft));
		}

		this.authService.successMessage = "Your draft has been saved",
			setTimeout(() => {
				this.authService.successMessage = null;
			}, 3000);
		this.router.navigateByUrl('/')
	}

	saveDraft() {


		console.log(this.initControls.getEditor().html.get())
		let teams = this.stepOneForm.get('postTeams').value
		teams = teams.filter(t => t.postTeam.length)
		let tMapped;

		if (teams.length) {
			tMapped = teams.map(t => {
				return this.teams.find(t2 => t2.teamName == t.postTeam)._id
			})

		} else {
			tMapped = [];
		}

		if (this.stepOneForm.get('title').value) {
			if (isPlatformBrowser(this.platformId)) {
				var a = localStorage.getItem('draft')
				if (!!a) {
					var r = confirm("Your previous draft will be deleted");
					if (r == true) {
						let draft = {
							content: this.editorContent || this.initControls.getEditor().html.get(),
							title: this.stepOneForm.get('title').value,
							league: this.stepOneForm.get('league').value,
							url: this.stepOneForm.get('url').value,
							teams: tMapped,
							options: this.type == 'poll' ? this.stepOneForm.get('options').value : [],
							type: this.type
						}
						localStorage.setItem('draft', JSON.stringify(draft));
						this.authService.successMessage = "Your draft has been saved",
							setTimeout(() => {
								this.authService.successMessage = null;
							}, 3000);
					} else {

					}
				} else {
					let draft = {
						content: this.editorContent || this.initControls.getEditor().html.get(),
						title: this.stepOneForm.get('title').value,
						league: this.stepOneForm.get('league').value,
						url: this.stepOneForm.get('url').value,
						teams: tMapped,
						options: this.type == 'poll' ? this.stepOneForm.get('options').value : [],
						type: this.type

					}

					localStorage.setItem('draft', JSON.stringify(draft));
					this.authService.successMessage = "Your draft has been saved",
						setTimeout(() => {
							this.authService.successMessage = null;
						}, 3000);
				}
			}

		} else {
			this.authService.errorMessage = 'You must add a title to your post before saving it'
			setTimeout(() => {
				this.authService.errorMessage = null
			}, 5000);
		}



	}


	url_domain(data: any) {

		if (isPlatformBrowser(this.platformId)) {
			var a = document.createElement('a');
			a.href = data;
			return a.hostname;
		}


	}

	public initialize(initControls) {
		this.initControls = initControls;
		this.threadService.getSignedRequestFroala()
			.subscribe((data) => {

				this.optionsFroala['imageUploadToS3'] = data;
				this.optionsFroala['videoUploadToS3'] = data;
				this.initControls.initialize();



			},
				(err) => {
					this.authService.successMessage = "Something went wrong! Please try again later",
						setTimeout(() => {
							this.authService.successMessage = null;
						}, 3000);
					this.location.back()
				})

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

	onChangePoster() {

	}


	onChange(event: EventTarget) {

		//Load something


		let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
		let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
		let files: FileList = target.files;
		this.file = files[0];
		this.fileThumbnail = files[0];
		this.fileWeb = files[0];
		this.fileType = this.file.type;
		this.fileTypeWeb = this.file.type;
		this.fileTypeThumbnail = this.fileType;
		this.fileName = this.authService.randomString(7) + this.authService.currentUser.username + '.' + this.file.type.split('/')[1];
		this.fileNameThumbnail = this.authService.randomString(7) + "-thumb" + this.authService.currentUser.username + '.' + this.file.type.split('/')[1];
		this.fileNameWeb = this.authService.randomString(7) + "-web" + this.authService.currentUser.username + '.' + this.file.type.split('/')[1];


		if (!files[0].name.match(/.(jpg|jpeg|png)$/i)) {

			this.authService.errorMessage = '.webp format is not supported, please use another format (.jpg, .jpeg, or .png)'
			setTimeout(() => {
				this.authService.errorMessage = null;
			}, 5000);
			return;
		}

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
			(img: any) => {
				if (img.type === "error") {
					this.authService.errorMessage = 'Error loading image, please try again with another one'
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 3000);

				} else {

					if (img.width < 400) this.lowQuality = true
					else {
						this.lowQuality = false
					}



					img.toBlob((blob: any) => {
						this.file = blob;

						//THUMBNAIL
						loadImage(
							this.fileThumbnail,
							(img: any) => {
								if (img.type === "error") {

									this.authService.errorMessage = 'Error loading image, please try again with another one'
									setTimeout(() => {
										this.authService.errorMessage = null;
									}, 3000);

								} else {

									img.toBlob((blob: any) => {
										this.fileThumbnail = blob;

										//THUMBNAIL
										loadImage(
											this.fileWeb,
											(img: any) => {
												if (img.type === "error") {

													this.authService.errorMessage = 'Error loading image, please try again with another one'
													setTimeout(() => {
														this.authService.errorMessage = null;
													}, 3000);

												} else {

													img.toBlob((blob: any) => {
														this.fileWeb = blob;

													}, this.fileType);

												}
											},
											{
												maxWidth: 1500,
												orientation: true
											}
										);

									}, this.fileType);

								}
							},
							{
								maxWidth: 200,
								orientation: true
							}
						);

					}, this.fileType);

				}
			},
			{
				maxWidth: 800,
				orientation: true
			}
		);
		// FileReader support (Para cargar la imagen en el img tag)


		if (this.file == null) {

			this.authService.errorMessage = 'No file selected'
			setTimeout(() => {
				this.authService.errorMessage = null;
			}, 3000);

		}


	}

	deletePicture() {


		this.file = undefined
		this.fileType = undefined
		this.fileName = undefined;
		this.threadPicture = undefined;
		this.lowQuality = false;

	}



	wordCount() {
		this.count = this.max - this.stepOneForm.get('title').value.length;
	}


	goBack() {

		this.location.back();

	}


	addOption() {

		this.optionsForm = this.stepOneForm.get('options') as FormArray;
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

	addOptionT() {

		this.postTeamsForm = this.stepOneForm.get('postTeams') as FormArray;
		this.postTeamsForm.push(this.createItemT());


	}

	deleteOption(i: number) {
		this.optionsForm = this.stepOneForm.get('options') as FormArray;
		this.optionsForm.removeAt(i)
	}

	deleteOptionT(i: number) {

		if (i > 0) {
			this.postTeamsForm = this.stepOneForm.get('postTeams') as FormArray;
			this.postTeamsForm.removeAt(i)
		} else {
			this.stepOneForm.setControl('postTeams', this.formBuilder.array([this.createItemT()]));
		}


	}


	onTeamChange(e) {

		let thread = {
			league: e.target.value
		}
		this.postTeamsForm = this.stepOneForm.get('postTeams') as FormArray;

		for (let index = 0; index < this.postTeamsForm.length; index++) {
			this.postTeamsForm.removeAt(index)
		}
		this.stepOneForm.setControl('postTeams', this.formBuilder.array([this.createItemT()]));
		this.getTeams(thread, false);
	}


	getTeams(thread: any, build: boolean) {

		this.authService.getAllTeams(thread.league)
			.subscribe((teams: any[]) => {

				if (teams.length == 0) this.teamsAvailable = false;
				else {
					this.teamsAvailable = true;
				}
				teams.sort((a, b) => (a.teamName > b.teamName) ? 1 : -1)
				this.teams = teams;

				if (build && thread.teams[0].length) {
					let formTeams;
					formTeams = thread.teams.map(t => {
						let t3 = teams.find(t2 => t2._id == t).teamName
						return this.formBuilder.group({
							postTeam: t3
						});
					})

					this.postTeamsForm = this.stepOneForm.get('postTeams') as FormArray;
					this.stepOneForm.setControl('postTeams', this.formBuilder.array(formTeams));

				}

			},
				(err) => {
					this.loadingTeams = false;
					this.authService.errorMessage = 'Error loading teams, please try again later';
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})
	}


	getSignedRequest(file: File, data: any, fileThumbnail: File, fileWeb: File) {

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


						//WEB IMAGE
						this.threadService.getSignedRequest(this.fileNameWeb, this.fileTypeWeb)
							.subscribe((responseThumb: any) => {
								this.signedRequestWebAWS = responseThumb.signedRequest;
								this.urlWebAWS = responseThumb.url;
								this.uploadFile(this.file, this.signedRequestAWS, this.urlAWS, data, this.fileThumbnail, this.signedRequestThumbnailAWS, this.urlThumbnailAWS, this.fileWeb, this.signedRequestWebAWS, this.urlWebAWS);

							},
								(err) => {

									this.authService.errorMessage = err;
									setTimeout(() => {
										this.authService.errorMessage = null;
									}, 5000);
									this.posting = false;

								});


					},
						(err) => {

							this.authService.errorMessage = err;
							setTimeout(() => {
								this.authService.errorMessage = null;
							}, 5000);
							this.posting = false;

						});

			},
				(err) => {
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);
					this.posting = false;

				});


	}

	uploadFile(file: File, signedRequest: string, url: string, data: any, fileThumbnail: File, signedRequestThumbnail: string, urlThumbnail: string, fileWeb: File, signedRequestWeb: string, urlWeb: string) {
		this.authService.uploadFile(signedRequest, file)
			.subscribe(() => {

				//THUMBNAIL
				this.authService.uploadFile(signedRequestThumbnail, fileThumbnail)
					.subscribe(() => {

						this.authService.uploadFile(signedRequestWeb, fileWeb)
							.subscribe(() => {

								let fileUrlNoSpaces = url.replace(/\s+/g, '+');
								data.picture = fileUrlNoSpaces;
								let fileUrlNoSpacesThumbnail = urlThumbnail.replace(/\s+/g, '+');
								data.thumbnail = fileUrlNoSpacesThumbnail;
								let fileUrlNoSpacesWeb = urlWeb.replace(/\s+/g, '+');
								data.webPicture = fileUrlNoSpacesWeb;

								if (this.url) {
									//submit Link

									this.threadService.newLinkThread(data)
										.subscribe(({ thread, error }: any) => {

											if (thread) {



												//DONE
												this.threadService.posting = true;

												if (isPlatformBrowser(this.platformId)) {
													localStorage.setItem('draft', '');
												}


												this.router.navigateByUrl('/')

											} else {
												this.authService.errorMessage = error;
												setTimeout(() => {
													this.authService.errorMessage = null;
												}, 5000);
												this.posting = false;

											}
										},
											(err) => {
												this.authService.errorMessage = err;
												setTimeout(() => {
													this.authService.errorMessage = null;
												}, 5000);
												this.posting = false;

											});  //no se pudo actualizar info


								} else {



									this.threadService.newThread(data)
										.subscribe(({ thread, error }: any) => {

											if (thread) {

												//DONE
												this.threadService.posting = true;
												if (isPlatformBrowser(this.platformId)) {
													localStorage.setItem('draft', '');
												}

												this.router.navigateByUrl('/')
											} else {
												this.authService.errorMessage = error;
												setTimeout(() => {
													this.authService.errorMessage = null;
												}, 5000);
												this.posting = false;
											}
										},
											(err) => {
												this.authService.errorMessage = err;
												setTimeout(() => {
													this.authService.errorMessage = null;
												}, 5000);
												this.posting = false;

											});  //no se pudo actualizar info

								}

							})

					},

						(err) => {
							this.authService.errorMessage = err;
							setTimeout(() => {
								this.authService.errorMessage = null;
							}, 5000);
							this.posting = false;

						});  //no se pudo subir el archivo a aws(thumbnail)



			},
				(err) => {
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);
					this.posting = false;

				});  //no se pudo subir el archivo a aws

	}

	getSignedRequestPoster(video: any, file: any, oldVideo: any) {


		//NORMAL IMAGE
		let fileName = this.authService.randomString(7) + this.authService.currentUser.username + '.png';
		let fileType = 'image/png';
		this.threadService.getSignedRequest(fileName, fileType)
			.subscribe((response: any) => {

				this.uploadFilePoster(response.signedRequest, file, video, response.url, oldVideo);


			},
				(err) => {
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);
					this.posting = false;

				});


	}

	uploadFilePoster(signedRequest: any, file: any, video: any, url: any, oldVideo: any) {
		this.authService.uploadFile(signedRequest, file)
			.subscribe(() => {

				let fileUrlNoSpaces = url.replace(/\s+/g, '+');
				video.poster = fileUrlNoSpaces;
				oldVideo.parentNode.replaceChild(video, oldVideo)

			},
				(err) => {
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);
					this.posting = false;

				});  //no se pudo subir el archivo a aws

	}

	saveChanges() {

		this.league = this.stepOneForm.get('league').value;
		this.title = this.stepOneForm.get('title').value;
		this.url = this.stepOneForm.get('url').value;
		this.description = this.editorContent || this.initControls.getEditor().html.get();
		let prov = this.stepOneForm.get('postTeams').value
		this.teamsMapped = prov.map(a => a.postTeam);

		if (this.teamsMapped[0].length) {
			this.teamsMapped = this.teamsMapped.map((t) => {
				return this.teams.find(t2 => t2.teamName == t)._id

			})
		} else {
			this.teamsMapped = null
		}

		this.editing = true;
		if (this.type != 'link') {
			if (this.initControls.getEditor().charCounter.count() < 600) {
				this.authService.errorMessage = 'The post must have at least 600 characters.'
				setTimeout(() => {
					this.authService.errorMessage = null;
				}, 3000);
				//dismiss load
				this.editing = false;
				return;
			}

			if (!this.title) {
				this.authService.errorMessage = 'Please add a title'
				setTimeout(() => {
					this.authService.errorMessage = null;
				}, 3000);
				//dismiss load
				this.editing = false;
				return;
			}
		}



		let data = {
			userId: this.authService.currentUser._id,
			league: this.league,
			title: this.title,
			description: this.type == 'url' ? undefined : this.description,
			url: this.url ? this.url : undefined,
			teams: this.teamsMapped != null ? this.teamsMapped : []

		}

		this.threadService.edit(this.threadService.threadToEdit._id, data)
			.subscribe((thread) => {

				this.editing = false;
				//DONE
				this.threadService.posting = true;
				if (isPlatformBrowser(this.platformId)) {
					localStorage.setItem('draft', '');
				}
				this.threadService.threadToEditOriginal.league = this.league;
				this.threadService.threadToEditOriginal.title = this.title;
				this.threadService.threadToEditOriginal.teams = this.teamsMapped != null ? this.teamsMapped : []
				this.threadService.threadToEditOriginal.url = this.url ? this.url : undefined,
					this.threadService.threadToEditOriginal.description = this.type == 'url' ? undefined : this.description;

				this.location.back()
			},
				(err) => {

					this.authService.errorMessage = 'The post must have at least 800 characters.'
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 3000);
					//dismiss load
					this.editing = false;


				})

	}



	submit() {

		this.posting = true;
		this.league = this.stepOneForm.get('league').value;
		this.title = this.stepOneForm.get('title').value;
		this.url = this.stepOneForm.get('url').value;
		this.description = this.editorContent || this.initControls.getEditor().html.get();
		let prov = this.stepOneForm.get('options').value
		let teams = this.stepOneForm.get('postTeams').value
		this.options = prov.map(a => a.pollOption);
		this.teamsMapped = teams.map(a => a.postTeam);

		this.teamsMapped = this.teamsMapped.filter(t => t.length)
		if (this.teamsMapped.length && this.teamsMapped[0].length) {
			this.teamsMapped = this.teamsMapped.map((t) => {
				return this.teams.find(t2 => t2.teamName == t)._id

			})
		} else {
			this.teamsMapped = null
		}
		//Something to load
		if (this.type == 'text') {

			if (this.initControls.getEditor().charCounter.count() < 300) {
				this.authService.errorMessage = 'The post must have at least 300 characters.'
				setTimeout(() => {
					this.authService.errorMessage = null;
				}, 3000);
				//dismiss load
				this.posting = false;
				return;
			}

			if (this.title && this.description && this.league) {

				let data = {
					title: this.title,
					description: this.description,
					league: this.league,
					type: 'General',
					fromWeb: true,
					teams: this.teamsMapped != null ? this.teamsMapped : undefined
				}

				if (!!this.file) this.getSignedRequest(this.file, data, this.fileThumbnail, this.fileWeb);
				else {

					this.threadService.newThread(data)
						.subscribe(({ thread, error }: any) => {

							if (thread) {

								//DONE
								this.threadService.posting = true;
								if (isPlatformBrowser(this.platformId)) {
									localStorage.setItem('draft', '');
								}
								this.router.navigateByUrl('/')
							} else {


								this.authService.errorMessage = error;
								setTimeout(() => {
									this.authService.errorMessage = null;
								}, 5000);
								this.posting = false;


							}

						},

							(err) => {
								this.authService.errorMessage = err;
								setTimeout(() => {
									this.authService.errorMessage = null;
								}, 5000);
								this.posting = false;

							});  //no se pudo subir el archivo a mlab

				}

			} else if (!this.title) {

				this.authService.errorMessage = 'Please enter a title';
				setTimeout(() => {
					this.authService.errorMessage = null;
				}, 5000);
				this.posting = false;

			} else {

				this.authService.errorMessage = 'Please select a feed';
				setTimeout(() => {
					this.authService.errorMessage = null;
				}, 5000);
				this.posting = false;

			}

		} else if (this.type == 'poll') {


			if (this.initControls.getEditor().charCounter.count() < 300) {

				this.authService.errorMessage = 'The post must have at least 300 characters.';
				setTimeout(() => {
					this.authService.errorMessage = null;
				}, 5000);
				this.posting = false;
				return;
			}


			if (this.title && this.description && this.league && this.options.length >= 2 && this.authService.isLoggedIn()) {
				for (let index = 0; index < this.options.length; index++) {
					const element = this.options[index];

					if (element.length <= 1) {

						this.authService.errorMessage = 'Polls must containt at least 2 options';
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 5000);
						this.posting = false;

						return;

					} else if (element.length == 0) {
						this.options.splice(index, 1);

					}

				}
				let data = {
					title: this.title,
					description: this.description,
					pollValues: this.options,
					league: this.league,
					type: 'Poll',
					fromWeb: true,
					teams: this.teamsMapped != null ? this.teamsMapped : undefined
				}

				if (!!this.file) this.getSignedRequest(this.file, data, this.fileThumbnail, this.fileWeb);
				else {

					this.threadService.newThread(data)
						.subscribe(({ thread, error }: any) => {

							if (thread) {

								//DONE
								this.threadService.posting = true;
								if (isPlatformBrowser(this.platformId)) {
									localStorage.setItem('draft', '');
								}
								this.router.navigateByUrl('/')
							} else {
								this.authService.errorMessage = error;
								setTimeout(() => {
									this.authService.errorMessage = null;
								}, 5000);
								this.posting = false;


							}
						},

							(err) => {
								this.authService.errorMessage = err;
								setTimeout(() => {
									this.authService.errorMessage = null;
								}, 5000);
								this.posting = false;

							});  //no se pudo subir el archivo a mlab

				}

			} else if (!this.title) {

				this.authService.errorMessage = 'Please enter a title';
				setTimeout(() => {
					this.authService.errorMessage = null;
				}, 5000);
				this.posting = false;


			} else if (!this.league) {

				this.authService.errorMessage = 'Please select a feed to post';
				setTimeout(() => {
					this.authService.errorMessage = null;
				}, 5000);
				this.posting = false;


			} else {

				this.authService.errorMessage = 'Missing fields';
				setTimeout(() => {
					this.authService.errorMessage = null;
				}, 5000);
				this.posting = false;

			}

		} else {

			if (this.title && this.url && this.authService.isLoggedIn() && this.league) {

				var pattern = /^((http|https|ftp):\/\/)/;
				if (!pattern.test(this.url)) {
					this.url = "http://" + this.url;
				}
				let data = {
					titleL: this.title,
					source: this.url_domain(this.url),
					urlL: this.url,
					leagueL: this.league,
					type: 'Link',
					fromWeb: true,
					teams: this.teamsMapped != null ? this.teamsMapped : undefined
				}

				if (!!this.file) this.getSignedRequest(this.file, data, this.fileThumbnail, this.fileWeb);
				else {

					this.threadService.newLinkThread(data)
						.subscribe(({ thread, error }: any) => {
							if (thread) {

								//DONE
								this.threadService.posting = true;
								if (isPlatformBrowser(this.platformId)) {
									localStorage.setItem('draft', '');
								}
								this.router.navigateByUrl('/')
							} else {
								this.authService.errorMessage = error;
								setTimeout(() => {
									this.authService.errorMessage = null;
								}, 5000);
								this.posting = false;

							}
						},

							(err) => {
								this.authService.errorMessage = err;
								setTimeout(() => {
									this.authService.errorMessage = null;
								}, 5000);
								this.posting = false;

							});  //no se pudo subir el archivo a mlab
				}

			} else if (!this.title) {

				this.authService.errorMessage = 'Please add a title';
				setTimeout(() => {
					this.authService.errorMessage = null;
				}, 5000);
				this.posting = false;


			} else {

				this.authService.errorMessage = 'Please enter a valid url';
				setTimeout(() => {
					this.authService.errorMessage = null;
				}, 5000);
				this.posting = false;

			}
		}



	}

}
