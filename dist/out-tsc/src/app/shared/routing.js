import { __decorate } from "tslib";
import { Injectable } from "@angular/core";
let CacheRouteReuseStrategy = class CacheRouteReuseStrategy {
    constructor() {
        this.storedRouteHandles = new Map();
        this.allowRetriveCache = {
            'home': true,
            'featured': true,
            'u/:username': 'initial'
        };
    }
    shouldReuseRoute(before, curr) {
        return (before.routeConfig === curr.routeConfig);
    }
    shouldAttach(route) {
        const path = this.getComponent(route);
        console.log('test', path);
        if (this.allowRetriveCache[path] && path == 'u/:username') {
            if (this.allowRetriveCache[path] != route.paramMap.get('username')) {
                return false;
            }
            else {
                return this.storedRouteHandles.has(this.getComponent(route));
                ;
            }
        }
        else if (this.allowRetriveCache[path]) {
            return this.storedRouteHandles.has(this.getComponent(route));
        }
        else {
            return false;
        }
    }
    retrieve(route) {
        return this.storedRouteHandles.get(this.getComponent(route));
    }
    shouldDetach(route) {
        const path = this.getComponent(route);
        if (this.allowRetriveCache.hasOwnProperty(path)) {
            return true;
        }
        return false;
    }
    store(route, detachedTree) {
        if (this.getComponent(route) == 'u/:username') {
            this.allowRetriveCache[this.getComponent(route)] = route.paramMap.get('username');
            if (this.storedRouteHandles.has(this.getComponent(route)))
                this.storedRouteHandles.delete(this.getComponent(route));
        }
        console.log('set');
        this.storedRouteHandles.set(this.getComponent(route), detachedTree);
    }
    getComponent(route) {
        if (route.routeConfig != null && route.routeConfig.path != null) {
            return route.routeConfig.path;
        }
        return '';
    }
};
CacheRouteReuseStrategy = __decorate([
    Injectable()
], CacheRouteReuseStrategy);
export { CacheRouteReuseStrategy };
//# sourceMappingURL=routing.js.map