import { __decorate, __param } from "tslib";
import { Injectable, Inject } from '@angular/core';
//Grab everything with import 'rxjs/Rx';
import { Observable } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
let WebSocketService = class WebSocketService {
    constructor(socket, platformId) {
        this.socket = socket;
        this.platformId = platformId;
        if (isPlatformServer(this.platformId)) {
            this.socket.disconnect();
        }
    }
    loggedIn(user) {
        this.socket.emit('login', {
            user: user
        });
    }
    joinRoom(room) {
        this.socket.emit('room', {
            room
        });
    }
    leaveRoom(room) {
        this.socket.emit('leave-room', {
            room
        });
    }
    emitMessage(chat, message, user) {
        this.socket.emit('message', {
            chat,
            message,
            user
        });
    }
    emitStartTyping(chat, username, roomsToEmit) {
        this.socket.emit('startTyping', {
            chat,
            username,
            roomsToEmit
        });
    }
    emitEndTyping(chat, username, roomsToEmit) {
        this.socket.emit('endTyping', {
            chat,
            username,
            roomsToEmit
        });
    }
    emitPost(id, type, user, ownUser) {
        this.socket.emit('post', {
            id: id,
            user: user,
            type: type,
            ownUser: !!ownUser ? ownUser : null
        });
    }
    connection() {
        this.socket.connect();
    }
    disconnection() {
        this.socket.disconnect();
    }
    updateConnection(connection, id) {
        if (connection == "online") {
            this.socket.emit('updateConnection', id);
        }
    }
    onConnection() {
        let observable = new Observable(observer => {
            this.socket.on('connect', (reason) => {
                observer.next(reason);
            });
            return () => {
                this.socket.disconnect();
            };
        });
        return observable;
    }
    onDisconnection() {
        let observable = new Observable(observer => {
            this.socket.on('disconnect', (reason) => {
                observer.next(reason);
            });
            return () => {
                this.socket.disconnect();
            };
        });
        return observable;
    }
    onNotifications() {
        let observable = new Observable(observer => {
            this.socket.on('notification', (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });
        return observable;
    }
    onMessages() {
        let observable = new Observable(observer => {
            this.socket.on('message', (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });
        return observable;
    }
    onStartTyping() {
        let observable = new Observable(observer => {
            this.socket.on('startTyping', (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });
        return observable;
    }
    onEndTyping() {
        let observable = new Observable(observer => {
            this.socket.on('endTyping', (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });
        return observable;
    }
};
WebSocketService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __param(1, Inject(PLATFORM_ID))
], WebSocketService);
export { WebSocketService };
//# sourceMappingURL=websocket.service.js.map