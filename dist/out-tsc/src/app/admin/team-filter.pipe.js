import { __decorate } from "tslib";
import { Pipe } from '@angular/core';
let TeamFilterPipe = class TeamFilterPipe {
    transform(value, filterBy) {
        filterBy = filterBy ? filterBy : null;
        return filterBy ? value.filter((team) => team.league.indexOf(filterBy) !== -1) : value;
    }
};
TeamFilterPipe = __decorate([
    Pipe({
        name: 'teamFilter'
    })
], TeamFilterPipe);
export { TeamFilterPipe };
//# sourceMappingURL=team-filter.pipe.js.map