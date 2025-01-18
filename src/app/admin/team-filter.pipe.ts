import {  PipeTransform, Pipe } from '@angular/core';


@Pipe({
    name: 'teamFilter'
})
export class TeamFilterPipe implements PipeTransform {

    transform(value: any, filterBy: string): any {
        filterBy = filterBy ? filterBy : null;
        return filterBy ? value.filter((team: any) =>
            team.league.indexOf(filterBy) !== -1) : value;
    }
}
