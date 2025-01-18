import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
let SeoSocialShareService = class SeoSocialShareService {
    constructor(metaService, titleService) {
        this.metaService = metaService;
        this.titleService = titleService;
    }
    setData(data) {
        this.setTitle(data.title);
        this.setDescription(data.description);
        this.setType(data.large, data.website);
        this.setSite(data.site);
        this.setImage(data.image);
    }
    setTitle(title = '', notifications) {
        this.pureTitle = title;
        if (!!notifications && notifications > 0)
            this.titleService.setTitle(`(${notifications}) ${title}`);
        else {
            this.titleService.setTitle(title);
        }
        if (title && title.length) {
            this.metaService.updateTag({ name: 'twitter:title', content: title });
            this.metaService.updateTag({ name: 'twitter:image:alt', content: title });
            this.metaService.updateTag({ property: 'og:image:alt', content: title });
            this.metaService.updateTag({ property: 'og:title', content: title });
            this.metaService.updateTag({ name: 'title', content: title });
        }
        else {
            this.metaService.removeTag(`name='twitter:title'`);
            this.metaService.removeTag(`name='twitter:image:alt'`);
            this.metaService.removeTag(`property='og:image:alt'`);
            this.metaService.removeTag(`property='og:title'`);
            this.metaService.removeTag(`name='title'`);
        }
    }
    setDescription(description = '') {
        if (description && description.length) {
            let stripped = description.replace(/(<([^>]+)>)/ig, "").substring(0, 200);
            this.metaService.updateTag({ name: 'description', content: stripped });
            this.metaService.updateTag({ name: 'og:description', content: stripped });
            this.metaService.updateTag({ name: 'twitter:description', content: stripped });
        }
        else {
            this.metaService.removeTag("name='twitter:description'");
            this.metaService.removeTag("property='og:description'");
            this.metaService.removeTag("name='description'");
        }
    }
    setImage(image) {
        if (image && image.length) {
            this.metaService.updateTag({ name: 'twitter:image', content: image });
            this.metaService.updateTag({ property: 'og:image', content: image });
        }
        else {
            this.metaService.removeTag("name='twitter:image'");
            this.metaService.removeTag("property='og:image'");
        }
    }
    setSite(site) {
        if (site && site.length) {
            this.metaService.updateTag({ name: 'twitter:site', content: '@discuss_thegame' });
            this.metaService.updateTag({ property: 'og:url', content: site });
            this.metaService.updateTag({ property: 'og:site_name', content: 'Discuss TheGame' });
        }
        else {
            this.metaService.removeTag("name='twitter:site'");
            this.metaService.removeTag("property='og:url'");
            this.metaService.removeTag("property='og:site_name'");
        }
    }
    setType(large, website) {
        if (website) {
            this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
            this.metaService.updateTag({ property: 'og:type', content: 'website' });
        }
        else if (large) {
            this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
            this.metaService.updateTag({ property: 'og:type', content: 'article' });
        }
        else {
            this.metaService.updateTag({ name: 'twitter:card', content: 'summary' });
            this.metaService.updateTag({ property: 'og:type', content: 'profile' });
        }
    }
};
SeoSocialShareService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], SeoSocialShareService);
export { SeoSocialShareService };
//# sourceMappingURL=seo-social-share.service.js.map