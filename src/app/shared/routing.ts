import { RouteReuseStrategy } from '@angular/router/';
import { ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';
import { Injectable } from "@angular/core";

@Injectable()
export class CacheRouteReuseStrategy implements RouteReuseStrategy {
    storedRouteHandles = new Map<string, DetachedRouteHandle>();
    allowRetriveCache = {
        'home': true,
        'featured': true,
        'u/:username': 'initial'
    };

    shouldReuseRoute(before: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return (before.routeConfig === curr.routeConfig);
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        const path = this.getComponent(route);
        console.log('test', path)

        if (this.allowRetriveCache[path] && path == 'u/:username') {
            if (this.allowRetriveCache[path] != route.paramMap.get('username')) {
                return false;
            } else {
                return this.storedRouteHandles.has(this.getComponent(route));;
            }
        } else if (this.allowRetriveCache[path]) {
            return this.storedRouteHandles.has(this.getComponent(route));
        } else {
            return false;
        }

    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        return this.storedRouteHandles.get(this.getComponent(route)) as DetachedRouteHandle;
    }

    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        const path = this.getComponent(route);
        if (this.allowRetriveCache.hasOwnProperty(path)) {

            return true;
        }
        return false;
    }

    store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {


        if (this.getComponent(route) == 'u/:username') {
            this.allowRetriveCache[this.getComponent(route)] = route.paramMap.get('username')
            if (this.storedRouteHandles.has(this.getComponent(route))) this.storedRouteHandles.delete(this.getComponent(route));
        }
        console.log('set')
        this.storedRouteHandles.set(this.getComponent(route), detachedTree);
    }

    private getComponent(route: ActivatedRouteSnapshot): string {
        
        if (route.routeConfig != null && route.routeConfig.path != null) {
            return route.routeConfig.path  
        }
        return '';
    }

}