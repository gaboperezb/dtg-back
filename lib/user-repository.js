const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	User = require('../models/user'),
	Thread = require('../models/thread'),
	Report = require('../models/reports'),
	Badge = require('../models/badge'),
	Take = require('../models/take'),
	bcrypt = require('bcryptjs'),
	ObjectId = mongoose.Types.ObjectId,
	passport = require('passport'),
	agenda = require('./agenda'),
	FacebookStrategy = require('passport-facebook').Strategy;
aws = require('aws-sdk'),
	helper = require('sendgrid').mail,
	crypto = require('crypto'),
	async = require('async'),
	fromEmail = new helper.Email('support@discussthegame.com', 'Discuss TheGame'),
	fromName = 'Discuss TheGame'

class UserRepository {


	getTakes(limit, skip, userId, callback) { //HOT

		Take.find({ user: userId })
			.sort({ date: -1 })
			.skip(skip)
			.limit(limit)
			.exec((err, takes) => {
				if (err) return callback(err);
				callback(null, takes)
			})

	}

	lastMessage(userId, chat, lastMessage, callback) {

		User.findById(userId)
			.exec((err, user) => {
				if (err) return callback(err);

				if (user.rooms.length) {
					let index = user.rooms.findIndex(room => room.chat.toString() == chat)
					if (index > -1) {
						user.rooms[index].lastMessage = lastMessage

					} else {
						let room = {
							chat,
							lastMessage
						}
						user.rooms.push(room);
					}

				} else {
					let room = {
						chat,
						lastMessage
					}
					user.rooms.push(room);

				}

				user.save((err, user) => {
					if (err) return callback(err);

					callback(null, true);
				})
			})

	}

	allowDMS(user, callback) {
		user.dmsOpen = !user.dmsOpen;
		user.save((err, user) => {
			if (err) return callback(err);
			callback(null, true);
		})
	}

	follow(userId, ownUser, callback) {

		let userToSendNotification;
		User.findById(userId, { notis: 1, followers: 1, followersNumber: 1, playerIds: 1, badge: 1, totalPoints: 1, usersBlocked: 1 })
			.populate('badge')
			.exec((err, user) => {
				if (err) return callback(err);
				if (!user) {
					var err = new Error("Not Found");
					err.status = 404;
					return callback(err);
				}

				//Rechazar de bloqueados

				let provUsers = user.usersBlocked.map(item => item.toString());
				if (provUsers.indexOf(userId) > -1) {
					var err = new Error("Not Found");
					err.status = 404;
					return callback(err);
				}

				if (user.followers.length == 0 || !user.followers.some(user => user.toString() == ownUser._id.toString())) {

					user.followers.unshift(ownUser._id);
					user.followersNumber += 1;
					userToSendNotification = user;

					user.totalPoints += 10;
					if (user.badge.nextBadge) {
						if (user.totalPoints >= user.badge.nextPoints) {
							user.badge = user.badge.nextBadge;
						}
					}


					let notification = {
						user: ownUser._id,
						typeOf: "follow",
						date: new Date()
					};
					if (user.notis.length > 15) user.notis.splice(14);
					user.notis.unshift(notification);
					user.save((err, user) => {
						if (err) return callback(err);
						ownUser.following.unshift(userId);
						ownUser.followingNumber += 1;
						ownUser.save((err, user) => {

							if (err) return callback(err);
							if (!user) {
								var err = new Error("Not Found");
								err.status = 404;
								return callback(err);
							}
							let title = ownUser.username + " is now following you";
							var message = {
								notification: {
									title,
									sound: 'default',
									icon: 'ic_stat_notify'
								},
								data: {
									"userId": ownUser._id.toString(),
									"foll": "1"
								}
							};
							if (Array.isArray(userToSendNotification.playerIds)) {
								if (userToSendNotification.playerIds.length == 0) return callback(null, user);
							}
							agenda.now('user notification', { playerIds: userToSendNotification.playerIds, notification: message });
							callback(null, user);
						})
					})
				}
			})


	}

	unfollow(userId, ownUser, callback) {

		User.findById(userId, { notis: 1, followers: 1, followersNumber: 1, badge: 1, totalPoints: 1 })
			.populate('badge')
			.exec((err, user) => {
				if (err) return callback(err);
				if (!user) {
					var err = new Error("Not Found");
					err.status = 404;
					return callback(err);
				}

				if (user.followers.some(user => user.toString() == ownUser._id.toString())) {

					user.notis = user.notis.filter(element => !((element.user.toString() == ownUser._id.toString()) && element.typeOf == 'follow'));

					user.followers = user.followers.filter(element => element.toString() != ownUser._id.toString())
					user.followersNumber -= 1;
					user.totalPoints -= 10;
					if (user.badge.previousBadge) {
						if (user.totalPoints < user.badge.previousPoints) {
							user.badge = user.badge.previousBadge;
						}
					}
					user.save((err, user) => {
						if (err) return callback(err);
						if (!user) {
							var err = new Error("Not Found");
							err.status = 404;
							return callback(err);
						}
						ownUser.following = ownUser.following.filter(element => element.toString() != userId.toString())
						ownUser.followingNumber -= 1;
						ownUser.save((err) => {
							if (err) return callback(err);
							callback(null, user);
						})
					})
				}
			})
	}

	clearNotifications(user, body, callback) {


		if (body.newNotifications) { //nueva version

			if (body.type == 'message') {

				let array = [];
				for (let index = 0; index < body.newNotifications; index++) {
					array.push("message");
				}
				user.notifications = user.notifications.filter(n => n != 'message');
				user.notifications = user.notifications.concat(array);

				user.save((err, user) => {
					callback(null, true)
				})

			} else {

				user.notifications = user.notifications.filter(n => n == 'message');
				user.save((err, user) => {
					callback(null, true)
				})
			}

		} else {

			User.findByIdAndUpdate(user._id, { $set: { notifications: [] } }, (err, user) => {
				if (err) return callback(err);
				callback(null, true)

			});
		}


	}

	reportUser(data, callback) {

		Report.create(data, (err, report) => {
			if (err) return callback(err);
			callback(null, true)
		});
	}

	blockUser(blockedBy, userBlocked, callback) {

		//El usuario que bloquea
		User.findById(blockedBy, { usersBlocked: 1, followers: 1, followersNumber: 1, following: 1, followingNumber: 1 })
			.exec((err, user) => {
				if (err) return callback(err);
				if (!user) {
					var err = new Error("Not Found");
					err.status = 404;
					return callback(err);
				}
				if (!user.usersBlocked.some(user => user.toString() == userBlocked.toString())) {
					user.usersBlocked.push(userBlocked);
				}

				if (user.followers.some(user => user.toString() == userBlocked.toString())) {

					user.followers = user.followers.filter((id) => {
						return id.toString() != userBlocked.toString();
					})
					user.followersNumber -= 1;

				}
				if (user.following.some(user => user.toString() == userBlocked.toString())) {

					user.following = user.following.filter((id) => {
						return id.toString() != userBlocked.toString();
					})
					user.followingNumber -= 1;

				}


				user.save((err, user) => {
					if (err) return callback(err);

					//El usuario al que se bloquea
					User.findById(userBlocked, { usersBlockedBy: 1, followers: 1, followersNumber: 1, following: 1, followingNumber: 1 })
						.exec((err, user) => {
							if (err) return callback(err);
							if (!user) {
								var err = new Error("Not Found");
								err.status = 404;
								return callback(err);
							}

							if (!user.usersBlockedBy.some(user => user.toString() == blockedBy.toString())) {
								user.usersBlockedBy.push(blockedBy);
							}

							if (user.followers.some(user => user.toString() == blockedBy.toString())) {

								user.followers = user.followers.filter((id) => {
									return id.toString() != blockedBy.toString();
								})
								user.followersNumber -= 1;

							}
							if (user.following.some(user => user.toString() == blockedBy.toString())) {

								user.following = user.following.filter((id) => {
									return id.toString() != blockedBy.toString();
								})
								user.followingNumber -= 1;
							}
							user.save((err, user) => {
								if (err) return callback(err);
								callback(null, true);
							})
						})


				})
			})
	}

	unblockUser(unblockedBy, userUnblocked, callback) {

		//El usuario que desbloquea
		User.findById(unblockedBy)
			.exec((err, user) => {
				if (err) return callback(err);
				if (!user) {
					var err = new Error("Not Found");
					err.status = 404;
					return callback(err);
				}

				user.usersBlocked = user.usersBlocked.filter(element => element.toString() != userUnblocked.toString());
				user.save((err, user) => {
					if (err) return callback(err);

					//El usuario al que se bloquea
					User.findById(userUnblocked)
						.exec((err, user) => {
							if (err) return callback(err);
							if (!user) {
								var err = new Error("Not Found");
								err.status = 404;
								return callback(err);
							}
							user.usersBlockedBy = user.usersBlockedBy.filter(element => element.toString() != unblockedBy.toString());
							user.save((err, user) => {
								if (err) return callback(err);
								callback(null, true);
							})
						})


				})
			})
	}

	clearOneNotification(id, callback) {
		User.findByIdAndUpdate(id, { $pop: { notifications: -1 } }, (err, user) => {
			if (err) return callback(err);
			callback(null, true)

		});
	}

	saveVersionNumber(user, body, callback) {
		User.findByIdAndUpdate(user._id, { $set: { versionNumber: body.versionNumber } }, (err, user) => {
			if (err) return callback(err);
			callback(null, user.versionNumber)

		});
	}

	saveTimeSpent(user, body, callback) {
		let points = 0;
		let today = new Date();
		let todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		let dateGuard = new Date(user.pointsPerDay.date);
		let timeSpent = +body.timeSpent < 2.4e+6 ? +body.timeSpent : 2.4e+6;
		let sameDay = dateGuard.getTime() == todayNoTime.getTime();

		user.timeSpent.twoMinutesControl += timeSpent;
		user.timeSpent.timeSpent += timeSpent;

		if (user.timeSpent.twoMinutesControl > 120000) { //120,000 mm = 2 m
			points = Math.round(user.timeSpent.twoMinutesControl / 1000 / 60 / 2);
			user.timeSpent.twoMinutesControl = 0;
			if (!sameDay) {
				user.pointsPerDay.date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
				user.pointsPerDay.points = points;
			} else {
				if (user.pointsPerDay.points + points > 150) {
					points = 150 - user.pointsPerDay.points;
					if (points == 0) return callback(null, false);
					else {
						user.pointsPerDay.points += points;
					}
				}
			}
			user.totalPoints += points;
			if (user.badge.nextBadge) {
				if (user.totalPoints >= user.badge.nextPoints) {
					user.badge = user.badge.nextBadge;
				}
			}
		}

		user.save((err, user) => {
			if (err) return callback(null, false);
			callback(null, true)
		})
	}

	saveFcmToken(id, playerId, callback) {
		User.findById(id, (err, user) => {
			if (err) return callback(err);
			user.playerIds = user.playerIds.filter(p => p != playerId);
			user.playerIds.push(playerId);
			user.save((err, user) => {
				if (err) return callback(null, false);
				callback(null, true)
			})
		});

	}

	logOut(id, playerId, callback) {
		User.findById(id, (err, user) => {
			if (err) return callback(err);
			let playerIds = user.playerIds.filter(pId => pId != playerId);
			user.playerIds = playerIds;
			user.save((err) => {
				if (err) return callback(err);
				callback(null, true)
			})


		});

	}



	resumeNotifications(userId, callback) {
		User.findById(userId)
			.populate('badge')
			.exec((err, user) => {
				if (err) return callback(err);
				let data = {
					notifications: user.notifications,
					blocked: user.blocked,
					blockedReason: user.blockedReason ? user.blockedReason : null
				};
				callback(null, user);
			})
	}

	getFollowers(skip, userId, callback) {
		User.findById(userId, { followers: true })
			.populate('badge')
			.exec((err, user) => {

				if (err) return callback(err);
				if (skip != 0) {
					user.followers = user.followers.filter((x, i) => { //skip
						if (i > (skip - 1)) { return true }
					})
				}
				user.followers = user.followers.filter((x, i) => { //limit
					if (i <= (20 - 1)) { return true }
				})

				User.populate(user, { "path": "followers", "select": { "bio": 1, "createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "badge": 1, "playerIds": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 }, "populate": { "path": 'badge' } }, (error, userPopulated) => {
					if (error) return callback(error);
					callback(null, userPopulated.followers)

				});

			})
	}

	getFollowing(skip, userId, callback) {
		User.findById(userId, { notis: false })
			.populate('badge')
			.exec((err, user) => {
				if (err) return callback(err);

				if (skip != 0) {
					user.following = user.following.filter((x, i) => { //skip
						if (i > (skip - 1)) { return true }
					})
				}
				user.following = user.following.filter((x, i) => { //limit
					if (i <= (20 - 1)) { return true }
				})

				User.populate(user, { "path": "following", "select": { "bio": 1, "createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "badge": 1, "playerIds": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 }, "populate": { "path": 'badge' } }, (error, userPopulated) => {
					if (error) return callback(error);
					callback(null, userPopulated.following)

				});

			})
	}


	searchUsers(usersFlag, searchTerm, skip, callback) {

		var regexp = new RegExp("^" + searchTerm);
		User.find({ username: regexp, _id: { $nin: usersFlag } }, { "bio": 1, "createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "badge": 1, "playerIds": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 })
			.populate('badge')
			.skip(skip)
			.limit(20)
			.exec((err, users) => {
				if (err) return callback(err);
				callback(null, users);
			})

	}


	searchUsersLoggedOut(searchTerm, skip, callback) {

		var regexp = new RegExp("^" + searchTerm);
		User.find({ username: regexp }, { "bio": 1, "createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "badge": 1, "playerIds": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 })
			.populate('badge')
			.skip(skip)
			.limit(20)
			.exec((err, users) => {
				if (err) return callback(err);
				callback(null, users);
			})

	}



	getUserProfile(id, callback) {


		User.findById(id, { "bio": 1, "createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "badge": 1, "playerIds": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1, "favAllTeams": 1 })
			.populate('badge')
			.populate('favAllTeams')
			.exec((err, user) => {
				if (err) return callback(err);
				if (!user) {
					var err = new Error("Not Found");
					err.status = 404;
					return callback(err);
				}
				let teams = user.favAllTeams.filter(t => t != null)
				user.favAllTeams = teams;
				callback(null, user);
			})

	}


	getUserProfileUsername(id, callback) {

		User.findOne({ username: id }, { "bio": 1, "createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "badge": 1, "playerIds": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1, "favAllTeams": 1 })
			.populate('badge')
			.populate('favAllTeams')
			.exec((err, user) => {
				if (err) return callback(err);
				if (!user) {
					var err = new Error("Not Found");
					err.status = 404;
					return callback(err);
				}
				let teams = user.favAllTeams.filter(t => t != null)
				user.favAllTeams = teams;

				callback(null, user);
			})




	}




	getProfile(skip, userId, callback) {
		User.findById(userId, { notis: false })
			.populate('badge')
			.exec((err, user) => {
				if (err) return callback(err);
				if (skip != 0) {
					user.threads = user.threads.filter((x, i) => { //skip
						if (i > (skip - 1)) { return true }
					})
				}
				user.threads = user.threads.filter((x, i) => { //limit
					if (i <= (15 - 1)) { return true }
				})

				User.populate(user, { "path": "threads" }, (error, resultsBadge) => {
					if (error) return callback(error);
					callback(null, resultsBadge)

				});

			})
	}

	getTrivias(skip, userId, callback) {
		User.findById(userId, { notis: false })
			.exec((err, user) => {
				if (err) return callback(err);
				if (skip != 0) {
					user.trivias = user.trivias.filter((x, i) => { //skip
						if (i > (skip - 1)) { return true }
					})
				}
				user.trivias = user.trivias.filter((x, i) => { //limit
					if (i <= (15 - 1)) { return true }
				})
				User.populate(user, { "path": "trivias" }, (error, resultsBadge) => {
					if (error) return callback(error);
					callback(null, resultsBadge)

				});

			})

	}


	getNotifications(userId, callback) {

		User.findById(userId, { notis: true })
			.populate({ 'path': 'notis.user', "select": { "bio": 1, "createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "badge": 1, "playerIds": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 }, "populate": { "path": 'badge' } })
			.populate({ 'path': 'notis.timelineUser', "select": { "bio": 1, "createdAt": 1, 'followingNumber': 1, 'followersNumber': 1, 'username': 1, 'profilePicture': 1, 'verified': 1, 'profilePictureThumbnail': 1, "badge": 1, "playerIds": 1, "_id": 1, "totalPoints": 1, "coverPhoto": 1 }, "populate": { "path": 'badge' } })
			.exec((err, user) => {
				if (err) return callback(err);
				callback(null, user);
			})
	}

	saveLeagues(leagues, user, callback) {
		User.findByIdAndUpdate(user, { leagues: leagues }, (err, user) => {
			if (err) return callback(err);
			callback(null, user.leagues)
		})
	}

	signup(body, callback) {

		Badge.findOne({ 'level': 1 }, (err, badge) => {
			if (err) return callback(err);
			if (badge) {
				body.badge = badge._id;
				User.create(body, (err, user) => {
					if (err) {
						if (err.code == 11000) {
							var field = err.message
							// now we have `email_1 dup key`
							field = field.split(' dup key: ')[1];
							var mySubString = field.substring(
								field.lastIndexOf("{") + 1,
								field.lastIndexOf(":")
							);
							let error = `That ${mySubString} is already registered`;
							return callback(null, error, null);
						}

						return callback(err)
					};

					User.populate(user, { "path": "badge" }, (error, userPopulated) => {
						if (error) return callback(error);
						callback(null, null, userPopulated);

					});

				})

			} else {
				let err = new Error('Not found');
				err.status = 400;
				return callback(err);
			}

		})

		//
	}

	edit(body, userId, callback) {

		if (body.username) {
			User.findById(userId, (err, user) => {
				if (err) {
					let error = `Error. Please try again later`;
					return callback(null, error, null);

				}

				if (user.usernameExpires) {
					if (new Date(user.usernameExpires) > Date.now()) {

						let month = new Date(user.usernameExpires).getUTCMonth() + 1; //months from 1-12
						let day = new Date(user.usernameExpires).getUTCDate();
						let newdate = month + "/" + day;
						let error = `You can change your username until ${newdate}`;
						return callback(null, error, null);
					} else {

						if (body.username.length == 0) {
							let error = `Please enter a valid username`;
							return callback(null, error, null);
						}

						let newUsername = body.username.toLowerCase().replace(/\s/g, '');

						if (newUsername.match(/^[a-zA-Z0-9_]{1,21}$/)) {

						} else {
							let error = `Please enter a valid username. Don't add special symbols`;
							return callback(null, error, null);
						}
						if (newUsername.trim().search(/(^nba$|^nfl$|^nhl$|^mlb$)/i) != -1) {
							let error = "Are you" + newUsername.toUpperCase() + "? Please contact us at support@discussthegame.com";
							return callback(null, error, null);
						}

						if (newUsername.search(/(amino|hardwood|discussthegame|dtg)/i) != -1) {
							let error = "Invalid username. Please choose another one.";
							return callback(null, error, null);
						}

						user.username = newUsername;
						user.usernameExpires = Date.now() + 5.256e+9;
						user.save((err, user) => {
							if (err) {
								if (err.code == 11000) {
									var field = err.message
									// now we have `email_1 dup key`
									field = field.split(' dup key: ')[1];
									var mySubString = field.substring(
										field.lastIndexOf("{") + 1,
										field.lastIndexOf(":")
									);
									let error = `That ${mySubString} is already registered`;
									return callback(null, error, null);
								}
								return callback(err)
							};
							User.populate(user, { "path": "badge" }, (error, userPopulated) => {
								if (error) return callback(error);
								callback(null, null, userPopulated);
							});
						})
					}
				} else {

					if (body.username.length == 0) {
						let error = `Please enter a valid username`;
						return callback(null, error, null);
					}

					let newUsername = body.username.toLowerCase().replace(/\s/g, '');

					if (newUsername.match(/^[a-zA-Z0-9_]{1,21}$/)) {

					} else {
						let error = `Please enter a valid username. Don't add special symbols`;
						return callback(null, error, null);
					}
					if (newUsername.trim().search(/(^nba$|^nfl$|^nhl$|^mlb$)/i) != -1) {
						let error = "Are you" + newUsername.toUpperCase() + "? Please contact us at support@discussthegame.com";
						return callback(null, error, null);
					}

					if (newUsername.search(/(amino|hardwood|discussthegame|dtg)/i) != -1) {
						let error = "Invalid username. Please choose another one.";
						return callback(null, error, null);
					}

					user.username = newUsername;
					user.usernameExpires = Date.now() + 5.256e+9;
					user.save((err, user) => {
						if (err) {
							if (err.code == 11000) {
								var field = err.message
								// now we have `email_1 dup key`
								field = field.split(' dup key: ')[1];
								var mySubString = field.substring(
									field.lastIndexOf("{") + 1,
									field.lastIndexOf(":")
								);
								let error = `That ${mySubString} is already registered`;
								return callback(null, error, null);
							}
							return callback(err)
						};
						User.populate(user, { "path": "badge" }, (error, userPopulated) => {
							if (error) return callback(error);
							callback(null, null, userPopulated);
						});
					})
				}



			})
		} else {
			User.findByIdAndUpdate(userId, body, { new: true }, (err, user) => {
				if (err) {
					if (err.code == 11000) {
						var field = err.message
						// now we have `email_1 dup key`
						field = field.split(' dup key: ')[1];
						var mySubString = field.substring(
							field.lastIndexOf("{") + 1,
							field.lastIndexOf(":")
						);
						let error = `That ${mySubString} is already registered`;
						return callback(null, error, null);
					}
					return callback(err)
				};
				User.populate(user, { "path": "badge" }, (error, userPopulated) => {
					if (error) return callback(error);
					callback(null, null, userPopulated);
				});


			})
		}


	}

	changePassword(body, userId, callback) {

		User.findById(userId, (err, user) => {
			if (err) return callback(err);
			bcrypt.compare(body.currentPassword, user.password, function (error, result) {
				if (result === true) {
					bcrypt.hash(body.newPassword, 10, function (err, hash) {
						if (err) {
							return callback(err);
						}
						user.password = hash;
						user.save((error, user) => {
							if (error) return callback(err);
							return callback(null, null, user);
						})

					});

				} else {
					let err = "The password you entered doesn't match with any user";
					return callback(null, err, null);

				}



			})

		})

	}

	forgot(body, host, callback) {
		//Avoid nesting callbacks(done calls the next function, if an error is  passed to the next function, the error calback is executed)
		async.waterfall([
			function (done) {
				crypto.randomBytes(20, function (err, buf) {
					var token = buf.toString('hex');
					done(err, token);
				});
			},
			function (token, done) {
				User.findOne({ email: body.email })
					.select('email')
					.exec((err, user) => {

						if (!user) {
							let errorMessage = "No user account is associated with that email.";
							return callback(null, errorMessage, null)

						}
						user.resetPasswordToken = token;
						user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

						user.save(function (err) {
							done(err, token, user);
						});
					});
			},
			//Send mail
			function (token, user, done) {


				let body = {
					"personalizations": [
						{
							"to": [
								{
									"email": user.email
								}
							],
							"subject": "Password reset"

						}
					],
					"from": {
						"email": "support@discussthegame.com",
						"name": "Discuss TheGame"
					},
					"content": [
						{
							"type": "text/plain",
							"value": 'You are receiving this because you (or someone else) have requested a password reset for your DTG account.\n\n' +
								'Please click on the following link or paste this into your browser to complete the process:\n\n' +
								'http://' + host + '/pwd-reset/' + token + '\n\n' +
								'If you did not request this, please ignore this email and your password will remain unchanged.\n'
						}
					]

				}

				
				var request = sg.emptyRequest({
					method: 'POST',
					path: '/v3/mail/send',
					body: body
				});

				sg.API(request, function (error, response) {
					done(error, 'done');

				});

			}
		], function (err) {
			if (err) return callback(err);

			let successMessage = "An e-mail has been sent to the email adress you entered with further instructions.";

			callback(null, null, successMessage);

		});
	}

	//When the link in the email is clicked
	reset(token, callback) {
		User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
			if (err) return callback(err);
			if (!user) {
				let errorMessage = "Password reset token is invalid or has expired.";
				return callback(null, errorMessage, null)
			}
			callback(null, null, true);
		});

	}


	postReset(body, token, callback) {
		async.waterfall([
			function (done) {
				User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } })
					.exec((err, user) => {
						if (!user) {
							let errorMessage = "Password reset token is invalid or has expired.";
							return callback(null, errorMessage, null, null)
						}

						bcrypt.hash(body.password, 10, function (err, hash) {
							if (err) {
								return callback(err);
							}
							user.password = hash;
							user.resetPasswordToken = undefined;
							user.resetPasswordExpires = undefined;
							user.save(function (err, user) {
								done(err, user);

							});
						});


					});
			},
			function (user, done) {
				let body = {
					"personalizations": [
						{
							"to": [
								{
									"email": user.email
								}
							],
							"subject": "Password reset confirmation"

						}
					],
					"from": {
						"email": "support@discussthegame.com",
						"name": "Discuss TheGame"
					},
					"content": [
						{
							"type": "text/plain",
							"value": 'This is a confirmation that the password for your account' + user.email + ' has just been changed.\n'
						}
					]

				}

				
				var request = sg.emptyRequest({
					method: 'POST',
					path: '/v3/mail/send',
					body: body
				});

				sg.API(request, function (error, response) {
					done(error, user);

				});


			}
		], function (err, user) {
			if (err) return callback(err);
			if (user) {
				let successMessage = "Success! Your password has been changed.";
				return callback(null, null, successMessage, user);
			}
		});


	}





}

module.exports = new UserRepository();